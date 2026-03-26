import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ThemeProvider } from "./theme/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserThunk } from "./features/auth/authSlice";

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserThunk());
    }
  }, [isAuthenticated, dispatch]);

  return <AppRoutes />;
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
