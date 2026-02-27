import type { Metadata } from "next"
import { Heebo } from "next/font/google"
import { Navbar } from "@/components/layout/navbar"
import "./globals.css"

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
})

export const metadata: Metadata = {
  title: "חתונה שלנו - ניהול חתונה",
  description: "אפליקציה לניהול חתונה - אורחים, תקציב וספקים",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-sans min-h-screen pb-20 md:pb-0">
        <Navbar />
        <main className="container mx-auto px-4 py-6 max-w-5xl">
          {children}
        </main>
      </body>
    </html>
  )
}
