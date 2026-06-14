import { Suspense } from "react";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { CompareProvider, CompareDrawer } from "@/components/interactive/CompareDrawer";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CompareProvider>
      <CurrencyProvider>
        <div className="flex min-h-screen flex-col">
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <CompareDrawer />
        <SpeedInsights />
      </CurrencyProvider>
    </CompareProvider>
  );
}
