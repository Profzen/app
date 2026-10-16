import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * ScreenFooter:
 * Sticky bottom area for primary buttons and actions that respects
 * safe area bottom insets so buttons are never under the Android navigation bar.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children Button(s) and content to display in footer
 * @param {Object} [props.style] Additional footer container style
 * @param {string} [props.backgroundColor='#FFFFFF'] Footer background color
 * @param {boolean} [props.borderTop=true] Whether to show top divider
 * @param {string} [props.borderTopColor='#E2E8F0'] Border top color
 * @param {number} [props.paddingHorizontal=16] Horizontal padding
 * @param {number} [props.paddingTop=12] Top padding above buttons
 * @param {number} [props.minBottomInset] Minimum fallback bottom padding
 */
export default function ScreenFooter({
  children,
  style,
  backgroundColor = '#FFFFFF',
  borderTop = true,
  borderTopColor = '#E2E8F0',
  paddingHorizontal = 16,
  paddingTop = 12,
  minBottomInset = Platform.OS === 'android' ? 16 : 12,
}) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom || 0, minBottomInset);

  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor,
          paddingHorizontal,
          paddingTop,
          paddingBottom: bottomInset,
          borderTopWidth: borderTop ? StyleSheet.hairlineWidth : 0,
          borderTopColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
  },
});
