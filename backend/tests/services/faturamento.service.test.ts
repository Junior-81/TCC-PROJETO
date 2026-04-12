import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { obterResumoFaturamento } from '../../src/services/faturamento.service';
import { buscarResumoFaturamento } from '../../src/repositories/faturamento.repository';

jest.mock('../../src/repositories/faturamento.repository', () => ({
  buscarResumoFaturamento: jest.fn()
}));

const buscarResumoFaturamentoMock = buscarResumoFaturamento as jest.MockedFunction<
  typeof buscarResumoFaturamento
>;

describe('obterResumoFaturamento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve transformar o retorno do repository para o DTO esperado', async () => {
    buscarResumoFaturamentoMock.mockResolvedValue({
      total_consultas: '10',
      total_faturado: '2000.50',
      total_ressarcido: '150.25',
      total_pendente: '300.00',
      consultas_por_convenio: [{ convenioId: 1, quantidade: 3, valorTotal: 1200 }]
    });

    const resultado = await obterResumoFaturamento(3, 2025);

    expect(resultado).toEqual({
      totalConsultas: 10,
      totalFaturado: 2000.5,
      totalRessarcido: 150.25,
      totalPendente: 300,
      consultasPorConvenio: [{ convenioId: 1, quantidade: 3, valorTotal: 1200 }]
    });
  });

  it('deve retornar estrutura vazia quando repository não encontrar dados', async () => {
    buscarResumoFaturamentoMock.mockResolvedValue(null);

    const resultado = await obterResumoFaturamento(3, 2025);

    expect(resultado).toEqual({
      totalConsultas: 0,
      totalFaturado: 0,
      totalRessarcido: 0,
      totalPendente: 0,
      consultasPorConvenio: []
    });
  });
});
