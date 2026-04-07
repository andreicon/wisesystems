import { Alert, Box, Button, Link, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { clearAuthError, registerUser } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, user } = useAppSelector((state) => state.auth);

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
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

    await dispatch(
      registerUser({
        email,
        fname,
        lname,
        password,
      }),
    );
  };

  return (
    <AuthLayout>
      <Typography variant="h5" mb={3}>
        Create Account
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="First Name"
            value={fname}
            onChange={(event) => setFname(event.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Last Name"
            value={lname}
            onChange={(event) => setLname(event.target.value)}
            required
            fullWidth
          />

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
            {isSubmitting ? "Creating account..." : "Register"}
          </Button>

          <Typography variant="body2" textAlign="center">
            Already registered?{" "}
            <Link component={RouterLink} to="/login">
              Log in
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
