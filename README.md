# FinUp Pessoal V3 - Zerado

App de controle financeiro pessoal em React + TypeScript + Vite.

## O que foi ajustado

- App inicia totalmente zerado: sem cartão, sem transação, sem conta e sem empréstimo cadastrado.
- Botão `Zerar` limpa todos os dados.
- Configurado para GitHub Pages no repositório `/thteste/`.
- Firebase preparado com coleções separadas:
  - `cards`
  - `transactions`
  - `bills`
  - `debts`

## Rodar no computador

```bash
npm install
npm run dev
```

## Gerar para GitHub Pages

```bash
npm run build
```

Depois suba o conteúdo da pasta `dist` no GitHub Pages, ou use uma action de deploy.

## Firebase

1. Copie `.env.example` para `.env.local`.
2. Coloque os dados do Firebase.
3. Ative Firestore Database.
4. Ative Authentication com login anônimo.

Sem Firebase configurado, o app continua funcionando no navegador usando localStorage.
