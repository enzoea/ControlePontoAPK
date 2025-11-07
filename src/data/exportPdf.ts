import { PermissionsAndroid, Platform, NativeModules } from 'react-native';
import RNFS from 'react-native-fs';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { Lancamento } from '../core/types';

dayjs.locale('pt-br');

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

export async function exportCicloPDF(
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

  let presencas = 0, faltas = 0, substituicoes = 0;

  const rowsHtml = dias.map(d => {
    const l = mapByDate.get(d);
    const manhaCell = statusToCell(l?.manha ?? null, l?.observacoesManha ?? l?.observacoes);
    const tardeCell = statusToCell(l?.tarde ?? null, l?.observacoesTarde ?? l?.observacoes);
    const noiteCell = statusToCell(l?.noite ?? null, l?.observacoesNoite ?? l?.observacoes);
    const manhaStatus = l?.manha ?? null;
    const tardeStatus = l?.tarde ?? null;
    const noiteStatus = l?.noite ?? null;
    presencas += (manhaStatus === 'presenca' ? 1 : 0) + (tardeStatus === 'presenca' ? 1 : 0) + (noiteStatus === 'presenca' ? 1 : 0);
    faltas += (manhaStatus === 'falta' ? 1 : 0) + (tardeStatus === 'falta' ? 1 : 0) + (noiteStatus === 'falta' ? 1 : 0);
    substituicoes += (manhaStatus === 'substituicao' ? 1 : 0) + (tardeStatus === 'substituicao' ? 1 : 0) + (noiteStatus === 'substituicao' ? 1 : 0);
    return `<tr>
      <td>${dayjs(d).format('DD/MM/YYYY')}</td>
      <td>${manhaCell}</td>
      <td>${tardeCell}</td>
      <td>${noiteCell}</td>
    </tr>`;
  }).join('\n');

  const html = `
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; padding: 16px; }
      h1 { font-size: 18px; margin: 0 0 8px 0; }
      h2 { font-size: 14px; margin: 0 0 16px 0; color: #555; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background: #f5f5f5; }
      .totals { margin-top: 12px; display: flex; gap: 24px; font-size: 12px; }
      .section { margin-top: 18px; }
    </style>
  </head>
  <body>
    <h1>Relatório de Ciclo</h1>
    <h2>${dayjs(inicioISO).format('DD/MM/YYYY')} a ${dayjs(fimISO).format('DD/MM/YYYY')}</h2>
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Manhã</th>
          <th>Tarde</th>
          <th>Noite</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
    <div class="totals">
      <div>Total ✔️: ${presencas}</div>
      <div>Total Falta: ${faltas}</div>
      <div>Total Substituição: ${substituicoes}</div>
    </div>
    ${(() => {
      const subsEntries = lancamentos
        .filter(l => l.manha === 'substituicao' || l.tarde === 'substituicao' || l.noite === 'substituicao')
        .sort((a, b) => a.dataISO.localeCompare(b.dataISO));
      if (!subsEntries.length) return '';
      const rows = subsEntries.map(l => {
        const turnos: string[] = [];
        if (l.manha === 'substituicao') turnos.push('Manhã');
        if (l.tarde === 'substituicao') turnos.push('Tarde');
        if (l.noite === 'substituicao') turnos.push('Noite');
        const obss: string[] = [];
        if (l.observacoes) obss.push(l.observacoes);
        if (l.manha === 'substituicao' && l.observacoesManha) obss.push(l.observacoesManha);
        if (l.tarde === 'substituicao' && l.observacoesTarde) obss.push(l.observacoesTarde);
        if (l.noite === 'substituicao' && l.observacoesNoite) obss.push(l.observacoesNoite);
        const obsStr = obss.filter(s => !!s && s.trim().length > 0).join(' | ');
        return `<tr>
          <td>${dayjs(l.dataISO).format('DD/MM/YYYY')}</td>
          <td>${turnos.join(', ')}</td>
          <td>${l.substituidoPor ?? ''}</td>
          <td>${obsStr}</td>
        </tr>`;
      }).join('\n');
      return `
        <div class="section">
          <h2>Substituições</h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Substituição</th>
                <th>Professor</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    })()}
  </body>
  </html>`;

  const mesAtual = capitalize(dayjs().format('MMMM'));
  const baseName = nomeUsuario && nomeUsuario.trim().length > 0
    ? `${normalizeFileComponent(nomeUsuario)}-${mesAtual}`
    : `PontoProz-${mesAtual}`;

  // Permissão de escrita em Android <= 28.
  if (Platform.OS === 'android') {
    try { await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE); } catch {}
  }

  if (!NativeModules.HtmlToPdf) {
    throw new Error('Modulo HtmlToPdf não está registrado no binário nativo. Reinstale o app após adicionar a lib.');
  }
  const { generatePDF } = require('react-native-html-to-pdf') as { generatePDF: (opts: any) => Promise<{ filePath: string }> };
  const file = await generatePDF({ html, fileName: baseName, directory: 'Documents' });

  const srcPath = file.filePath;
  if (Platform.OS === 'android') {
    const destBase = `${normalizeFileComponent(baseName)}.pdf`;
    const destPublic = `${RNFS.DownloadDirectoryPath}/${destBase}`;
    try {
      // Remover arquivo existente com mesmo nome.
      const exists = await RNFS.exists(destPublic);
      if (exists) await RNFS.unlink(destPublic);
      await RNFS.copyFile(srcPath, destPublic);
      return destPublic;
    } catch {
      // Fallback: manter caminho do Documents (privado do app)
      return srcPath;
    }
  }
  return srcPath;
}