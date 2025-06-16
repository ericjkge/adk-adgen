import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Adgen',
  description: 'Google ADK Hackathon',
  generator: 'Vishnu and Eric',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
