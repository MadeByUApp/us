
import React, { useState } from 'react';
import { AppState, ToolType } from '../types';

interface PropertiesPanelProps {
  appState: AppState;
  updateSeparationSettings: (newSettings: Partial<AppState['separationSettings']>) => void;
  updateEffectSettings: (newSettings: Partial<AppState['effectSettings']>) => void;
  updateEnhanceSettings: (newSettings: Partial<AppState['enhanceSettings']>) => void;
  onApplyAIStyle: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  appState, 
  updateSeparationSettings, 
  updateEffectSettings, 
  updateEnhanceSettings,
  onApplyAIStyle, 
}) => {
  const [activeAccordion, setActiveAccordion] = useState<string | null>('tool');
  const { effectSettings, separationSettings, enhanceSettings } = appState;

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const renderSeparationControls = () => (
    <div className="flex flex-col gap-4">
       <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-xs text-slate-400 font-medium">Matiz (Hue)</label>
          <span className="text-xs text-primary font-mono">{separationSettings.hue}°</span>
        </div>
        <input 
          type="range" min="0" max="360" 
          value={separationSettings.hue}
          onChange={(e) => updateSeparationSettings({ hue: Number(e.target.value) })}
          className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-xs text-slate-400 font-medium">Saturación</label>
          <span className="text-xs text-primary font-mono">{separationSettings.saturation}%</span>
        </div>
        <input 
          type="range" min="0" max="200" 
          value={separationSettings.saturation}
          onChange={(e) => updateSeparationSettings({ saturation: Number(e.target.value) })}
          className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-xs text-slate-400 font-medium">Contraste</label>
          <span className="text-xs text-primary font-mono">{separationSettings.contrast}%</span>
        </div>
        <input 
          type="range" min="0" max="200" 
          value={separationSettings.contrast}
          onChange={(e) => updateSeparationSettings({ contrast: Number(e.target.value) })}
          className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-xs text-slate-400 font-medium">Brillo</label>
          <span className="text-xs text-primary font-mono">{separationSettings.brightness}%</span>
        </div>
        <input 
          type="range" min="0" max="200" 
          value={separationSettings.brightness}
          onChange={(e) => updateSeparationSettings({ brightness: Number(e.target.value) })}
          className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Common: Background Removal */}
      <div className="pt-2 border-t border-border/50">
        <label className="flex items-center gap-3 p-2 bg-background border border-border rounded cursor-pointer hover:bg-white/5 transition-colors">
            <input 
                type="checkbox" 
                checked={enhanceSettings.removeBg}
                onChange={(e) => updateEnhanceSettings({ removeBg: e.target.checked })}
                className="w-4 h-4 rounded border-slate-500 text-green-500 focus:ring-green-500 bg-transparent"
            />
            <div className="flex flex-col">
                <span className="text-xs text-slate-300 font-medium">Fondo Transparente</span>
                <span className="text-[10px] text-slate-500">Elimina fondo autom. en cualquier diseño</span>
            </div>
        </label>
      </div>
    </div>
  );

  const renderEnhanceControls = () => (
    <div className="flex flex-col gap-5">
      <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg mb-2">
          <div className="flex items-center gap-2 mb-1">
             <span className="material-symbols-outlined text-purple-400 text-sm">auto_awesome</span>
             <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">Smart Upscale AI</p>
          </div>
          <p className="text-[10px] text-slate-400">Mejora automática de resolución y nitidez (Smart Sharpening) para impresión.</p>
      </div>

      <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-400 font-medium">Factor de Escala (Upscaling)</label>
          <div className="flex gap-2">
             {[1, 2, 4].map((scale) => (
               <button
                 key={scale}
                 onClick={() => updateEnhanceSettings({ upscale: scale as 1|2|4 })}
                 className={`flex-1 py-3 text-xs font-bold rounded border transition-all flex flex-col items-center gap-1 ${
                   enhanceSettings.upscale === scale
                   ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                   : 'bg-background border-border text-slate-400 hover:bg-white/5'
                 }`}
               >
                 <span className="text-lg leading-none">{scale}x</span>
                 <span className="text-[10px] font-normal opacity-70">
                    {scale === 1 ? 'Original' : 'Auto-Mejora'}
                 </span>
               </button>
             ))}
          </div>
      </div>
    </div>
  );

  const renderEffectControls = (toolName: string) => (
    <div className="flex flex-col gap-5">
      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg mb-2">
          <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">PROCESAMIENTO LOCAL</p>
          <p className="text-[10px] text-slate-400">Motor ilimitado en tiempo real. Ajusta los sliders para ver cambios instantáneos.</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-xs text-slate-400 font-medium">
             {toolName === 'halftone' ? 'Tamaño de Punto' : 
              toolName === 'engraving' ? 'Espaciado entre Líneas' :
              'Escala / Tamaño'}
          </label>
          <span className="text-xs text-white font-mono">{effectSettings.scale}px</span>
        </div>
        <input 
          type="range" min="3" max="50" step="1"
          value={effectSettings.scale}
          onChange={(e) => updateEffectSettings({ scale: Number(e.target.value) })}
          className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-xs text-slate-400 font-medium">
             {toolName === 'stippling' ? 'Densidad' : 
              toolName === 'engraving' ? 'Grosor de Línea' :
              'Intensidad'}
          </label>
          <span className="text-xs text-white font-mono">{effectSettings.intensity}%</span>
        </div>
        <input 
          type="range" min="1" max="100" 
          value={effectSettings.intensity}
          onChange={(e) => updateEffectSettings({ intensity: Number(e.target.value) })}
          className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {toolName === 'halftone' && (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
            <label className="text-xs text-slate-400 font-medium">Ángulo de Trama</label>
            <span className="text-xs text-white font-mono">{effectSettings.angle}°</span>
            </div>
            <input 
            type="range" min="0" max="90" 
            value={effectSettings.angle}
            onChange={(e) => updateEffectSettings({ angle: Number(e.target.value) })}
            className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
        </div>
      )}
    </div>
  );

  return (
    <aside className="w-80 bg-panel border-l border-border flex flex-col shrink-0 overflow-y-auto z-10">
      <div className="p-4 border-b border-border">
        <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-1">Propiedades</h2>
        <p className="text-xs text-slate-500">
          Configuración de {appState.activeTool === 'move' ? 'Herramienta' : appState.activeTool.charAt(0).toUpperCase() + appState.activeTool.slice(1)}
        </p>
      </div>
      
      <div className="border-b border-border">
        <button onClick={() => toggleAccordion('tool')} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">tune</span>
            <span className="text-sm font-medium text-slate-200">
                Ajustes de {appState.activeTool === 'separation' ? 'Color' : 'Efecto'}
            </span>
          </div>
          <span className={`material-symbols-outlined text-slate-500 transition-transform ${activeAccordion === 'tool' ? 'rotate-180' : ''}`}>expand_more</span>
        </button>
        
        {activeAccordion === 'tool' && (
          <div className="px-4 pb-6 pt-2 space-y-6">
            
            {appState.activeTool === 'separation' && renderSeparationControls()}
            
            {appState.activeTool === 'separation' && <div className="h-px bg-border w-full"></div>}

            {appState.activeTool === 'enhance' && renderEnhanceControls()}

            {appState.activeTool === 'halftone' && renderEffectControls('halftone')}
            {appState.activeTool === 'stippling' && renderEffectControls('stippling')}
            {appState.activeTool === 'dithering' && renderEffectControls('dithering')}
            {appState.activeTool === 'grain' && renderEffectControls('grain')}
            {appState.activeTool === 'engraving' && renderEffectControls('engraving')}
            
          </div>
        )}
      </div>
    </aside>
  );
};
