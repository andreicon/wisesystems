import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest, ApiError } from "../api/client";
import type { Todo, TodosResponse } from "../types";

type RootAuth = {
  token: string | null;
};

type TodosState = {
  items: Todo[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  status: "idle" | "loading" | "error";
  actionStatus: "idle" | "loading" | "error";
  error: string | null;
};

type TodoPayload = {
  title: string;
  description?: string;
  completed?: boolean;
};

type UpdateTodoPayload = {
  id: string;
  data: {
    title?: string;
    description?: string | null;
    completed?: boolean;
  };
};

const initialState: TodosState = {
  items: [],
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  status: "idle",
  actionStatus: "idle",
  error: null,
};

export const fetchTodos = createAsyncThunk<
  TodosResponse,
  { page?: number; limit?: number } | undefined,
  { state: { auth: RootAuth }; rejectValue: string }
>("todos/fetch", async (params, { getState, rejectWithValue }) => {
  const token = getState().auth.token;

  if (!token) {
    return rejectWithValue("Authentication required");
  }

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  try {
    return await apiRequest<TodosResponse>(`/api/todos?page=${page}&limit=${limit}`, {
      token,
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to fetch todos";
    return rejectWithValue(message);
  }
});

export const createTodo = createAsyncThunk<
  { todo: Todo },
  TodoPayload,
  { state: { auth: RootAuth }; rejectValue: string }
>("todos/create", async (payload, { getState, rejectWithValue }) => {
  const token = getState().auth.token;

  if (!token) {
    return rejectWithValue("Authentication required");
  }

  try {
    return await apiRequest<{ todo: Todo }>("/api/todos", {
      method: "POST",
      token,
      body: payload,
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to create todo";
    return rejectWithValue(message);
  }
});

export const updateTodo = createAsyncThunk<
  { todo: Todo },
  UpdateTodoPayload,
  { state: { auth: RootAuth }; rejectValue: string }
>("todos/update", async ({ id, data }, { getState, rejectWithValue }) => {
  const token = getState().auth.token;

  if (!token) {
    return rejectWithValue("Authentication required");
  }

  try {
    return await apiRequest<{ todo: Todo }>(`/api/todos/${id}`, {
      method: "PATCH",
      token,
      body: data,
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to update todo";
    return rejectWithValue(message);
  }
});

export const deleteTodo = createAsyncThunk<
  string,
  string,
  { state: { auth: RootAuth }; rejectValue: string }
>("todos/delete", async (id, { getState, rejectWithValue }) => {
  const token = getState().auth.token;

  if (!token) {
    return rejectWithValue("Authentication required");
  }

  try {
    await apiRequest<void>(`/api/todos/${id}`, {
      method: "DELETE",
      token,
    });
    return id;
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to delete todo";
    return rejectWithValue(message);
  }
});

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    clearTodosError(state) {
      state.error = null;
    },
    resetTodosState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload.todos;
        state.page = action.payload.pagination.page;
        state.limit = action.payload.pagination.limit;
        state.total = action.payload.pagination.total;
        state.totalPages = action.payload.pagination.totalPages;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Failed to load todos";
      })
      .addCase(createTodo.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        state.actionStatus = "idle";
        state.items = [action.payload.todo, ...state.items];
        state.total += 1;
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.actionStatus = "error";
        state.error = action.payload ?? "Failed to create todo";
      })
      .addCase(updateTodo.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        state.actionStatus = "idle";
        state.items = state.items.map((todo) => (todo.id === action.payload.todo.id ? action.payload.todo : todo));
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.actionStatus = "error";
        state.error = action.payload ?? "Failed to update todo";
      })
      .addCase(deleteTodo.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.actionStatus = "idle";
        state.items = state.items.filter((todo) => todo.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.actionStatus = "error";
        state.error = action.payload ?? "Failed to delete todo";
      });
  },
});

export const { clearTodosError, resetTodosState } = todosSlice.actions;
export default todosSlice.reducer;
