'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'

export interface CartItem {
  id: string; // key: productHandle_color_size
  productId: string;
  productHandle: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: {
    src: string;
    width: number;
    height: number;
    alt?: string;
  };
}

interface StoreContextProps {
  cart: CartItem[]
  wishlist: string[] // Array of product handles
  loading: boolean
  user: any
  currency: 'INR' | 'USD'
  setCurrency: (currency: 'INR' | 'USD') => void
  addToCart: (product: any, quantity: number, size?: string, color?: string) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateCartQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  toggleWishlist: (productHandle: string) => Promise<void>
  isLiked: (productHandle: string) => boolean
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined)

const deduplicateCart = (cartItems: CartItem[]): CartItem[] => {
  const map: { [key: string]: CartItem } = {}
  cartItems.forEach(item => {
    const qty = Number(item.quantity) || 1
    if (map[item.id]) {
      map[item.id].quantity += qty
    } else {
      map[item.id] = { ...item, quantity: qty }
    }
  })
  return Object.values(map)
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dbAvailable, setDbAvailable] = useState({ wishlists: true, cart_items: true })
  const [currency, setCurrencyState] = useState<'INR' | 'USD'>('INR')

  const supabase = createClient()

  // 1. Initial load from local storage
  useEffect(() => {
    const localCart = localStorage.getItem('__tl_cart')
    const localWishlist = localStorage.getItem('__tl_wishlist')
    const localCurrency = localStorage.getItem('__tl_currency') as 'INR' | 'USD' | null

    if (localCart) {
      try {
        setCart(deduplicateCart(JSON.parse(localCart)))
      } catch (e) {
        console.error('Error parsing cart from localStorage', e)
      }
    }
    if (localWishlist) {
      try {
        setWishlist(JSON.parse(localWishlist))
      } catch (e) {
        console.error('Error parsing wishlist from localStorage', e)
      }
    }
    if (localCurrency) {
      setCurrencyState(localCurrency)
    }
  }, [])

  const setCurrency = (curr: 'INR' | 'USD') => {
    setCurrencyState(curr)
    localStorage.setItem('__tl_currency', curr)
  }

  // 2. Auth State listener & loader
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      if (currentUser) {
        await syncDataWithDb(currentUser)
      } else {
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      if (currentUser) {
        await syncDataWithDb(currentUser)
      } else {
        // Logged out: reset to local storage only
        const localCart = localStorage.getItem('__tl_cart')
        const localWishlist = localStorage.getItem('__tl_wishlist')
        setCart(localCart ? deduplicateCart(JSON.parse(localCart)) : [])
        setWishlist(localWishlist ? JSON.parse(localWishlist) : [])
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Save guest cart / wishlist changes to localStorage
  const saveToLocal = (updatedCart: CartItem[], updatedWishlist: string[]) => {
    localStorage.setItem('__tl_cart', JSON.stringify(updatedCart))
    localStorage.setItem('__tl_wishlist', JSON.stringify(updatedWishlist))
  }

  // Sync data with Supabase if logged in
  const syncDataWithDb = async (currUser: any) => {
    setLoading(true)
    let activeCart = [...cart]
    let activeWishlist = [...wishlist]

    // Read local storage in case we had items before logging in
    const localCartStr = localStorage.getItem('__tl_cart')
    const localWishlistStr = localStorage.getItem('__tl_wishlist')
    const localCart: CartItem[] = localCartStr ? deduplicateCart(JSON.parse(localCartStr)) : []
    const localWishlist: string[] = localWishlistStr ? JSON.parse(localWishlistStr) : []

    // A. Sync Wishlist
    let remoteWishlist: string[] = []
    let wishlistsDbOk = true
    try {
      const { data: wlData, error: wlErr } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', currUser.id)

      if (wlErr) {
        if (wlErr.code === 'PGRST116' || wlErr.message.includes('relation') || wlErr.message.includes('does not exist')) {
          wishlistsDbOk = false
          setDbAvailable(prev => ({ ...prev, wishlists: false }))
        } else {
          throw wlErr
        }
      } else if (wlData) {
        remoteWishlist = wlData.map(item => item.product_id)
      }
    } catch (err) {
      console.warn('Error fetching wishlists from Supabase. Falling back to localStorage.', err)
      wishlistsDbOk = false
      setDbAvailable(prev => ({ ...prev, wishlists: false }))
    }

    // B. Sync Cart
    let remoteCart: CartItem[] = []
    let cartDbOk = true
    try {
      const { data: cartData, error: cartErr } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', currUser.id)

      if (cartErr) {
        if (cartErr.code === 'PGRST116' || cartErr.message.includes('relation') || cartErr.message.includes('does not exist')) {
          cartDbOk = false
          setDbAvailable(prev => ({ ...prev, cart_items: false }))
        } else {
          throw cartErr
        }
      } else if (cartData) {
        // We need to fetch details for these products, but since we retrieve product data locally,
        // we can construct CartItem structures from db records. Let's do that.
        // Wait, how do we get the name / image details? We can import them or we'll fetch them from database if stored,
        // but since they are stored as product_id (handle), we can reconstruct them from getProducts() or store them in metadata.
        // To keep database schema simple and fast, we stored product_id. Let's map it.
        // We will do a lazy resolve in the client context or store metadata. Let's check how cart_items are structured:
        // cart_items schema: user_id, product_id, quantity, size, color.
        // To populate product details (name, price, image), we can fetch them using a helper.
        // Let's fetch products via our client-safe API route
        const res = await fetch('/api/products')
        const allProducts = res.ok ? await res.json() : []

        const rawRemoteCart = cartData.map(dbItem => {
          const product = allProducts.find((p: any) => p.handle === dbItem.product_id || p.id === dbItem.product_id)
          const name = product?.title || dbItem.product_id
          const price = product?.price || 0
          const image = product?.featuredImage || { src: '', width: 100, height: 100, alt: '' }

          return {
            id: `${dbItem.product_id}_${dbItem.color || ''}_${dbItem.size || ''}`,
            productId: product?.id || dbItem.product_id,
            productHandle: product?.handle || dbItem.product_id,
            name,
            price,
            quantity: dbItem.quantity,
            size: dbItem.size,
            color: dbItem.color,
            image
          }
        })
        remoteCart = deduplicateCart(rawRemoteCart)
      }
    } catch (err) {
      console.warn('Error fetching cart_items from Supabase. Falling back to localStorage.', err)
      cartDbOk = false
      setDbAvailable(prev => ({ ...prev, cart_items: false }))
    }

    // C. Merge logic (Local + Remote)
    // Merge Wishlist
    const mergedWishlist = Array.from(new Set([...localWishlist, ...remoteWishlist]))
    setWishlist(mergedWishlist)

    // Write merged wishlist back to Supabase if DB ok and missing items
    if (wishlistsDbOk) {
      try {
        const missingFromDb = localWishlist.filter(id => !remoteWishlist.includes(id))
        if (missingFromDb.length > 0) {
          const insertRows = missingFromDb.map(pId => ({
            user_id: currUser.id,
            product_id: pId
          }))
          await supabase.from('wishlists').insert(insertRows)
        }
      } catch (err) {
        console.error('Error syncing merged wishlist to DB', err)
      }
    }

    // Merge Cart
    const mergedCart = [...remoteCart]
    localCart.forEach(localItem => {
      const existing = mergedCart.find(item => item.id === localItem.id)
      if (existing) {
        existing.quantity = Math.max(existing.quantity, localItem.quantity)
      } else {
        mergedCart.push(localItem)
      }
    })
    const finalMergedCart = deduplicateCart(mergedCart)
    setCart(finalMergedCart)

    // Write merged cart back to Supabase if DB ok and missing items
    if (cartDbOk) {
      try {
        // Delete and re-insert to avoid Postgres unique index NULL issues and prevent duplicate rows
        for (const item of finalMergedCart) {
          await supabase
            .from('cart_items')
            .delete()
            .match({
              user_id: currUser.id,
              product_id: item.productHandle,
              size: item.size || null,
              color: item.color || null
            })

          await supabase.from('cart_items').insert({
            user_id: currUser.id,
            product_id: item.productHandle,
            quantity: item.quantity,
            size: item.size || null,
            color: item.color || null
          })
        }
      } catch (err) {
        console.error('Error syncing merged cart to DB', err)
      }
    }

    // Update local storage representation
    saveToLocal(finalMergedCart, mergedWishlist)
    setLoading(false)
  }

  // 3. Add to Cart
  const addToCart = async (product: any, quantity: number, size?: string, color?: string) => {
    const sizeVal = size || ''
    const colorVal = color || ''
    const productHandle = product.handle || product.productHandle || ''
    const itemId = `${productHandle}_${colorVal}_${sizeVal}`

    let existingQty = 0
    const existingItem = cart.find(item => item.id === itemId)
    if (existingItem) {
      existingQty = existingItem.quantity
    }

    const newQty = existingQty + quantity

    let updatedCart: CartItem[]
    if (existingItem) {
      updatedCart = cart.map(item =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      )
    } else {
      const newItem: CartItem = {
        id: itemId,
        productId: product.id || '',
        productHandle,
        name: product.title || product.name || '',
        price: product.price || 0,
        quantity,
        size: sizeVal || undefined,
        color: colorVal || undefined,
        image: product.featuredImage || product.image || { src: '', width: 100, height: 100, alt: '' }
      }
      updatedCart = [...cart, newItem]
    }

    setCart(updatedCart)
    saveToLocal(updatedCart, wishlist)

    // Sync database outside state update
    if (user && dbAvailable.cart_items) {
      try {
        // Delete all matching records first to avoid Postgres unique index NULL limitations
        await supabase
          .from('cart_items')
          .delete()
          .match({
            user_id: user.id,
            product_id: productHandle,
            size: sizeVal || null,
            color: colorVal || null
          })

        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productHandle,
            quantity: newQty,
            size: sizeVal || null,
            color: colorVal || null
          })
        if (error) console.error('Error inserting cart item to Supabase', error)
      } catch (err) {
        console.error('Error in addToCart db call', err)
      }
    }
  }

  // 4. Remove from Cart
  const removeFromCart = async (itemId: string) => {
    const itemToRemove = cart.find(item => item.id === itemId)
    if (!itemToRemove) return

    const updatedCart = cart.filter(item => item.id !== itemId)
    setCart(updatedCart)
    saveToLocal(updatedCart, wishlist)

    if (user && dbAvailable.cart_items) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .match({
            user_id: user.id,
            product_id: itemToRemove.productHandle,
            size: itemToRemove.size || null,
            color: itemToRemove.color || null
          })
        if (error) console.error('Error deleting cart item from Supabase', error)
      } catch (err) {
        console.error('Error in removeFromCart db call', err)
      }
    }
  }

  // 5. Update Cart Quantity
  const updateCartQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    const itemToUpdate = cart.find(item => item.id === itemId)
    if (!itemToUpdate) return

    const updatedCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    )
    setCart(updatedCart)
    saveToLocal(updatedCart, wishlist)

    if (user && dbAvailable.cart_items) {
      try {
        // Delete existing items to clear duplicate rows and re-insert the single updated item
        await supabase
          .from('cart_items')
          .delete()
          .match({
            user_id: user.id,
            product_id: itemToUpdate.productHandle,
            size: itemToUpdate.size || null,
            color: itemToUpdate.color || null
          })

        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: itemToUpdate.productHandle,
            quantity,
            size: itemToUpdate.size || null,
            color: itemToUpdate.color || null
          })
        if (error) console.error('Error inserting updated cart item to Supabase', error)
      } catch (err) {
        console.error('Error in updateCartQuantity db call', err)
      }
    }
  }

  // 6. Clear Cart
  const clearCart = async () => {
    setCart([])
    saveToLocal([], wishlist)

    if (user && dbAvailable.cart_items) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
        if (error) console.error('Error clearing cart in Supabase', error)
      } catch (err) {
        console.error('Error clearing cart', err)
      }
    }
  }

  // 7. Toggle Wishlist
  const toggleWishlist = async (productHandle: string) => {
    if (!productHandle) return

    const exists = wishlist.includes(productHandle)
    let updatedWishlist: string[]

    if (exists) {
      updatedWishlist = wishlist.filter(handle => handle !== productHandle)
      toast.success('Removed from wishlist')

      if (user && dbAvailable.wishlists) {
        try {
          const { error } = await supabase
            .from('wishlists')
            .delete()
            .match({ user_id: user.id, product_id: productHandle })
          if (error) console.error('Error deleting wishlist from Supabase', error)
        } catch (err) {
          console.error('Error in toggleWishlist db delete', err)
        }
      }
    } else {
      updatedWishlist = [...wishlist, productHandle]
      toast.success('Added to wishlist')

      if (user && dbAvailable.wishlists) {
        try {
          const { error } = await supabase
            .from('wishlists')
            .insert({ user_id: user.id, product_id: productHandle })
          if (error) console.error('Error inserting wishlist to Supabase', error)
        } catch (err) {
          console.error('Error in toggleWishlist db insert', err)
        }
      }
    }

    setWishlist(updatedWishlist)
    saveToLocal(cart, updatedWishlist)
  }

  // 8. IsLiked check
  const isLiked = (productHandle: string) => {
    return wishlist.includes(productHandle)
  }

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        loading,
        user,
        currency,
        setCurrency,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isLiked
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
