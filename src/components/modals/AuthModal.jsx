import React from "react";
import { Mail, UserPlus, LogOut } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import XCircleButton from "../common/XCircleButton";

const AuthModal = ({
  onClose,
  isRegistering,
  setIsRegistering,
  email,
  setEmail,
  password,
  setPassword,
  authError,
  handleAuthSubmit,
  handleGoogleSignIn,
  userId,
  userName,
  handleLogout,
  setAuthError,
}) => {
  const { themeClasses } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    setAuthError(""); // Clear previous errors
    handleAuthSubmit();
  };

  if (userId) {
    // User is logged in, show logout/profile view
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div
          className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-sm ${themeClasses.shadow} relative text-center`}
        >
          <XCircleButton onClick={onClose} />
          <h3 className={`text-2xl font-bold mb-4 ${themeClasses.primaryText}`}>
            Welcome, {userName}!
          </h3>
          <p className={`${themeClasses.secondaryText} mb-6`}>
            You are currently logged in.
          </p>
          <button
            onClick={handleLogout}
            className={`w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-semibold ${themeClasses.primaryText} flex items-center justify-center space-x-2`}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-sm ${themeClasses.shadow} relative`}
      >
        <XCircleButton onClick={onClose} />
        <h3
          className={`text-2xl font-bold mb-6 text-center ${themeClasses.primaryText}`}
        >
          {isRegistering ? "Register" : "Login"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium ${themeClasses.secondaryText} mb-1`}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`w-full p-3 ${themeClasses.tertiaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className={`block text-sm font-medium ${themeClasses.secondaryText} mb-1`}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className={`w-full p-3 ${themeClasses.tertiaryBg} rounded-lg ${themeClasses.primaryText} placeholder-${themeClasses.secondaryText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {authError && (
            <p className="text-red-400 text-sm text-center">{authError}</p>
          )}
          <button
            type="submit"
            className={`w-full px-6 py-3 ${themeClasses.accentBg} ${themeClasses.accentHover} rounded-lg transition-colors font-semibold ${themeClasses.primaryText} flex items-center justify-center space-x-2`}
          >
            {isRegistering ? (
              <>
                <UserPlus className="w-5 h-5" /> <span>Register</span>
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" /> <span>Login</span>
              </>
            )}
          </button>
        </form>
        <div className="flex items-center my-4">
          <div className={`flex-grow border-t ${themeClasses.border}`}></div>
          <span className={`mx-4 text-sm ${themeClasses.secondaryText}`}>
            OR
          </span>
          <div className={`flex-grow border-t ${themeClasses.border}`}></div>
        </div>
        <button
          onClick={handleGoogleSignIn}
          className={`w-full px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg transition-colors font-semibold ${themeClasses.primaryText} flex items-center justify-center space-x-2`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.36 12.01c0-.7-.06-1.37-.18-2.02h-9.18v3.66h5.36c-.23 1.16-.91 2.14-1.92 2.82v2.37h3.04c1.78-1.64 2.81-4.06 2.81-6.83z"
            />
            <path
              fill="currentColor"
              d="M12 21.36c3.15 0 5.8-1.04 7.73-2.82l-3.04-2.37c-1.12.75-2.57 1.19-4.69 1.19-3.6 0-6.66-2.43-7.74-5.7H.91v2.46c2.05 3.99 6.27 6.64 11.09 6.64z"
            />
            <path
              fill="currentColor"
              d="M4.26 14.36c-.22-.66-.35-1.35-.35-2.05s.13-1.39.35-2.05V7.86H.91c-.69 1.34-.9 2.91-.9 4.14s.21 2.8.9 4.14L4.26 14.36z"
            />
            <path
              fill="currentColor"
              d="M12 4.64c2.04 0 3.82.72 5.25 2.05l2.7-2.7C17.8 2.08 15.15 1 12 1 7.27 1 3.05 3.65.91 7.64l3.35 2.59c1.08-3.27 4.14-5.7 7.74-5.7z"
            />
          </svg>
          <span>Sign In with Google</span>
        </button>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className={`w-full text-center mt-4 text-sm ${themeClasses.accent} hover:underline`}
        >
          {isRegistering
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
