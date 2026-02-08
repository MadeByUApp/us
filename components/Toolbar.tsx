
import React from 'react';
import { ToolType } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  setTool: (t: ToolType) => void;
  onOpenSettings: () => void;
}

const tools: { id: ToolType; icon: string; label: string }[] = [
  { id: 'move', icon: 'pan_tool', label: 'Mover' },
  { id: 'enhance', icon: 'auto_fix_high', label: 'Mejorar / Vectorizar' },
  { id: 'pen', icon: 'edit', label: 'Pluma' },
  { id: 'separation', icon: 'layers', label: 'Separación de Color' },
  { id: 'halftone', icon: 'grid_4x4', label: 'Semitono' },
  { id: 'stippling', icon: 'grain', label: 'Puntillismo' },
  { id: 'dithering', icon: 'blur_on', label: 'Dithering' },
  { id: 'grain', icon: 'noise_control_on', label: 'Ruido / Grano' },
  { id: 'engraving', icon: 'draw', label: 'Grabado' },
];

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setTool, onOpenSettings }) => {
  return (
    <aside className="w-16 bg-panel border-r border-border flex flex-col items-center py-4 gap-4 shrink-0 z-10 overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col gap-2 w-full px-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setTool(tool.id)}
            title={tool.label}
            className={`group w-full aspect-square flex items-center justify-center rounded-lg transition-all shrink-0 ${
              activeTool === tool.id
                ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(19,200,236,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{tool.icon}</span>
          </button>
        ))}
        
        <div className="h-px w-8 bg-border mx-auto my-1 shrink-0"></div>

        {/* DTF Print Tool */}
        <button
            onClick={() => setTool('print')}
            title="Preparar Impresión DTF"
            className={`group w-full aspect-square flex items-center justify-center rounded-lg transition-all shrink-0 ${
              activeTool === 'print'
                ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
             <span className="material-symbols-outlined text-xl">print</span>
        </button>

        <div className="h-px w-8 bg-border mx-auto my-1 shrink-0"></div>

        <button 
          onClick={onOpenSettings}
          className="group w-full aspect-square flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all shrink-0"
        >
          <span className="material-symbols-outlined" title="Configuración">settings</span>
        </button>
      </div>
    </aside>
  );
};
