
import React, { useState } from 'react';
import { BibleData, AcademyContent, AcademyCategory, AcademyVisibility } from '../types';
import { Upload, Database, GraduationCap, Plus, Trash2, CheckCircle2, AlertTriangle, Settings, Zap, Loader2, Youtube, Edit2, FileText, X, Eye, EyeOff, Lock } from 'lucide-react';

interface AdminPanelProps {
  bibleData: BibleData | null;
  setBibleData: (data: BibleData) => Promise<void>;
  academyContent: AcademyContent[];
  setAcademyContent: (c: AcademyContent[]) => void;
  academyCategories: AcademyCategory[];
  setAcademyCategories: (cat: AcademyCategory[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  bibleData, setBibleData, academyContent, setAcademyContent, academyCategories, setAcademyCategories 
}) => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bible' | 'academy'>('bible');
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados do Módulo Academy
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [newModule, setNewModule] = useState<Partial<AcademyContent>>({
    title: '',
    description: '',
    categoryId: academyCategories[0]?.id || '1',
    type: 'video',
    url: '',
    visibility: 'público'
  });

  // Normalizador Ultra-Tolerante (Lida com múltiplos formatos de JSON bíblico)
  const normalizeBibleData = (raw: any): BibleData => {
    let rawBooks = Array.isArray(raw) ? raw : (raw.books || raw.Books || raw.biblia || raw.Bible || []);
    
    if (!Array.isArray(rawBooks) || rawBooks.length === 0) {
      throw new Error("Estrutura JSON não reconhecida. Certifique-se de que o arquivo contém uma lista de livros.");
    }

    return {
      books: rawBooks.map((b: any) => {
        const bookName = b.name || b.nome || b.book || b.label || 'Livro';
        const rawChapters = b.chapters || b.capitulos || b.content || [];
        
        return {
          name: bookName,
          chapters: (Array.isArray(rawChapters) ? rawChapters : []).map((c: any, i: number) => {
            // Se o capítulo for uma lista direta de strings (versículos)
            if (Array.isArray(c) && typeof c[0] === 'string') {
              return {
                number: i + 1,
                verses: c.map((text: string, j: number) => ({ number: j + 1, text }))
              };
            }
            
            // Se o capítulo for um objeto com lista de versículos
            const rawVerses = c.verses || c.versiculos || c.content || (Array.isArray(c) ? c : []);
            return {
              number: c.number || i + 1,
              verses: (Array.isArray(rawVerses) ? rawVerses : []).map((v: any, j: number) => {
                if (typeof v === 'string') return { number: j + 1, text: v };
                return {
                  number: v.number || v.versiculo || j + 1,
                  text: v.text || v.texto || v.v || ''
                };
              })
            };
          })
        };
      })
    };
  };

  const handleBibleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonText = event.target?.result as string;
        const parsed = JSON.parse(jsonText);
        const normalized = normalizeBibleData(parsed);
        
