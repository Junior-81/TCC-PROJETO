import { maskCPF } from '../../src/utils/cpfMask';

describe('maskCPF', () => {
  it('deve mascarar CPF válido', () => {
    expect(maskCPF('12345678901')).toBe('***.***.***.01');
  });

  it('deve retornar máscara genérica para CPF inválido', () => {
    expect(maskCPF('abc')).toBe('***.***.***-**');
  });

  it('deve retornar máscara genérica para CPF vazio', () => {
    expect(maskCPF('')).toBe('***.***.***-**');
  });

  it('deve retornar máscara genérica para CPF com menos de 11 dígitos', () => {
    expect(maskCPF('1234567890')).toBe('***.***.***-**');
  });
});
