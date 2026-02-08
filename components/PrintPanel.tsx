
import React, { useEffect } from 'react';
import { AppState, PrintLocation, ShirtSize } from '../types';

interface PrintPanelProps {
  appState: AppState;
  updatePrintSettings: (settings: Partial<AppState['printSettings']>) => void;
}

export const PrintPanel: React.FC<PrintPanelProps> = ({ appState, updatePrintSettings }) => {
  const { shirtSize, location, widthCm, heightCm, dpi } = appState.printSettings;

  // Smart suggestions based on industry standards for DTF
  const getRecommendedWidth = (size: ShirtSize, loc: PrintLocation): number => {
    if (loc === 'front_pocket' || loc === 'back_neck') return 10;
    
    switch (size) {
      case 'S': return 24;
      case 'M': return 28;
      case 'L': return 30;
      case 'XL': return 32;
      case 'XXL': return 34;
      case 'XXXL': return 36;
      default: return 28;
    }
  };

  useEffect(() => {
    const recommended = getRecommendedWidth(shirtSize, location);
    updatePrintSettings({ widthCm: recommended });
  }, [shirtSize, location]); // eslint-disable-line

  const widthPx = Math.round((widthCm / 2.54) * dpi);
  // height is dynamic based on aspect ratio, handled below

  const getImageAspectRatio = () => {
    return 1.2; // Default if no image
  };
  
  const calcHeightCm = (w: number) => {
     return Number((w * getImageAspectRatio()).toFixed(1)); 
  };

  const isQualityLow = widthPx > 4000; // Warning threshold

  const handleDownload = () => {
    const src = appState.processedImage || appState.originalImage;
    if (!src) {
        alert("No hay imagen para exportar.");
        return;
    }

    const img = new Image();
    img.src = src;
    img.onload = () => {
        const aspect = img.height / img.width;
        const heightPx = Math.round(widthPx * aspect);

        const canvas = document.createElement('canvas');
        canvas.width = widthPx;
        canvas.height = heightPx;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            // High quality scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, widthPx, heightPx);
            
            const link = document.createElement('a');
            link.download = `DTF_Print_${shirtSize}_${location}_${widthCm}cm_300DPI.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
  };

  return (
    <aside className="w-72 bg-panel border-r border-border flex flex-col shrink-0 overflow-y-auto z-10 animate-fade-in">
      <div className="p-4 border-b border-border bg-purple-500/5">
        <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-purple-400">print</span>
            <h2 className="text-white text-sm font-bold uppercase tracking-wider">Impresión DTF</h2>
        </div>
        <p className="text-xs text-slate-500">
          Preparación de archivos para impresión directa (300 DPI).
        </p>
      </div>

      <div className="p-4 flex flex-col gap-6">
        
        {/* Shirt Size */}
        <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-300 font-bold uppercase">Tamaño de Camiseta</label>
            <div className="grid grid-cols-3 gap-2">
                {(['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as ShirtSize[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => updatePrintSettings({ shirtSize: s })}
                        className={`py-2 text-xs font-bold rounded border transition-colors ${
                            shirtSize === s 
                            ? 'bg-purple-500 text-white border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                            : 'bg-background border-border text-slate-400 hover:bg-white/5'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-300 font-bold uppercase">Ubicación</label>
            <select 
                value={location}
                onChange={(e) => updatePrintSettings({ location: e.target.value as PrintLocation })}
                className="w-full bg-background border border-border rounded-lg text-xs text-white p-2.5 focus:border-purple-500 outline-none"
            >
                <option value="front_center">Frente (Pecho Centro)</option>
                <option value="back_center">Espalda (Centro)</option>
                <option value="front_pocket">Bolsillo / Pecho Izq.</option>
                <option value="back_neck">Espalda (Cuello)</option>
            </select>
        </div>

        <div className="h-px bg-border w-full"></div>

        {/* Dimensions */}
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <label className="text-xs text-slate-300 font-bold uppercase">Dimensiones de Salida</label>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">300 DPI</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-500">Ancho (cm)</label>
                    <input 
                        type="number" 
                        value={widthCm}
                        onChange={(e) => updatePrintSettings({ widthCm: Number(e.target.value) })}
                        className="w-full bg-surface border border-border rounded p-2 text-sm text-white focus:border-purple-500 outline-none"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-500">Alto (aprox cm)</label>
                    <input 
                        type="number" 
                        readOnly
                        value={calcHeightCm(widthCm)}
                        className="w-full bg-surface/50 border border-border rounded p-2 text-sm text-slate-400 outline-none cursor-not-allowed"
                    />
                </div>
            </div>

            {/* Resolution Info */}
            <div className="bg-surface border border-border rounded-lg p-3 flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Resolución de Exportación:</span>
                    <span className="text-purple-300 font-mono">{widthPx} px (Ancho)</span>
                </div>
                
                {isQualityLow && (
                    <div className="flex items-start gap-2 mt-1 text-yellow-500 text-[10px] leading-tight bg-yellow-500/5 p-2 rounded">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        <span>La imagen original podría pixelarse a este tamaño. Usa el Upscaling (Mejora) antes de exportar.</span>
                    </div>
                )}
            </div>
        </div>

        <div className="mt-auto pt-4">
             <button 
                onClick={handleDownload}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-purple-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
             >
                <span className="material-symbols-outlined text-sm">download</span>
                Exportar para DTF
             </button>
             <p className="text-[10px] text-slate-600 text-center mt-2">
                Descarga PNG 300 DPI con fondo transparente
             </p>
        </div>

      </div>
    </aside>
  );
};
