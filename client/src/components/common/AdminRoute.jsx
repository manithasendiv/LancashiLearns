import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config";

export default function ProtectedRoute({ children }) {
  // `undefined` keeps the guard in a loading state until Firebase resolves auth.
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    // Listen for login/logout changes so route access updates without a reload.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Convert falsy auth payloads to null for explicit unauthenticated state.
      setUser(firebaseUser || null);
    });

    // Remove auth subscription when route wrapper unmounts.
    return () => unsubscribe();
  }, []);

  // Keep a loading fallback until Firebase returns the first auth event.
  if (user === undefined) {
    return <div className="p-6">Checking authentication...</div>;
  }

  // Send signed-out users back to login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render protected children once auth check succeeds.
  return children;
}