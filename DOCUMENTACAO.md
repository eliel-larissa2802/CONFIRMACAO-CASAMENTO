# Documentação — Wedding RSVP System · Eliel & Larissa

> Versão atual: **v2 Enhanced** · Atualizado em: 19/03/2026

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Tecnologias Utilizadas](#2-tecnologias-utilizadas)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Como Executar](#4-como-executar)
5. [Arquitetura e Fluxo de Dados](#5-arquitetura-e-fluxo-de-dados)
6. [Módulo de Dados — `lib/guests.ts`](#6-módulo-de-dados--libgueststs)
7. [Página Pública — RSVP (`Index.tsx`)](#7-página-pública--rsvp-indextsx)
8. [Painel Administrativo (`Admin.tsx`)](#8-painel-administrativo-admintsx)
9. [Sistema de Design](#9-sistema-de-design)
10. [Persistência de Dados (localStorage)](#10-persistência-de-dados-localstorage)
11. [Autenticação](#11-autenticação)
12. [Regras de Negócio](#12-regras-de-negócio)
13. [Responsividade](#13-responsividade)
14. [Configurações do Projeto](#14-configurações-do-projeto)
15. [Scripts Disponíveis](#15-scripts-disponíveis)
16. [Limitações Conhecidas](#16-limitações-conhecidas)
17. [Melhorias Futuras](#17-melhorias-futuras)
18. [Histórico de Versões](#18-histórico-de-versões)

---

## 1. Visão Geral

Sistema de confirmação de presença (RSVP) para o casamento de **Eliel & Larissa**, marcado para **30 de Maio de 2026**.

O sistema é composto por duas áreas principais:

| Área | Rota | Descrição |
|---|---|---|
| Pública | `/` | Convidados confirmam presença digitando o nome |
| Administrativa | `/admin` | Gerenciamento completo da lista de convidados |

O projeto **não possui backend**. Todos os dados são armazenados no `localStorage` do navegador, tornando a solução 100% estática e sem dependências externas de servidor.

---

## 2. Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 18.3.1 | Biblioteca de interface |
| TypeScript | 5.2.2 | Tipagem estática |
| Vite | 5.3.1 | Build tool e servidor de desenvolvimento |
| Tailwind CSS | 3.4.4 | Estilização utilitária |
| React Router DOM | 6.26.0 | Roteamento entre páginas |
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
│   │   └── guests.ts       # Toda a lógica de dados (CRUD + RSVP + importação + contato)
│   ├── pages/
│   │   ├── Index.tsx       # Página pública de confirmação
│   │   └── Admin.tsx       # Painel administrativo
│   ├── App.tsx             # Roteador principal
│   ├── main.tsx            # Ponto de entrada React
│   └── index.css           # Estilos globais + Tailwind
├── index.html              # Template HTML principal
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
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
└────────────────────────┼─────────────────────────────┘
                         │
          ┌──────────────▼──────────────┐
          │         localStorage        │
          │   wedding_guests: string[]  │
          │   wedding_confirmed: string[]│
          │   contact_link: string      │
          └─────────────────────────────┘
```

---

## 6. Módulo de Dados — `lib/guests.ts`

Centraliza toda a lógica de acesso e manipulação de dados.

### Constantes (chaves do localStorage)

```ts
GUESTS_KEY    = 'wedding_guests'
CONFIRMED_KEY = 'wedding_confirmed'
CONTACT_KEY   = 'contact_link'
```

### Funções Exportadas

#### `getGuests(): string[]`
Retorna a lista completa de convidados cadastrados.

#### `setGuests(guests: string[]): void`
Persiste a lista de convidados no localStorage.

#### `getConfirmed(): string[]`
Retorna a lista de convidados que confirmaram presença.

#### `setConfirmed(confirmed: string[]): void`
Persiste a lista de confirmados no localStorage.

#### `normalize(name: string): string`
Converte o nome para lowercase e remove espaços extras. Usada em todas as comparações para garantir case-insensitivity.

```ts
normalize("João Silva") // → "joão silva"
normalize("  MARIA  ") // → "maria"
```

#### `confirmRSVP(name: string): RSVPResult`
Fluxo principal de confirmação de presença.

| Resultado | Condição |
|---|---|
| `'confirmed'` | Nome existe na lista e ainda não confirmou |
| `'already_confirmed'` | Nome existe e já havia confirmado |
| `'not_found'` | Nome não encontrado na lista |

#### `addGuest(name: string): boolean`
Adiciona um novo convidado manualmente. Retorna `false` se já existir (case-insensitive).

#### `editGuest(oldName: string, newName: string): boolean`
Edita o nome de um convidado, mantendo seu status de confirmação. Retorna `false` se o novo nome já existir.

#### `removeGuest(name: string): void`
Remove o convidado da lista principal **e** da lista de confirmados simultaneamente.

#### `getContactLink(): string` *(v2)*
Retorna o link de contato configurado pelo admin. Retorna string vazia se não configurado.

#### `setContactLink(url: string): void` *(v2)*
Salva o link de contato no localStorage. Aplica `trim()` automaticamente.

#### `importGuests(raw: string): ImportResult` *(v2)*
Processa o conteúdo bruto de um arquivo (`.csv` ou `.txt`) e adiciona os convidados em massa.

**Parâmetro:** string com o conteúdo completo do arquivo

**Retorno — tipo `ImportResult`:**

```ts
type ImportResult = {
  total: number      // total de linhas não-vazias processadas
  added: number      // convidados efetivamente adicionados
  duplicates: number // linhas ignoradas por já existirem
}
```

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
| `contactLink` | `string` | Link de contato lido do localStorage no mount |

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

#### Configurar Contato *(v2)*

Permite ao admin definir dinamicamente o link exibido no botão "Fale Conosco" da página pública.

- Input aceita qualquer URL (WhatsApp, Instagram, site etc.)
- Salvar persiste no `localStorage` sob a chave `contact_link`
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
| `guests` | `string[]` | Lista de convidados |
| `confirmed` | `string[]` | Lista de confirmados |
| `editingName` | `string \| null` | Nome sendo editado |
| `removeConfirm` | `string \| null` | Nome aguardando remoção |
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

## 10. Persistência de Dados (localStorage)

| Chave | Tipo | Conteúdo |
|---|---|---|
| `wedding_guests` | `string` (JSON) | Array com nomes de todos os convidados |
| `wedding_confirmed` | `string` (JSON) | Array com nomes dos que confirmaram |
| `contact_link` | `string` | URL do botão "Fale Conosco" (v2) |

### Exemplo de dados no localStorage

```json
// wedding_guests
["João Silva", "Maria Oliveira", "Carlos Souza", "Ana Lima"]

// wedding_confirmed
["João Silva", "Ana Lima"]

// contact_link
"https://wa.me/5511999999999"
```

### Comportamento

- Os dados **persistem** entre sessões no mesmo navegador
- Os dados são **locais** — não sincronizados entre dispositivos
- Limpar os dados: DevTools → Application → Storage → Clear site data

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
| Dados locais | O localStorage não sincroniza entre dispositivos ou navegadores diferentes |
| Segurança | As credenciais do admin ficam no código-fonte (client-side) |
| Importação `.xlsx` | Arquivos Excel não são suportados; use `.csv` ou `.txt` |
| Sem exportação | Não há como exportar a lista em CSV ou PDF pelo painel |
| Sem notificações | Nenhum e-mail ou mensagem é enviado ao confirmar presença |
| Perda de dados | Limpar o cache do navegador apaga todos os dados |

---

## 17. Melhorias Futuras

| Melhoria | Descrição |
|---|---|
| Backend (Firebase) | Persistência em nuvem com sincronização em tempo real |
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

*Wedding RSVP System — Eliel & Larissa · v2 Enhanced*
