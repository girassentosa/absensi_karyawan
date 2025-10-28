import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'React.js + Node.js + ReactBits Project',
  description: 'Modern web application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

