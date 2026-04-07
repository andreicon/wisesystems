export type User = {
  id: string;
  email: string;
  fname: string;
  lname: string;
  created_at: string;
  updated_at: string;
};

export type Todo = {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type TodosResponse = {
  todos: Todo[];
  pagination: Pagination;
};

export type AuthResponse = {
  user: User;
  token: string;
};
