
import React, { useState, useRef } from 'react';
import { WorkflowTask } from '../types';
import { Sparkles, Send, Globe, Youtube, Clapperboard, Loader2, Briefcase, Plus, Trash2, FileText, Quote, Target, Image as ImageIcon, Download, X, Layers, Check, Link, Mic } from 'lucide-react';
import { generateContentScript } from '../services/geminiService';
import { postToWordPress } from '../services/wpService';

interface WorkflowProps {
  tasks: WorkflowTask[];
  setTasks: (t: WorkflowTask[]) => void;
}

const Workflow: React.FC<WorkflowProps> = ({ tasks, setTasks }) => {
  const [activeTask, setActiveTask] = useState<WorkflowTask | null>(null);
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<'YouTube' | 'TikTok' | 'WordPress'>('YouTube');
  const [editorialAngle, setEditorialAngle] = useState('');
  const [sources, setSources] = useState(['', '', '']);
  const [transcript, setTranscript] = useState('');
  const [transcriptSpeaker, setTranscriptSpeaker] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTitleBrazilian = (text: string) => {
    if (!text) return '';
    if (text === text.toUpperCase()) {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const convertToWebP = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Erro ao criar contexto canvas');
          ctx.drawImage(img, 0, 0);
          const webpData = canvas.toDataURL('image/webp', 0.85);
          resolve(webpData);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const webpData = await convertToWebP(file);
      setUploadedImage(webpData);
    } catch (err) {
      alert('Erro ao processar imagem.');
    }
  };

  const handleSourceChange = (index: number, value: string) => {
    const newSources = [...sources];
    newSources[index] = value;
    setSources(newSources);
  };

  const handleGenerate = async () => {
    if (!topic || !editorialAngle) {
      alert('Por favor, preencha o Tópico e o Ângulo Editorial.');
      return;
    }
    setIsGenerating(true);
    try {
      const activeSources = sources.filter(s => s.trim() !== '');
      const script = await generateContentScript(
        topic, 
        platform, 
        activeSources, 
        editorialAngle, 
        transcript,
        transcriptSpeaker
      );
      
      const formattedTitle = formatTitleBrazilian(topic);
      
      const newTask: WorkflowTask = {
        id: Date.now().toString(),
        title: formattedTitle,
        platform,
        status: 'ready',
        script: script || '',
        sources: activeSources,
        editorialAngle,
        transcript,
        transcriptSpeaker,
        imageWebP: uploadedImage || undefined
      };
      
      setTasks([newTask, ...(tasks || [])]);
      setActiveTask(newTask);
      setTopic(formattedTitle);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar conteúdo com IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePostWP = async (task: WorkflowTask) => {
    if (task.platform !== 'WordPress' || !task.script) return;
    setIsPosting(true);
    try {
      await postToWordPress(task.title, task.script);
      setTasks((tasks || []).map(t => t.id === task.id ? { ...t, status: 'published' } : t));
      setSuccessMessage('Enviado com sucesso!');
      setTimeout(() => setSuccessMessage(null), 5000);
      alert('Enviado com sucesso! O rascunho já está disponível no YouCrente.com.');
    } catch (err: any) {
      alert('Erro ao postar: ' + err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const downloadImage = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName.toLowerCase().replace(/\s+/g, '-')}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col space-y-10 animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase neon-text flex items-center gap-4">
            <Briefcase size={42} className="text-brand" />
            Workflow
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Estúdio Criativo Digital: Do Roteiro à Publicação.</p>
        </div>
        {successMessage && (
          <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black animate-bounce shadow-xl flex items-center gap-2 text-xs uppercase tracking-widest">
            <Send size={16} strokeWidth={3} /> {successMessage}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 min-h-0">
        {/* Lado Esquerdo: Input Pro */}
        <section className="lg:col-span-5 space-y-8 overflow-y-auto pr-4 custom-scrollbar">
          <div className="bg-[#161b22] p-10 rounded-[48px] border border-white/5 shadow-2xl space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
              <Sparkles size={150} className="text-brand" />
            </div>

            <div className="relative z-10 space-y-8">
              {/* Tópico e Imagem */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tópico Principal</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#0b0e14] border border-white/5 text-white rounded-[24px] px-8 py-5 outline-none focus:ring-2 focus:ring-brand/30 font-black placeholder:text-gray-800 transition-all"
                    placeholder="Ex: Arqueologia Bíblica em Israel"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <ImageIcon size={12} /> Capa (WebP)
                  </label>
                  {uploadedImage ? (
                    <div className="relative rounded-[32px] overflow-hidden border border-brand/30 aspect-video group shadow-2xl">
                      <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setUploadedImage(null)}
                        className="absolute top-4 right-4 bg-black/60 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-white/5 rounded-[32px] py-10 flex flex-col items-center justify-center text-gray-600 hover:border-brand/30 hover:bg-brand/5 transition-all group"
                    >
                      <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Importar Mídia</span>
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg" className="hidden" />
                </div>
              </div>

              {/* Ângulo Editorial */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Ângulo Editorial</label>
                <textarea 
                  className="w-full bg-[#0b0e14] border border-white/5 text-white rounded-[28px] px-8 py-5 outline-none focus:ring-2 focus:ring-brand/30 font-medium placeholder:text-gray-800 h-24 resize-none transition-all"
                  placeholder="Ex: Focar na comprovação histórica dos relatos do Antigo Testamento..."
                  value={editorialAngle}
                  onChange={(e) => setEditorialAngle(e.target.value)}
                />
              </div>

              {/* NOVO: Fontes de Referência (3 Campos) */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Link size={14} /> Fontes de Referência (Opcional)
                </label>
                <div className="space-y-3">
                  {sources.map((src, i) => (
                    <div key={i} className="relative group/field">
                      <input 
                        type="text" 
                        value={src}
                        onChange={(e) => handleSourceChange(i, e.target.value)}
                        placeholder={`Fonte #${i + 1} (URL ou Texto)`}
                        className="w-full bg-[#0b0e14] border border-white/5 text-white rounded-[18px] px-6 py-4 outline-none focus:ring-2 focus:ring-brand/30 font-bold placeholder:text-gray-800 text-xs transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* NOVO: Bloco de Transcrição */}
              <div className="space-y-4 bg-black/20 p-6 rounded-[36px] border border-white/5">
                <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Mic size={14} /> Base de Transcrição
                </label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-2">Identificação do Orador / Título</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Transcrição da fala de Pastor Silas Malafaia"
                      value={transcriptSpeaker}
                      onChange={(e) => setTranscriptSpeaker(e.target.value)}
                      className="w-full bg-[#0b0e14] border border-white/5 text-white rounded-[18px] px-6 py-4 outline-none focus:ring-2 focus:ring-brand/30 font-black placeholder:text-gray-800 text-xs transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-2">Conteúdo da Transcrição</label>
                    <textarea 
                      placeholder="Cole aqui a transcrição do áudio ou vídeo..."
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      className="w-full bg-[#0b0e14] border border-white/5 text-white rounded-[22px] px-6 py-4 outline-none focus:ring-2 focus:ring-brand/30 font-medium placeholder:text-gray-800 h-40 resize-none text-xs leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Plataforma */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Plataforma</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'YouTube', icon: <Youtube size={20} /> },
                    { id: 'TikTok', icon: <Clapperboard size={20} /> },
                    { id: 'WordPress', icon: <Globe size={20} /> }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id as any)}
                      className={`flex flex-col items-center justify-center p-4 rounded-[22px] border transition-all ${
                        platform === p.id 
                          ? 'bg-brand text-white border-brand shadow-xl' 
                          : 'bg-[#0b0e14] border-white/5 text-gray-600 hover:border-brand/40'
                      }`}
                    >
                      {p.icon}
                      <span className="text-[9px] mt-2 font-black uppercase tracking-widest">{p.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !topic || !editorialAngle}
                className="w-full bg-gradient-to-r from-brand to-brand-light text-white py-6 rounded-[28px] font-black flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 disabled:opacity-30 transition-all shadow-xl shadow-brand/20 uppercase tracking-[0.2em]"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} strokeWidth={3} />}
                PROCESSAR IA
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <Layers size={18} className="text-brand" />
              <h3 className="font-black text-gray-500 uppercase text-[10px] tracking-widest">Histórico</h3>
            </div>
            {(tasks || []).map(task => (
              <button
                key={task.id}
                onClick={() => setActiveTask(task)}
                className={`w-full text-left p-6 rounded-[32px] border transition-all ${
                  activeTask?.id === task.id ? 'bg-brand/10 border-brand shadow-2xl' : 'bg-[#161b22] border-white/5 hover:border-brand/40'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-[#0b0e14] text-brand text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">{task.platform}</span>
                </div>
                <h4 className="font-black text-white line-clamp-1 text-xs leading-tight uppercase tracking-tight">{task.title}</h4>
              </button>
            ))}
          </div>
        </section>

        {/* Lado Direito: Preview Imersivo */}
        <section className="lg:col-span-7 bg-[#161b22] rounded-[56px] border border-white/5 shadow-2xl flex flex-col overflow-hidden relative">
          {activeTask ? (
            <>
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-xl">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center shadow-lg ${
                    activeTask.platform === 'WordPress' ? 'bg-blue-600' : 'bg-red-600'
                  }`}>
                    {activeTask.platform === 'WordPress' ? <Globe size={28} /> : <Youtube size={28} />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter line-clamp-1">{activeTask.title}</h2>
                    <p className="text-[10px] font-black text-brand uppercase tracking-widest">Preview Digital</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {activeTask.platform === 'WordPress' && activeTask.status !== 'published' && (
                    <button 
                      onClick={() => handlePostWP(activeTask)}
                      disabled={isPosting}
                      className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 disabled:opacity-30 shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2"
                    >
                      {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      ENVIAR AO WP
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#0b0e14]/50">
                <div className="bg-[#161b22] p-12 rounded-[48px] border border-white/5 shadow-inner">
                  {activeTask.imageWebP && (
                    <div className="mb-10 rounded-[32px] overflow-hidden shadow-2xl border border-white/5">
                      <img src={activeTask.imageWebP} alt="Cover" className="w-full h-auto object-cover max-h-[500px]" />
                    </div>
                  )}
                  <div 
                    className="workflow-preview-content"
                    dangerouslySetInnerHTML={{ 
                      __html: (activeTask.script || '')
                        .replace(/<h1>(.*?)<\/h1>/g, '<h1 class="text-5xl font-black text-white mb-10 tracking-tighter uppercase">$1</h1>')
                        .replace(/<h2>(.*?)<\/h2>/g, '<h2 class="text-3xl font-black text-brand mb-6 mt-12 tracking-tight uppercase border-l-4 border-brand pl-6">$1</h2>')
                        .replace(/<h3>(.*?)<\/h3>/g, '<h3 class="text-xl font-black text-white/80 mb-4 mt-8 tracking-tight uppercase">$1</h3>')
                        .replace(/\n/g, '<br/>') 
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-20">
              <Briefcase size={80} className="mb-8" />
              <h3 className="font-black text-3xl text-white uppercase tracking-tighter">Estúdio Criativo</h3>
              <p className="text-sm font-medium max-w-sm mt-4">Inicie um projeto preenchendo as bases de fontes e transcrições ao lado.</p>
            </div>
          )}
        </section>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(135, 67, 242, 0.2); border-radius: 10px; }
        .workflow-preview-content { color: rgba(255, 255, 255, 0.7); font-size: 1.1rem; line-height: 1.8; }
      `}</style>
    </div>
  );
};

export default Workflow;
