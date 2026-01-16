
import React, { useState, useRef, useMemo } from 'react';
import { Activity, Utensils, BarChart3, Plus, Trash2, HeartPulse, Zap, Clock, Flame, BookOpen, Youtube, Image as ImageIcon, X, Send, Save, CheckCircle2, Sparkles, Calendar, ChevronRight, Scale, PieChart as PieIcon, Edit2 } from 'lucide-react';
import { PhysicalActivity, MealRecord, Recipe } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface HealthProps {
  activities: PhysicalActivity[];
  setActivities: (a: PhysicalActivity[]) => void;
  meals: MealRecord[];
  setMeals: (m: MealRecord[]) => void;
  recipes: Recipe[];
  setRecipes: (r: Recipe[]) => void;
}

const Health: React.FC<HealthProps> = ({ activities, setActivities, meals, setMeals, recipes, setRecipes }) => {
  const [activeTab, setActiveTab] = useState<'treinos' | 'nutrição' | 'métricas'>('treinos');
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Estados de Atividade
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState<number | ''>(0);
  const [caloriesBurned, setCaloriesBurned] = useState<number | ''>(0);
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);

  // Estados de Refeição
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealRecord['type']>('Café da Manhã');
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0]);
  const [foodDesc, setFoodDesc] = useState('');
  const [mealCalories, setMealCalories] = useState<number | ''>(0);
  const [mealProtein, setMealProtein] = useState<number | ''>(0);
  const [mealCarbs, setMealCarbs] = useState<number | ''>(0);
  const [mealFats, setMealFats] = useState<number | ''>(0);

  // Estados de Receita
  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeInstructions, setRecipeInstructions] = useState('');
  const [recipeYoutube, setRecipeYoutube] = useState('');
  const [recipeImage, setRecipeImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cálculo de Métricas
  const metricsData = useMemo(() => {
    const totalConsumed = (meals || []).reduce((acc, m) => acc + (m.calories || 0), 0);
    const totalBurned = (activities || []).reduce((acc, a) => acc + (a.calories || 0), 0);
    
    const macros = (meals || []).reduce((acc, m) => {
      acc.prot += (m.protein || 0);
      acc.carb += (m.carbs || 0);
      acc.fat += (m.fats || 0);
      return acc;
    }, { prot: 0, carb: 0, fat: 0 });

    const macroChart = [
      { name: 'Proteínas', value: macros.prot, color: '#8743f2' },
      { name: 'Carbos', value: macros.carb, color: '#00ff9f' },
      { name: 'Gorduras', value: macros.fat, color: '#ff2e63' },
    ].filter(m => m.value > 0);

    const activityHistory = (activities || []).slice(0, 7).map(a => ({
      name: a.type.slice(0, 8),
      min: a.duration,
      kcal: a.calories
    })).reverse();

    return { totalConsumed, totalBurned, macroChart, activityHistory };
  }, [meals, activities]);

  // Funções de Exclusão Corrigidas (stopPropagation é essencial)
  const handleDeleteActivity = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Deseja excluir este treino?')) {
      const updated = activities.filter(a => a.id !== id);
      setActivities(updated);
      if (editingActivityId === id) resetActivityForm();
    }
  };

  const handleDeleteMeal = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Deseja excluir esta refeição?')) {
      const updated = meals.filter(m => m.id !== id);
      setMeals(updated);
      if (editingMealId === id) resetMealForm();
    }
  };

  // Funções de Edição
  const startEditActivity = (a: PhysicalActivity) => {
    setEditingActivityId(a.id);
    setActivityType(a.type);
    setDuration(a.duration);
    setCaloriesBurned(a.calories);
    setActivityDate(a.date);
    document.getElementById('health-container')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditMeal = (m: MealRecord) => {
    setEditingMealId(m.id);
    setMealType(m.type);
    setMealDate(m.date);
    setFoodDesc(m.description);
    setMealCalories(m.calories);
    setMealProtein(m.protein);
    setMealCarbs(m.carbs);
    setMealFats(m.fats);
    document.getElementById('health-container')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetActivityForm = () => {
    setEditingActivityId(null);
    setActivityType('');
    setDuration(0);
    setCaloriesBurned(0);
  };

  const resetMealForm = () => {
    setEditingMealId(null);
    setFoodDesc('');
    setMealCalories(0);
    setMealProtein(0);
    setMealCarbs(0);
    setMealFats(0);
  };

  const handleRegisterActivity = () => {
    if (!activityType) return;
    
    if (editingActivityId) {
      setActivities(activities.map(a => a.id === editingActivityId ? {
        ...a,
        type: activityType,
        duration: Number(duration) || 0,
        calories: Number(caloriesBurned) || 0,
        date: activityDate
      } : a));
    } else {
      setActivities([{ 
        id: Date.now().toString(), 
        type: activityType, 
        duration: Number(duration) || 0, 
        calories: Number(caloriesBurned) || 0, 
        date: activityDate, 
        notes: '' 
      }, ...(activities || [])]);
    }
    
    resetActivityForm();
    triggerSuccess();
  };

  const handleRegisterMeal = () => {
    if (!foodDesc || mealType === 'Selecione' as any) {
      alert('Por favor, selecione o tipo de refeição e a descrição.');
      return;
    }

    if (editingMealId) {
      setMeals(meals.map(m => m.id === editingMealId ? {
        ...m,
        type: mealType,
        date: mealDate,
        description: foodDesc,
        calories: Number(mealCalories) || 0,
        protein: Number(mealProtein) || 0,
        carbs: Number(mealCarbs) || 0,
        fats: Number(mealFats) || 0
      } : m));
    } else {
      const newMeal: MealRecord = {
        id: Date.now().toString(),
        type: mealType,
        date: mealDate,
        description: foodDesc,
        calories: Number(mealCalories) || 0,
        protein: Number(mealProtein) || 0,
        carbs: Number(mealCarbs) || 0,
        fats: Number(mealFats) || 0
      };
      setMeals([newMeal, ...(meals || [])]);
    }
    
    resetMealForm();
    triggerSuccess();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setRecipeImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const openRecipeModal = (recipe?: Recipe) => {
    if (recipe) {
      setEditingRecipeId(recipe.id);
      setRecipeTitle(recipe.title);
      setRecipeInstructions(recipe.instructions);
      setRecipeYoutube(recipe.youtubeUrl || '');
      setRecipeImage(recipe.imageUrl || null);
    } else {
      setEditingRecipeId(null);
      setRecipeTitle('');
      setRecipeInstructions('');
      setRecipeYoutube('');
      setRecipeImage(null);
    }
    setShowRecipeModal(true);
  };

  const handleRegisterRecipe = () => {
    if (!recipeTitle || !recipeInstructions) return;
    if (editingRecipeId) {
      setRecipes(recipes.map(r => r.id === editingRecipeId ? {
        ...r,
        title: recipeTitle,
        instructions: recipeInstructions,
        imageUrl: recipeImage || undefined,
        youtubeUrl: recipeYoutube || undefined,
      } : r));
    } else {
      setRecipes([{
        id: Date.now().toString(),
        title: recipeTitle,
        instructions: recipeInstructions,
        imageUrl: recipeImage || undefined,
        youtubeUrl: recipeYoutube || undefined,
        date: new Date().toISOString()
      }, ...recipes]);
    }
    setEditingRecipeId(null);
    setShowRecipeModal(false);
    triggerSuccess();
  };

  const handleDeleteRecipe = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Deseja excluir esta receita?')) {
      setRecipes(recipes.filter(r => r.id !== id));
    }
  };

  const triggerSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const getYoutubeEmbed = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const renderNumericValue = (val: number | '') => val === 0 ? '' : val;

  return (
    <div className="h-full flex flex-col space-y-10 animate-in fade-in duration-700 overflow-hidden">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8 shrink-0">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase neon-text flex items-center gap-4">
            <HeartPulse size={42} className="text-brand" />
            Vigor Físico
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Seu corpo é o templo do Espírito Santo.</p>
        </div>
        <div className="flex bg-[#161b22] p-1.5 rounded-2xl border border-white/5 shadow-2xl">
          {(['treinos', 'nutrição', 'métricas'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-brand text-white shadow-lg' : 'text-gray-600 hover:text-gray-300'}`}>
              {tab}
            </button>
          ))}
        </div>
      </header>

      {isSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-10 duration-500">
           <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-3">
             <CheckCircle2 size={24} /> Registro Salvo!
           </div>
        </div>
      )}

      <div id="health-container" className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-32">
        
        {activeTab === 'treinos' && (
          <div className="space-y-12 pb-12">
            <div className="bg-[#161b22] p-10 rounded-[48px] border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                <Zap size={180} className="text-brand" />
              </div>
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                    {editingActivityId ? 'Editar Performance' : 'Lançar Atividade'}
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tipo de Exercício</label>
                      <input type="text" placeholder="Ex: Musculação, Corrida..." value={activityType} onChange={e => setActivityType(e.target.value)} className="w-full bg-[#0b0e14] border border-white/5 rounded-[24px] px-8 py-5 text-white font-black placeholder:text-gray-800 outline-none focus:ring-2 focus:ring-brand/30" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Duração (min)</label>
                        <input type="number" placeholder="0" value={renderNumericValue(duration as number)} onChange={e => setDuration(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-[#0b0e14] border border-white/5 rounded-[24px] px-8 py-5 text-white font-black outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Kcal Estimado</label>
                        <input type="number" placeholder="0" value={renderNumericValue(caloriesBurned as number)} onChange={e => setCaloriesBurned(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-[#0b0e14] border border-white/5 rounded-[24px] px-8 py-5 text-white font-black outline-none" />
                      </div>
                    </div>
                    <button onClick={handleRegisterActivity} className="w-full bg-brand text-white py-6 rounded-[28px] font-black uppercase tracking-[0.3em] shadow-xl shadow-brand/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                      {editingActivityId ? <Save size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
                      {editingActivityId ? 'ATUALIZAR PERFORMANCE' : 'REGISTRAR PERFORMANCE'}
                    </button>
                    {editingActivityId && (
                      <button onClick={resetActivityForm} className="w-full text-gray-500 text-[10px] font-black uppercase tracking-widest">Cancelar Edição</button>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3 px-2">
                    <Clock size={16} className="text-brand" />
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Atividades Recentes</h3>
                  </div>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {activities.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-6 bg-[#0b0e14]/50 rounded-[32px] border border-white/5 hover:border-brand/30 transition-all group">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20 shadow-lg group-hover:bg-brand group-hover:text-white transition-all"><Activity size={24} /></div>
                          <div>
                            <p className="font-black text-white text-sm uppercase">{a.type}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{a.duration} MIN • {a.calories} KCAL</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => startEditActivity(a)} className="text-gray-700 hover:text-brand transition-colors p-2" title="Editar"><Edit2 size={18}/></button>
                          <button onClick={(e) => handleDeleteActivity(e, a.id)} className="text-gray-700 hover:text-rose-500 transition-colors p-2" title="Excluir"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && <p className="text-center py-20 text-gray-800 font-black text-[10px] uppercase">Nenhum registro de treino</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nutrição' && (
          <div className="space-y-12 pb-12 animate-in slide-in-from-right-10">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                
                <div className="bg-[#161b22] p-10 rounded-[48px] border border-white/5 shadow-2xl space-y-8">
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                     {editingMealId ? 'Editar Refeição' : 'Registro de Alimentação'}
                   </h3>
                   
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tipo de Refeição</label>
                        <select value={mealType} onChange={e => setMealType(e.target.value as any)} className="w-full bg-[#0b0e14] border border-white/5 rounded-[18px] px-6 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-brand/30 appearance-none">
                          <option value="Selecione">Selecione</option>
                          <option>Café da Manhã</option><option>Almoço</option><option>Jantar</option><option>Lanche</option><option>Outro</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Data</label>
                        <input type="date" value={mealDate} onChange={e => setMealDate(e.target.value)} className="w-full bg-[#0b0e14] border border-white/5 rounded-[18px] px-6 py-4 text-white font-bold outline-none" />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Descrição do Alimento</label>
                        <input type="text" placeholder="Ex: Arroz integral com frango" value={foodDesc} onChange={e => setFoodDesc(e.target.value)} className="w-full bg-[#0b0e14] border border-white/5 rounded-[18px] px-6 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-brand/30" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Calorias (kcal)</label>
                        <input type="number" placeholder="0" value={renderNumericValue(mealCalories as number)} onChange={e => setMealCalories(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-[#0b0e14] border border-white/5 rounded-[18px] px-6 py-4 text-white font-black" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Proteínas (g)</label>
                        <input type="number" placeholder="0" value={renderNumericValue(mealProtein as number)} onChange={e => setMealProtein(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-[#0b0e14] border border-white/5 rounded-[18px] px-6 py-4 text-white font-black" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Carboidratos (g)</label>
                        <input type="number" placeholder="0" value={renderNumericValue(mealCarbs as number)} onChange={e => setMealCarbs(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-[#0b0e14] border border-white/5 rounded-[18px] px-6 py-4 text-white font-black" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Gorduras (g)</label>
                        <input type="number" placeholder="0" value={renderNumericValue(mealFats as number)} onChange={e => setMealFats(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-[#0b0e14] border border-white/5 rounded-[18px] px-6 py-4 text-white font-black" />
                      </div>
                   </div>

                   <button onClick={handleRegisterMeal} className="w-full bg-brand text-white py-6 rounded-[22px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-brand/30">
                     {editingMealId ? <Save size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
                     {editingMealId ? 'ATUALIZAR REFEIÇÃO' : 'REGISTRAR REFEIÇÃO'}
                   </button>
                   {editingMealId && (
                     <button onClick={resetMealForm} className="w-full text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">Cancelar Edição</button>
                   )}
                </div>

                <div className="bg-[#161b22] p-10 rounded-[48px] border border-white/5 flex flex-col h-full min-h-[500px]">
                   <div className="flex-1 space-y-8">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <BookOpen size={24} className="text-brand" />
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Minhas Receitas</h3>
                         </div>
                         <button onClick={() => openRecipeModal()} className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center border border-brand/20 hover:bg-brand hover:text-white transition-all">
                           <Plus size={20} />
                         </button>
                      </div>
                      <p className="text-gray-500 text-xs font-medium">Toque na receita para ver detalhes. Use os botões para editar ou excluir.</p>
                      
                      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                         {recipes.map(r => (
                           <div key={r.id} onClick={() => setSelectedRecipe(r)} className="flex items-center justify-between p-6 bg-[#0b0e14]/50 rounded-[28px] border border-white/5 hover:border-brand/40 transition-all cursor-pointer group">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center border border-brand/20 group-hover:bg-brand group-hover:text-white transition-all">
                                  {r.youtubeUrl ? <Youtube size={20} /> : <BookOpen size={20} />}
                                </div>
                                <span className="text-[11px] font-black text-white uppercase tracking-widest truncate max-w-[150px]">{r.title}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <button onClick={(e) => { e.stopPropagation(); openRecipeModal(r); }} className="text-gray-600 hover:text-brand transition-colors p-2 rounded-lg hover:bg-brand/10" title="Editar"><Edit2 size={16} /></button>
                                <button onClick={(e) => handleDeleteRecipe(e, r.id)} className="text-gray-600 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-500/10" title="Excluir"><Trash2 size={16} /></button>
                                <ChevronRight size={18} className="text-brand group-hover:translate-x-1 transition-transform" />
                              </div>
                           </div>
                         ))}
                         {recipes.length === 0 && <p className="text-center py-20 text-gray-800 font-black text-[10px] uppercase">Nenhuma receita guardada</p>}
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <Flame size={16} className="text-orange-500" />
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Diário Nutricional</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {meals.map(m => (
                    <div key={m.id} className="p-6 bg-[#161b22] rounded-[32px] border border-white/5 hover:border-brand/30 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-brand/10 text-brand text-[8px] font-black px-3 py-1 rounded-lg uppercase">{m.type}</span>
                        <div className="flex gap-2">
                          <button onClick={() => startEditMeal(m)} className="text-gray-600 hover:text-brand p-1" title="Editar"><Edit2 size={16}/></button>
                          <button onClick={(e) => handleDeleteMeal(e, m.id)} className="text-gray-600 hover:text-rose-500 p-1" title="Excluir"><Trash2 size={16}/></button>
                        </div>
                      </div>
                      <p className="font-black text-white text-[12px] uppercase mb-4 line-clamp-1">{m.description}</p>
                      <div className="grid grid-cols-3 gap-2 text-[8px] font-black uppercase text-gray-500 mb-4 border-b border-white/5 pb-3">
                         <div className="flex flex-col"><span>Prot</span><span className="text-brand">{m.protein}g</span></div>
                         <div className="flex flex-col"><span>Carb</span><span className="text-emerald-500">{m.carbs}g</span></div>
                         <div className="flex flex-col"><span>Gord</span><span className="text-rose-500">{m.fats}g</span></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-gray-700">{new Date(m.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        <span className="text-[10px] font-black text-brand">{m.calories} KCAL</span>
                      </div>
                    </div>
                  ))}
                  {meals.length === 0 && <p className="col-span-full text-center py-10 opacity-20 font-black text-[10px] uppercase tracking-widest">Sem registros alimentares para exibir</p>}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'métricas' && (
          <div className="space-y-12 pb-12 animate-in zoom-in duration-500">
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#161b22] p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
                   <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                     <Utensils size={100} className="text-brand" />
                   </div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Ingestão Total</p>
                   <h4 className="text-3xl font-black text-white">{metricsData.totalConsumed} <span className="text-xs text-brand">KCAL</span></h4>
                </div>
                <div className="bg-[#161b22] p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
                   <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                     <Flame size={100} className="text-orange-500" />
                   </div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Queima Total</p>
                   <h4 className="text-3xl font-black text-white">{metricsData.totalBurned} <span className="text-xs text-orange-500">KCAL</span></h4>
                </div>
                <div className="bg-[#161b22] p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
                   <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                     <Scale size={100} className="text-emerald-500" />
                   </div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Balanço Energético</p>
                   <h4 className={`text-3xl font-black ${metricsData.totalConsumed - metricsData.totalBurned >= 0 ? 'text-brand' : 'text-emerald-500'}`}>
                     {metricsData.totalConsumed - metricsData.totalBurned} <span className="text-xs">KCAL</span>
                   </h4>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#161b22] p-10 rounded-[48px] border border-white/5 shadow-2xl">
                   <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3"><PieIcon size={20} className="text-brand" /> Distribuição de Macros</h3>
                   <div className="h-64">
                    {metricsData.macroChart.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={metricsData.macroChart} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none">
                            {metricsData.macroChart.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '24px', backgroundColor: '#0b0e14', border: '1px solid rgba(135,67,242,0.3)', color: '#fff', fontWeight: '900' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-10">
                        <PieIcon size={48} className="mb-4" />
                        <p className="text-[10px] font-black uppercase">Insira registros nutricionais</p>
                      </div>
                    )}
                   </div>
                </div>

                <div className="bg-[#161b22] p-10 rounded-[48px] border border-white/5 shadow-2xl">
                   <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3"><BarChart3 size={20} className="text-brand" /> Performance de Treino</h3>
                   <div className="h-64">
                    {metricsData.activityHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metricsData.activityHistory}>
                          <XAxis dataKey="name" stroke="#334155" fontSize={10} fontWeight={900} />
                          <YAxis stroke="#334155" fontSize={10} fontWeight={900} />
                          <Tooltip cursor={{ fill: 'rgba(135,67,242,0.05)' }} contentStyle={{ borderRadius: '16px', backgroundColor: '#0b0e14', border: '1px solid #334155' }} />
                          <Bar dataKey="kcal" fill="#8743f2" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-10">
                        <BarChart3 size={48} className="mb-4" />
                        <p className="text-[10px] font-black uppercase">Insira registros de treinos</p>
                      </div>
                    )}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {showRecipeModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="bg-[#161b22] w-full max-w-2xl rounded-[48px] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
              <div className="p-8 border-b border-white/5 bg-black/20 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand"><BookOpen size={24} /></div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                      {editingRecipeId ? 'Editar Receita' : 'Nova Receita'}
                    </h3>
                 </div>
                 <button onClick={() => setShowRecipeModal(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-rose-500 transition-all"><X size={20}/></button>
              </div>
              <div className="p-10 space-y-6 overflow-y-auto custom-scrollbar max-h-[70vh]">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Título</label>
                    <input type="text" placeholder="Nome da receita" value={recipeTitle} onChange={e => setRecipeTitle(e.target.value)} className="w-full bg-[#0b0e14] border border-white/5 rounded-[22px] px-6 py-4 text-white font-black" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Preparo</label>
                    <textarea placeholder="Ingredientes e modo de fazer..." value={recipeInstructions} onChange={e => setRecipeInstructions(e.target.value)} className="w-full h-40 bg-[#0b0e14] border border-white/5 rounded-[28px] px-8 py-5 text-white font-medium resize-none outline-none focus:ring-2 focus:ring-brand/30" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Youtube size={12} className="text-rose-500"/> Link YouTube</label>
                       <input type="text" placeholder="URL do vídeo" value={recipeYoutube} onChange={e => setRecipeYoutube(e.target.value)} className="w-full bg-[#0b0e14] border border-white/5 rounded-[20px] px-6 py-4 text-white font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2"><ImageIcon size={12} className="text-brand"/> Imagem (PNG/JPG)</label>
                       {recipeImage ? (
                         <div className="relative rounded-xl overflow-hidden aspect-video border border-brand/30">
                            <img src={recipeImage} className="w-full h-full object-cover" />
                            <button onClick={() => setRecipeImage(null)} className="absolute top-2 right-2 bg-black/60 p-1 rounded-full"><X size={14}/></button>
                         </div>
                       ) : (
                         <button onClick={() => fileInputRef.current?.click()} className="w-full h-20 border-2 border-dashed border-white/5 rounded-[20px] flex items-center justify-center text-gray-700 hover:border-brand/30 transition-all">
                            <Plus size={20} />
                         </button>
                       )}
                       <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg" className="hidden" />
                    </div>
                 </div>
                 <button onClick={handleRegisterRecipe} disabled={!recipeTitle || !recipeInstructions} className="w-full bg-brand text-white py-6 rounded-[28px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30">
                    <Sparkles size={20} /> {editingRecipeId ? 'ATUALIZAR RECEITA' : 'SALVAR RECEITA'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {selectedRecipe && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
           <div className="bg-[#161b22] w-full max-w-4xl rounded-[56px] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-white/5 bg-black/20 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedRecipe.title}</h3>
                 </div>
                 <button onClick={() => setSelectedRecipe(null)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-rose-500 transition-all shadow-xl"><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-10 md:p-16 space-y-12">
                 {selectedRecipe.youtubeUrl && getYoutubeEmbed(selectedRecipe.youtubeUrl) && (
                   <div className="aspect-video rounded-[40px] overflow-hidden border border-brand/20 shadow-2xl">
                      <iframe src={getYoutubeEmbed(selectedRecipe.youtubeUrl)!} className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                   </div>
                 )}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {selectedRecipe.imageUrl && (
                      <div className="rounded-[40px] overflow-hidden shadow-xl border border-white/5">
                        <img src={selectedRecipe.imageUrl} className="w-full h-auto object-cover" />
                      </div>
                    )}
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-2"><Utensils size={14}/> Modo de Preparo</h4>
                       <div className="text-gray-300 leading-relaxed font-medium whitespace-pre-wrap text-lg italic font-serif bg-black/20 p-8 rounded-[32px] border border-white/5 shadow-inner">
                         {selectedRecipe.instructions}
                       </div>
                    </div>
                 </div>
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

export default Health;
