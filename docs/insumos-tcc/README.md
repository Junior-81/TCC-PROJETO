# Insumos Tecnicos para Documentacao do TCC

Este arquivo centraliza os artefatos que voce pediu para escrever os capitulos com base tecnica e evidencias reprodutiveis.

## 1) SQL do legado (alto acoplamento)

Arquivos fonte:
- [database/schema.sql](../../database/schema.sql)
- [Procedure gerar_resumo_faturamento](../../database/schema.sql#L117)
- [View vw_paciente_detalhado](../../database/schema.sql#L169)

Trecho da Procedure complexa (acoplamento no banco):

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

Trecho da View usada pela API:

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

Leitura academica sugerida:
- A regra de negocio principal esta em PL/pgSQL e depende de JOIN + agregacoes + filtros temporais no banco.
- Isso evidencia alto acoplamento da aplicacao ao esquema relacional e a semantica do SGBD.

## 2) Governanca (OpenAPI + Spectral)

Arquivos fonte:
- [swagger.yaml](../../swagger.yaml)
- [.spectral.yaml](../../.spectral.yaml)

Regras Spectral usadas no trabalho:
- [Regra no-sensitive-data-in-path](../../.spectral.yaml#L19)
- [Regra response-keys-camelcase](../../.spectral.yaml#L33)
- [Regra require-500-response](../../.spectral.yaml#L46)
- [Regra require-security-scheme](../../.spectral.yaml#L61)

Comando de validacao:

```powershell
npx -y @stoplight/spectral-cli lint .\swagger.yaml
```

## 3) Trechos chave Node.js (dado sensivel -> dado seguro)

Arquivos fonte:
- [Service que consulta view e mascara CPF](../../backend/src/services/pacientes.service.ts#L52)
- [Ponto de mascaramento](../../backend/src/services/pacientes.service.ts#L63)
- [Utilitario de mascaramento](../../backend/src/utils/cpfMask.ts#L19)
- [Controller que retorna cpfMascarado](../../backend/src/controllers/pacientes.controller.ts#L40)

Trecho chave no service:

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

Trecho chave no utilitario:

```ts
export const maskCPF = (cpf: string): string => {
  if (!cpf || cpf.length !== 11) {
    return '***.***.***-**';
  }
  const lastTwoDigits = cpf.slice(-2);
  return `***.***.***.${lastTwoDigits}`;
};
```

Observacao importante para seu texto:
- O utilitario atualmente devolve formato com ponto antes dos digitos finais (***.***.***.01). O Swagger documenta com hifen (***.***.***-01). Isso pode ser explorado como divergencia contrato x implementacao.

## 4) Evidencia de erro Spectral (resultado)

Arquivo de evidencia gerado:
- [evidencia-spectral.txt](../../evidencia-spectral.txt)
- [Linha do erro principal](../../evidencia-spectral.txt#L20)

Erro capturado:

```text
Error running Spectral!
Error #1: "truthy" function does not accept any options
```

Interpretacao para o capitulo de resultados:
- A governanca falhou antes do deploy por configuracao invalida de regra.
- Isso comprova que o gate automatizado de qualidade bloqueia configuracoes incorretas no pipeline.

## 5) Como gerar o print que voce pediu

Passos:
1. Abra um terminal na raiz do projeto.
2. Execute: npx -y @stoplight/spectral-cli lint .\swagger.yaml
3. Quando aparecer o erro, tire print da tela do terminal.
4. Salve no TCC como evidencia visual do gate de governanca.

Sugestao de legenda:
- "Figura X - Gate Spectral bloqueando contrato por regra invalida (Policy-as-Code em acao)".

## 6) Regra de trabalho combinada para os proximos passos

A partir de agora, sempre que eu validar ou documentar algo novo, vou criar/atualizar um README em docs/insumos-tcc com:
- contexto tecnico,
- comando executado,
- resultado observado,
- links para os arquivos e linhas usadas no texto academico.

## 7) Topicos de Ouro para o artigo cientifico

Voce tem dois recortes muito fortes para publicacao:

### Opcao A (Seguranca e LGPD)

Titulo sugerido:
Governanca de APIs no Setor de Saude: uso de Policy-as-Code para conformidade com a LGPD na exposicao de dados legados

Evidencias principais para essa opcao:
- [Politicas de governanca](../../.spectral.yaml)
- [Contrato API-First](../../swagger.yaml)
- [Evidencia de bloqueio no gate](../../evidencia-spectral.txt)
- [Mascaramento no service](../../backend/src/services/pacientes.service.ts#L63)
- [Funcao de mascara](../../backend/src/utils/cpfMask.ts#L19)

### Opcao B (Arquitetura e modernizacao)

Titulo sugerido:
Modernizacao de Sistemas Legados: implementacao do padrao Camada Anticorrupcao por meio de Plataforma de APIs API-First

Evidencias principais para essa opcao:
- [Procedure complexa no banco](../../database/schema.sql#L117)
- [View legada agregada](../../database/schema.sql#L169)
- [Contrato do endpoint de faturamento](../../swagger.yaml#L150)
- [Service de faturamento](../../backend/src/services/faturamento.service.ts)
- [Service de paciente (adaptacao de modelo)](../../backend/src/services/pacientes.service.ts)

Material completo de escrita:
- [Plano completo do artigo](./ARTIGO-CIENTIFICO-PLANO.md)

## 8) Como subir para branch sem node_modules

Arquivo aplicado para isso:
- [.gitignore](../../.gitignore)

Checklist:
1. Verificar status: git status
2. Criar branch: git checkout -b docs/tcc-insumos
3. Adicionar somente o necessario:
  - git add .gitignore
  - git add docs/insumos-tcc/README.md
  - git add docs/insumos-tcc/ARTIGO-CIENTIFICO-PLANO.md
  - git add evidencia-spectral.txt
  - git add backend/package-lock.json frontend/package-lock.json
4. Conferir staged: git diff --cached --name-only
5. Commit: git commit -m "docs: consolidar insumos do TCC e plano de artigo"
6. Push: git push -u origin docs/tcc-insumos

Resultado esperado:
- node_modules nao entra no push.
- .env nao entra no push.
- sobe apenas codigo, docs e evidencias relevantes do TCC.
