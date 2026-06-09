'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'

interface ProductColorContextType {
  selectedColor: string
  setSelectedColor: (color: string) => void
  /** colorName → featured image URL for that variant */
  colorImageMap: Record<string, string>
  selectedSize: string
  setSelectedSize: (size: string) => void
}

const ProductColorContext = createContext<ProductColorContextType | null>(null)

export function ProductColorProvider({
  children,
  defaultColor,
  colorImageMap,
  defaultSize,
}: {
  children: React.ReactNode
  defaultColor: string
  colorImageMap: Record<string, string>
  defaultSize?: string
}) {
  const [selectedColor, setSelectedColor] = useState(defaultColor)
  const [selectedSize, setSelectedSize] = useState(defaultSize || '')

  const value = useMemo(
    () => ({ selectedColor, setSelectedColor, colorImageMap, selectedSize, setSelectedSize }),
    [selectedColor, colorImageMap, selectedSize]
  )

  return <ProductColorContext.Provider value={value}>{children}</ProductColorContext.Provider>
}

export function useProductColor(): ProductColorContextType {
  const ctx = useContext(ProductColorContext)
  if (!ctx) throw new Error('useProductColor must be used inside <ProductColorProvider>')
  return ctx
}
