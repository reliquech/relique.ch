/**
 * Root route "/" — single page at app root so Next.js resolves / reliably
 * (route group (home)/page.tsx was returning 404 on dev/Turbopack).
 */
export { default, metadata } from "../(home)/HomeContent";
