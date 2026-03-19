Você está desenvolvendo um site de casamento com sistema RSVP (confirmação de presença) com dois fluxos principais:

Convidados confirmam presença digitando seu nome

Administrador gerencia lista de convidados e confirmações

O sistema deve ser simples, elegante, rápido e responsivo, com foco em usabilidade.

🎯 OBJECTIVE

Construir uma aplicação web completa com:

Página pública de confirmação de presença

Painel administrativo com autenticação

Persistência local de dados (sem backend)

Interface moderna baseada em convite de casamento

🧱 TECH STACK (OBRIGATÓRIO)

React 18

TypeScript

Vite

Tailwind CSS

LocalStorage (persistência)

📁 PROJECT STRUCTURE

Implemente exatamente esta estrutura:

src/
  assets/
    logo-el.png

  components/
    NavLink.tsx
    ui/ (button, card, dialog, input, etc.)

  hooks/
    use-mobile.tsx
    use-toast.ts

  lib/
    guests.ts
    utils.ts

  pages/
    Index.tsx
    Admin.tsx
    NotFound.tsx

  App.tsx
  main.tsx
  index.css
  App.css
🎨 DESIGN SYSTEM
Cores (usar CSS variables)

background: bege claro (creme)

foreground: marrom escuro

primary: verde oliva

accent: dourado suave

destructive: vermelho

success: verde

olive-soft: verde oliva claro

Tipografia

Pinyon Script → títulos decorativos

Cormorant Garamond → títulos elegantes

Montserrat → texto padrão

Estilo

Elegante, minimalista, romântico

Inspirado em convite de casamento

Elementos florais sutis

Bordas suaves e sombras leves

Animações

Fade-in suave (entrada de elementos)

Hover em botões

Transições leves

🧠 DATA LAYER (CRÍTICO)

Arquivo: src/lib/guests.ts

LocalStorage keys:
"wedding_guests"
"wedding_confirmed"
Funções obrigatórias:
getGuests(): string[]
getConfirmed(): string[]

addGuest(name: string): boolean
removeGuest(name: string): void
updateGuest(oldName: string, newName: string): void

confirmPresence(name: string): {
  success: boolean
  message: string
}
Regras de negócio:

Comparação de nomes em lowercase

Evitar duplicados

Se não existir → erro

Se já confirmado → aviso

updateGuest mantém confirmação

removeGuest remove também da confirmação

👤 USER FLOWS
🟢 CONVIDADO (ROTA "/")
Interface:

Logo E & L

Nome do casal

Data do casamento

Input de nome

Botão "Confirmar Presença"

Fluxo:

Digita nome

Clica botão

Sistema valida

Estados:

✅ Sucesso → "Presença confirmada com sucesso"

❌ Erro → "Nome não encontrado"

⚠️ Aviso → "Já confirmado"

Extras:

Botão/link:
→ Voltar ao convite
→ https://elielelarissaconvite.my.canva.site/eliel-larissa-site

🔐 ADMIN (ROTA "/admin")
Autenticação

Usuário: ELadmin

Senha: 30052026

Login simples via state

Sem backend

Dashboard
1. Estatísticas

Total convidados

Total confirmados

2. CRUD convidados

Adicionar

Editar (inline)

Remover (com confirmação)

3. Tabela

Colunas:

Nome

Status:

Confirmado (verde)

Pendente (cinza)

Ações:

Editar

Remover

🔁 ROUTING
"/" → Index
"/admin" → Admin
"*" → NotFound
📱 RESPONSIVIDADE

Mobile-first

Layout adaptável

Botões grandes (touch)

Tabela com scroll horizontal

⚠️ CONSTRAINTS

NÃO usar backend

NÃO usar bibliotecas pesadas extras

Código limpo e modular

Separação clara de responsabilidades

🚀 OUTPUT REQUIREMENTS

Você deve gerar:

Código completo de TODOS os arquivos

Estrutura do projeto

Código pronto para rodar com:

npm install
npm run dev

Comentários explicativos nas partes críticas

🎯 SUCCESS CRITERIA

O sistema deve:

Validar nomes corretamente

Persistir dados no LocalStorage

Permitir CRUD completo no admin

Ser visualmente elegante e moderno

Funcionar perfeitamente em mobile

🧠 INSTRUÇÃO FINAL PARA A IA

Implemente o projeto completo seguindo rigorosamente este PRD.

Evite simplificações.

Priorize:

Qualidade do código

Organização

Fidelidade ao design

Experiência do usuário
