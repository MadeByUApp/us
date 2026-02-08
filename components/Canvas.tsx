
import React, { useRef, useState, useEffect } from 'react';
import { AppState } from '../types';

interface CanvasProps {
  appState: AppState;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setZoom: (zoom: number) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ appState, onUpload, setZoom }) => {
  const [splitPos, setSplitPos] = useState(50);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const [isGrabbing, setIsGrabbing] = useState(false); 
  
  const containerRef = useRef<HTMLDivElement>(null); 
  const scrollContainerRef = useRef<HTMLDivElement>(null); 
  
  const isDraggingSlider = useRef(false);
  const isPanning = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleSliderMouseDown = (e: React.MouseEvent) => { 
    e.stopPropagation(); 
    isDraggingSlider.current = true; 
  };

  const handlePanMouseDown = (e: React.MouseEvent) => {
    if (appState.activeTool === 'move') {
        isPanning.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        setIsGrabbing(true);
    }
  };

  const handleMouseUp = () => { 
    isDraggingSlider.current = false; 
    isPanning.current = false;
    setIsGrabbing(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    // 1. Slider Logic
    if (isDraggingSlider.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const p = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSplitPos(p);
    }

    // 2. Panning Logic
    if (isPanning.current && scrollContainerRef.current) {
        e.preventDefault();
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;

        scrollContainerRef.current.scrollLeft -= dx;
        scrollContainerRef.current.scrollTop -= dy;

        lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const separationFilter = `hue-rotate(${appState.separationSettings.hue}deg) saturate(${appState.separationSettings.saturation}%) contrast(${appState.separationSettings.contrast}%) brightness(${appState.separationSettings.brightness}%)`;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalHeight > 0) {
        setImageAspectRatio(naturalWidth / naturalHeight);
    }
  };

  const renderingStyle = appState.zoom > 100 ? { imageRendering: 'pixelated' as const } : {};

  const getCursor = () => {
      if (appState.activeTool === 'move') return isGrabbing ? 'grabbing' : 'grab';
      return 'default';
  };

  if (!appState.originalImage) {
    return (
      <main className="flex-1 relative bg-[#0f1115] flex items-center justify-center overflow-hidden group/canvas">
          <div className="text-center p-10 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors">
             <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">cloud_upload</span>
             <h3 className="text-xl font-bold text-white mb-2">Cargar Arte</h3>
             <p className="text-slate-400 text-sm mb-6">Arrastra o haz clic para buscar</p>
             <label className="cursor-pointer bg-primary hover:bg-primary-dark text-background font-bold py-2 px-6 rounded-lg transition-all">
                Seleccionar Archivo
                <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
             </label>
          </div>
      </main>
    );
  }

  return (
    <main className="flex-1 relative bg-[#0f1115] overflow-hidden flex flex-col group/canvas">
      <div 
        ref={scrollContainerRef}
        onMouseDown={handlePanMouseDown}
        className="flex-1 overflow-auto flex p-8 bg-[#111827]"
        style={{ cursor: getCursor() }}
      >
          <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ 
              backgroundImage: "linear-gradient(45deg, #1f2937 25%, transparent 25%), linear-gradient(-45deg, #1f2937 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f2937 75%), linear-gradient(-45deg, transparent 75%, #1f2937 75%)", 
              backgroundSize: "20px 20px", 
              backgroundColor: "#111827",
              zIndex: 0
          }}></div>

          <div 
              ref={containerRef}
              className="relative shadow-2xl rounded-sm ring-1 ring-border touch-none bg-transparent flex-shrink-0 z-10 m-auto transition-[width] duration-75 ease-linear"
              style={{ 
                  width: `${80 * (appState.zoom / 100)}%`,
                  aspectRatio: `${imageAspectRatio}`,
              }} 
          >

              {/* Layer 1: Original Image */}
              <div 
                  className="absolute inset-0 w-full h-full"
                  style={{ clipPath: `inset(0 0 0 ${splitPos}%)` }} 
              >
                  <img 
                      src={appState.originalImage} 
                      alt="Original"
                      onLoad={handleImageLoad}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                      style={renderingStyle}
                  />
              </div>

              {/* Layer 2: Processed */}
              <div 
                  className="absolute inset-0 w-full h-full"
                  style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }} 
              >
                  <img 
                      src={appState.processedImage || appState.originalImage} 
                      alt="Processed"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                      style={{ 
                          filter: appState.activeTool === 'separation' ? separationFilter : 'none',
                          ...renderingStyle
                      }}
                  />
                  <div 
                      className="absolute inset-y-0 right-0 w-0.5 bg-primary shadow-[0_0_10px_#13c8ec]"
                      style={{ right: 0 }} 
                  ></div>
              </div>

              {/* Slider Handle */}
              <div 
                  className="absolute inset-y-0 w-8 -ml-4 flex items-center justify-center cursor-ew-resize group/slider z-30 hover:scale-110 transition-transform"
                  style={{ left: `${splitPos}%` }}
                  onMouseDown={handleSliderMouseDown}
              >
                  <div className="w-8 h-8 rounded-full bg-primary shadow-[0_0_15px_rgba(19,200,236,0.5)] flex items-center justify-center text-[#111718]">
                      <span className="material-symbols-outlined text-lg font-bold">code</span>
                  </div>
              </div>
          </div>
      </div>

       <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-panel/90 backdrop-blur border border-border p-1 rounded-lg shadow-lg z-20">
            <button onClick={() => setZoom(appState.zoom - 10)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-slate-300">
                <span className="material-symbols-outlined text-sm">remove</span>
            </button>
            <span className="px-2 text-xs font-mono text-slate-300 min-w-[4ch] text-center select-none">{appState.zoom}%</span>
            <button onClick={() => setZoom(appState.zoom + 10)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-slate-300">
                <span className="material-symbols-outlined text-sm">add</span>
            </button>
        </div>
    </main>
  );
};
