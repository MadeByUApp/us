
import React, { useRef } from 'react';
import { User } from '../types';

interface HeaderProps {
  onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  user: User | null;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onUpload, user, onOpenAdmin, onLogout }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileMenuClick = (item: string) => {
    if (item === 'Subir Archivo' && fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  return (
    <header className="h-14 bg-panel border-b border-border flex items-center justify-between px-4 shrink-0 z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-1.5 rounded-lg text-primary">
            <span className="material-symbols-outlined text-xl">texture</span>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white">MadeByU</span>
        </div>
        <nav className="hidden md:flex items-center ml-8 gap-1">
          {['Subir Archivo'].map((item) => (
            <button 
                key={item} 
                onClick={() => handleFileMenuClick(item)}
                className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              {item}
            </button>
          ))}
          
          {/* Admin Button - Only visible for admin role */}
          {user?.role === 'admin' && (
            <button 
                onClick={onOpenAdmin}
                className="px-3 py-1.5 text-sm font-bold text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded transition-colors flex items-center gap-2 border border-purple-500/20 ml-2"
            >
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              Gestión Usuarios
            </button>
          )}

          {/* Hidden File Input for "Subir Archivo" menu */}
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*" 
            onChange={onUpload} 
          />
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-white leading-none">{user?.username}</span>
            <span className="text-[10px] text-slate-500 leading-none mt-1 uppercase">{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-cover bg-center border border-border cursor-default bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user?.username.charAt(0).toUpperCase()}
        </div>

        <div className="h-5 w-px bg-border mx-1"></div>

        <button 
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex items-center justify-center"
            title="Cerrar Sesión"
        >
            <span className="material-symbols-outlined text-xl">logout</span>
        </button>
      </div>
    </header>
  );
};
