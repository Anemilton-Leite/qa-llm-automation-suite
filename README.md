# 🤖 QA Automation Suite — AI / LLM Applications

> Suite de automação de testes para aplicações de **Inteligência Artificial e LLMs**, cobrindo validação de endpoints de inferência, testes de UI cross-browser e regressão de prompts — com Playwright + TypeScript.

![CI](https://github.com/anemiltonleite/qa-llm-automation-suite/actions/workflows/regression-tests.yml/badge.svg)
![Playwright](https://img.shields.io/badge/Playwright-1.40-2EAD33?style=flat&logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat&logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🎯 Por que testar LLMs é diferente?

Sistemas de IA são **não-determinísticos** — a mesma entrada pode gerar respostas diferentes. Isso exige uma abordagem de QA completamente distinta:

| QA Tradicional | QA para LLMs |
|---|---|
| `expect(output).toBe("valor exato")` | `assertContainsKeywords(output, ["chave1", "chave2"])` |
| Testa lógica de negócio determinística | Testa comportamento emergente e guardrails |
| Timeout fixo | Timeout adaptativo (streaming pode durar 30s+) |
| Asserção de UI estática | Valida renderização de Markdown e blocos de código |
| Sem contexto de segurança | Testa recusa a conteúdo prejudicial (safety) |

---

## 🏗️ Arquitetura do Projeto

```
qa-llm-automation-suite/
├── .github/
│   └── workflows/
│       └── regression-tests.yml     # Pipeline CI/CD com execução diária
├── src/
│   ├── api/
│   │   ├── clients/
│   │   │   └── llmApiClient.ts      # Cliente HTTP para endpoints LLM
│   │   └── tests/
│   │       └── llmApi.spec.ts       # 12 testes de API (schema, safety, latência)
│   ├── ui/
│   │   ├── pages/
│   │   │   └── chatPage.ts          # Page Object Model para chat de IA
│   │   └── tests/
│   │       └── chatUi.spec.ts       # 13 testes UI (E2E, mobile, acessibilidade)
│   ├── utils/
│   │   └── llmAssertions.ts         # Assertivas específicas para LLMs
│   └── fixtures/
│       └── prompts.json             # Prompts para regressão data-driven
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

---

## 🧩 Camadas de Teste

### 1. 🔌 API Layer — Validação de Endpoints LLM
Testa diretamente a API de inferência antes de tocar na UI. Mais rápido e preciso.

| ID | Cenário | Tipo |
|----|---------|------|
| TC-API-LLM001 | Response retorna status 200 | Contrato |
| TC-API-LLM002 | Body possui todos os campos do schema | Schema |
| TC-API-LLM003 | `choices[0].message` tem `role` e `content` | Schema |
| TC-API-LLM004 | `usage` retorna contagem de tokens válida | Schema |
| TC-API-LLM005 | `finish_reason` é "stop" em resposta normal | Contrato |
| TC-API-LLM006 | Temperatura 0 produz resposta determinística | Determinismo |
| TC-API-LLM007 | Modelo respeita instrução de idioma | Conteúdo |
| TC-API-LLM008 | Resposta de código contém sintaxe válida | Conteúdo |
| TC-API-LLM009 | Modelo recusa conteúdo prejudicial | Safety |
| TC-API-LLM010 | System prompt é respeitado | Comportamento |
| TC-API-LLM011 | Resposta simples retorna em < 15 segundos | Performance |
| TC-API-LLM012 | Modelo mantém contexto multi-turn | Memória |

### 2. 🖥️ UI Layer — Interface de Chat
Testa o comportamento real no browser com Page Object Model.

| ID | Cenário | Tipo |
|----|---------|------|
| TC-UI001 | Página carrega sem erros | Disponibilidade |
| TC-UI002 | Título da página correto | Smoke |
| TC-UI003 | Botão desabilitado com input vazio | UX |
| TC-UI004 | Processa prompt e exibe resposta | Funcional |
| TC-UI005 | Renderiza bloco de código (Markdown) | Renderização |
| TC-UI006 | Renderiza Markdown formatado | Renderização |
| TC-UI007 | Responde em português | Idioma |
| TC-UI008 | Mantém contexto na conversa | Multi-turn |
| TC-UI009 | Múltiplos turnos incrementam respostas | Multi-turn |
| TC-UI010 | Não exibe conteúdo prejudicial | Safety |
| TC-UI011 | Envia prompt com tecla Enter | UX |
| TC-UI012 | Elementos focáveis com teclado | Acessibilidade |
| TC-UI013 | Layout mobile correto | Responsividade |

### 3. 🔄 Regressão de Prompts (Data-driven)
Conjunto de prompts em `fixtures/prompts.json` executado como suite de regressão — garante que atualizações no modelo não quebrem comportamentos esperados.

---

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 20+
- Chave de API de um provider LLM (OpenAI, OpenRouter, etc.)

### Instalação
```bash
git clone https://github.com/anemiltonleite/qa-llm-automation-suite.git
cd qa-llm-automation-suite
npm install
npx playwright install
cp .env.example .env
# Edite .env com sua LLM_API_KEY
```

### Executar
```bash
# Todos os testes
npm test

# Só testes de API (sem browser — mais rápido)
npm run test:api

# Só testes de UI
npm run test:ui

# Modo headed (ver o browser)
npm run test:headed

# Abrir relatório HTML
npm run report
```

---

## 🔐 CI — Segredos e ativação dos testes

Os testes validam **providers reais** (chamadas à API de inferência e à UI de chat).
Por isso, no GitHub Actions eles **pulam automaticamente** quando as credenciais
não estão configuradas — o pipeline fica verde de forma honesta, marcando os
testes como _skipped_ (com o motivo no relatório), em vez de falhar com `401`.

Para **executar os testes de verdade** no CI, configure em
**Settings → Secrets and variables → Actions**:

| Nome | Tipo | Obrigatório para | Descrição |
|---|---|---|---|
| `LLM_API_KEY` | Secret | Testes de **API** | Chave do provider LLM (OpenAI, OpenRouter, etc.). Sem ela, os testes de API são ignorados. |
| `LLM_BASE_URL` | Secret | opcional | Base URL do provider (default: `https://api.openai.com`). |
| `LLM_MODEL` | Variable | opcional | Modelo usado nos testes (default: `gpt-4o-mini`). |
| `RUN_UI_E2E` | Variable | Testes de **UI** | Defina `true` para executar o E2E de UI. Sem isso, os testes de UI são ignorados. |
| `BASE_URL` | Secret | Testes de **UI** | URL da aplicação de chat testada (default: `https://claude.ai`). |

> ⚠️ **Sobre os testes de UI:** eles dirigem a aplicação web real (ex.: `claude.ai`),
> que normalmente exige **sessão autenticada**. Em CI não há login persistente, então
> só ative `RUN_UI_E2E=true` se `BASE_URL` apontar para uma aplicação acessível
> sem autenticação interativa (ou com estado de sessão injetado). Caso contrário,
> deixe-os como _skipped_.

> 💸 **Custo:** com `LLM_API_KEY` configurada, os testes de API fazem chamadas reais
> e **pagas** ao provider. Prefira um modelo barato e revise os limites de uso.

Localmente, o comportamento é o mesmo: defina `LLM_API_KEY` (e `RUN_UI_E2E=true`
para UI) no seu `.env` — veja `.env.example`.

---

## 🌐 Compatível com qualquer provider LLM

O `LlmApiClient` funciona com qualquer API compatível com a especificação OpenAI:

| Provider | Base URL |
|----------|---------|
| OpenAI | `https://api.openai.com` |
| OpenRouter | `https://openrouter.ai/api` |
| Together.ai | `https://api.together.xyz` |
| Ollama (local) | `http://localhost:11434/v1` |

---

## 📦 Stack

| Categoria | Tecnologia |
|-----------|-----------|
| Automation | Playwright 1.40 |
| Linguagem | TypeScript 5.3 |
| CI/CD | GitHub Actions (daily + PR) |
| Relatórios | Playwright HTML Reporter |
| Fixtures | JSON data-driven |
| Providers | OpenAI-compatible APIs |

---

<div align="center">

**Desenvolvido por [Anemilton Leite](https://linkedin.com/in/anemilton-moura)**  
QA Automation Engineer · Natal, RN  
📧 Anemilton01@gmail.com

</div>
