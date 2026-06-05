'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'

interface ProductColorContextType {
  selectedColor: string
  setSelectedColor: (color: string) => void
  /** colorName → featured image URL for that variant */
  colorImageMap: Record<string, string>
}

const ProductColorContext = createContext<ProductColorContextType | null>(null)

export function ProductColorProvider({
  children,
  defaultColor,
  colorImageMap,
}: {
  children: React.ReactNode
  defaultColor: string
  colorImageMap: Record<string, string>
}) {
  const [selectedColor, setSelectedColor] = useState(defaultColor)

  const value = useMemo(
    () => ({ selectedColor, setSelectedColor, colorImageMap }),
    [selectedColor, colorImageMap]
  )

  return <ProductColorContext.Provider value={value}>{children}</ProductColorContext.Provider>
}

export function useProductColor(): ProductColorContextType {
  const ctx = useContext(ProductColorContext)
  if (!ctx) throw new Error('useProductColor must be used inside <ProductColorProvider>')
  return ctx
}
