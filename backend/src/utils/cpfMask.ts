// ============================================================================
// TCC: Utilitário de Mascaramento de CPF (Conformidade LGPD)
// Propósito: Ocultar dados sensíveis antes de retornar ao Frontend
// ============================================================================

/**
 * TCC Note: Mascara um CPF segundo as diretrizes da LGPD (Art. 46)
 * 
 * Este é o ponto CRÍTICO da conformidade com LGPD no projeto.
 * O banco de dados armazena o CPF completo (para fins administrativos),
 * mas a camada de Plataforma NUNCA expõe esse dado ao Frontend.
 * 
 * @param cpf - CPF no formato "12345678901" (11 dígitos)
 * @returns CPF mascarado no formato "***.***.***-01"
 * 
 * @example
 * maskCPF('12345678901') // Retorna: '***.***.***-01'
 */
export const maskCPF = (cpf: string): string => {
  if (!cpf || cpf.length !== 11) {
    // TCC Note: Se o CPF for inválido, retorna string mascarada genérica
    return '***.***.***-**';
  }

  // TCC Note: Mantém visíveis apenas os 2 últimos dígitos (verificadores)
  const lastTwoDigits = cpf.slice(-2);
  
  // TCC Note: Formato padrão brasileiro: XXX.XXX.XXX-YY
  return `***.***.***.${lastTwoDigits}`;
};

/**
 * TCC Note: Remove formatação de CPF (mantém apenas números)
 * Útil para validações futuras
 * 
 * @param cpf - CPF formatado "123.456.789-01"
 * @returns CPF sem formatação "12345678901"
 */
export const unmaskCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};
