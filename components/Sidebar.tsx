
import React from 'react';
import { Section } from '../types';
import { NAV_ITEMS, ADMIN_EMAILS } from '../constants';
import { UserCircle } from 'lucide-react';

interface SidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  onProfileClick: () => void;
  userEmail?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, onProfileClick, userEmail }) => {
  const visibleNavItems = NAV_ITEMS.filter(item =>
    item.id !== Section.ADMIN || (userEmail && ADMIN_EMAILS.includes(userEmail))
  );

  return (
    <aside className="w-20 md:w-64 bg-[#0b0e14] border-r border-white/5 flex flex-col transition-all duration-300 z-50">
      {/* Logo Unidade (Conceito 4) */}
      <div className="p-8 flex items-center gap-4">
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-2 bg-brand/30 rounded-full blur-xl group-hover:bg-brand/50 transition-all opacity-50"></div>
          <svg width="40" height="40" viewBox="0 0 100 100" className="relative drop-shadow-[0_0_8px_rgba(135,67,242,0.8)]">
            {/* Segmentos da Cruz Integrada */}
            <path d="M50 15v30M50 55v30M15 50h30M55 50h30"
              stroke="url(#purpleGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none" />
            <defs>
              <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b276ff" />
                <stop offset="100%" stopColor="#8743f2" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="4" fill="#fff" className="animate-pulse" />
          </svg>
        </div>
        <span className="hidden md:block text-2xl font-black text-white tracking-tighter neon-text">CRENTIFY</span>
      </div>

      <nav className="flex-1 mt-4 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {visibleNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-[22px] transition-all duration-300 relative group ${activeSection === item.id
                ? 'bg-gradient-to-r from-brand to-brand-light text-white neon-glow shadow-brand/40'
                : 'text-gray-500 hover:bg-white/5 hover:text-white'
              }`}
          >
            <div className={`transition-transform duration-300 group-hover:scale-110 ${activeSection === item.id ? 'text-white' : 'text-gray-500 group-hover:text-brand'}`}>
              {item.icon}
            </div>
            <span className={`hidden md:block font-bold text-xs uppercase tracking-widest ${activeSection === item.id ? 'text-white' : ''}`}>
              {item.label}
            </span>
            {activeSection === item.id && (
              <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={onProfileClick}
          className="w-full flex items-center gap-3 p-4 rounded-[24px] bg-[#161b22] border border-white/5 hover:border-brand/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand border border-brand/20 group-hover:bg-brand group-hover:text-white transition-all">
            <UserCircle size={24} />
          </div>
          <div className="hidden md:block text-left overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest text-white truncate">Meu Perfil</p>
            <p className="text-[9px] text-gray-500 font-bold truncate">Configurações</p>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
