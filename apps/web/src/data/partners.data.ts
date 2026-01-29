/**
 * Partners Data
 * Institutional network / ecosystem backbone showcase.
 */

export interface Partner {
  id: string;
  name: string;
  logo: string;
  type: string;
  /** CSS color for circle background; match logo background to avoid visible square in circle. */
  logoBg: string;
  /** Zoom level for logo inside circle (default 1). e.g. 0.8 smaller, 1.2 larger. */
  logoZoom?: number;
  /** Circle overflow: visible allows zoomed logo to extend beyond circle. */
  overflow?: "visible" | "hidden";
}

export const PARTNERS: Partner[] = [
  {
    id: "x-memorabilia",
    name: "X-Memorabilia",
    logo: "/partner/x-memorabilia-logo.png",
    type: "Strategic Partner & Distributor",
    logoBg: "#0a0a0a",
    logoZoom: 1.1,
    overflow: "visible",
  },
  {
    id: "realmadrid-fanclub-vietnam",
    name: "Real Madrid Fanclub Vietnam",
    logo: "/partner/realmadrid-fanclubinvietnam.jpg",
    type: "Partner",
    logoZoom: 1.7,
    overflow: "hidden",
    logoBg: "#1a1a1a",
  },
  {
    id: "thechampsoriginals",
    name: "The Champs Originals",
    logo: "/partner/thechampsoriginals.jpg",
    type: "Memorabilia Partner",
    logoZoom: 1.7,
    overflow: "hidden",
    logoBg: "#1a1a1a",
  },
  {
    id: "stb",
    name: "St.B",
    logo: "/partner/stb-logo.svg",
    type: "Strategic Partner",
    logoZoom: 1.5,
    overflow: "hidden",
    logoBg: "#0a0a0a",
  },
  {
    id: "heroboxing",
    name: "Hero Boxing",
    logo: "/partner/heroboxing.jpg",
    type: "Partner",
    logoZoom: 1.7,
    overflow: "hidden",
    logoBg: "#1a1a1a",
  },
  {
    id: "trung-tam-day-boxing-ha-noi",
    name: "Trung Tâm Dạy Boxing Hà Nội",
    logo: "/partner/trung tâm dạy boxing hà nội.jpg",
    type: "Partner",
    logoZoom: 1.7,
    overflow: "hidden",
    logoBg: "#1a1a1a",
  },
];
