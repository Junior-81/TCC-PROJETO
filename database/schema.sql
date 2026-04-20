-- ============================================================================
-- TCC: Engenharia de Plataforma para Sistemas Médicos Legados
-- Autor: [Seu Nome]
-- Data: Março/2026
-- ============================================================================
-- TESE: Este script simula um banco de dados legado onde TODA a inteligência
-- de negócio está concentrada em Stored Procedures. A complexidade do
-- faturamento médico (cruzamento de convênios, franquias, ressarcimento)
-- justifica a necessidade de uma camada de Plataforma para desacoplamento.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- TABELA 1: Convênios
-- TCC Note: Tabela de convênios com cobertura e franquia para compor faturamento.
-- -----------------------------------------------------------------------------
CREATE TABLE convenios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    percentual_cobertura DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    valor_franquia DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- TABELA 2: Pacientes
-- TCC Note: Armazena dados sensíveis (CPF) que DEVEM ser mascarados pela
-- camada de Plataforma antes de chegarem ao Frontend (conformidade LGPD).
-- -----------------------------------------------------------------------------
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE, -- TCC: Dado sensível (Art. 5º, II da LGPD)
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(15),
    email VARCHAR(255),
    endereco TEXT,
    convenio_id INTEGER, -- NULL = Particular
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (convenio_id) REFERENCES convenios(id)
);

