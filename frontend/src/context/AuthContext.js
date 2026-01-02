import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import socketService from '../services/socket.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = authService.getStoredToken();
            const storedUser = authService.getStoredUser();
            
            console.log('🔍 Checking auth...', { hasToken: !!token, hasUser: !!storedUser });
            
            if (token && storedUser) {
                // Set user from localStorage first (instant UI update)
                setUser(storedUser);
                setIsAuthenticated(true);
                
                // Then verify with backend and update if needed
                try {
                    const data = await authService.getCurrentUser();
                    setUser(data.user);
                    
                    // Connect socket
                    socketService.connect(token);
                } catch (error) {
                    // Token might be invalid, clear auth
                    console.error('❌ Token verification failed:', error);
                    setUser(null);
                    setIsAuthenticated(false);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        console.log('🔐 Logging in...');
        const data = await authService.login(credentials);
        console.log('✅ Login successful', { user: data.user.email });
        
        setUser(data.user);
        setIsAuthenticated(true);
        
        // Connect socket
        socketService.connect(data.token);
        
        return data;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        
        // Disconnect socket
        socketService.disconnect();
    };

    const register = async (userData) => {
        const data = await authService.register(userData);
        
        // If token is returned (auto-login), update auth state
        if (data.token && data.user) {
            setUser(data.user);
            setIsAuthenticated(true);
            
            // Connect socket
            socketService.connect(data.token);
        }
        
        return data;
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
        localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        register,
        updateUser,
        checkAuth
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
