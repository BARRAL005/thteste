import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Info, 
  TrendingDown, 
  ChevronRight, 
  Layers, 
  PieChart,
  Calendar
} from 'lucide-react';
import { Card, Transaction } from '../types';

interface CardsViewProps {
  cards: Card[];
  transactions: Transaction[];
  onAddCard: (card: Omit<Card, 'id'>) => void;
  onDeleteCard: (id: string) => void;
}

export default function CardsView({
  cards,
  transactions,
  onAddCard,
  onDeleteCard,
}: CardsViewProps) {
  
  // States for new card creation
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [color, setColor] = useState('from-indigo-600 to-blue-700');
  const [closingDay, setClosingDay] = useState('5');
  const [dueDay, setDueDay] = useState('12');

  const [selectedCardId, setSelectedCardId] = useState<string | null>(cards[0]?.id || null);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Predefined cool gradients for cards
  const CARD_GRADIENTS = [
    { label: 'Azul Caixa', value: 'from-blue-600 to-indigo-700' },
    { label: 'Laranja Itaú', value: 'from-orange-500 to-amber-600' },
    { label: 'Roxo Nubank', value: 'from-purple-600 to-indigo-800' },
    { label: 'Verde Cooperativa', value: 'from-emerald-600 to-teal-700' },
    { label: 'Grafite Premium', value: 'from-gray-800 to-slate-950' },
    { label: 'Rosa Magenta', value: 'from-pink-600 to-rose-700' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !limit) return;

    onAddCard({
      name,
      limit: parseFloat(limit),
      color,
      closingDay: parseInt(closingDay),
      dueDay: parseInt(dueDay),
    });

    // Reset fields
    setName('');
    setLimit('');
    setClosingDay('5');
    setDueDay('12');
    setShowAddForm(false);
  };

  // Get current invoice amount for a card
  const getCardBillTotal = (cardId: string) => {
    return transactions
      .filter(t => t.paymentMethod === 'credit_card' && t.cardId === cardId && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Get transactions linked to a card
  const getCardTransactions = (cardId: string) => {
    return transactions
      .filter(t => t.paymentMethod === 'credit_card' && t.cardId === cardId)
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  const activeCard = cards.find(c => c.id === selectedCardId) || cards[0];

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950 flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-violet-600" />
            Meus Cartões de Créditox
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cadastre novos cartões, consulte faturas, datas de fechamento e o limite disponível.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm rounded-xl shadow-xs hover:shadow-xs transition-transform transform active:scale-95 duration-100 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Novo Cartão
        </button>
      </div>

      {/* 2. Add New Card Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4"
        >
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Novo Cartão de Crédito</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="card-name-input" className="text-xs font-semibold text-gray-600">Apelido do Cartão</label>
              <input
                id="card-name-input"
                type="text"
                placeholder="Ex: Itaú Visa, Caixa Elo"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-violet-500 bg-gray-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="card-limit-input" className="text-xs font-semibold text-gray-600">Limite Total (R$)</label>
              <input
                id="card-limit-input"
                type="number"
                step="0.01"
                placeholder="Ex: 5000"
                required
                value={limit}
                onChange={e => setLimit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-violet-500 bg-gray-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="card-color-input" className="text-xs font-semibold text-gray-600">Estilo Visual (Cor)</label>
              <select
                id="card-color-input"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-violet-500 bg-slate-50"
              >
                {CARD_GRADIENTS.map(grad => (
                  <option key={grad.value} value={grad.value}>
                    {grad.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="card-closing-input" className="text-xs font-semibold text-gray-600">Dia de Fechamento</label>
              <input
                id="card-closing-input"
                type="number"
                min="1"
                max="31"
                value={closingDay}
                onChange={e => setClosingDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-violet-500 bg-gray-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="card-due-input" className="text-xs font-semibold text-gray-600">Dia de Vencimento</label>
              <input
                id="card-due-input"
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={e => setDueDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-violet-500 bg-gray-50/50"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors"
              >
                Cadastrar Cartão
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 3. Cards Selector & Quick Interactive Display */}
      {cards.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center text-gray-400">
          <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="font-semibold text-gray-600">Nenhum cartão cadastrado</p>
          <p id="no-cards-tip" className="text-xs mt-1">Cadastre seus cartões de crédito clicando no botão acima para monitorar limites.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card list columns */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Selecione o Cartão</h3>
            <div className="space-y-3">
              {cards.map(card => {
                const bill = getCardBillTotal(card.id);
                const isSelected = card.id === selectedCardId;
                return (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                      isSelected 
                        ? 'bg-violet-50 border-violet-200 ring-1 ring-violet-200 shadow-xs' 
                        : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl text-white bg-gradient-to-r ${card.color} shrink-0`}>
                        <CreditCard className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 truncate">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{card.name}</h4>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Lim. Disp:</span>
                          <span className="font-semibold text-gray-800">{formatBRL(card.limit - bill)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Detailed showcase */}
          {activeCard && (
            <div className="lg:col-span-2 space-y-6">
              {/* Main Card graphic with full spec */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-gray-500">Exibição do Cartão</span>
                    <span className="text-xs bg-gray-50 px-2 py-0.5 rounded border border-gray-100">Ativo</span>
                  </div>
                  
                  {/* Delete button (prevent deleting the last card or mock values blindly, but let users customize) */}
                  <button
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja excluir o cartão "${activeCard.name}"?`)) {
                        onDeleteCard(activeCard.id);
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 self-start sm:self-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir Cartão
                  </button>
                </div>

                {/* Credit Card graphic visual */}
                <div className={`p-6 rounded-2xl bg-gradient-to-br ${activeCard.color} text-white shadow-lg space-y-8 aspect-[1.8/1] relative overflow-hidden`}>
                  {/* Glowing blobs inside card */}
                  <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-white/5 rounded-full blur-xl"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                  <div className="flex justify-between items-start z-10 relative">
                    <div>
                      <p className="text-xs opacity-80 uppercase tracking-widest font-mono">Cartão de Crédito</p>
                      <h3 className="text-xl font-bold tracking-tight mt-1">{activeCard.name}</h3>
                    </div>
                    <div className="h-9 w-14 bg-white/15 backdrop-blur-md rounded-lg flex items-center justify-center font-bold text-xs tracking-wider">
                      {activeCard.name.toUpperCase().slice(0, 5)}
                    </div>
                  </div>

                  <div className="z-10 relative">
                    <p className="text-[10px] opacity-75 uppercase tracking-wider font-mono">Fatura Atual do Mês</p>
                    <p className="text-3xl font-extrabold tracking-tight font-mono">{formatBRL(getCardBillTotal(activeCard.id))}</p>
                  </div>

                  <div className="flex justify-between items-end z-10 relative">
                    <div className="text-xs font-mono">
                      <p className="opacity-75 text-[9px]">DIAS CHAVE</p>
                      <p className="font-semibold">Melhor Compra: {activeCard.closingDay} | Paga: {activeCard.dueDay}</p>
                    </div>
                    <div className="text-right">
                      <p className="opacity-75 text-[9px]">LIMITE DISPONÍVEL</p>
                      <p className="text-sm font-bold font-mono">{formatBRL(activeCard.limit - getCardBillTotal(activeCard.id))}</p>
                    </div>
                  </div>
                </div>

                {/* Card limit summary indicators */}
                <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-5 text-center">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Fatura Atual</p>
                    <p className="text-sm font-bold text-rose-600 font-mono">
                      {formatBRL(getCardBillTotal(activeCard.id))}
                    </p>
                  </div>
                  <div className="space-y-1 border-x border-gray-100">
                    <p className="text-xs text-gray-500">Limite Disponível</p>
                    <p className="text-sm font-bold text-emerald-600 font-mono">
                      {formatBRL(activeCard.limit - getCardBillTotal(activeCard.id))}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Limite Total</p>
                    <p className="text-sm font-bold text-gray-900 font-mono">
                      {formatBRL(activeCard.limit)}
                    </p>
                  </div>
                </div>

                {/* Closing info notification */}
                <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-100 flex items-start gap-2 text-xs text-sky-800">
                  <Info className="h-4.5 w-4.5 text-sky-600 shrink-0" />
                  <div>
                    <span className="font-semibold">Período de Faturamento: </span>
                    Sua fatura fecha todo dia <span className="font-bold">{activeCard.closingDay}</span>. Compras após esse dia entram na fatura seguinte. O vencimento para pagamento é dia <span className="font-bold">{activeCard.dueDay}</span>.
                  </div>
                </div>

                {/* Card Transactions history list */}
                <div className="space-y-3.5 pt-2">
                  <h4 className="text-sm font-bold text-gray-900">Histórico de Compras no {activeCard.name}</h4>
                  
                  {getCardTransactions(activeCard.id).length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-150 rounded-xl text-gray-400 text-xs">
                      Nenhuma compra faturada neste cartão até o momento.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto pr-1">
                      {getCardTransactions(activeCard.id).map(trans => (
                        <div key={trans.id} className="py-2.5 flex justify-between items-center text-xs">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-gray-800">{trans.description}</p>
                            <p className="text-gray-400">{trans.date.split('-').reverse().join('/')} • {trans.category}</p>
                          </div>
                          <span className="font-bold text-rose-600 font-mono">
                            -{formatBRL(trans.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
