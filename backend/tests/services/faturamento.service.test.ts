import { obterResumoFaturamento } from '../../src/services/faturamento.service';
import { buscarResumoFaturamento } from '../../src/repositories/faturamento.repository';

jest.mock('../../src/repositories/faturamento.repository', () => ({
  buscarResumoFaturamento: jest.fn()
}));

const mockedBuscarResumoFaturamento = buscarResumoFaturamento as jest.MockedFunction<typeof buscarResumoFaturamento>;

describe('obterResumoFaturamento', () => {
  it('deve retornar objeto com as chaves esperadas', async () => {
    mockedBuscarResumoFaturamento.mockResolvedValue({
      total_consultas: '2',
      total_faturado: '150.50',
      total_ressarcido: '20.00',
      total_pendente: '30.00',
      consultas_por_convenio: [{ convenio_id: 1, quantidade: 2, valor_total: 150.5 }]
    });

    const resultado = await obterResumoFaturamento(2, 2025);

    expect(resultado).toHaveProperty('totalConsultas');
    expect(resultado).toHaveProperty('totalFaturado');
    expect(resultado).toHaveProperty('totalRessarcido');
    expect(resultado).toHaveProperty('totalPendente');
    expect(resultado).toHaveProperty('consultasPorConvenio');
  });

  it('deve retornar estrutura vazia quando repository não encontrar linhas', async () => {
    mockedBuscarResumoFaturamento.mockResolvedValue(null);

    const resultado = await obterResumoFaturamento(2, 2025);

    expect(resultado).toEqual({
      totalConsultas: 0,
      totalFaturado: 0,
      totalRessarcido: 0,
      totalPendente: 0,
      consultasPorConvenio: []
    });
  });
});
