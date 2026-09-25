import type { Metadata } from "next";
import { Noto_Sans_JP, JetBrains_Mono, RocknRoll_One } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const rocknrollOne = RocknRoll_One({
  variable: "--font-rocknroll-one",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Back Kick Gang / 裏キック団 公式サイト",
  description:
    "ふわっちを主に活動しているメンバーが Kick を盛り上げるために、全一団長が設立した配信者集団。",
  metadataBase: new URL("https://urakick.vercel.app"),
  openGraph: {
    title: "The Back Kick Gang / 裏キック団",
    description:
      "ふわっちを主に活動しているメンバーが Kick を盛り上げるために、全一団長が設立した配信者集団。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJp.variable} ${jetBrainsMono.variable} ${rocknrollOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
