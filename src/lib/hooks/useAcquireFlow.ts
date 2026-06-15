"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";
import {
  clearAcquireEmail,
  getAcquireEmail,
  setAcquireEmail,
} from "@/lib/domain/storage/marketplace";
import type {
  AcquireInquiryResponse,
  AcquireInterest,
  AcquirePhase,
} from "@/lib/marketplace/acquireTypes";
import { getListingTitle } from "@/lib/utils/marketplace";
import { validateEmail } from "@/lib/validation";

async function fetchInterests(email: string): Promise<AcquireInterest[]> {
  const res = await fetch(
    `/api/public/marketplace/inquiry?email=${encodeURIComponent(email.trim().toLowerCase())}`,
    { credentials: "include" }
  );
  if (!res.ok) return [];
  const json = (await res.json()) as { interests?: AcquireInterest[] };
  return json.interests ?? [];
}

async function submitInquiry(
  listing: MarketplaceListing,
  email: string
): Promise<AcquireInquiryResponse> {
  const res = await fetch("/api/public/marketplace/inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      listing_id: listing.id,
      listing_slug: listing.slug,
      listing_title: getListingTitle(listing),
      website: "",
    }),
  });

  const json = (await res.json()) as AcquireInquiryResponse & { error?: string };
  if (!res.ok) {
    throw new Error(json.error ?? "Failed to submit inquiry");
  }
  return json;
}

export function useAcquireFlow(listing: MarketplaceListing) {
  const emailRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<AcquirePhase>("idle");
  const [email, setEmail] = useState("");
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [interests, setInterests] = useState<AcquireInterest[]>([]);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [lastSubmittedListingId, setLastSubmittedListingId] = useState<string | null>(null);

  const hydrateFromStorage = useCallback(async () => {
    const saved = getAcquireEmail();
    if (!saved || validateEmail(saved)) {
      setStoredEmail(null);
      setPhase("idle");
      return;
    }

    setStoredEmail(saved);
    setEmail(saved);
    setPhase("ready");
    const rows = await fetchInterests(saved);
    setInterests(rows);
  }, []);

  useEffect(() => {
    void hydrateFromStorage();
  }, [hydrateFromStorage]);

  const openForm = useCallback(() => {
    setPhase("form");
    setSubmitError(null);
    requestAnimationFrame(() => emailRef.current?.focus());
  }, []);

  const handleChangeEmail = useCallback(() => {
    clearAcquireEmail();
    setStoredEmail(null);
    setPhase("form");
    setSubmitError(null);
    requestAnimationFrame(() => emailRef.current?.focus());
  }, []);

  const handleAcquireAnother = useCallback(() => {
    setAlreadyRegistered(false);
    setLastSubmittedListingId(null);
    setSubmitError(null);
    if (storedEmail) {
      setPhase("ready");
    } else {
      setPhase("idle");
    }
  }, [storedEmail]);

  const submitWithEmail = useCallback(
    async (value: string) => {
      const validationError = validateEmail(value.trim());
      if (validationError) {
        setEmailError(validationError);
        return;
      }

      setEmailError(undefined);
      setSubmitError(null);
      setPhase("submitting");

      try {
        const result = await submitInquiry(listing, value.trim());
        const normalized = value.trim().toLowerCase();
        setAcquireEmail(normalized);
        setStoredEmail(normalized);
        setEmail(normalized);
        setInterests(result.interests);
        setAlreadyRegistered(result.already_registered);
        setLastSubmittedListingId(listing.id);
        setPhase("success");
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Failed to submit inquiry");
        setPhase(storedEmail ? "ready" : "form");
      }
    },
    [listing, storedEmail]
  );

  const handlePrimaryClick = useCallback(async () => {
    if (phase === "idle") {
      openForm();
      return;
    }

    if (phase === "ready" && storedEmail) {
      await submitWithEmail(storedEmail);
      return;
    }

    if (phase === "form") {
      await submitWithEmail(email);
    }
  }, [email, openForm, phase, storedEmail, submitWithEmail]);

  return {
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
    openForm,
  };
}
