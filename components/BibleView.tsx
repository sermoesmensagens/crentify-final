
import React, { useState, useEffect } from 'react';
import { BibleData, BibleProgress, BibleNote } from '../types';
import { CheckCircle2, Circle, Share2, ArrowLeft, ArrowRight, BookOpen, X, Edit3, Trash2, Bookmark, Search, Loader2, ListChecks, Check } from 'lucide-react';

interface BibleViewProps {
  bibleData: BibleData | null;
  isLoading: boolean;
  progress: BibleProgress;
  setProgress: (p: BibleProgress) => void;
  notes: BibleNote[];
  setNotes: (n: BibleNote[]) => void;
}

const BibleView: React.FC<BibleViewProps> = ({ bibleData, isLoading, progress, setNotes, notes, setProgress }) => {
  const [selectedBookIndex, setSelectedBookIndex] = useState<number | null>(0);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
  const [showJournal, setShowJournal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [tempSelectedChapters, setTempSelectedChapters] = useState<number[]>([]);
  const [activeNoteVerse, setActiveNoteVerse] = useState<{ number: number, text: string } | null>(null);
  const [noteInput, setNoteInput] = useState('');

  // Sincronizar seleção inicial caso a bíblia demore a carregar
  useEffect(() => {
    if (bibleData && bibleData.books.length > 0 && selectedBookIndex === null) {
      setSelectedBookIndex(0);
    }
  }, [bibleData, selectedBookIndex]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#161b22] rounded-[56px] border border-white/5">
        <Loader2 className="animate-spin text-brand mb-6" size={64} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand">Acessando os Arquivos Celestiais...</p>
      </div>
    );
  }

  if (!bibleData || !bibleData.books || bibleData.books.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-[#161b22] rounded-[56px] border border-white/5 shadow-2xl animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-8 border border-brand/20 shadow-[0_0_30px_rgba(135,67,242,0.1)]">
          <BookOpen size={48} />
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Santuário Silencioso</h2>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">Nenhuma Bíblia encontrada no banco de dados local. Vá até a aba Admin e importe o arquivo JSON das Escrituras.</p>
      </div>
    );
  }

  const selectedBook = selectedBookIndex !== null ? bibleData.books[selectedBookIndex] : null;
  const selectedChapter = selectedBook ? selectedBook.chapters?.[selectedChapterIndex] : null;

  const toggleChapter = (bookName: string, chapterNum: number) => {
    const current = progress.completedChapters[bookName] || [];
    const updated = current.includes(chapterNum) ? current.filter(c => c !== chapterNum) : [...current, chapterNum];
    setProgress({ ...progress, completedChapters: { ...progress.completedChapters, [bookName]: updated } });
  };

  const openSelectionModal = () => {
    if (!selectedBook) return;
    const current = progress.completedChapters[selectedBook.name] || [];
    setTempSelectedChapters([...current]);
    setShowSelectionModal(true);
  };

  const handleConfirmMultiMark = () => {
    if (!selectedBook) return;
    setProgress({
      ...progress,
      completedChapters: {
        ...progress.completedChapters,
        [selectedBook.name]: [...tempSelectedChapters]
      }
    });
    setShowSelectionModal(false);
  };

  const toggleTempChapter = (chapterNum: number) => {
    setTempSelectedChapters(prev => 
      prev.includes(chapterNum) ? prev.filter(c => c !== chapterNum) : [...prev, chapterNum]
    );
  };

  const markAllTemp = () => {
    if (!selectedBook) return;
    const all = Array.from({ length: selectedBook.chapters.length }, (_, i) => i + 1);
    setTempSelectedChapters(all);
  };

  const clearTemp = () => {
    setTempSelectedChapters([]);
  };

  const handleSaveNote = () => {
    if (!selectedBook || !activeNoteVerse || !noteInput.trim()) return;
    const newNote: BibleNote = {
      id: Date.now().toString(),
      bookName: selectedBook.name,
      chapter: selectedChapterIndex + 1,
      verse: activeNoteVerse.number,
      verseText: activeNoteVerse.text,
      content: noteInput,
      date: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setNoteInput('');
    setActiveNoteVerse(null);
  };

  const currentNotes = selectedBook ? notes.filter(n => n.bookName === selectedBook.name && n.chapter === selectedChapterIndex + 1) : [];

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-700 pb-10">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase neon-text flex items-center gap-4">
            <BookOpen size={42} className="text-brand" />
            Bíblia
          </h1>
          <p className="text-gray-500 mt-2 font-medium">As Sagradas Escrituras.</p>
        </div>
        <button 
          onClick={() => setShowJournal(!showJournal)}
          className={`px-10 py-5 rounded-[22px] font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 shadow-xl ${
            showJournal ? 'bg-brand text-white shadow-brand/30' : 'bg-[#161b22] text-gray-400 border border-white/5 hover:border-brand/30'
          }`}
        >
          <Bookmark size={18} /> DIÁRIO BÍBLICO
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 min-h-0">
        {/* Sidebar de Livros com Títulos de Testamentos */}
        <aside className="md:col-span-3 bg-[#161b22] rounded-[48px] border border-white/5 flex flex-col overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-black/20 flex items-center justify-between">
            <h3 className="font-black text-brand text-[10px] uppercase tracking-[0.3em]">Cânon</h3>
            <Search size={16} className="text-gray-700" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1.5 bg-[#0b0e14]/30">
            {bibleData.books.map((book, idx) => {
              const comp = (progress.completedChapters[book.name] || []).length;
              const total = book.chapters?.length || 1;
              const pct = Math.round((comp / total) * 100);
              
              const isOldTestamentStart = idx === 0;
              const isNewTestamentStart = idx === 39;

              return (
                <React.Fragment key={book.name}>
                  {isOldTestamentStart && (
                    <div className="px-6 py-4 mt-2">
                       <p className="text-[10px] font-black text-brand uppercase tracking-[0.3em] border-b border-brand/20 pb-2">Antigo Testamento</p>
                    </div>
                  )}
                  {isNewTestamentStart && (
                    <div className="px-6 py-4 mt-6">
                       <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] border-b border-emerald-500/20 pb-2">Novo Testamento</p>
                    </div>
                  )}
                  <button
                    onClick={() => { setSelectedBookIndex(idx); setSelectedChapterIndex(0); }}
                    className={`w-full text-left px-6 py-4 rounded-[20px] transition-all flex items-center justify-between group ${
                      selectedBookIndex === idx ? 'bg-brand text-white shadow-lg' : 'text-gray-600 hover:bg-white/5 hover:text-gray-300'
                    }`}
                  >
                    <span className="font-black uppercase text-[11px] tracking-tight truncate mr-2">{book.name}</span>
                    <span className="text-[9px] font-black opacity-30">{pct}%</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </aside>

        {/* Leitor */}
        <section className={`transition-all duration-700 flex flex-col bg-[#161b22] rounded-[56px] shadow-2xl border border-white/5 overflow-hidden relative ${showJournal ? 'md:col-span-6' : 'md:col-span-9'}`}>
          {selectedBook ? (
            <>
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-xl z-10">
                <div className="flex items-center gap-6">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedBook.name}</h2>
                  <div className="relative">
                    <select 
                      value={selectedChapterIndex}
                      onChange={(e) => setSelectedChapterIndex(Number(e.target.value))}
                      className="bg-[#0b0e14] border border-white/10 rounded-[20px] px-8 py-4 text-xs font-black text-white outline-none focus:ring-4 focus:ring-brand/20 appearance-none cursor-pointer pr-16 shadow-inner"
                    >
                      {selectedBook.chapters?.map((_, i) => (
                        <option key={i} value={i}>Cap. {i + 1}</option>
                      ))}
                    </select>
                    <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-brand rotate-90" size={16} />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={openSelectionModal}
                    className="flex items-center gap-2 px-6 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest bg-white/5 text-gray-500 border border-white/5 hover:border-brand/30 hover:text-brand transition-all"
                    title="Marcar vários capítulos"
                  >
                    <ListChecks size={18} /> MARCAR VÁRIOS
                  </button>

                  <button 
                    onClick={() => toggleChapter(selectedBook.name, selectedChapterIndex + 1)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                      (progress.completedChapters[selectedBook.name] || []).includes(selectedChapterIndex + 1)
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-2xl' 
                        : 'bg-brand text-white shadow-brand/30'
                    }`}
                  >
                    {(progress.completedChapters[selectedBook.name] || []).includes(selectedChapterIndex + 1) ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    {(progress.completedChapters[selectedBook.name] || []).includes(selectedChapterIndex + 1) ? 'LIDO' : 'CONCLUIR'}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 md:p-20 space-y-12 custom-scrollbar bg-[#0b0e14]/50">
                {selectedChapter?.verses?.map((v) => (
                  <div key={v.number} className="group relative">
                    <div className="flex gap-10">
                      <span className="text-brand/20 font-black text-2xl mt-1.5 flex-shrink-0 w-12 text-right italic font-serif">{v.number}</span>
                      <div className="flex-1">
                        <p className="text-gray-300 leading-relaxed text-2xl font-serif italic selection:bg-brand/30">
                          {v.text}
                        </p>
                        <div className="mt-6 flex gap-6 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setActiveNoteVerse(v); setShowJournal(true); }} className="flex items-center gap-2 text-[10px] font-black uppercase text-brand">
                            <Edit3 size={14} /> Anotar
                          </button>
                          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`"${v.text}" - ${selectedBook.name} ${selectedChapterIndex+1}:${v.number}`)}`, '_blank')} className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-600">
                            <Share2 size={14} /> Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 border-t border-white/5 flex justify-between bg-black/20">
                <button disabled={selectedChapterIndex === 0} onClick={() => setSelectedChapterIndex(prev => prev - 1)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-brand disabled:opacity-10 transition-all">
                  <ArrowLeft size={18}/> Anterior
                </button>
                <button disabled={selectedChapterIndex === (selectedBook.chapters?.length || 1) - 1} onClick={() => setSelectedChapterIndex(prev => prev + 1)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-brand disabled:opacity-10 transition-all">
                  Próximo <ArrowRight size={18}/>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-10">
              <BookOpen size={100} className="mb-8" />
              <h3 className="font-black text-3xl uppercase tracking-tighter">Selecione um Livro</h3>
            </div>
          )}
        </section>

        {/* Journal Sidebar */}
        {showJournal && (
          <aside className="md:col-span-3 bg-[#161b22] rounded-[48px] border border-white/5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="font-black text-white text-xl uppercase tracking-tighter">Insights</h3>
              <button onClick={() => setShowJournal(false)} className="text-gray-500 hover:text-white transition-colors p-2"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {activeNoteVerse ? (
                <div className="bg-brand/10 border border-brand/30 p-8 rounded-[40px] space-y-6 shadow-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand">v{activeNoteVerse.number}</p>
                  <textarea 
                    autoFocus
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    placeholder="O que o Espírito revelou?"
                    className="w-full bg-[#0b0e14] border border-white/10 rounded-[24px] p-6 text-white text-sm outline-none placeholder:text-gray-800 h-40 resize-none font-medium"
                  />
                  <button onClick={handleSaveNote} className="w-full bg-brand text-white py-5 rounded-[22px] font-black text-[10px] uppercase tracking-widest shadow-xl">
                    SALVAR NOTA
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 opacity-40">
                  <p className="text-[10px] font-black uppercase tracking-widest">Anotações do Capítulo</p>
                </div>
              )}
              <div className="space-y-6">
                {currentNotes.map(note => (
                  <div key={note.id} className="bg-[#0b0e14]/50 p-8 rounded-[32px] border border-white/5 relative group">
                    <p className="text-[9px] font-black text-brand uppercase mb-4">v{note.verse}</p>
                    <p className="text-gray-300 text-sm font-medium leading-relaxed italic font-serif">"{note.content}"</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Modal Marcar Vários Capítulos - Design Coerente Crentify */}
      {showSelectionModal && selectedBook && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="bg-[#161b22] w-full max-w-xl rounded-[48px] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              <div className="p-10 flex justify-between items-start bg-black/20">
                 <div>
                    <h3 className="text-4xl font-serif font-black text-white leading-none uppercase tracking-tighter">Marcar Vários Capítulos</h3>
                    <p className="text-[11px] font-black text-brand uppercase tracking-[0.4em] mt-3">{selectedBook.name}</p>
                 </div>
                 <button onClick={() => setShowSelectionModal(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-500 hover:text-rose-500 transition-all shadow-xl">
                   <X size={24}/>
                 </button>
              </div>

              <div className="px-10 py-8 flex gap-4">
                 <button 
                  onClick={markAllTemp}
                  className="flex-1 bg-[#1c2128] border border-white/5 py-4 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:bg-brand/20 hover:text-white hover:border-brand/40 transition-all shadow-lg"
                 >
                   MARCAR TUDO
                 </button>
                 <button 
                  onClick={clearTemp}
                  className="flex-1 bg-[#1c2128] border border-white/5 py-4 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:bg-rose-500/20 hover:text-white hover:border-rose-500/40 transition-all shadow-lg"
                 >
                   LIMPAR SELEÇÃO
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar max-h-[45vh]">
                 <div className="grid grid-cols-6 gap-3">
                    {selectedBook.chapters.map((_, i) => {
                      const chNum = i + 1;
                      const isSelected = tempSelectedChapters.includes(chNum);
                      return (
                        <button
                          key={chNum}
                          onClick={() => toggleTempChapter(chNum)}
                          className={`aspect-square rounded-2xl flex items-center justify-center font-black text-lg transition-all border ${
                            isSelected 
                              ? 'bg-brand text-white border-brand shadow-[0_0_20px_rgba(135,67,242,0.4)] scale-105' 
                              : 'bg-[#0b0e14] text-gray-600 border-white/5 hover:border-brand/30 hover:text-gray-300'
                          }`}
                        >
                          {chNum}
                        </button>
                      );
                    })}
                 </div>
              </div>

              <div className="p-10 bg-black/40 border-t border-white/5">
                 <button 
                  onClick={handleConfirmMultiMark}
                  className="w-full bg-[#fefe00] text-black py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_15px_40px_rgba(254,254,0,0.3)] hover:scale-[1.03] active:scale-95 transition-all"
                 >
                   CONFIRMAR ALTERAÇÕES
                 </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(135, 67, 242, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default BibleView;
