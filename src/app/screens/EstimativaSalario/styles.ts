import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#fff' },
  card: { borderWidth: 1.5, borderColor: '#007AFF', borderRadius: 10, padding: 14, backgroundColor: '#F9FBFF', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  title: { fontWeight: '700', fontSize: 18, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  label: { color: '#333', fontSize: 14 },
  value: { color: '#222', fontSize: 16 },
  info: { color: '#666', fontSize: 12, marginTop: 6 },
});