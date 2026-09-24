// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    try {
      const payload = await req.json();

      // Verify it's a valid Supabase Webhook or Cron Payload
      const record = payload.record || payload; 
      
      let userIdToNotify;
      let title = "DizzitUp Update";
      let body = "You have a new notification.";
      let data = {};

      // --- 1. REAL-TIME TRANSACTION ALERTS ---
      if (payload.table === 'transactions' && payload.type === 'INSERT') {
        userIdToNotify = record.sponsor_user_id || record.beneficiary_user_id;
        title = "Transaction Successful ✅";
        body = `Your transaction of ${record.transaction_value_usdc} USDC was successfully processed!`;
        data = { transaction_id: record.id, type: 'transaction' };
      } 
      // --- 2. PG_CRON UTILITY REMINDERS ---
      else if (payload.type === 'utility_reminder') {
         userIdToNotify = payload.user_id;
         title = "Utility Bill Due Soon ⚡";
         body = `Your family's bill is due in 3 days. Pay it instantly with zero fees!`;
         data = { type: 'utility_reminder' };
      }
      // --- 3. BENEFICIARY JOINED ALERT ---
      else if (payload.table === 'user_profiles' && payload.type === 'INSERT') {
         userIdToNotify = payload.sponsor_user_id; 
         title = "Beneficiary Joined! 🎉";
         body = `Your beneficiary ${record.first_name} just joined DizzitUp! Send them 1 DZY to say hi.`;
         data = { new_user_id: record.id, type: 'beneficiary_joined' };
      }

      if (!userIdToNotify) {
          return Response.json({ error: "No user to notify" }, { status: 400 });
      }

      // Use ctx.supabaseAdmin to bypass RLS — use for privileged operations
      const { data: userProfile, error } = await ctx.supabaseAdmin
        .from('user_profiles')
        .select('expo_push_token, push_notifications_enabled')
        .eq('id', userIdToNotify)
        .single();

      if (error || !userProfile?.expo_push_token || !userProfile.push_notifications_enabled) {
        return Response.json({ message: "User opted out or missing token." }, { status: 200 });
      }

      // Send the Notification via Expo
      const pushMessage = {
        to: userProfile.expo_push_token,
        sound: 'default',
        title,
        body,
        data,
      };

      const response = await fetch(EXPO_PUSH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pushMessage),
      });

      const expoReceipt = await response.json();
      return Response.json({ success: true, receipt: expoReceipt });

    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }),
};
