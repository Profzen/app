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
      const { data, error } = await supabase
        .from('beneficiaries')
        .insert({
          user_id: userId,
          first_name: contactData.first_name,
          last_name: contactData.last_name || '',
          relationship: contactData.relationship || 'Ami',
          country_code: contactData.country_code || 'US',
          phone: contactData.phone || '',
          email: contactData.email || '',
        })
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

export default new ContactService();
