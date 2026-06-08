import React from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  HandCoins, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, Transaction, Debt, AccountBill } from '../types';

interface DashboardProps {
  cards: Card[];
  transactions: Transaction[];
  debts: Debt[];
  bills: AccountBill[];
  onNavigate: (tab: string) => void;
  onSelectCardFilter: (cardId: string | null) => void;
}

export default function Dashboard({
  cards,
  transactions,
  debts,
  bills,
  onNavigate,
  onSelectCardFilter,
}: DashboardProps) {
  
  // Format currency
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // 1. Calculations
  // Total Income (Salary & other positive types in current month / general list)
  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  // Total Expense (From transactions & paid bills)
  const totalExpense = transactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  // Remaining general balance (in cash/checking account, i.e., cash + pix - any non-credit expenses)
  // Let's assume income counts as direct deposits, and only non-credit expenses affect this immediate cash balance
  const cashIncome = totalIncome;
  const cashExpense = transactions
    .filter(t => t.type === 'expense' && t.status === 'paid' && t.paymentMethod !== 'credit_card')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalCashBalance = cashIncome - cashExpense;

  // Active money lent (dinheiro que emprestei e ainda não recebi)
  const activeLent = debts
    .filter(d => d.type === 'lent' && d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  // Active money borrowed (dinheiro que peguei emprestado e tenho que pagar)
  const activeBorrowed = debts
    .filter(d => d.type === 'borrowed' && d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  // Total direct bills payable (contas a pagar pendentes)
  const pendingPayable = bills
    .filter(b => b.type === 'payable' && b.status === 'pending')
    .reduce((sum, b) => sum + b.amount, 0);

  // Total direct bills receivable (contas a receber pendentes)
  const pendingReceivable = bills
    .filter(b => b.type === 'receivable' && b.status === 'pending')
    .reduce((sum, b) => sum + b.amount, 0);

  // Credit Card details & billing
  const getCardBill = (cardId: string) => {
    return transactions
      .filter(t => t.paymentMethod === 'credit_card' && t.cardId === cardId && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const totalCardSpent = cards.reduce((sum, card) => sum + getCardBill(card.id), 0);

  // Overdue counters
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueBillsCount = bills.filter(
    b => b.type === 'payable' && b.status === 'pending' && b.dueDate < todayStr
  ).length;

  const overdueLentCount = debts.filter(
    d => d.type === 'lent' && d.status === 'pending' && d.dueDate && d.dueDate < todayStr
  ).length;

  // Category chart calculations for expenses
  const expensesByCategory: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

  const categoryEntries = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);
  const maxCategoryVal = categoryEntries[0]?.[1] || 1;

  // Color palette for category rows
  const categoryColors: Record<string, string> = {
    Alimentação: 'bg-emerald-500',
    Moradia: 'bg-rose-500',
    Transporte: 'bg-blue-500',
    Saúde: 'bg-teal-500',
    Educação: 'bg-indigo-500',
    Assinaturas: 'bg-purple-500',
    Lazer: 'bg-amber-500',
    Impostos: 'bg-orange-500',
    Vestuário: 'bg-pink-500',
    Outros: 'bg-gray-400',
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950">Resumo Financeiro</h1>
          <p className="text-sm text-gray-500 mt-1">Acompanhe seu saldo, faturas de cartões e contas em um único painel.</p>
        </div>
        <div id="quick-action-time" className="text-xs font-mono text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          Atualizado em tempo real
        </div>
      </div>

      {/* 2. Key Metrics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Líquido</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              {formatBRL(totalCashBalance - totalCardSpent)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs">
              <span className="font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                {formatBRL(totalIncome)}
              </span>
              <span className="text-gray-400">em receitas</span>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Faturas e Gastos</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              {formatBRL(totalExpense)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs">
              <span className="font-semibold text-rose-600 flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-0.5" />
                {formatBRL(totalCardSpent)}
              </span>
              <span className="text-gray-400">em cartões</span>
            </div>
          </div>
        </div>

        {/* Accounts Payable/Receivable Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Compromissos</span>
            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div id="payable-receivable-dashboard" className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-rose-600" title="A pagar pendente">
                -{formatBRL(pendingPayable)}
              </span>
              <span className="text-xs text-gray-300">/</span>
              <span className="text-xl font-bold text-emerald-600" title="A receber pendente">
                +{formatBRL(pendingReceivable)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              {overdueBillsCount > 0 ? (
                <span className="text-rose-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {overdueBillsCount} conta{overdueBillsCount > 1 ? 's' : ''} atrasada{overdueBillsCount > 1 ? 's' : ''}!
                </span>
              ) : (
                <span className="text-gray-500">Sem contas atrasadas</span>
              )}
            </div>
          </div>
        </div>

        {/* Debts (Alguém deve / Eu devo) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dinheiro Emprestado</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <HandCoins className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-0.5">
              <div className="text-sm flex justify-between items-center text-gray-600">
                <span>Eu emprestei:</span>
                <span className="font-semibold text-emerald-600">{formatBRL(activeLent)}</span>
              </div>
              <div className="text-sm flex justify-between items-center text-gray-600">
                <span>Devo pagar:</span>
                <span className="font-semibold text-amber-600">{formatBRL(activeBorrowed)}</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-xs">
              <span className="text-gray-400">Total pendente</span>
              <span className={`font-semibold ${activeLent >= activeBorrowed ? 'text-emerald-700' : 'text-amber-700'}`}>
                {formatBRL(Math.abs(activeLent - activeBorrowed))} {activeLent >= activeBorrowed ? 'a receber' : 'a pagar'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Alerts section for Urgent matters */}
      {(overdueBillsCount > 0 || overdueLentCount > 0) && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-red-900">Atenção! Itens Atrasados Encontrados</h4>
            <div className="text-xs text-red-700 space-y-1">
              {overdueBillsCount > 0 && (
                <p>• Você possui {overdueBillsCount} conta(s) a pagar que já passaram do vencimento.</p>
              )}
              {overdueLentCount > 0 && (
                <p>• Você tem {overdueLentCount} dinheiro(s) emprestado(s) pendente(s) que já deveriam ter sido cobrados.</p>
              )}
            </div>
            <button 
              onClick={() => onNavigate(overdueBillsCount > 0 ? 'contas' : 'emprestimos')}
              className="text-xs font-semibold text-red-800 hover:underline mt-2 flex items-center gap-0.5"
            >
              Resolver pendências agora <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Credit Cards Showcase with Quick Isolation Filters */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-violet-600" />
            Meus Cartões de Crédito
          </h2>
          <button 
            onClick={() => onNavigate('cartoes')}
            className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-0.5"
          >
            Gerenciar no detalhe <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map(card => {
            const bill = getCardBill(card.id);
            const limitUsedPercent = Math.min((bill / card.limit) * 100, 100);
            return (
              <motion.div 
                key={card.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-xs flex flex-col justify-between space-y-5"
              >
                {/* Simulated Credit Card view */}
                <div className={`relative p-5 rounded-xl bg-gradient-to-r ${card.color} text-white shadow-md overflow-hidden aspect-[1.78/1] flex flex-col justify-between`}>
                  {/* Subtle card textures */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-12 -translate-y-12"></div>
                  
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <p className="text-xs opacity-80 uppercase tracking-widest font-mono">Cartão de Crédito</p>
                      <h4 className="text-lg font-bold tracking-tight mt-0.5">{card.name}</h4>
                    </div>
                    <div className="h-8 w-12 bg-white/20 rounded-md flex items-center justify-center font-bold text-xs">
                      {card.name.includes('Itaú') ? 'ITAÚ' : card.name.includes('Caixa') ? 'CAIXA' : 'CARD'}
                    </div>
                  </div>

                  <div className="z-10 mt-4">
                    <p className="text-[10px] opacity-75 uppercase tracking-wider font-mono">Fatura Atual</p>
                    <p className="text-2xl font-extrabold tracking-tight font-mono">{formatBRL(bill)}</p>
                  </div>

                  <div className="flex justify-between items-end z-10">
                    <div>
                      <p className="text-[9px] opacity-75">Vence dia {card.closingDay} | Paga {card.dueDay}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] opacity-75">Limite Disponível</p>
                      <p className="text-xs font-semibold font-mono">{formatBRL(card.limit - bill)}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Actions */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1.5">
                      <span>Uso do Limite</span>
                      <span className="font-semibold text-gray-700">{limitUsedPercent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${limitUsedPercent > 85 ? 'bg-red-500' : limitUsedPercent > 50 ? 'bg-amber-500' : 'bg-violet-600'}`}
                        style={{ width: `${limitUsedPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectCardFilter(card.id);
                        onNavigate('transacoes');
                      }}
                      className="flex-1 text-center py-2 px-3 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Filtrar transações
                    </button>
                    <button
                      onClick={() => onNavigate('transacoes')}
                      className="flex-1 text-center py-2 px-3 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-xs"
                    >
                      Lançar compra
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 5. Charts & Analytics Breakdown (Categorias e Fluxo) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category breakdown (Donut / Visual Bar Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-emerald-600" />
              Gastos por Categoria (Mês)
            </h3>
            <span className="text-xs text-gray-400">Total: {formatBRL(totalExpense)}</span>
          </div>

          {categoryEntries.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Nenhuma despesa para exibir no gráfico neste mês.
            </div>
          ) : (
            <div className="space-y-4">
              {categoryEntries.slice(0, 5).map(([category, amount]) => {
                const percentage = (amount / totalExpense) * 100;
                const progressWidth = (amount / maxCategoryVal) * 100;
                const barColor = categoryColors[category] || 'bg-violet-500';
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-gray-700">
                      <span className="font-medium flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${barColor}`}></span>
                        {category}
                      </span>
                      <div className="font-mono">
                        <span className="font-semibold text-gray-900">{formatBRL(amount)}</span>
                        <span className="text-gray-400 ml-1.5">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-50 rounded-lg overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressWidth}%` }}
                        className={`h-full rounded-lg ${barColor}`}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      ></motion.div>
                    </div>
                  </div>
                );
              })}
              {categoryEntries.length > 5 && (
                <button
                  onClick={() => onNavigate('transacoes')}
                  className="w-full text-center text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors py-2 border border-dashed border-gray-200 rounded-lg"
                >
                  Ver mais {categoryEntries.length - 5} categorias nas Transações
                </button>
              )}
            </div>
          )}
        </div>

        {/* Cash Flow Visual Balance Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
              Balanço Fluxo de Caixa (Junho)
            </h3>
            <span className="text-xs text-gray-400">Receita vs Despesa</span>
          </div>

          <div className="h-56 flex items-end justify-around pb-2 border-b border-gray-100 relative pt-6">
            {/* Horizontal guidelines */}
            <div className="absolute left-0 right-0 border-t border-dashed border-gray-100 top-1/4 h-0"></div>
            <div className="absolute left-0 right-0 border-t border-dashed border-gray-100 top-2/4 h-0"></div>
            <div className="absolute left-0 right-0 border-t border-dashed border-gray-100 top-3/4 h-0"></div>

            {/* Income Bar */}
            <div className="flex flex-col items-center gap-2 w-1/3 group">
              <div className="text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatBRL(totalIncome)}
              </div>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: totalIncome > 0 ? `${Math.min((totalIncome / Math.max(totalIncome, totalExpense || 1)) * 140, 140)}px` : '4px' }}
                className="w-12 bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-colors cursor-pointer"
              ></motion.div>
              <span className="text-xs font-semibold text-gray-600">Receitas</span>
            </div>

            {/* Expense Bar */}
            <div className="flex flex-col items-center gap-2 w-1/3 group">
              <div className="text-xs font-semibold text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatBRL(totalExpense)}
              </div>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: totalExpense > 0 ? `${Math.min((totalExpense / Math.max(totalIncome, totalExpense || 1)) * 140, 140)}px` : '4px' }}
                className="w-12 bg-rose-500 hover:bg-rose-600 rounded-t-lg transition-colors cursor-pointer"
              ></motion.div>
              <span className="text-xs font-semibold text-gray-600">Despesas</span>
            </div>

            {/* Net Bar (Saldo) */}
            <div className="flex flex-col items-center gap-2 w-1/3 group">
              {(() => {
                const saldo = totalIncome - totalExpense;
                const isPositive = saldo >= 0;
                const heightVal = Math.min((Math.abs(saldo) / Math.max(totalIncome, totalExpense || 1)) * 140, 140);
                
                return (
                  <>
                    <div className={`text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {formatBRL(saldo)}
                    </div>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(heightVal, 4)}px` }}
                      className={`w-12 rounded-t-lg transition-colors cursor-pointer ${isPositive ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-red-400 hover:bg-red-500'}`}
                    ></motion.div>
                    <span className="text-xs font-semibold text-gray-600">Resultado</span>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            {totalIncome >= totalExpense ? (
              <span className="text-emerald-700 font-medium">✨ Você poupou {formatBRL(totalIncome - totalExpense)} este mês!</span>
            ) : (
              <span className="text-rose-700 font-medium">⚠️ Seus gastos superaram as receitas por {formatBRL(totalExpense - totalIncome)}. Cuidado!</span>
            )}
          </div>
        </div>

      </div>

      {/* 6. Upcoming Bills (Contas a Pagar/Receber Rápidas) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Contas a Vencer
          </h2>
          <button 
            onClick={() => onNavigate('contas')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
          >
            Ver calendário completo <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-50 overflow-hidden">
          {bills.filter(b => b.status === 'pending').slice(0, 3).length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Parabéns! Nenhuma conta pendente para os próximos dias.
            </div>
          ) : (
            bills
              .filter(b => b.status === 'pending')
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
              .slice(0, 3)
              .map(bill => {
                const isOverdue = bill.dueDate < todayStr;
                return (
                  <div key={bill.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${bill.type === 'payable' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {bill.type === 'payable' ? (
                          <TrendingDown className="h-4.5 w-4.5" />
                        ) : (
                          <TrendingUp className="h-4.5 w-4.5" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{bill.title}</h4>
                        <div id="quick-due-bill-tag" className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 bg-gray-50 rounded px-1.5 py-0.5 border border-gray-100">
                            {bill.category}
                          </span>
                          <span className={`text-xs font-medium flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                            Vence em: {bill.dueDate.split('-').reverse().join('/')}
                            {isOverdue && <span className="bg-red-100 text-red-700 text-[10px] px-1 rounded-sm uppercase tracking-wide font-extrabold ml-1">Atrasada</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-gray-50 pt-2 sm:pt-0">
                      <span className={`text-base font-bold font-mono ${bill.type === 'payable' ? 'text-gray-900' : 'text-emerald-700'}`}>
                        {bill.type === 'payable' ? '-' : '+'}{formatBRL(bill.amount)}
                      </span>
                      <button
                        onClick={() => onNavigate('contas')}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 py-1 px-2.5 bg-indigo-50/50 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        Pagar/Receber
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
