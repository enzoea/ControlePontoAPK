import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import dayjs from 'dayjs';
import { Lancamento } from '../../core/types';

function statusCell(s: string | null | undefined, obs?: string | null | undefined) {
  switch (s) {
    case 'presenca':
      return (obs && obs.trim().length > 0) ? obs.trim() : '✔️';
    case 'falta':
      return 'Falta';
    case 'substituicao':
      return 'Substituição';
    default:
      return '';
  }
}

type Props = {
  inicioISO: string;
  fimISO: string;
  lancamentos: Lancamento[];
  onEdit?: (dataISO: string) => void;
};

export default function TabelaCiclo({ inicioISO, fimISO, lancamentos, onEdit }: Props) {
  const days = useMemo(() => {
    const start = dayjs(inicioISO);
    const end = dayjs(fimISO);
    const d: string[] = [];
    let cur = start;
    while (cur.isBefore(end) || cur.isSame(end, 'day')) {
      d.push(cur.format('YYYY-MM-DD'));
      cur = cur.add(1, 'day');
    }
    return d;
  }, [inicioISO, fimISO]);

  const map = useMemo(() => {
    const m = new Map<string, Lancamento>();
    lancamentos.forEach(l => m.set(l.dataISO, l));
    return m;
  }, [lancamentos]);

  const totals = useMemo(() => {
    let presenca = 0, falta = 0, substituicao = 0;
    days.forEach(d => {
      const l = map.get(d);
      ['manha','tarde','noite'].forEach((t) => {
        const s = (l as any)?.[t] ?? null;
        if (s === 'presenca') presenca++;
        else if (s === 'falta') falta++;
        else if (s === 'substituicao') substituicao++;
      });
    });
    return { presenca, falta, substituicao };
  }, [days, map]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={[styles.cell, styles.headCell]}>Data</Text>
        <Text style={[styles.cell, styles.headCell]}>Manhã</Text>
        <Text style={[styles.cell, styles.headCell]}>Tarde</Text>
        <Text style={[styles.cell, styles.headCell]}>Noite</Text>
        {onEdit ? <Text style={[styles.cell, styles.headCell]}>Ação</Text> : null}
      </View>
      <ScrollView>
        {days.map(d => {
          const l = map.get(d);
          return (
            <View key={d} style={styles.row}>
              <Text style={styles.cell}>{dayjs(d).format('DD/MM/YYYY')}</Text>
              <Text style={[styles.cell, (l?.manha === 'falta') ? styles.faltaCell : undefined]}>
                {l?.manha === 'falta' ? 'FALTA' : statusCell(l?.manha ?? null, l?.observacoesManha ?? l?.observacoes)}
              </Text>
              <Text style={[styles.cell, (l?.tarde === 'falta') ? styles.faltaCell : undefined]}>
                {l?.tarde === 'falta' ? 'FALTA' : statusCell(l?.tarde ?? null, l?.observacoesTarde ?? l?.observacoes)}
              </Text>
              <Text style={[styles.cell, (l?.noite === 'falta') ? styles.faltaCell : undefined]}>
                {l?.noite === 'falta' ? 'FALTA' : statusCell(l?.noite ?? null, l?.observacoesNoite ?? l?.observacoes)}
              </Text>
              {onEdit ? (
                <Pressable style={[styles.cell, styles.editBtn]} onPress={() => onEdit?.(d)}>
                  <Text style={{ color: '#007AFF' }}>Editar</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <Text>Total ✔️: {totals.presenca}</Text>
        <Text>Total Falta: {totals.falta}</Text>
        <Text>Total Substituição: {totals.substituicao}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', backgroundColor: '#f6f6f6', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
  headCell: { fontWeight: '700' },
  row: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee' },
  cell: { flex: 1, paddingHorizontal: 8 },
  faltaCell: { color: '#FF3B30', fontWeight: '700' },
  editBtn: { alignItems: 'flex-start' },
  footer: { flexDirection: 'row', justifyContent: 'space-around', padding: 12, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
});