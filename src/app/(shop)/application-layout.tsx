import Footer from '@/components/Footer'
import Header from '@/components/Header/Header'
import AsideProductQuickView from '@/components/aside-product-quickview'
import AsideSidebarCart from '@/components/aside-sidebar-cart'
import AsideSidebarNavigation from '@/components/aside-sidebar-navigation'
import 'rc-slider/assets/index.css'
import React, { ReactNode } from 'react'
import { createClient } from '@/utils/supabase/server'

interface ComponentProps {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
}

const ApplicationLayout: React.FC<ComponentProps> = async ({ children, header, footer }) => {
  let announcementText = 'Free shipping on all prepaid orders over ₹999!'
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'announcement')
      .single()
    if (data?.value) {
      announcementText = data.value
    }
  } catch (e) {
    console.warn('Failed to fetch announcement setting from database:', e)
  }

  return (
    <div>
      {/* Dynamic Announcement Bar */}
      <div className="bg-neutral-900 text-neutral-100 dark:bg-neutral-950 dark:text-neutral-200 py-2.5 px-4 text-center text-[11px] font-semibold uppercase tracking-widest border-b border-neutral-800 dark:border-neutral-900 transition-colors">
        <div className="container">
          <span>{announcementText}</span>
        </div>
      </div>

      {header ? header : <Header hasBorderBottom />}
      {children}
      {footer ? footer : <Footer />}

      {/* ASIDES */}
      <AsideSidebarNavigation />
      <AsideSidebarCart />
      <AsideProductQuickView />
    </div>
  )
}

export { ApplicationLayout }

