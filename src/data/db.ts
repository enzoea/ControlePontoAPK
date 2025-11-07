import Realm from 'realm';
import dayjs from 'dayjs';
import { Lancamento, StatusTurno, Turno, MetaCicloISO } from '../core/types';

const LancamentoSchema: Realm.ObjectSchema = {
  name: 'Lancamento',
  primaryKey: 'id',
  properties: {
    id: 'string',
    dataISO: 'string',
    cicloInicioISO: 'string',
    cicloFimISO: 'string',
    manha: 'string?',
    tarde: 'string?',
    noite: 'string?',
    substituidoPor: 'string?',
    observacoes: 'string?',
    observacoesManha: 'string?',
    observacoesTarde: 'string?',
    observacoesNoite: 'string?',
    createdAt: 'int',
    updatedAt: 'int',
  },
};

let realmInstance: Realm | null = null;

export function getRealm(): Realm {
  if (!realmInstance) {
    realmInstance = new Realm({
      schema: [LancamentoSchema],
      schemaVersion: 1,
      onMigration: (oldRealm: Realm, newRealm: Realm) => {
        // Add defaults for new optional fields when migrating from older schema
        const oldVersion = (oldRealm as any).schemaVersion ?? 0;
        if (oldVersion < 1) {
          const news = newRealm.objects('Lancamento') as any;
          for (let i = 0; i < news.length; i++) {
            const obj = news[i];
            if (obj.observacoesManha === undefined) obj.observacoesManha = null;
            if (obj.observacoesTarde === undefined) obj.observacoesTarde = null;
            if (obj.observacoesNoite === undefined) obj.observacoesNoite = null;
          }
        }
      },
    });
  }
  return realmInstance;
}

export function findLancamentoByDataISO(dataISO: string): Lancamento | null {
  const realm = getRealm();
  const res = realm.objects('Lancamento').filtered('dataISO == $0', dataISO)[0] as unknown as Realm.Object | undefined;
  return res ? (JSON.parse(JSON.stringify(res)) as Lancamento) : null;
}

type UpsertInput = Omit<Lancamento, 'id' | 'createdAt' | 'updatedAt'> | (Partial<Lancamento> & { dataISO: string });

export function upsertLancamento(input: UpsertInput): Lancamento {
  const realm = getRealm();
  let output: Lancamento | null = null;
  realm.write(() => {
    const existing = realm.objects('Lancamento').filtered('dataISO == $0', input.dataISO)[0] as any;
    if (!existing) {
      const now = Date.now();
      const created = realm.create('Lancamento', {
        id: new (Realm as any).BSON.UUID().toString(),
        dataISO: input.dataISO,
        cicloInicioISO: (input as any).cicloInicioISO,
        cicloFimISO: (input as any).cicloFimISO,
        manha: (input as any).manha ?? null,
        tarde: (input as any).tarde ?? null,
        noite: (input as any).noite ?? null,
        substituidoPor: (input as any).substituidoPor ?? null,
        observacoes: (input as any).observacoes ?? null,
        observacoesManha: (input as any).observacoesManha ?? null,
        observacoesTarde: (input as any).observacoesTarde ?? null,
        observacoesNoite: (input as any).observacoesNoite ?? null,
        createdAt: now,
        updatedAt: now,
      });
      output = JSON.parse(JSON.stringify(created)) as Lancamento;
    } else {
      // update only provided fields
      if ((input as any).cicloInicioISO) existing.cicloInicioISO = (input as any).cicloInicioISO;
      if ((input as any).cicloFimISO) existing.cicloFimISO = (input as any).cicloFimISO;
      // Não sobrescrever com null: apenas atualizar campos explicitamente definidos e não nulos
      if ((input as any).manha !== undefined && (input as any).manha !== null) (existing as any).manha = (input as any).manha;
      if ((input as any).tarde !== undefined && (input as any).tarde !== null) (existing as any).tarde = (input as any).tarde;
      if ((input as any).noite !== undefined && (input as any).noite !== null) (existing as any).noite = (input as any).noite;
      if ((input as any).substituidoPor !== undefined && (input as any).substituidoPor !== null) (existing as any).substituidoPor = (input as any).substituidoPor;
      if ((input as any).observacoes !== undefined && (input as any).observacoes !== null) (existing as any).observacoes = (input as any).observacoes;
      if ((input as any).observacoesManha !== undefined && (input as any).observacoesManha !== null) (existing as any).observacoesManha = (input as any).observacoesManha;
      if ((input as any).observacoesTarde !== undefined && (input as any).observacoesTarde !== null) (existing as any).observacoesTarde = (input as any).observacoesTarde;
      if ((input as any).observacoesNoite !== undefined && (input as any).observacoesNoite !== null) (existing as any).observacoesNoite = (input as any).observacoesNoite;
      (existing as any).updatedAt = Date.now();
      output = JSON.parse(JSON.stringify(existing)) as Lancamento;
    }
  });
  return output!;
}

export function listarLancamentosPorCiclo(inicioISO: string, fimISO: string): Lancamento[] {
  const realm = getRealm();
  const res = realm
    .objects('Lancamento')
    .filtered('dataISO >= $0 AND dataISO <= $1', inicioISO, fimISO) as any;
  return Array.from(res as any[]).map((r: any) => JSON.parse(JSON.stringify(r)) as Lancamento);
}

