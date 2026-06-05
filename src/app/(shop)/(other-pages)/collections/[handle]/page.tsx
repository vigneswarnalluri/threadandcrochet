import { Divider } from '@/components/Divider'
import { FilterSortByMenuListBox } from '@/components/FilterSortByMenu'
import { FiltersMenuTabs } from '@/components/FiltersMenu'
import ProductCard from '@/components/ProductCard'
import { getProductsForCollection } from '@/data/data'
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'

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

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>
  searchParams: Promise<{
    page?: string
    categories?: string | string[]
    colors?: string | string[]
    sizes?: string | string[]
    price_min?: string
    price_max?: string
    sort?: string
  }>
}) {
  const { handle } = await params
  const { page, categories, colors, sizes, price_min, price_max, sort } = await searchParams

  const currentPage = typeof page === 'string' ? Math.max(1, parseInt(page, 10) || 1) : 1
  const itemsPerPage = 12

  // 1. Get raw products for the collection
  let products = await getProductsForCollection(handle)

  // 2. Filter by categories (if handle is 'all', filter by categories parameter)
  if (categories) {
    const selectedCategories = Array.isArray(categories)
      ? categories.map((c) => c.toLowerCase())
      : [categories.toLowerCase()]
    
    if (selectedCategories.length > 0) {
      products = products.filter((p) =>
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
      products = products.filter((p) => {
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
      products = products.filter((p) =>
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
    products = products.filter((p) => p.price >= minPrice && p.price <= maxPrice)
  }

  // 6. Sort products
  const activeSort = sort || 'newest'
  if (activeSort === 'newest') {
    products.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  } else if (activeSort === 'oldest') {
    products.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
  } else if (activeSort === 'price-low-to-high') {
    products.sort((a, b) => a.price - b.price)
  } else if (activeSort === 'price-high-to-low') {
    products.sort((a, b) => b.price - a.price)
  } else if (activeSort === 'a-to-z') {
    products.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  } else if (activeSort === 'z-to-a') {
    products.sort((a, b) => (b.title || '').localeCompare(a.title || ''))
  }

  const totalItems = products.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const visiblePages = getVisiblePages(currentPage, totalPages)

  // Helper to build page link preserve active query parameters
  const buildPageHref = (pageNumber: number) => {
    const params = new URLSearchParams()
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
    <main>
      {/* TABS FILTER */}
      <div className="flex flex-wrap items-center gap-2.5">
        <FiltersMenuTabs />
        <FilterSortByMenuListBox className="ml-auto" />
      </div>

      <Divider className="mt-8" />

      {/* LOOP ITEMS */}
      <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedProducts?.map((produc) => <ProductCard data={produc} key={produc.id} />)}
      </div>

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
  )
}
