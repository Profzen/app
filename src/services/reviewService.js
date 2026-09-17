import { supabase } from './supabaseClient';

class ReviewService {
  /**
   * Fetch reviews for a specific merchant from the live Supabase user_reviews table
   * @param {string} merchantId - The merchant or shop UUID
   */
  async fetchMerchantReviews(merchantId) {
    if (!merchantId) return [];

    try {
      // Direct query to Supabase user_reviews table
      const { data, error } = await supabase
        .from('user_reviews')
        .select('*')
        .eq('target_id', String(merchantId))
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[ReviewService] Supabase fetch reviews error:', error.message);
        return [];
      }

      const reviews = data || [];
      if (reviews.length === 0) return [];

      // Fetch user profile info (name, initials, avatar) from user_profiles
      const userIds = Array.from(new Set(reviews.map((r) => r.user_id).filter(Boolean)));
      let userMap = {};

      if (userIds.length > 0) {
        try {
          const { data: profilesData } = await supabase
            .from('user_profiles')
            .select('id, full_name, first_name, last_name, avatar_url, email')
            .in('id', userIds);

          if (Array.isArray(profilesData)) {
            profilesData.forEach((u) => {
              userMap[u.id] = u;
            });
          }
        } catch (e) {
          console.warn('[ReviewService] User profile lookup fallback', e);
        }
      }

      return reviews.map((r) => {
        const author = userMap[r.user_id] || {};
        const authorName =
          author.full_name ||
          [author.first_name, author.last_name].filter(Boolean).join(' ') ||
          (author.email ? author.email.split('@')[0] : 'Client Vérifié');
        const authorInitials = authorName.slice(0, 2).toUpperCase();

        return {
          id: r.id,
          userId: r.user_id,
          authorName,
          authorInitials,
          authorAvatar: author.avatar_url || null,
          rating: Number(r.rating) || 5,
          comment: r.comment || r.text || '',
          helpfulVotes: Number(r.helpful_votes) || 0,
          createdAt: r.created_at || new Date().toISOString(),
          isVerifiedBuyer: true,
        };
      });
    } catch (err) {
      console.warn('[ReviewService] Unexpected error fetching reviews:', err);
      return [];
    }
  }

  /**
   * Submit or update a review in Supabase user_reviews table
   * Handles unique constraint gracefully by updating existing review
   */
  async submitReview({ userId, merchantId, rating, comment }) {
    if (!merchantId) {
      throw new Error('Merchant ID is required to submit a review');
    }

    // Resolve current user ID if not explicitly passed
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        effectiveUserId = authData?.user?.id;
      } catch (e) {}
    }

    if (!effectiveUserId) {
      throw new Error('User must be logged in to submit a review');
    }

    const numRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const cleanComment = comment ? String(comment).trim() : null;

    // 1. Check if the user already submitted a review for this merchant
    try {
      const { data: existingReview } = await supabase
        .from('user_reviews')
        .select('id')
        .eq('user_id', effectiveUserId)
        .eq('target_type', 'merchant')
        .eq('target_id', String(merchantId))
        .maybeSingle();

      if (existingReview?.id) {
        // User already reviewed this merchant -> Update their existing review
        const { data: updatedData, error: updateError } = await supabase
          .from('user_reviews')
          .update({
            rating: numRating,
            comment: cleanComment,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReview.id)
          .select()
          .single();

        if (updateError) {
          console.error('[ReviewService] Update review error:', updateError);
          throw new Error(updateError.message || 'Failed to update review');
        }

        return updatedData;
      }
    } catch (checkErr) {
      if (checkErr.message && checkErr.message.includes('Failed to update review')) {
        throw checkErr;
      }
      console.warn('[ReviewService] Pre-check existing review error:', checkErr);
    }

    // 2. No existing review found -> Insert new review
    const payload = {
      user_id: effectiveUserId,
      target_type: 'merchant',
      target_id: String(merchantId),
      rating: numRating,
      comment: cleanComment,
      helpful_votes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_reviews')
      .insert([payload])
      .select()
      .single();

    if (error) {
      // 3. Fallback: If duplicate key violation (23505) occurs, update instead of failing
      if (error.code === '23505' || String(error.message).includes('unique constraint')) {
        const { data: fallbackUpdated, error: fallbackError } = await supabase
          .from('user_reviews')
          .update({
            rating: numRating,
            comment: cleanComment,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', effectiveUserId)
          .eq('target_type', 'merchant')
          .eq('target_id', String(merchantId))
          .select()
          .single();

        if (!fallbackError && fallbackUpdated) {
          return fallbackUpdated;
        }
      }

      console.error('[ReviewService] Submit review error:', error);
      throw new Error(error.message || 'Failed to submit review');
    }

    return data;
  }

  /**
   * Vote a review as helpful
   */
  async voteHelpful(reviewId, currentVotes = 0) {
    if (!reviewId) return false;

    try {
      const newVotes = (Number(currentVotes) || 0) + 1;
      const { error } = await supabase
        .from('user_reviews')
        .update({ helpful_votes: newVotes, updated_at: new Date().toISOString() })
        .eq('id', reviewId);

      if (error) {
        console.warn('[ReviewService] Vote helpful error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[ReviewService] Vote helpful failed:', e);
      return false;
    }
  }
}

export const reviewService = new ReviewService();
