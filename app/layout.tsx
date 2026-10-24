import type { Metadata } from "next";
import { IM_Fell_English, IM_Fell_English_SC, Libre_Caslon_Text } from "next/font/google";
import { SheetProvider } from "@/components/Sheet";
import { VoiceProvider } from "@/components/Voice";
import "./globals.css";

const fell = IM_Fell_English({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-fell" });
const fellSc = IM_Fell_English_SC({ weight: "400", subsets: ["latin"], variable: "--font-fell-sc" });
const caslon = Libre_Caslon_Text({ weight: ["400", "700"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-caslon" });

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "The Mechanical Age", template: "%s · The Mechanical Age" },
  description: "A timeline of the British Industrial Revolution, 1760–1859, told as a social feed of verified quotations and clearly labelled reconstructions.",
  openGraph: { siteName: "The Mechanical Age", type: "website", locale: "en_GB" },
  twitter: { card: "summary" },
};

const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${fell.variable} ${fellSc.variable} ${caslon.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <VoiceProvider>
          <SheetProvider>
            <div className="wrap">{children}</div>
          </SheetProvider>
        </VoiceProvider>
      </body>
    </html>
  );
}
