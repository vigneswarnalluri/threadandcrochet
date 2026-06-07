import Aside from '@/components/aside'
import '@/styles/tailwind.css'
import { Metadata, Viewport } from 'next'
import { Playfair_Display, Montserrat } from 'next/font/google'
import GlobalClient from './GlobalClient'
import { StoreProvider } from '@/context/StoreContext'

import NextTopLoader from 'nextjs-toploader'

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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    template: '%s - Thread & Crochet',
    default: 'Thread & Crochet - Handmade Crochet Boutique',
  },
  description:
    'Thread & Crochet offers premium, beautifully handcrafted crochet wearables, cozy toys, home goods, and DIY kits made with organic cotton and love.',
  keywords: ['Crochet', 'Handmade', 'Amigurumi', 'DIY Kits', 'Wearables', 'Cozy Home Decor', 'Thread & Crochet'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${montserrat.variable} ${montserrat.className}`} suppressHydrationWarning>
      <body className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200" suppressHydrationWarning>
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const originalError = console.error;
                  console.error = function(...args) {
                    const msg = args[0] && typeof args[0] === 'string' ? args[0] : '';
                    if (
                      msg.includes('hydration') || 
                      msg.includes('Hydration') || 
                      msg.includes('bis_skin_checked') || 
                      msg.includes('did not match') ||
                      msg.includes('attribute')
                    ) {
                      return;
                    }
                    originalError.apply(console, args);
                  };
                  window.addEventListener('error', function(e) {
                    if (e.message && (e.message.includes('hydration') || e.message.includes('Hydration') || e.message.includes('bis_skin_checked'))) {
                      e.stopImmediatePropagation();
                      e.preventDefault();
                    }
                  }, true);
                })();
              `
            }}
          />
        )}
        <NextTopLoader
          color="#c07c65"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #c07c65,0 0 5px #c07c65"
        />
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

