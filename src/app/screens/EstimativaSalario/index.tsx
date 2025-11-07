import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import InlineHeader from '../../components/InlineHeader';
import AppFooter from '../../components/AppFooter';
import { styles } from './styles';
import { metaCicloISO } from '../../../core/ciclo';
import { listarLancamentosPorCiclo } from '../../../data/db';
import { sumarizarLancamentos } from '../../utils/lancamentos';
import { calcularLiquido, formatBRL } from '../../utils/salario';

export default function EstimativaSalario() {
  const meta = useMemo(() => metaCicloISO(new Date()), []);
  const lancamentos = useMemo(() => listarLancamentosPorCiclo(meta.inicioISO, meta.fimISO), [meta.inicioISO, meta.fimISO]);
  const totals = useMemo(() => sumarizarLancamentos(lancamentos), [lancamentos]);
  const VALOR_HORA = 48.65;
  const salario = useMemo(() => calcularLiquido(totals.horas, VALOR_HORA), [totals.horas]);

  return (
    <View style={styles.container}>
      <InlineHeader title="Estimativa de salário" backColor="#000" backSize={28} />
      <View style={styles.card}>
        <Text style={styles.title}>Resumo do período</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Horas lecionadas:</Text>
          <Text style={styles.value}>{totals.horas}h</Text>
        </View>
        <View style={[styles.row, { borderTopWidth: 0.5, borderColor: '#eee', paddingTop: 8, marginTop: 4 }]}>
          <Text style={[styles.label, { fontWeight: '700' }]}>Salário bruto:</Text>
          <Text style={[styles.value, { fontWeight: '700' }]}>{formatBRL(salario.bruto)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>INSS ({Math.round(salario.aliquotaINSS * 100)}%):</Text>
          <Text style={[styles.value, { color: '#FF9500' }]}>{formatBRL(salario.inss)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Base IRRF:</Text>
          <Text style={styles.value}>{formatBRL(salario.baseIRRF)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>IRRF ({Math.round(salario.aliquotaIRRF * 100)}%):</Text>
          <Text style={[styles.value, { color: '#FF3B30' }]}>{formatBRL(salario.irrf)}</Text>
        </View>
        <View style={[styles.row, { borderTopWidth: 0.5, borderColor: '#eee', paddingTop: 8 }]}>
          <Text style={[styles.label, { fontWeight: '700' }]}>Líquido estimado:</Text>
          <Text style={[styles.value, { fontWeight: '700', color: '#34C759' }]}>{formatBRL(salario.liquido)}</Text>
        </View>
        <Text style={styles.info}>
          Cálculo simplificado: Bruto = horas × {formatBRL(VALOR_HORA)}. INSS por faixa (7,5%/9%/12%/14%). Base IRRF = Bruto − INSS. IRRF por faixa (0%/7,5%/15%/22,5%/27,5%). Não inclui parcela a deduzir nem descontos opcionais (VT, saúde, previdência privada).
        </Text>
      </View>
      <AppFooter />
    </View>
  );
}