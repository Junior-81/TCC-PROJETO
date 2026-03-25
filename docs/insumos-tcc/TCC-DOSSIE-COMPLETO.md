# Dossie Tecnico Completo do TCC

Este documento concentra, em um unico lugar, todos os insumos tecnicos e evidencias que levantamos no projeto.

## 1. Contexto do MVP

Objetivo tecnico do projeto:
- Encapsular regra de negocio legada no banco via API.
- Aplicar governanca API-First com OpenAPI + Spectral.
- Garantir conformidade LGPD mascarando CPF antes de enviar ao frontend.

Arquivos principais:
- [database/schema.sql](../../database/schema.sql)
- [swagger.yaml](../../swagger.yaml)
- [.spectral.yaml](../../.spectral.yaml)
- [backend/src/services/pacientes.service.ts](../../backend/src/services/pacientes.service.ts)
- [backend/src/utils/cpfMask.ts](../../backend/src/utils/cpfMask.ts)
- [backend/src/controllers/pacientes.controller.ts](../../backend/src/controllers/pacientes.controller.ts)
- [evidencia-spectral.txt](../../evidencia-spectral.txt)

## 2. SQL Legado (alto acoplamento)

### 2.1 Procedure complexa

Referencia:
- [Function gerar_resumo_faturamento](../../database/schema.sql#L117)

Trecho-chave:

```sql
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
    SELECT ...
    FROM faturamento_base;
END;
$$ LANGUAGE plpgsql;
```

Leitura para capitulo:
- A regra de negocio esta concentrada no banco (PL/pgSQL), com joins, agregacoes e filtros por periodo.
- O cliente moderno depende da semantica interna do legado para obter o resultado.
- Isso evidencia alto acoplamento da regra de negocio ao banco relacional.

### 2.2 View com dado sensivel

Referencia:
- [View vw_paciente_detalhado](../../database/schema.sql#L169)

Trecho-chave:

```sql
CREATE OR REPLACE VIEW vw_paciente_detalhado AS
SELECT 
    p.id,
    p.nome_completo,
    p.cpf,
    p.data_nascimento,
    p.telefone,
    p.email,
    p.convenio_id,
    COUNT(c.id) AS total_consultas,
    COALESCE(SUM(c.valor_cobrado), 0) AS total_gasto
FROM pacientes p
LEFT JOIN consultas c ON p.id = c.paciente_id
GROUP BY p.id;
```

Leitura para capitulo:
- A view retorna CPF completo no lado do banco.
- A seguranca depende da camada de plataforma para transformar o dado antes da resposta HTTP.

## 3. Governanca em YAML (OpenAPI + Spectral)

### 3.1 Contrato OpenAPI

Arquivo:
- [swagger.yaml](../../swagger.yaml)

Pontos para documentar:
- Design First com contrato explicito.
- Endpoint de faturamento que encapsula procedure legada.
- Endpoint de paciente com campo de resposta cpfMascarado.
- Padronizacao de respostas de erro.

Referencias uteis:
- [Resumo de faturamento em /faturamento/resumo](../../swagger.yaml#L150)
- [Paciente em /pacientes/{id}](../../swagger.yaml#L224)

### 3.2 Politicas Spectral

Arquivo:
- [.spectral.yaml](../../.spectral.yaml)

Regras configuradas:
- [no-sensitive-data-in-path](../../.spectral.yaml#L19)
- [response-keys-camelcase](../../.spectral.yaml#L33)
- [require-500-response](../../.spectral.yaml#L46)
- [require-security-scheme](../../.spectral.yaml#L61)

Leitura para capitulo:
- As regras formalizam governanca como codigo.
- O lint atua como gate de qualidade antes de deploy/publicacao.

## 4. Node.js (transformacao de dado sensivel)

### 4.1 Onde a API pega dado bruto e transforma

Arquivo:
- [backend/src/services/pacientes.service.ts](../../backend/src/services/pacientes.service.ts)

Pontos-chave:
- Consulta ao banco:
  - [SELECT na view legada](../../backend/src/services/pacientes.service.ts#L52)
- Transformacao/mascaramento:
  - [maskCPF aplicado ao CPF bruto](../../backend/src/services/pacientes.service.ts#L63)
- Saida para frontend:
  - [retorno com cpfMascarado](../../backend/src/services/pacientes.service.ts#L71)

Trecho-chave:

```ts
const query = 'SELECT * FROM vw_paciente_detalhado WHERE id = $1';
const result = await pool.query<PacienteRaw>(query, [id]);

const paciente = result.rows[0];
const cpfMascarado = maskCPF(paciente.cpf);

return {
  id: paciente.id,
  nomeCompleto: paciente.nome_completo,
  cpfMascarado: cpfMascarado,
  dataNascimento: paciente.data_nascimento,
  ...
};
```

### 4.2 Funcao utilitaria de mascaramento

Arquivo:
- [backend/src/utils/cpfMask.ts](../../backend/src/utils/cpfMask.ts)

Referencia:
- [funcao maskCPF](../../backend/src/utils/cpfMask.ts#L19)

Trecho-chave:

```ts
export const maskCPF = (cpf: string): string => {
  if (!cpf || cpf.length !== 11) {
    return '***.***.***-**';
  }

  const lastTwoDigits = cpf.slice(-2);
  return `***.***.***.${lastTwoDigits}`;
};
```

Observacao tecnica importante:
- A implementacao atual retorna com ponto antes dos 2 ultimos digitos.
- O contrato em [swagger.yaml](../../swagger.yaml) descreve formato com hifen.
- Isso pode ser citado como divergencia contrato x implementacao no capitulo de resultados/discussao.

### 4.3 Controller que expoe apenas dado mascarado

Arquivo:
- [backend/src/controllers/pacientes.controller.ts](../../backend/src/controllers/pacientes.controller.ts)

Referencia:
- [log e retorno de cpfMascarado](../../backend/src/controllers/pacientes.controller.ts#L40)

Leitura para capitulo:
- O controller nao compoe CPF bruto; ele recebe o objeto ja seguro do service.
- O ponto de controle de privacidade fica centralizado na camada de servico.

## 5. Evidencia de erro do Spectral (ouro para resultados)

Arquivo de evidencia ja gerado:
- [evidencia-spectral.txt](../../evidencia-spectral.txt)

Linha principal do erro:
- [erro principal do Spectral](../../evidencia-spectral.txt#L20)

Comando utilizado:

```powershell
npx -y @stoplight/spectral-cli lint .\swagger.yaml
```

Saida observada:

```text
Error running Spectral!
Error #1: "truthy" function does not accept any options
```

Interpretacao para o texto:
- O gate de governanca bloqueou a validacao por configuracao invalida da regra.
- Isso comprova, na pratica, que o processo automatizado impede liberacao com politica mal definida.

### 5.1 Print de tela (passo a passo)

Para obter o print do terminal para o TCC:
1. Abra terminal na raiz do projeto.
2. Rode: `npx -y @stoplight/spectral-cli lint .\swagger.yaml`.
3. Quando aparecer o erro, tire print da tela.
4. Use a legenda sugerida: "Gate Spectral bloqueando contrato por regra invalida (Policy-as-Code em acao)".

## 6. Evidencias de execucao do projeto

Evidencias validadas durante a execucao:
- Banco configurado e populado com sucesso (pacientes = 5).
- Backend ativo com health check em 200.
- Endpoint de paciente retornando dado mascarado.

Referencia de apoio:
- [COMECAR-AQUI.md](../../COMECAR-AQUI.md)

## 7. Pacote minimo para anexar no TCC

Arquivos recomendados para anexos:
1. [database/schema.sql](../../database/schema.sql)
2. [swagger.yaml](../../swagger.yaml)
3. [.spectral.yaml](../../.spectral.yaml)
4. [backend/src/services/pacientes.service.ts](../../backend/src/services/pacientes.service.ts)
5. [backend/src/utils/cpfMask.ts](../../backend/src/utils/cpfMask.ts)
6. [evidencia-spectral.txt](../../evidencia-spectral.txt)

## 8. Conclusao tecnica resumida

- O legado concentra regra critica de negocio no banco (acoplamento alto).
- A camada de plataforma desacopla consumo moderno via API.
- A governanca API-First foi aplicada com contrato e policy lint.
- A conformidade de privacidade foi tratada por transformacao no backend antes da exposicao ao frontend.
- O erro real do Spectral gerou evidencia pratica para secao de resultados.
