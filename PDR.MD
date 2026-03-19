🧾 PRODUCT REQUIREMENTS DOCUMENT (PRD v2)
🟢 PROJECT NAME

Wedding RSVP System — Eliel & Larissa (v2 Enhanced)

🧩 OVERVIEW

Este projeto consiste em um sistema completo de confirmação de presença (RSVP) para casamento, com interface moderna, responsiva e elegante.

O sistema possui duas áreas principais:

Área pública (convidado)

Área administrativa (gestão completa)

A aplicação é 100% client-side, utilizando localStorage como persistência.

🎯 OBJECTIVES

Facilitar confirmação de presença dos convidados

Permitir gestão eficiente da lista pelo administrador

Melhorar experiência com automação (importação de lista)

Manter design sofisticado e coerente com convite

👥 USER ROLES
Guest (Convidado)

Digita nome

Confirma presença

Pode voltar ao convite

Pode acessar contato

Admin (Administrador)

Login

Gerenciar convidados

Importar lista em massa

Configurar link de contato

🔐 AUTHENTICATION

Username: ELadmin

Password: 30052026

Autenticação client-side (sem backend)

🧠 CORE FEATURES
✅ RSVP SYSTEM (ATUALIZADO)
Fluxo:

Usuário digita nome

Sistema valida

Retorna:

Status	Ação
Confirmado	Salva e exibe sucesso
Já confirmado	Exibe aviso
Não encontrado	Exibe erro
🔘 BOTÃO "VOLTAR AO CONVITE" (NOVO)

Substituir:

❌ "Site do casal"
✅ "Voltar ao convite"

Ação:

Redirecionar para:

https://elielelarissaconvite.my.canva.site/eliel-larissa-site
📞 SISTEMA "FALE CONOSCO" (ATUALIZADO)
Novo comportamento:

O botão "Fale Conosco" será dinâmico

O link será configurado pelo ADMIN

Admin define:

Link do WhatsApp (ou qualquer URL)

Armazenamento:
contact_link: string
Comportamento:

Se existir → botão aparece

Se não → botão oculto

🧑‍💼 ADMIN PANEL (UPGRADE)
📥 IMPORTAÇÃO DE LISTA (NOVA FEATURE PRINCIPAL)
Objetivo:

Permitir adicionar convidados em massa

📂 Tipos de arquivo suportados:

.csv

.txt

.xlsx (opcional se suportado)

📌 Regras:

Cada linha = 1 convidado

Ignorar duplicados automaticamente

Aplicar normalização (lowercase)

📊 Fluxo:

Admin clica em "Importar lista"

Seleciona arquivo

Sistema processa conteúdo

Extrai nomes

Adiciona automaticamente à lista

Exibe resultado:

Exemplo:

50 nomes importados

45 adicionados

5 duplicados ignorados

📦 Parsing esperado:
CSV:
João Silva
Maria Souza
Carlos Lima
TXT:
João Silva
Maria Souza
⚙️ Implementação esperada:

Input type="file"

FileReader API

Parser simples (split por linha)

Função reutilizável no guests.ts

📋 ADMIN FEATURES (COMPLETO)
Mantém:

Adicionar manual

Editar

Remover

Visualizar confirmados

Adiciona:

Importação em massa

Configuração do link de contato

💾 DATA MODEL (ATUALIZADO)
wedding_guests: string[]
wedding_confirmed: string[]
contact_link: string
🧠 BUSINESS RULES (ATUALIZADAS)

Adicionar:

Importação ignora duplicatas

Arquivos inválidos devem retornar erro amigável

Nomes vazios devem ser ignorados

Trim automático

🎨 UI REQUIREMENTS (ATUALIZADO)
Admin:

Adicionar seção:

📥 Importar Lista

Botão upload

Feedback visual

Status da importação

📞 Configurar Contato

Input de URL

Botão salvar

Feedback de sucesso

🔁 USER FLOW (ATUALIZADO)
Guest:

Acessa site

Digita nome

Confirma

Vê feedback

Pode:

Voltar ao convite

Falar com organizador (se configurado)

Admin:

Login

Dashboard

Pode:

Adicionar manualmente

Importar lista (NOVO)

Editar/remover

Configurar contato (NOVO)

⚠️ CONSTRAINTS

Manter stack existente:

React + TypeScript + Vite + Tailwind

Não adicionar backend

Código modular

Reutilizar guests.ts

📦 EXPECTED OUTPUT

A IA deve:

Atualizar código existente (não recriar do zero)

Implementar novas features:

Importação de lista

Configuração de contato

Botão atualizado

Manter design atual

Garantir funcionamento completo

🚀 SUCCESS CRITERIA

Admin consegue importar lista com 1 clique

Convidados são adicionados automaticamente

Botão "Voltar ao convite" funciona corretamente

Link de contato é dinâmico

Nenhuma funcionalidade existente quebra