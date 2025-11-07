import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Alert, Animated, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { metaCicloISO } from '../../../core/ciclo';
import { resetLancamentosPorCiclo, listarLancamentosPorCiclo } from '../../../data/db';
import InlineHeader from '../../components/InlineHeader';
import ActionCard from '../../components/ActionCard';
import AppFooter from '../../components/AppFooter';
import { styles } from './styles';
// Removido cálculo direto de salário da Home; agora há uma tela dedicada
import type { HomeProps } from './interfaces';
import { sumarizarLancamentos } from '../../utils/lancamentos';

export default function Home({ navigation }: HomeProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();
  const [refreshTick, setRefreshTick] = useState(0);
  const meta = useMemo(() => metaCicloISO(new Date()), []);
  const lancamentos = useMemo(() => listarLancamentosPorCiclo(meta.inicioISO, meta.fimISO), [meta.inicioISO, meta.fimISO, isFocused, refreshTick]);
  const totals = useMemo(() => sumarizarLancamentos(lancamentos), [lancamentos]);
  // Cálculo de salário foi movido para tela EstimativaSalario
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <InlineHeader title="Controle de aulas - Mensal" backColor="#000" backSize={28} />
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Estatísticas do ciclo</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statLabel}>Aulas (presenças):</Text>
          <Text style={styles.statValue}>{totals.presenca}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statLabel}>Faltas:</Text>
          <Text style={[styles.statValue, { color: '#FF3B30' }]}>{totals.falta}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statLabel}>Substituições:</Text>
          <Text style={[styles.statValue, { color: '#34C759' }]}>{totals.substituicao}</Text>
        </View>
        <View style={[styles.statsRow, { borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#eee', paddingTop: 8, marginTop: 4 }]}>
          <Text style={[styles.statLabel, { fontWeight: '700' }]}>Horas lecionadas:</Text>
          <Text style={[styles.statValue, { fontWeight: '700' }]}>{totals.horas}h</Text>
        </View>
        {/* Estimativa de salário removida da Home; acesse pelo card dedicado abaixo */}
      </View>
      <Animated.View style={[styles.grid, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
        <ActionCard icon="📅" label="Realizar preenchimento mensal" onPress={() => navigation.navigate('PreenchimentoMensal')} />
        <ActionCard icon="🔄" label="Registrar substituição" onPress={() => navigation.navigate('RegistrarSubstituicao')} />
        <ActionCard icon="👁️" label="Verificar/Exportar" onPress={() => navigation.navigate('VerificarInformacoes')} />
        <ActionCard icon="❌" label="Registrar falta" onPress={() => navigation.navigate('RegistrarFalta')} />
        <ActionCard icon="💰" label="Estimativa de salário" onPress={() => navigation.navigate('EstimativaSalario')} />
        <ActionCard icon="🗑️" label="Excluir informações" onPress={() => {
          const meta = metaCicloISO(new Date());
          Alert.alert(
            'Excluir informações',
            'Isso irá apagar todos os registros do ciclo atual. Deseja continuar?',
            [
              { text: 'Cancelar' },
              {
                text: 'Excluir', style: 'destructive', onPress: () => {
                  const count = resetLancamentosPorCiclo(meta.inicioISO, meta.fimISO);
                  setRefreshTick(x => x + 1);
                  Alert.alert('Concluído', `Registros excluídos: ${count}`);
                }
              },
            ],
          );
        }} />
      </Animated.View>
      <AppFooter />
    </View>
  );
}