import { useState, useEffect } from "react";
import {
  observeAuthState,
  registerUser,
  loginUser,
  signInWithGoogle,
  logoutUser,
  getUserData,
  saveUserData,
} from "../firebase/firebaseService";

export const useAuth = () => {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("Guest");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsubscribe = observeAuthState(async (user) => {
      if (user) {
        setUserId(user.uid);
        setUserName(user.displayName || user.email || "User");
        // Optionally fetch user data from Firestore here if needed
        const userData = await getUserData(user.uid);
        if (userData && userData.name) {
          setUserName(userData.name);
        }
      } else {
        setUserId(null);
        setUserName("Guest");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRegister = async (email, password) => {
    setAuthError("");
    try {
      const userCredential = await registerUser(email, password);
      await saveUserData(userCredential.user.uid, {
        email: email,
        name: "User",
      });
    } catch (error) {
      setAuthError(error.message);
      console.error("Registration error:", error);
    }
  };

  const handleLogin = async (email, password) => {
    setAuthError("");
    try {
      await loginUser(email, password);
    } catch (error) {
      setAuthError(error.message);
      console.error("Login error:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    try {
      const userCredential = await signInWithGoogle();
      await saveUserData(userCredential.user.uid, {
        email: userCredential.user.email,
        name: userCredential.user.displayName || "User",
      });
    } catch (error) {
      setAuthError(error.message);
      console.error("Google sign-in error:", error);
    }
  };

  const handleLogout = async () => {
    setAuthError("");
    try {
      await logoutUser();
    } catch (error) {
      setAuthError(error.message);
      console.error("Logout error:", error);
    }
  };

  return {
    userId,
    userName,
    loading,
    authError,
    handleRegister,
    handleLogin,
    handleGoogleSignIn,
    handleLogout,
    setAuthError, // Allow clearing error from outside
  };
};
