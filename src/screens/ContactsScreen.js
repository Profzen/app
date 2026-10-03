import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView, TextInput, Image, Modal, Platform, StatusBar, ActivityIndicator, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import Avatar from '../components/Avatar';
import { handleUserInviteShare, shareShopLink } from '../utils/shareHelper';
import { useApp } from '../context/AppContext';
import ContactActionSheet from '../components/ContactActionSheet';
import contactService from '../services/contactService';
import { supabase } from '../services/supabaseClient';
import { getFullCountryName } from '../utils/countryCurrencyUtils';
import { SwipeRow } from 'react-native-swipe-list-view';

function HighlightedText({ text = '', highlight = '', style, highlightStyle }) {
  if (!highlight || !text) {
    return <Text style={style} numberOfLines={1}>{text}</Text>;
  }

  const str = String(text);
  const lowerStr = str.toLowerCase();
  const lowerHl = highlight.trim().toLowerCase();
  const idx = lowerStr.indexOf(lowerHl);

  if (idx === -1) {
    return <Text style={style} numberOfLines={1}>{str}</Text>;
  }

  const before = str.slice(0, idx);
  const match = str.slice(idx, idx + highlight.trim().length);
  const after = str.slice(idx + highlight.trim().length);

  return (
    <Text style={style} numberOfLines={1}>
      {before}
      <Text style={highlightStyle}>{match}</Text>
      {after}
    </Text>
  );
}

const quickActions = [
  { id: '1', titleKey: 'contacts.qa_essentials', defaultTitle: "Essentials\n& All", icon: "bag-handle-outline", color: "#8B5CF6", bgColor: "#F5F3FF" },
  { id: '2', titleKey: 'contacts.qa_airtime', defaultTitle: "Mobile\nTop-up", icon: "phone-portrait-outline", color: "#10B981", bgColor: "#ECFDF5" },
  { id: '3', titleKey: 'contacts.qa_paybills', defaultTitle: "Pay\nBills", icon: "flash-outline", color: "#0284C7", bgColor: "#EFF6FF" },
  { id: '4', titleKey: 'contacts.qa_giftcards', defaultTitle: "Gift\nCards", icon: "gift-outline", color: "#D97706", bgColor: "#FFFBEB" },
  { id: '5', titleKey: 'contacts.qa_stablecoins', defaultTitle: "Stablecoins\n& DZY", icon: "paper-plane-outline", color: "#3B82F6", bgColor: "#EFF6FF" },
  { id: '6', titleKey: 'contacts.qa_invite', defaultTitle: "Invite\nFriends", icon: "people-outline", color: "#EC4899", bgColor: "#FDF2F8" },
  { id: '7', titleKey: 'contacts.qa_refer', defaultTitle: "Refer a\nStore", icon: "storefront-outline", color: "#059669", bgColor: "#ECFDF5" },
  { id: '8', titleKey: 'contacts.qa_sync', defaultTitle: "Sync\nContacts", icon: "sync-outline", color: "#6366F1", bgColor: "#EEF2FF" },
];

const getFlagEmoji = (countryCode) => {
  if (!countryCode || typeof countryCode !== 'string' || countryCode.toLowerCase() === 'null') return '🌍';
  const clean = countryCode.trim().toUpperCase();
  if (clean.length !== 2) return '🌍';
  try {
    const codePoints = clean.split('').map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '🌍';
  }
};

const formatRelation = (rel, t) => {
  if (!rel) return t('beneficiary.relations.friend', 'Friend');
  const clean = String(rel).toLowerCase().trim();
  const key = `beneficiary.relations.${clean}`;
  const translated = t(key, null);
  if (translated && translated !== key) return translated;
  return clean.charAt(0).toUpperCase() + clean.slice(1).replace(/_/g, ' ');
};

