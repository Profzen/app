import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function WriteReviewModal({
  visible,
  onClose,
  shopName,
  onSubmit,
  initialRating = 5,
  initialComment = '',
  isEditing = false,
}) {
  const { t } = useApp();
  const [rating, setRating] = useState(initialRating || 5);
  const [comment, setComment] = useState(initialComment || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setRating(initialRating || 5);
      setComment(initialComment || '');
    }
  }, [visible, initialRating, initialComment]);

  const starLabels = {
    1: t('review.rating1', '1/5 — Décevant'),
    2: t('review.rating2', '2/5 — Passable'),
    3: t('review.rating3', '3/5 — Bien'),
    4: t('review.rating4', '4/5 — Très bien'),
    5: t('review.rating5', '5/5 — Excellent !'),
  };

  const exampleList = [
    { key: 'fastDelivery', text: t('review.examples.fastDelivery', '⚡ Livraison ultra-rapide et soignée') },
    { key: 'itemAsDescribed', text: t('review.examples.itemAsDescribed', '📦 Produit 100% conforme à la description') },
    { key: 'responsiveSeller', text: t('review.examples.responsiveSeller', '🤝 Vendeur très réactif et professionnel') },
    { key: 'greatExperience', text: t('review.examples.greatExperience', '⭐ Excellente expérience d\'achat') },
    { key: 'secureEscrow', text: t('review.examples.secureEscrow', '🛡️ Achat en toute confiance avec protection Escrow') },
    { key: 'recommend', text: t('review.examples.recommend', '💯 Je recommande vivement cette boutique !') },
  ];

  const handleToggleSuggestion = (suggestionText) => {
    setComment((prev) => {
      if (prev.includes(suggestionText)) {
        let updated = prev.replace(suggestionText, '').trim();
        updated = updated.replace(/\s{2,}/g, ' ').trim();
        return updated;
      } else {
        if (!prev || !prev.trim()) {
          return suggestionText;
        }
        const trimmed = prev.trim();
        const needsPunctuation = !['.', '!', '?'].includes(trimmed.slice(-1));
        return `${trimmed}${needsPunctuation ? '. ' : ' '}${suggestionText}`;
      }
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ rating, comment });
      onClose();
    } catch (e) {
      // Handled by parent or toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.title}>
                {isEditing
                  ? t('review.editReviewTitle', 'Modifier votre avis')
                  : t('review.writeReviewTitle', 'Donner votre avis')}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {shopName || 'Boutique DizzitUp'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#1A2840" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollBody}
          >
            {/* Star Rating Picker */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionLabel}>{t('review.selectRating', 'Votre note globale')}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                    style={styles.starBtn}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={36}
                      color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.starFeedback}>{starLabels[rating]}</Text>
            </View>

            {/* Quick Suggestions Chips */}
            <View style={styles.suggestionsContainer}>
              <View style={styles.suggestionsHeader}>
                <Ionicons name="sparkles" size={14} color="#F59E0B" style={{ marginRight: 6 }} />
                <Text style={styles.suggestionsTitle}>
                  {t('review.quickSuggestions', 'Suggestions rapides :')}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsScroll}
              >
                {exampleList.map((item) => {
                  const isSelected = comment.includes(item.text);
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.suggestionChip, isSelected && styles.suggestionChipSelected]}
                      onPress={() => handleToggleSuggestion(item.text)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.suggestionChipText, isSelected && styles.suggestionChipTextSelected]}>
                        {item.text}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={14} color="#059669" style={{ marginLeft: 4 }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Comment Text Input */}
            <View style={styles.commentSection}>
              <Text style={styles.sectionLabel}>{t('review.commentLabel', 'Votre commentaire (optionnel)')}</Text>
              <TextInput
                style={styles.commentInput}
                multiline
                numberOfLines={4}
                maxLength={500}
                placeholder={t(
                  'review.commentPlaceholder',
                  'Partagez votre expérience avec cette boutique (qualité des produits, rapidité de livraison, service client)...'
                )}
                placeholderTextColor="#94A3B8"
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{comment.length} / 500</Text>
            </View>

            {/* Trust Guarantee Note */}
            <View style={styles.trustRow}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.trustText}>
                {t('review.trustNotice', 'Votre avis est synchronisé avec le marketplace DizzitUp.')}
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={onClose}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.btnCancelText}>{t('common.cancel', 'Annuler')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnSubmit, submitting && styles.btnSubmitDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#1A2840" />
              ) : (
                <>
                  <Ionicons
                    name={isEditing ? 'checkmark-done' : 'send'}
                    size={16}
                    color="#1A2840"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.btnSubmitText}>
                    {isEditing
                      ? t('review.updateBtn', 'Mettre à jour l\'avis')
                      : t('review.submitBtn', 'Publier l\'avis')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxWidth: 580,
    width: '100%',
    maxHeight: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandle: {
    width: 42,
    height: 4.5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#1A2840',
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    paddingVertical: 6,
  },
  ratingSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  starBtn: {
    padding: 3,
  },
  starFeedback: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#F59E0B',
    marginTop: 2,
  },
  suggestionsContainer: {
    marginBottom: 14,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#475569',
  },
  suggestionsScroll: {
    gap: 8,
    paddingRight: 10,
    paddingBottom: 2,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  suggestionChipSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  suggestionChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#334155',
  },
  suggestionChipTextSelected: {
    fontFamily: 'Inter_600SemiBold',
    color: '#065F46',
  },
  commentSection: {
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: '#1A2840',
    minHeight: 90,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  trustText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#065F46',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  btnCancel: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancelText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#475569',
  },
  btnSubmit: {
    flex: 2,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFB800',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnSubmitDisabled: {
    opacity: 0.6,
  },
  btnSubmitText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
});
