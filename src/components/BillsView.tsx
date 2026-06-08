import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CalendarDays, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  FileCheck2,
  ListFilter
} from 'lucide-react';
import { AccountBill } from '../types';
import { CATEGORIES } from '../data/mockData';

interface BillsViewProps {
  bills: AccountBill[];
  onAddBill: (bill: Omit<AccountBill, 'id'>) => void;
  onDeleteBill: (id: string) => void;
  onToggleBillStatus: (id: string) => void;
}

export default function BillsView({
  bills,
  onAddBill,
  onDeleteBill,
  onToggleBillStatus,
}: BillsViewProps) {
  
  // Toggle form
  const [showAddForm, setShowAddForm] = useState(false);

  // Form States
  const [type, setType] = useState<'payable' | 'receivable'>('payable');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [recurrent, setRecurrent] = useState(false);
  const [description, setDescription] = useState('');

  // Filter conditions
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('pending');
  const [typeFilter, setTypeFilter] = useState<'all' | 'payable' | 'receivable'>('all');

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    onAddBill({
      type,
      title,
      amount: parseFloat(amount),
      dueDate,
      category,
      status: 'pending',
      recurrent,
      description: description || undefined,
    });

    // Reset fields
    setTitle('');
    setAmount('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setRecurrent(false);
    setShowAddForm(false);
  };

  const handleTypeChange = (newType: 'payable' | 'receivable') => {
    setType(newType);
    setCategory(newType === 'payable' ? CATEGORIES.expense[0] : CATEGORIES.income[0]);
  };

  // Filter logic
  const filteredBills = bills.filter(b => {
    // 1. Status Filter
    if (statusFilter !== 'all' && b.status !== statusFilter) {
      return false;
    }
    // 2. Type Filter
    if (typeFilter !== 'all' && b.type !== typeFilter) {
      return false;
    }
    return true;
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Count aggregate values for pending bills
  const totalPendingPayable = bills
    .filter(b => b.type === 'payable' && b.status === 'pending')
    .reduce((sum, b) => sum + b.amount, 0);

  const totalPendingReceivable = bills
    .filter(b => b.type === 'receivable' && b.status === 'pending')
    .reduce((sum, b) => sum + b.amount, 0);

  // Overdue check helper
  const getDaysDiff = (dateStr: string) => {
    const today = new Date(todayStr);
    const due = new Date(dateStr);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950 flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-indigo-600" />
            Contas a Pagar e Receber
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Controle datas de vencimento das contas de água, luz, aluguel e rendas futuras previstas.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-xs hover:shadow-xs transition-transform transform active:scale-95 duration-100 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nova Conta
        </button>
      </div>

      {/* 2. Add form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4"
        >
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Nova Agenda de Conta</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type tabs (Pagar vs Receber) */}
            <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100 max-w-xs">
              <button
                type="button"
                onClick={() => handleTypeChange('payable')}
                className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  type === 'payable' 
                    ? 'bg-rose-500 text-white shadow-xs' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingDown className="h-3.5 w-3.5" />
                A Pagar (Débito)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('receivable')}
                className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  type === 'receivable' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                A Receber (Renda)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="bill-title-input" className="text-xs font-semibold text-gray-600">Título / Nome</label>
                <input
                  id="bill-title-input"
                  type="text"
                  placeholder="Ex: Conta de Luz, Fatura Itaú, Aluguel"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label id="bill-amount-label" htmlFor="bill-amount-input" className="text-xs font-semibold text-gray-600">Valor (R$)</label>
                <input
                  id="bill-amount-input"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 220"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="bill-due-input" className="text-xs font-semibold text-gray-600">Data de Vencimento</label>
                <input
                  id="bill-due-input"
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="bill-category-select" className="text-xs font-semibold text-gray-600">Categoria da Conta</label>
                <select
                  id="bill-category-select"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                >
                  {(type === 'payable' ? CATEGORIES.expense : CATEGORIES.income).map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="bill-desc-input" className="text-xs font-semibold text-gray-600">Observações (Opcional)</label>
                <input
                  id="bill-desc-input"
                  type="text"
                  placeholder="Ex. boleto do e-mail"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
                />
              </div>

              <div className="flex items-center h-full pt-4">
                <label htmlFor="bill-recurrent-checkbox" className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-700">
                  <input
                    id="bill-recurrent-checkbox"
                    type="checkbox"
                    checked={recurrent}
                    onChange={e => setRecurrent(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 pointer-events-auto"
                  />
                  <span>Recorrente (Gera todo mês)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg shadow-xs transition-colors"
              >
                Salvar Conta
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 3. Bills Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">A Pagar Pendente (Boletos)</span>
            <p className="text-2xl font-bold font-mono text-rose-600">{formatBRL(totalPendingPayable)}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingDown className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">A Receber Previsto (Rendas)</span>
            <p className="text-2xl font-bold font-mono text-emerald-600">{formatBRL(totalPendingReceivable)}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 4. Filter section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-2">
          <ListFilter className="h-4.5 w-4.5 text-gray-500" />
          <span className="text-xs font-bold text-gray-600 uppercase">Filtrar Agenda</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status buttons group */}
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 text-xs">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === 'pending' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === 'paid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pagas / Liquidadas
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tudo
            </button>
          </div>

          {/* Type filter dropdown */}
          <select
            id="type-filter"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Filtro: Pagar + Receber</option>
            <option value="payable">Somente a Pagar</option>
            <option value="receivable">Somente a Receber</option>
          </select>
        </div>
      </div>

      {/* 5. Bills list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          <span className="text-xs font-bold text-gray-500 uppercase">{filteredBills.length} Contas Agendadas</span>
        </div>

        {filteredBills.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            Nenhuma conta a exibir de acordo com os filtros.
          </div>
        ) : (
          <div id="bills-ledger" className="divide-y divide-gray-50">
            {filteredBills.map(bill => {
              const isOverdue = bill.status === 'pending' && bill.dueDate < todayStr;
              const daysDiff = getDaysDiff(bill.dueDate);
              
              let statusText = '';
              let statusClass = '';
              
              if (bill.status === 'paid') {
                statusText = bill.type === 'payable' ? 'Paga' : 'Recebida';
                statusClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
              } else if (isOverdue) {
                statusText = 'Atrasada';
                statusClass = 'bg-rose-100 text-rose-800 border-rose-200 animation-pulse';
              } else if (daysDiff === 0) {
                statusText = 'Vence Hoje';
                statusClass = 'bg-amber-100 text-amber-800 border-amber-200';
              } else {
                statusText = `Vence em ${daysDiff} dia${daysDiff > 1 ? 's' : ''}`;
                statusClass = 'bg-slate-100 text-slate-700 border-slate-200';
              }

              return (
                <div 
                  key={bill.id} 
                  className={`p-4 sm:p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 transition-colors ${
                    isOverdue ? 'bg-red-50/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Toggle Indicator Button */}
                    <button
                      onClick={() => onToggleBillStatus(bill.id)}
                      className={`h-6.5 w-6.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        bill.status === 'paid'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-indigo-600 bg-white hover:bg-slate-50'
                      }`}
                      title={bill.status === 'paid' ? 'Marcar como pendente' : 'Marcar como liquidada/paga'}
                    >
                      {bill.status === 'paid' && <Check className="h-4 w-4 stroke-[3px]" />}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`text-sm font-bold text-gray-900 ${bill.status === 'paid' ? 'line-through opacity-50' : ''}`}>
                          {bill.title}
                        </h4>
                        
                        {bill.recurrent && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1 rounded-sm uppercase tracking-wider font-extrabold" title="Custo fixo mensal">
                            <RefreshCw className="h-2 w-2" />
                            Mensal
                          </span>
                        )}
                        
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${statusClass}`}>
                          {statusText}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-gray-500">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-150 text-[10px]">
                          {bill.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {bill.dueDate.split('-').reverse().join('/')}
                        </span>
                        {bill.description && (
                          <>
                            <span>•</span>
                            <span className="italic truncate max-w-xs">{bill.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between md:justify-end items-center gap-4 border-t md:border-0 border-gray-50 pt-3 md:pt-0">
                    <span className={`text-lg font-bold font-mono ${bill.type === 'payable' ? 'text-gray-900' : 'text-emerald-700'} ${bill.status === 'paid' ? 'opacity-55' : ''}`}>
                      {bill.type === 'payable' ? '-' : '+'}{formatBRL(bill.amount)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleBillStatus(bill.id)}
                        className={`text-xs py-1.5 px-3 rounded-lg font-semibold border transition-all ${
                          bill.status === 'paid'
                            ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            : bill.type === 'payable'
                            ? 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100/75'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/75'
                        }`}
                      >
                        {bill.status === 'paid' ? 'Ver pendente' : bill.type === 'payable' ? 'Pagar boleto' : 'Confirmar recebimento'}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Remover "${bill.title}" do calendário de compromissos?`)) {
                            onDeleteBill(bill.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Remover conta"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Helper text block on payment sync */}
      <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl flex items-start gap-2.5 text-xs text-gray-600">
        <FileCheck2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-gray-800">Sincronização Inteligente:</span> Quando você liquida uma conta ou confirma um recebimento nesta página, o aplicativo registra automaticamente o lançamento no histórico financeiro de transações do mês correspondente, para que seus relatórios e balanços de fluxo fiquem perfeitamente organizados!
        </div>
      </div>
    </div>
  );
}
