import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export default function AssetItem({ 
  icon,
  imageUrl, 
  iconColor, 
  iconBgColor, 
  symbol, 
  name, 
  price, 
  change, 
  isFavorite, 
  onBuy, 
  onSell, 
  onFavoriteToggle 
}) {
  const isPositive = change >= 0;
  const changeColor = isPositive ? theme.colors.success : theme.colors.error;
  
  return (
    <View style={styles.container}>
      {/* Icon & Name */}
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, !imageUrl && { backgroundColor: iconBgColor }]}>
          {imageUrl ? (
            <Image source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl} style={styles.cryptoIcon} />
          ) : (
            <Ionicons name={icon} size={20} color={iconColor} />
          )}
        </View>
        <View>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
      </View>

      {/* Sparkline (Simulated with Ionicons trending) */}
      <View style={styles.chartSection}>
        <Ionicons 
          name={isPositive ? 'trending-up' : 'trending-down'} 
          size={32} 
          color={changeColor} 
        />
      </View>

      {/* Price & Actions */}
      <View style={styles.rightSection}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{price}</Text>
          <Text style={[styles.change, { color: changeColor }]}>
            {isPositive ? '+' : '-'} {Math.abs(change).toFixed(2)} %
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={onFavoriteToggle} style={styles.favoriteBtn}>
            <Ionicons 
              name={isFavorite ? 'star' : 'star-outline'} 
              size={18} 
              color={isFavorite ? theme.colors.accent : '#A0AABF'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onBuy} style={styles.buyBtn}>
            <Text style={styles.buyText}>Buy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onSell} style={styles.sellBtn}>
            <Text style={styles.sellText}>Sell</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cryptoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'contain',
  },
  symbol: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  name: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#A0AABF',
    marginTop: 2,
  },
  chartSection: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  price: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  change: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteBtn: {
    marginRight: 12,
  },
  buyBtn: {
    backgroundColor: '#FFFBEB',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 6,
  },
  buyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#F59E0B',
  },
  sellBtn: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  sellText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#10B981',
  }
});
