import { Alert, Box, Button, Link, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { clearAuthError, loginUser } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, user } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      navigate("/todos", { replace: true });
    }
  }, [navigate, user]);

  const isSubmitting = status === "loading";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await dispatch(loginUser({ email, password }));
  };

  return (
    <AuthLayout>
      <Typography variant="h5" mb={3}>
        Log In
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            fullWidth
            helperText="Minimum 8 characters"
          />

          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>

          <Typography variant="body2" textAlign="center">
            Need an account?{" "}
            <Link component={RouterLink} to="/register">
              Register here
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
