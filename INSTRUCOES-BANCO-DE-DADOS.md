# 🗄️ INSTRUÇÕES - CONFIGURAÇÃO DO BANCO DE DADOS

## 📌 SOFTWARE RECOMENDADO: PostgreSQL 15+

### Por que PostgreSQL?
- ✅ **Open Source** (gratuito para uso acadêmico)
- ✅ **Suporte robusto a PL/pgSQL** (essencial para as Stored Procedures)
- ✅ **Amplamente usado em HealthTech** (contexto real do TCC)
- ✅ **Ferramentas visuais gratuitas** (pgAdmin, DBeaver)

---

## 🔧 PASSO A PASSO - INSTALAÇÃO

### 1️⃣ Instalar PostgreSQL

**Opção A - Windows (Recomendado para desenvolvimento):**
```bash
# Baixar instalador oficial:
https://www.postgresql.org/download/windows/

# Durante a instalação:
- Porta: 5432 (padrão)
- Password do usuário postgres: anote essa senha!
- Instalar pgAdmin 4 (incluído no instalador)
```

**Opção B - Docker (Para ambiente isolado):**
```bash
docker run --name tcc-postgres \
  -e POSTGRES_PASSWORD=tcc2025 \
  -e POSTGRES_DB=clinica_medica \
  -p 5432:5432 \
  -d postgres:15
```

---

## 📂 PASSO A PASSO - CRIAÇÃO DO BANCO

### 2️⃣ Criar o Banco de Dados

**Usando pgAdmin 4:**
1. Abrir pgAdmin 4
2. Conectar ao servidor local (localhost:5432)
3. Clicar com botão direito em "Databases" → "Create" → "Database..."
4. Nome: `clinica_medica`
5. Owner: `postgres`
6. Salvar

**Usando linha de comando:**
```bash
psql -U postgres -c "CREATE DATABASE clinica_medica;"
```

---

## 📝 PASSO A PASSO - EXECUTAR O SCRIPT SQL

### 3️⃣ Rodar o Script `database/schema.sql`

**Opção A - Via pgAdmin 4:**
1. Conectar ao banco `clinica_medica`
2. Clicar em "Tools" → "Query Tool"
3. Abrir o arquivo `database/schema.sql`
4. Executar (F5 ou botão ▶️)
5. Verificar no painel "Messages" se não houve erros

**Opção B - Via linha de comando:**
```bash
# Navegar até a pasta do projeto
cd c:\Users\ailto\Documents\tcc\TCC-PROJETO

# Executar o script
psql -U postgres -d clinica_medica -f database/schema.sql
```

---

## ✅ VALIDAR A INSTALAÇÃO

### 4️⃣ Testar se está tudo funcionando

Execute estas queries de teste no pgAdmin:

```sql
-- Teste 1: Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Deve retornar: pacientes, medicos, consultas, eventos_faturamento

-- Teste 2: Verificar se há dados mockados
SELECT COUNT(*) FROM pacientes;
-- Deve retornar: 5

-- Teste 3: Testar a Stored Procedure
SELECT * FROM gerar_resumo_faturamento(2, 2025);
-- Deve retornar uma linha com totais de faturamento

-- Teste 4: Testar a View de paciente (com CPF exposto)
SELECT id, nome_completo, cpf, total_consultas 
FROM vw_paciente_detalhado 
WHERE id = 1;
-- Deve retornar os dados completos da Maria Silva Santos
```

---

## 🔐 CREDENCIAIS PARA O BACKEND

Anote estas informações (serão usadas no `.env` do Node.js):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinica_medica
DB_USER=postgres
DB_PASSWORD=[sua senha do postgres]
```

---

## 🛠️ FERRAMENTAS ALTERNATIVAS (Opcional)

Se preferir uma interface mais moderna que o pgAdmin:

- **DBeaver** (https://dbeaver.io/) - Multi-banco, gratuita
- **DataGrip** (JetBrains) - Paga, mas muito poderosa
- **VS Code Extension**: PostgreSQL (cweijan.vscode-postgresql-client2)

---

## 🚨 TROUBLESHOOTING

### Erro: "FATAL: password authentication failed"
- Verifique a senha do usuário `postgres`
- No Windows, pode resetar via pgAdmin ou reinstalando

### Erro: "could not connect to server"
- Verifique se o serviço PostgreSQL está rodando:
  - Windows: Services → postgresql-x64-15
  - Docker: `docker ps` e verificar se o container está up

### Erro: "relation already exists"
- O script já foi executado. Para resetar:
```sql
DROP TABLE IF EXISTS eventos_faturamento CASCADE;
DROP TABLE IF EXISTS consultas CASCADE;
DROP TABLE IF EXISTS medicos CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;
DROP FUNCTION IF EXISTS gerar_resumo_faturamento;
DROP VIEW IF EXISTS vw_paciente_detalhado;
```
Depois execute o `schema.sql` novamente.

---

## ✅ CHECKLIST FINAL

Antes de prosseguir para o Backend, confirme:

- [ ] PostgreSQL instalado e rodando
- [ ] Banco `clinica_medica` criado
- [ ] Script `database/schema.sql` executado sem erros
- [ ] 5 pacientes inseridos (SELECT COUNT(*) FROM pacientes)
- [ ] Procedure `gerar_resumo_faturamento` funciona
- [ ] View `vw_paciente_detalhado` retorna dados

---

**📌 Próximo passo:** Implementar o Backend Node.js que consumirá este banco de forma governada!
