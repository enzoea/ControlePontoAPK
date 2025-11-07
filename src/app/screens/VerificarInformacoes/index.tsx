import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, TextInput, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { metaCicloISO } from '../../../core/ciclo';
import { listarLancamentosPorCiclo } from '../../../data/db';
import TabelaCiclo from '../../components/TabelaCiclo';
import { exportCicloPDF } from '../../../data/exportPdf';
import { exportCicloXLSX } from '../../../data/exportExcel';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import InlineHeader from '../../components/InlineHeader';
import AppButton from '../../components/AppButton';
import AppFooter from '../../components/AppFooter';
import { styles } from './styles';

export default function VerificarInformacoes() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const meta = metaCicloISO(new Date());
  const [refreshTick, setRefreshTick] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [saving, setSaving] = useState(false);

  const lancamentos = useMemo(() => listarLancamentosPorCiclo(meta.inicioISO, meta.fimISO), [refreshTick, meta.inicioISO, meta.fimISO]);

  const substituicoes = useMemo(() => {
    const items: { dataISO: string; turnos: string[]; substituidoPor?: string; observacoes?: string }[] = [];
    lancamentos.forEach(l => {
      const turnos: string[] = [];
      if (l.manha === 'substituicao') turnos.push('Manhã');
      if (l.tarde === 'substituicao') turnos.push('Tarde');
      if (l.noite === 'substituicao') turnos.push('Noite');
      if (turnos.length) {
        const obss: string[] = [];
        if (l.observacoes) obss.push(l.observacoes);
        if (l.manha === 'substituicao' && l.observacoesManha) obss.push(l.observacoesManha);
        if (l.tarde === 'substituicao' && l.observacoesTarde) obss.push(l.observacoesTarde);
        if (l.noite === 'substituicao' && l.observacoesNoite) obss.push(l.observacoesNoite);
        const obsStr = obss.filter(s => !!s && s.trim().length > 0).join(' | ') || undefined;
        items.push({ dataISO: l.dataISO, turnos, substituidoPor: l.substituidoPor ?? undefined, observacoes: obsStr });
      }
    });
    return items.sort((a, b) => a.dataISO.localeCompare(b.dataISO));
  }, [lancamentos]);

  async function confirmarExportacao() {
    if (!nomeUsuario.trim().length) {
      Alert.alert('Informe seu nome', 'Digite seu nome para nomear o arquivo.');
      return;
    }
    try {
      setSaving(true);
      const path = await exportCicloPDF(meta.inicioISO, meta.fimISO, lancamentos, nomeUsuario.trim());
      setModalVisible(false);
      Alert.alert('Exportado', `Arquivo salvo em: ${path}`);
    } catch (e: any) {
      Alert.alert(
        'Erro',
        e?.message ?? 'Falha ao exportar',
        [
          {
            text: 'Exportar Excel',
            onPress: async () => {
              try {
                setSaving(true);
                const xlsPath = await exportCicloXLSX(meta.inicioISO, meta.fimISO, lancamentos, nomeUsuario.trim());
                setModalVisible(false);
                Alert.alert('Exportado (Excel)', `Arquivo salvo em: ${xlsPath}`);
              } catch (err: any) {
                Alert.alert('Erro', err?.message ?? 'Falha ao exportar Excel');
              } finally {
                setSaving(false);
              }
            },
          },
          { text: 'OK' },
        ],
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <InlineHeader title="Verificar informações" backColor="#000" backSize={28} />
      <View style={{ flex: 1 }}>
        {/* Sem edição: não passar onEdit para ocultar a coluna Ação */}
        <TabelaCiclo inicioISO={meta.inicioISO} fimISO={meta.fimISO} lancamentos={lancamentos} />
      </View>
      {substituicoes.length > 0 && (
        <>
          <Text style={styles.subsTitle}>Substituições</Text>
          <View style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: '#ddd', borderRadius: 8 }}>
            <View style={styles.subsHeader}>
              <Text style={[styles.subsCell, styles.subsHeadCell]}>Data</Text>
              <Text style={[styles.subsCell, styles.subsHeadCell]}>Substituição</Text>
              <Text style={[styles.subsCell, styles.subsHeadCell]}>Professor</Text>
              <Text style={[styles.subsCell, styles.subsHeadCell]}>Observações</Text>
            </View>
            {substituicoes.map((s) => (
              <View key={s.dataISO} style={styles.subsRow}>
                <Text style={styles.subsCell}>{dayjs(s.dataISO).format('DD/MM/YYYY')}</Text>
                <Text style={styles.subsCell}>{s.turnos.join(', ')}</Text>
                <Text style={styles.subsCell}>{s.substituidoPor ?? '-'}</Text>
                <Text style={styles.subsCell}>{s.observacoes ?? '-'}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      <AppButton label="Exportar PDF" onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Digite seu nome</Text>
            <TextInput
              placeholder="Ex.: Enzo Martins"
              value={nomeUsuario}
              onChangeText={setNomeUsuario}
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)} disabled={saving}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <AppButton style={{ flex: 1 }} label={saving ? 'Exportando...' : 'Exportar'} onPress={confirmarExportacao} disabled={saving} />
            </View>
          </View>
        </View>
      </Modal>
      <AppFooter />
    </View>
  );
}