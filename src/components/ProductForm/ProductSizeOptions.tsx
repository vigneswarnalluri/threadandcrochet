'use client'

import { TProductItem } from '@/data/data'
import { Button } from '@/shared/Button/Button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/shared/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/table'
import * as Headless from '@headlessui/react'

import clsx from 'clsx'
import { useState } from 'react'
import { useProductColor } from './ProductColorContext'

const demoSizeChart = [
  {
    name: 'XS',
    description: 'Chest: 32-34", Waist: 24-26"',
  },
  {
    name: 'S',
    description: 'Chest: 34-36", Waist: 26-28"',
  },
  {
    name: 'M',
    description: 'Chest: 38-40", Waist: 30-32"',
  },
  {
    name: 'L',
    description: 'Chest: 42-44", Waist: 34-36"',
  },
  {
    name: 'XL',
    description: 'Chest: 46-48", Waist: 38-40"',
  },
]

const ProductSizeOptions = ({
  options,
  className,
  defaultSize,
}: {
  options: TProductItem['options']
  className?: string
  defaultSize: string
}) => {
  // Try to use shared context.
  // Falls back to local state when context is not available.
  let contextValue: { selectedSize: string; setSelectedSize: (s: string) => void } | null = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    contextValue = useProductColor()
  } catch {
    contextValue = null
  }

  const [localSize, setLocalSize] = useState(defaultSize)
  const sizeSelected = contextValue?.selectedSize ?? localSize
  const setSizeSelected = contextValue?.setSelectedSize ?? setLocalSize
  const [isOpen, setIsOpen] = useState(false)

  if (!options?.length) {
    return null
  }
  const sizeOptionValues = options?.find((option) => option.name === 'Size')?.optionValues

  if (!sizeOptionValues?.length || sizeOptionValues.length <= 1) {
    return null
  }

  // Find stock for currently selected size
  const currentSizeOption = sizeOptionValues.find((v) => v.name === sizeSelected)
  const sizeStock = currentSizeOption && currentSizeOption.stock !== undefined ? currentSizeOption.stock : null

  return (
    <>
      <Headless.Field className={clsx(className)}>
        <Headless.RadioGroup value={sizeSelected} onChange={setSizeSelected} aria-label="size" name="size">
          <div className="flex justify-between text-sm font-medium">
            <Headless.Label>Size</Headless.Label>
            <Headless.Button
              className="cursor-pointer text-primary-600 hover:text-primary-500"
              onClick={() => setIsOpen(true)}
              as="p"
            >
              See sizing chart
            </Headless.Button>
          </div>
          <div className="mt-2.5 grid grid-cols-5 gap-2 sm:grid-cols-7">
            {sizeOptionValues.map((size) => {
              const isActive = size.name === sizeSelected
              return (
                <Headless.Radio
                  key={size.name}
                  value={size.name}
                  as="div"
                  className={clsx(
                    'relative flex h-10 items-center justify-center overflow-hidden rounded-lg text-sm font-medium text-neutral-900 uppercase select-none hover:bg-neutral-50 sm:h-11 dark:text-neutral-200 dark:hover:bg-neutral-700',
                    isActive
                      ? 'ring-2 ring-neutral-900 dark:ring-neutral-200'
                      : 'ring-1 ring-neutral-200 dark:ring-neutral-500'
                  )}
                >
                  {size.name}
                </Headless.Radio>
              )
            })}
          </div>
        </Headless.RadioGroup>

        {sizeStock !== null && (
          sizeStock === 0 ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 dark:bg-red-950/30 dark:border-red-800">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500 shrink-0"></span>
              <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                Size {sizeSelected} is Out of Stock — currently unavailable
              </span>
            </div>
          ) : sizeStock <= 4 ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 dark:bg-amber-950/30 dark:border-amber-800">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Only {sizeStock} left in size {sizeSelected} — order soon!
              </span>
            </div>
          ) : null
        )}
      </Headless.Field>

      <Dialog size="4xl" open={isOpen} onClose={setIsOpen}>
        <DialogTitle>Size Chart</DialogTitle>
        <DialogDescription>
          Use the chart below to find your size. If you are between sizes, we recommend sizing up.
        </DialogDescription>
        <DialogBody>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Size</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Measurements</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {demoSizeChart.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-zinc-500">{item.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogBody>
        <DialogActions>
          <Button size="smaller" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProductSizeOptions
