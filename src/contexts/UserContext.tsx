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
  activeKid: KidData | null;
  token: string | null;
  isAuthenticated: boolean;
  loginUser: (user: UserData, kids: KidData[], token: string) => void;
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

  const updateKids = (newKids: KidData[]) => {
    setKids(newKids);
    
    // Ensure activeKid is valid and exists in newKids, otherwise fallback to the first kid
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

  return (
    <UserContext.Provider value={{ user, kids, activeKid, token, isAuthenticated: !!user, loginUser, updateKids, setActiveKid, logoutUser }}>
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