-- -----------------------------------------------------------------------------
-- TABELA 3: Médicos
-- TCC Note: Mantém a rastreabilidade dos profissionais para auditoria.
-- -----------------------------------------------------------------------------
CREATE TABLE medicos (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    crm VARCHAR(20) NOT NULL UNIQUE,
    especialidade VARCHAR(100) NOT NULL,
    valor_consulta_particular DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- TABELA 4: Consultas
-- TCC Note: Registro de cada atendimento. Esta tabela será o coração do JOIN
-- complexo na Procedure de faturamento.
-- -----------------------------------------------------------------------------
CREATE TABLE consultas (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
    medico_id INTEGER NOT NULL REFERENCES medicos(id),
    data_consulta TIMESTAMP NOT NULL,
    tipo_atendimento VARCHAR(50) NOT NULL, -- 'consulta', 'retorno', 'exame'
    valor_cobrado DECIMAL(10, 2) NOT NULL,
    status_pagamento VARCHAR(20) DEFAULT 'pendente', -- 'pendente', 'pago', 'cancelado'
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- TABELA 5: Eventos_Faturamento
-- TCC Note: Log de eventos financeiros complexos como ressarcimento de franquia.
-- Esta tabela demonstra a REAL complexidade de sistemas médicos legados.
-- -----------------------------------------------------------------------------
CREATE TABLE eventos_faturamento (
    id SERIAL PRIMARY KEY,
    consulta_id INTEGER NOT NULL REFERENCES consultas(id),
    tipo_evento VARCHAR(50) NOT NULL, -- 'faturado', 'ressarcido', 'glosa', 'estornado'
    valor_evento DECIMAL(10, 2) NOT NULL,
    descricao TEXT,
    processado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DADOS MOCKADOS (DML)
-- TCC Note: Dados realistas para simular um mês de operação de uma clínica.
-- ============================================================================

-- Inserir Convênios
INSERT INTO convenios (nome, percentual_cobertura, valor_franquia) VALUES
('Unimed', 80.00, 300.00),
('Bradesco Saúde', 70.00, 200.00);

-- Inserir Pacientes (mix de convênio e particular)
INSERT INTO pacientes (nome_completo, cpf, data_nascimento, telefone, email, convenio_id) VALUES
('Maria Silva Santos', '12345678901', '1985-03-15', '11987654321', 'maria.silva@email.com', 1),
('João Pedro Oliveira', '98765432100', '1990-07-22', '11876543210', 'joao.pedro@email.com', 1),
('Ana Costa Lima', '45678912345', '1978-11-30', '11765432109', 'ana.costa@email.com', NULL), -- Particular
('Carlos Eduardo Souza', '78912345678', '1995-05-10', '11654321098', 'carlos.souza@email.com', 2),
('Fernanda Almeida', '32165498712', '1988-09-18', '11543210987', 'fernanda.almeida@email.com', 1);

-- Inserir Médicos
INSERT INTO medicos (nome_completo, crm, especialidade, valor_consulta_particular) VALUES
('Dr. Roberto Cardoso', 'CRM/SP 123456', 'Cardiologia', 450.00),
('Dra. Juliana Mendes', 'CRM/SP 654321', 'Dermatologia', 380.00),
('Dr. Paulo Henrique', 'CRM/SP 111222', 'Ortopedia', 500.00);

-- Inserir Consultas (últimos 30 dias)
INSERT INTO consultas (paciente_id, medico_id, data_consulta, tipo_atendimento, valor_cobrado, status_pagamento) VALUES
(1, 1, '2025-02-15 09:00:00', 'consulta', 450.00, 'pago'),
(1, 1, '2025-02-28 10:30:00', 'retorno', 200.00, 'pago'),
(2, 2, '2025-02-20 14:00:00', 'consulta', 380.00, 'pendente'),
(3, 3, '2025-02-25 16:00:00', 'consulta', 500.00, 'pago'), -- Particular
(4, 1, '2025-03-01 11:00:00', 'exame', 650.00, 'pendente'),
(5, 2, '2025-03-05 15:30:00', 'consulta', 380.00, 'pago');

-- Inserir Eventos de Faturamento (simulando ressarcimento de franquia)
-- TCC Note: O convênio 1 tem franquia de R$ 300. Valores acima disso são ressarcidos.
INSERT INTO eventos_faturamento (consulta_id, tipo_evento, valor_evento, descricao) VALUES
(1, 'faturado', 450.00, 'Consulta cardiológica faturada ao convênio'),
(1, 'ressarcido', 150.00, 'Franquia paciente: R$ 300. Ressarcimento: R$ 150'),
(2, 'faturado', 200.00, 'Retorno dentro da franquia - sem ressarcimento'),
(4, 'faturado', 500.00, 'Paciente particular - pagamento direto'),
(6, 'faturado', 380.00, 'Consulta dermatológica - dentro da franquia');

-- ============================================================================
-- STORED PROCEDURE: Capa de Fatura Consolidada
-- TCC Note: Esta Procedure simula a REGRA DE NEGÓCIO LEGADA que roda no banco.
-- Ela cruza 4 tabelas, aplica regras de franquia e calcula ressarcimentos.
-- A API Node.js vai consumir esta Procedure de forma BLINDADA (sem expor SQL).
-- ============================================================================

CREATE OR REPLACE FUNCTION gerar_resumo_faturamento(
    p_mes INTEGER,
    p_ano INTEGER
)
RETURNS TABLE (
    total_consultas BIGINT,
    total_faturado NUMERIC,
    total_ressarcido NUMERIC,
    total_pendente NUMERIC,
    consultas_por_convenio JSONB
) AS $$
BEGIN
    -- TCC Note: Esta query demonstra a complexidade típica de sistemas legados.
    -- Ela agrega dados de múltiplas tabelas e aplica lógica de domínio complexa.
    
    RETURN QUERY
    WITH faturamento_base AS (
        SELECT 
            c.id AS consulta_id,
            c.valor_cobrado,
            c.status_pagamento,
            p.convenio_id,
            COALESCE(SUM(ef.valor_evento) FILTER (WHERE ef.tipo_evento = 'ressarcido'), 0) AS valor_ressarcido
        FROM consultas c
        INNER JOIN pacientes p ON c.paciente_id = p.id
        LEFT JOIN eventos_faturamento ef ON c.id = ef.consulta_id
        WHERE EXTRACT(MONTH FROM c.data_consulta) = p_mes
          AND EXTRACT(YEAR FROM c.data_consulta) = p_ano
        GROUP BY c.id, c.valor_cobrado, c.status_pagamento, p.convenio_id
    )
    SELECT 
        (SELECT COUNT(*)::BIGINT FROM faturamento_base) AS total_consultas,
        (SELECT COALESCE(SUM(valor_cobrado), 0)::NUMERIC FROM faturamento_base) AS total_faturado,
        (SELECT COALESCE(SUM(valor_ressarcido), 0)::NUMERIC FROM faturamento_base) AS total_ressarcido,
        (
            SELECT COALESCE(
                SUM(CASE WHEN status_pagamento = 'pendente' THEN valor_cobrado ELSE 0 END),
                0
            )::NUMERIC
            FROM faturamento_base
        ) AS total_pendente,
        (
            SELECT COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'convenio_id', COALESCE(convenio_agg.convenio_id, 0),
                        'quantidade', convenio_agg.quantidade,
                        'valor_total', convenio_agg.valor_total
                    )
                ),
                '[]'::jsonb
            )
            FROM (
                SELECT
                    convenio_id,
                    COUNT(*) AS quantidade,
                    SUM(valor_cobrado)::NUMERIC AS valor_total
                FROM faturamento_base
                GROUP BY convenio_id
            ) AS convenio_agg
        ) AS consultas_por_convenio;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEW AUXILIAR: Detalhes de Paciente (com CPF exposto)
-- TCC Note: Esta view será consumida pela API, mas a camada de Plataforma
-- DEVE mascarar o CPF antes de enviar ao Frontend. Isso prova a conformidade.
-- ============================================================================

CREATE OR REPLACE VIEW vw_paciente_detalhado AS
SELECT 
    p.id,
    p.nome_completo,
    p.cpf, -- TCC: Exposto aqui, mas mascarado na API (Art. 46 da LGPD)
    p.data_nascimento,
    p.telefone,
    p.email,
    p.convenio_id,
    cv.nome AS nome_convenio,
    COUNT(c.id) AS total_consultas,
    COALESCE(SUM(c.valor_cobrado), 0) AS total_gasto
FROM pacientes p
LEFT JOIN convenios cv ON p.convenio_id = cv.id
LEFT JOIN consultas c ON p.id = c.paciente_id
GROUP BY p.id, cv.nome;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
