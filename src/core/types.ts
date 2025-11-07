export type Turno = 'manha' | 'tarde' | 'noite';
export type StatusTurno = 'presenca' | 'falta' | 'substituicao' | null;

export type Lancamento = {
  id: string; // uuid
  dataISO: string; // YYYY-MM-DD
  cicloInicioISO: string; // YYYY-MM-DD
  cicloFimISO: string; // YYYY-MM-DD

  manha: StatusTurno;
  tarde: StatusTurno;
  noite: StatusTurno;

  substituidoPor?: string;
  observacoes?: string; // observação geral (legado)
  observacoesManha?: string; // observação/turma específica do turno
  observacoesTarde?: string;
  observacoesNoite?: string;
  createdAt: number;
  updatedAt: number;
};

export type MetaCicloISO = { inicioISO: string; fimISO: string };