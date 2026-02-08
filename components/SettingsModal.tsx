
import React from 'react';
import { AppTheme } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const themes: { id: AppTheme; label: string; color: string; ring: string }[] = [
  { id: 'cyan', label: 'Default (Cyan)', color: 'bg-[#13c8ec]', ring: 'ring-[#13c8ec]' },
  { id: 'red', label: 'Rojo Pasión', color: 'bg-red-500', ring: 'ring-red-500' },
  { id: 'yellow', label: 'Amarillo Solar', color: 'bg-yellow-500', ring: 'ring-yellow-500' },
  { id: 'green', label: 'Verde Neón', color: 'bg-green-500', ring: 'ring-green-500' },
  { id: 'purple', label: 'Morado Cyber', color: 'bg-purple-500', ring: 'ring-purple-500' },
  { id: 'mono', label: 'Monocromo', color: 'bg-white', ring: 'ring-white' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentTheme, setTheme }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-panel border border-border w-96 rounded-xl shadow-2xl p-6 relative overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
             <span className="material-symbols-outlined text-primary">settings</span>
             Configuración
           </h2>
           <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
             <span className="material-symbols-outlined">close</span>
           </button>
        </div>

        <div className="space-y-6">
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                    Tema de la Aplicación
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                                currentTheme === t.id 
                                ? `border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]` 
                                : 'border-border bg-surface hover:bg-white/5'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-full ${t.color} shadow-lg ${currentTheme === t.id ? 'ring-2 ring-offset-2 ring-offset-panel ' + t.ring : ''}`}></div>
                            <span className={`text-[10px] font-medium ${currentTheme === t.id ? 'text-white' : 'text-slate-400'}`}>
                                {t.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-3 bg-surface border border-border rounded-lg text-xs text-slate-400">
                <p>La versión actual es <strong>MadeByU v1.0.0</strong>.</p>
                <p className="mt-1">Motor de procesamiento local activado.</p>
            </div>
        </div>

      </div>
    </div>
  );
};
