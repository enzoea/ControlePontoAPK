import { StyleSheet } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';

type Styles = {
  base: ViewStyle;
  primary: ViewStyle;
  outline: ViewStyle;
  danger: ViewStyle;
  label: TextStyle;
  labelOutline: TextStyle;
  labelDanger: TextStyle;
  disabled: ViewStyle;
};

export const styles = StyleSheet.create<Styles>({
  base: { padding: 12, borderRadius: 8, alignItems: 'center' },
  primary: { backgroundColor: '#34C759' },
  outline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#007AFF' },
  danger: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#FF3B30' },
  label: { fontWeight: '600', color: '#fff', textAlign: 'center' },
  labelOutline: { color: '#007AFF' },
  labelDanger: { color: '#FF3B30' },
  disabled: { opacity: 0.6 },
});