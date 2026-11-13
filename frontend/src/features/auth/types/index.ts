// MOVIA — Tipos del feature auth

import type { Role } from "@/types";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  data: User;
}
