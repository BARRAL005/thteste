export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'money' | 'pix' | 'debit' | 'card_itau' | 'card_caixa' | 'card_other';

export interface Card {
  id: string;
  name: string;
  color: string;
  limit: number;
  closingDay: number;
  dueDay: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  category: string;
  paymentMethod: 'cash' | 'pix' | 'debit' | 'credit_card';
  cardId?: string; // If credit_card is selected, which card?
  status: 'paid' | 'pending';
}

export interface Debt {
  id: string;
  type: 'lent' | 'borrowed'; // lent = emprestei para alguém (contas a receber), borrowed = peguei emprestado (contas a pagar)
  person: string;
  amount: number;
  date: string;
  dueDate?: string;
  description: string;
  status: 'pending' | 'paid';
}

export interface AccountBill {
  id: string;
  type: 'payable' | 'receivable'; // pagar | receber
  title: string;
  amount: number;
  dueDate: string;
  category: string;
  status: 'pending' | 'paid';
  recurrent: boolean;
  description?: string;
}

export interface PersonalGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}
