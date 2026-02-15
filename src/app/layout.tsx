import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: "TasteRank — Record the taste of your travels",
    template: "%s — TasteRank",
  },
  description:
    "Rate and rank your travel food experiences together with friends.",
  openGraph: {
    type: "website",
    siteName: "TasteRank",
    title: "TasteRank — Record the taste of your travels",
    description:
      "Rate and rank your travel food experiences together with friends.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ec7f13",
};

// Inline script to prevent FOUC (flash of unstyled content) on dark mode
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={plusJakartaSans.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="font-display antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
