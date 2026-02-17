import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "devolio — Developer Portfolio",
    template: "%s — devolio",
  },
  description: "A terminal-style developer portfolio.",
  openGraph: {
    title: "devolio — Developer Portfolio",
    description: "A terminal-style developer portfolio.",
    type: "website",
    locale: "en_US",
  },
  metadataBase: new URL("https://taiyyoson.com"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
