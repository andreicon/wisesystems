import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import { fetchMe } from "./store/authSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TodosPage } from "./pages/TodosPage";

function App() {
  const dispatch = useAppDispatch();
  const { token, user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user && status !== "loading") {
      void dispatch(fetchMe());
    }
  }, [dispatch, status, token, user]);

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/todos" element={<TodosPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/todos" replace />} />
    </Routes>
  );
}

export default App;
