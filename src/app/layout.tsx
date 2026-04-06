import type { Metadata } from 'next'
import { Lora, Caveat } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CartProvider } from '@/components/CartProvider'
import MessengerFab from '@/components/MessengerFab'

const lora = Lora({ subsets: ['latin'], variable: '--font-lora' })
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat' })

export const metadata: Metadata = {
  title: 'Cravings Ko',
  description: 'A cozy local café offering handcrafted meals and desserts.',
  icons: {
    icon: '/uploads/logo-small.png',
    shortcut: '/uploads/logo-small.png',
    apple: '/uploads/logo-small.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${lora.variable} ${caveat.variable}`}>
        <CartProvider>
          <Navbar />
          <div className="page-content">{children}</div>
          <Footer />
          <MessengerFab />
        </CartProvider>
      </body>
    </html>
  )
}
