# Documentação — Wedding RSVP System · Eliel & Larissa

> Versão atual: **v3 Supabase** · Atualizado em: 25/03/2026

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Tecnologias Utilizadas](#2-tecnologias-utilizadas)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Como Executar](#4-como-executar)
5. [Arquitetura e Fluxo de Dados](#5-arquitetura-e-fluxo-de-dados)
6. [Configuração do Supabase](#6-configuração-do-supabase)
7. [Módulo de Dados — `lib/guests.ts`](#7-módulo-de-dados--libgueststs)
8. [Página Pública — RSVP (`Index.tsx`)](#8-página-pública--rsvp-indextsx)
9. [Painel Administrativo (`Admin.tsx`)](#9-painel-administrativo-admintsx)
10. [Sistema de Design](#10-sistema-de-design)
11. [Persistência de Dados (Supabase)](#11-persistência-de-dados-supabase)
12. [Autenticação](#12-autenticação)
13. [Regras de Negócio](#13-regras-de-negócio)
14. [Responsividade](#14-responsividade)
15. [Configurações do Projeto](#15-configurações-do-projeto)
16. [Scripts Disponíveis](#16-scripts-disponíveis)
17. [Limitações Conhecidas](#17-limitações-conhecidas)
18. [Melhorias Futuras](#18-melhorias-futuras)
19. [Histórico de Versões](#19-histórico-de-versões)

---

## 1. Visão Geral

Sistema de confirmação de presença (RSVP) para o casamento de **Eliel & Larissa**, marcado para **30 de Maio de 2026**.

O sistema é composto por duas áreas principais:

| Área | Rota | Descrição |
|---|---|---|
| Pública | `/` | Convidados confirmam presença digitando o nome |
| Administrativa | `/admin` | Gerenciamento completo da lista de convidados |

O projeto utiliza **Supabase** como backend para persistência de dados, permitindo sincronização em tempo real e acesso multi-dispositivo. A aplicação é uma SPA (Single Page Application) construída com React e TypeScript.

---

## 2. Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 18.3.1 | Biblioteca de interface |
| TypeScript | 5.2.2 | Tipagem estática |
| Vite | 5.3.1 | Build tool e servidor de desenvolvimento |
| Tailwind CSS | 3.4.4 | Estilização utilitária |
| React Router DOM | 6.26.0 | Roteamento entre páginas |
| @supabase/supabase-js | 2.100.0 | Cliente para banco de dados Supabase |
| Supabase | — | Backend como serviço (PostgreSQL + Auth) |
| Google Fonts | — | Tipografia (Great Vibes, Playfair Display, Inter) |

---

## 3. Estrutura de Pastas

```
CONFIRMAÇÃO DE PRESENÇA/
├── public/
│   ├── couple.png          # Foto do casal (hero da página)
│   └── monogram.png        # Monograma EL dourado (favicon + logo)
├── src/
│   ├── lib/
│   │   ├── supabase.ts     # Configuração e cliente Supabase
│   │   └── guests.ts       # Toda a lógica de dados (CRUD + RSVP + importação + contato)
│   ├── pages/
│   │   ├── Index.tsx       # Página pública de confirmação
│   │   └── Admin.tsx       # Painel administrativo
│   ├── App.tsx             # Roteador principal
│   ├── main.tsx            # Ponto de entrada React
│   └── index.css           # Estilos globais + Tailwind
├── .env                    # Variáveis de ambiente (local)
├── index.html              # Template HTML principal
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json             # Configuração para deploy no Vercel
└── DOCUMENTACAO.md         # Este arquivo
```

---

## 4. Como Executar

### Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior

### Instalação

```powershell
cd "C:\Users\eliel\Pictures\Casamento\CONFIRMAÇÃO DE PRESENÇA"
npm install
```

### Desenvolvimento (servidor local)

```powershell
npm run dev
```

Acesse em: `http://localhost:5173`

### Build para Produção

```powershell
npm run build
```

Os arquivos finais são gerados na pasta `dist/`. Para testar o build:

```powershell
npm run preview
```

---

## 5. Arquitetura e Fluxo de Dados

```
┌─────────────────────────────────────────────────────┐
│                      React App                      │
│                                                     │
│  ┌──────────────┐          ┌─────────────────────┐  │
│  │  Index.tsx   │          │     Admin.tsx        │  │
│  │  (Rota /)    │          │    (Rota /admin)     │  │
│  └──────┬───────┘          └──────────┬───────────┘  │
│         │                             │              │
│         └──────────────┬──────────────┘              │
│                        │                             │
│                ┌───────▼────────┐                   │
│                │  lib/guests.ts  │                   │
│                │  CRUD + Import  │                   │
│                │  + ContactLink  │                   │
│                └───────┬────────┘                   │
│                        │                             │
│                ┌───────▼────────┐                   │
│                │ lib/supabase.ts │                   │
│                │   Supabase      │                   │
│                │    Client       │                   │
│                └───────┬────────┘                   │
│                        │                             │
└────────────────────────┼─────────────────────────────┘
                         │
          ┌──────────────▼──────────────┐
          │          Supabase           │
          │   PostgreSQL Database       │
          │   Tables: guests, settings  │
          └─────────────────────────────┘
```

---

## 6. Configuração do Supabase

### Inicialização do Cliente

O cliente Supabase é configurado em `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase env vars não configuradas!')
}

export const supabase = createClient(
  SUPABASE_URL as string,
  SUPABASE_ANON_KEY as string
)
```

### Variáveis de Ambiente

**Arquivo `.env` (local):**
```
VITE_SUPABASE_URL=https://fsyntprccyocvxsukjxz.supabase.co
VITE_SUPABASE_ANON_KEY=COLE_SUA_CHAVE_AQUI
```

**Em produção (Vercel):** Configure as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel do Vercel.

### Esquema do Banco

**Tabela `guests`:**
- `id` (uuid, primary key)
- `name` (text)
- `confirmed` (boolean, default false)

**Tabela `settings`:**
- `key` (text, primary key)
- `value` (text)

---

## 7. Módulo de Dados — `lib/guests.ts`

Centraliza toda a lógica de acesso e manipulação de dados via Supabase.

### Tipos

```ts
export type GuestRow = {
  id: string
  name: string
  confirmed: boolean
}

export type RSVPResult = 'confirmed' | 'already_confirmed' | 'not_found'

export type ImportResult = {
  total: number
  added: number
  duplicates: number
}
```

### Constantes

```ts
const CONTACT_KEY = 'contact_link'
```

### Funções Exportadas

#### `normalize(name: string): string`
Converte o nome para lowercase e remove espaços extras. Usada em todas as comparações para garantir case-insensitivity.

```ts
normalize("João Silva") // → "joão silva"
normalize("  MARIA  ") // → "maria"
```

#### `getGuests(): Promise<GuestRow[]>`
Retorna a lista completa de convidados cadastrados do Supabase, ordenada por nome.

#### `confirmRSVP(name: string): Promise<RSVPResult>`
Fluxo principal de confirmação de presença via busca case-insensitive no Supabase.

| Resultado | Condição |
|---|---|
| `'confirmed'` | Nome existe na lista e ainda não confirmou |
| `'already_confirmed'` | Nome existe e já havia confirmado |
| `'not_found'` | Nome não encontrado na lista |

#### `addGuest(name: string): Promise<boolean>`
Adiciona um novo convidado no Supabase. Retorna `false` se já existir (case-insensitive).

#### `editGuest(oldName: string, newName: string): Promise<boolean>`
Edita o nome de um convidado no Supabase, mantendo seu status de confirmação. Retorna `false` se o novo nome já existir.

#### `removeGuest(id: string): Promise<void>`
Remove o convidado do Supabase pelo ID.

#### `searchGuests(query: string, limit?: number): Promise<string[]>`
Busca convidados no Supabase por prefixo, retornando até `limit` nomes (padrão 5).

#### `importGuests(raw: string): Promise<ImportResult>`
Processa conteúdo de arquivo (CSV/txt) e adiciona convidados em massa no Supabase.

**Retorno — tipo `ImportResult`:**

```ts
type ImportResult = {
  total: number      // total de linhas não-vazias processadas
  added: number      // convidados efetivamente adicionados
  duplicates: number // linhas ignoradas por já existirem
}
```

#### `getContactLink(): Promise<string>`
Retorna o link de contato da tabela `settings` no Supabase.

#### `setContactLink(url: string): Promise<void>`
Salva o link de contato na tabela `settings` no Supabase via upsert.

#### `importGuests(raw: string): Promise<ImportResult>`
Processa conteúdo de arquivo (CSV/txt) e adiciona convidados em massa no Supabase.

**Comportamento interno:**
- Divide o conteúdo por `\n` ou `\r\n`
- Ignora linhas vazias após `trim()`
- Aplica `normalize()` para detecção de duplicatas
- Persiste apenas se houver ao menos 1 adição (`added > 0`)

---

## 7. Página Pública — RSVP (`Index.tsx`)

### Layout

```
┌─────────────────────────┐
│   Foto do casal (hero)  │
│   Gradiente suave       │
│                         │
│   [Monograma EL]        │
│   Eliel                 │
│     &                   │
│   Larissa               │
├─────────────────────────┤
│  Texto de convite       │
│  MAIO | 30 | 2026       │
├─────────────────────────┤
│  ❧ ornamento            │
├─────────────────────────┤
│  Card RSVP              │
│  [input: nome]          │
│  [feedback colorido]    │
│  [btn Confirmar]        │
├─────────────────────────┤
│  💌 Voltar ao Convite   │  ← sempre visível
│  📞 Fale Conosco        │  ← só aparece se configurado
└─────────────────────────┘
```

### Estados do Componente

| Estado | Tipo | Descrição |
|---|---|---|
| `name` | `string` | Valor do campo de nome |
| `feedback` | `FeedbackState` | Tipo e mensagem do feedback |
| `loading` | `boolean` | Controle de carregamento durante verificação |
| `contactLink` | `string` | Link de contato lido do Supabase no mount |

### Feedback Visual

| Situação | Cor | Mensagem |
|---|---|---|
| Presença confirmada | Verde | Mensagem de boas-vindas personalizada |
| Já confirmado | Amarelo | Aviso de confirmação duplicada |
| Nome não encontrado | Vermelho | Instrução para verificar o nome |
| Campo vazio | Vermelho | Solicitação de preenchimento |

### Botões de Ação (v2)

| Botão | Visibilidade | Destino |
|---|---|---|
| **Voltar ao Convite** | Sempre visível | `https://elielelarissaconvite.my.canva.site/eliel-larissa-site` |
| **Fale Conosco** | Apenas se `contact_link` configurado | URL definida pelo admin |

Quando o botão "Fale Conosco" está oculto, o botão "Voltar ao Convite" ocupa a largura total do grid. Quando ambos estão visíveis, formam um grid de 2 colunas.

---

## 8. Painel Administrativo (`Admin.tsx`)

### Tela de Login

- Campos: usuário e senha
- Credenciais validadas em memória
- Exibe mensagem de erro em caso de falha
- Botão "Voltar ao site" redireciona para `/`

**Credenciais de acesso:**

```
Usuário: ELadmin
Senha:   30052026
```

### Dashboard

#### Cards de Estatísticas
- **Total de Convidados** — quantidade total cadastrada
- **Presenças Confirmadas** — quantidade que confirmou

#### Adicionar Convidado
- Campo de texto + botão "Adicionar"
- Validação: nome não pode ser vazio nem duplicado
- Feedback de sucesso ou erro abaixo do campo

#### Importar Lista *(v2)*

Permite adicionar convidados em massa via upload de arquivo.

**Tipos aceitos:** `.csv`, `.txt`

**Formato esperado do arquivo:**
```
João Silva
Maria Souza
Carlos Lima
Ana Pereira
```
*(um nome por linha, sem cabeçalho)*

**Fluxo:**
1. Admin clica em "Selecionar arquivo"
2. Escolhe um `.csv` ou `.txt`
3. `FileReader` lê o conteúdo como texto UTF-8
4. `importGuests()` processa linha por linha
5. Resultado exibido com totais detalhados

**Feedback de resultado:**
```
Importação concluída!
50 nomes lidos   45 adicionados   5 duplicados ignorados
```

**Erros tratados:**
- Formato de arquivo inválido (não `.csv`/`.txt`)
- Arquivo vazio
- Erro de leitura do FileReader

#### Configurar Contato

Permite ao admin definir dinamicamente o link exibido no botão "Fale Conosco" da página pública.

- Input aceita qualquer URL (WhatsApp, Instagram, site etc.)
- Salvar persiste na tabela `settings` do Supabase
- Deixar o campo vazio e salvar oculta o botão na página pública
- Feedback "Link de contato salvo com sucesso." confirmado por 2,5 segundos

**Exemplo de link WhatsApp:**
```
https://wa.me/5511999999999
```

#### Lista de Convidados

**Filtros disponíveis:**
- Por texto (busca em tempo real no nome)
- Por status: Todos / Confirmados / Pendentes

**Colunas da tabela:**

| # | Nome | Status | Ações |
|---|---|---|---|
| índice | nome do convidado | Confirmado / Pendente | Editar / Remover |

**Edição inline:**
- Clique em "Editar" transforma a célula em input
- Confirmar com botão "Salvar" ou tecla `Enter`
- Cancelar com botão "Cancelar" ou tecla `Escape`

**Remoção com confirmação:**
- Modal solicita confirmação antes de remover
- Remove da lista principal e das confirmações

### Estados do Componente

| Estado | Tipo | Descrição |
|---|---|---|
| `view` | `'login' \| 'dashboard'` | Tela atual |
| `guests` | `GuestRow[]` | Lista de convidados do Supabase |
| `confirmed` | `string[]` | Lista de confirmados (calculada) |
| `editingId` | `string \| null` | ID do convidado sendo editado |
| `editingOriginalName` | `string` | Nome original do convidado sendo editado |
| `editValue` | `string` | Novo valor do nome em edição |
| `editError` | `string` | Mensagem de erro na edição |
| `removeConfirm` | `GuestRow \| null` | Convidado aguardando remoção |
| `filterText` | `string` | Texto do filtro de busca |
| `filterStatus` | `'all' \| 'confirmed' \| 'pending'` | Filtro de status |
| `contactInput` | `string` | Valor do input de configuração de contato |
| `contactSaved` | `boolean` | Controle de feedback de salvamento |
| `importResult` | `ImportResult \| null` | Resultado da última importação |
| `importError` | `string` | Mensagem de erro da importação |
| `importing` | `boolean` | Estado de carregamento do FileReader |

---

## 9. Sistema de Design

### Paleta de Cores

| Nome | Hex | Uso |
|---|---|---|
| Olive 700 | `#3d4e1f` | Cor primária, botões, textos principais |
| Olive 800 | `#2d3a17` | Hover de botões, header admin |
| Gold 400 | `#e8c040` | Destaque dourado |
| Cream | `#faf8f3` | Fundo geral da página |
| Stone 800 | `#292524` | Texto do corpo |
| Stone 500 | `#78716c` | Textos secundários |

### Tipografia

| Família | Estilo | Uso |
|---|---|---|
| Great Vibes | Script cursiva | Nomes "Eliel" e "Larissa" |
| Playfair Display | Serif elegante | Títulos de seção, headings |
| Inter | Sans-serif moderna | Corpo de texto, labels, inputs |

### Componentes Reutilizáveis (Tailwind `@layer components`)

| Classe | Descrição |
|---|---|
| `.btn-primary` | Botão verde oliva arredondado |
| `.btn-gold` | Botão dourado |
| `.btn-outline` | Botão com borda olive |
| `.input-field` | Input arredondado com foco estilizado |
| `.card` | Container branco com sombra e borda suave |

### Animações

| Classe | Efeito |
|---|---|
| `.fade-in-up` | Entra de baixo para cima com fade |
| `.fade-in` | Apenas fade de opacidade |
| `.delay-100` a `.delay-500` | Atrasos de 100ms a 500ms |

---

## 10. Persistência de Dados (Supabase)

Os dados são armazenados no Supabase (PostgreSQL), permitindo sincronização em tempo real e acesso multi-dispositivo.

### Tabelas

**`guests`:**
```sql
CREATE TABLE guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE
);
```

**`settings`:**
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

### Comportamento

- Os dados **persistem** na nuvem e são acessíveis de qualquer dispositivo
- Sincronização em tempo real entre usuários
- Segurança via Row Level Security (RLS) no Supabase
- Backup automático pelo Supabase

---

## 11. Autenticação

A autenticação do painel admin é feita **em memória**, sem backend:

```ts
const ADMIN_USER = 'ELadmin'
const ADMIN_PASS = '30052026'
```

- As credenciais são comparadas diretamente no cliente
- Não há token, sessão ou cookie
- Ao recarregar a página, o admin precisa fazer login novamente
- O botão "Sair" limpa o estado e retorna à tela de login

> **Importante:** Esta é uma autenticação simples para uso doméstico. Não é adequada para ambientes com requisitos de segurança elevados.

---

## 12. Regras de Negócio

1. **Comparação case-insensitive:** `"João"`, `"joão"` e `"JOÃO"` são tratados como o mesmo nome.
2. **Sem duplicatas:** Não é possível cadastrar dois convidados com o mesmo nome normalizado.
3. **RSVP único:** Um convidado só pode confirmar presença uma vez.
4. **Edição preserva status:** Ao editar o nome de um convidado confirmado, a confirmação é mantida com o novo nome.
5. **Remoção em cascata:** Remover um convidado também remove sua confirmação.
6. **Persistência automática:** Toda alteração é imediatamente salva no localStorage.
7. **Importação ignora duplicatas:** Nomes já existentes são contabilizados e ignorados sem erro. *(v2)*
8. **Linhas vazias ignoradas:** O parser de importação ignora linhas em branco automaticamente. *(v2)*
9. **Contato dinâmico:** O botão "Fale Conosco" só é exibido se o admin tiver configurado um link. *(v2)*

---

## 13. Responsividade

O layout é **mobile-first**:

- Inputs com altura confortável para toque (`py-3.5`)
- Botões com área de toque adequada
- Grid dos botões de ação adapta-se a 1 ou 2 colunas conforme disponibilidade do link de contato
- Tabela do admin com `overflow-x-auto` para scroll horizontal em telas pequenas
- Breakpoints utilizados: `sm:` (640px) para ajustes de tipografia e layout

---

## 14. Configurações do Projeto

### `vite.config.ts`
Configuração padrão do Vite com plugin React para suporte a JSX/TSX.

### `tailwind.config.js`
- Estende as cores padrão com a paleta `olive` e `gold`
- Registra as famílias tipográficas `script`, `serif` e `sans`
- Escaneia arquivos em `src/**/*.{js,ts,jsx,tsx}` e `index.html`

### `tsconfig.json`
- Target: `ES2020`
- JSX: `react-jsx`
- Modo strict ativado
- `moduleResolution: bundler` (otimizado para Vite)

---

## 15. Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento em `localhost:5173` |
| `npm run build` | Gera build de produção na pasta `dist/` |
| `npm run preview` | Serve os arquivos de produção localmente |

---

## 16. Limitações Conhecidas

| Limitação | Descrição |
|---|---|
| Dependência de internet | Requer conexão para acessar dados do Supabase |
| Segurança | As credenciais do admin ficam no código-fonte (client-side) |
| Importação `.xlsx` | Arquivos Excel não são suportados; use `.csv` ou `.txt` |
| Sem exportação | Não há como exportar a lista em CSV ou PDF pelo painel |
| Sem notificações | Nenhum e-mail ou mensagem é enviado ao confirmar presença |
| Rate limiting | Supabase pode limitar requests em projetos gratuitos |

---

## 17. Melhorias Futuras

| Melhoria | Descrição |
|---|---|
| Backend (Firebase) | Persistência em nuvem com sincronização em tempo real | → **Implementado com Supabase** |
| Importação `.xlsx` | Suporte a arquivos Excel via biblioteca `xlsx` |
| Exportação CSV | Baixar lista de convidados/confirmados em planilha |
| Busca avançada | Filtro por inicial, família, mesa etc. |
| Contagem regressiva | Timer com dias restantes para o casamento |
| Autenticação segura | JWT ou OAuth com backend dedicado |
| Grupos familiares | Confirmar presença de múltiplos membros de uma família |
| QR Code | Gerar QR Code individual por convidado |
| Notificações | Envio de confirmação via WhatsApp ou e-mail |

---

## 18. Histórico de Versões

### v3 Supabase — 25/03/2026

**Mudanças principais:**
- Migração completa de localStorage para Supabase
- Dados agora persistem na nuvem com sincronização em tempo real
- Adicionado `lib/supabase.ts` para configuração do cliente
- Reescrever `lib/guests.ts` para usar queries do Supabase
- Atualização de tipos: `GuestRow[]` em vez de `string[]`
- Configuração de variáveis de ambiente para produção (Vercel)

**Alterações técnicas:**
- Funções agora assíncronas com Promises
- Remoção de constantes de localStorage
- Adição de tabelas `guests` e `settings` no Supabase
- Persistência do link de contato na tabela `settings`

---

### v2 Enhanced — 19/03/2026

**Novas funcionalidades:**
- Importação de lista em massa via arquivo `.csv` ou `.txt`
- Configuração dinâmica do link de contato pelo painel admin
- Botão "Fale Conosco" ocultável (aparece somente se configurado)

**Alterações:**
- Botão "Site do Casal" renomeado para **"Voltar ao Convite"**
- `lib/guests.ts` expandido com `getContactLink()`, `setContactLink()` e `importGuests()`
- Modelo de dados atualizado: adicionada chave `contact_link` no localStorage

---

### v1 — 19/03/2026

**Lançamento inicial:**
- Sistema RSVP com validação por lista
- Painel administrativo com login, CRUD de convidados e filtros
- Design wedding theme (olive green + gold + cream)
- Persistência via localStorage

---

*Wedding RSVP System — Eliel & Larissa · v3 Supabase*
