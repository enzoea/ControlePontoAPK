import { StyleSheet } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';

type Styles = {
  container: ViewStyle;
  text: TextStyle;
  link: TextStyle;
};

export const styles = StyleSheet.create<Styles>({
  container: { alignItems: 'center', marginBottom: 32, marginTop: 32 },
  text: { color: '#333', textAlign: 'center', fontSize: 14, lineHeight: 20, includeFontPadding: false },
  link: { color: '#007AFF', fontWeight: '700', fontSize: 14, lineHeight: 20, includeFontPadding: false },
});