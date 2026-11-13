// MOVIA — Contexto de autenticación (separado del provider para evitar imports circulares)

import { createContext } from "react";
import type { User } from "./types";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
