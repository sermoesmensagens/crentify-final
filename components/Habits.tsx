
import React, { useState, useEffect } from 'react';
import { SpiritualHabit, HabitFrequency } from '../types';
import { Plus, Check, Trash2, Calendar, Zap, Target, Clock, Edit2, X } from 'lucide-react';

interface HabitsProps {
  habits: SpiritualHabit[];
  setHabits: (h: SpiritualHabit[]) => void;
}

const Habits: React.FC<HabitsProps> = ({ habits, setHabits }) => {
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [category, setCategory] = useState<SpiritualHabit['category']>('ORAÇÃO');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().getDay();

  const resetForm = () => {
    setEditingHabitId(null);
    setCategory('ORAÇÃO');
    setDescription('');
    setFrequency('daily');
    setSelectedDays([]);
    setStartDate('');
    setEndDate('');
    setTargetDate('');
  };

  const handleCreateOrUpdate = () => {
    if (editingHabitId) {
      const updatedHabits = habits.map(h => {
        if (h.id === editingHabitId) {
          return {
            ...h,
            category,
            description,
            frequency,
            selectedDays: frequency === 'weekly' ? selectedDays : undefined,
            startDate: frequency === 'period' ? startDate : undefined,
            endDate: frequency === 'period' ? endDate : undefined,
            date: (frequency === 'once' || frequency === 'annual') ? targetDate : undefined,
          };
        }
        return h;
      });
      setHabits(updatedHabits);
    } else {
      const newHabit: SpiritualHabit = {
        id: Date.now().toString(),
        category,
        description,
        frequency,
        selectedDays: frequency === 'weekly' ? selectedDays : undefined,
        startDate: frequency === 'period' ? startDate : undefined,
        endDate: frequency === 'period' ? endDate : undefined,
        date: (frequency === 'once' || frequency === 'annual') ? targetDate : undefined,
        completions: {}
      };
      setHabits([...habits, newHabit]);
    }
    resetForm();
  };

  const startEdit = (habit: SpiritualHabit) => {
    setEditingHabitId(habit.id);
    setCategory(habit.category);
    setDescription(habit.description);
    setFrequency(habit.frequency);
    setSelectedDays(habit.selectedDays || []);
    setStartDate(habit.startDate || '');
    setEndDate(habit.endDate || '');
    setTargetDate(habit.date || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleComplete = (habitId: string) => {
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        const completions = { ...h.completions };
        completions[today] = !completions[today];
        return { ...h, completions };
      }
      return h;
    }));
  };

  const deleteHabit = (id: string) => {
    if (confirm('Deseja excluir esta disciplina?')) {
      setHabits(habits.filter(h => h.id !== id));
      if (editingHabitId === id) resetForm();
    }
  };

  const habitsForToday = habits.filter(h => {
    if (h.frequency === 'daily') return true;
    if (h.frequency === 'weekly' && h.selectedDays?.includes(dayOfWeek)) return true;
    if (h.frequency === 'period' && h.startDate && h.endDate) {
      return today >= h.startDate && today <= h.endDate;
    }
    if (h.frequency === 'once' && h.date === today) return true;
    if (h.frequency === 'annual' && h.date?.slice(5) === today.slice(5)) return true;
    return false;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase neon-text">Disciplinas</h1>
          <p className="text-gray-500 mt-2 font-medium">Santificação é uma escolha diária e intencional.</p>
        </div>
        <div className="hidden md:flex gap-2">
           <div className="px-5 py-2.5 bg-brand/10 border border-brand/20 rounded-2xl text-brand font-black text-[10px] tracking-[0.2em] uppercase">
             {editingHabitId ? 'Editando Disciplina' : 'Espiritualidade Ativa'}
           </div>
        </div>
      </header>

      {/* Card de Criação Neon Style */}
      <div className={`bg-[#161b22] border transition-all duration-500 p-10 rounded-[48px] shadow-2xl relative overflow-hidden group ${editingHabitId ? 'border-brand/40 ring-1 ring-brand/20' : 'border-white/5'}`}>
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
          <Target size={180} className="text-brand" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex justify-between items-center">
             <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
              {['ORAÇÃO', 'LEITURA', 'JEJUM', 'CULTO', 'SERVIÇO', 'ESTUDO', 'OUTRO'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat as any)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all duration-300 border ${
                    category === cat 
                      ? 'bg-brand text-white border-brand shadow-[0_0_15px_rgba(135,67,242,0.4)]' 
                      : 'bg-white/5 text-gray-500 border-white/5 hover:border-brand/30 hover:text-brand'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {editingHabitId && (
              <button 
                onClick={resetForm}
                className="text-gray-500 hover:text-white transition-colors p-2"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Detalhes da Disciplina</label>
            <input
              type="text"
              placeholder="Ex: Jejum de Daniel, Estudo de Romanos..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0b0e14] border border-white/5 rounded-[24px] px-8 py-5 text-white font-bold placeholder:text-gray-700 focus:ring-2 focus:ring-brand/30 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Frequência</label>
               <div className="flex flex-wrap gap-2">
                {[
                  { id: 'daily', label: 'DIÁRIO' },
                  { id: 'weekly', label: 'SEMANAL' },
                  { id: 'period', label: 'PERÍODO' },
                  { id: 'once', label: 'EVENTO' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFrequency(f.id as any)}
                    className={`px-5 py-2.5 rounded-xl text-[9px] font-black tracking-widest transition-all ${
                      frequency === f.id 
                        ? 'bg-brand/20 text-brand border border-brand/40 shadow-[0_0_10px_rgba(135,67,242,0.2)]' 
                        : 'bg-white/5 text-gray-600 border border-transparent'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Controles Dinâmicos */}
            <div className="bg-black/20 p-6 rounded-[28px] border border-white/5 min-h-[80px] flex items-center justify-center">
              {frequency === 'weekly' && (
                <div className="flex gap-1.5">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDays(prev => prev.includes(i) ? prev.filter(day => day !== i) : [...prev, i])}
                      className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all border ${
                        selectedDays.includes(i) ? 'bg-brand text-white border-brand shadow-lg' : 'bg-white/5 border-white/5 text-gray-600'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
              {frequency === 'period' && (
                <div className="flex gap-3 items-center">
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-[#0b0e14] border border-white/10 p-3 rounded-xl text-[10px] font-black text-brand outline-none" />
                  <span className="text-gray-600 font-black text-[10px] uppercase">até</span>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-[#0b0e14] border border-white/10 p-3 rounded-xl text-[10px] font-black text-brand outline-none" />
                </div>
              )}
              {(frequency === 'once' || frequency === 'annual') && (
                <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full bg-[#0b0e14] border border-white/10 p-3 rounded-xl text-[10px] font-black text-brand outline-none" />
              )}
              {frequency === 'daily' && (
                <div className="flex items-center gap-2 text-brand/40">
                  <Clock size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Todos os dias sem falta</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleCreateOrUpdate}
            disabled={!description}
            className="w-full bg-gradient-to-r from-brand to-brand-light hover:scale-[1.01] active:scale-95 text-white font-black py-6 rounded-[28px] transition-all uppercase tracking-[0.2em] shadow-xl shadow-brand/30 flex items-center justify-center gap-3 disabled:opacity-30"
          >
            {editingHabitId ? <Check size={20} /> : <Plus size={20} />}
            {editingHabitId ? 'ATUALIZAR MINHA CAMINHADA' : 'ADICIONAR À MINHA CAMINHADA'}
          </button>
        </div>
      </div>

      {/* Lista Hoje - TaskFlow Aesthetic */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 text-brand">
            <Zap size={20} className="fill-brand animate-pulse" />
            <span className="font-black text-xs uppercase tracking-[0.3em]">Minhas Disciplinas ({habitsForToday.length})</span>
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pendentes hoje</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habitsForToday.length === 0 ? (
            <div className="col-span-full py-24 text-center glass-card rounded-[48px] border-dashed border-white/5 opacity-30">
              <Calendar size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="font-black text-sm uppercase tracking-widest">Nenhuma disciplina para hoje.</p>
            </div>
          ) : (
            habitsForToday.map(habit => (
              <div 
                key={habit.id} 
                className={`group flex items-center justify-between p-7 rounded-[36px] border transition-all duration-500 ${
                  habit.completions[today] 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : editingHabitId === habit.id ? 'bg-brand/10 border-brand/40 shadow-[0_0_20px_rgba(135,67,242,0.1)]' : 'bg-[#161b22] border-white/5 hover:border-brand/30 hover:shadow-2xl hover:shadow-brand/5'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-500 ${
                    habit.completions[today] 
                      ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : 'bg-brand/10 text-brand border border-brand/20'
                  }`}>
                    {habit.completions[today] ? <Check size={28} strokeWidth={3} /> : <span className="font-black text-xs">{habit.category.slice(0, 2)}</span>}
                  </div>
                  <div>
                    <h3 className={`font-black text-base tracking-tight uppercase ${habit.completions[today] ? 'text-gray-700 line-through' : 'text-white'}`}>
                      {habit.category}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${habit.completions[today] ? 'text-gray-800' : 'text-gray-500'}`}>
                        {habit.description || 'Padrão'}
                      </p>
                      <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
                      <p className="text-[10px] font-black text-brand/50 uppercase">{habit.frequency}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!habit.completions[today] && (
                    <button
                      onClick={() => toggleComplete(habit.id)}
                      className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/30 hover:scale-110 active:scale-90 transition-all"
                    >
                      <Check size={24} strokeWidth={3} />
                    </button>
                  )}
                  {habit.completions[today] && (
                    <button
                      onClick={() => toggleComplete(habit.id)}
                      className="w-10 h-10 rounded-2xl bg-white/5 text-emerald-500 flex items-center justify-center hover:bg-white/10 transition-all"
                    >
                      <Check size={20} />
                    </button>
                  )}
                  
                  {/* Botões de Ação Secundária no Hover */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(habit)}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                        editingHabitId === habit.id ? 'bg-brand text-white shadow-brand/20' : 'bg-white/5 text-gray-500 hover:text-brand hover:bg-brand/10'
                      }`}
                      title="Editar Disciplina"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="w-10 h-10 rounded-2xl bg-white/5 text-gray-700 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      title="Excluir Disciplina"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(135, 67, 242, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Habits;
