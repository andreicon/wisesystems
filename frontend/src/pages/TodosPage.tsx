import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { logout } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearTodosError, createTodo, deleteTodo, fetchTodos, resetTodosState, updateTodo } from "../store/todosSlice";
import type { Todo } from "../types";

type FormState = {
  title: string;
  description: string;
  completed: boolean;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  completed: false,
};

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function TodosPage() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const auth = useAppSelector((state) => state.auth);
  const todosState = useAppSelector((state) => state.todos);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const queryPage = parsePositiveInt(searchParams.get("page"), 1);
  const queryLimit = parsePositiveInt(searchParams.get("limit"), 10);

  useEffect(() => {
    void dispatch(fetchTodos({ page: queryPage, limit: queryLimit }));

    setSearchParams(
      {
        page: String(queryPage),
        limit: String(queryLimit),
      },
      { replace: true },
    );
  }, [dispatch, queryLimit, queryPage, setSearchParams]);

  useEffect(() => {
    return () => {
      dispatch(resetTodosState());
    };
  }, [dispatch]);

  const closeDialog = () => {
    setOpenDialog(false);
    setEditingTodo(null);
    setForm(emptyForm);
  };

  const openCreateDialog = () => {
    setEditingTodo(null);
    setForm(emptyForm);
    setOpenDialog(true);
  };

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo);
    setForm({
      title: todo.title,
      description: todo.description ?? "",
      completed: todo.completed,
    });
    setOpenDialog(true);
  };

  const pendingAction = todosState.actionStatus === "loading";

  const userDisplayName = useMemo(() => {
    if (!auth.user) return "";
    return `${auth.user.fname} ${auth.user.lname}`.trim();
  }, [auth.user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    if (editingTodo) {
      await dispatch(
        updateTodo({
          id: editingTodo.id,
          data: {
            title: form.title,
            description: form.description.trim() ? form.description : null,
            completed: form.completed,
          },
        }),
      );
    } else {
      await dispatch(
        createTodo({
          title: form.title,
          description: form.description.trim() ? form.description : undefined,
          completed: form.completed,
        }),
      );
    }

    closeDialog();
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteTodo(id));
  };

  const handleToggleCompleted = async (todo: Todo) => {
    await dispatch(
      updateTodo({
        id: todo.id,
        data: {
          completed: !todo.completed,
        },
      }),
    );
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    setSearchParams({
      page: String(newPage + 1),
      limit: String(todosState.limit),
    });
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextLimit = Number(event.target.value);

    setSearchParams({
      page: "1",
      limit: String(nextLimit),
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg, #f4f6f8 0%, #edf4f2 100%)" }}>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: "blur(8px)", borderBottom: "1px solid #d4dde2" }}>
        <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
          <Stack>
            <Typography variant="h5">Todos Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">
              {userDisplayName ? `Welcome, ${userDisplayName}` : "Manage your tasks"}
            </Typography>
          </Stack>

          <Button variant="outlined" color="primary" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Log Out
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" mb={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={`${todosState.total} total`} color="primary" variant="outlined" />
            <Chip label={`${todosState.items.filter((todo) => todo.completed).length} completed`} color="success" variant="outlined" />
          </Stack>

          <Button startIcon={<AddIcon />} variant="contained" onClick={openCreateDialog}>
            Add Todo
          </Button>
        </Stack>

        {todosState.error ? (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearTodosError())}>
            {todosState.error}
          </Alert>
        ) : null}

        <Paper elevation={3}>
          {todosState.status === "loading" ? (
            <Stack py={8} alignItems="center" justifyContent="center">
              <CircularProgress />
            </Stack>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Done</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todosState.items.map((todo) => (
                    <TableRow key={todo.id} hover>
                      <TableCell>
                        <Checkbox checked={todo.completed} onChange={() => void handleToggleCompleted(todo)} />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>{todo.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="text.secondary">{todo.description || "-"}</Typography>
                      </TableCell>
                      <TableCell>{new Date(todo.updated_at).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit todo">
                          <IconButton color="primary" onClick={() => openEditDialog(todo)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete todo">
                          <IconButton color="error" onClick={() => void handleDelete(todo.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!todosState.items.length ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography py={6} textAlign="center" color="text.secondary">
                          No todos yet. Create your first task.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={todosState.total}
            page={Math.max(0, todosState.page - 1)}
            onPageChange={handlePageChange}
            rowsPerPage={todosState.limit}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 20, 50]}
          />
        </Paper>
      </Container>

      <Dialog open={openDialog} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingTodo ? "Edit Todo" : "Create Todo"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                fullWidth
                multiline
                minRows={3}
              />
              <Stack direction="row" alignItems="center" spacing={1}>
                <Checkbox
                  checked={form.completed}
                  onChange={(event) => setForm((prev) => ({ ...prev, completed: event.target.checked }))}
                />
                <Typography>Completed</Typography>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={pendingAction}>
              {pendingAction ? "Saving..." : editingTodo ? "Save Changes" : "Create Todo"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
