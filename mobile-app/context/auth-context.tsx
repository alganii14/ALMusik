import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await SecureStore.getItemAsync("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const usersData = await SecureStore.getItemAsync("users");
      const users = usersData ? JSON.parse(usersData) : [];

      const foundUser = users.find(
        (u: { email: string; password: string }) =>
          u.email === email && u.password === password
      );

      if (foundUser) {
        const userData = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
        };
        await SecureStore.setItemAsync("user", JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const usersData = await SecureStore.getItemAsync("users");
      const users = usersData ? JSON.parse(usersData) : [];

      const exists = users.some((u: { email: string }) => u.email === email);
      if (exists) return false;

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
      };

      users.push(newUser);
      await SecureStore.setItemAsync("users", JSON.stringify(users));

      const userData = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      };
      await SecureStore.setItemAsync("user", JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  // Google login placeholder - akan diimplementasi nanti
  const loginWithGoogle = async (): Promise<boolean> => {
    // TODO: Implement Google Sign-In
    console.log("Google Sign-In belum diimplementasi");
    return false;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
