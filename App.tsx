
import React, { useState, useEffect, useCallback } from 'react';
import { Section, BibleData, BibleProgress, DiaryEntry, FinancialTransaction, WorkflowTask, SpiritualHabit, PhysicalActivity, MealRecord, FinancialPlan, AcademyContent, AcademyCategory, AcademyReflection, BibleNote, Recipe } from './types';
import Dashboard from './components/Dashboard';
import BibleView from './components/BibleView';
import MentorAI from './components/MentorAI';
import Diary from './components/Diary';
import Workflow from './components/Workflow';
import Finance from './components/Finance';
import Health from './components/Health';
import AdminPanel from './components/AdminPanel';
import Habits from './components/Habits';
import Academy from './components/Academy';
import ProfileModal from './components/ProfileModal';
import Auth from './components/Auth';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { safeLocalStorageGet } from './utils';

import { ADMIN_EMAILS } from './constants';
import { useDataSync } from './hooks/useDataSync';
import { loadUserData } from './services/userDataService';

// Nome único para evitar conflitos de cache
const DB_NAME = 'Crentify_Final_Storage';
const STORE_NAME = 'BibleStore';
const DB_VERSION = 2;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const App: React.FC = () => {
  const { session, loading } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>(Section.DASHBOARD);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Security Check
  useEffect(() => {
    if (activeSection === Section.ADMIN) {
      const userEmail = session?.user?.email;
      if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
        setActiveSection(Section.DASHBOARD);
      }
    }
  }, [activeSection, session]);



  // Estados de Dados da Bíblia
  const [bibleData, setBibleData] = useState<BibleData | null>(null);
  const [isBibleLoading, setIsBibleLoading] = useState(true);

  // Outros Estados (LocalStorage)
  const [bibleProgress, setBibleProgress] = useState<BibleProgress>(() => safeLocalStorageGet('crentify_bible_progress', { completedChapters: {} }));
  const [bibleNotes, setBibleNotes] = useState<BibleNote[]>(() => safeLocalStorageGet('crentify_bible_notes', []));
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => safeLocalStorageGet('crentify_diary', []));
  const [habits, setHabits] = useState<SpiritualHabit[]>(() => safeLocalStorageGet('crentify_habits', []));
  const [activities, setActivities] = useState<PhysicalActivity[]>(() => safeLocalStorageGet('crentify_activities', []));
  const [meals, setMeals] = useState<MealRecord[]>(() => safeLocalStorageGet('crentify_meals', []));
  const [recipes, setRecipes] = useState<Recipe[]>(() => safeLocalStorageGet('crentify_recipes', []));
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => safeLocalStorageGet('crentify_finance', []));
  const [financialPlans, setFinancialPlans] = useState<FinancialPlan[]>(() => safeLocalStorageGet('crentify_finance_plans', []));
  const [workflowTasks, setWorkflowTasks] = useState<WorkflowTask[]>(() => safeLocalStorageGet('crentify_workflow', []));
  const [academyContent, setAcademyContent] = useState<AcademyContent[]>(() => safeLocalStorageGet('crentify_academy_content', []));
  const [academyCategories, setAcademyCategories] = useState<AcademyCategory[]>(() => safeLocalStorageGet('crentify_academy_categories', [
    { id: "1", name: "Teologia" },
    { id: "2", name: "Bíblia" },
    { id: "3", name: "Geral" },
    { id: "4", name: "Vida Cristã" },
    { id: "5", name: "Sermões" },
    { id: "6", name: "Construção" }
  ]));
  const [academyReflections, setAcademyReflections] = useState<AcademyReflection[]>(() => safeLocalStorageGet('crentify_academy_reflections', []));

  // Cloud Data Synchronization
  useEffect(() => {
    if (session?.user) {
      loadUserData().then(data => {
        if (data.crentify_bible_progress) setBibleProgress(data.crentify_bible_progress);
        if (data.crentify_bible_notes) setBibleNotes(data.crentify_bible_notes);
        if (data.crentify_diary) setDiaryEntries(data.crentify_diary);
        if (data.crentify_habits) setHabits(data.crentify_habits);
        if (data.crentify_activities) setActivities(data.crentify_activities);
        if (data.crentify_meals) setMeals(data.crentify_meals);
        if (data.crentify_recipes) setRecipes(data.crentify_recipes);
        if (data.crentify_finance) setTransactions(data.crentify_finance);
        if (data.crentify_finance_plans) setFinancialPlans(data.crentify_finance_plans);
        if (data.crentify_workflow) setWorkflowTasks(data.crentify_workflow);
        if (data.crentify_academy_content) setAcademyContent(data.crentify_academy_content);
        if (data.crentify_academy_categories) setAcademyCategories(data.crentify_academy_categories);
        if (data.crentify_academy_reflections) setAcademyReflections(data.crentify_academy_reflections);
      });
    }
  }, [session]);

  // Sync Hooks
  useDataSync('crentify_bible_progress', bibleProgress);
  useDataSync('crentify_bible_notes', bibleNotes);
  useDataSync('crentify_diary', diaryEntries);
  useDataSync('crentify_habits', habits);
  useDataSync('crentify_activities', activities);
  useDataSync('crentify_meals', meals);
  useDataSync('crentify_recipes', recipes);
  useDataSync('crentify_finance', transactions);
  useDataSync('crentify_finance_plans', financialPlans);
  useDataSync('crentify_workflow', workflowTasks);
  useDataSync('crentify_academy_content', academyContent);
  useDataSync('crentify_academy_categories', academyCategories);
  useDataSync('crentify_academy_reflections', academyReflections);

  // Carregar Bíblia do IndexedDB ao iniciar
  useEffect(() => {
    const loadBible = async () => {
      try {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get('bible_main_data');

        request.onsuccess = () => {
          if (request.result) {
            setBibleData(request.result);
          }
          setIsBibleLoading(false);
        };
        request.onerror = () => setIsBibleLoading(false);
      } catch (e) {
        console.error("Erro ao carregar banco de dados:", e);
        setIsBibleLoading(false);
      }
    };
    loadBible();
  }, []);

  // Função para salvar a Bíblia no IndexedDB
  const updateBibleData = useCallback(async (data: BibleData) => {
    setBibleData(data); // Atualiza estado imediato
    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(data, 'bible_main_data');

      return new Promise<void>((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error("Erro ao salvar no IndexedDB:", e);
      throw e;
    }
  }, []);

  // Persistência automática dos outros dados
  useEffect(() => {
    localStorage.setItem('crentify_bible_progress', JSON.stringify(bibleProgress));
    localStorage.setItem('crentify_bible_notes', JSON.stringify(bibleNotes));
    localStorage.setItem('crentify_diary', JSON.stringify(diaryEntries));
    localStorage.setItem('crentify_habits', JSON.stringify(habits));
    localStorage.setItem('crentify_activities', JSON.stringify(activities));
    localStorage.setItem('crentify_meals', JSON.stringify(meals));
    localStorage.setItem('crentify_recipes', JSON.stringify(recipes));
    localStorage.setItem('crentify_finance', JSON.stringify(transactions));
    localStorage.setItem('crentify_finance_plans', JSON.stringify(financialPlans));
    localStorage.setItem('crentify_workflow', JSON.stringify(workflowTasks));
    localStorage.setItem('crentify_academy_content', JSON.stringify(academyContent));
    localStorage.setItem('crentify_academy_categories', JSON.stringify(academyCategories));
    localStorage.setItem('crentify_academy_reflections', JSON.stringify(academyReflections));
  }, [bibleProgress, bibleNotes, diaryEntries, habits, activities, meals, recipes, transactions, financialPlans, workflowTasks, academyContent, academyCategories, academyReflections]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const userEmail = session.user.email;
  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);

  return (
    <Layout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      onProfileClick={() => setShowProfileModal(true)}
      userEmail={userEmail}
    >
      {activeSection === Section.DASHBOARD && <Dashboard bibleProgress={bibleProgress} diaryEntries={diaryEntries} tasks={workflowTasks} habits={habits} />}
      {activeSection === Section.BIBLE && <BibleView bibleData={bibleData} isLoading={isBibleLoading} progress={bibleProgress} setProgress={setBibleProgress} notes={bibleNotes} setNotes={setBibleNotes} />}
      {activeSection === Section.ACADEMY && <Academy content={academyContent} categories={academyCategories} reflections={academyReflections} setReflections={setAcademyReflections} />}
      {activeSection === Section.HABITS && <Habits habits={habits} setHabits={setHabits} />}
      {activeSection === Section.MENTOR && <MentorAI />}
      {activeSection === Section.DIARY && <Diary entries={diaryEntries} setEntries={setDiaryEntries} />}
      {activeSection === Section.WORKFLOW && <Workflow tasks={workflowTasks} setTasks={setWorkflowTasks} />}
      {activeSection === Section.FINANCE && <Finance transactions={transactions} setTransactions={setTransactions} plans={financialPlans} setPlans={setFinancialPlans} />}
      {activeSection === Section.HEALTH && <Health activities={activities} setActivities={setActivities} meals={meals} setMeals={setMeals} recipes={recipes} setRecipes={setRecipes} />}
      {activeSection === Section.ADMIN && isAdmin && <AdminPanel bibleData={bibleData} setBibleData={updateBibleData} academyContent={academyContent} setAcademyContent={setAcademyContent} academyCategories={academyCategories} setAcademyCategories={setAcademyCategories} />}

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} bibleNotes={bibleNotes} />}
    </Layout>
  );
};

export default App;