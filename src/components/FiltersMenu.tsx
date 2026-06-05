'use client'

import ButtonClose from '@/shared/Button/ButtonClose'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonThird from '@/shared/Button/ButtonThird'
import { Checkbox, CheckboxField, CheckboxGroup } from '@/shared/checkbox'
import * as Headless from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import {
  DollarCircleIcon,
  FilterVerticalIcon,
  Note01Icon,
  PackageDimensions01Icon,
  PaintBucketIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react'
import clsx from 'clsx'
import { useState, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

const PriceRangeSlider = dynamic(() => import('./PriceRangeSlider').then((mod) => mod.PriceRangeSlider), {
  ssr: false,
  loading: () => <div className="h-20 flex items-center justify-center text-sm text-neutral-500">Loading slider...</div>
})

type FilterOption = {
  id: string
  name: string
  type: 'checkbox' | 'price-range' | 'radio'
  hugeIcon?: IconSvgElement
  // For checkbox type
  options?: { name: string; value: string }[]
  // For price-range type
  min?: number
  max?: number
}

const demo_filters_options: FilterOption[] = [
  {
    id: 'categories',
    name: 'Categories',
    type: 'checkbox',
    hugeIcon: Note01Icon,
    options: [
      { name: 'Cozy Wearables', value: 'jackets' },
      { name: 'Accessories', value: 'accessories' },
      { name: 'Bags', value: 'bags' },
      { name: 'Shoes & Booties', value: 'shoes' },
      { name: 'Home Decor', value: 'coats' },
      { name: 'Toys & Charm', value: 't-shirts' },
    ],
  },
  {
    id: 'colors',
    name: 'Colors',
    type: 'checkbox',
    hugeIcon: PaintBucketIcon,
    options: [
      { name: 'White / Cream', value: 'white' },
      { name: 'Blue', value: 'blue' },
      { name: 'Green', value: 'green' },
      { name: 'Red', value: 'red' },
      { name: 'Black', value: 'black' },
      { name: 'Pink', value: 'pink' },
      { name: 'Yellow', value: 'yellow' },
      { name: 'Brown / Beige', value: 'brown' },
    ],
  },
  {
    id: 'sizes',
    name: 'Sizes',
    type: 'checkbox',
    hugeIcon: PackageDimensions01Icon,
    options: [
      { name: 'XS', value: 'xs' },
      { name: 'S', value: 's' },
      { name: 'M', value: 'm' },
      { name: 'L', value: 'l' },
      { name: 'XL', value: 'xl' },
      { name: 'Standard', value: 'standard' },
    ],
  },
  {
    id: 'price',
    name: 'Price',
    type: 'price-range',
    min: 0,
    max: 150,
    hugeIcon: DollarCircleIcon,
  },
]

type Props = {
  filterOptions?: FilterOption[]
  className?: string
}

// Wrapper with Suspense
export const FiltersMenuTabs = (props: Props) => {
  return (
    <Suspense fallback={<div className="text-sm text-neutral-500">Loading filters...</div>}>
      <FiltersMenuTabsContent {...props} />
    </Suspense>
  )
}

const FiltersMenuTabsContent = ({
  filterOptions = demo_filters_options.filter((f) => f.type !== 'radio'),
  className,
}: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFormSubmit = (formData: FormData) => {
    const params = new URLSearchParams(searchParams.toString())

    // Update categories
    params.delete('categories')
    const selectedCategories = formData.getAll('categories[]')
    selectedCategories.forEach((val) => params.append('categories', val as string))

    // Update colors
    params.delete('colors')
    const selectedColors = formData.getAll('colors[]')
    selectedColors.forEach((val) => params.append('colors', val as string))

    // Update sizes
    params.delete('sizes')
    const selectedSizes = formData.getAll('sizes[]')
    selectedSizes.forEach((val) => params.append('sizes', val as string))

    // Update price
    const minPrice = formData.get('price_min')
    const maxPrice = formData.get('price_max')
    if (minPrice) params.set('price_min', minPrice as string)
    else params.delete('price_min')
    
    if (maxPrice) params.set('price_max', maxPrice as string)
    else params.delete('price_max')

    params.set('page', '1') // reset page

    router.push(`${pathname}?${params.toString()}`)
  }

  if (!filterOptions || filterOptions.length === 0) {
    return <div>No filter options available</div>
  }

  return (
    <div className={clsx('flex flex-wrap md:gap-x-4 md:gap-y-2', className)}>
      {/* ALL FILTERS DIALOG */}
      <div className="shrink-0 md:hidden">
        <FiltersMenuDialog filterOptions={filterOptions} />
      </div>

      {/* POPOVER FILTERS */}
      <div className="hidden md:block">
        <Headless.PopoverGroup as="form" action={handleFormSubmit}>
          <fieldset className="flex flex-wrap gap-x-4 gap-y-2">
            {filterOptions.map((filterOption, index) => {
              if (!filterOption) {
                return null
              }

              // Compute checked number for the dynamic badge
              let checkedNumber = 0
              if (filterOption.type === 'checkbox') {
                checkedNumber = searchParams.getAll(filterOption.id).length
              } else if (filterOption.type === 'price-range') {
                if (searchParams.has('price_min') || searchParams.has('price_max')) {
                  checkedNumber = 1
                }
              }

              return (
                <Headless.Popover className="relative" key={index}>
                  <Headless.PopoverButton
                    className={clsx(
                      'relative flex items-center justify-center rounded-full px-4 py-2.5 text-sm select-none ring-inset group-data-open:ring-2 group-data-open:ring-black hover:bg-neutral-50 focus:outline-hidden dark:group-data-open:ring-white dark:hover:bg-neutral-900',
                      checkedNumber
                        ? 'ring-2 ring-black dark:ring-white font-medium'
                        : 'ring-1 ring-neutral-300 dark:ring-neutral-700'
                    )}
                  >
                    {filterOption.hugeIcon && <HugeiconsIcon icon={filterOption.hugeIcon} size={18} />}
                    <span className="ms-2">{filterOption.name}</span>
                    <ChevronDownIcon className="ms-3 size-4" />
                    {checkedNumber ? (
                      <span className="absolute top-0 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-black text-[0.65rem] font-semibold text-white ring-2 ring-white dark:bg-neutral-200 dark:text-neutral-900 dark:ring-neutral-900">
                        {checkedNumber}
                      </span>
                    ) : null}
                  </Headless.PopoverButton>

                  <Headless.PopoverPanel
                    transition
                    unmount={false}
                    className="absolute -start-5 top-full z-50 mt-3 w-sm transition data-closed:translate-y-1 data-closed:opacity-0"
                  >
                    <div className="rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                      <div className="hidden-scrollbar max-h-[28rem] overflow-y-auto px-5 py-6">
                        {filterOption.type === 'checkbox' && (
                          <CheckboxGroup>
                            {filterOption.options?.map((option) => {
                              if (!option) return null
                              const activeValues = searchParams.getAll(filterOption.id)
                              const isChecked = activeValues.includes(option.value)
                              return (
                                <CheckboxField key={option.name}>
                                  <Checkbox
                                    name={`${filterOption.id}[]`}
                                    value={option.value}
                                    defaultChecked={isChecked}
                                    key={`${filterOption.id}-${option.value}-${isChecked}`}
                                  />
                                  <Headless.Label className="text-sm/6">{option.name}</Headless.Label>
                                </CheckboxField>
                              )
                            })}
                          </CheckboxGroup>
                        )}
                        {filterOption.type === 'price-range' && (
                          <PriceRangeSlider
                            key={`${index}-${searchParams.get('price_min')}-${searchParams.get('price_max')}`}
                            min={filterOption.min ?? 0}
                            max={filterOption.max ?? 150}
                            name={filterOption.name}
                            defaultValue={[
                              searchParams.get('price_min') ? parseInt(searchParams.get('price_min') || '0', 10) : (filterOption.min ?? 0),
                              searchParams.get('price_max') ? parseInt(searchParams.get('price_max') || '150', 10) : (filterOption.max ?? 150)
                            ]}
                          />
                        )}
                      </div>

                      <div className="flex items-center justify-between rounded-b-2xl bg-neutral-50 p-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
                        <Headless.CloseButton className="-mx-3" size="smaller" as={ButtonThird} type="button">
                          Cancel
                        </Headless.CloseButton>
                        <Headless.CloseButton size="smaller" as={ButtonPrimary} type="submit">
                          Apply
                        </Headless.CloseButton>
                      </div>
                    </div>
                  </Headless.PopoverPanel>
                </Headless.Popover>
              )
            })}
          </fieldset>
        </Headless.PopoverGroup>
      </div>
    </div>
  )
}

// Wrapper with Suspense
export const FiltersMenuSidebar = (props: Props) => {
  return (
    <Suspense fallback={<div className="text-sm text-neutral-500">Loading sidebar filters...</div>}>
      <FiltersMenuSidebarContent {...props} />
    </Suspense>
  )
}

const FiltersMenuSidebarContent = ({ filterOptions = demo_filters_options, className }: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFormSubmit = (formData: FormData) => {
    const params = new URLSearchParams(searchParams.toString())

    // Update categories
    params.delete('categories')
    const selectedCategories = formData.getAll('categories[]')
    selectedCategories.forEach((val) => params.append('categories', val as string))

    // Update colors
    params.delete('colors')
    const selectedColors = formData.getAll('colors[]')
    selectedColors.forEach((val) => params.append('colors', val as string))

    // Update sizes
    params.delete('sizes')
    const selectedSizes = formData.getAll('sizes[]')
    selectedSizes.forEach((val) => params.append('sizes', val as string))

    // Update price range
    const minPrice = formData.get('price_min')
    const maxPrice = formData.get('price_max')
    if (minPrice) params.set('price_min', minPrice as string)
    else params.delete('price_min')
    
    if (maxPrice) params.set('price_max', maxPrice as string)
    else params.delete('price_max')

    params.set('page', '1') // reset page
    router.push(`${pathname}?${params.toString()}`)
  }

  if (!filterOptions || filterOptions.length === 0) {
    return <div>No filter options available</div>
  }

  return (
    <>
      {/* ALL FILTERS DIALOG */}
      <div className="shrink-0 lg:hidden">
        <FiltersMenuDialog filterOptions={filterOptions} />
      </div>

      {/* SIDEBAR FILTERS */}
      <div className="hidden lg:block">
        <form action={handleFormSubmit}>
          <fieldset className="w-full">
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filterOptions?.map((filterOption, index) => {
                if (!filterOption) return null
                return (
                  <div key={filterOption.id} className="py-10 first:pt-0 last:pb-0">
                    <legend className="text-lg font-medium">{filterOption.name}</legend>
                    <div className="pt-7">
                      {filterOption.type === 'checkbox' && (
                        <CheckboxGroup>
                          {filterOption.options?.map((option) => {
                            if (!option) return null
                            const activeValues = searchParams.getAll(filterOption.id)
                            const isChecked = activeValues.includes(option.value)
                            return (
                              <CheckboxField key={option.name}>
                                <Checkbox
                                  name={`${filterOption.id}[]`}
                                  value={option.value}
                                  defaultChecked={isChecked}
                                  key={`${filterOption.id}-${option.value}-${isChecked}`}
                                />
                                <Headless.Label className="text-sm/6">{option.name}</Headless.Label>
                              </CheckboxField>
                            )
                          })}
                        </CheckboxGroup>
                      )}
                      {filterOption.type === 'price-range' && (
                        <PriceRangeSlider
                          key={`${index}-${searchParams.get('price_min')}-${searchParams.get('price_max')}`}
                          min={filterOption.min ?? 0}
                          max={filterOption.max ?? 150}
                          name={filterOption.name}
                          defaultValue={[
                            searchParams.get('price_min') ? parseInt(searchParams.get('price_min') || '0', 10) : (filterOption.min ?? 0),
                            searchParams.get('price_max') ? parseInt(searchParams.get('price_max') || '150', 10) : (filterOption.max ?? 150)
                          ]}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
              
              <div className="pt-6">
                <ButtonPrimary className="w-full" type="submit">
                  Apply Filters
                </ButtonPrimary>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </>
  )
}

// Wrapper with Suspense
export function FiltersMenuDialog(props: Props) {
  return (
    <Suspense fallback={null}>
      <FiltersMenuDialogContent {...props} />
    </Suspense>
  )
}

function FiltersMenuDialogContent({ className, filterOptions = demo_filters_options }: Props) {
  const [showAllFilter, setShowAllFilter] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFormSubmit = (formData: FormData) => {
    const params = new URLSearchParams(searchParams.toString())

    // Update categories
    params.delete('categories')
    const selectedCategories = formData.getAll('categories[]')
    selectedCategories.forEach((val) => params.append('categories', val as string))

    // Update colors
    params.delete('colors')
    const selectedColors = formData.getAll('colors[]')
    selectedColors.forEach((val) => params.append('colors', val as string))

    // Update sizes
    params.delete('sizes')
    const selectedSizes = formData.getAll('sizes[]')
    selectedSizes.forEach((val) => params.append('sizes', val as string))

    // Update price
    const minPrice = formData.get('price_min')
    const maxPrice = formData.get('price_max')
    if (minPrice) params.set('price_min', minPrice as string)
    else params.delete('price_min')
    
    if (maxPrice) params.set('price_max', maxPrice as string)
    else params.delete('price_max')

    params.set('page', '1') // reset page
    setShowAllFilter(false)
    router.push(`${pathname}?${params.toString()}`)
  }

  if (!filterOptions || filterOptions.length === 0) {
    return <div>No filter options available</div>
  }

  // Count active filters for badge
  let checkedNumber = 0
  filterOptions.forEach((fo) => {
    if (fo.type === 'checkbox') {
      checkedNumber += searchParams.getAll(fo.id).length
    } else if (fo.type === 'price-range') {
      if (searchParams.has('price_min') || searchParams.has('price_max')) {
        checkedNumber += 1
      }
    }
  })

  return (
    <div className={clsx('shrink-0', className)}>
      <Headless.Button
        className={clsx(
          'relative flex items-center justify-center rounded-full px-4 py-2.5 text-sm select-none ring-inset group-data-open:ring-2 group-data-open:ring-black hover:bg-neutral-50 focus:outline-hidden dark:group-data-open:ring-white dark:hover:bg-neutral-900',
          checkedNumber ? 'ring-2 ring-black dark:ring-white font-medium' : 'ring-1 ring-neutral-300 dark:ring-neutral-700'
        )}
        onClick={() => setShowAllFilter(true)}
      >
        <HugeiconsIcon icon={FilterVerticalIcon} size={18} />
        <span className="ms-2">All filters</span>
        <ChevronDownIcon className="ms-3 size-4" />
        {checkedNumber ? (
          <span className="absolute top-0 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-black text-[0.65rem] font-semibold text-white ring-2 ring-white dark:bg-neutral-200 dark:text-neutral-900 dark:ring-neutral-900">
            {checkedNumber}
          </span>
        ) : null}
      </Headless.Button>

      <Headless.Dialog open={showAllFilter} onClose={setShowAllFilter} className="relative z-50">
        <Headless.DialogBackdrop
          transition
          className="fixed inset-0 bg-black/50 duration-200 ease-out data-closed:opacity-0"
        />
        <form
          action={handleFormSubmit}
          className="fixed inset-0 flex max-h-screen w-screen items-center justify-center pt-3"
        >
          <Headless.DialogPanel
            className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white text-left align-middle shadow-xl duration-200 ease-out data-closed:translate-y-16 data-closed:opacity-0 dark:border dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            transition
            as={'fieldset'}
          >
            <div className="relative shrink-0 border-b border-neutral-200 p-4 text-center sm:px-8 dark:border-neutral-800">
              <Headless.DialogTitle as="h3" className="text-lg leading-6 font-medium text-gray-900">
                Filters
              </Headless.DialogTitle>
              <div className="absolute end-2 top-2">
                <Headless.CloseButton
                  as={ButtonClose}
                  colorClassName="bg-white text-neutral-900 hover:bg-neutral-100"
                />
              </div>
            </div>

            <div className="hidden-scrollbar grow overflow-y-auto text-start">
              <div className="divide-y divide-neutral-200 px-4 sm:px-8 dark:divide-neutral-800">
                {filterOptions?.map((filterOption, index) => {
                  if (!filterOption) return null
                  return (
                    <div key={filterOption.id} className="py-7">
                      <p className="text-lg font-medium">{filterOption.name}</p>
                      <div className="mt-6">
                        {filterOption.type === 'checkbox' && (
                          <CheckboxGroup>
                            {filterOption.options?.map((option) => {
                              if (!option) return null
                              const activeValues = searchParams.getAll(filterOption.id)
                              const isChecked = activeValues.includes(option.value)
                              return (
                                <CheckboxField key={option.name}>
                                  <Checkbox
                                    name={`${filterOption.id}[]`}
                                    value={option.value}
                                    defaultChecked={isChecked}
                                    key={`${filterOption.id}-${option.value}-${isChecked}`}
                                  />
                                  <Headless.Label className="text-sm/6">{option.name}</Headless.Label>
                                </CheckboxField>
                              )
                            })}
                          </CheckboxGroup>
                        )}
                        {filterOption.type === 'price-range' && (
                          <PriceRangeSlider
                            key={`${index}-${searchParams.get('price_min')}-${searchParams.get('price_max')}`}
                            min={filterOption.min ?? 0}
                            max={filterOption.max ?? 150}
                            name={filterOption.name}
                            defaultValue={[
                              searchParams.get('price_min') ? parseInt(searchParams.get('price_min') || '0', 10) : (filterOption.min ?? 0),
                              searchParams.get('price_max') ? parseInt(searchParams.get('price_max') || '150', 10) : (filterOption.max ?? 150)
                            ]}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between bg-neutral-50 p-4 sm:px-8 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
              <Headless.CloseButton as={ButtonThird} size="smaller" className="-mx-2" type="button" onClick={() => setShowAllFilter(false)}>
                Cancel
              </Headless.CloseButton>
              <Headless.CloseButton as={ButtonPrimary} size="smaller" type="submit">
                Apply filters
              </Headless.CloseButton>
            </div>
          </Headless.DialogPanel>
        </form>
      </Headless.Dialog>
    </div>
  )
}
