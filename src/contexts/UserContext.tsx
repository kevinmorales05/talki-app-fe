import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UsersService } from "@/services/users.service";

export interface UserData {
  _id: string;
  name: string;
  lastname: string;
  email: string;
  firebase_id: string;
  subscription_id?: string | null;
  tokensAvailable?: number;
  state?: boolean;
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
  activeKid: KidData | null;
  token: string | null;
  isAuthenticated: boolean;
  isSubscribed: boolean;
  loginUser: (user: UserData, kids: KidData[], token: string) => void;
  updateUser: (partialUser: Partial<UserData>) => void;
  refreshUser: () => Promise<UserData | null>;
  updateKids: (kids: KidData[]) => void;
  setActiveKid: (kid: KidData) => void;
  logoutUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const SESSION_KEY = "talki-user-session";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [kids, setKids] = useState<KidData[]>([]);
  const [activeKid, setActiveKidState] = useState<KidData | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user || null);
        setKids(parsed.kids || []);
        setActiveKidState(parsed.activeKid || parsed.kids?.[0] || null);
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
    
    const defaultKid = kidsData.length > 0 ? kidsData[0] : null;
    setActiveKidState(defaultKid ?? null);
    
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      user: userData,
      kids: kidsData,
      activeKid: defaultKid,
      token: firebaseToken,
    }));
  };

  const updateUser = useCallback((partialUser: Partial<UserData>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partialUser };
      try {
        const stored = sessionStorage.getItem(SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...parsed, user: updated }));
        }
      } catch (err) {
        console.error("Failed to update user in session", err);
      }
      return updated;
    });
  }, []);

  const refreshUser = useCallback(async (): Promise<UserData | null> => {
    if (!user?._id) return null;
    try {
      const latestUser = await UsersService.findById(user._id);
      if (latestUser) {
        updateUser(latestUser);
        return latestUser;
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
    return null;
  }, [user?._id, updateUser]);

  const updateKids = (newKids: KidData[]) => {
    setKids(newKids);
    
    const updatedActiveKid = activeKid && newKids.find(k => k._id === activeKid._id) 
      ? newKids.find(k => k._id === activeKid._id)! 
      : newKids.length > 0 ? newKids[0] : null;
      
    setActiveKidState(updatedActiveKid ?? null);

    if (user && token) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        user,
        kids: newKids,
        activeKid: updatedActiveKid,
        token,
      }));
    }
  };
  
  const setActiveKid = (kid: KidData) => {
    setActiveKidState(kid);
    if (user && token) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        user,
        kids,
        activeKid: kid,
        token,
      }));
    }
  };

  const logoutUser = () => {
    setUser(null);
    setKids([]);
    setActiveKidState(null);
    setToken(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const isSubscribed = Boolean(user?.state);

  return (
    <UserContext.Provider value={{
      user,
      kids,
      activeKid,
      token,
      isAuthenticated: !!user,
      isSubscribed,
      loginUser,
      updateUser,
      refreshUser,
      updateKids,
      setActiveKid,
      logoutUser,
    }}>
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