export function resetLancamentosPorCiclo(inicioISO: string, fimISO: string): number {
  const realm = getRealm();
  let deleted = 0;
  realm.write(() => {
    const toDelete = realm
      .objects('Lancamento')
      .filtered('dataISO >= $0 AND dataISO <= $1', inicioISO, fimISO) as any;
    deleted = (toDelete as any).length ?? 0;
    realm.delete(toDelete as any);
  });
  return deleted;
}

// Limpa apenas os registros de um tipo específico (presenca, falta, substituicao) dentro do ciclo.
// Retorna a quantidade de turnos afetados.
export function resetStatusPorTipoNoCiclo(
  inicioISO: string,
  fimISO: string,
  tipo: Exclude<StatusTurno, null>
): number {
  const realm = getRealm();
  let cleared = 0;
  realm.write(() => {
    const registros = realm
      .objects('Lancamento')
      .filtered('dataISO >= $0 AND dataISO <= $1', inicioISO, fimISO) as any;
    const toDelete: any[] = [];
    (registros as any[]).forEach((r: any) => {
      let anyChanged = false;
      (['manha', 'tarde', 'noite'] as const).forEach((t) => {
        if (r[t] === tipo) {
          r[t] = null;
          cleared++;
          anyChanged = true;
          // Remover observações por turno quando limpar presenças
          if (tipo === 'presenca') {
            if (t === 'manha') r.observacoesManha = null;
            if (t === 'tarde') r.observacoesTarde = null;
            if (t === 'noite') r.observacoesNoite = null;
          }
        }
      });

      // Se nenhuma substituicao restar, limpar dados gerais relacionados
      if (
        tipo === 'substituicao' &&
        r.manha !== 'substituicao' && r.tarde !== 'substituicao' && r.noite !== 'substituicao'
      ) {
        r.substituidoPor = null;
        r.observacoes = null;
      }

      // Se o registro ficar vazio (sem status em nenhum turno), remover para manter o BD limpo
      const hasAnyStatus = !!(r.manha || r.tarde || r.noite);
      if (!hasAnyStatus) {
        // limpar quaisquer observações remanescentes
        r.substituidoPor = null;
        r.observacoes = null;
        r.observacoesManha = null;
        r.observacoesTarde = null;
        r.observacoesNoite = null;
        toDelete.push(r);
      } else if (anyChanged) {
        r.updatedAt = Date.now();
      }
    });
    if (toDelete.length) {
      realm.delete(toDelete);
    }
  });
  return cleared;
}

function isWeekend(dateISO: string): boolean {
  const d = dayjs(dateISO);
  const dow = d.day();
  return dow === 0 || dow === 6; // domingo (0) ou sábado (6)
}

export function aplicarPresencas(
  diasISO: string[],
  turnos: Turno[],
  metaCiclo: MetaCicloISO,
  opts?: { observacoes?: string; observacoesPorTurno?: { manha?: string; tarde?: string; noite?: string } }
) {
  diasISO.forEach(dataISO => {
    // regra: não aplicar em sábados ou domingos
    if (isWeekend(dataISO)) return;
    const base: Omit<Lancamento, 'id' | 'createdAt' | 'updatedAt'> = {
      dataISO,
      cicloInicioISO: metaCiclo.inicioISO,
      cicloFimISO: metaCiclo.fimISO,
      manha: null,
      tarde: null,
      noite: null,
    };
    let lanc = upsertLancamento(base);
    turnos.forEach(t => {
      if (!lanc[t]) {
        (lanc as any)[t] = 'presenca';
      }
    });
    if (opts?.observacoes) (lanc as any).observacoes = opts.observacoes;
    if (opts?.observacoesPorTurno) {
      const o = opts.observacoesPorTurno;
      if (turnos.includes('manha') && o.manha !== undefined) (lanc as any).observacoesManha = o.manha;
      if (turnos.includes('tarde') && o.tarde !== undefined) (lanc as any).observacoesTarde = o.tarde;
      if (turnos.includes('noite') && o.noite !== undefined) (lanc as any).observacoesNoite = o.noite;
    }
    upsertLancamento(lanc);
  });
}

export function aplicarStatus(
  diasISO: string[],
  turnos: Turno[],
  status: Exclude<StatusTurno, null>,
  metaCiclo: MetaCicloISO,
  opts?: { override?: boolean; substituidoPor?: string; observacoes?: string; observacoesPorTurno?: { manha?: string; tarde?: string; noite?: string } }
) {
  diasISO.forEach(dataISO => {
    // regra: não aplicar em sábados ou domingos
    if (isWeekend(dataISO)) return;
    const base: Omit<Lancamento, 'id' | 'createdAt' | 'updatedAt'> = {
      dataISO,
      cicloInicioISO: metaCiclo.inicioISO,
      cicloFimISO: metaCiclo.fimISO,
      manha: null,
      tarde: null,
      noite: null,
      substituidoPor: opts?.substituidoPor,
      observacoes: opts?.observacoes,
    } as any;
    let lanc = upsertLancamento(base);
    turnos.forEach(t => {
      const cur = lanc[t];
      if (cur === null || opts?.override) {
        (lanc as any)[t] = status;
      }
    });
    if (opts?.observacoesPorTurno) {
      const o = opts.observacoesPorTurno;
      if (turnos.includes('manha') && o.manha !== undefined) (lanc as any).observacoesManha = o.manha;
      if (turnos.includes('tarde') && o.tarde !== undefined) (lanc as any).observacoesTarde = o.tarde;
      if (turnos.includes('noite') && o.noite !== undefined) (lanc as any).observacoesNoite = o.noite;
    }
    upsertLancamento(lanc);
  });
}