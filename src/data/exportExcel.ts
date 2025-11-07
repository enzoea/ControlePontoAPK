import RNFS from 'react-native-fs';
import { Platform, PermissionsAndroid } from 'react-native';
import 'dayjs/locale/pt-br';
import XLSX from 'xlsx';
import dayjs from 'dayjs';
dayjs.locale('pt-br');
import { Lancamento } from '../core/types';

function statusToCell(status: string | null | undefined, obs?: string | null | undefined): string {
  switch (status) {
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

function normalizeFileComponent(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

export async function exportCicloXLSX(
  inicioISO: string,
  fimISO: string,
  lancamentos: Lancamento[],
  nomeUsuario?: string,
): Promise<string> {
  const start = dayjs(inicioISO);
  const end = dayjs(fimISO);
  const dias: string[] = [];
  let cur = start;
  while (cur.isBefore(end) || cur.isSame(end, 'day')) {
    dias.push(cur.format('YYYY-MM-DD'));
    cur = cur.add(1, 'day');
  }

  const mapByDate = new Map<string, Lancamento>();
  lancamentos.forEach(l => mapByDate.set(l.dataISO, l));

  const rows: any[][] = [];
  rows.push(['Data', 'Manhã', 'Tarde', 'Noite']);
  dias.forEach(d => {
    const l = mapByDate.get(d);
    rows.push([
      dayjs(d).format('DD/MM/YYYY'),
      statusToCell(l?.manha ?? null, l?.observacoesManha ?? l?.observacoes),
      statusToCell(l?.tarde ?? null, l?.observacoesTarde ?? l?.observacoes),
      statusToCell(l?.noite ?? null, l?.observacoesNoite ?? l?.observacoes),
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Ciclo');

  const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const mesAtual = capitalize(dayjs().format('MMMM'));
  const baseName = nomeUsuario && nomeUsuario.trim().length > 0
    ? `${normalizeFileComponent(nomeUsuario)}-${mesAtual}`
    : `PontoProz-${mesAtual}`;
  const filename = `${baseName}.xlsx`;
  // Preferir Downloads no Android; manter DocumentDirectory no iOS.
  const androidDownloads = (RNFS as any).DownloadDirectoryPath as string | undefined;
  const targetDir = Platform.OS === 'android' && androidDownloads ? androidDownloads : RNFS.DocumentDirectoryPath;
  const preferredPath = `${targetDir}/${filename}`;

  // Em Android, solicitar permissão de escrita quando necessário (API < 29).
  if (Platform.OS === 'android') {
    try {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    } catch {}
  }

  try {
    await RNFS.writeFile(preferredPath, wbout, 'base64');
    return preferredPath;
  } catch (e) {
    // Fallback seguro para DocumentDirectory caso não seja possível escrever em Downloads.
    const fallbackPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
    await RNFS.writeFile(fallbackPath, wbout, 'base64');
    return fallbackPath;
  }
}