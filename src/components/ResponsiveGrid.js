import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGridColumns } from '../utils/responsive';

/**
 * ResponsiveGrid:
 * Renders child elements in responsive grid rows using useGridColumns.
 * Calculates exact itemWidth so columns never wrap unexpectedly.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children Child elements to render in grid
 * @param {number} [props.minItemWidth=140] Minimum item width
 * @param {number} [props.maxColumns=3] Maximum columns (3 on wide, 2 on phones)
 * @param {number} [props.padding=32] Total horizontal padding of container
 * @param {number} [props.gap=12] Gap between grid items
 * @param {Object} [props.style] Additional grid container styles
 * @param {Object} [props.itemStyle] Additional styles for each item wrapper
 */
export default function ResponsiveGrid({
  children,
  minItemWidth = 140,
  maxColumns = 3,
  padding = 32,
  gap = 12,
  style,
  itemStyle,
}) {
  const { columns, itemWidth, isSmallScreen } = useGridColumns({
    minItemWidth,
    maxColumns,
    padding,
    gap,
  });

  const childArray = React.Children.toArray(children).filter(Boolean);

  return (
    <View
      style={[
        styles.gridContainer,
        {
          gap,
          rowGap: gap,
          columnGap: gap,
        },
        style,
      ]}
    >
      {childArray.map((child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            key: child.key || index,
            style: [
              child.props.style,
              { width: itemWidth },
              itemStyle,
            ],
            // Pass grid context down if child needs it
            isSmallScreen: child.props.isSmallScreen !== undefined ? child.props.isSmallScreen : isSmallScreen,
          });
        }
        return (
          <View key={index} style={[{ width: itemWidth }, itemStyle]}>
            {child}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
