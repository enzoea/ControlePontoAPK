import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, Modal, Alert } from 'react-native';
import dayjs from 'dayjs';
import { Turno } from '../../core/types';

type SelecoesDia = { manha: boolean; tarde: boolean; noite: boolean };
export type DiaTurnosSelection = Record<string, SelecoesDia>; // key = dataISO

type Props = {
  diasISO: string[];
  value: DiaTurnosSelection;
  onChange: (next: DiaTurnosSelection) => void;
  turmas?: Record<string, { manha?: string; tarde?: string; noite?: string }>;
  onChangeTurmas?: (next: Record<string, { manha?: string; tarde?: string; noite?: string }>) => void;
  propagateParity?: boolean;
};

export default function DiaTurnosPicker({ diasISO, value, onChange, turmas, onChangeTurmas, propagateParity = true }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [pendingTurno, setPendingTurno] = useState<Turno | null>(null);
  const [turmaInput, setTurmaInput] = useState('');

  function setTurno(dataISO: string, turno: Turno, val: boolean) {
    const base = value[dataISO] ?? { manha: false, tarde: false, noite: false };
    const next = { ...value, [dataISO]: { ...base, [turno]: val } } as DiaTurnosSelection;
    onChange(next);
    if (val) {
      setPendingDate(dataISO);
      setPendingTurno(turno);
      const prefill = (turmas?.[dataISO] as any)?.[turno] ?? '';
      setTurmaInput(prefill);
      setModalVisible(true);
    }
  }

  function setTurma(dataISO: string, turno: Turno, nome: string) {
    const base = turmas?.[dataISO] ?? {};
    let next = { ...(turmas ?? {}) } as Record<string, { manha?: string; tarde?: string; noite?: string }>;
    // também vamos ativar o switch do turno nos dias de mesma paridade
    let nextSel = { ...value } as DiaTurnosSelection;
    const clickedDay = dayjs(dataISO).date();
    const targetParityEven = (clickedDay % 2) === 0;
    if (propagateParity) {
      diasISO.forEach(d => {
        const isEven = (dayjs(d).date() % 2) === 0;
        if (isEven === targetParityEven) {
          const curBase = next[d] ?? {};
          next[d] = { ...curBase, [turno]: nome };
          const curSel = nextSel[d] ?? { manha: false, tarde: false, noite: false };
          nextSel[d] = { ...curSel, [turno]: true };
        }
      });
    } else {
      next[dataISO] = { ...base, [turno]: nome };
      const curSel = nextSel[dataISO] ?? { manha: false, tarde: false, noite: false };
      nextSel[dataISO] = { ...curSel, [turno]: true };
    }
    onChangeTurmas?.(next);
    onChange(nextSel);
  }

  return (
    <View style={styles.container}>
      {diasISO.map((d) => {
        const s = value[d] ?? { manha: false, tarde: false, noite: false };
        return (
          <View key={d} style={styles.row}>
            <Text style={styles.dayLabel}>Dia {dayjs(d).format('DD/MM/YYYY')}</Text>
            <View style={styles.turnos}>
              <View style={styles.turnoItem}>
                <Text>Manhã</Text>
                <Switch value={s.manha} onValueChange={(v) => setTurno(d, 'manha', v)} />
              </View>
              <View style={styles.turnoItem}>
                <Text>Tarde</Text>
                <Switch value={s.tarde} onValueChange={(v) => setTurno(d, 'tarde', v)} />
              </View>
              <View style={styles.turnoItem}>
                <Text>Noite</Text>
                <Switch value={s.noite} onValueChange={(v) => setTurno(d, 'noite', v)} />
              </View>
            </View>
          </View>
        );
      })}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => {
        // cancelar volta o switch
        if (pendingDate && pendingTurno) setTurno(pendingDate, pendingTurno, false);
        setModalVisible(false);
        setPendingDate(null);
        setPendingTurno(null);
        setTurmaInput('');
      }}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nome da turma ({pendingTurno ? pendingTurno.charAt(0).toUpperCase() + pendingTurno.slice(1) : ''})</Text>
            <TextInput
              placeholder="Ex.: 251A"
              value={turmaInput}
              onChangeText={setTurmaInput}
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <View style={[styles.modalBtn, styles.cancelBtn]}> 
                <Text style={styles.cancelText} onPress={() => {
                  if (pendingDate && pendingTurno) setTurno(pendingDate, pendingTurno, false);
                  setModalVisible(false);
                  setPendingDate(null);
                  setPendingTurno(null);
                  setTurmaInput('');
                }}>Cancelar</Text>
              </View>
              <View style={[styles.modalBtn, { backgroundColor: '#007AFF' }]}> 
                <Text style={styles.btnText} onPress={() => {
                  const nome = turmaInput.trim();
                  if (!nome.length) {
                    Alert.alert('Informe a turma', 'Digite o nome da turma (ex.: 251A).');
                    return;
                  }
                  if (pendingDate && pendingTurno) {
                    setTurma(pendingDate, pendingTurno, nome);
                  }
                  setModalVisible(false);
                  setPendingDate(null);
                  setPendingTurno(null);
                  setTurmaInput('');
                }}>Confirmar</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
  dayLabel: { fontWeight: '600', marginBottom: 8 },
  turnos: { flexDirection: 'row', justifyContent: 'space-between' },
  turnoItem: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: '#fff', padding: 16, borderRadius: 12, width: '90%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  cancelBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D14D4F' },
  cancelText: { color: '#D14D4F', textAlign: 'center', fontWeight: '600' },
});