
export type ToolType = 
  | 'move' 
  | 'enhance' 
  | 'pen' 
  | 'separation'
  | 'halftone' 
  | 'stippling' 
  | 'dithering'
  | 'grain'
  | 'engraving'
  | 'print';

export type ImageSize = '1K' | '2K' | '4K';

export type ShirtSize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
export type PrintLocation = 'front_center' | 'front_pocket' | 'back_center' | 'back_neck';

// Available themes
export type AppTheme = 'cyan' | 'red' | 'yellow' | 'green' | 'purple' | 'mono';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

// Auth Types
export interface User {
  username: string;
  password?: string;
  role: 'admin' | 'user';
  createdAt: number;
}

export type AuthView = 'login' | 'app' | 'admin';

export interface AppState {
  // Auth State
  authView: AuthView;
  currentUser: User | null;

  // Editor State
  originalImage: string | null;
  processedImage: string | null;
  isProcessing: boolean;
  activeTool: ToolType;
  zoom: number;
  
  // App Config
  settingsOpen: boolean;
  theme: AppTheme;

  // Color Separation Settings
  separationSettings: {
    hue: number;
    saturation: number;
    contrast: number;
    brightness: number;
  };

  // Enhance / Vectorize Settings
  enhanceSettings: {
    sharpen: number;   // 0 - 100
    denoise: number;   // 0 - 20
    posterize: number; // 2 - 255
    upscale: 1 | 2 | 4; 
    removeBg: boolean; 
  };

  // Local Effect Settings
  effectSettings: {
    intensity: number; 
    scale: number;     
    angle: number;     
  };

  // DTF Print Settings
  printSettings: {
    shirtSize: ShirtSize;
    location: PrintLocation;
    widthCm: number;
    heightCm: number;
    dpi: number;
  };
}

export interface GenerationSettings {
  prompt: string;
  size: ImageSize;
  aspectRatio: string;
}
