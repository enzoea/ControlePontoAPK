import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#fff' },
  statsCard: { borderWidth: 1.5, borderColor: '#007AFF', borderRadius: 10, padding: 14, marginBottom: 10, backgroundColor: '#F9FBFF', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  statsTitle: { fontWeight: '700', fontSize: 18, marginBottom: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  statLabel: { color: '#333', fontSize: 14 },
  statValue: { color: '#222', fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
});