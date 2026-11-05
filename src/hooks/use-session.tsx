import { createContext, useContext, useState, type ReactNode } from 'react';

// Signed-in state for the root layout's route guards. Kept in memory only, so it
// resets when the app restarts.
// TODO: back this with real auth and persist it once there's a backend.

type Session = {
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);

  return (
    <SessionContext.Provider
      value={{
        isSignedIn,
        signIn: () => setIsSignedIn(true),
        signOut: () => setIsSignedIn(false),
      }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return session;
}
