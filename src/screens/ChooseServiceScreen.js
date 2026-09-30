import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform, StatusBar, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';
import AppToast from '../components/AppToast';
import { getFullCountryName } from '../utils/countryCurrencyUtils';

const { width } = Dimensions.get('window');

// Default API fallback if env var is missing
const rawBuyGoods = process.env.EXPO_PUBLIC_BUY_GOODS_API_URL || 'https://buygoods-api.dizzitup.com/api';
const BUY_GOODS_API = rawBuyGoods.replace(/\/api\/?$/, '');


export default function ChooseServiceScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, user } = useApp();

  const beneficiary = route.params?.beneficiary || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(beneficiary.city || '');
  const [loadingCities, setLoadingCities] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState(null);

  const categories = [
    { id: 'all', name: t('marketplace.allItems', 'All Items'), icon: 'grid-outline' },
    { id: 'remittance', name: t('marketplace.remittance', 'Remittance'), icon: 'paper-plane-outline' },
    { id: 'mobile_data_airtime', name: t('marketplace.mobileDataAirtime', 'Mobile & Airtime'), icon: 'phone-portrait-outline' },
    { id: 'utilities', name: t('marketplace.utilities', 'Utilities'), icon: 'flash-outline' },
    { id: 'food_groceries', name: t('marketplace.foodGroceries', 'Groceries'), icon: 'cart-outline' },
    { id: 'healthcare', name: t('marketplace.healthcare', 'Healthcare'), icon: 'medkit-outline' },
    { id: 'education', name: t('marketplace.education', 'Education'), icon: 'school-outline' },
    { id: 'electronic_appliances', name: t('marketplace.electronicAppliances', 'Electronics'), icon: 'desktop-outline' },
    { id: 'home_furniture', name: t('marketplace.homeFurniture', 'Furniture'), icon: 'home-outline' },
    { id: 'gift_cards', name: t('marketplace.giftCards', 'Gift Cards'), icon: 'gift-outline' }
  ];

  const [globalCountryName, setGlobalCountryName] = useState(() => {
    let raw = beneficiary.country || beneficiary.country_name || beneficiary.country_code;
    return getFullCountryName(raw);
  });
  const [isCountryResolved, setIsCountryResolved] = useState(false);

  // Async resolve country code to name via DB
  useEffect(() => {
    let raw = beneficiary.country || beneficiary.country_name || beneficiary.country_code;
    if (raw && raw.trim().length === 2) {
      const fetchCountryName = async () => {
        try {
          const { data, error } = await supabase
            .from('countries')
            .select('name')
            .eq('code', raw.trim().toUpperCase())
            .single();
            
          if (data && data.name) {
            setGlobalCountryName(data.name);
          } else {
            setGlobalCountryName(getFullCountryName(raw));
          }
        } catch (err) {
          setGlobalCountryName(getFullCountryName(raw));
        } finally {
          setIsCountryResolved(true);
        }
      };
      fetchCountryName();
    } else {
      if (raw) setGlobalCountryName(getFullCountryName(raw));
      setIsCountryResolved(true);
    }
  }, [beneficiary.country, beneficiary.country_name, beneficiary.country_code]);

  // Load Cities
  useEffect(() => {
    const fetchCities = async () => {
      if (!beneficiary.country) return;
      setLoadingCities(true);
      try {
        const { data, error } = await supabase
          .from("cities")
          .select("name")
          .eq("country_name", beneficiary.country)
          .order("name");
        
        if (!error && data) {
          const formattedCities = data.map(c => c.name);
          setCities(formattedCities);
        }
      } catch (err) {
        console.log("Error fetching cities:", err);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [beneficiary.country]);

  // Load Real Products from Backend
  useEffect(() => {
    if (!isCountryResolved) return;
    
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const targetCountry = globalCountryName.toLowerCase();
        const targetCode = (beneficiary.country_code || '').toLowerCase();

        // 1. Fetch from Supabase via BuyGoods API
        const res = await fetch(`${BUY_GOODS_API}/api/public/products`);
        let backendProducts = [];
        if (res.ok) {
          const data = await res.json();
          backendProducts = (data.products || []).map(p => {
            let cat = "all";
            const catRaw = (p.category || "").toLowerCase();
            if (catRaw.includes('food')) cat = 'food_groceries';
            else if (catRaw.includes('health')) cat = 'healthcare';
            else if (catRaw.includes('mobile')) cat = 'mobile_data_airtime';
            else if (catRaw.includes('utility') || catRaw.includes('electricity')) cat = 'utilities';
            else if (catRaw.includes('education')) cat = 'education';
            else if (catRaw.includes('gift')) cat = 'gift_cards';
            
            // Safe image parsing logic
            let parsedImage = null;
            if (Array.isArray(p.product_images) && p.product_images.length > 0) parsedImage = p.product_images[0];
            else if (typeof p.product_images === 'string') {
              try { const parsed = JSON.parse(p.product_images); if (Array.isArray(parsed)) parsedImage = parsed[0]; } 
              catch(e) { parsedImage = p.product_images; }
            }
            if (parsedImage && !parsedImage.startsWith('http')) parsedImage = `https://sdnpjglhcauispfrrhwh.supabase.co/storage/v1/object/public/product-images/${parsedImage}`;

            return {
              id: p.id,
              name: p.name,
              description: p.description || "Quality product from local merchant",
              price: parseFloat(p.price) || 0,
              currency: p.currency || 'USD',
              category: cat,
              image: parsedImage,
              supplier: p.merchant?.shop_name || "Local Merchant",
              country: p.merchant?.country,
              city: p.merchant?.city_village,
              isService: false,
              featured: p.featured
            };
          });
        }

        // 2. Inject Static Platform Services for the country
        const platformServices = [
          {
            id: 'srv_remittance', image: 'https://buygoods.dizzitup.com/assets/services/remittance_tile.png', name: `Send Stablecoins to ${globalCountryName}`, category: 'remittance', description: `Direct cash remittance to ${globalCountryName} — fast, secure, and reliable`, price: 0, currency: 'USD', supplier: 'DizzitUp Remittance', isService: true, isRemittance: true, featured: true, country: globalCountryName, city: 'Nationwide'
          },
          {
            id: 'srv_airtime', image: 'https://buygoods.dizzitup.com/assets/services/airtime_v2_1777468371506.png', name: `${globalCountryName} Airtime Top-up`, category: 'mobile_data_airtime', description: `Instant mobile credit for any ${globalCountryName} operator`, price: 10, currency: 'USD', supplier: 'DizzitUp Services', isService: true, featured: true, country: globalCountryName, city: 'Nationwide'
          },
          {
            id: 'srv_electricity', image: 'https://buygoods.dizzitup.com/assets/services/electricity_v2_1777468354506.png', name: `${globalCountryName} Electricity Bill`, category: 'utilities', description: `Instant prepaid electricity tokens for ${globalCountryName}`, price: 20, currency: 'USD', supplier: 'DizzitUp Utilities', isService: true, featured: true, country: globalCountryName, city: 'Nationwide'
          },
          {
            id: 'srv_education', image: 'https://buygoods.dizzitup.com/assets/services/education_v2_1777468388387.png', name: 'School Fees Payment', category: 'education', description: 'Pay school or university fees directly for your beneficiary', price: 100, currency: 'USD', supplier: 'DizzitUp Education', isService: true, featured: false, country: globalCountryName, city: 'Nationwide'
          },
          {
            id: 'srv_giftcard_50', image: 'https://buygoods.dizzitup.com/assets/services/giftcard-50.png', name: 'DizzitUp Gift Card', category: 'gift_cards', description: 'Digital gift card delivered via email/SMS', price: 50, currency: 'USD', supplier: 'DizzitUp Cards', isService: true, featured: true, country: globalCountryName, city: 'Digital'
          }
        ];

        const allItems = [...platformServices, ...backendProducts];
        // Filter by country
        const filtered = allItems.filter(item => {
          const c = (item.country || '').toLowerCase();
          return c === targetCountry || c === targetCode || c.includes(targetCountry);
        });

        setProducts(filtered);
      } catch (err) {
        console.log("Failed to load products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [beneficiary, globalCountryName, isCountryResolved]);

  // Filtering Logic & Sorting
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    // 1. Filter out only based on category and search (Country is already filtered in backend fetch)
    const filtered = products.filter(item => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = !query || item.name.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });

    // 2. Sort the array
    return filtered.sort((a, b) => {
      // Platform services always on top
      if (a.isService && !b.isService) return -1;
      if (!a.isService && b.isService) return 1;

      // If both are physical products, sort local city first
      if (!a.isService && !b.isService && selectedCity) {
        const aMatchesCity = a.city && (a.city.toLowerCase().includes(selectedCity.toLowerCase()) || a.city.toLowerCase() === 'nationwide' || a.city.toLowerCase() === 'digital');
        const bMatchesCity = b.city && (b.city.toLowerCase().includes(selectedCity.toLowerCase()) || b.city.toLowerCase() === 'nationwide' || b.city.toLowerCase() === 'digital');
        
        if (aMatchesCity && !bMatchesCity) return -1;
        if (!aMatchesCity && bMatchesCity) return 1;
      }
      return 0; // maintain original order otherwise
    });
  }, [products, selectedCategory, searchQuery, selectedCity]);

  const handleCheckout = () => {
    if (!selectedProduct) return;
    
    if (selectedProduct.id === 'srv_remittance' || selectedProduct.isRemittance) {
      navigation.navigate('SendMoneyScreen', { beneficiary, pivotScreen: route.params?.pivotScreen, pivotParams: route.params?.pivotParams });
    } else if (selectedProduct.id === 'srv_airtime' || selectedProduct.category === 'mobile_data_airtime') {
      navigation.navigate('MobileRechargeScreen', { beneficiary, product: selectedProduct, pivotScreen: route.params?.pivotScreen, pivotParams: route.params?.pivotParams });
    } else if (selectedProduct.id === 'srv_electricity' || selectedProduct.category === 'utilities' || selectedProduct.category === 'education') {
      navigation.navigate('BillDetailsScreen', { beneficiary, pivotScreen: route.params?.pivotScreen, pivotParams: route.params?.pivotParams });
    } else if (selectedProduct.id === 'srv_giftcard_50' || selectedProduct.category === 'gift_cards') {
      navigation.navigate('ExploreGiftCardsScreen', { beneficiary, pivotScreen: route.params?.pivotScreen, pivotParams: route.params?.pivotParams });
    } else if (selectedProduct.isService === false) {
      navigation.navigate('ProductDetailsScreen', { 
        product: selectedProduct, 
        shop: selectedProduct.merchant,
        pivotScreen: route.params?.pivotScreen,
        pivotParams: route.params?.pivotParams,
      });
    } else {
      navigation.navigate('BillDetailsScreen', { beneficiary, pivotScreen: route.params?.pivotScreen, pivotParams: route.params?.pivotParams });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            const pivotScreen = route.params?.pivotScreen;
            const pivotParams = route.params?.pivotParams;
            if (pivotScreen) {
              navigation.navigate(pivotScreen, pivotParams);
            } else {
              navigation.goBack();
            }
          }}>
            <Ionicons name="arrow-back" size={24} color="#20365B" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>{t('marketplace.chooseGoodsTitle', 'Choose Goods and Essentials')}</Text>
          </View>
        </View>

        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Beneficiary Summary with Phone Pill */}
          <View style={styles.beneficiaryBanner}>
            <View style={styles.beneficiaryIconWrap}>
              <Ionicons name="person" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.beneficiaryTextWrap}>
              <Text style={styles.beneficiaryName}>
                {t('selectService.beneficiaryIs', 'Your beneficiary is')}{' '}
                <Text style={{ fontFamily: 'Inter_700Bold' }}>{beneficiary.first_name || beneficiary.name || t('common.beneficiary', 'Beneficiary')}</Text>{' '}
                {t('selectService.from', 'from')} <Text style={{ color: '#FFB800' }}>{globalCountryName}</Text>
              </Text>
              {(beneficiary.phone || beneficiary.phoneNumber) ? (
                <View style={styles.beneficiaryPhonePill}>
                  <Ionicons name="phone-portrait-outline" size={12} color="#071D54" style={{ marginRight: 4 }} />
                  <Text style={styles.beneficiaryPhoneText}>{beneficiary.phone || beneficiary.phoneNumber}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* 6 Core Services Hub (Screenshot 3) */}
          <View style={styles.servicesHubContainer}>
            <View style={styles.servicesHubHeader}>
              <Text style={styles.servicesHubTitle}>{t('selectService.title', 'Select a Service')}</Text>
              <Text style={styles.servicesHubSubtitle}>{t('selectService.subtitle', 'Choose how you would like to proceed')}</Text>
            </View>

            <View style={styles.servicesGrid}>
              {/* Card 1: Buy Goods */}
              <TouchableOpacity
                style={[styles.serviceCard, selectedCategory === 'all' && styles.serviceCardActive]}
                onPress={() => setSelectedCategory('all')}
                activeOpacity={0.8}
              >
                <View style={styles.badgeMarketplace}>
                  <Text style={styles.badgeMarketplaceText}>{t('selectService.badgeMarketplace', 'MARKETPLACE')}</Text>
                </View>
                <View style={[styles.serviceIconCircle, { backgroundColor: '#FFFBEB' }]}>
                  <Ionicons name="bag-handle-outline" size={22} color="#D97706" />
                </View>
                <Text style={styles.serviceCardTitle}>{t('selectService.buyGoods', 'Buy Goods')}</Text>
                <Text style={styles.serviceCardDesc} numberOfLines={2}>
                  {t('selectService.buyGoodsDesc', 'Shop from local merchants and African stores')}
                </Text>
              </TouchableOpacity>

              {/* Card 2: Pay Utility Bill */}
              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => navigation.navigate('BillDetailsScreen', { beneficiary })}
                activeOpacity={0.8}
              >
                <View style={styles.badgePaybills}>
                  <Text style={styles.badgePaybillsText}>{t('selectService.badgePaybills', 'PAYBILLS')}</Text>
                </View>
                <View style={[styles.serviceIconCircle, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="flash-outline" size={22} color="#0284C7" />
                </View>
                <Text style={styles.serviceCardTitle}>{t('selectService.payUtility', 'Pay Utility Bill')}</Text>
                <Text style={styles.serviceCardDesc} numberOfLines={2}>
                  {t('selectService.payUtilityDesc', 'Pay electricity, water, and internet tokens')}
                </Text>
              </TouchableOpacity>

              {/* Card 3: Top-up Mobile */}
              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => navigation.navigate('MobileRechargeScreen', { beneficiary })}
                activeOpacity={0.8}
              >
                <View style={styles.badgePaybills}>
                  <Text style={styles.badgePaybillsText}>{t('selectService.badgePaybills', 'PAYBILLS')}</Text>
                </View>
                <View style={[styles.serviceIconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="phone-portrait-outline" size={22} color="#10B981" />
                </View>
                <Text style={styles.serviceCardTitle}>{t('selectService.topupMobile', 'Top-up Mobile')}</Text>
                <Text style={styles.serviceCardDesc} numberOfLines={2}>
                  {t('selectService.topupMobileDesc', 'Send airtime and data to mobile phones')}
                </Text>
              </TouchableOpacity>

              {/* Card 4: Gift Cards */}
              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => navigation.navigate('ExploreGiftCardsScreen', { beneficiary })}
                activeOpacity={0.8}
              >
                <View style={styles.badgePaybills}>
                  <Text style={styles.badgePaybillsText}>{t('selectService.badgePaybills', 'PAYBILLS')}</Text>
                </View>
                <View style={[styles.serviceIconCircle, { backgroundColor: '#F5F3FF' }]}>
                  <Ionicons name="gift-outline" size={22} color="#8B5CF6" />
                </View>
                <Text style={styles.serviceCardTitle}>{t('selectService.giftCards', 'Gift Cards')}</Text>
                <Text style={styles.serviceCardDesc} numberOfLines={2}>
                  {t('selectService.giftCardsDesc', 'Send international and local digital gift cards')}
                </Text>
              </TouchableOpacity>

              {/* Card 5: DZYcard */}
              <TouchableOpacity
                style={[styles.serviceCard, { opacity: 0.75 }]}
                onPress={() => setToast({ title: 'DZYcard', message: t('selectService.dzycardToast', 'DZYcard virtual & physical Visa cards are coming soon!') })}
                activeOpacity={0.8}
              >
                <View style={styles.badgeComingSoon}>
                  <Text style={styles.badgeComingSoonText}>{t('selectService.badgeComingSoon', 'COMING SOON')}</Text>
                </View>
                <View style={[styles.serviceIconCircle, { backgroundColor: '#F8FAFC' }]}>
                  <Ionicons name="card-outline" size={22} color="#64748B" />
                </View>
                <Text style={styles.serviceCardTitle}>{t('selectService.dzyCard', 'DZYcard')}</Text>
                <Text style={styles.serviceCardDesc} numberOfLines={2}>
                  {t('selectService.dzyCardDesc', 'Get your virtual and physical DZYcard')}
                </Text>
              </TouchableOpacity>

              {/* Card 6: Send Stablecoins & DZY */}
              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => navigation.navigate('SendMoneyScreen', { beneficiary })}
                activeOpacity={0.8}
              >
                <View style={styles.badgeNew}>
                  <Text style={styles.badgeNewText}>{t('selectService.badgeNew', 'NEW')}</Text>
                </View>
                <View style={[styles.serviceIconCircle, { backgroundColor: '#F0F9FF' }]}>
                  <Ionicons name="globe-outline" size={22} color="#0284C7" />
                </View>
                <Text style={styles.serviceCardTitle}>{t('selectService.sendStablecoins', 'Send Stablecoins & DZY')}</Text>
                <Text style={styles.serviceCardDesc} numberOfLines={2}>
                  {t('selectService.sendStablecoinsDesc', 'Instantly send USDC or DZY to friends for free')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>{t('marketplace.orBrowseGoods', 'OR BROWSE LOCAL GOODS')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Location Filters */}
          <View style={styles.locationFiltersRow}>
            <View style={styles.filterBox}>
              <Text style={styles.filterLabel}>{t('marketplace.country', 'Country')}</Text>
              <View style={styles.countryPill}>
                <Ionicons name="map-outline" size={16} color="#FFC759" style={{marginRight: 8}} />
                <Text style={styles.countryPillText}>{globalCountryName}</Text>
              </View>
            </View>
            <View style={styles.filterBox}>
              <Text style={styles.filterLabel}>{t('marketplace.cityLabel', 'City')}</Text>
              <TouchableOpacity style={styles.filterInput} onPress={() => {/* Show City Modal */}}>
                <Ionicons name="location" size={16} color="#FFC759" style={{marginRight: 6}} />
                <Text style={styles.filterInputText}>{selectedCity || t('marketplace.selectCity', 'Select city...')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('marketplace.searchPlaceholder', 'Search products, services...')}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Categories Horizontal Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 8}}>
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <TouchableOpacity 
                  key={cat.id} 
                  style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Ionicons name={cat.icon} size={16} color={isActive ? "#FFFFFF" : "#6B7280"} style={{marginRight: 6}} />
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Products Grid */}
          <View style={styles.productsGrid}>
            {loadingProducts ? (
              <ActivityIndicator size="large" color="#FFC759" style={{marginTop: 40}} />
            ) : filteredProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color="#E5E7EB" />
                <Text style={styles.emptyTitle}>No products found</Text>
                <Text style={styles.emptySubtitle}>Try adjusting your search or category filter for your recipient's location.</Text>
              </View>
            ) : (
              filteredProducts.map(item => {
                const isSelected = selectedProduct?.id === item.id;
                const isOutOfCity = !item.isService && selectedCity && item.city && !(item.city.toLowerCase().includes(selectedCity.toLowerCase()) || item.city.toLowerCase() === 'nationwide' || item.city.toLowerCase() === 'digital');
                
                return (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[styles.productCard, isSelected && styles.productCardSelected]}
                    onPress={() => setSelectedProduct(item)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.productImageWrap}>
                      {item.image ? (
                        <Image source={{uri: item.image}} style={styles.productImage} />
                      ) : !item.isService ? (
                        <Image source={require('../../assets/brand/product_no_image.jpg')} style={styles.productImage} resizeMode="cover" />
                      ) : (
                        <View style={styles.productPlaceholder}>
                          <Ionicons name="flash" size={32} color="#CBD5E1" />
                        </View>
                      )}
                      {(item.city || item.country) && !isOutOfCity && (
                        <View style={styles.locationBadge}>
                          <Ionicons name="location" size={10} color="#6B7280" />
                          <Text style={styles.locationBadgeText}>{item.city || item.country}</Text>
                        </View>
                      )}
                      {isOutOfCity && (
                        <View style={styles.outOfCityBadge}>
                          <Ionicons name="airplane-outline" size={10} color="#FFFFFF" />
                          <Text style={styles.outOfCityBadgeText}>{t('marketplace.outOfCity', 'Out of your city')}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.productInfo}>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={styles.productTitle} numberOfLines={2}>{item.name}</Text>
                        {isSelected && <Ionicons name="checkmark-circle" size={20} color="#FFC759" />}
                      </View>
                      <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
                      
                      <View style={styles.productFooter}>
                        <View style={styles.supplierBadge}>
                          <Text style={styles.supplierText} numberOfLines={1}>{item.supplier}</Text>
                        </View>
                        <View style={styles.priceWrap}>
                          {item.isService ? (
                            <Text style={styles.serviceSetNext}>{t('marketplace.amountSetNext', 'Amount set next')}</Text>
                          ) : (
                            <>
                              <Text style={styles.priceMain}>${item.price.toFixed(2)}</Text>
                              <Text style={styles.priceSub}>{(item.price * 10).toFixed(0)} DZY</Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Bottom Checkout Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarPriceInfo}>
            <Text style={styles.bottomBarLabel}>{t('marketplace.itemPrice', 'Item Price')}</Text>
            {selectedProduct ? (
              selectedProduct.isService ? (
                <Text style={styles.bottomBarPrice}>--</Text>
              ) : (
                <View>
                  <Text style={styles.bottomBarPrice}>${selectedProduct.price.toFixed(2)}</Text>
                  <Text style={styles.bottomBarSubPrice}>{(selectedProduct.price * 10).toFixed(0)} DZY</Text>
                </View>
              )
            ) : (
              <Text style={styles.bottomBarPrice}>$0.00</Text>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.checkoutBtn, !selectedProduct && styles.checkoutBtnDisabled]} 
            disabled={!selectedProduct}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutBtnText}>{t('marketplace.continueBtn', 'Continue')}</Text>
            <Ionicons name="arrow-forward" size={18} color="#20365B" />
          </TouchableOpacity>
        </View>

        {/* Toast Notification */}
        {!!toast && (
          <View style={{ position: 'absolute', top: 50, left: 16, right: 16, zIndex: 999 }}>
            <AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14 },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#F8FAFC' },
  backButton: { padding: 8, backgroundColor: '#FFFFFF', borderRadius: 20, shadowColor: '#20365B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  headerTitleWrap: { flex: 1, marginLeft: 16 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#20365B' },
  mainScroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  beneficiaryBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(32, 54, 91, 0.05)', borderWidth: 1, borderColor: 'rgba(32, 54, 91, 0.1)', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 16 },
  beneficiaryIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#20365B', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  beneficiaryTextWrap: { flex: 1 },
  beneficiaryPhonePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  beneficiaryPhoneText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#071D54' },
  servicesHubContainer: { marginHorizontal: 16, marginBottom: 20 },
  servicesHubHeader: { marginBottom: 12 },
  servicesHubTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840' },
  servicesHubSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#64748B', marginTop: 2 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  serviceCard: { width: (width - 44) / 2, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, position: 'relative', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, marginBottom: 10 },
  serviceCardActive: { borderColor: '#FFC759', backgroundColor: '#FFFDF5' },
  badgeMarketplace: { alignSelf: 'flex-end', backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginBottom: 6 },
  badgeMarketplaceText: { fontFamily: 'Inter_700Bold', fontSize: 8, color: '#D97706', letterSpacing: 0.5 },
  badgePaybills: { alignSelf: 'flex-end', backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginBottom: 6 },
  badgePaybillsText: { fontFamily: 'Inter_700Bold', fontSize: 8, color: '#0284C7', letterSpacing: 0.5 },
  badgeComingSoon: { alignSelf: 'flex-end', backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginBottom: 6 },
  badgeComingSoonText: { fontFamily: 'Inter_700Bold', fontSize: 8, color: '#64748B', letterSpacing: 0.5 },
  badgeNew: { alignSelf: 'flex-end', backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginBottom: 6 },
  badgeNewText: { fontFamily: 'Inter_700Bold', fontSize: 8, color: '#16A34A', letterSpacing: 0.5 },
  serviceIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  serviceCardTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', marginBottom: 2 },
  serviceCardDesc: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#64748B', lineHeight: 14 },
  sectionDivider: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#94A3B8', marginHorizontal: 10, letterSpacing: 0.5 },
  locationFiltersRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 12 },
  filterBox: { flex: 1 },
  filterLabel: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#20365B', marginBottom: 6 },
  countryPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#E2E8F0' },
  countryPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#94A3B8' },
  filterInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#E2E8F0' },
  filterInputText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 16, height: 50, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, color: '#1A2840' },
  categoriesScroll: { marginBottom: 16, height: 50 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 16, height: 40, marginRight: 10 },
  categoryPillActive: { backgroundColor: '#20365B', borderColor: '#20365B' },
  categoryText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#6B7280' },
  categoryTextActive: { color: '#FFFFFF' },
  productsGrid: { paddingHorizontal: 16 },
  productCard: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 2, borderColor: '#F1F5F9', marginBottom: 16, overflow: 'hidden', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 2 },
  productCardSelected: { borderColor: '#FFC759', backgroundColor: '#FFFAED' },
  productImageWrap: { height: 160, backgroundColor: '#F8FAFC', position: 'relative' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  productPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  locationBadge: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  locationBadgeText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 9, color: '#6B7280', marginLeft: 4, textTransform: 'uppercase' },
  outOfCityBadge: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  outOfCityBadgeText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 9, color: '#FFFFFF', marginLeft: 4, textTransform: 'uppercase' },
  productInfo: { padding: 16 },
  productTitle: { flex: 1, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#20365B', marginBottom: 4 },
  productDesc: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#6B7280', lineHeight: 18, marginBottom: 12 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  supplierBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, maxWidth: '60%' },
  supplierText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#6B7280', textTransform: 'uppercase' },
  priceWrap: { alignItems: 'flex-end' },
  priceMain: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#20365B' },
  priceSub: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#94A3B8' },
  serviceSetNext: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#20365B', textTransform: 'uppercase', opacity: 0.6 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 2, borderColor: '#F1F5F9', borderStyle: 'dashed' },
  emptyTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#20365B', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#6B7280', textAlign: 'center', paddingHorizontal: 32 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 10 },
  bottomBarPriceInfo: { flex: 1 },
  bottomBarLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 2 },
  bottomBarPrice: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: '#FFC759' },
  bottomBarSubPrice: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#6B7280' },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFC759', paddingHorizontal: 24, height: 50, borderRadius: 16, shadowColor: '#FFC759', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  checkoutBtnDisabled: { backgroundColor: '#F1F5F9', shadowOpacity: 0 },
  checkoutBtnText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#20365B', marginRight: 8, textTransform: 'uppercase' }
});
