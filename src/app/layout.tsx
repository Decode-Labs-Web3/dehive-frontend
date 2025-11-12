import "./globals.css";
import type { Metadata } from "next";
import { defaultMetadata } from "@/seo.config";
import { Geist, Geist_Mono } from "next/font/google";
import { ReduxProvider } from "@/store/ReduxProvider";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...defaultMetadata,
  // Ensure Next sees metadataBase directly on the root metadata object
  metadataBase: new URL("https://dehive.decodenetwork.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
