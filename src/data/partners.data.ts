/**
 * Partners Data
 * Hai nhóm: Who We Work With (carousel) và Our Trusted Suppliers (grid).
 * Chỉnh logoBg, logoZoom, overflow (carousel) tại đây.
 */

export interface Partner {
  id: string;
  name: string;
  logo: string;
  type?: string;
  /** Màu nền hình tròn (CSS). Dùng khi logo transparent, vd: "#1a1a1a", "#fff". */
  logoBg?: string;
  /** Zoom logo trong tròn (1 = 100%). Chỉnh nếu logo bị cận/ nhỏ quá. */
  logoZoom?: number;
  /** Carousel: overflow của ô tròn (visible cho logo vượt viền). */
  overflow?: "visible" | "hidden";
}

/** Who We Work With – dùng trong PartnerCarousel (marquee). */
export const WHO_WE_WORK_WITH_PARTNERS: Partner[] = [
  {
    id: "x-memorabilia",
    name: "X-Memorabilia",
    logo: "/partner/xmemorial.jpg",
    type: "Strategic Partner & Distributor",
    logoBg: "#0a0a0a",
    logoZoom: 1.3,
    overflow: "visible",
  },
  {
    id: "realmadrid-fanclub-vietnam",
    name: "Real Madrid Fanclub Vietnam",
    logo: "/partner/realmadrid-fanclubinvietnam.jpg",
    type: "Partner",
    logoBg: "#1a1a1a",
    logoZoom: 1.6,
    overflow: "hidden",
  },
  {
    id: "thechampsoriginals",
    name: "The Champs Originals",
    logo: "/partner/thechampsoriginals.jpg",
    type: "Memorabilia Partner",
    logoBg: "#1a1a1a",
    logoZoom: 1.4,
    overflow: "hidden",
  },
  {
    id: "stb",
    name: "St.B",
    logo: "/partner/stb-logo.svg",
    type: "Strategic Partner",
    logoBg: "#0a0a0a",
    logoZoom: 1.3,
    overflow: "hidden",
  },
  {
    id: "heroboxing",
    name: "Hero Boxing",
    logo: "/partner/heroboxing.jpg",
    type: "Partner",
    logoBg: "#1a1a1a",
    logoZoom: 1.4,
    overflow: "hidden",
  },
  {
    id: "trung-tam-day-boxing-ha-noi",
    name: "Trung Tâm Dạy Boxing Hà Nội",
    logo: "/partner/trung tâm dạy boxing hà nội.jpg",
    type: "Partner",
    logoBg: "#1a1a1a",
    logoZoom: 1.7,
    overflow: "hidden",
  },
  {
    id: "qpstudio",
    name: "QPSTUDIO",
    logo: "/partner/qpstudio.png",
    type: "Partner",
    logoBg: "#0a0a0a",
    logoZoom: 1.2,
    overflow: "hidden",
  },
];

/** Our Trusted Suppliers – dùng trong PartnerGridSection (grid). */
export const TRUSTED_SUPPLIERS_PARTNERS: Partner[] = [
  {
    id: "beckett",
    name: "Beckett",
    logo: "/partner/beckett-authetication-logo.png",
    type: "Partner",
    logoBg: "#fff",
    logoZoom: 1.1,
  },
  {
    id: "jsa",
    name: "JSA",
    logo: "/partner/JSA_logo.png",
    type: "Partner",
    logoBg: "#fff",
    logoZoom: 1,
  },
  {
    id: "psa",
    name: "PSA",
    logo: "/partner/psa card logo.jpg",
    type: "Partner",
    logoBg: "#1a1a1a",
    logoZoom: 1.4,
  },
  {
    id: "upper-deck",
    name: "Upper Deck",
    logo: "/partner/Upper_Deck_Logo.png",
    type: "Partner",
    logoBg: "#1a1a1a",
    logoZoom: 1.1,
  },
  {
    id: "X Memorabilia",
    name: "X Memorabilia",
    logo: "/partner/xmemorial.jpg",
    type: "Partner",
    logoBg: "#0a0a0a",
    logoZoom: 1.6,
    overflow: "hidden",
  },
];
