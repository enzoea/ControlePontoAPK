import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: '#fff', padding: 16, borderRadius: 12, width: '90%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D14D4F' },
  cancelText: { color: '#D14D4F', textAlign: 'center', fontWeight: '600' },
  subsTitle: { fontSize: 16, fontWeight: '700' },
  subsHeader: { flexDirection: 'row', backgroundColor: '#f6f6f6', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
  subsRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee' },
  subsCell: { flex: 1, paddingHorizontal: 8 },
  subsHeadCell: { fontWeight: '700' },
});