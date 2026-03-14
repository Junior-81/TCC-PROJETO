# Plano de Artigo Cientifico (TCC -> Publicacao)

Este plano transforma o MVP em artigo com foco cientifico, delimitacao clara de problema e evidencias reproduziveis.

## Recorte 1 (Opcao A): Seguranca e LGPD

Titulo sugerido:
Governanca de APIs no Setor de Saude: uso de Policy-as-Code para conformidade com a LGPD na exposicao de dados legados

Problema cientifico:
Como reduzir o risco de exposicao de dados sensiveis (ex.: CPF) em integracoes com legados de saude sem reescrever o sistema legado?

Hipotese:
A combinacao de API Gateway + contrato OpenAPI + lint de politicas (Spectral) reduz inconsistencias de seguranca e impede publicacao de contratos fora de conformidade.

Objetivo geral:
Avaliar a efetividade de Policy-as-Code na deteccao preventiva de nao conformidades em APIs de dados de saude.

Objetivos especificos:
1. Definir politicas de seguranca e padronizacao em regras Spectral.
2. Aplicar as politicas ao contrato OpenAPI antes da implementacao.
3. Medir evidencias de bloqueio (falhas) e conformidade (aprovacao).
4. Demonstrar mascaramento de dado sensivel no fluxo backend.

Evidencias primarias do projeto:
- [Regras de governanca](../../.spectral.yaml)
- [Contrato OpenAPI](../../swagger.yaml)
- [Erro de gate registrado](../../evidencia-spectral.txt)
- [Service com mascaramento de CPF](../../backend/src/services/pacientes.service.ts#L63)
- [Funcao de mascaramento](../../backend/src/utils/cpfMask.ts#L19)

Metricas sugeridas para o artigo:
1. Quantidade de violacoes detectadas por regra no lint.
2. Tempo medio para corrigir contrato apos falha.
3. Percentual de endpoints com resposta de erro padronizada.
4. Presenca/ausencia de campos sensiveis em payload de saida.

Ameacas a validade:
1. Estudo de caso unico (uma clinica/mvp).
2. Regras Spectral definidas pelo proprio time.
3. Ausencia de cenario com carga real de producao.

## Recorte 2 (Opcao B): Arquitetura e Modernizacao

Titulo sugerido:
Modernizacao de Sistemas Legados: implementacao do padrao Camada Anticorrupcao por meio de Plataforma de APIs API-First

Problema cientifico:
Como expor regras complexas de negocio presas no banco legado sem vazar detalhes de esquema para clientes modernos?

Hipotese:
A abordagem API-First com camada anticorrupcao reduz acoplamento entre clientes e legado, mantendo evolucao independente.

Objetivo geral:
Demonstrar que a camada de plataforma encapsula complexidade legado e entrega contrato estavel para frontend.

Objetivos especificos:
1. Encapsular procedure de faturamento em endpoint REST.
2. Mapear modelos banco (snake_case) para contrato (camelCase).
3. Isolar regras sensiveis no service da plataforma.
4. Avaliar clareza e estabilidade do contrato para consumo frontend.

Evidencias primarias do projeto:
- [Procedure complexa no legado](../../database/schema.sql#L117)
- [View agregada de paciente](../../database/schema.sql#L169)
- [Endpoint de faturamento no contrato](../../swagger.yaml#L150)
- [Service de faturamento](../../backend/src/services/faturamento.service.ts)
- [Service de paciente e transformacao](../../backend/src/services/pacientes.service.ts)

Metricas sugeridas para o artigo:
1. Numero de tabelas/joins encapsulados por endpoint.
2. Numero de transformacoes de modelo (snake_case -> camelCase).
3. Numero de alteracoes internas no legado sem quebrar contrato publico.
4. Esforco de onboarding do frontend com contrato API-First.

Ameacas a validade:
1. Quantidade limitada de endpoints no MVP.
2. Ausencia de comparacao com arquitetura alternativa.
3. Dataset sintetico e nao anonimizado real.

## Estrutura recomendada do artigo

1. Introducao
2. Fundamentacao teorica
3. Metodologia (estudo de caso)
4. Implementacao
5. Resultados e discussao
6. Ameacas a validade
7. Conclusao e trabalhos futuros

## Tabela de insumos por secao

Introducao:
- [README principal](../../README.md)

Metodologia:
- [Script de banco e objetos legados](../../database/schema.sql)
- [Contrato OpenAPI](../../swagger.yaml)
- [Politicas Spectral](../../.spectral.yaml)

Resultados:
- [Evidencia de erro do Spectral](../../evidencia-spectral.txt)
- [Fluxo de mascaramento no backend](../../backend/src/services/pacientes.service.ts#L63)

Discussao:
- [Insumos tecnicos consolidados](./README.md)

## Roteiro de figuras (prints)

1. Arquitetura em camadas (frontend -> api -> legado).
2. Lint Spectral com erro (gate de governanca).
3. Resposta de /pacientes/1 com cpfMascarado.
4. Trecho da procedure gerar_resumo_faturamento.

## Frases de contribuicao (para resumo)

1. Proposicao de um fluxo pratico de governanca API-First para saude.
2. Evidencia de prevencao de nao conformidade via Policy-as-Code.
3. Demonstracao de camada anticorrupcao entre UI moderna e SQL legado.
4. Aplicacao de mascaramento de dado sensivel no backend como controle tecnico de privacidade.
