import type { Metadata } from "next"
import { Heebo } from "next/font/google"
import { Providers } from "@/providers"
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
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans min-h-screen pb-20 md:pb-0">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
