
import React from 'react';
import { BibleProgress, DiaryEntry, WorkflowTask, SpiritualHabit } from '../types';
import { Book, MessageSquare, Briefcase, CalendarCheck, Check, Flame, Trophy, Zap } from 'lucide-react';

interface DashboardProps {
  bibleProgress: BibleProgress;
  diaryEntries: DiaryEntry[];
  tasks: WorkflowTask[];
  habits: SpiritualHabit[];
}

const Dashboard: React.FC<DashboardProps> = ({ bibleProgress, diaryEntries, tasks, habits }) => {
  const completedChaptersMap = bibleProgress?.completedChapters || {};
  const totalCompletedChapters = (Object.values(completedChaptersMap) as number[][]).reduce(
    (acc, chapters) => acc + (chapters?.length || 0),
    0
  );

  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().getDay();
  
  const habitsForToday = (habits || []).filter(h => {
    if (h.frequency === 'daily') return true;
    if (h.frequency === 'weekly' && h.selectedDays?.includes(dayOfWeek)) return true;
    return false;
  });

  const habitsDone = habitsForToday.filter(h => h.completions[today]).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase neon-text">Dashboard</h1>
          <p className="text-gray-500 mt-1 font-medium">Shalom! Sua jornada espiritual e produtiva num só lugar.</p>
        </div>
        <div className="flex items-center gap-3 glass-card p-2 rounded-[24px]">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl">
            <Flame size={16} className="text-orange-500 animate-pulse" />
            <span className="text-orange-500 font-black text-[10px] uppercase tracking-widest">7 Dias de Fogo</span>
          </div>
          <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center text-brand border border-brand/20 neon-glow">
            <Zap size={22} />
          </div>
        </div>
      </header>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Disciplinas Ativas', val: habitsForToday.length, icon: <CalendarCheck />, bg: 'bg-brand/10', text: 'text-brand' },
          { label: 'Concluído Hoje', val: habitsDone, icon: <Check />, bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
          { label: 'Capítulos Lidos', val: totalCompletedChapters, icon: <Book />, bg: 'bg-blue-500/10', text: 'text-blue-500' },
          { label: 'Status Espiritual', val: 'Firme', icon: <Trophy />, bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
        ].map((card, i) => (
          <div key={i} className="bg-[#161b22] p-8 rounded-[36px] border border-white/5 flex items-center gap-5 group hover:border-brand/30 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-black/40">
            <div className={`w-14 h-14 ${card.bg} ${card.text} rounded-[20px] flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6`}>
              {card.icon}
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">{card.label}</p>
              <p className="text-3xl font-black text-white tracking-tighter uppercase">{card.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lista de Disciplinas */}
        <section className="lg:col-span-7 bg-[#161b22] p-10 rounded-[48px] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Zap size={100} className="text-brand" />
          </div>
          <div className="flex justify-between items-center mb-10 relative z-10">
            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Zap className="text-brand" size={24} /> 
              Disciplinas
            </h2>
            <div className="flex gap-2">
              <span className="px-5 py-2 bg-brand text-white text-[9px] font-black rounded-xl uppercase tracking-widest neon-glow">Hoje</span>
            </div>
          </div>
          
          <div className="space-y-4 relative z-10">
            {habitsForToday.length === 0 ? (
              <div className="py-20 text-center opacity-30 italic font-bold">Inicie um novo hábito para florescer.</div>
            ) : (
              habitsForToday.map(habit => (
                <div key={habit.id} className="flex items-center justify-between p-6 bg-[#0b0e14]/50 rounded-[32px] border border-white/5 hover:border-brand/30 hover:bg-[#111827] transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${habit.completions[today] ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-brand/20 text-brand border border-brand/20'}`}>
                      {habit.completions[today] ? <Check size={22}/> : habit.category.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className={`font-black uppercase text-sm tracking-tighter ${habit.completions[today] ? 'text-gray-600 line-through' : 'text-white'}`}>{habit.category}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{habit.description || 'Fidelidade Diária'}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${habit.completions[today] ? 'bg-emerald-500 neon-glow shadow-emerald-500' : 'bg-white/5 border border-white/10'}`}></div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Mentor AI & Diário Preview */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-brand to-brand-dark p-12 rounded-[48px] text-white shadow-2xl shadow-brand/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 relative z-10">Mentor IA</h2>
            <div className="bg-black/20 backdrop-blur-md p-8 rounded-[32px] border border-white/10 relative z-10">
               <p className="text-brand-light text-[9px] font-black uppercase tracking-[0.3em] mb-3">Meditação</p>
               <p className="text-lg font-medium leading-tight italic font-serif">"Pois Deus não nos deu espírito de covardia, mas de poder, de amor e de equilíbrio."</p>
               <p className="text-right text-[10px] font-black uppercase text-white/40 mt-3">— 2 Timóteo 1:7</p>
            </div>
            <button className="mt-8 bg-white text-brand px-10 py-5 rounded-[22px] font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 active:scale-95 transition-all relative z-10">Acessar Mentor</button>
          </div>

          <div className="bg-[#161b22] p-8 rounded-[40px] border border-white/5 flex-1 shadow-2xl">
             <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-8 border-b border-white/5 pb-4">Memórias Recentes</h3>
             {diaryEntries.slice(0, 2).map(entry => (
               <div key={entry.id} className="flex gap-5 mb-6 last:mb-0 hover:bg-white/5 p-4 rounded-3xl transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-brand/5 rounded-2xl flex-shrink-0 flex items-center justify-center text-brand border border-brand/10 group-hover:bg-brand group-hover:text-white transition-all">
                    <MessageSquare size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <h5 className="font-black text-white text-sm uppercase truncate">{entry.title}</h5>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{new Date(entry.date).toLocaleDateString('pt-BR')}</p>
                  </div>
               </div>
             ))}
             {diaryEntries.length === 0 && <p className="text-center py-10 text-gray-700 text-xs font-black uppercase">Vazio</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
