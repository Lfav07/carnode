import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { keycloak } from "./keycloak";

interface AuthContextData {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | undefined;

  login: () => Promise<void>;
  logout: () => Promise<void>;

  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextData | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function initialize() {
      try {
        const authenticated = await keycloak.init({
          onLoad: "check-sso",
          pkceMethod: "S256",
        });

        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error("Failed to initialize Keycloak", error);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  const login = useCallback(async () => {
    await keycloak.login();
  }, []);

  const logout = useCallback(async () => {
    await keycloak.logout({
      redirectUri: window.location.origin,
    });
  }, []);

  function hasRole(role: string) {
    return keycloak.hasRealmRole(role);
  }

  function hasAnyRole(roles: string[]) {
    return roles.some(hasRole);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        token: keycloak.token,
        login,
        logout,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}