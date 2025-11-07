import React, { useMemo } from 'react';
import { Calendar } from 'react-native-calendars';
import { Alert, View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { listarLancamentosPorCiclo } from '../../data/db';

type Props = {
  inicio: Date;
  fim: Date;
  selected: string[];
  onChange: (nextSelected: string[]) => void;
  onDayPressOverride?: (dateISO: string) => void;
};

export default function CalendarCiclo({ inicio, fim, selected, onChange, onDayPressOverride }: Props) {
  const minDate = dayjs(inicio).format('YYYY-MM-DD');
  const maxDate = dayjs(fim).format('YYYY-MM-DD');

  const marked = useMemo(() => {
    const m: Record<string, any> = {};
    selected.forEach(d => {
      m[d] = { ...(m[d] || {}), selected: true };
    });

    const COLOR_PRESENCA = '#007AFF';
    const COLOR_FALTA = '#FF3B30';
    const COLOR_SUBSTITUICAO = '#34C759';

    const lancamentos = listarLancamentosPorCiclo(minDate, maxDate);
    lancamentos.forEach(l => {
      const hasPresenca = l.manha === 'presenca' || l.tarde === 'presenca' || l.noite === 'presenca';
      const hasFalta = l.manha === 'falta' || l.tarde === 'falta' || l.noite === 'falta';
      const hasSubstituicao = l.manha === 'substituicao' || l.tarde === 'substituicao' || l.noite === 'substituicao';

      const dots: Array<{ key: string; color: string }> = [];
      if (hasPresenca) dots.push({ key: 'presenca', color: COLOR_PRESENCA });
      if (hasFalta) dots.push({ key: 'falta', color: COLOR_FALTA });
      if (hasSubstituicao) dots.push({ key: 'substituicao', color: COLOR_SUBSTITUICAO });

      if (dots.length > 0) {
        m[l.dataISO] = { ...(m[l.dataISO] || {}), dots };
      }
    });
    return m;
  }, [selected, minDate, maxDate]);

  function toggle(dateISO: string) {
    const exists = selected.includes(dateISO);
    const next = exists ? selected.filter(d => d !== dateISO) : [...selected, dateISO];
    onChange(next.sort());
  }

  return (
    <View style={styles.wrapper}>
      <Calendar
        minDate={minDate}
        maxDate={maxDate}
        markedDates={marked}
        markingType="multi-dot"
        onDayPress={(day) => {
          const iso = day.dateString; // YYYY-MM-DD
          // só aceitar dentro do range
          if (iso >= minDate && iso <= maxDate) {
            const dow = dayjs(iso).day();
            // 0 = domingo, 6 = sábado
            if (dow === 0 || dow === 6) {
              Alert.alert('Seleção inválida', 'Não é permitido selecionar sábados ou domingos.');
              return;
            }
            if (typeof onDayPressOverride === 'function') {
              onDayPressOverride(iso);
            } else {
              toggle(iso);
            }
          }
        }}
        hideExtraDays
        enableSwipeMonths
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>Presença</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#FF3B30' }]} />
          <Text style={styles.legendText}>Falta</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#34C759' }]} />
          <Text style={styles.legendText}>Substituição</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, color: '#333' },
});