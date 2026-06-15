import type { MarketplaceListing } from "@/lib/schemas/marketplace";
import {
  formatOptionLabel,
  formatSizeLabel,
  humanizeToken,
  isMeaningfulDetailValue,
} from "@/lib/utils/marketplaceLabels";

export interface DetailSpecRow {
  label: string;
  value: string;
}

function pushRow(rows: DetailSpecRow[], label: string, value: unknown) {
  if (!isMeaningfulDetailValue(value)) return;
  rows.push({ label, value: String(value) });
}

export function buildJerseySpecRows(listing: MarketplaceListing): DetailSpecRow[] {
  const jersey = listing.jersey;
  if (!jersey) return [];

  const rows: DetailSpecRow[] = [];
  pushRow(rows, "Sport", jersey.sport ? humanizeToken(jersey.sport) : undefined);
  pushRow(rows, "Season", jersey.season);
  pushRow(rows, "Kit", jersey.kit ? humanizeToken(jersey.kit) : undefined);
  pushRow(rows, "Edition", jersey.edition ? humanizeToken(jersey.edition) : undefined);
  pushRow(rows, "Brand", formatOptionLabel(jersey.brand));
  pushRow(rows, "Size", formatSizeLabel(jersey.size));
  pushRow(rows, "Style code", jersey.style_code);
  return rows;
}

export function buildSigningSpecRows(listing: MarketplaceListing): DetailSpecRow[] {
  const signing = listing.signing;
  if (!signing) return [];

  const rows: DetailSpecRow[] = [];
  if (signing.signers?.length) {
    rows.push({
      label: signing.signers.length > 1 ? "Signers" : "Signed by",
      value: signing.signers.join(", "),
    });
  }
  pushRow(rows, "Signature type", signing.type ? humanizeToken(signing.type) : undefined);
  pushRow(rows, "Signature count", signing.count > 0 ? String(signing.count) : undefined);
  pushRow(rows, "Ink", formatOptionLabel(signing.ink));
  pushRow(rows, "Placement", formatOptionLabel(signing.placement));
  pushRow(rows, "Inscription", signing.inscription_text);
  pushRow(
    rows,
    "Signature condition",
    signing.sig_condition && signing.sig_condition !== "unknown"
      ? `Grade ${signing.sig_condition}`
      : undefined
  );
  return rows;
}

export function buildConditionSpecRows(listing: MarketplaceListing): DetailSpecRow[] {
  const condition = listing.condition;
  if (!condition) return [];

  const rows: DetailSpecRow[] = [];
  pushRow(
    rows,
    "Overall grade",
    condition.grade && condition.grade !== "unknown" ? `Grade ${condition.grade}` : undefined
  );
  pushRow(rows, "Wear", condition.wear ? humanizeToken(condition.wear) : undefined);
  pushRow(rows, "Condition notes", condition.notes);
  return rows;
}

export function buildProvenanceSpecRows(listing: MarketplaceListing): DetailSpecRow[] {
  const auth = listing.auth;
  const rows: DetailSpecRow[] = [];

  pushRow(rows, "Authentication", auth?.status ? humanizeToken(auth.status) : undefined);
  pushRow(rows, "Verified by", auth?.provider_id);
  pushRow(rows, "Archive SKU", listing.sku);
  pushRow(rows, "Listing ID", listing.id);

  if (auth?.coa_refs?.length) {
    rows.push({
      label: auth.coa_refs.length > 1 ? "Certificate references" : "Certificate reference",
      value: auth.coa_refs.join(" · "),
    });
  }

  const publishedAt = listing.state?.publish_at ?? listing.state?.updated_at;
  if (publishedAt) {
    const formatted = new Date(publishedAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    pushRow(rows, "Catalogued", formatted);
  }

  return rows;
}

export function buildQuickFacts(listing: MarketplaceListing): DetailSpecRow[] {
  const facts: DetailSpecRow[] = [];
  const signers = listing.signing?.signers?.filter(Boolean) ?? [];
  if (signers.length) {
    facts.push({
      label: "Signed by",
      value: signers.join(", "),
    });
  }

  const grade = listing.condition?.grade;
  if (grade && grade !== "unknown") {
    facts.push({ label: "Grade", value: grade });
  } else if (listing.condition?.wear) {
    facts.push({ label: "Wear", value: humanizeToken(listing.condition.wear) });
  }

  const size = formatSizeLabel(listing.jersey?.size);
  if (size) facts.push({ label: "Size", value: size });

  const edition = listing.jersey?.edition;
  if (edition && edition !== "replica") {
    facts.push({ label: "Edition", value: humanizeToken(edition) });
  }

  if (listing.auth?.status && listing.auth.status !== "none") {
    facts.push({ label: "Auth", value: humanizeToken(listing.auth.status) });
  }

  return facts;
}

export function getListingDescriptions(listing: MarketplaceListing): {
  subtitle?: string;
  short?: string;
} {
  const subtitle = listing.listing?.subtitle?.trim() || undefined;
  const short = listing.listing?.short?.trim() || undefined;
  return { subtitle, short };
}
