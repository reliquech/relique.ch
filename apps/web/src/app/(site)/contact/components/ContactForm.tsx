"use client";

import { useState } from "react";

/**
 * Contact form component with form submission logic
 * Reusable form that can be placed anywhere
 */
export function ContactForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Integrate with contact service if available
    setTimeout(() => {
      setLoading(false);
      alert("Message sent! We'll respond within 24 hours.");
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="text"
        placeholder="NAME"
        required
        className="w-full bg-cardDark border border-white/10 p-4 focus:border-highlightIce outline-none text-xs font-bold uppercase tracking-widest text-white placeholder:text-textSec"
      />
      <input
        type="email"
        placeholder="EMAIL"
        required
        className="w-full bg-cardDark border border-white/10 p-4 focus:border-highlightIce outline-none text-xs font-bold uppercase tracking-widest text-white placeholder:text-textSec"
      />
      <textarea
        placeholder="MESSAGE"
        required
        className="w-full bg-cardDark border border-white/10 p-4 h-40 focus:border-highlightIce outline-none text-xs font-bold uppercase tracking-widest text-white placeholder:text-textSec resize-none"
      />
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