        // Grava no IndexedDB através da função do App.tsx
        await setBibleData(normalized);
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      } catch (err: any) { 
        console.error("Erro na importação:", err);
        setError(err.message || "Erro desconhecido ao processar JSON."); 
      } finally { 
        setIsProcessing(false); 
        e.target.value = ''; // Reseta o input
      }
    };

    reader.onerror = () => {
      setError("Erro físico na leitura do arquivo.");
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleAddOrUpdateModule = () => {
    if (!newModule.title || !newModule.url) return;
    
    if (editingModuleId) {
      const updatedContent = academyContent.map(item => 
        item.id === editingModuleId ? { ...item, ...newModule as AcademyContent } : item
      );
      setAcademyContent(updatedContent);
      setEditingModuleId(null);
    } else {
      const content: AcademyContent = {
        id: Date.now().toString(),
        title: newModule.title!,
        description: newModule.description || '',
        categoryId: newModule.categoryId || '1',
        type: newModule.type || 'video',
        url: newModule.url,
        visibility: newModule.visibility || 'público'
      };
      setAcademyContent([content, ...academyContent]);
    }

    setNewModule({ title: '', description: '', categoryId: academyCategories[0]?.id || '1', type: 'video', url: '', visibility: 'público' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="h-full flex flex-col space-y-10 animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase neon-text flex items-center gap-4">
            <Settings size={42} className="text-brand" />
            Admin
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Controle de Dados e Infraestrutura.</p>
        </div>
        <div className="flex bg-[#161b22] p-1.5 rounded-2xl border border-white/5 shadow-2xl">
          {(['bible', 'academy'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-600 hover:text-gray-300'}`}
            >
              {tab === 'bible' ? 'Escrituras' : 'Academy'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Lado Esquerdo: Formulários */}
        <div className={`lg:col-span-7 bg-[#161b22] p-10 rounded-[56px] border shadow-2xl space-y-10 relative overflow-hidden group transition-all duration-500 ${editingModuleId ? 'border-brand/40 ring-1 ring-brand/20' : 'border-white/5'}`}>
          <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:scale-110 transition-transform">
            {activeTab === 'bible' ? <Database size={180} className="text-brand" /> : <GraduationCap size={180} className="text-brand" />}
          </div>

          {activeTab === 'bible' ? (
            <div className="space-y-10 animate-in slide-in-from-left duration-500">
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-brand/10 text-brand rounded-[28px] flex items-center justify-center border border-brand/20 shadow-xl">
                    <Database size={36} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Bíblia Digital</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">
                      {bibleData ? `${bibleData.books.length} Livros em Memória Local` : 'Aguardando Importação JSON'}
                    </p>
                  </div>
               </div>
               
               <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/10 rounded-[40px] cursor-pointer bg-black/20 hover:border-brand/40 hover:bg-brand/5 transition-all group/upload relative">
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-brand" size={48} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand animate-pulse">Gravando no Banco de Dados...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="text-gray-700 mb-4 group-hover/upload:text-brand transition-all" size={48} />
                      <p className="text-[11px] font-black uppercase text-gray-500 tracking-[0.3em] text-center max-w-xs px-10">Importar Arquivo JSON (NVI, Almeida, etc)</p>
                      <input type="file" className="hidden" accept=".json" onChange={handleBibleUpload} />
                    </>
                  )}
               </label>
            </div>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-brand/10 text-brand rounded-[28px] flex items-center justify-center border border-brand/20 shadow-xl">
                      <GraduationCap size={36} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                        {editingModuleId ? 'Editar Aula' : 'Nova Aula Academy'}
                      </h2>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">Cadastre conteúdos externos (YouTube)</p>
                    </div>
                  </div>
                  {editingModuleId && (
                    <button onClick={() => { setEditingModuleId(null); setNewModule({title:'', description:'', url:'', visibility:'público'}); }} className="text-rose-500 hover:scale-110 transition-all"><X size={24} /></button>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Título</label>
                    <input type="text" placeholder="Nome da Aula" value={newModule.title} onChange={e => setNewModule({...newModule, title: e.target.value})} className="w-full bg-[#0b0e14] border border-white/5 rounded-[22px] px-8 py-5 text-white font-black outline-none focus:ring-2 focus:ring-brand/30 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Link YouTube</label>
                    <div className="relative">
                      <Youtube size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700" />
                      <input type="text" placeholder="URL do Vídeo" value={newModule.url} onChange={e => setNewModule({...newModule, url: e.target.value})} className="w-full bg-[#0b0e14] border border-white/5 rounded-[22px] pl-14 pr-8 py-5 text-white font-black outline-none focus:ring-2 focus:ring-brand/30 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Categoria</label>
                    <select value={newModule.categoryId} onChange={e => setNewModule({...newModule, categoryId: e.target.value})} className="w-full bg-[#0b0e14] border border-white/5 text-white rounded-[22px] px-8 py-5 font-black outline-none appearance-none cursor-pointer">
                      {academyCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Visibilidade</label>
                    <select value={newModule.visibility} onChange={e => setNewModule({...newModule, visibility: e.target.value as AcademyVisibility})} className="w-full bg-[#0b0e14] border border-white/5 text-white rounded-[22px] px-8 py-5 font-black outline-none appearance-none cursor-pointer">
                      <option value="público">Público (Todos)</option>
                      <option value="não listado">Não Listado (Apenas Link)</option>
                      <option value="privado">Privado (Apenas Admins)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Descrição</label>
                    <textarea placeholder="Resumo da aula..." value={newModule.description} onChange={e => setNewModule({...newModule, description: e.target.value})} className="w-full bg-[#0b0e14] border border-white/5 text-white rounded-[32px] px-8 py-5 font-medium outline-none focus:ring-2 focus:ring-brand/30 h-32 resize-none" />
                  </div>
               </div>

               <button onClick={handleAddOrUpdateModule} className="w-full bg-brand text-white py-6 rounded-[28px] font-black uppercase tracking-[0.3em] shadow-xl shadow-brand/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4">
                 {editingModuleId ? <CheckCircle2 size={24} /> : <Zap size={24} strokeWidth={3} />}
                 {editingModuleId ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR MÓDULO'}
               </button>
            </div>
          )}

          {success && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-[32px] text-emerald-500 text-center font-black uppercase text-[10px] tracking-widest animate-in zoom-in shadow-2xl flex items-center justify-center gap-3">
              <CheckCircle2 size={18} /> Operação concluída com êxito!
            </div>
          )}
          {error && (
            <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-[32px] text-rose-500 text-center font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">
              <AlertTriangle size={18} /> Erro: {error}
            </div>
          )}
        </div>

        {/* Lado Direito: Listagem */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-[#161b22] p-10 rounded-[48px] border border-white/5 shadow-2xl">
              <h3 className="text-[10px] font-black text-brand uppercase tracking-[0.3em] mb-8">Aulas Ativas ({academyContent.length})</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                 {academyContent.map(item => (
                   <div key={item.id} className={`flex items-center justify-between p-6 rounded-[32px] border transition-all group ${editingModuleId === item.id ? 'bg-brand/10 border-brand' : 'bg-[#0b0e14]/50 border-white/5 hover:border-brand/30'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center border border-brand/20">
                          {item.type === 'video' ? <Youtube size={20} /> : <FileText size={20} />}
                        </div>
                        <div className="max-w-[150px] md:max-w-[200px]">
                          <div className="flex items-center gap-2">
                             <p className="text-sm font-black text-white uppercase truncate tracking-tight">{item.title}</p>
                             {item.visibility === 'privado' && <Lock size={12} className="text-rose-500" />}
                             {item.visibility === 'não listado' && <EyeOff size={12} className="text-gray-500" />}
                          </div>
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest line-clamp-1">
                            {academyCategories.find(c => c.id === item.categoryId)?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingModuleId(item.id); setNewModule(item); setActiveTab('academy'); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-gray-500 hover:text-brand transition-colors p-2">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => { if(confirm('Excluir aula?')) setAcademyContent(academyContent.filter(c => c.id !== item.id)); }} className="text-gray-500 hover:text-rose-500 transition-colors p-2">
                          <Trash2 size={18} />
                        </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;