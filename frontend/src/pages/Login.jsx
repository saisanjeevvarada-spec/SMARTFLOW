import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import { useTranslation } from "react-i18next";
import SmartFlowLogo from "../components/common/SmartFlowLogo";
import LanguageSwitcher from "../components/common/LanguageSwitcher";

import { validateLogin } from "../auth/authValidator";
import { register as registerService } from "../auth/authService";
import PasswordInput from "../components/auth/PasswordInput";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";
import LoadingSpinner from "../components/auth/LoadingSpinner";
import IntroCanvas from "../animations/Intro/IntroCanvas";
import GoogleButton from "../components/common/GoogleButton";

function validateRegistration(email, password, name, role) {
  const errors = {};
  if (!name.trim()) {
    errors.name = "Name is required";
  }
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Email address is invalid";
  }
  if (!password) {
    errors.password = "Password is required";
  } else {
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Must contain at least one lowercase letter.";
    } else if (!/\d/.test(password)) {
      errors.password = "Must contain at least one digit.";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.password = "Must contain at least one special character.";
    }
  }
  if (!role) {
    errors.role = "Role is required";
  }
  return errors;
}

export default function Login({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const { login, googleSignUp, googleSignIn, loading } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Cashier");
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (isRegistering) {
      const validation = validateRegistration(email, password, name, role);

      if (Object.keys(validation).length) {
        setErrors(validation);
        toast.error("Please correct the errors in the form.");
        return;
      }

      setErrors({});
      setAuthError("");
      setRegisterLoading(true);

      const regResult = await registerService({ name, email, password, role });

      if (regResult.success) {
        toast.success("Account created successfully! Logging you in...");
        const loginResult = await login(email, password, remember);
        setRegisterLoading(false);
        if (loginResult.success) {
          toast.success("Welcome to SmartFlow!");
          navigate("/");
        } else {
          toast.error("Account created, but automatic login failed. Please sign in manually.");
          setIsRegistering(false);
        }
      } else {
        setRegisterLoading(false);
        toast.error(regResult.message);
        setAuthError(regResult.message);
      }
    } else {
      const validation = validateLogin({ email, password });

      if (Object.keys(validation).length) {
        setErrors(validation);
        toast.error("Please fill in all required fields.");
        return;
      }

      setErrors({});
      setAuthError("");

      const result = await login(email, password, remember);

      if (result.success) {
        toast.success("Welcome back to SmartFlow!");
        navigate("/");
      } else {
        toast.error(result.message);
        setAuthError(result.message);
      }
    }
  }

  const handleGoogleResponse = async (tokenResponse) => {
    setGoogleLoading(true);
    setAuthError("");
    try {
      const token = tokenResponse.access_token || tokenResponse.credential || tokenResponse.code;
      let result;
      if (isRegistering) {
        result = await googleSignUp(token);
      } else {
        result = await googleSignIn(token);
      }

      setGoogleLoading(false);
      if (result.success) {
        toast.success(isRegistering ? "Welcome to SmartFlow!" : "Welcome back to SmartFlow!");
        navigate("/");
      } else {
        toast.error(result.message || "Google authentication failed. Please try again.");
        setAuthError(result.message);
      }
    } catch (err) {
      setGoogleLoading(false);
      toast.error("Google authentication failed. Please try again.");
      setAuthError("Google authentication failed. Please try again.");
    }
  };

  return (
    <IntroCanvas>
      <div
        className="login-enterprise-page"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
          background: "var(--bg)",
          color: "var(--text)",
          position: "relative"
        }}
      >
        {/* Top Right Tools: Theme Switcher */}
        <div style={{ position: "fixed", top: "24px", right: "32px", zIndex: 50, display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "var(--shadow)"
            }}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        {/* 55% Left / 45% Right Split Container */}
        <div
          style={{
            width: "100%",
            maxWidth: "1280px",
            display: "grid",
            gridTemplateColumns: "55% 45%",
            gap: "48px",
            alignItems: "center"
          }}
        >
          {/* LEFT SIDE (55%): Brand Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: "20px", paddingRight: "24px" }}
          >
            {/* Left Panel Header with Big Blue SMARTFLOW Logo */}
            <div style={{ marginBottom: "4px" }}>
              <SmartFlowLogo fontSize="3.2rem" />
            </div>

            <div>
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  color: "var(--text)",
                  letterSpacing: "-0.02em",
                  margin: "8px 0 12px",
                  lineHeight: 1.25
                }}
              >
                AI Powered Inventory Management
              </h1>
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "var(--secondary-text)",
                  margin: 0,
                  lineHeight: 1.6,
                  maxWidth: "540px"
                }}
              >
                Enterprise stock tracking, automated demand forecasting, and real-time operational analytics in one unified platform.
              </p>
            </div>
          </motion.div>

          {/* RIGHT SIDE (45%): Floating 24px Rounded Authentication Form */}
          <motion.div
            initial={{ opacity: 0, x: 45, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: "var(--surface)",
              borderRadius: "24px",
              padding: "40px 36px",
              boxShadow: "var(--floating-shadow)",
              border: "1px solid var(--border)",
              position: "relative"
            }}
          >
            <div style={{ marginBottom: "28px" }}>
              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: "1.65rem",
                  fontWeight: "800",
                  color: "var(--text)"
                }}
              >
                {isRegistering ? "Create Account" : "Sign In"}
              </h2>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--secondary-text)" }}>
                {isRegistering
                  ? "Select your system role to get started."
                  : "Welcome back. Sign in to access your inventory dashboard."}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {isRegistering && (
                <div>
                  <Input
                    label="Full Name"
                    name="name"
                    type="text"
                    placeholder="Sumanth Reddy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && <small className="error-text">{errors.name}</small>}
                </div>
              )}

              <div>
                <Input
                  label="Email"
                  name="email"
                  type="text"
                  placeholder="reddysumanth1206@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <small className="error-text">{errors.email}</small>}

                {email.length > 0 && (
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "var(--panel-soft, rgba(0,0,0,0.03))",
                      border: "1px solid var(--border)",
                      fontSize: "0.8rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px"
                    }}
                  >
                    <div
                      style={{
                        color: /\S+@\S+\.\S+/.test(email) ? "#10B981" : "var(--secondary-text)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: /\S+@\S+\.\S+/.test(email) ? "600" : "400"
                      }}
                    >
                      <span>{/\S+@\S+\.\S+/.test(email) ? "✓" : "○"}</span>
                      <span>Valid email address format (e.g. name@domain.com)</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <PasswordInput
                  label="Password"
                  name="password"
                  placeholder="238P1A04A8"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <small className="error-text">{errors.password}</small>}

                {password.length > 0 && (
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: "var(--panel-soft, rgba(0,0,0,0.03))",
                      border: "1px solid var(--border)",
                      fontSize: "0.8rem",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "6px 12px"
                    }}
                  >
                    <div
                      style={{
                        color: password.length >= 8 ? "#10B981" : "var(--secondary-text)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: password.length >= 8 ? "600" : "400"
                      }}
                    >
                      <span>{password.length >= 8 ? "✓" : "○"}</span>
                      <span>8+ characters</span>
                    </div>
                    <div
                      style={{
                        color: /[A-Z]/.test(password) ? "#10B981" : "var(--secondary-text)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: /[A-Z]/.test(password) ? "600" : "400"
                      }}
                    >
                      <span>{/[A-Z]/.test(password) ? "✓" : "○"}</span>
                      <span>1 Capital letter (A-Z)</span>
                    </div>
                    <div
                      style={{
                        color: /[a-z]/.test(password) ? "#10B981" : "var(--secondary-text)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: /[a-z]/.test(password) ? "600" : "400"
                      }}
                    >
                      <span>{/[a-z]/.test(password) ? "✓" : "○"}</span>
                      <span>1 Small letter (a-z)</span>
                    </div>
                    <div
                      style={{
                        color: /\d/.test(password) ? "#10B981" : "var(--secondary-text)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: /\d/.test(password) ? "600" : "400"
                      }}
                    >
                      <span>{/\d/.test(password) ? "✓" : "○"}</span>
                      <span>1 Number (0-9)</span>
                    </div>
                    <div
                      style={{
                        color: /[!@#$%^&*(),.?":{}|<>]/.test(password) ? "#10B981" : "var(--secondary-text)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        gridColumn: "span 2",
                        fontWeight: /[!@#$%^&*(),.?":{}|<>]/.test(password) ? "600" : "400"
                      }}
                    >
                      <span>{/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "✓" : "○"}</span>
                      <span>1 Special symbol (@, #, $, !, etc.)</span>
                    </div>
                  </div>
                )}
              </div>

              {isRegistering && (
                <div>
                  <Select
                    label="Role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Cashier">Cashier</option>
                    <option value="Admin">Admin</option>
                  </Select>
                  {errors.role && <small className="error-text">{errors.role}</small>}
                </div>
              )}

              {!isRegistering && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="remember-me" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", color: "var(--secondary-text)" }}>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={() => setRemember(!remember)}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    Remember Me
                  </label>

                  <button
                    type="button"
                    className="text-btn"
                    style={{ fontSize: "0.88rem", color: "var(--accent)", fontWeight: "600", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {authError && <p className="error-text" style={{ color: "var(--danger)", fontSize: "0.85rem", margin: 0 }}>{authError}</p>}

              <Button
                type="submit"
                className="full-width btn-loading"
                disabled={loading || registerLoading || googleLoading}
                style={{
                  height: "48px",
                  fontSize: "1rem",
                  fontWeight: "700",
                  borderRadius: "12px",
                  backgroundColor: "var(--accent)",
                  color: "#FFFFFF",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)"
                }}
              >
                {loading || registerLoading ? (
                  <>
                    <LoadingSpinner />
                    {isRegistering ? "Registering..." : "Signing In..."}
                  </>
                ) : isRegistering ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", margin: "8px 0", color: "var(--muted)" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }} />
                <span style={{ padding: "0 12px", fontSize: "0.78rem", textTransform: "uppercase", fontWeight: "600" }}>OR</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }} />
              </div>

              {/* Google Button */}
              <GoogleButton
                isRegistering={isRegistering}
                disabled={loading || registerLoading}
                onSuccess={handleGoogleResponse}
              />

              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <span style={{ fontSize: "0.88rem", color: "var(--secondary-text)" }}>
                  {isRegistering ? "Already have an account?" : "Don't have an account?"}
                </span>{" "}
                <button
                  type="button"
                  className="text-btn"
                  style={{ fontWeight: "700", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontSize: "0.88rem" }}
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setEmail("");
                    setPassword("");
                    setName("");
                    setErrors({});
                    setAuthError("");
                  }}
                >
                  {isRegistering ? "Sign In" : "Create Account"}
                </button>
              </div>
            </form>

            <ForgotPasswordModal
              isOpen={showForgotPassword}
              onClose={() => setShowForgotPassword(false)}
            />
          </motion.div>
        </div>
      </div>
    </IntroCanvas>
  );
}