
import React, { useState, useEffect, useRef } from 'react';
import * as AuthService from '../services/auth';
import { User } from '../types';

interface AdminPanelProps {
  onGoToApp: () => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onGoToApp, onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');
  const [msg, setMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const currentUsers = AuthService.getUsers();
    setUsers([...currentUsers]); // Create a new reference to force update
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser || !newPass) {
        setMsg({ type: 'error', text: 'Todos los campos son obligatorios' });
        return;
    }
    
    // Trim spaces to avoid confusion
    const cleanUser = newUser.trim();
    const cleanPass = newPass.trim();

    if (!cleanUser || !cleanPass) {
        setMsg({ type: 'error', text: 'El usuario y contraseña no pueden estar vacíos.' });
        return;
    }

    const success = AuthService.addUser(cleanUser, cleanPass);
    if (success) {
        setMsg({ type: 'success', text: `Usuario ${cleanUser} creado correctamente.` });
        setNewUser('');
        setNewPass('');
        loadUsers();
    } else {
        setMsg({ type: 'error', text: 'El usuario ya existe.' });
    }
  };

  const handleDelete = (username: string) => {
    // Explicit confirm
    const confirmDelete = window.confirm(`¿Estás seguro de ELIMINAR al usuario "${username}"? Esta acción no se puede deshacer.`);
    
    if (confirmDelete) {
        const success = AuthService.deleteUser(username);
        if (success) {
            setMsg({ type: 'success', text: 'Usuario eliminado.' });
            // Small delay to ensure DB write before read (though localStorage is sync)
            setTimeout(loadUsers, 50);
        } else {
            setMsg({ type: 'error', text: 'No se pudo eliminar el usuario (¿Es admin o no existe?).' });
        }
    }
  };

  // --- Backup Functions ---

  const handleDownloadDB = () => {
      const json = AuthService.getDatabaseJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `madebyu_users_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMsg({ type: 'success', text: 'Base de datos descargada correctamente.' });
  };

  const handleUploadClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
          const content = evt.target?.result as string;
          if (content) {
              const success = AuthService.restoreDatabase(content);
              if (success) {
                  loadUsers();
                  setMsg({ type: 'success', text: 'Base de datos restaurada correctamente.' });
              } else {
                  setMsg({ type: 'error', text: 'Archivo de base de datos inválido.' });
              }
          }
      };
      reader.readAsText(file);
      e.target.value = ''; // reset
  };

  return (
    <div className="min-h-screen bg-background p-8 font-sans text-white">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-border gap-4">
            <div>
                <h1 className="text-3xl font-display font-bold text-white">Panel de Administración</h1>
                <p className="text-slate-400">Gestión de Accesos y Base de Datos</p>
            </div>
            <div className="flex gap-3">
                 <button onClick={onGoToApp} className="px-4 py-2 bg-surface border border-border rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined">rocket_launch</span>
                    Ir a la App
                 </button>
                 <button onClick={onLogout} className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined">logout</span>
                    Salir
                 </button>
            </div>
        </header>

        {msg && (
            <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 animate-fade-in ${msg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                <span className="material-symbols-outlined">{msg.type === 'success' ? 'check_circle' : 'error'}</span>
                {msg.text}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Forms & DB Tools */}
            <div className="md:col-span-1 space-y-8">
                
                {/* Create User */}
                <div className="bg-panel border border-border rounded-xl p-6 shadow-lg">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person_add</span>
                        Crear Usuario
                    </h2>
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-400 font-bold uppercase">Nombre de Usuario</label>
                            <input 
                                type="text"
                                value={newUser}
                                onChange={e => setNewUser(e.target.value)}
                                className="w-full mt-1 bg-surface border border-border rounded p-2 text-white focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-bold uppercase">Contraseña</label>
                            <input 
                                type="text"
                                value={newPass}
                                onChange={e => setNewPass(e.target.value)}
                                className="w-full mt-1 bg-surface border border-border rounded p-2 text-white focus:border-primary outline-none font-mono"
                            />
                        </div>
                        <button type="submit" className="w-full bg-primary text-background font-bold py-2 rounded hover:bg-primary-dark transition-colors">
                            Registrar Usuario
                        </button>
                    </form>
                </div>

                {/* Database Backup Tools */}
                <div className="bg-panel border border-border rounded-xl p-6 shadow-lg">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-400">
                        <span className="material-symbols-outlined">database</span>
                        Base de Datos
                    </h2>
                    <p className="text-xs text-slate-400 mb-4">
                        Descarga una copia de seguridad para no perder los usuarios si cambias de equipo o borras el historial.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleDownloadDB}
                            className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <span className="material-symbols-outlined text-lg">download</span>
                            Descargar Copia (Backup)
                        </button>
                        
                        <div className="relative">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept=".json"
                            />
                            <button 
                                onClick={handleUploadClick}
                                className="w-full py-2 bg-slate-700/50 hover:bg-slate-700 border border-border text-slate-300 rounded transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                            >
                                <span className="material-symbols-outlined text-lg">upload</span>
                                Restaurar Copia
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Column 2: User List */}
            <div className="md:col-span-2">
                <div className="bg-panel border border-border rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
                     <div className="p-4 bg-surface border-b border-border flex justify-between items-center shrink-0">
                        <h2 className="font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">group</span>
                            Usuarios Registrados
                        </h2>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-bold">{users.length}</span>
                     </div>
                     <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-slate-400 text-xs uppercase sticky top-0 bg-panel z-10">
                                <tr>
                                    <th className="p-4">Usuario</th>
                                    <th className="p-4">Contraseña (Visible Admin)</th>
                                    <th className="p-4">Rol</th>
                                    <th className="p-4">Creado</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map(u => (
                                    <tr key={u.username} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-medium flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${u.role === 'admin' ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                                {u.username.charAt(0).toUpperCase()}
                                            </div>
                                            {u.username}
                                        </td>
                                        <td className="p-4 font-mono text-slate-400 select-all">
                                            {u.password}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-700/50 text-slate-300 border border-slate-600'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500 text-xs">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            {u.role !== 'admin' && (
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete(u.username);
                                                    }}
                                                    className="text-red-400 hover:text-white p-2 hover:bg-red-500 rounded transition-colors cursor-pointer"
                                                    title="Eliminar usuario"
                                                >
                                                    <span className="material-symbols-outlined text-lg pointer-events-none">delete</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">No hay usuarios registrados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
