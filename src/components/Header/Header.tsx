import Logo from '@/components/Logo'
import { getCollections } from '@/data/data'
import { getCurrencies, getHeaderDropdownCategories, getLanguages, getNavMegaMenu } from '@/data/navigation'
import clsx from 'clsx'
import { FC } from 'react'
import AvatarDropdown from './AvatarDropdown'
import CartBtn from './CartBtn'
import WishlistBtn from './WishlistBtn'
import CategoriesDropdown from './CategoriesDropdown'
import CurrLangDropdown from './CurrLangDropdown'
import HamburgerBtnMenu from './HamburgerBtnMenu'
import MegaMenuPopover from './MegaMenuPopover'
import SearchBtnPopover from './SearchBtnPopover'
export interface HeaderProps {
  hasBorderBottom?: boolean
}

const Header: FC<HeaderProps> = async ({ hasBorderBottom = true }) => {
  const [megamenu, dropdownCategories, currencies, languages, collections] = await Promise.all([
    getNavMegaMenu(),
    getHeaderDropdownCategories(),
    getCurrencies(),
    getLanguages(),
    getCollections(),
  ])
  const featuredCollections = collections.slice(7, 11)

  return (
    <div className="relative z-10">
      <div className="container">
        <div
          className={clsx(
            'flex h-20 justify-between gap-x-2.5 border-neutral-200 dark:border-neutral-700',
            hasBorderBottom && 'border-b',
            !hasBorderBottom && 'has-[.header-popover-full-panel]:border-b'
          )}
        >
          <div className="flex grow md:flex-none items-center justify-start gap-x-2 sm:gap-x-8">
            <div className="block lg:hidden">
              <HamburgerBtnMenu />
            </div>
            <Logo />
            <div className="hidden h-9 border-l border-neutral-200 md:block dark:border-neutral-700"></div>
            <CategoriesDropdown categories={dropdownCategories} className="hidden md:block" />
          </div>

          <div className="flex shrink-0 md:flex-1 items-center justify-end gap-x-1.5 sm:gap-x-3 md:gap-x-5">
            <MegaMenuPopover megamenu={megamenu} featuredCollection={featuredCollections[0]} />
            <CurrLangDropdown currencies={currencies} languages={languages} className="hidden md:block" />
            <SearchBtnPopover />
            <WishlistBtn />
            <AvatarDropdown />
            <CartBtn />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
