import type { Lancamento } from '../../core/types';

export type Totals = { presenca: number; falta: number; substituicao: number; horas: number };

export function sumarizarLancamentos(lancamentos: Lancamento[]): Totals {
  let presenca = 0, falta = 0, substituicao = 0;
  lancamentos.forEach(l => {
    (['manha','tarde','noite'] as const).forEach(t => {
      const s = (l as any)[t] ?? null;
      if (s === 'presenca') presenca++;
      else if (s === 'falta') falta++;
      else if (s === 'substituicao') substituicao++;
    });
  });
  const horas = (presenca + substituicao) * 5;
  return { presenca, falta, substituicao, horas };
}