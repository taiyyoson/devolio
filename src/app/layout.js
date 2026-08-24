import { Geist, JetBrains_Mono, Newsreader, Ramaraja } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

const ramaraja = Ramaraja({
  variable: "--font-ramaraja",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  icons: {
    icon: "/favicon.svg",
  },
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"){document.documentElement.classList.add("dark")}}catch(e){document.documentElement.classList.add("dark")}})()`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${jetbrainsMono.variable} ${newsreader.variable} ${ramaraja.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
