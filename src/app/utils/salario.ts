// Utilitários de cálculo salarial (estimativa simplificada)
// Regras informadas pelo usuário com alíquotas 2025 simplificadas

export type Breakdown = {
  bruto: number;
  inss: number;
  irrf: number;
  liquido: number;
  aliquotaINSS: number;
  aliquotaIRRF: number;
  baseIRRF: number;
};

export function calcularBruto(horas: number, valorHora: number): number {
  return round2(horas * valorHora);
}

export function calcularINSS(bruto: number): { valor: number; aliquota: number } {
  // Tabela simplificada (2025):
  // até 1518.00 -> 7.5%
  // 1518.01–2793.88 -> 9%
  // 2793.89–4190.83 -> 12%
  // 4190.84–8157.41 -> 14%
  let aliquota = 0;
  if (bruto <= 1518.0) aliquota = 0.075;
  else if (bruto <= 2793.88) aliquota = 0.09;
  else if (bruto <= 4190.83) aliquota = 0.12;
  else aliquota = 0.14;
  const valor = round2(bruto * aliquota);
  return { valor, aliquota };
}

export function calcularIRRF(baseIRRF: number): { valor: number; aliquota: number } {
  // Tabela simplificada (2025) sem parcela a deduzir
  // até 2428.80 -> isento
  // 2428.81–2826.65 -> 7.5%
  // 2826.66–3751.05 -> 15%
  // 3751.06–4664.68 -> 22.5%
  // acima de 4664.68 -> 27.5%
  let aliquota = 0;
  if (baseIRRF <= 2428.8) aliquota = 0;
  else if (baseIRRF <= 2826.65) aliquota = 0.075;
  else if (baseIRRF <= 3751.05) aliquota = 0.15;
  else if (baseIRRF <= 4664.68) aliquota = 0.225;
  else aliquota = 0.275;
  const valor = round2(baseIRRF * aliquota);
  return { valor, aliquota };
}

export function calcularLiquido(horas: number, valorHora: number, outrosDescontos = 0): Breakdown {
  const bruto = calcularBruto(horas, valorHora);
  const { valor: inss, aliquota: aliquotaINSS } = calcularINSS(bruto);
  const baseIRRF = Math.max(0, bruto - inss); // sem dependentes/deduções adicionais nesta versão
  const { valor: irrf, aliquota: aliquotaIRRF } = calcularIRRF(baseIRRF);
  const liquido = round2(bruto - inss - irrf - outrosDescontos);
  return { bruto, inss, irrf, liquido, aliquotaINSS, aliquotaIRRF, baseIRRF };
}

export function formatBRL(n: number): string {
  try {
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch {
    // Fallback simples
    const s = (Math.round(n * 100) / 100).toFixed(2).replace('.', ',');
    return `R$ ${s}`;
  }
}

function round2(n: number): number { return Math.round(n * 100) / 100; }