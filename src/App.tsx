import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  Wallet, 
  CreditCard, 
  CalendarDays, 
  HandCoins, 
  Layers, 
  Download, 
  Upload, 
  RotateCcw, 
  Sparkles,
  ChevronDown,
  Info
} from 'lucide-react';

import { Card, Transaction, Debt, AccountBill } from './types';
import { 
  INITIAL_CARDS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_DEBTS, 
  INITIAL_BILLS 
} from './data/mockData';

// Subcomponents import
import Dashboard from './components/Dashboard';
import CardsView from './components/CardsView';
import TransactionsView from './components/TransactionsView';
import BillsView from './components/BillsView';
import DebtsView from './components/DebtsView';
import { firebaseEnabled, saveFirebaseItem, deleteFirebaseItem, subscribeFirebaseCollection } from './services/firebaseStore';

export default function App() {
  // 1. Core local storage states
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [bills, setBills] = useState<AccountBill[]>([]);

  // Page index navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCardIdFilter, setSelectedCardIdFilter] = useState<string | null>(null);

  // Load state on mount
  useEffect(() => {
    const storedCards = localStorage.getItem('fin_cards');
    const storedTransactions = localStorage.getItem('fin_transactions');
    const storedDebts = localStorage.getItem('fin_debts');
    const storedBills = localStorage.getItem('fin_bills');

    if (storedCards && storedTransactions && storedDebts && storedBills) {
      setCards(JSON.parse(storedCards));
      setTransactions(JSON.parse(storedTransactions));
      setDebts(JSON.parse(storedDebts));
      setBills(JSON.parse(storedBills));
    } else {
      // Primeiro acesso: app zerado, sem cartão, sem transação e sem exemplo
      setCards(INITIAL_CARDS);
      setTransactions(INITIAL_TRANSACTIONS);
      setDebts(INITIAL_DEBTS);
      setBills(INITIAL_BILLS);
      
      localStorage.setItem('fin_cards', JSON.stringify(INITIAL_CARDS));
      localStorage.setItem('fin_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem('fin_debts', JSON.stringify(INITIAL_DEBTS));
      localStorage.setItem('fin_bills', JSON.stringify(INITIAL_BILLS));
    }
  }, []);


  // Firebase: carrega e sincroniza cada módulo em uma coleção separada
  useEffect(() => {
    if (!firebaseEnabled) return;
    let unsubscribers: Array<() => void> = [];

    Promise.all([
      subscribeFirebaseCollection<Card>('cards', setCards),
      subscribeFirebaseCollection<Transaction>('transactions', setTransactions),
      subscribeFirebaseCollection<Debt>('debts', setDebts),
      subscribeFirebaseCollection<AccountBill>('bills', setBills),
    ]).then((subs) => {
      unsubscribers = subs;
    });

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  // Save state on any change, including empty app state
  useEffect(() => {
    localStorage.setItem('fin_cards', JSON.stringify(cards));
    localStorage.setItem('fin_transactions', JSON.stringify(transactions));
    localStorage.setItem('fin_debts', JSON.stringify(debts));
    localStorage.setItem('fin_bills', JSON.stringify(bills));
  }, [cards, transactions, debts, bills]);

  // 2. State Actions

  // Cards
  const handleAddCard = (newCard: Omit<Card, 'id'>) => {
    const card: Card = {
      ...newCard,
      id: 'c-' + Date.now() + Math.random().toString(36).substr(2, 4)
    };
    setCards(prev => [...prev, card]);
    saveFirebaseItem('cards', card).catch(console.error);
  };

  const handleDeleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    deleteFirebaseItem('cards', id).catch(console.error);
    // Clear dependencies if any
    setTransactions(prev => prev.map(t => {
      if (t.cardId === id) {
        return { ...t, paymentMethod: 'cash', cardId: undefined }; // Revert to cash if card is deleted
      }
      return t;
    }));
  };

  // Transactions
  const handleAddTransaction = (newTrans: Omit<Transaction, 'id'>) => {
    const trans: Transaction = {
      ...newTrans,
      id: 't-' + Date.now() + Math.random().toString(36).substr(2, 4)
    };
    setTransactions(prev => [trans, ...prev]);
    saveFirebaseItem('transactions', trans).catch(console.error);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    deleteFirebaseItem('transactions', id).catch(console.error);
  };

  // Bills (Account Payable / Accounts Receivable)
  const handleAddBill = (newBill: Omit<AccountBill, 'id'>) => {
    const bill: AccountBill = {
      ...newBill,
      id: 'b-' + Date.now() + Math.random().toString(36).substr(2, 4)
    };
    setBills(prev => [...prev, bill]);
    saveFirebaseItem('bills', bill).catch(console.error);
  };

  const handleDeleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
    deleteFirebaseItem('bills', id).catch(console.error);
  };

  const handleToggleBillStatus = (id: string) => {
    setBills(prev => prev.map(bill => {
      if (bill.id === id) {
        const newStatus = bill.status === 'paid' ? 'pending' : 'paid';
        
        // Sincronização Inteligente: Se marcado como pago (ou recebido), criamos automaticamente uma transação
        if (newStatus === 'paid') {
          const matchingTransaction: Transaction = {
            id: 't-bill-' + Date.now() + Math.random().toString(36).substr(2, 3),
            type: bill.type === 'payable' ? 'expense' : 'income',
            description: `${bill.type === 'payable' ? 'Pagamento' : 'Recebimento'}: ${bill.title}`,
            amount: bill.amount,
            date: new Date().toISOString().split('T')[0],
            category: bill.category,
            paymentMethod: 'pix', // Default convenient sync
            status: 'paid'
          };
          setTransactions(tPrev => [matchingTransaction, ...tPrev]);
          saveFirebaseItem('transactions', matchingTransaction).catch(console.error);
        }
        
        const updatedBill = { ...bill, status: newStatus };
        saveFirebaseItem('bills', updatedBill).catch(console.error);
        return updatedBill;
      }
      return bill;
    }));
  };

  // Debts (Dinheiro Emprestado)
  const handleAddDebt = (newDebt: Omit<Debt, 'id'>) => {
    const debt: Debt = {
      ...newDebt,
      id: 'd-' + Date.now() + Math.random().toString(36).substr(2, 4)
    };
    setDebts(prev => [...prev, debt]);
    saveFirebaseItem('debts', debt).catch(console.error);
  };

  const handleDeleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    deleteFirebaseItem('debts', id).catch(console.error);
  };

  const handleToggleDebtStatus = (id: string) => {
    setDebts(prev => prev.map(debt => {
      if (debt.id === id) {
        const newStatus = debt.status === 'paid' ? 'pending' : 'paid';
        
        // Sincronização Inteligente: Se quitado, lança correspondência na carteira
        if (newStatus === 'paid') {
          const matchingTransaction: Transaction = {
            id: 't-debt-' + Date.now() + Math.random().toString(36).substr(2, 3),
            type: debt.type === 'lent' ? 'income' : 'expense', // lent paid back is incoming money. borrowed paid back is outgoing expense.
            description: `${debt.type === 'lent' ? 'Retorno de Empréstimo' : 'Quitação de Dívida'}: ${debt.person}`,
            amount: debt.amount,
            date: new Date().toISOString().split('T')[0],
            category: 'Outros',
            paymentMethod: 'pix',
            status: 'paid'
          };
          setTransactions(tPrev => [matchingTransaction, ...tPrev]);
          saveFirebaseItem('transactions', matchingTransaction).catch(console.error);
        }
        
        const updatedDebt = { ...debt, status: newStatus };
        saveFirebaseItem('debts', updatedDebt).catch(console.error);
        return updatedDebt;
      }
      return debt;
    }));
  };


  // 3. Backup / Restore / Reset Handlers
  const exportBackup = () => {
    const backupData = {
      cards,
      transactions,
      debts,
      bills,
      version: '1.0'
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `controle_financeiro_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.cards && parsed.transactions && parsed.debts && parsed.bills) {
          setCards(parsed.cards);
          setTransactions(parsed.transactions);
          setDebts(parsed.debts);
          setBills(parsed.bills);
          alert('Backup importado com sucesso!');
        } else {
          alert('Formato de arquivo inválido. Certifique-se de usar um JSON exportado do próprio app.');
        }
      } catch (err) {
        alert('Erro ao processar arquivo JSON de backup.');
      }
    };
    fileReader.readAsText(file);
  };

  const resetToMockInput = () => {
    if (confirm('Deseja realmente apagar todos os dados e deixar o aplicativo zerado?')) {
      cards.forEach((item) => deleteFirebaseItem('cards', item.id).catch(console.error));
      transactions.forEach((item) => deleteFirebaseItem('transactions', item.id).catch(console.error));
      debts.forEach((item) => deleteFirebaseItem('debts', item.id).catch(console.error));
      bills.forEach((item) => deleteFirebaseItem('bills', item.id).catch(console.error));
      setCards([]);
      setTransactions([]);
      setDebts([]);
      setBills([]);
      localStorage.setItem('fin_cards', JSON.stringify([]));
      localStorage.setItem('fin_transactions', JSON.stringify([]));
      localStorage.setItem('fin_debts', JSON.stringify([]));
      localStorage.setItem('fin_bills', JSON.stringify([]));
      alert('Aplicativo zerado com sucesso!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col">
      
      {/* 1. Header Navigation */}
      <header className="bg-white border-b border-gray-200/85 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xs">
              <DollarSign className="h-6 w-6 stroke-[2.5px]" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-gray-950 block">Finanças Pessoais</span>
              <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Controle Financeiro Zerado</span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex flex-wrap justify-center items-center gap-1 bg-gray-100/70 py-1 px-1 rounded-xl border border-gray-150 text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-white text-emerald-700 shadow-3xs' 
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
              }`}
            >
              <Layers className="h-4 w-4" />
              Painel
            </button>

            <button
              onClick={() => setActiveTab('transacoes')}
              className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all ${
                activeTab === 'transacoes' 
                  ? 'bg-white text-emerald-700 shadow-3xs' 
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
              }`}
            >
              <Wallet className="h-4 w-4" />
              Transações
            </button>

            <button
              onClick={() => setActiveTab('contas')}
              className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all ${
                activeTab === 'contas' 
                  ? 'bg-white text-emerald-700 shadow-3xs' 
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Contas (A pagar)
            </button>

            <button
              onClick={() => setActiveTab('emprestimos')}
              className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all ${
                activeTab === 'emprestimos' 
                  ? 'bg-white text-emerald-700 shadow-3xs' 
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
              }`}
            >
              <HandCoins className="h-4 w-4" />
              Empréstimos
            </button>

            <button
              onClick={() => setActiveTab('cartoes')}
              className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all ${
                activeTab === 'cartoes' 
                  ? 'bg-white text-emerald-700 shadow-3xs' 
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Cartões
            </button>
          </nav>

          {/* Backup Action hub */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={exportBackup}
              title="Exportar backup de dados (JSON)"
              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 flex items-center gap-1.5 font-medium transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar
            </button>
            
            <label className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 flex items-center gap-1.5 font-medium cursor-pointer transition-colors">
              <Upload className="h-3.5 w-3.5" />
              <span>Importar</span>
              <input 
                type="file" 
                accept=".json" 
                onChange={importBackup} 
                className="hidden pointer-events-auto" 
              />
            </label>

            <button
              onClick={resetToMockInput}
              title="Apagar tudo e deixar o app zerado"
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-100 flex items-center gap-1 bg-white font-medium transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Zerar
            </button>
          </div>

        </div>
      </header>

      {/* 2. Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                cards={cards}
                transactions={transactions}
                debts={debts}
                bills={bills}
                onNavigate={setActiveTab}
                onSelectCardFilter={setSelectedCardIdFilter}
              />
            )}

            {activeTab === 'transacoes' && (
              <TransactionsView 
                cards={cards}
                transactions={transactions}
                selectedCardIdFilter={selectedCardIdFilter}
                onSetSelectedCardIdFilter={setSelectedCardIdFilter}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}

            {activeTab === 'contas' && (
              <BillsView 
                bills={bills}
                onAddBill={handleAddBill}
                onDeleteBill={handleDeleteBill}
                onToggleBillStatus={handleToggleBillStatus}
              />
            )}

            {activeTab === 'emprestimos' && (
              <DebtsView 
                debts={debts}
                onAddDebt={handleAddDebt}
                onDeleteDebt={handleDeleteDebt}
                onToggleDebtStatus={handleToggleDebtStatus}
              />
            )}

            {activeTab === 'cartoes' && (
              <CardsView 
                cards={cards}
                transactions={transactions}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Footer info */}
      <footer className="bg-white border-t border-gray-200 text-center py-6 text-xs text-gray-400 space-y-1">
        <p className="font-medium text-gray-500">Planilha de Controle Pessoal Offline & Segura</p>
        <p>Todos os dados são salvos localmente em seu navegador e nunca deixam este dispositivo.</p>
      </footer>
    </div>
  );
}
