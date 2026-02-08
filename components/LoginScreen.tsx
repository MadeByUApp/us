
import React, { useState } from 'react';
import * as AuthService from '../services/auth';
import { User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = AuthService.loginUser(username, password);
    if (user) {
        onLoginSuccess(user);
    } else {
        setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#283639 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>

        <div className="w-full max-w-md bg-panel border border-border rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-fade-in">
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            
            <div className="p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary mb-4">
                         <span className="material-symbols-outlined text-2xl">texture</span>
                    </div>
                    <h1 className="text-2xl font-display font-bold text-white tracking-tight">MadeByU</h1>
                    <p className="text-sm text-slate-400 mt-2">Estudio de Impresión Pro</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Usuario</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="Ingresa tu usuario"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contraseña</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="Ingresa tu contraseña"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-dark text-background font-bold py-3 px-4 rounded-lg transition-all transform active:scale-[0.98] mt-2"
                    >
                        Iniciar Sesión
                    </button>
                </form>
            </div>
            
            <div className="bg-surface p-4 text-center border-t border-border">
                <p className="text-xs text-slate-500">Acceso restringido a personal autorizado.</p>
            </div>
        </div>
    </div>
  );
};
