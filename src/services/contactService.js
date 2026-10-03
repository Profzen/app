import { supabase } from './supabaseClient';

class ContactService {
  /**
   * Fetch all beneficiaries for a specific user (or merchant).
   * Supports pagination and orders by most recently created.
   */
  async getBeneficiaries(userId) {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching beneficiaries:', error.message);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Add a new beneficiary.
   */
  async addBeneficiary(userId, contactData) {
    try {
      if (!userId) {
        throw new Error('User ID is required to add a beneficiary');
      }

      const firstName = contactData.first_name || '';
      const lastName = contactData.last_name || '';

      // Derive ISO country code only from real data (never a hardcoded default)
      const derivedCountryCode = contactData.country_code
        || (contactData.country && contactData.country.length === 2 ? contactData.country.toUpperCase() : null);

      const insertPayload = {
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        relationship: contactData.relationship || contactData.relation || 'friend',
        ...(derivedCountryCode ? { country_code: derivedCountryCode } : {}),
        city: contactData.city || '',
        delivery_address: contactData.delivery_address || null,
        delivery_city: contactData.delivery_city || null,
        phone: contactData.phone || '',
        email: contactData.email || '',
        bank_name: contactData.bank_name || '',
        bank_account: contactData.bank_account || '',
        evm_address: contactData.evm_address || '',
        solana_address: contactData.solana_address || '',
        avatar_url: contactData.avatar_url || '',
      };

      const { data, error } = await supabase
        .from('beneficiaries')
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error adding beneficiary:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing beneficiary by ID (supports UUID strings and numeric IDs).
   */
  async updateBeneficiary(beneficiaryId, contactData) {
    try {
      if (!beneficiaryId) {
        throw new Error('Beneficiary ID is required for update');
      }

      const updatePayload = {};
      if (contactData.first_name !== undefined) updatePayload.first_name = contactData.first_name;
      if (contactData.last_name !== undefined) updatePayload.last_name = contactData.last_name;
      if (contactData.relationship !== undefined || contactData.relation !== undefined) {
        updatePayload.relationship = contactData.relationship || contactData.relation;
      }
      if (contactData.country_code !== undefined) {
        updatePayload.country_code = contactData.country_code;
      } else if (contactData.country && contactData.country.length === 2) {
        updatePayload.country_code = contactData.country.toUpperCase();
      }
      if (contactData.city !== undefined) updatePayload.city = contactData.city;
      if (contactData.delivery_address !== undefined) updatePayload.delivery_address = contactData.delivery_address;
      if (contactData.delivery_city !== undefined) updatePayload.delivery_city = contactData.delivery_city;
      if (contactData.phone !== undefined) updatePayload.phone = contactData.phone;
      if (contactData.email !== undefined) updatePayload.email = contactData.email;
      if (contactData.bank_name !== undefined) updatePayload.bank_name = contactData.bank_name;
      if (contactData.bank_account !== undefined) updatePayload.bank_account = contactData.bank_account;
      if (contactData.evm_address !== undefined) updatePayload.evm_address = contactData.evm_address;
      if (contactData.solana_address !== undefined) updatePayload.solana_address = contactData.solana_address;
      if (contactData.avatar_url !== undefined) updatePayload.avatar_url = contactData.avatar_url;

      const { data, error } = await supabase
        .from('beneficiaries')
        .update(updatePayload)
        .eq('id', beneficiaryId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error updating beneficiary:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a beneficiary. Note: Business logic requires checking if they have past transactions first,
   * but for now we attempt a direct delete (or soft delete if it fails due to foreign key constraints).
   */
  async deleteBeneficiary(beneficiaryId) {
    try {
      // First check if there are transactions
      const { data: txns } = await supabase
        .from('remittance_transactions')
        .select('id')
        .eq('beneficiary_id', beneficiaryId)
        .limit(1);

      if (txns && txns.length > 0) {
        return { 
          success: false, 
          error: "To keep transaction history accurate, beneficiaries with past transactions cannot be deleted." 
        };
      }

      const { error } = await supabase
        .from('beneficiaries')
        .delete()
        .eq('id', beneficiaryId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting beneficiary:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get remittance history for a specific beneficiary.
   */
  async getBeneficiaryHistory(beneficiaryId) {
    try {
      const { data, error } = await supabase
        .from('remittance_transactions')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching beneficiary history:', error.message);
      return { success: false, error: error.message, data: [] };
    }
  }
}

const contactService = new ContactService();
export { contactService };
export default contactService;
