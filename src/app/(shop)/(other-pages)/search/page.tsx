import { Divider } from '@/components/Divider'
import HeaderFilterSection from '@/components/HeaderFilterSection'
import ProductCard from '@/components/ProductCard'
import SectionPromo1 from '@/components/SectionPromo1'
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct'
import { getProducts } from '@/data/data'
import ButtonCircle from '@/shared/Button/ButtonCircle'
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search page for products',
}

function getVisiblePages(currentPage: number, totalPages: number): (number | 'gap')[] {
  const visible: (number | 'gap')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      visible.push(i)
    }
    return visible
  }

  visible.push(1)

  let start = Math.max(2, currentPage - 1)
  let end = Math.min(totalPages - 1, currentPage + 1)

  if (currentPage <= 3) {
    end = 4
  } else if (currentPage >= totalPages - 2) {
    start = totalPages - 3
  }

  if (start > 2) {
    visible.push('gap')
  }

  for (let i = start; i <= end; i++) {
    visible.push(i)
  }

  if (end < totalPages - 1) {
    visible.push('gap')
  }

  visible.push(totalPages)
  return visible
}

export default async function PageSearch({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    page?: string
    categories?: string | string[]
    colors?: string | string[]
    sizes?: string | string[]
    price_min?: string
    price_max?: string
    sort?: string
  }>
}) {
  const { q, page, categories, colors, sizes, price_min, price_max, sort } = await searchParams
  const currentPage = typeof page === 'string' ? Math.max(1, parseInt(page, 10) || 1) : 1
  const itemsPerPage = 12

  const products = await getProducts()
  const featuredProducts = products.slice(0, 4)

  // 1. Filter by search query
  let filteredProducts = [...products]
  if (q) {
    const queryLower = q.toLowerCase().trim()
    filteredProducts = filteredProducts.filter((p) =>
      p.title?.toLowerCase().includes(queryLower) ||
      p.vendor?.toLowerCase().includes(queryLower) ||
      p.status?.toLowerCase().includes(queryLower) ||
      (p as any).magicDescription?.toLowerCase().includes(queryLower)
    )
  }

  // 2. Filter by categories
  if (categories) {
    const selectedCategories = Array.isArray(categories)
      ? categories.map((c) => c.toLowerCase())
      : [categories.toLowerCase()]
    
    if (selectedCategories.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        p.collectionHandles?.some((h) => selectedCategories.includes(h.toLowerCase()))
      )
    }
  }

  // 3. Filter by colors
  if (colors) {
    const selectedColors = Array.isArray(colors)
      ? colors.map((c) => c.toLowerCase())
      : [colors.toLowerCase()]
    
    if (selectedColors.length > 0) {
      filteredProducts = filteredProducts.filter((p) => {
        const matchesOption = p.options?.some((opt) => {
          const isColorOpt = opt.name.toLowerCase().includes('color') || opt.name.toLowerCase().includes('colour')
          if (!isColorOpt) return false
          return opt.optionValues?.some((val) => selectedColors.includes(val.name.toLowerCase()))
        })
        const matchesText = selectedColors.some((color) =>
          p.title?.toLowerCase().includes(color) ||
          (p as any).magicDescription?.toLowerCase().includes(color)
        )
        return matchesOption || matchesText
      })
    }
  }

  // 4. Filter by sizes
  if (sizes) {
    const selectedSizes = Array.isArray(sizes)
      ? sizes.map((s) => s.toLowerCase())
      : [sizes.toLowerCase()]
    
    if (selectedSizes.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        p.options?.some((opt) => {
          const isSizeOpt = opt.name.toLowerCase().includes('size')
          if (!isSizeOpt) return false
          return opt.optionValues?.some((val) => selectedSizes.includes(val.name.toLowerCase()))
        })
      )
    }
  }

  // 5. Filter by price range
  if (price_min || price_max) {
    const minPrice = price_min ? parseFloat(price_min) : 0
    const maxPrice = price_max ? parseFloat(price_max) : Infinity
    filteredProducts = filteredProducts.filter((p) => p.price >= minPrice && p.price <= maxPrice)
  }

  // 6. Sort products
  const activeSort = sort || 'newest'
  if (activeSort === 'newest') {
    filteredProducts.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  } else if (activeSort === 'oldest') {
    filteredProducts.sort((a, b) => (a.createdAt || '').localeCompare(a.createdAt || ''))
  } else if (activeSort === 'price-low-to-high') {
    filteredProducts.sort((a, b) => a.price - b.price)
  } else if (activeSort === 'price-high-to-low') {
    filteredProducts.sort((a, b) => b.price - a.price)
  } else if (activeSort === 'a-to-z') {
    filteredProducts.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  } else if (activeSort === 'z-to-a') {
    filteredProducts.sort((a, b) => (b.title || '').localeCompare(a.title || ''))
  }

  const totalItems = filteredProducts.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const visiblePages = getVisiblePages(currentPage, totalPages)

  // Helper to build page link preserve active query parameters
  const buildPageHref = (pageNumber: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (categories) {
      if (Array.isArray(categories)) {
        categories.forEach(c => params.append('categories', c))
      } else {
        params.append('categories', categories)
      }
    }
    if (colors) {
      if (Array.isArray(colors)) {
        colors.forEach(c => params.append('colors', c))
      } else {
        params.append('colors', colors)
      }
    }
    if (sizes) {
      if (Array.isArray(sizes)) {
        sizes.forEach(s => params.append('sizes', s))
      } else {
        params.append('sizes', sizes)
      }
    }
    if (price_min) params.set('price_min', price_min)
    if (price_max) params.set('price_max', price_max)
    if (sort) params.set('sort', sort)
    params.set('page', pageNumber.toString())
    return `?${params.toString()}`
  }

  return (
    <div>
      <div className={'h-24 w-full bg-primary-50 2xl:h-28 dark:bg-white/10'} />
      <div className="container">
        <header className="mx-auto -mt-10 flex max-w-2xl flex-col lg:-mt-7">
          <form method="GET" action="/search" className="relative w-full">
            <fieldset className="text-neutral-500 dark:text-neutral-300">
              <label htmlFor="search-input" className="sr-only">
                Search products
              </label>
              <HugeiconsIcon
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-2xl sm:left-5"
                icon={Search01Icon}
                size={24}
              />
              <input
                className="block w-full rounded-full border bg-white py-4 pr-5 pl-12 placeholder:text-zinc-500 focus:border-primary-300 focus:ring-3 focus:ring-primary-200/50 sm:py-5 sm:text-sm md:pl-15 dark:bg-neutral-800 dark:placeholder:text-zinc-400 dark:focus:ring-primary-600/25"
                id="search-input"
                name="q"
                type="search"
                defaultValue={q || ''}
                placeholder="Type your keywords"
              />
              <ButtonCircle
                className="absolute top-1/2 right-2 -translate-y-1/2 sm:right-2.5"
                size="size-11"
                type="submit"
              >
                <ArrowRightIcon className="size-5 text-white" />
              </ButtonCircle>
            </fieldset>
          </form>
        </header>
      </div>

      <div className="container flex flex-col gap-y-16 py-16 lg:gap-y-28 lg:pt-20 lg:pb-28">
        <main>
          {/* FILTER */}
          <HeaderFilterSection />

          {/* LOOP ITEMS */}
          {paginatedProducts.length > 0 ? (
            <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((item) => (
                <ProductCard data={item} key={item.id} />
              ))}
            </div>
          ) : (
            <div className="mt-12 text-center text-neutral-500 dark:text-neutral-400">
              No products found matching your search. Try other keywords or clear active filters.
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-20 flex justify-center lg:mt-24">
              <Pagination className="mx-auto">
                <PaginationPrevious href={currentPage > 1 ? buildPageHref(currentPage - 1) : null} />
                <PaginationList>
                  {visiblePages.map((p, idx) =>
                    p === 'gap' ? (
                      <PaginationGap key={`gap-${idx}`} />
                    ) : (
                      <PaginationPage key={p} href={buildPageHref(p)} current={p === currentPage}>
                        {p}
                      </PaginationPage>
                    )
                  )}
                </PaginationList>
                <PaginationNext href={currentPage < totalPages ? buildPageHref(currentPage + 1) : null} />
              </Pagination>
            </div>
          )}
        </main>

        <Divider />
        <SectionSliderLargeProduct products={featuredProducts} />
        <Divider />
        <SectionPromo1 />
      </div>
    </div>
  )
}
