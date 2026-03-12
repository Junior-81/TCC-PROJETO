// ============================================================================
// TCC: Página de Paciente - Demonstração de Conformidade LGPD
// Propósito: Consumir endpoint que retorna dados com CPF mascarado
// ============================================================================

import { useState } from 'react';
import { obterPacientePorId } from '../services/api';
import { Paciente } from '../types';

export default function PacientePage() {
  const [pacienteId, setPacienteId] = useState<number>(1);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buscarPaciente = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 TCC: Buscando paciente ID ${pacienteId}...`);
      const dados = await obterPacientePorId(pacienteId);
      setPaciente(dados);
      console.log('✅ TCC: Paciente carregado com sucesso!', dados);
      console.log(`🔒 TCC: CPF mascarado recebido: ${dados.cpfMascarado}`);
    } catch (err: any) {
      console.error('❌ TCC: Erro ao buscar paciente:', err);
      setError(err.response?.data?.erro || 'Erro ao buscar paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>👤 Detalhes do Paciente</h1>
      
      <div className="tcc-note lgpd">
        <strong>🔒 TCC: Demonstração de Conformidade LGPD</strong>
        <p>
          Este componente consome um endpoint que retorna dados de paciente
          com o <strong>CPF JÁ MASCARADO</strong> pela camada de Plataforma.
          O banco armazena o CPF completo (necessário para fins administrativos),
          mas o Frontend NUNCA recebe esse dado sensível.
        </p>
        <p>
          Isso demonstra o princípio da <strong>minimização de dados</strong>
          (Art. 6º, III da LGPD) e o <strong>anonimização quando possível</strong>
          (Art. 46 da LGPD).
        </p>
      </div>

      <div className="form-group">
        <label>
          ID do Paciente:
          <input
            type="number"
            value={pacienteId}
            onChange={(e) => setPacienteId(Number(e.target.value))}
            min={1}
            max={10}
          />
        </label>

        <button onClick={buscarPaciente} disabled={loading}>
          {loading ? 'Carregando...' : 'Buscar Paciente'}
        </button>
      </div>

      {error && (
        <div className="error-box">
          <strong>❌ Erro:</strong> {error}
        </div>
      )}

      {paciente && (
        <div className="result-box">
          <h2>Informações do Paciente</h2>
          
          <div className="patient-info">
            <div className="info-row">
              <span className="info-label">ID:</span>
              <span className="info-value">{paciente.id}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Nome Completo:</span>
              <span className="info-value">{paciente.nomeCompleto}</span>
            </div>

            <div className="info-row lgpd-highlight">
              <span className="info-label">
                🔒 CPF (Mascarado - LGPD):
              </span>
              <span className="info-value cpf-masked">
                {paciente.cpfMascarado}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Data de Nascimento:</span>
              <span className="info-value">
                {new Date(paciente.dataNascimento).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Telefone:</span>
              <span className="info-value">{paciente.telefone || '-'}</span>
            </div>

            <div className="info-row">
              <span className="info-label">E-mail:</span>
              <span className="info-value">{paciente.email || '-'}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Convênio:</span>
              <span className="info-value">
                {paciente.convenioId ? `Convênio ${paciente.convenioId}` : 'Particular'}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Total de Consultas:</span>
              <span className="info-value">{paciente.totalConsultas}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Total Gasto:</span>
              <span className="info-value">
                R$ {paciente.totalGasto.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="lgpd-note">
            <strong>✅ Conformidade Garantida:</strong>
            <p>
              O CPF exibido acima foi mascarado pela camada de Plataforma
              antes de chegar a este componente. Verifique o console do navegador
              para confirmar que apenas <code>{paciente.cpfMascarado}</code> foi
              trafegado na rede (inspecione a aba Network no DevTools).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