export default function ContactsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { language, t, session, user, hasUnreadNotifications } = useApp();
  const currentUserId = user?.id || session?.user?.id;
  const [showInvite, setShowInvite] = useState(true);
  const [contactItems, setContactItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'nearby', 'favorites', 'africa', 'world'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef(null);
  const [contactToDelete, setContactToDelete] = useState(null);

  const nextScreen = route.params?.nextScreen;
  const actionRoutes = {
    '1': 'ChooseServiceScreen',
    '2': 'MobileRechargeScreen',
    '3': 'BillDetailsScreen',
    '4': 'ExploreGiftCardsScreen',
    '5': 'SendMoneyScreen',
    '6': 'RewardsScreen',
    '7': 'ShopsScreen',
    '8': 'EditBeneficiaryScreen',
  };

  const fetchBeneficiaries = async () => {
    if (!currentUserId) {
      setContactItems([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { success, data } = await contactService.getBeneficiaries(currentUserId);
    if (success && data && data.length > 0) {
      const formatted = data.map(b => {
        const fullCountry = getFullCountryName(b.country || b.country_name || b.country_code);
        return {
          ...b,
          id: b.id,
          name: b.full_name || `${b.first_name || ''} ${b.last_name || ''}`.trim() || b.phone || 'Beneficiary',
          first_name: b.first_name,
          last_name: b.last_name,
          relationship: b.relationship || 'friend',
          relation: formatRelation(b.relationship, t),
          location: `${b.city ? b.city + ', ' : ''}${fullCountry || b.country_code || ''}`.trim().replace(/^,|,$/g, ''),
          country: fullCountry,
          country_code: b.country_code,
          city: b.city,
          phone: b.phone || b.phone_number,
          email: b.email,
          address: b.evm_address || b.solana_address || b.phone || b.email,
          flag: getFlagEmoji(b.country_code),
          isBeneficiary: true,
          isSponsor: false,
          image: b.avatar_url || null,
          raw_data: b
        };
      });
      setContactItems(formatted);
    } else {
      setContactItems([]);
    }
    setIsLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchBeneficiaries();
    }, [currentUserId])
  );

  useEffect(() => {
    if (!currentUserId) return;

    // Use a unique channel name each mount to avoid Supabase returning
    // an already-subscribed channel instance (which throws on .on() calls).
    const channelName = `beneficiaries-${currentUserId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beneficiaries',
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          fetchBeneficiaries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const removeContact = async (id) => {
    const { success, error } = await contactService.deleteBeneficiary(id);
    if (success) {
      setContactItems((items) => items.filter((item) => item.id !== id));
      setToast({ title: t('contacts.deleted', 'Contact supprimé'), message: t('contacts.deleted_desc', 'Le contact a été retiré avec succès.') });
    } else {
      setToast({ title: t('common.error', 'Erreur'), message: error || t('contacts.delete_error', 'Impossible de supprimer ce contact.') });
    }
    setSelectedContact(null);
  };

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const { prefixMatches, allSuggestions, topSuggestion, ghostRemainder } = useMemo(() => {
    if (!trimmedQuery) {
      return { prefixMatches: [], allSuggestions: [], topSuggestion: null, ghostRemainder: '' };
    }

    const prefixes = [];
    const others = [];

    contactItems.forEach(contact => {
      const name = (contact.name || '').trim();
      const nameLower = name.toLowerCase();
      const firstNameLower = (contact.first_name || '').toLowerCase();
      const lastNameLower = (contact.last_name || '').toLowerCase();
      const loc = (contact.location || '').toLowerCase();
      const phone = (contact.phone || '').toLowerCase();
      const email = (contact.email || '').toLowerCase();

      if (nameLower.startsWith(trimmedQuery)) {
        prefixes.push(contact);
      } else if (firstNameLower.startsWith(trimmedQuery)) {
        prefixes.push(contact);
      } else if (lastNameLower.startsWith(trimmedQuery)) {
        prefixes.push(contact);
      } else if (
        nameLower.includes(trimmedQuery) ||
        loc.includes(trimmedQuery) ||
        phone.includes(trimmedQuery) ||
        email.includes(trimmedQuery)
      ) {
        others.push(contact);
      }
    });

    const suggestions = [...prefixes, ...others];

    let bestMatch = null;
    let remainder = '';

    const directPrefixMatch = prefixes.find(c => (c.name || '').toLowerCase().startsWith(trimmedQuery));
    if (directPrefixMatch) {
      bestMatch = directPrefixMatch;
      remainder = directPrefixMatch.name.slice(searchQuery.length);
    }

    return {
      prefixMatches: prefixes,
      allSuggestions: suggestions,
      topSuggestion: bestMatch,
      ghostRemainder: remainder,
    };
  }, [contactItems, searchQuery, trimmedQuery]);

  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = contactItems.filter(contact => {
      const name = (contact.name || '').toLowerCase();
      const loc = (contact.location || '').toLowerCase();
      const country = (contact.country || '').toLowerCase();
      const phone = (contact.phone || '').toLowerCase();
      const email = (contact.email || '').toLowerCase();
      const city = (contact.city || '').toLowerCase();

      const matchesSearch = !q || 
        name.includes(q) || 
        loc.includes(q) || 
        country.includes(q) || 
        phone.includes(q) || 
        email.includes(q) || 
        city.includes(q);

      if (!matchesSearch) return false;

      if (activeFilter === 'nearby') {
        return contact.isBeneficiary;
      } else if (activeFilter === 'favorites') {
        return contact.isSponsor;
      } else if (activeFilter === 'africa') {
        return ['TG', 'NG', 'KE', 'SN', 'ML', 'BF', 'GH', 'CI', 'BJ', 'CM'].some(code => (contact.country_code || '').toUpperCase() === code);
      }
      return true;
    });

    if (!q) return filtered;

    // Prioritize contacts whose name starts with query, then first name, then last name
    return [...filtered].sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const aStarts = aName.startsWith(q);
      const bStarts = bName.startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      const aFirst = (a.first_name || '').toLowerCase().startsWith(q);
      const bFirst = (b.first_name || '').toLowerCase().startsWith(q);
      if (aFirst && !bFirst) return -1;
      if (!aFirst && bFirst) return 1;

      return aName.localeCompare(bName);
    });
  }, [contactItems, searchQuery, activeFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.mainTitle}>{t('contactsTitle', 'Contacts')}</Text>
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              {hasUnreadNotifications && <View style={styles.notificationDot} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => navigation.navigate('RewardsScreen')}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => navigation.navigate('MoreSettingsScreen')}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => {
            if (isDropdownOpen) setIsDropdownOpen(false);
          }}
        >
          
          {/* Index 0: Top Non-Sticky Elements */}
          <View style={{ zIndex: 100 }}>
            <Text style={styles.subtitle}>
              {nextScreen 
                ? t('contacts.select_beneficiary_action', 'Sélectionnez un bénéficiaire pour continuer.')
                : t('contacts.subtitle', "Soutenez vos bénéficiaires : envoyez de l'argent, payez des factures et achetez l'essentiel en Afrique.")}
            </Text>

            {/* Search and Autocomplete Section */}
            <View style={styles.searchSectionWrap}>
              {/* Sleek Search Bar with Gray Ghost Auto-Fill */}
              <View style={[
                styles.searchContainer,
                isSearchFocused && styles.searchContainerFocused
              ]}>
                <Ionicons 
                  name="search" 
                  size={20} 
                  color={isSearchFocused ? "#D97706" : "#94A3B8"} 
                  style={{ marginRight: 10 }} 
                />

                <View style={styles.searchInputWrapper}>
                  {/* Gray Ghost Text Underlay */}
                  {ghostRemainder.length > 0 && isSearchFocused && (
                    <View pointerEvents="none" style={styles.ghostTextRow}>
                      <Text style={styles.ghostTypedSpacer} numberOfLines={1}>
                        {searchQuery}
                      </Text>
                      <Text style={styles.ghostAutoFillText} numberOfLines={1}>
                        {ghostRemainder}
                      </Text>
                    </View>
                  )}

                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInputField}
                    placeholder={searchQuery.length === 0 ? t('contacts.search_hint_short', 'Search name, phone or email...') : ''}
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={(text) => {
                      setSearchQuery(text);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => {
                      setIsSearchFocused(true);
                      if (searchQuery.trim().length > 0) setIsDropdownOpen(true);
                    }}
                    onBlur={() => {
                      setIsSearchFocused(false);
                    }}
                    onSubmitEditing={() => {
                      if (topSuggestion && ghostRemainder) {
                        setSearchQuery(topSuggestion.name);
                      }
                      setIsDropdownOpen(false);
                      Keyboard.dismiss();
                    }}
                    returnKeyType="search"
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>

                {/* Tab / Auto-fill button when ghost text exists */}
                {ghostRemainder.length > 0 && (
                  <TouchableOpacity
                    style={styles.tabCompleteBtn}
                    onPress={() => {
                      if (topSuggestion) {
                        setSearchQuery(topSuggestion.name);
                        setIsDropdownOpen(false);
                      }
                    }}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  >
                    <Ionicons name="return-down-forward" size={13} color="#475569" style={{ marginRight: 3 }} />
                    <Text style={styles.tabCompleteText}>Tab</Text>
                  </TouchableOpacity>
                )}

                {searchQuery.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => {
                      setSearchQuery('');
                      setIsDropdownOpen(false);
                    }} 
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  >
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Google-Style Quick Suggestion Pills */}
              {searchQuery.trim().length > 0 && prefixMatches.length > 0 && (
                <View style={styles.candidatePillsRow}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.candidatePillsScroll}
                    keyboardShouldPersistTaps="handled"
                  >
                    {prefixMatches.slice(0, 6).map((contact) => (
                      <TouchableOpacity
                        key={`pill-${contact.id}`}
                        style={styles.candidatePill}
                        onPress={() => {
                          setSearchQuery(contact.name);
                          setIsDropdownOpen(false);
                          if (nextScreen) {
                            navigation.navigate(nextScreen, { beneficiary: contact, contact });
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.candidatePillFlag}>{contact.flag || '👤'}</Text>
                        <Text style={styles.candidatePillText} numberOfLines={1}>
                          <Text style={styles.candidatePillHighlight}>{searchQuery}</Text>
                          {contact.name.slice(searchQuery.length)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Google-Style Floating Suggestions Dropdown */}
              {isDropdownOpen && searchQuery.trim().length > 0 && (
                <View style={styles.dropdownCard}>
                  {/* Top query status row */}
                  <View style={styles.dropdownHeaderRow}>
                    <View style={styles.dropdownHeaderLeft}>
                      <Ionicons name="search" size={14} color="#D97706" style={{ marginRight: 6 }} />
                      <Text style={styles.dropdownHeaderText} numberOfLines={1}>
                        "{searchQuery}"
                      </Text>
                    </View>
                    <View style={styles.dropdownCountBadge}>
                      <Text style={styles.dropdownCountText}>
                        {allSuggestions.length} {t('contacts.matches_count', 'trouvé(s)')}
                      </Text>
                    </View>
                  </View>

                  {allSuggestions.length === 0 ? (
                    <View style={styles.dropdownEmptyRow}>
                      <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                      <Text style={styles.dropdownEmptyText}>
                        {t('contacts.no_matching_contact', 'Aucun contact ne commence par')} "{searchQuery}"
                      </Text>
                    </View>
                  ) : (
                    allSuggestions.slice(0, 5).map((contact, index) => (
                      <TouchableOpacity
                        key={`sugg-${contact.id}-${index}`}
                        style={[
                          styles.dropdownItemRow,
                          index === allSuggestions.slice(0, 5).length - 1 && { borderBottomWidth: 0 }
                        ]}
                        onPress={() => {
                          setIsDropdownOpen(false);
                          Keyboard.dismiss();
                          if (nextScreen) {
                            navigation.navigate(nextScreen, { beneficiary: contact, contact });
                          } else {
                            setSelectedContact(contact);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        {/* Avatar */}
                        <Avatar image={contact.image} name={contact.name} size={34} style={{ marginRight: 10 }} />

                        {/* Details */}
                        <View style={styles.dropdownItemCenter}>
                          <HighlightedText
                            text={contact.name}
                            highlight={searchQuery}
                            style={styles.dropdownItemName}
                            highlightStyle={styles.dropdownItemHighlight}
                          />
                          <Text style={styles.dropdownItemSub} numberOfLines={1}>
                            {contact.relation ? `${contact.relation} • ` : ''}{contact.flag || ''} {contact.location || ''}
                          </Text>
                        </View>

                        {/* Google diagonal insert button (tap to put name in search) */}
                        <TouchableOpacity
                          style={styles.dropdownInsertBtn}
                          onPress={() => {
                            setSearchQuery(contact.name);
                          }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="arrow-up-outline" size={17} color="#94A3B8" style={{ transform: [{ rotate: '-45deg' }] }} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))
                  )}

                  {/* Dropdown footer to view full results below */}
                  {allSuggestions.length > 5 && (
                    <TouchableOpacity
                      style={styles.dropdownFooterBtn}
                      onPress={() => {
                        setIsDropdownOpen(false);
                        Keyboard.dismiss();
                      }}
                    >
                      <Text style={styles.dropdownFooterText}>
                        {t('contacts.view_all_results', 'Voir tous les')} {allSuggestions.length} {t('contacts.results_plural', 'résultats')} ➔
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {nextScreen ? (
              <View style={styles.activeActionBanner}>
                <View style={styles.activeActionBannerLeft}>
                  <Ionicons name="information-circle" size={24} color="#3B82F6" />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.activeActionTitle}>{t('contacts.action_selected_title', 'Sélectionnez un bénéficiaire')}</Text>
                    <Text style={styles.activeActionSub}>{t('contacts.action_selected_sub', 'Appuyez sur un contact ci-dessous pour continuer')}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.cancelActionBtn} onPress={() => navigation.setParams({ nextScreen: undefined })}>
                  <Text style={styles.cancelActionText}>{t('common.cancel', 'Annuler')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>{t('contacts.quick_actions', 'Actions rapides')}</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                >
                  {quickActions.map(action => (
                    <TouchableOpacity 
                      key={action.id} 
                      style={[styles.quickActionCard, { width: 85, marginRight: 12, marginBottom: 0, height: 96 }]} 
                      onPress={() => {
                        if (action.id === '6') {
                        handleUserInviteShare(session?.user);
                        } else if (action.id === '7') {
                          shareShopLink();
                        } else if (action.id === '8') {
                          navigation.navigate('EditBeneficiaryScreen');
                        } else {
                          navigation.setParams({ nextScreen: actionRoutes[action.id] });
                        }
                      }}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.quickActionIconContainer, { backgroundColor: action.bgColor }]}>
                        <Ionicons name={action.icon} size={22} color={action.color} />
                      </View>
                      <Text style={styles.quickActionTitle} numberOfLines={2}>
                        {t(action.titleKey, action.defaultTitle)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>

          {/* Index 1: Pinned / Sticky Header (Beneficiaries header, Filters & Column titles) */}
          <View style={styles.stickyHeaderContainer}>
            {/* Mes bénéficiaires */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleSticky}>{t('contacts.my_beneficiaries', 'Mes bénéficiaires')}</Text>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('EditBeneficiaryScreen')}>
                <Text style={styles.showLessText}>{t('contacts.manage_contacts', 'Gérer contacts')}</Text>
                <Ionicons name="arrow-forward" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
              <TouchableOpacity 
                style={activeFilter === 'all' ? styles.filterChipActive : styles.filterChip}
                onPress={() => setActiveFilter('all')}
              >
                <Ionicons name="apps-outline" size={15} color={activeFilter === 'all' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={activeFilter === 'all' ? styles.filterChipTextActive : styles.filterChipText}>{t('common.all', 'Tous')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={activeFilter === 'nearby' ? styles.filterChipActive : styles.filterChip}
                onPress={() => setActiveFilter('nearby')}
              >
                <Ionicons name="location-outline" size={15} color={activeFilter === 'nearby' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={activeFilter === 'nearby' ? styles.filterChipTextActive : styles.filterChipText}>{t('contacts.filter_nearby', 'À proximité')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={activeFilter === 'favorites' ? styles.filterChipActive : styles.filterChip}
                onPress={() => setActiveFilter('favorites')}
              >
                <Ionicons name="heart-outline" size={15} color={activeFilter === 'favorites' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={activeFilter === 'favorites' ? styles.filterChipTextActive : styles.filterChipText}>{t('contacts.filter_favorites', 'De mes pays préférés')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={activeFilter === 'africa' ? styles.filterChipActive : styles.filterChip}
                onPress={() => setActiveFilter('africa')}
              >
                <Ionicons name="earth-outline" size={15} color={activeFilter === 'africa' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={activeFilter === 'africa' ? styles.filterChipTextActive : styles.filterChipText}>{t('contacts.filter_africa', "De toute l'Afrique")}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={activeFilter === 'world' ? styles.filterChipActive : styles.filterChip}
                onPress={() => setActiveFilter('world')}
              >
                <Ionicons name="globe-outline" size={15} color={activeFilter === 'world' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={activeFilter === 'world' ? styles.filterChipTextActive : styles.filterChipText}>{t('contacts.filter_world', 'Du reste du monde')}</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Contacts List Header */}
            <View style={styles.listHeaderRow}>
              <Text style={[styles.listHeaderText, { flex: 2 }]}>{t('contacts.col_contact', 'Contact')}</Text>
              <Text style={[styles.listHeaderText, { flex: 1, textAlign: 'center' }]}>{t('contacts.col_beneficiary', 'Bénéficiaire')}</Text>
              <Text style={[styles.listHeaderText, { flex: 1, textAlign: 'center' }]}>{t('contacts.col_sponsor', 'Parrain')}</Text>
              <View style={{ width: 34 }} />
            </View>
          </View>

          {/* Index 2: Contacts List */}
          <View style={styles.contactsList}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFC759" style={{ marginVertical: 32 }} />
            ) : filteredContacts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={44} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>{t('contacts.no_beneficiaries', 'No beneficiaries yet')}</Text>
                <Text style={styles.emptySubtitle}>{t('contacts.add_first_sub', 'Add your beneficiaries to send them funds and pay their bills.')}</Text>
                <TouchableOpacity style={styles.addFirstBtn} onPress={() => navigation.navigate('EditBeneficiaryScreen')}>
                  <Ionicons name="person-add" size={16} color="#071D54" style={{ marginRight: 6 }} />
                  <Text style={styles.addFirstBtnText}>{t('contacts.add_beneficiary', 'Add a beneficiary')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredContacts.map((contact) => (
                <SwipeRow key={contact.id} rightOpenValue={-80} disableRightSwipe={true} closeOnRowPress={true}>
                  <View style={styles.rowBack}>
                    <TouchableOpacity style={styles.backRightBtn} onPress={() => setContactToDelete(contact)}>
                      <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                      <Text style={styles.backRightBtnText}>{t('contacts.action_delete', 'Delete')}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{backgroundColor: '#FFFFFF'}}>
                    <ContactRow 
                      contact={contact} 
                      onPress={() => {
                        if (nextScreen) {
                          navigation.navigate(nextScreen, { beneficiary: contact, contact });
                        } else {
                          navigation.navigate('ContactProfileScreen', { 
                            contact, 
                            pivotScreen: 'ContactsScreen' 
                          });
                        }
                      }}
                      onMorePress={() => {
                        setSelectedContact(contact);
                      }}
                    />
                  </View>
                </SwipeRow>
              ))
            )}
          </View>

        </ScrollView>

        <ContactActionSheet 
          contact={selectedContact}
          visible={!!selectedContact}
          onClose={() => setSelectedContact(null)}
          onNavigate={(routeStr, extraParams = {}) => {
            const currentContact = selectedContact;
            setSelectedContact(null);
            navigation.navigate(routeStr, { 
              beneficiary: currentContact, 
              contact: currentContact, 
              pivotScreen: 'ContactProfileScreen',
              pivotParams: { contact: currentContact },
              ...extraParams 
            });
          }}
          onDelete={(id) => {
            setSelectedContact(null);
            removeContact(id);
          }}
          onFavorite={(contact) => {
            setSelectedContact(null);
            setToast({ title: t('contacts.added_favorite', 'Ajouté aux favoris'), message: `${contact.name} ${t('contacts.added_favorite_desc', 'a été ajouté à vos favoris.')}` });
          }}
        />

        <Modal visible={!!contactToDelete} transparent animationType="fade">
          <View style={styles.deleteModalOverlay}>
            <View style={styles.deleteModalContainer}>
              <View style={styles.deleteModalIconWrap}>
                <Ionicons name="warning-outline" size={32} color="#EF4444" />
              </View>
              <Text style={styles.deleteModalTitle}>{t('contacts.confirm_delete_title', 'Delete Beneficiary')}</Text>
              <Text style={styles.deleteModalDesc}>
                {t('contacts.confirm_delete_desc', 'Are you sure you want to delete {{name}} from your beneficiaries?').replace('{{name}}', contactToDelete?.name || '')}
              </Text>
              <View style={styles.deleteModalActions}>
                <TouchableOpacity style={styles.deleteModalCancelBtn} onPress={() => setContactToDelete(null)}>
                  <Text style={styles.deleteModalCancelText}>{t('contacts.confirm_delete_cancel', 'Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteModalConfirmBtn} onPress={() => {
                  if(contactToDelete) removeContact(contactToDelete.id);
                  setContactToDelete(null);
                }}>
                  <Text style={styles.deleteModalConfirmText}>{t('contacts.confirm_delete_confirm', 'Yes, Delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Invite Banner (Floating) */}
        {showInvite && (
          <View style={styles.inviteBannerWrapper}>
            <View style={styles.inviteBanner}>
              <TouchableOpacity style={styles.closeBannerBtn} onPress={() => setShowInvite(false)} accessibilityLabel="Fermer la bannière">
                <Ionicons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
              <View style={styles.inviteBannerLeft}>
                <Text style={styles.inviteBannerTitle}>
                  {t('home.inviteBannerTitle_1', "Invitez vos amis\net gagnez ")}<Text style={{color: '#3B82F6'}}>{t('home.inviteBannerTitle_2', "$5 en DZY")}</Text>
                </Text>
                <Text style={styles.inviteBannerText}>
                  {t('home.inviteBannerDesc', "Envoyez de l'argent, achetez, payez des factures et gagnez des récompenses ensemble.")}
                </Text>
                <TouchableOpacity 
                  style={styles.inviteBtn} 
                  onPress={() => {
                    handleUserInviteShare(session?.user);
                  }}
                >
                  <Text style={styles.inviteBtnText}>{t('home.btnInviteNow', "Inviter maintenant")}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inviteBannerRight}>
                <View style={styles.mockPhoneIllustration}>
                  <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={{ width: 44, height: 44 }} resizeMode="contain" />
                </View>
              </View>
            </View>
          </View>
        )}

        <BottomNavBar activeTab="contacts" />
        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

function ContactRow({ contact, onPress, onMorePress }) {
  const { t } = useApp();

  return (
    <TouchableOpacity style={styles.contactItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.contactInfoCol}>
        <Avatar image={contact.image} name={contact.name} size={46} style={styles.contactAvatarLarge} />
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactRelation}>{contact.relation}</Text>
          <Text style={styles.contactLocation}>{contact.flag} {contact.location}</Text>
        </View>
      </View>

      <View style={styles.statusCol}>
        <Ionicons name="person-outline" size={18} color={contact.isBeneficiary ? '#10B981' : '#94A3B8'} />
        <Text style={[styles.statusText, { color: contact.isBeneficiary ? '#10B981' : '#94A3B8' }]}>
          {contact.isBeneficiary ? t('common.yes', 'Yes') : t('common.no', 'No')}
        </Text>
      </View>

      <View style={styles.statusCol}>
        <Ionicons name="person-add-outline" size={18} color={contact.isSponsor ? '#10B981' : '#94A3B8'} />
        <Text style={[styles.statusText, { color: contact.isSponsor ? '#10B981' : '#94A3B8' }]}>
          {contact.isSponsor ? t('common.yes', 'Yes') : t('common.no', 'No')}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.moreActionBtn} 
        onPress={(e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          if (onMorePress) onMorePress();
          else if (onPress) onPress();
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#3B82F6" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}



const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14 },
  container: { flex: 1, position: 'relative' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 14 : 10, paddingBottom: 12 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  backBtnHeader: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: '#DBEAFE' },
  mainTitle: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#0A1128' },
  headerRightIcons: { flexDirection: 'row' },
  iconBtnRight: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#F1F5F9', marginLeft: 8, position: 'relative' },
  notificationDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFB800', borderWidth: 1, borderColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 8, paddingBottom: 200 },
  todoCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F6', backgroundColor: '#FFFFFF', boxShadow: '0px 4px 12px #0A1737', overflow: 'hidden' },
  todoItem: { flexDirection: 'row', alignItems: 'center', minHeight: 40, paddingHorizontal: 12, paddingVertical: 10 },
  todoIconWrapper: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  todoTitle: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840', lineHeight: 16, paddingRight: 10 },
  todoButton: { minWidth: 60, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  todoButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#64748B', paddingHorizontal: 16, marginBottom: 16 },
  searchSectionWrap: {
    position: 'relative',
    zIndex: 999,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFC759',
    borderRadius: 24,
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  searchContainerFocused: {
    borderColor: '#D97706',
    shadowColor: '#D97706',
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  searchInputWrapper: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    position: 'relative',
  },
  ghostTextRow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ghostTypedSpacer: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'transparent',
    includeFontPadding: false,
  },
  ghostAutoFillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#94A3B8',
    includeFontPadding: false,
  },
  searchInputField: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1A2840',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    backgroundColor: 'transparent',
  },
  tabCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabCompleteText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#475569',
  },
  candidatePillsRow: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  candidatePillsScroll: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  candidatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  candidatePillFlag: {
    fontSize: 13,
    marginRight: 5,
  },
  candidatePillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#334155',
  },
  candidatePillHighlight: {
    fontFamily: 'Inter_700Bold',
    color: '#D97706',
  },
  dropdownCard: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFC759',
    shadowColor: '#071D54',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 9999,
    overflow: 'hidden',
  },
  dropdownHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownHeaderText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#071D54',
    flex: 1,
  },
  dropdownCountBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  dropdownCountText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#3B82F6',
  },
  dropdownEmptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownEmptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
  },
  dropdownItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  dropdownItemCenter: {
    flex: 1,
  },
  dropdownItemName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 2,
  },
  dropdownItemHighlight: {
    fontFamily: 'Inter_700Bold',
    color: '#D97706',
  },
  dropdownItemSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  dropdownInsertBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginLeft: 6,
  },
  dropdownFooterBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFBEB',
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
  },
  dropdownFooterText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#D97706',
  },
  searchIcon: { marginRight: 12 },
  searchInput: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#1A2840', marginBottom: 2, padding: 0, outlineStyle: 'none' },
  searchSubText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#94A3B8' },
  activeActionBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 24, borderWidth: 1, borderColor: '#BFDBFE', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  activeActionBannerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  activeActionTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1E3A8A', marginBottom: 2 },
  activeActionSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#3B82F6' },
  cancelActionBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#BFDBFE' },
  cancelActionText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#EF4444' },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1A2840', paddingHorizontal: 16, marginBottom: 12 },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickActionCard: {
    width: '23.5%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#1A2840',
    textAlign: 'center',
    lineHeight: 13,
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16, marginBottom: 12 },
  sectionTitleSticky: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1A2840', paddingHorizontal: 16 },
  stickyHeaderContainer: { backgroundColor: '#FAFAFA', paddingTop: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', zIndex: 10 },
  showLessText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#3B82F6' },
  filtersScroll: { paddingHorizontal: 16, marginBottom: 12 },
  filterChipActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A1128', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterChipTextActive: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#FFFFFF' },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterChipText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#64748B' },
  listHeaderRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8, alignItems: 'center', backgroundColor: '#FAFAFA' },
  listHeaderText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#94A3B8' },
  contactsList: { paddingHorizontal: 16 },
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingVertical: 12 },
  contactInfoCol: { flexDirection: 'row', alignItems: 'center', flex: 3 },
  contactAvatarLarge: { width: 46, height: 46, borderRadius: 23, marginRight: 12 },
  contactDetails: { flex: 1 },
  contactName: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1A2840', marginBottom: 2 },
  contactRelation: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#64748B', marginBottom: 2 },
  contactLocation: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#64748B' },
  statusCol: { flex: 0.8, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  moreActionBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E7FF', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  sheetDismissArea: { flex: 1 },
  sheetContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '90%' },
  sheetHandleWrap: { alignItems: 'center', paddingVertical: 12 },
  sheetHandle: { width: 48, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3 },
  sheetHeader: { alignItems: 'center', marginBottom: 24 },
  sheetAvatar: { width: 64, height: 64, borderRadius: 32, marginBottom: 12 },
  sheetNameLg: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#0F172A', marginBottom: 4 },
  sheetLocationLg: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#64748B' },
  sheetActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  gridActionBtn: { width: '23%', alignItems: 'center', marginBottom: 16 },
  gridActionIconWrap: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  gridActionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#334155', textAlign: 'center' },
  sheetListGroup: { backgroundColor: '#F8FAFC', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  listActionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  listActionIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  listActionLabel: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, color: '#1E293B' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 70, zIndex: 50 },
  inviteBannerWrapper: { position: 'absolute', bottom: 90, left: 16, right: 16 },
  inviteBanner: { backgroundColor: '#EEF5FF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: '#DBEAFE', elevation: 4, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  closeBannerBtn: { position: 'absolute', top: 12, right: 12, zIndex: 10, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  inviteBannerLeft: { flex: 1, zIndex: 2 },
  inviteBannerTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1A2840', marginBottom: 8, lineHeight: 22 },
  inviteBannerText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#475569', marginBottom: 16, lineHeight: 16 },
  inviteBtn: { backgroundColor: '#071D54', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' },
  inviteBtnText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#FFFFFF' },
  inviteBannerRight: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  mockPhoneIllustration: { width: 64, height: 64, backgroundColor: '#DBEAFE', borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 20, marginVertical: 12 },
  emptyTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', marginTop: 10, marginBottom: 4 },
  emptySubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#64748B', textAlign: 'center', marginBottom: 16 },
  addFirstBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFC759', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addFirstBtnText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#071D54' },
  rowBack: { alignItems: 'center', backgroundColor: '#EF4444', flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 0 },
  backRightBtn: { alignItems: 'center', bottom: 0, justifyContent: 'center', position: 'absolute', top: 0, width: 80, right: 0 },
  backRightBtnText: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 10, marginTop: 4 },
  deleteModalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  deleteModalContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  deleteModalIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  deleteModalTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  deleteModalDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  deleteModalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  deleteModalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F1F5F9', marginRight: 8, alignItems: 'center' },
  deleteModalCancelText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#334155' },
  deleteModalConfirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#EF4444', marginLeft: 8, alignItems: 'center' },
  deleteModalConfirmText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' }
});
