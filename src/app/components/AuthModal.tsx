import { useState } from "react";
import { X, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";
import { motion, AnimatePresence } from "motion/react";

export function AuthModal() {
  const {
    isAuthModalOpen,
    authMode,
    setAuthMode,
    closeAuthModal,
    login,
    signup,
    loginWithGoogle,
    resetPassword,
    authError,
    setAuthError,
  } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (authMode === "login") {
        await login(formData.email, formData.password);
      } else if (authMode === "signup") {
        await signup(formData.name, formData.email, formData.password);
      } else if (authMode === "forgot") {
        await resetPassword(formData.email);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (authError) setAuthError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* Subtle Decorative Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Subtitle */}
        <div className="mb-6">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">
            {authMode === "login" && "Welcome Back"}
            {authMode === "signup" && "Create an Account"}
            {authMode === "forgot" && "Reset Password"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {authMode === "login" && "Sign in to access your orders, wishlist, and cart."}
            {authMode === "signup" && "Join our luxury studio to experience personalized shopping."}
            {authMode === "forgot" && "Enter your email address and we will send a password reset link."}
          </p>
        </div>

        {/* In-place Error Notification */}
        <AnimatePresence>
          {authError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1">{authError}</div>
              <button
                type="button"
                onClick={() => setAuthError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google One-Click Sign In (Only in Login and Signup modes) */}
        {authMode !== "forgot" && (
          <div className="space-y-4 mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || submitting}
              className="w-full py-3.5 px-4 border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/80 text-gray-800 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider absolute">
                or continue with email
              </span>
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === "signup" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
                  placeholder="e.g. Sarah Connor"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {authMode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Password
                </label>
                {authMode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setAuthMode("forgot");
                    }}
                    className="text-xs text-gray-500 hover:text-black font-semibold transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || googleLoading}
            className="w-full mt-2 bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-black/10 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <>
                <span>
                  {authMode === "login" && "Sign In with Email"}
                  {authMode === "signup" && "Create My Account"}
                  {authMode === "forgot" && "Send Reset Link"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Modal Footer Switchers */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-600 space-y-2">
          {authMode === "login" && (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setAuthMode("signup");
                }}
                className="font-bold text-black hover:underline cursor-pointer ml-1"
              >
                Sign up for free
              </button>
            </p>
          )}

          {authMode === "signup" && (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setAuthMode("login");
                }}
                className="font-bold text-black hover:underline cursor-pointer ml-1"
              >
                Log in here
              </button>
            </p>
          )}

          {authMode === "forgot" && (
            <p>
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setAuthMode("login");
                }}
                className="font-bold text-black hover:underline cursor-pointer ml-1"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
