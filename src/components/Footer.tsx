import Logo from '@/components/Logo'
import { CustomLink } from '@/data/types'
import SocialsList1 from '@/shared/SocialsList1/SocialsList1'
import React from 'react'

interface WidgetFooterMenu {
  id: string
  title: string
  menus: CustomLink[]
}

const widgetMenus: WidgetFooterMenu[] = [
  {
    id: '1',
    title: 'Shop Boutique',
    menus: [
      { href: '/collections/t-shirts', label: 'Amigurumi Toys' },
      { href: '/collections/jackets', label: 'Cozy Wearables' },
      { href: '/collections/jeans', label: 'Bags & Purses' },
      { href: '/collections/coats', label: 'Home & Living' },
    ],
  },
  {
    id: '2',
    title: 'Artisanal Story',
    menus: [
      { href: '/about', label: 'Our Story' },
      { href: '/blog', label: 'Crafting Blog' },
      { href: '/about', label: 'Independent Artisans' },
      { href: '/about', label: 'Sustainability' },
    ],
  },
  {
    id: '3',
    title: 'Support & Care',
    menus: [
      { href: '/blog/how-to-wear-your-eid-pieces-all-year-long', label: 'Crochet Care Guide' },
      { href: '/contact', label: 'Shipping & Returns' },
      { href: '/contact', label: 'Custom Orders' },
      { href: '/contact', label: 'FAQs' },
    ],
  },
  {
    id: '4',
    title: 'Join Community',
    menus: [
      { href: '/contact', label: 'Instagram Showcase' },
      { href: '/collections/shoes', label: 'DIY Crochet Patterns' },
      { href: '/contact', label: 'Pattern Support' },
      { href: '/about', label: 'Gift Cards' },
    ],
  },
]

const Footer: React.FC = () => {
  const renderWidgetMenuItem = (menu: WidgetFooterMenu, index: number) => {
    return (
      <div key={index} className="text-sm">
        <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">{menu.title}</h2>
        <ul className="mt-5 space-y-4">
          {menu.menus.map((item, index) => (
            <li key={index}>
              <a
                key={index}
                className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="relative border-t py-20 lg:pt-28 lg:pb-24">
      <div className="container grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10">
        <div className="col-span-2 grid grid-cols-4 gap-5 md:col-span-4 lg:flex lg:flex-col lg:md:col-span-1">
          <div className="col-span-2 md:col-span-1">
            <Logo />
          </div>
          <div className="col-span-2 flex items-center md:col-span-3">
            <SocialsList1 />
          </div>
        </div>
        {widgetMenus.map(renderWidgetMenuItem)}
      </div>
    </div>
  )
}

export default Footer
