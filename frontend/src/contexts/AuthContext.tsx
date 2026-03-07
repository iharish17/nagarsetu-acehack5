import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import OneSignal from 'react-onesignal';
import { User } from '../types';
import * as authApi from '../api/authApi';
import { registerDeviceToken } from '../api/userApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ email: string; verificationRequired: boolean }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface RegisterData {
  email: string;
  password: string;
  role: 'citizen' | 'municipality' | 'contractor';
  profile: {
    name: string;
    phone?: string;
  };
  municipality?: {
    jurisdiction?: string;
    department?: string;
  };
  contractor?: {
    company?: string;
    licenseNumber?: string;
    specialization?: string[];
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('nagarsetu_token');
      const storedUser = localStorage.getItem('nagarsetu_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        try {
          const response = await authApi.getMe();
          setUser(response.data.user);
          localStorage.setItem('nagarsetu_user', JSON.stringify(response.data.user));

          try {
            // Check if there's an existing OneSignal user before attempting login
            const existingOneSignalId = OneSignal.User.onesignalId;
            if (!existingOneSignalId) {
              await OneSignal.login(response.data.user._id);
            }
          } catch {
            // OneSignal may be blocked or unsupported
          }

          await syncDeviceToken();
        } catch {
          localStorage.removeItem('nagarsetu_token');
          localStorage.removeItem('nagarsetu_user');
          setToken(null);
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!token || !user) return;

    const onOneSignalUserChange = async (change: any) => {
      try {
        const oneSignalId = change?.current?.onesignalId || OneSignal.User.onesignalId;
        if (oneSignalId) {
          await registerDeviceToken(oneSignalId);
        }
      } catch {
        // Ignore OneSignal sync errors
      }
    };

    try {
      OneSignal.User.addEventListener('change', onOneSignalUserChange);
    } catch {
      // OneSignal may be blocked or unsupported
    }

    return () => {
      try {
        OneSignal.User.removeEventListener('change', onOneSignalUserChange);
      } catch {
        // Ignore OneSignal cleanup errors
      }
    };
  }, [token, user]);

  const syncDeviceToken = async (opts?: { prompt?: boolean }) => {
    try {
      const isPushSupported = OneSignal.Notifications.isPushSupported();
      if (!isPushSupported) return;

      if (
        opts?.prompt &&
        OneSignal.Notifications.permissionNative === 'default' &&
        !OneSignal.User.PushSubscription.optedIn
      ) {
        await OneSignal.Slidedown.promptPush();
      }

      const oneSignalId = OneSignal.User.onesignalId;
      if (oneSignalId) {
        await registerDeviceToken(oneSignalId);
      }
    } catch {
      // Push not supported or permission denied
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setToken(response.data.token);
    setUser(response.data.user);
    localStorage.setItem('nagarsetu_token', response.data.token);
    localStorage.setItem('nagarsetu_user', JSON.stringify(response.data.user));
    
    void (async () => {
      try {
        // Check if there's an existing OneSignal user before attempting login
        const existingOneSignalId = OneSignal.User.onesignalId;
        if (!existingOneSignalId) {
          // No existing user, safe to login
          await OneSignal.login(response.data.user._id);
        }
        // If existingOneSignalId exists, user is already logged in with OneSignal
        // This avoids the 409 conflict
      } catch (err: any) {
        // Handle 409 conflict - user already exists
        if (err?.message?.includes('409') || err?.status === 409) {
          try {
            // Try to get the current user instead of creating new
            await OneSignal.init({
              appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
              allowLocalhostAsSecureOrigin: true,
            });
          } catch {
            // OneSignal may be blocked or unsupported
          }
        }
        // Ignore other OneSignal errors
      }
      await syncDeviceToken({ prompt: true });
    })();
  };

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data);
    return response.data;
  };

  const logout = async () => {
    // Store token for the API call
    const storedToken = localStorage.getItem('nagarsetu_token');
    
    // Fire-and-forget: server-side cleanup should not block UI
    try {
      const oneSignalId = OneSignal.User.onesignalId;
      // Make API call BEFORE clearing local state
      if (storedToken) {
        await authApi.logout(oneSignalId || undefined).catch(() => {});
      }
      OneSignal.logout().catch(() => {});
    } catch {
      // Ignore cleanup errors
    }

    // Clear local state after API call
    setToken(null);
    setUser(null);
    localStorage.removeItem('nagarsetu_token');
    localStorage.removeItem('nagarsetu_user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('nagarsetu_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
