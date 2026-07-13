// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconSymbolName = 
  | 'house.fill'
  | 'paperplane.fill'
  | 'chevron.left.forwardslash.chevron.right'
  | 'chevron.right'
  | 'info.circle.fill'
  | 'shield.fill'
  | 'chart.bar.fill'
  | 'bolt.fill'
  | 'checkmark.circle.fill'
  | 'magnifyingglass'
  | 'exclamationmark.triangle.fill'
  | 'checkmark.shield.fill'
  | 'exclamationmark.shield.fill'
  | 'plus.circle.fill'
  | 'cube.fill'
  | 'network'
  | 'chart.pie.fill'
  | 'lock.shield.fill'
  | 'person.badge.plus.fill'
  | 'doc.text.fill'
  | 'person.fill'
  | 'person.2.fill'
  | 'gearshape.fill'
  | 'clock.fill'
  | 'trash.fill'
  | 'pencil'
  | 'doc.text.magnifyingglass'
  | 'chevron.left'
  | 'eye.fill'
  | 'eye.slash.fill';

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: Record<IconSymbolName, ComponentProps<typeof MaterialIcons>['name']> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'info.circle.fill': 'info',
  'shield.fill': 'security',
  'chart.bar.fill': 'bar-chart',
  'bolt.fill': 'bolt',
  'checkmark.circle.fill': 'check-circle',
  'magnifyingglass': 'search',
  'exclamationmark.triangle.fill': 'warning',
  'checkmark.shield.fill': 'verified-user',
  'exclamationmark.shield.fill': 'admin-panel-settings',
  'plus.circle.fill': 'add-circle',
  'cube.fill': 'widgets',
  'network': 'device-hub',
  'chart.pie.fill': 'pie-chart',
  'lock.shield.fill': 'security',
  'person.badge.plus.fill': 'person-add',
  'doc.text.fill': 'description',
  'person.fill': 'person',
  'person.2.fill': 'people',
  'gearshape.fill': 'settings',
  'clock.fill': 'access-time',
  'trash.fill': 'delete',
  'pencil': 'edit',
  'doc.text.magnifyingglass': 'find-in-page',
  'chevron.left': 'chevron-left',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
