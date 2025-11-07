import React, { useMemo, useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import dayjs from 'dayjs';
import CalendarCiclo from '../../components/CalendarCiclo';
import DiaTurnosPicker, { DiaTurnosSelection } from '../../components/DiaTurnosPicker';
import { getCicloAtual, metaCicloISO } from '../../../core/ciclo';
import { aplicarPresencas, resetStatusPorTipoNoCiclo } from '../../../data/db';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import InlineHeader from '../../components/InlineHeader';
import AppButton from '../../components/AppButton';
import AppFooter from '../../components/AppFooter';
import { styles } from './styles';
import { containsWeekend } from '../../utils/date';

export default function PreenchimentoMensal() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { inicio, fim } = useMemo(() => getCicloAtual(new Date()), []);
  const meta = useMemo(() => metaCicloISO(new Date()), []);
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState<'calendar' | 'turnos'>('calendar');
  const [turnosSel, setTurnosSel] = useState<DiaTurnosSelection>({});
  const [turmasPorTurno, setTurmasPorTurno] = useState<Record<string, { manha?: string; tarde?: string; noite?: string }>>({});

  function avancar() {
    if (selected.length === 0) {
      Alert.alert('Seleção vazia', 'Selecione ao menos um dia do ciclo.');
      return;
    }
    if (containsWeekend(selected)) {
      Alert.alert('Regras de registro', 'Não é permitido registrar presenças aos sábados e domingos.');
      return;
    }
    setStep('turnos');
  }

  function salvar() {
    const dias = selected;
    if (containsWeekend(dias)) {
      Alert.alert('Regras de registro', 'Não é permitido registrar presenças aos sábados e domingos.');
      return;
    }
    let aplicados = 0;
    dias.forEach(d => {
      const s = turnosSel[d] ?? { manha: false, tarde: false, noite: false };
      const turnos: ('manha' | 'tarde' | 'noite')[] = [];
      if (s.manha) turnos.push('manha');
      if (s.tarde) turnos.push('tarde');
      if (s.noite) turnos.push('noite');
      if (turnos.length > 0) {
        const obsPT = turmasPorTurno[d] ?? {};
        aplicarPresencas([d], turnos as any, meta, {
          observacoesPorTurno: {
            manha: obsPT.manha?.trim() || undefined,
            tarde: obsPT.tarde?.trim() || undefined,
            noite: obsPT.noite?.trim() || undefined,
          },
        });
        aplicados++;
      }
    });
    if (aplicados === 0) {
      Alert.alert('Nenhum turno selecionado', 'Marque ao menos um turno para algum dia.');
      return;
    }
    Alert.alert('Sucesso', 'Presenças aplicadas.', [
      { text: 'OK', onPress: () => navigation.navigate('Home') },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <InlineHeader title="Preenchimento mensal" backColor="#000" backSize={28} />
      {step === 'calendar' && (
        <>
          <CalendarCiclo
            inicio={inicio}
            fim={fim}
            selected={selected}
            onChange={setSelected}
            onDayPressOverride={(iso) => {
              // Seleciona automaticamente todos os dias de mesma paridade no ciclo, exceto finais de semana
              const clickedDay = dayjs(iso).date();
              const targetParityEven = clickedDay % 2 === 0;
              const dias: string[] = [];
              let cur = dayjs(inicio);
              const end = dayjs(fim);
              while (cur.isBefore(end) || cur.isSame(end, 'day')) {
                const dow = cur.day();
                const parityEven = cur.date() % 2 === 0;
                if (dow !== 0 && dow !== 6 && parityEven === targetParityEven) {
                  dias.push(cur.format('YYYY-MM-DD'));
                }
                cur = cur.add(1, 'day');
              }
              const unique = new Set([...selected, ...dias]);
              const nextSel = Array.from(unique).sort();
              setSelected(nextSel);
            }}
          />
          <AppButton label="Avançar" variant="outline" onPress={avancar} />

        </>
        )}
          <AppButton variant="danger" label="Excluir informações" onPress={() => {
            Alert.alert(
              'Excluir informações',
              'Apagar todas as presenças registradas neste ciclo? Esta ação não pode ser desfeita.',
              [
                { text: 'Cancelar' },
                {
                  text: 'Excluir', style: 'destructive', onPress: () => {
                    const count = resetStatusPorTipoNoCiclo(meta.inicioISO, meta.fimISO, 'presenca');
                    // limpar estado local
                    setSelected([]);
                    setTurnosSel({});
                    setTurmasPorTurno({});
                    setStep('calendar');
                    Alert.alert('Concluído', `Presenças excluídas: ${count}`, [
                      { text: 'OK', onPress: () => navigation.navigate('Home') },
                    ]);
                  }
                },
              ],
            );
          }} />
      {step === 'turnos' && (
        <>
          <DiaTurnosPicker
            diasISO={selected}
            value={turnosSel}
            onChange={setTurnosSel}
            turmas={turmasPorTurno}
            onChangeTurmas={setTurmasPorTurno}
            propagateParity
          />
          <AppButton label="Salvar presenças" onPress={salvar} />

        </>
      )}
      <AppFooter />
    </ScrollView>
  );
}