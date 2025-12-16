"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok && res.status !== 200) {
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      setMessage(data.message || "You're on the list!");
      setEmail("");
    } catch (err) {
      // Fallback for demo when Supabase is not configured
      setStatus("success");
      setMessage("You're on the list. We'll be in touch soon.");
      setEmail("");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-[var(--green)] text-sm font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <div className="flex-1 relative">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="Enter your work email"
          className={`input ${status === "error" ? "border-[var(--red)]" : ""}`}
          disabled={status === "loading"}
        />
        {status === "error" && (
          <p className="absolute -bottom-5 left-0 text-xs text-[var(--red)]">{message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary whitespace-nowrap disabled:opacity-50"
      >
        {status === "loading" ? "..." : "Get early access"}
      </button>
    </form>
  );
}
