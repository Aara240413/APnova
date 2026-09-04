import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://apnova.io"),
  title: "APnova — AI-Powered Peer Learning",
  description: "Match. Teach. Learn. Grow together with AI-powered skill exchange.",
  openGraph: {
    title: "APnova — AI-Powered Peer Learning",
    description: "Find your perfect swap partner, build collaborative learning roadmaps, and grow faster together.",
    images: ["/images/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col`}>
        <UserProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
