import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
      }

      setCheckingStatus(false);
    });

    return unsubscribe;
  }, []);

  return { loggedIn, checkingStatus };
};

// Protected routes in v6
// https://stackoverflow.com/questions/65505665/protected-route-with-firebase

// Fix memory leak warning
// https://stackoverflow.com/questions/59780268/cleanup-memory-leaks-on-an-unmounted-component-in-react-hooks

// React v18 is removed the memory leak warning. but it should still clean up from useEffect.
