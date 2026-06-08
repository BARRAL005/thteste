import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Filter, 
  Search, 
  CreditCard, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  Info 
} from 'lucide-react';
import { Card, Transaction, TransactionType } from '../types';
import { CATEGORIES } from '../data/mockData';

interface TransactionsViewProps {
  cards: Card[];
  transactions: Transaction[];
  selectedCardIdFilter: string | null;
  onSetSelectedCardIdFilter: (id: string | null) => void;
  onAddTransaction: (trans: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function TransactionsView({
  cards,
  transactions,
  selectedCardIdFilter,
  onSetSelectedCardIdFilter,
  onAddTransaction,
  onDeleteTransaction,
}: TransactionsViewProps) {
  
  // States for toggle-expand form
  const [showAddForm, setShowAddForm] = useState(false);

  // States for adding transaction
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'pix' | 'debit' | 'credit_card'>('cash');
  const [cardId, setCardId] = useState(cards[0]?.id || '');

  // Filter conditions
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    onAddTransaction({
      type,
      description,
      amount: parseFloat(amount),
      date,
      category,
      paymentMethod,
      cardId: paymentMethod === 'credit_card' ? cardId : undefined,
      status: 'paid',
    });

    // Reset Form
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    // Set appropriate initial categories
    setCategory(type === 'expense' ? CATEGORIES.expense[0] : CATEGORIES.income[0]);
    setShowAddForm(false);
  };

  // Change type triggers category update
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'expense' ? CATEGORIES.expense[0] : CATEGORIES.income[0]);
  };

  // Filter Logic
  const filteredTransactions = transactions.filter(t => {
    // 1. Text Search
    if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // 2. Type Filter
    if (typeFilter !== 'all' && t.type !== typeFilter) {
      return false;
    }
    // 3. Category Filter
    if (categoryFilter !== 'all' && t.category !== categoryFilter) {
      return false;
    }
    // 4. Card Filter (Filter by cards)
    if (selectedCardIdFilter) {
      if (t.paymentMethod !== 'credit_card' || t.cardId !== selectedCardIdFilter) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  // Totals in the list currently filtered
  const filteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950 flex items-center gap-2">
            <Layers className="h-8 w-8 text-emerald-600" />
            Transações e Lançamentos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lance receitas, compre de cartões, filtre despesas por método de pagamento.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-xs hover:shadow-xs transition-transform transform active:scale-95 duration-100 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Novo Lançamento
        </button>
      </div>

      {/* 2. Add New Transaction Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4"
        >
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Novo Lançamento Financeiro</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type selector */}
            <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100 max-w-xs">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  type === 'expense' 
                    ? 'bg-rose-500 text-white shadow-xs' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingDown className="h-3.5 w-3.5" />
                Despesa / Gasto
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  type === 'income' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Receita / Entrada
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="description-input" className="text-xs font-semibold text-gray-600">Descrição / Título</label>
                <input
                  id="description-input"
                  type="text"
                  placeholder="Ex: Aluguel, Supermercado, Job extra"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-gray-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label id="payment-amount-label" htmlFor="amount-input" className="text-xs font-semibold text-gray-600">Valor (R$)</label>
                <input
                  id="amount-input"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 150.00"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-gray-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="date-input" className="text-xs font-semibold text-gray-600">Data de Entrada</label>
                <input
                  id="date-input"
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-gray-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="category-select" className="text-xs font-semibold text-gray-600">Categoria</label>
                <select
                  id="category-select"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                >
                  {(type === 'expense' ? CATEGORIES.expense : CATEGORIES.income).map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="paymentMethod-select" className="text-xs font-semibold text-gray-600">Forma de Pagamento</label>
                <select
                  id="paymentMethod-select"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                >
                  <option value="pix">PIX / Transferência</option>
                  <option value="cash">Dinheiro em Espécie</option>
                  <option value="debit">Débito</option>
                  {type === 'expense' && <option value="credit_card">Cartão de Crédito</option>}
                </select>
              </div>

              {/* Conditional rendering for credit cards choices */}
              {type === 'expense' && paymentMethod === 'credit_card' && (
                <div className="space-y-1.5">
                  <label htmlFor="cardId-select" className="text-xs font-semibold text-gray-600">Qual Cartão de Crédito?</label>
                  {cards.length === 0 ? (
                    <div className="text-xs text-red-500 font-medium py-2.5">
                      Nenhum cartão cadastrado. Cadastre no menu de Cartões primeiro!
                    </div>
                  ) : (
                    <select
                      id="cardId-select"
                      value={cardId}
                      onChange={e => setCardId(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 bg-blue-50/30 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-violet-500"
                    >
                      {cards.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={type === 'expense' && paymentMethod === 'credit_card' && cards.length === 0}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold text-sm rounded-lg shadow-xs transition-colors"
              >
                Salvar Lançamento
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 3. Filter Hub */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-2.5">
          <Filter className="h-4.5 w-4.5 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Filtros Avançados</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-1">
            <label htmlFor="search-input" className="text-[11px] font-bold text-gray-500 uppercase">Buscar descrição</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-3 h-3.5 w-3.5 text-gray-400" />
              <input
                id="search-input"
                type="text"
                placeholder="Ex. Supermercado..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-100 rounded-lg text-xs bg-gray-50 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1">
            <label htmlFor="type-filter-select" className="text-[11px] font-bold text-gray-500 uppercase">Tipo</label>
            <select
              id="type-filter-select"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-100 rounded-lg text-xs bg-gray-50 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Todas as transações</option>
              <option value="income">Apenas Receitas</option>
              <option value="expense">Apenas Despesas</option>
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label htmlFor="category-filter-select" className="text-[11px] font-bold text-gray-500 uppercase">Categoria</label>
            <select
              id="category-filter-select"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-100 rounded-lg text-xs bg-gray-50 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Todas as categorias</option>
              {[...CATEGORIES.income, ...CATEGORIES.expense].map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by credit card */}
          <div className="space-y-1">
            <label htmlFor="card-filter" className="text-[11px] font-bold text-gray-500 uppercase">Cartão de Crédito</label>
            <select
              id="card-filter"
              value={selectedCardIdFilter || ''}
              onChange={e => onSetSelectedCardIdFilter(e.target.value || null)}
              className="w-full px-3 py-2 border border-blue-100 rounded-lg text-xs bg-blue-50/40 text-blue-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Qualquer meio (Tudo)</option>
              {cards.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (Somente este)
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedCardIdFilter && (
          <div className="flex justify-between items-center bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 text-xs text-blue-800">
            <span className="flex items-center gap-1.5 font-medium">
              <CreditCard className="h-4 w-4" />
              Filtrado por cartão: {cards.find(c => c.id === selectedCardIdFilter)?.name}
            </span>
            <button
              onClick={() => onSetSelectedCardIdFilter(null)}
              className="font-bold underline text-blue-600 hover:text-blue-800"
            >
              Excluir filtro de cartão
            </button>
          </div>
        )}
      </div>

      {/* 4. Transactions summary banner */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            <span className="text-xs text-emerald-800 font-semibold">Total Receitas Filtradas:</span>
          </div>
          <span className="text-sm font-bold text-emerald-700 font-mono">{formatBRL(filteredIncome)}</span>
        </div>
        <div className="bg-rose-50/35 border border-rose-100 p-4 rounded-xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ArrowDownRight className="h-4 w-4 text-rose-600" />
            <span className="text-xs text-rose-800 font-semibold">Total Despesas Filtradas:</span>
          </div>
          <span className="text-sm font-bold text-rose-700 font-mono">{formatBRL(filteredExpense)}</span>
        </div>
      </div>

      {/* 5. Transactions list table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-500 uppercase">{filteredTransactions.length} Lançamentos Encontrados</span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            Nenhuma transação atende aos filtros atuais.
          </div>
        ) : (
          <div className="divide-y divide-gray-50 overflow-x-auto">
            {filteredTransactions.map(trans => {
              const cardName = trans.cardId ? cards.find(c => c.id === trans.cardId)?.name : null;
              
              return (
                <div key={trans.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl text-white ${trans.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                      {trans.type === 'income' ? (
                        <TrendingUp className="h-4.5 w-4.5" />
                      ) : (
                        <TrendingDown className="h-4.5 w-4.5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{trans.description}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-gray-500">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-150 text-[10px] font-medium">
                          {trans.category}
                        </span>
                        <span>•</span>
                        <span>
                          {trans.paymentMethod === 'credit_card' ? (
                            <span className="text-violet-600 font-medium flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              Cartão: {cardName || 'Não especificado'}
                            </span>
                          ) : trans.paymentMethod === 'pix' ? (
                            'PIX'
                          ) : trans.paymentMethod === 'debit' ? (
                            'Débito auto'
                          ) : (
                            'Dinheiro'
                          )}
                        </span>
                        <span>•</span>
                        <span>{trans.date.split('-').reverse().join('/')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between sm:justify-end items-center gap-4 border-t sm:border-0 border-gray-50 pt-2.5 sm:pt-0">
                    <span className={`text-base font-bold font-mono ${trans.type === 'income' ? 'text-emerald-700' : 'text-gray-900'}`}>
                      {trans.type === 'income' ? '+' : '-'}{formatBRL(trans.amount)}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir a transação "${trans.description}"?`)) {
                          onDeleteTransaction(trans.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Excluir Lançamento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
