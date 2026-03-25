// ============================================================================
// TCC: Página de Faturamento - Demonstração de Desacoplamento
// Propósito: Consumir endpoint que encapsula Stored Procedure legada
// ============================================================================

import { useState } from 'react';
import { obterResumoFaturamento } from '../services/api';
import { ResumoFaturamento } from '../types';

export default function Faturamento() {
  const [mes, setMes] = useState<number>(2);
  const [ano, setAno] = useState<number>(2025);
  const [resumo, setResumo] = useState<ResumoFaturamento | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buscarResumo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(` Buscando resumo de faturamento para ${mes}/${ano}...`);
      const dados = await obterResumoFaturamento(mes, ano);
      setResumo(dados);
      console.log(' Resumo carregado com sucesso!', dados);
    } catch (err: any) {
      console.error(' Erro ao buscar resumo:', err);
      setError(err.response?.data?.erro || 'Erro ao buscar resumo de faturamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1> Resumo de Faturamento</h1>
      
      <div className="tcc-note">
        <strong>Demonstração de Desacoplamento</strong>
        <p>
          Este componente consome um endpoint REST moderno que ENCAPSULA uma
          Stored Procedure complexa do PostgreSQL (cruza 4 tabelas, calcula
          ressarcimentos de franquia). O Frontend não sabe e não precisa saber
          dessa complexidade - isso é o desacoplamento em ação!
        </p>
      </div>

      <div className="form-group">
        <label>
          Mês:
          <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label>
          Ano:
          <input
            type="number"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            min={2020}
            max={2030}
          />
        </label>

        <button onClick={buscarResumo} disabled={loading}>
          {loading ? 'Carregando...' : 'Buscar Resumo'}
        </button>
      </div>

      {error && (
        <div className="error-box">
          <strong>❌ Erro:</strong> {error}
        </div>
      )}

      {resumo && (
        <div className="result-box">
          <h2>Resultado do Faturamento</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total de Consultas</span>
              <span className="stat-value">{resumo.totalConsultas}</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Total Faturado</span>
              <span className="stat-value">
                R$ {resumo.totalFaturado.toFixed(2)}
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Total Ressarcido</span>
              <span className="stat-value">
                R$ {resumo.totalRessarcido.toFixed(2)}
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Total Pendente</span>
              <span className="stat-value">
                R$ {resumo.totalPendente.toFixed(2)}
              </span>
            </div>
          </div>

          <h3> Por Convênio</h3>
          <table>
            <thead>
              <tr>
                <th>Convênio</th>
                <th>Quantidade</th>
                <th>Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {resumo.consultasPorConvenio.map((convenio, idx) => (
                <tr key={idx}>
                  <td>
                    {convenio.convenioId === 0 ? 'Particular' : `Convênio ${convenio.convenioId}`}
                  </td>
                  <td>{convenio.quantidade}</td>
                  <td>R$ {convenio.valorTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
