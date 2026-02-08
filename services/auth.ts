
import { User } from "../types";

const DB_KEY = 'madebyu_users_db_v1';
const ADMIN_USER: User = {
    username: 'Liebes.',
    password: 'Kenny.2514867100',
    role: 'admin',
    createdAt: Date.now()
};

// Initialize DB with Admin if empty
export const initAuthDB = () => {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
        // Store only the admin initially
        const initialDB = [ADMIN_USER];
        localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
    } else {
        // Ensure admin credentials are always up to date and correct in the DB
        try {
            const users = JSON.parse(stored) as User[];
            const adminIndex = users.findIndex(u => u.username === ADMIN_USER.username);
            
            if (adminIndex === -1) {
                // Admin was deleted somehow, restore it
                users.unshift(ADMIN_USER);
                localStorage.setItem(DB_KEY, JSON.stringify(users));
            } else {
                // Ensure admin password matches hardcoded secure password
                if (users[adminIndex].password !== ADMIN_USER.password) {
                    users[adminIndex].password = ADMIN_USER.password;
                    localStorage.setItem(DB_KEY, JSON.stringify(users));
                }
            }
        } catch (e) {
            // Corrupt DB, reset
            console.error("DB corrupt, resetting");
            localStorage.setItem(DB_KEY, JSON.stringify([ADMIN_USER]));
        }
    }
};

export const loginUser = (username: string, password: string): User | null => {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) return null;

    try {
        const users = JSON.parse(stored) as User[];
        // Case sensitive check for security
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // Return user without password for state
            const { password, ...safeUser } = user;
            return safeUser as User;
        }
    } catch(e) {
        return null;
    }
    return null;
};

export const getUsers = (): User[] => {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
};

export const addUser = (username: string, password: string): boolean => {
    const users = getUsers();
    if (users.find(u => u.username === username)) {
        return false; // User exists
    }
    const newUser: User = {
        username,
        password,
        role: 'user',
        createdAt: Date.now()
    };
    users.push(newUser);
    localStorage.setItem(DB_KEY, JSON.stringify(users));
    return true;
};

export const deleteUser = (usernameToDelete: string): boolean => {
    // 1. Safety check for Admin
    if (usernameToDelete === ADMIN_USER.username) {
        console.warn("Attempted to delete admin.");
        return false;
    }

    let users = getUsers();
    const initialLen = users.length;

    // 2. Filter out the user
    const newUsers = users.filter(u => u.username !== usernameToDelete);
    
    // 3. Check if deletion happened
    if (newUsers.length < initialLen) {
        localStorage.setItem(DB_KEY, JSON.stringify(newUsers));
        return true;
    }
    
    // 4. Fallback: Try whitespace trimmed matching if exact match failed
    // This helps if the DB has "User " but we requested "User"
    const trimmedUsers = users.filter(u => u.username.trim() !== usernameToDelete.trim());
    if (trimmedUsers.length < initialLen) {
        localStorage.setItem(DB_KEY, JSON.stringify(trimmedUsers));
        return true;
    }

    return false;
};

// --- DATABASE BACKUP TOOLS ---

export const getDatabaseJSON = (): string => {
    return localStorage.getItem(DB_KEY) || '[]';
};

export const restoreDatabase = (jsonContent: string): boolean => {
    try {
        const parsed = JSON.parse(jsonContent);
        if (!Array.isArray(parsed)) return false;
        
        // Basic validation
        const isValid = parsed.every(u => u.username && u.password && u.role);
        if (!isValid) return false;

        // Ensure Admin exists in the backup, if not, add it
        const hasAdmin = parsed.find(u => u.username === ADMIN_USER.username);
        if (!hasAdmin) {
            parsed.unshift(ADMIN_USER);
        }

        localStorage.setItem(DB_KEY, JSON.stringify(parsed));
        return true;
    } catch (e) {
        console.error("Database restore failed:", e);
        return false;
    }
};
