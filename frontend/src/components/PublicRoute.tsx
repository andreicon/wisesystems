import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

export function PublicRoute() {
  const { token, user } = useAppSelector((state) => state.auth);

  if (token && user) {
    return <Navigate to="/todos" replace />;
  }

  return <Outlet />;
}
