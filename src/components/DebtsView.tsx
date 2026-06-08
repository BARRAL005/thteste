import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  HandCoins, 
  Plus, 
  Trash2, 
  Check, 
  UserPlus2, 
  Calendar, 
  MessageSquare,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CircleDot
} from 'lucide-react';
import { Debt } from '../types';

interface DebtsViewProps {
  debts: Debt[];
  onAddDebt: (debt: Omit<Debt, 'id'>) => void;
  onDeleteDebt: (id: string) => void;
  onToggleDebtStatus: (id: string) => void;
}

export default function DebtsView({
  debts,
  onAddDebt,
  onDeleteDebt,
  onToggleDebtStatus,
}: DebtsViewProps) {
  
  // States
  const [showAddForm, setShowAddForm] = useState(false);
  const [type, setType] = useState<'lent' | 'borrowed'>('lent');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  // Local Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('pending');

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person || !amount) return;

    onAddDebt({
      type,
      person,
      amount: parseFloat(amount),
      date,
      dueDate: dueDate || undefined,
      description,
      status: 'pending',
    });

    // Reset Form
    setPerson('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setDescription('');
    setShowAddForm(false);
  };

  // Filter list
  const filteredDebts = debts.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) {
      return false;
    }
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  // Metrics
  const pendingLent = debts
    .filter(d => d.type === 'lent' && d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  const pendingBorrowed = debts
    .filter(d => d.type === 'borrowed' && d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950 flex items-center gap-2">
            <HandCoins className="h-8 w-8 text-amber-500" />
            Dinheiro Emprestado (Cobranças)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Controle empréstimos feitos a amigos ou parentes e dívidas que você tenha que pagar a pessoas físicas.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm rounded-xl shadow-xs hover:shadow-xs transition-transform transform active:scale-95 duration-100 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Registrar Acordo
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
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Novo Registro de Empréstimo</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Toggle Switch */}
            <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100 max-w-sm">
              <button
                type="button"
                onClick={() => setType('lent')}
                className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  type === 'lent' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Eu Emprestei (A Receber)
              </button>
              <button
                type="button"
                onClick={() => setType('borrowed')}
                className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  type === 'borrowed' 
                    ? 'bg-amber-500 text-white shadow-xs' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowDownRight className="h-3.5 w-3.5" />
                Peguei Emprestado (A Pagar)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="debt-person-input" className="text-xs font-semibold text-gray-600">Nome da Pessoa</label>
                <input
                  id="debt-person-input"
                  type="text"
                  placeholder="Ex: João Silva, Minha Mãe, Maria"
                  required
                  value={person}
                  onChange={e => setPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-gray-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label id="debt-amount-label" htmlFor="debt-amount-input" className="text-xs font-semibold text-gray-600">Valor (R$)</label>
                <input
                  id="debt-amount-input"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 250"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-gray-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="debt-date-input" className="text-xs font-semibold text-gray-600">Data do Empréstimo</label>
                <input
                  id="debt-date-input"
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-gray-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="debt-due-input" className="text-xs font-semibold text-gray-600">Previsão de Acerto (Opcional)</label>
                <input
                  id="debt-due-input"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-gray-50/50"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="debt-desc-input" className="text-xs font-semibold text-gray-600">Motivo do Empréstimo / Detalhes</label>
                <input
                  id="debt-desc-input"
                  type="text"
                  placeholder="Ex: Para churrasco do findi, conserto do encanamento..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-gray-50/50"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-lg shadow-xs transition-colors"
              >
                Salvar Acordo
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 3. Debts Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lent Box */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase">Eu Emprestei</span>
            <p className="text-2xl font-bold font-mono text-emerald-600">{formatBRL(pendingLent)}</p>
            <p className="text-[10px] text-gray-400">Total pendente de retorno</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowUpRight className="h-6 w-6" />
          </div>
        </div>

        {/* Borrowed Box */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase">Peguei Emprestado</span>
            <p className="text-2xl font-bold font-mono text-amber-500">{formatBRL(pendingBorrowed)}</p>
            <p className="text-[10px] text-gray-400">Total que devo liquidar</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <ArrowDownRight className="h-6 w-6" />
          </div>
        </div>

        {/* Liquid differential */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-150 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase">Diferencial Líquido</span>
            <p className={`text-2xl font-bold font-mono ${pendingLent >= pendingBorrowed ? 'text-indigo-600' : 'text-red-600'}`}>
              {formatBRL(pendingLent - pendingBorrowed)}
            </p>
            <p className="text-[10px] text-gray-400">
              {pendingLent >= pendingBorrowed ? 'Resultado positivo a reaver' : 'Você deve mais do que tem a receber'}
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CircleDot className="h-6 w-6 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 4. Filters */}
      <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs gap-1.5 max-w-sm self-start">
        <button
          onClick={() => setStatusFilter('pending')}
          className={`flex-1 text-center py-2 px-3 rounded-lg font-semibold transition-colors ${
            statusFilter === 'pending' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setStatusFilter('paid')}
          className={`flex-1 text-center py-2 px-3 rounded-lg font-semibold transition-colors ${
            statusFilter === 'paid' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Liquidados
        </button>
        <button
          onClick={() => setStatusFilter('all')}
          className={`flex-1 text-center py-2 px-3 rounded-lg font-semibold transition-colors ${
            statusFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Todos
        </button>
      </div>

      {/* 5. Loans List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          <span className="text-xs font-bold text-gray-500 uppercase">{filteredDebts.length} Empréstimos Cadastrados</span>
        </div>

        {filteredDebts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            Nenhum empréstimo ativo para exibir.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredDebts.map(debt => {
              const isOverdue = debt.status === 'pending' && debt.dueDate && debt.dueDate < todayStr;
              
              return (
                <div 
                  key={debt.id} 
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-colors ${
                    isOverdue ? 'bg-red-50/15' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Circle checkbox logic */}
                    <button
                      onClick={() => onToggleDebtStatus(debt.id)}
                      className={`h-6.5 w-6.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        debt.status === 'paid'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-amber-300 hover:border-amber-600 bg-white hover:bg-amber-50/50'
                      }`}
                      title={debt.status === 'paid' ? 'Reverter para pendente' : 'Marcar como quitado'}
                    >
                      {debt.status === 'paid' && <Check className="h-4 w-4 stroke-[3px]" />}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`text-sm font-bold text-gray-900 ${debt.status === 'paid' ? 'line-through opacity-50' : ''}`}>
                          {debt.type === 'lent' ? 'Emprestado para' : 'Peguei com'}: <span className="text-amber-800 font-extrabold">{debt.person}</span>
                        </h4>
                        
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 font-black uppercase rounded border border-red-200">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Atrasado!
                          </span>
                        )}

                        {debt.status === 'paid' && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                            Quitado
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Feito em: {debt.date.split('-').reverse().join('/')}
                        </span>
                        {debt.dueDate && (
                          <>
                            <span>•</span>
                            <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                              Acerto previsto: {debt.dueDate.split('-').reverse().join('/')}
                            </span>
                          </>
                        )}
                      </div>

                      {debt.description && (
                        <div className="flex items-start gap-1 mt-2 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded px-2.5 py-1">
                          <MessageSquare className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="italic">{debt.description}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between sm:justify-end items-center gap-4 border-t sm:border-0 border-gray-50 pt-2.5 sm:pt-0">
                    <span className={`text-base font-extrabold font-mono ${debt.type === 'lent' ? 'text-emerald-700' : 'text-gray-900'} ${debt.status === 'paid' ? 'opacity-50 line-through' : ''}`}>
                      {debt.type === 'lent' ? '+' : '-'}{formatBRL(debt.amount)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleDebtStatus(debt.id)}
                        className={`text-xs py-1.5 px-3 rounded-lg font-semibold border transition-all ${
                          debt.status === 'paid'
                            ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            : debt.type === 'lent'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/75'
                            : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/75'
                        }`}
                      >
                        {debt.status === 'paid' ? 'Ativar pendente' : debt.type === 'lent' ? 'Confirmar devolução' : 'Pagar dívida'}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Remover acerto de empréstimo de "${debt.person}"?`)) {
                            onDeleteDebt(debt.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Remover Acordo"
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

    </div>
  );
}
