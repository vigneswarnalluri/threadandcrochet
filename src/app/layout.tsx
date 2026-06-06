import Aside from '@/components/aside'
import '@/styles/tailwind.css'
import { Metadata } from 'next'
import { Playfair_Display, Montserrat } from 'next/font/google'
import GlobalClient from './GlobalClient'
import { StoreProvider } from '@/context/StoreContext'

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
})

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    template: '%s - Thread & Love',
    default: 'Thread & Love - Handmade Crochet Boutique',
  },
  description:
    'Thread & Love offers premium, beautifully handcrafted crochet wearables, cozy toys, home goods, and DIY kits made with organic cotton and love.',
  keywords: ['Crochet', 'Handmade', 'Amigurumi', 'DIY Kits', 'Wearables', 'Cozy Home Decor', 'Thread & Love'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${montserrat.variable} ${montserrat.className}`} suppressHydrationWarning>
      <body className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200" suppressHydrationWarning>
        <StoreProvider>
          <Aside.Provider>
            {children}

            {/* Client component: Toaster, ... */}
            <GlobalClient />

          </Aside.Provider>
        </StoreProvider>
      </body>
    </html>
  )
}

