# Linko

Sistema completo para criadores venderem produtos, publicar uma página pública e liberar acesso a conteúdos exclusivos após pagamento.

## Funcionalidades entregues

- Autenticação com cadastro, login, logout e recuperação de senha.
- Onboarding com nome da página, username único, bio opcional, foto opcional e preview do link.
- Dashboard com vendas, compradores, produtos, histórico de transações e plano atual.
- Página pública em `/:slug` com foto, nome, bio, blocos e produtos.
- Editor com blocos de links, textos, produtos e conteúdos exclusivos, além de reordenação e preview.
- Produtos simples e digitais, com upload do arquivo digital para Firebase Storage.
- Checkout Mercado Pago com webhook e atualização automática de status (`pending`, `paid`, `refused`).
- Área de membros baseada em compras aprovadas.
- Estrutura Firestore com coleções `users`, `pages`, `blocks`, `products`, `purchases`, `transactions` e `access`.
- Regras de segurança para Firestore e Storage.

## Estrutura de pastas

```txt
src/
  components/
  contexts/
  lib/
  pages/
    auth/
    dashboard/
    public/
server.ts
firestore.rules
storage.rules
vercel.json
```

## Variáveis de ambiente

Copie `.env.example` para `.env`.

### Obrigatórias

- `APP_URL`: URL pública da aplicação.
- `FIREBASE_SERVICE_ACCOUNT_KEY`: JSON da service account do Firebase em uma única linha.
- `FIREBASE_STORAGE_BUCKET`: bucket do Storage.
- `MP_ACCESS_TOKEN`: access token do Mercado Pago.
- `MP_WEBHOOK_SECRET`: chave do webhook do Mercado Pago.

## Desenvolvimento local

```bash
npm install
npm run dev
```

A aplicação roda com Express + Vite em `http://localhost:3000`.

## Deploy na Vercel

1. Suba o projeto para um repositório Git.
2. Importe o repositório na Vercel.
3. Configure as variáveis do `.env.example` no painel da Vercel.
4. Configure `APP_URL` com a URL final do projeto.
5. Faça o deploy.
6. No Mercado Pago, configure o webhook para `https://seu-dominio/api/webhooks/mercadopago`.
7. Publique também as regras com Firebase CLI:

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Modelo de dados

### `users/{uid}`
- Dados da conta e preferências visuais.

### `pages/{slug}`
- Página pública com slug único.

### `blocks/{blockId}`
- Blocos renderizados na página pública.

### `products/{productId}`
- Produtos simples e digitais.

### `purchases/{purchaseId}`
- Compras criadas no checkout.

### `transactions/{purchaseId}`
- Espelho da transação para o dashboard.

### `access/{purchaseId_productId}`
- Controle de acesso liberado após pagamento.
