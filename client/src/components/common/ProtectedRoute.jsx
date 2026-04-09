import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config";

export default function ProtectedRoute({ children }) {
  // `undefined` means auth is still resolving; `null` means no signed-in user.
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    // Subscribe once so route access reacts immediately to Firebase auth changes.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Normalize missing users to null for simple conditional checks.
      setUser(firebaseUser || null);
    });

    // Clean up listener when this guard unmounts.
    return () => unsubscribe();
  }, []);

  // Show a temporary state while Firebase resolves the current session.
  if (user === undefined) {
    return <div className="p-6">Checking authentication...</div>;
  }

  // Redirect anonymous users to the login screen.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated users can access the wrapped page.
  return children;
}