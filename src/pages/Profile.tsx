import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { User as FirebaseUser } from "firebase/auth";

export const Profile = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const auth = getAuth();

  useEffect(() => {
    return setUser(auth.currentUser);
  }, []);

  return <>{user ? <h1>{user.displayName}</h1> : "Not Logged In"}</>;
};
