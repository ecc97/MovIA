import type { Metadata, Viewport } from "next";
import { DM_Sans, Sora } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-sora-loaded",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans-loaded",
  display: "swap",
});

const themeInit = `(function(){try{var t=localStorage.getItem('movia-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export const metadata: Metadata = {
  title: "MOVIA - Encuentra tu próximo vehículo",
  description:
    "Concesionario multimarca ficticio. Autos, SUV y camionetas nuevos y usados en pesos colombianos. Consulta sin registro.",
  keywords: ["concesionario", "autos", "SUV", "camionetas", "vehículos", "Colombia", "COP"],
  authors: [{ name: "MOVIA" }],
  openGraph: {
    title: "MOVIA - Encuentra tu próximo vehículo",
    description: "Concesionario multimarca ficticio. Autos, SUV y camionetas nuevos y usados.",
    type: "website",
  },
  icons: [
    {
      rel: "icon",
      url: "/img/icons/favicon.ico",
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#101418",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${sora.variable} ${dmSans.variable}`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="flex min-h-screen flex-col bg-background font-dm-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
