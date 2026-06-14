import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-work-sans",
  display: "swap",
});

const zapfRenaissance = localFont({
  src: "../fonts/Zapf Renaissance Book.ttf",
  variable: "--font-zapf-renaissance",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://relique.ch"),
  title: {
    default: "Relique - Relics you can rely on",
    template: "%s | Relique",
  },
  description: "Relics you can rely on",
  keywords: [
    "collectibles",
    "authentication",
    "memorabilia",
    "verification",
    "probabilistic authentication",
    "sports memorabilia",
    "certificate of authenticity",
    "COA",
    "collectibles marketplace",
    "authenticated collectibles",
    "sports collectibles",
    "autograph authentication",
  ],
  authors: [{ name: "Relique" }],
  creator: "Relique",
  publisher: "Relique",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/og-logo.png", sizes: "any" },
      { url: "/og-logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/og-logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Relique",
    title: "Relique - Relics you can rely on",
    description: "Relics you can rely on",
    images: [
      {
        url: "/og-logo.png",
        width: 1200,
        height: 1200,
        alt: "Relique - Relics you can rely on",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@relique",
    creator: "@relique",
    title: "Relique - Relics you can rely on",
    description: "Probabilistic authentication for collectibles and memorabilia. Verify, authenticate, and consign your collectibles with confidence.",
    images: ["/og-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  category: "marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || "https://relique.ch"} />
      </head>
      <body className={`${workSans.variable} ${zapfRenaissance.variable} font-work-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
