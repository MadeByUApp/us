
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { PrintPanel } from './components/PrintPanel';
import { Canvas } from './components/Canvas';
import { SettingsModal } from './components/SettingsModal';
import { LoginScreen } from './components/LoginScreen';
import { AdminPanel } from './components/AdminPanel';
import { AppState, AppTheme, User } from './types';
import * as LocalProcessor from './services/processor';
import * as AuthService from './services/auth';

const INITIAL_STATE: AppState = {
  // Auth
  authView: 'login',
  currentUser: null,

  originalImage: null,
  processedImage: null,
  isProcessing: false,
  activeTool: 'move', 
  zoom: 100,
  settingsOpen: false,
  theme: 'cyan', // Default
  separationSettings: {
    hue: 0,
    saturation: 100,
    contrast: 100,
    brightness: 100,
  },
  enhanceSettings: {
    sharpen: 0, 
    denoise: 0, 
    posterize: 255, 
    upscale: 1,
    removeBg: true, 
  },
  effectSettings: {
    intensity: 50,
    scale: 6,
    angle: 45,
  },
  printSettings: {
    shirtSize: 'M',
    location: 'front_center',
    widthCm: 28,
    heightCm: 28,
    dpi: 300
  },
};

// RGB values for themes
const THEME_COLORS: Record<AppTheme, { primary: string; dark: string }> = {
  cyan:   { primary: '19 200 236', dark: '14 165 195' }, // #13c8ec
  red:    { primary: '239 68 68',  dark: '220 38 38' },  // #ef4444
  yellow: { primary: '234 179 8',  dark: '202 138 4' },  // #eab308
  green:  { primary: '34 197 94',  dark: '22 163 74' },  // #22c55e
  purple: { primary: '168 85 247', dark: '147 51 234' }, // #a855f7
  mono:   { primary: '255 255 255', dark: '209 213 219' } // #ffffff
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  // Initialize DB on Mount
  useEffect(() => {
    AuthService.initAuthDB();
  }, []);

  // Update CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const colors = THEME_COLORS[state.theme];
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-dark', colors.dark);
  }, [state.theme]);

  const handleLoginSuccess = (user: User) => {
     // Always go to the app view first, even for admins
     setState(prev => ({
         ...prev,
         currentUser: user,
         authView: 'app' 
     }));
  };

  const handleLogout = () => {
      setState(prev => ({ ...prev, currentUser: null, authView: 'login' }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
            setState(prev => ({
              ...prev,
              originalImage: evt.target?.result as string,
              processedImage: null, // Reset processing
            }));
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleApplyEffect = async () => {
    if (!state.originalImage) return;
    
    setState(prev => ({ ...prev, isProcessing: true }));
    try {
        const newImg = await LocalProcessor.processLocalEffect(
            state.originalImage,
            state.activeTool,
            state.separationSettings,
            state.effectSettings,
            state.enhanceSettings
        );
        setState(prev => ({ ...prev, processedImage: newImg }));
    } catch (e: any) {
        console.error(e);
        alert("Error en el procesamiento local.");
    } finally {
        setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  useEffect(() => {
      if (state.originalImage && ['halftone', 'stippling', 'dithering', 'grain', 'engraving', 'separation', 'enhance'].includes(state.activeTool)) {
          const timer = setTimeout(() => {
              handleApplyEffect();
          }, 100);
          return () => clearTimeout(timer);
      }
  }, [state.separationSettings, state.effectSettings, state.enhanceSettings, state.activeTool]);

  // --- RENDER LOGIC BASED ON AUTH VIEW ---

  if (state.authView === 'login') {
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (state.authView === 'admin') {
      return (
          <AdminPanel 
            onGoToApp={() => setState(s => ({...s, authView: 'app'}))}
            onLogout={handleLogout}
          />
      );
  }

  // Main App View
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background font-sans text-white">
      <Header 
        onUpload={handleFileUpload}
        user={state.currentUser}
        onOpenAdmin={() => setState(s => ({...s, authView: 'admin'}))}
        onLogout={handleLogout}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Toolbar 
          activeTool={state.activeTool} 
          setTool={(t) => setState(s => ({...s, activeTool: t}))}
          onOpenSettings={() => setState(s => ({...s, settingsOpen: true}))} 
        />
        
        {state.activeTool === 'print' && (
           <PrintPanel 
             appState={state}
             updatePrintSettings={(s) => setState(prev => ({...prev, printSettings: {...prev.printSettings, ...s}}))}
           />
        )}
        
        <Canvas 
          appState={state} 
          onUpload={handleFileUpload}
          setZoom={(z) => setState(s => ({...s, zoom: Math.max(10, Math.min(3200, z))}))}
        />
        
        <PropertiesPanel 
           appState={state}
           updateSeparationSettings={(s) => setState(prev => ({...prev, separationSettings: {...prev.separationSettings, ...s}}))}
           updateEffectSettings={(s) => setState(prev => ({...prev, effectSettings: {...prev.effectSettings, ...s}}))}
           updateEnhanceSettings={(s) => setState(prev => ({...prev, enhanceSettings: {...prev.enhanceSettings, ...s}}))}
           
           onApplyAIStyle={handleApplyEffect}
        />
      </div>

      <SettingsModal 
        isOpen={state.settingsOpen}
        onClose={() => setState(s => ({...s, settingsOpen: false}))}
        currentTheme={state.theme}
        setTheme={(t) => setState(s => ({...s, theme: t}))}
      />

      <footer className="h-8 bg-background border-t border-border flex items-center px-4 justify-between shrink-0 text-xs font-mono text-slate-500 select-none">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">memory</span>
            <span>MOTOR: <span className="text-primary font-bold">CANVAS PRO (ILIMITADO)</span></span>
          </div>
          {state.activeTool === 'print' && (
             <div className="flex items-center gap-2 text-purple-400">
                <span className="material-symbols-outlined text-sm">print</span>
                <span>DTF MODE: {state.printSettings.widthCm}cm ({state.printSettings.dpi}DPI)</span>
             </div>
          )}
        </div>
        
        {/* Footer logout button removed or kept as secondary option, but keeping it ensures redundancy */}
        <button onClick={handleLogout} className="hover:text-red-400 transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">logout</span>
            Salir
        </button>
      </footer>
    </div>
  );
};

export default App;
