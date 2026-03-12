// ============================================================================
// TCC: Tipos TypeScript - Contratos de dados do Frontend
// Propósito: Garantir type-safety nas chamadas à API governada
// ============================================================================

/**
 * TCC Note: Interface que DEVE corresponder ao schema "ResumoFaturamento"
 * definido no swagger.yaml. Isso garante que o Frontend respeita o contrato.
 */
export interface ResumoFaturamento {
  totalConsultas: number;
  totalFaturado: number;
  totalRessarcido: number;
  totalPendente: number;
  consultasPorConvenio: ConsultaPorConvenio[];
}

export interface ConsultaPorConvenio {
  convenioId: number;
  quantidade: number;
  valorTotal: number;
}

/**
 * TCC Note: Interface que DEVE corresponder ao schema "Paciente"
 * definido no swagger.yaml. O CPF sempre chega mascarado da API.
 */
export interface Paciente {
  id: number;
  nomeCompleto: string;
  cpfMascarado: string; // TCC: Sempre mascarado pela camada de Plataforma
  dataNascimento: string;
  telefone: string | null;
  email: string | null;
  convenioId: number | null;
  totalConsultas: number;
  totalGasto: number;
}

/**
 * TCC Note: Interface de erro padronizada (schema "Erro" do swagger.yaml)
 */
export interface ApiError {
  erro: string;
  codigo: string;
  timestamp: string;
}
