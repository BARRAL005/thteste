import { Card, Transaction, Debt, AccountBill } from '../types';

export const INITIAL_CARDS: Card[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_DEBTS: Debt[] = [];

export const INITIAL_BILLS: AccountBill[] = [];

export const CATEGORIES = {
  income: ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Reembolso', 'Outros'],
  expense: ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Assinaturas', 'Lazer', 'Impostos', 'Vestuário', 'Outros'],
};
