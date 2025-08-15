import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "../store/StoreProvider"; // আমাদের তৈরি করা প্রোভাইডার
import Header from "@/components/Header";
import AuthWrapper from "@/components/AuthWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Collaborative Project Manager",
  description: "Built with Next.js and NestJS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <AuthWrapper>
          <Header/>
            {children}
          </AuthWrapper>
        </StoreProvider>
      </body>
    </html>
  );
}