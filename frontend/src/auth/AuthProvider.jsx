import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginService, googleSignUpService, googleSignInService } from "./authService";
import { saveAuth, getUser, clearAuth } from "./authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  // Restore session on page refresh
  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setInitialized(true);
  }, []);

  async function login(email, password, remember) {
    setLoading(true);

    const response = await loginService(email, password);

    if (response.success) {
      setUser(response.user);

      if (remember) {
        saveAuth(response.user, response.token, true);
      }

      setLoading(false);
      return { success: true };
    }

    setLoading(false);

    return {
      success: false,
      message: response.message,
    };
  }

  async function googleSignUp(token) {
    setLoading(true);
    const response = await googleSignUpService(token);
    if (response.success) {
      setUser(response.user);
      saveAuth(response.user, response.token, true);
      setLoading(false);
      return { success: true, user: response.user };
    }
    setLoading(false);
    return { success: false, message: response.message };
  }

  async function googleSignIn(token) {
    setLoading(true);
    const response = await googleSignInService(token);
    if (response.success) {
      setUser(response.user);
      saveAuth(response.user, response.token, true);
      setLoading(false);
      return { success: true, user: response.user };
    }
    setLoading(false);
    return { success: false, message: response.message };
  }

  function logout() {
    clearAuth();
    setUser(null);
  }

  function updateUser(updatedUser) {
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    localStorage.setItem("smartflow_user", JSON.stringify(newUser));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        googleSignUp,
        googleSignIn,
        loginGoogle: googleSignIn,
        logout,
        loading,
        updateUser,
        initialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}