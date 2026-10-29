import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearSession, getSession, saveSession, setUnauthorizedHandler } from "./api";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {
    setUnauthorizedHandler(() => setSession(null));
    return () => setUnauthorizedHandler(() => {});
  }, []);

  const value = useMemo(
    () => ({
      session,
      signIn(next) {
        saveSession(next);
        setSession(next);
      },
      signOut() {
        clearSession();
        setSession(null);
      },
    }),
    [session]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);

  if (!value) {
    throw new Error("useSession must be used within SessionProvider.");
  }

  return value;
}
