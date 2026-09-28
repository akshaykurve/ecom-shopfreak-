import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bootstrapAuth } from "./features/auth/authSlice";
import AppRoutes from "./routes/AppRoutes";
import Loader from "./components/Loader";

function App() {
  const dispatch = useDispatch();
  const initialized = useSelector((state) => state.auth.initialized);

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
        <Loader />
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;
