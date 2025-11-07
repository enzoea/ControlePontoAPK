import React, { useMemo, useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import CalendarCiclo from '../../components/CalendarCiclo';
import DiaTurnosPicker, { DiaTurnosSelection } from '../../components/DiaTurnosPicker';
import { getCicloAtual, metaCicloISO } from '../../../core/ciclo';
import { aplicarStatus, findLancamentoByDataISO, resetStatusPorTipoNoCiclo } from '../../../data/db';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import InlineHeader from '../../components/InlineHeader';
import AppButton from '../../components/AppButton';
import AppFooter from '../../components/AppFooter';
import { styles } from './styles';
import { containsWeekend } from '../../utils/date';

export default function RegistrarFalta() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { inicio, fim } = useMemo(() => getCicloAtual(new Date()), []);
  const meta = useMemo(() => metaCicloISO(new Date()), []);
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState<'calendar' | 'turnos'>('calendar');
  const [turnosSel, setTurnosSel] = useState<DiaTurnosSelection>({});

  function avancar() {
    if (selected.length === 0) {
      Alert.alert('Seleção vazia', 'Selecione ao menos um dia do ciclo.');
      return;
    }
    if (containsWeekend(selected)) {
      Alert.alert('Regras de registro', 'Não é permitido registrar faltas aos sábados e domingos.');
      return;
    }
    setStep('turnos');
  }

  async function salvar() {
    const dias = selected;
    if (containsWeekend(dias)) {
      Alert.alert('Regras de registro', 'Não é permitido registrar faltas aos sábados e domingos.');
      return;
    }
    // detectar conflitos considerando seleção por dia
    let hasConflict = false;
    dias.forEach(d => {
      const s = turnosSel[d] ?? { manha: false, tarde: false, noite: false };
      const l = findLancamentoByDataISO(d);
      if (l) {
        (['manha', 'tarde', 'noite'] as const).forEach(t => {
          if ((s as any)[t] && l[t] && l[t] !== 'falta') hasConflict = true;
        });
      }
    });

    const apply = () => {
      let applied = 0;
      dias.forEach(d => {
        const s = turnosSel[d] ?? { manha: false, tarde: false, noite: false };
        const turnos: ('manha' | 'tarde' | 'noite')[] = [];
        if (s.manha) turnos.push('manha');
        if (s.tarde) turnos.push('tarde');
        if (s.noite) turnos.push('noite');
        if (turnos.length > 0) {
          aplicarStatus([d], turnos as any, 'falta', meta, { override: true });
          applied++;
        }
      });
      if (applied === 0) {
        Alert.alert('Nenhum turno selecionado', 'Marque ao menos um turno.');
      } else {
        Alert.alert('Sucesso', 'Faltas aplicadas.', [
          { text: 'OK', onPress: () => navigation.navigate('Home') },
        ]);
      }
    };

    if (hasConflict) {
      Alert.alert(
        'Conflitos detectados',
        'Há turnos com status diferente de vazio/presença. Deseja sobrescrever?',
        [
          { text: 'Cancelar' },
          { text: 'Sobrescrever', onPress: apply },
        ],
      );
    } else {
      apply();
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <InlineHeader title="Registrar falta" backColor="#000" backSize={28} />
      {step === 'calendar' && (
        <>
          <CalendarCiclo inicio={inicio} fim={fim} selected={selected} onChange={setSelected} />
          <AppButton label="Avançar" variant="outline" onPress={avancar} />
        </>
      )}
      {step === 'turnos' && (
        <>
          <DiaTurnosPicker diasISO={selected} value={turnosSel} onChange={setTurnosSel} />
          <AppButton label="Salvar faltas" onPress={salvar} />
        </>
      )}
      <AppButton variant="danger" label="Excluir informações" onPress={() => {
        Alert.alert(
          'Excluir informações',
          'Apagar todas as faltas registradas neste ciclo? Esta ação não pode ser desfeita.',
          [
            { text: 'Cancelar' },
            {
              text: 'Excluir', style: 'destructive', onPress: () => {
                const count = resetStatusPorTipoNoCiclo(meta.inicioISO, meta.fimISO, 'falta');
                setSelected([]);
                setTurnosSel({});
                setStep('calendar');
                Alert.alert('Concluído', `Faltas excluídas: ${count}`, [
                  { text: 'OK', onPress: () => navigation.navigate('Home') },
                ]);
              }
            },
          ],
        );
      }} />
      <AppFooter />
    </ScrollView>
  );
}