"use client";

import Link from "next/link";
import { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";
import { AcquireInterestsList } from "@/components/app/marketplace-detail/AcquireInterestsList";
import { useAcquireFlow } from "@/lib/hooks/useAcquireFlow";

interface DetailAcquireFlowProps {
  listing: MarketplaceListing;
  /** Primary CTA label (default: Acquire piece) */
  primaryLabel?: string;
}

const primaryButtonClass =
  "w-full bg-primaryBlue hover:bg-accentBlue disabled:opacity-60 disabled:pointer-events-none text-white font-black uppercase tracking-[0.4em] py-5 text-xs transition-all duration-300 diagonal-clip shadow-[0_0_40px_rgba(28,77,141,0.2)] text-center min-h-[52px]";

/** Two-step acquire CTA with persisted email and interest tracking. */
export function DetailAcquireFlow({
  listing,
  primaryLabel = "Acquire piece",
}: DetailAcquireFlowProps) {
  const reduceMotion = useReducedMotion();
  const emailId = useId();
  const errorId = useId();
  const liveId = useId();

  const {
    phase,
    email,
    setEmail,
    storedEmail,
    emailError,
    setEmailError,
    submitError,
    interests,
    alreadyRegistered,
    lastSubmittedListingId,
    emailRef,
    handlePrimaryClick,
    handleChangeEmail,
    handleAcquireAnother,
  } = useAcquireFlow(listing);

  if (phase === "success") {
    return (
      <div className="space-y-4" id={liveId}>
        <div
          className="border border-primaryBlue/30 bg-primaryBlue/10 p-6 space-y-3"
          role="status"
          aria-live="polite"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-highlightIce">
            Request received
          </p>
          <p className="text-sm text-white/90 leading-relaxed">
            {alreadyRegistered ? (
              <>You&apos;re already on the list for this piece.</>
            ) : (
              <>
                Your acquisition request has been received. Our team will contact you at{" "}
                <span className="font-semibold text-white">{storedEmail ?? email}</span> within 24
                hours.
              </>
            )}
          </p>
        </div>

        {interests.length > 0 ? (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/45 mb-1">
              Your acquisition list
            </p>
            <AcquireInterestsList
              interests={interests}
              highlightListingId={lastSubmittedListingId}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-2 pt-2">
          <button type="button" onClick={handleAcquireAnother} className={primaryButtonClass}>
            {primaryLabel}
          </button>
          <Link
            href="/marketplace"
            className="block w-full border border-white/10 text-center py-4 text-[10px] font-black uppercase tracking-[0.35em] text-white/50 hover:text-white hover:border-white/25 transition-colors"
          >
            Browse marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {phase === "ready" && storedEmail ? (
        <div className="border border-white/10 bg-white/[0.03] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 mb-1">
              Continuing as
            </p>
            <p className="text-sm font-semibold text-white/90 break-all">{storedEmail}</p>
          </div>
          <button
            type="button"
            onClick={handleChangeEmail}
            className="text-[9px] font-black uppercase tracking-[0.2em] text-accentBlue hover:text-highlightIce transition-colors"
          >
            Change email
          </button>
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        {phase === "form" || phase === "submitting" ? (
          <motion.div
            key="acquire-form"
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-3 space-y-2">
              <label
                htmlFor={emailId}
                className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/50"
              >
                Your email
              </label>
              <input
                ref={emailRef}
                id={emailId}
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(undefined);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handlePrimaryClick();
                  }
                }}
                disabled={phase === "submitting"}
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? errorId : undefined}
                placeholder="you@example.com"
                className="w-full bg-bgDark border border-white/10 p-4 focus:border-accentBlue outline-none text-sm font-medium text-white placeholder:text-white/35 min-h-[48px] disabled:opacity-60"
              />
              {emailError ? (
                <p id={errorId} className="text-xs text-destructive" role="alert">
                  {emailError}
                </p>
              ) : (
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Enter your email to request acquisition details for this piece.
                </p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {interests.length > 0 && phase !== "submitting" ? (
        <div className="border-t border-white/10 pt-4">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 mb-2">
            Previously requested ({interests.length})
          </p>
          <AcquireInterestsList interests={interests} />
        </div>
      ) : null}

      {submitError ? (
        <p className="text-xs text-destructive" role="alert" aria-live="polite">
          {submitError}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void handlePrimaryClick()}
        disabled={phase === "submitting"}
        className={primaryButtonClass}
      >
        {phase === "submitting" ? "Submitting…" : primaryLabel}
      </button>
    </div>
  );
}
