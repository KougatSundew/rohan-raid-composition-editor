import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'TBC Raid Comp Editor',
  description: 'World of Warcraft Classic: The Burning Crusade raid composition and buff calculator',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`font-sans antialiased overflow-x-hidden w-full`}>
        <div className="min-h-screen flex flex-col w-full">
          <main className="flex-1 w-full">
            {children}
          </main>
          <footer className="py-6 text-center text-sm text-muted-foreground border-t w-full">
            <p>© {new Date().getFullYear()} KougatSundew. All rights reserved.</p>
          </footer>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
