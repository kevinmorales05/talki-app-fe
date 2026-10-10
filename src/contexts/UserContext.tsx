import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserData {
  _id: string;
  name: string;
  lastname: string;
  email: string;
  firebase_id: string;
}

export interface KidData {
  _id: string;
  name: string;
  lastname: string;
  birthday: string;
  user_id: string;
  specialNeed: string;
}

interface UserContextType {
  user: UserData | null;
  kids: KidData[];
  token: string | null;
  isAuthenticated: boolean;
  loginUser: (user: UserData, kids: KidData[], token: string) => void;
  logoutUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const SESSION_KEY = "talki-user-session";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [kids, setKids] = useState<KidData[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user || null);
        setKids(parsed.kids || []);
        setToken(parsed.token || null);
      }
    } catch (error) {
      console.error("Failed to parse session storage", error);
    }
  }, []);

  const loginUser = (userData: UserData, kidsData: KidData[], firebaseToken: string) => {
    setUser(userData);
    setKids(kidsData);
    setToken(firebaseToken);
    
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      user: userData,
      kids: kidsData,
      token: firebaseToken,
    }));
  };

  const logoutUser = () => {
    setUser(null);
    setKids([]);
    setToken(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <UserContext.Provider value={{ user, kids, token, isAuthenticated: !!user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
