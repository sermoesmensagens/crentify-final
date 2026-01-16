
import React, { useState, useEffect } from 'react';
import { FinancialTransaction, FinancialPlan, Installment } from '../types';
import { 
  Wallet, TrendingUp, TrendingDown, Plus, ChevronLeft, ChevronRight, 
  PieChart as PieIcon, Info, X, Calendar, Tag, CreditCard, Loader2, Sparkles, Trash2,
  Edit2, Check, ArrowRight, Eye, EyeOff, CheckCircle2, List, BarChart3, Bot
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getFinancialInsights } from '../services/geminiService';

interface FinanceProps {
  transactions: FinancialTransaction[];
  setTransactions: (t: FinancialTransaction[]) => void;
  plans: FinancialPlan[];
  setPlans: (p: FinancialPlan[]) => void;
}

const CATEGORIES = [
  'Dízimo/Oferta', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 
  'Moradia', 'Assinaturas', 'Compras', 'Financiamento', 'Outros'
];

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const Finance: React.FC<FinanceProps> = ({ transactions, setTransactions, plans, setPlans }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'planilha' | 'longo' | 'ajustes'>('geral');
  const [showModal, setShowModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Alimentação');

  const selectedMonth = currentDate.getMonth();
  const selectedYear = currentDate.getFullYear();

  const filteredTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear;
  });

  const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenses = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expenses;

  useEffect(() => {
    const fetchInsights = async () => {
      if (filteredTransactions.length > 0) {
        setLoadingInsights(true);
        try {
          const res = await getFinancialInsights(filteredTransactions, `${MONTHS[selectedMonth]} de ${selectedYear}`);
          setAiInsights(res || null);
        } catch (e) { console.error(e); } finally { setLoadingInsights(false); }
      }
    };
    if (activeSubTab === 'geral') fetchInsights();
  }, [selectedMonth, selectedYear, transactions.length, activeSubTab]);

  const handleAddTransaction = () => {
    if (!description || !amount) return;
    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? { ...t, description, amount: parseFloat(amount), type, category, date } : t));
      setEditingTransaction(null);
    } else {
      setTransactions([{ id: Date.now().toString(), description, amount: parseFloat(amount), type, category, date }, ...transactions]);
    }
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setDescription(''); setAmount(''); setType('expense'); setCategory('Alimentação'); setDate(new Date().toISOString().split('T')[0]);
  };

  const startEditTransaction = (t: FinancialTransaction) => {
    setEditingTransaction(t); setDescription(t.description); setAmount(t.amount.toString()); setType(t.type); setCategory(t.category); setDate(t.date); setShowModal(true);
  };

  const deleteTransaction = (id: string) => {
    if (confirm('Excluir transação?')) setTransactions(transactions.filter(t => t.id !== id));
  };

  const pieData = Object.entries(
    filteredTransactions.filter(t => t.type === 'expense').reduce((acc: any, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {})
  ).map(([name, value]) => ({ name, value: value as number }));

  const COLORS = ['#8743f2', '#b276ff', '#00ff9f', '#ff2e63', '#00d1ff', '#f59e0b', '#ec4899', '#ffffff'];

  return (
    <div className="h-full flex flex-col space-y-10 animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase neon-text flex items-center gap-4">
            <Wallet size={42} className="text-brand" />
            Finanças
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Mordomia cristã: Gerindo recursos com propósito.</p>
        </div>
        <div className="flex bg-[#161b22] p-1.5 rounded-2xl border border-white/5 shadow-2xl">
          {['geral', 'planilha', 'longo'].map(tab => (
            <button key={tab} onClick={() => setActiveSubTab(tab as any)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-brand text-white shadow-lg' : 'text-gray-600 hover:text-gray-300'}`}>
              {tab === 'longo' ? 'Longo Prazo' : tab}
            </button>
          ))}
        </div>
      </header>

      {/* Seletor de Período */}
      <div className="flex justify-center items-center gap-10">
        <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); }} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-brand hover:scale-110 transition-all"><ChevronLeft size={24} /></button>
        <div className="text-center">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Período de Análise</p>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">{MONTHS[selectedMonth]} {selectedYear}</h2>
        </div>
        <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); }} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-brand hover:scale-110 transition-all"><ChevronRight size={24} /></button>
      </div>

      {activeSubTab === 'geral' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#161b22] p-10 rounded-[48px] border border-brand/20 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5"><TrendingUp size={80} className="text-brand" /></div>
               <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Ganhos Totais</p>
               <p className="text-4xl font-black text-white">R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-[#161b22] p-10 rounded-[48px] border border-rose-500/20 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5"><TrendingDown size={80} className="text-rose-500" /></div>
               <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4">Gastos Totais</p>
               <p className="text-4xl font-black text-white">R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className={`p-10 rounded-[48px] border shadow-2xl relative overflow-hidden ${balance >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
               <p className="text-[10px] font-black uppercase tracking-widest mb-4">Saldo do Mês</p>
               <p className="text-4xl font-black text-white">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-5 bg-[#161b22] p-10 rounded-[48px] border border-white/5 shadow-2xl">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3"><PieIcon size={20} className="text-brand" /> Distribuição</h3>
              <div className="h-64">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                        {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '24px', backgroundColor: '#0b0e14', border: '1px solid rgba(135,67,242,0.3)', color: '#fff', fontWeight: '900' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10">
                    <PieIcon size={48} className="mb-4" />
                    <p className="text-[10px] font-black uppercase">Sem dados</p>
                  </div>
                )}
              </div>
            </section>

            <section className="lg:col-span-7 bg-brand/5 p-10 rounded-[48px] border border-brand/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><Sparkles size={100} className="text-brand" /></div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3"><Bot size={28} className="text-brand" /> Insights do Mentor</h3>
              <div className="bg-[#0b0e14]/50 p-8 rounded-[32px] border border-white/5 min-h-[160px] flex items-center shadow-inner">
                {loadingInsights ? (
                  <div className="flex items-center gap-3 text-brand/50">
                    <Loader2 className="animate-spin" size={24} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Analisando mordomia...</p>
                  </div>
                ) : (
                  <p className="text-gray-300 leading-relaxed italic font-medium">
                    {aiInsights || "O Mentor está pronto para analisar seu comportamento financeiro assim que você lançar seus registros."}
                  </p>
                )}
              </div>
            </section>
          </div>
        </>
      )}

      {activeSubTab === 'planilha' && (
        <section className="bg-[#161b22] rounded-[48px] border border-white/5 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/20 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                  <th className="px-10 py-6">Data</th>
                  <th className="px-10 py-6">Descrição</th>
                  <th className="px-10 py-6">Categoria</th>
                  <th className="px-10 py-6 text-right">Valor</th>
                  <th className="px-10 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-brand/5 group transition-colors">
                    <td className="px-10 py-6 text-xs font-bold text-gray-500">{new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="px-10 py-6 font-black text-white text-sm uppercase">{t.description}</td>
                    <td className="px-10 py-6">
                      <span className="bg-[#0b0e14] text-[9px] px-3 py-1.5 rounded-lg font-black uppercase text-brand border border-white/5">{t.category}</span>
                    </td>
                    <td className={`px-10 py-6 text-right font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditTransaction(t)} className="text-gray-500 hover:text-brand transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => deleteTransaction(t.id)} className="text-gray-500 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <button onClick={() => { resetForm(); setShowModal(true); }} className="fixed bottom-10 right-10 bg-brand text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-brand/40 hover:scale-110 active:scale-90 transition-all z-40 group">
        <Plus size={32} strokeWidth={3} />
        <span className="absolute right-20 bg-brand text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all shadow-xl whitespace-nowrap">Novo Registro</span>
      </button>

      {/* Modal Modernizado */}
      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#161b22] w-full max-w-md rounded-[48px] border border-white/10 shadow-2xl overflow-hidden p-10 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Lançamento</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X size={28} /></button>
            </div>
            <div className="flex bg-[#0b0e14] p-1.5 rounded-2xl border border-white/5">
              <button onClick={() => setType('expense')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase transition-all ${type === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-gray-600'}`}>Saída</button>
              <button onClick={() => setType('income')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase transition-all ${type === 'income' ? 'bg-brand text-white shadow-lg' : 'text-gray-600'}`}>Entrada</button>
            </div>
            <div className="space-y-6">
              <input type="text" className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-brand/30" placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl px-6 py-4 text-white font-black outline-none" placeholder="Valor R$" value={amount} onChange={e => setAmount(e.target.value)} />
                <input type="date" className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <select className="w-full bg-[#0b0e14] border border-white/5 text-white rounded-2xl px-6 py-4 font-bold outline-none appearance-none" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={handleAddTransaction} className={`w-full py-6 rounded-[28px] font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all active:scale-95 ${type === 'expense' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-brand shadow-brand/20'}`}>
              {editingTransaction ? 'Atualizar' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
