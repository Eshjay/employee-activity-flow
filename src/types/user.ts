
export interface User {
  id: string;
  name: string;
  email: string;
  role: "employee" | "ceo" | "developer";
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: "employee" | "ceo" | "developer";
  department: string;
  status: string;
  last_login: string | null;
  created_at: string;
}
