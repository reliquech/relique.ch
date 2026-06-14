import { storage } from "./storage";
import type { Session } from "./storage";

export function generateUsername(email: string, provider?: string): string {
  if (provider) {
    return provider.charAt(0).toUpperCase() + provider.slice(1) + " User";
  }
  const username = email.split("@")[0] || "User";
  return username.charAt(0).toUpperCase() + username.slice(1);
}

export function createSession(
  email: string,
  loginMethod: "email" | "magic-link" | "social",
  provider?: string
): Session {
  return {
    userEmail: email,
    userName: generateUsername(email, provider),
    loginMethod,
    createdAt: new Date().toISOString(),
  };
}

export function login(email: string, loginMethod: "email" | "magic-link" | "social", provider?: string): Session {
  const session = createSession(email, loginMethod, provider);
  storage.session.set(session);
  return session;
}

export function logout(): void {
  storage.session.remove();
}

export function isAuthenticated(): boolean {
  return storage.session.get() !== null;
}

