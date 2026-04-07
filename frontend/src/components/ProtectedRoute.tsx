import { Navigate, Outlet } from "react-router-dom";
import { CircularProgress, Stack } from "@mui/material";
import { useAppSelector } from "../store/hooks";

export function ProtectedRoute() {
  const { token, user, status } = useAppSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (status === "loading" && !user) {
    return (
      <Stack minHeight="100vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return <Outlet />;
}
