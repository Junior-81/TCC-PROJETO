# 🚀 COMEÇAR AQUI - Guia Rápido de Instalação

Este guia te levará do zero até o projeto funcionando em menos de 30 minutos.

---

## 📋 Checklist de Pré-requisitos

Antes de começar, instale:

- [ ] **Node.js** 18+ → https://nodejs.org/
- [ ] **PostgreSQL** 15+ → https://www.postgresql.org/download/
- [ ] **Git** (opcional) → https://git-scm.com/
- [ ] **Editor de código** (VS Code recomendado) → https://code.visualstudio.com/

---

## ⚡ Instalação Rápida (Windows)

### 1️⃣ PostgreSQL (5 minutos)

```powershell
# Baixe e instale o PostgreSQL:
# https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

# Durante a instalação:
# - Marque a senha do usuário 'postgres' (você vai precisar!)
# - Porta: 5432 (padrão)
# - Instalar Stack Builder: NÃO (não é necessário)
```

### 2️⃣ Criar o Banco de Dados (2 minutos)

#### Opção A - Via pgAdmin (Interface Gráfica)
1. Abrir pgAdmin 4
2. Conectar ao servidor localhost
3. Botão direito em "Databases" → Create → Database
4. Nome: `clinica_medica`
5. Salvar

#### Opção B - Via Terminal (PowerShell)
```powershell
# Criar o banco
psql -U postgres -c "CREATE DATABASE clinica_medica;"
```

### 3️⃣ Executar o Script SQL (2 minutos)

```powershell
# Navegue até a pasta do projeto
cd c:\Users\ailto\Documents\tcc\TCC-PROJETO

# Execute o script
psql -U postgres -d clinica_medica -f database\schema.sql
```

**✅ Teste se funcionou:**
```powershell
psql -U postgres -d clinica_medica -c "SELECT COUNT(*) FROM pacientes;"
# Deve retornar: 5
```

### 4️⃣ Configurar o Backend (5 minutos)

```powershell
# Entrar na pasta do backend
cd backend

# Instalar dependências (pode demorar 2-3 minutos)
npm install

# Copiar o arquivo de configuração
cp .env.example .env

# IMPORTANTE: Editar o .env com sua senha do PostgreSQL
# Abra o arquivo .env em um editor de texto e altere:
# DB_PASSWORD=sua_senha_aqui
```

**✅ Teste se funcionou:**
```powershell
npm run dev
# Aguarde aparecer: "🚀 Servidor rodando em: http://localhost:3000"
# Abra http://localhost:3000/health no navegador
```

### 5️⃣ Configurar o  (5 minutos)

**EM OUTRO TERMINAL** (deixe o backend rodando):

```powershell
# Voltar para a raiz do projeto
cd ..

# Entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install

# Rodar o frontend
npm run dev
# O navegador abrirá automaticamente em http://localhost:5173
```

---

## 🎉 PRONTO! Agora teste:

### Teste 1: Faturamento
1. Na página inicial (http://localhost:5173)
2. Selecione: **Mês 2**, **Ano 2025**
3. Clique em **"Buscar Resumo"**
4. Você deve ver estatísticas de faturamento!

### Teste 2: Paciente (LGPD)
1. Clique em **"👤 Paciente"** no menu
2. Digite: **ID 1**
3. Clique em **"Buscar Paciente"**
4. Você deve ver os dados com **CPF mascarado**: `***.***.***-01`

### Teste 3: Validar LGPD no DevTools
1. Pressione **F12** (abrir DevTools)
2. Vá na aba **Network**
3. Busque novamente o paciente ID 1
4. Clique na requisição **`pacientes/1`**
5. Vá na aba **Response**
6. **Confirme:** O campo `cpfMascarado` tem valor `"***.***.***-01"`

✅ **Prova:** O CPF completo NUNCA saiu do banco de dados!

---

## 🐛 Problemas Comuns

### ❌ "Erro ao conectar no PostgreSQL"
- Verifique se o serviço PostgreSQL está rodando:
  - Windows: Serviços → postgresql-x64-15 → Status: Em execução
- Verifique a senha no arquivo `backend/.env`

### ❌ "relation pacientes does not exist"
- O script SQL não foi executado
- Execute novamente: `psql -U postgres -d clinica_medica -f database\schema.sql`

### ❌ "EADDRINUSE: address already in use :::3000"
- A porta 3000 já está em uso
- Feche o processo anterior ou mude a porta no `backend/.env`: `PORT=3001`

### ❌ "Network Error" no frontend
- O backend não está rodando
- Verifique se http://localhost:3000/health está acessível

---

## 📚 Próximos Passos

Agora que está tudo funcionando, explore:

1. **Leia o README principal** → [`README.md`](./README.md)
2. **Entenda a governança** → Rode `spectral lint swagger.yaml`
3. **Explore o código** → Leia os comentários "TCC Note:" em todos os arquivos
4. **Teste outros pacientes** → IDs 2, 3, 4, 5

---

## 🆘 Precisa de Ajuda?

1. Revise o arquivo [`INSTRUCOES-BANCO-DE-DADOS.md`](./INSTRUCOES-BANCO-DE-DADOS.md)
2. Revise o [`backend/README.md`](./backend/README.md)
3. Revise o [`frontend/README.md`](./frontend/README.md)

---

**🚀 Bom trabalho! Seu TCC está rodando!**
