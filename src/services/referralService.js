import { supabase } from './supabaseClient';

/**
 * Fetches referral statistics for a user from public.referrals.
 * Returns the count of invited referrals (all statuses) and the sum of reward_amount in DZY.
 *
 * @param {string} userId - The user's ID (referrer_id)
 * @returns {Promise<{ count: number, totalEarnedDzy: number, error: any }>}
 */
export const getUserReferralStats = async (userId) => {
  if (!userId) {
    return { count: 0, totalEarnedDzy: 0, error: null };
  }

  try {
    const { data, count, error } = await supabase
      .from('referrals')
      .select('reward_amount', { count: 'exact' })
      .eq('referrer_id', userId);

    if (error) {
      console.warn('[referralService] Error fetching referrals:', error.message);
      return { count: 0, totalEarnedDzy: 0, error };
    }

    const totalEarnedDzy = (data || []).reduce(
      (sum, row) => sum + (Number(row.reward_amount) || 0),
      0
    );

    return {
      count: count ?? (data ? data.length : 0),
      totalEarnedDzy,
      error: null,
    };
  } catch (err) {
    console.warn('[referralService] Exception in getUserReferralStats:', err);
    return { count: 0, totalEarnedDzy: 0, error: err };
  }
};

