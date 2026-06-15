"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";

type AuthView = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<AuthView>("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [signupName, setSignupName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("relique_admin_email");
    if (savedEmail) {
      setLoginEmail(savedEmail);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPass,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Invalid credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("relique_admin_email", loginEmail);

      // D-08: always redirect to /admin dashboard after login
      router.push("/admin");
      router.refresh();
    } catch {
      setError(
        "Cannot reach the server. Check your connection and that the dev server is running."
      );
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPass,
          username: signupName,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.error || "Failed to create account");
        setLoading(false);
        return;
      }

      localStorage.setItem("relique_admin_email", loginEmail);
      setNotice("Account created. You can sign in now.");
      setLoading(false);
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-0 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,85,255,0.5)]">
            <Lock className="text-white w-6 h-6" />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-border rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setView("login");
              setError("");
              setNotice("");
            }}
            className={`flex-1 text-sm font-medium rounded-md py-2 transition ${
              view === "login" ? "bg-primary text-white" : "text-gray-300 hover:text-white"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setView("signup");
              setError("");
              setNotice("");
            }}
            className={`flex-1 text-sm font-medium rounded-md py-2 transition ${
              view === "signup" ? "bg-primary text-white" : "text-gray-300 hover:text-white"
            }`}
          >
            Create account
          </button>
        </div>

        <form
          onSubmit={view === "login" ? handleLogin : handleSignup}
          className="space-y-6"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Relique Admin</h1>
            <p className="text-gray-400 text-sm mt-2">
              {view === "login"
                ? "Secure access to marketplace operations"
                : "Create an account with email and password"}
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              placeholder="admin@relique.co"
              disabled={loading}
              className="w-full bg-white/5 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary text-white placeholder:text-gray-500 disabled:opacity-50"
            />

            {view === "signup" && (
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
                placeholder="Username"
                disabled={loading}
                className="w-full bg-white/5 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary text-white placeholder:text-gray-500 disabled:opacity-50"
              />
            )}

            {(view === "login" || view === "signup") && (
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                required
                placeholder="••••••••"
                disabled={loading}
                className="w-full bg-white/5 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary text-white placeholder:text-gray-500 disabled:opacity-50"
              />
            )}

            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
            {notice && <div className="text-emerald-400 text-sm text-center">{notice}</div>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {loading
              ? view === "login"
                ? "Signing in..."
                : "Creating account..."
              : view === "login"
                ? "Continue"
                : "Create account"}{" "}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
