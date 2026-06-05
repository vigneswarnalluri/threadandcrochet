'use client'

import { TProductItem } from '@/data/data'
import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'
import { useProductColor } from './ProductColorContext'

const ProductColorOptions = ({
  options,
  className,
  defaultColor,
}: {
  options: TProductItem['options']
  className?: string
  defaultColor: string
}) => {
  // Try to use shared context (product detail page).
  // Falls back to local state when context is not available (e.g. quick-view).
  let contextValue: { selectedColor: string; setSelectedColor: (c: string) => void } | null = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    contextValue = useProductColor()
  } catch {
    contextValue = null
  }

  const [localColor, setLocalColor] = useState(defaultColor)
  const colorSelected = contextValue?.selectedColor ?? localColor
  const setColorSelected = contextValue?.setSelectedColor ?? setLocalColor

  const colorOptionValues = options?.find((option) => option.name === 'Color')?.optionValues

  if (!colorOptionValues?.length) {
    return null
  }

  return (
    <Headless.Field className={clsx(className)}>
      <Headless.RadioGroup value={colorSelected} name="color" onChange={setColorSelected} aria-label="Color">
        <Headless.Label className="block text-sm font-medium rtl:text-right">Color</Headless.Label>
        <div className="mt-2.5 flex flex-wrap gap-x-2.5 gap-y-2">
          {colorOptionValues.map((value) => {
            const isActive = value.name === colorSelected

            return (
              <Headless.Radio
                key={value.name}
                value={value.name}
                as="div"
                title={value.name}
                className={clsx(
                  'relative size-9 cursor-pointer rounded-full transition-all',
                  isActive && 'ring-2 ring-offset-1 ring-neutral-900 dark:ring-neutral-300'
                )}
              >
                <div
                  className="absolute inset-0.5 z-0 overflow-hidden rounded-full bg-cover ring-1 ring-neutral-900/10 dark:ring-white/15"
                  style={{
                    backgroundColor: value.swatch?.color,
                    backgroundImage: value.swatch?.image ? `url(${value.swatch.image})` : undefined,
                    backgroundPosition: 'center',
                  }}
                />
              </Headless.Radio>
            )
          })}
        </div>
      </Headless.RadioGroup>
    </Headless.Field>
  )
}

export default ProductColorOptions
