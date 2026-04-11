import { maskCPF } from '../../src/utils/cpfMask';

describe('maskCPF', () => {
  it('deve mascarar CPF válido mantendo os dois últimos dígitos', () => {
    expect(maskCPF('12345678901')).toBe('***.***.***-01');
  });

  it('deve retornar máscara genérica para CPF vazio', () => {
    expect(maskCPF('')).toBe('***.***.***-**');
  });

  it('deve retornar máscara genérica para CPF com tamanho inválido', () => {
    expect(maskCPF('12345')).toBe('***.***.***-**');
  });
});
