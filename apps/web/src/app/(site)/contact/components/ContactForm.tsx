"use client";

import { useState } from "react";

/**
 * Contact form component with form submission logic
 * Reusable form that can be placed anywhere
 */
export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          website: "",
        }),
      });

      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to send message");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-4 p-8 border border-primaryBlue/30 bg-cardDark">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-primaryBlue">
          Message Sent
        </p>
        <p className="text-sm text-white">
          Thank you for contacting Relique. We received your message and will respond within 24
          hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />
      <input
        type="text"
        placeholder="NAME"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-cardDark border border-white/10 p-4 focus:border-highlightIce outline-none text-xs font-bold uppercase tracking-widest text-white placeholder:text-textSec"
      />
      <input
        type="email"
        placeholder="EMAIL"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-cardDark border border-white/10 p-4 focus:border-highlightIce outline-none text-xs font-bold uppercase tracking-widest text-white placeholder:text-textSec"
      />
      <textarea
        placeholder="MESSAGE"
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full bg-cardDark border border-white/10 p-4 h-40 focus:border-highlightIce outline-none text-xs font-bold uppercase tracking-widest text-white placeholder:text-textSec resize-none"
      />
      {error && (
        <p className="text-xs font-bold uppercase tracking-widest text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 bg-primaryBlue text-white font-black uppercase tracking-[0.3em] hover:bg-accentBlue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
