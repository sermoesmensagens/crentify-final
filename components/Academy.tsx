
import React, { useState } from 'react';
import { AcademyContent, AcademyCategory, AcademyReflection } from '../types';
import { Play, FileText, Search, GraduationCap, X, MessageCircle, Zap, Info, Loader2, Sparkles, Send, Lock, EyeOff } from 'lucide-react';

interface AcademyProps {
  content: AcademyContent[];
  categories: AcademyCategory[];
  reflections: AcademyReflection[];
  setReflections: (r: AcademyReflection[]) => void;
}

const Academy: React.FC<AcademyProps> = ({ content, categories, reflections, setReflections }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<AcademyContent | null>(null);

  const [reflectionText, setReflectionText] = useState('');

  // Sincronização de administradores autorizados
  const AUTHORIZED_ADMINS = ['sermoes.mensagens@gmail.com', 'andrea.marcelamkt@gmail.com'];
  
  // Simulando verificação de usuário (Em produção, extrair do contexto de Auth)
  const userEmail = "sermoes.mensagens@gmail.com"; // Simulação de admin logado
  const isCurrentUserAdmin = AUTHORIZED_ADMINS.includes(userEmail);

  const filteredContent = content.filter(c => {
    // Regras estritas de visibilidade
    if (!isCurrentUserAdmin) {
      if (c.visibility === 'privado') return false;
      // "não listado" não aparece na busca ou lista geral para usuários comuns
      if (c.visibility === 'não listado') return false; 
    }
    
    const matchesCategory = activeCategory === 'all' || c.categoryId === activeCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getEmbedUrl = (item: AcademyContent) => {
    if (!item.url) return null;
    const yid = getYoutubeId(item.url);
    if (yid) return `https://www.youtube.com/embed/${yid}?autoplay=1`;
    return item.url;
  };

  const getThumbnail = (item: AcademyContent) => {
    if (item.thumbnailUrl) return item.thumbnailUrl;
    if (item.type === 'video' && item.url) {
      const yid = getYoutubeId(item.url);
      if (yid) return `https://img.youtube.com/vi/${yid}/maxresdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=800';
  };

  const handleSaveReflection = () => {
    if (!selectedContent || !reflectionText.trim()) return;
    const newRef: AcademyReflection = {
      id: Date.now().toString(),
      contentId: selectedContent.id,
      title: selectedContent.title,
      text: reflectionText,
      date: new Date().toISOString()
    };
    setReflections([newRef, ...reflections]);
    setReflectionText('');
    alert('Revelação salva com sucesso!');
  };

  const currentReflections = selectedContent ? reflections.filter(r => r.contentId === selectedContent.id) : [];

  return (
    <div className="h-full flex flex-col space-y-10 animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase neon-text flex items-center gap-4">
            <GraduationCap size={42} className="text-brand" />
            Academy
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Capacitação ministerial e crescimento intelectual.</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar cursos..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#161b22] border border-white/5 rounded-[24px] py-5 pl-16 pr-6 text-white outline-none focus:ring-2 focus:ring-brand/30 font-bold placeholder:text-gray-800 shadow-2xl transition-all"
          />
        </div>
      </header>

      <div className="flex gap-2.5 overflow-x-auto pb-4 custom-scrollbar">
        <button onClick={() => setActiveCategory('all')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${activeCategory === 'all' ? 'bg-brand text-white border-brand shadow-lg' : 'bg-white/5 text-gray-500 border-white/5'}`}>TODOS</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${activeCategory === cat.id ? 'bg-brand text-white border-brand shadow-lg' : 'bg-white/5 text-gray-500 border-white/5'}`}>{cat.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredContent.map(item => (
          <div key={item.id} onClick={() => setSelectedContent(item)} className="group cursor-pointer bg-[#161b22] rounded-[48px] border border-white/5 overflow-hidden shadow-2xl hover:border-brand/40 transition-all flex flex-col">
            <div className="aspect-[16/10] relative overflow-hidden">
              <img src={getThumbnail(item)} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-transparent opacity-90"></div>
              <div className="absolute top-4 right-4 flex gap-2">
                 {item.visibility === 'privado' && <div className="p-2 bg-rose-500/20 backdrop-blur-md rounded-lg border border-rose-500/20 text-rose-500"><Lock size={12}/></div>}
                 {item.visibility === 'não listado' && <div className="p-2 bg-gray-500/20 backdrop-blur-md rounded-lg border border-gray-500/20 text-gray-300"><EyeOff size={12}/></div>}
              </div>
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                 <div className="w-12 h-12 bg-brand/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-brand border border-brand/20"><Play size={20} fill="currentColor" /></div>
                 <span className="text-[9px] font-black text-white uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                   {categories.find(c => c.id === item.categoryId)?.name}
                 </span>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-xl font-black text-white leading-tight mb-3 uppercase tracking-tight line-clamp-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-8">{item.description}</p>
              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-black text-brand uppercase tracking-widest">{item.type}</span>
                <span className="text-[9px] font-black text-gray-800 uppercase tracking-widest hover:text-white transition-colors">Abrir Módulo</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedContent && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="bg-[#161b22] w-full max-w-7xl rounded-[56px] border border-white/10 shadow-2xl flex flex-col max-h-full overflow-hidden">
              <div className="p-8 flex justify-between items-center border-b border-white/5 bg-black/20">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center text-white shadow-xl"><Play size={28} fill="currentColor" /></div>
                   <div>
                     <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedContent.title}</h3>
                     <p className="text-[10px] font-black text-brand uppercase tracking-widest">Módulo Academy</p>
                   </div>
                </div>
                <button onClick={() => setSelectedContent(null)} className="w-14 h-14 bg-white/5 text-gray-500 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><X size={32} /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="aspect-video w-full bg-black">
                  {selectedContent.type === 'video' ? (
                    <iframe src={getEmbedUrl(selectedContent) || ''} className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 uppercase font-black tracking-widest">Conteúdo em Texto</div>
                  )}
                </div>
                
                <div className="p-12 md:p-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
                   <div className="space-y-10">
                      <div className="bg-black/20 p-10 rounded-[48px] border border-white/5">
                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-4"><MessageCircle size={24} className="text-brand" /> O que você aprendeu?</h4>
                        <textarea 
                          value={reflectionText}
                          onChange={e => setReflectionText(e.target.value)}
                          placeholder="Anote suas revelações desta aula..."
                          className="w-full bg-[#0b0e14] border border-white/5 rounded-[32px] p-8 text-white font-medium outline-none h-48 resize-none mb-6"
                        />
                        <button onClick={handleSaveReflection} className="w-full bg-brand text-white py-5 rounded-[22px] font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2">
                          <Send size={16} /> GUARDAR REVELAÇÃO
                        </button>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Minhas Reflexões</h4>
                      <div className="space-y-4">
                        {currentReflections.map(r => (
                          <div key={r.id} className="bg-[#161b22] p-8 rounded-[36px] border border-white/5">
                             <p className="text-gray-300 italic font-serif leading-relaxed">"{r.text}"</p>
                             <p className="text-[8px] font-black text-brand uppercase mt-4 tracking-widest">{new Date(r.date).toLocaleDateString('pt-BR')}</p>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(135, 67, 242, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Academy;
