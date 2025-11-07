import { StyleSheet } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';

type Styles = {
  card: ViewStyle;
  icon: TextStyle;
  label: TextStyle;
  full: ViewStyle;
  half: ViewStyle;
};

export const styles = StyleSheet.create<Styles>({
  card: {
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#aaa',
    shadowColor: '#555',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  icon: { fontSize: 20, marginBottom: 6 },
  label: { color: '#000', textAlign: 'center', fontWeight: '600' },
  full: { width: '100%' },
  half: { flexBasis: '48%' },
});