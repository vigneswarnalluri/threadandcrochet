'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Link } from '@/components/Link'
import Prices from '@/components/Prices'
import toast from 'react-hot-toast'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CurrencyRupeeIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  TrashIcon,
  PlusIcon,
  UserGroupIcon,
  StarIcon,
  TagIcon,
  ChartBarIcon,
  DocumentArrowUpIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
  PrinterIcon,
  NoSymbolIcon,
  UserIcon,
  HomeIcon,
  ShoppingCartIcon,
  EnvelopeIcon,
  BellIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  number: string
  date: string
  status: string
  total: number
  items: OrderItem[]
  customer: {
    name: string
    email: string
  }
  carrier?: string
  tracking_number?: string
  created_at?: string
}

interface Customer {
  id: string
  name: string
  email: string
  role: string
  phone: string
  joinedAt: string
  orderCount: number
  totalSpent: number
  blocked?: boolean
}

interface CustomProduct {
  id: string
  title: string
  handle: string
  price: number
  imageUrl: string
  collectionHandle: string
  status: string
  careInstruction: string
  shippingAndReturn: string
  features: string[]
  description: string
  stock?: number
  images?: any[]
  options?: any[]
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  ogImage?: string
}

interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  title: string
  content: string
  authorName: string
  createdAt: string
}

interface Coupon {
  id: string
  code: string
  discount: number
  type: 'percent' | 'fixed'
  description: string
  active: boolean
}

interface ChartItem {
  label: string
  revenue: number
  itemsCount: number
}

interface AdminDashboardClientProps {
  orders: Order[]
  metrics: {
    totalCount: number
    totalRevenue: number
    paidCount: number
    processingCount: number
    shippedCount: number
    deliveredCount: number
    cancelledCount: number
  }
  initialSearch: string
  initialStatus: string
  customers: Customer[]
  products: CustomProduct[]
  reviews: Review[]
  coupons: Coupon[]
  chartData: ChartItem[]
  settings?: any[]
  initialNotifications?: any[]
  initialSupportTickets?: any[]
  initialActiveCarts?: any[]
  initialAuditLogs?: any[]
}

const VALID_STATUSES = ['Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']
const COLLECTIONS = [
  { name: 'Cozy Wearables', handle: 'jackets' },
  { name: 'Accessories & Decor', handle: 'accessories' },
  { name: 'Bags & Totes', handle: 'bags' },
  { name: 'Artisanal Baby Shoes', handle: 'shoes' },
  { name: 'Home Living Cushions', handle: 'coats' },
  { name: 'Keychains & Amigurumi', handle: 't-shirts' },
]

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '')
  if (lines.length <= 1) return []
  
  const parseLine = (line: string) => {
    const result = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    result.push(current)
    return result.map(s => s.trim().replace(/^"|"$/g, ''))
  }

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]+/g, ''))
  const products = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i])
    if (values.length < headers.length) continue
    
    const item: Record<string, string> = {}
    headers.forEach((header, index) => {
      item[header] = values[index]
    })
    products.push(item)
  }
  return products
}


export default function AdminDashboardClient({
  orders,
  metrics,
  initialSearch,
  initialStatus,
  customers = [],
  products = [],
  reviews = [],
  coupons = [],
  chartData = [],
  settings = [],
  initialNotifications = [],
  initialSupportTickets = [],
  initialActiveCarts = [],
  initialAuditLogs = [],
}: AdminDashboardClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'customers' | 'reviews' | 'coupons' | 'analytics' | 'settings' | 'carts' | 'support' | 'audit'>('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(initialStatus)
  const [updatingOrderNo, setUpdatingOrderNo] = useState<string | null>(null)

  // Enterprise Feature States
  const [notifications, setNotifications] = useState<any[]>(initialNotifications)
  const [supportTickets, setSupportTickets] = useState<any[]>(initialSupportTickets)
  const [activeCarts, setActiveCarts] = useState<any[]>(initialActiveCarts)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [auditLogs, setAuditLogs] = useState<any[]>(initialAuditLogs)
  const [refundingOrderId, setRefundingOrderId] = useState<string | null>(null)
  
  // Product Stock History States
  const [selectedStockLogProduct, setSelectedStockLogProduct] = useState<CustomProduct | null>(null)
  const [productStockLogs, setProductStockLogs] = useState<any[]>([])
  const [loadingStockLogs, setLoadingStockLogs] = useState<boolean>(false)
  
  // CSV Import States
  const [parsedCsvProducts, setParsedCsvProducts] = useState<any[] | null>(null)
  const [csvFileName, setCsvFileName] = useState<string>('')
  
  // Audit Trail states
  const [auditSearchTerm, setAuditSearchTerm] = useState('')
  const [selectedAuditActionFilter, setSelectedAuditActionFilter] = useState('')
  const [refreshingAuditLogs, setRefreshingAuditLogs] = useState(false)
  
  // Cart Recovery Campaign states
  const [selectedRecoveryCart, setSelectedRecoveryCart] = useState<any | null>(null)
  const [recoveryCouponCode, setRecoveryCouponCode] = useState('')
  const [recoveryCustomMessage, setRecoveryCustomMessage] = useState('')
  const [sendingRecovery, setSendingRecovery] = useState(false)

  // Phase 7 Control Center States
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'vip' | 'slipping' | 'frequent'>('all')
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [campaignSubject, setCampaignSubject] = useState('')
  const [campaignBody, setCampaignBody] = useState('')
  const [sendingCampaign, setSendingCampaign] = useState(false)

  const [liveVisitors, setLiveVisitors] = useState<any[]>([])
  const [loadingVisitors, setLoadingVisitors] = useState(false)

  const [giftCards, setGiftCards] = useState<any[]>([])
  const [giftCode, setGiftCode] = useState('')
  const [giftBalance, setGiftBalance] = useState('')
  const [giftExpiry, setGiftExpiry] = useState('')
  const [generatingGiftCard, setGeneratingGiftCard] = useState(false)

  const [creditAmount, setCreditAmount] = useState('')
  const [creditReason, setCreditReason] = useState('')
  const [adjustingCredit, setAdjustingCredit] = useState(false)

  const [homepageLayout, setHomepageLayout] = useState<any[]>([])
  const [savingLayout, setSavingLayout] = useState(false)
  
  // Support quick reply text states keyed by ticket ID
  // Poll notifications, support tickets, and active carts every 12 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const [notifRes, ticketRes, cartRes] = await Promise.all([
          fetch('/api/admin/notifications'),
          fetch('/api/admin/support'),
          fetch('/api/admin/carts')
        ])

        if (notifRes.ok) {
          const notifData = await notifRes.json()
          if (notifData.success) setNotifications(notifData.notifications)
        }
        if (ticketRes.ok) {
          const ticketData = await ticketRes.json()
          if (ticketData.success) setSupportTickets(ticketData.tickets)
        }
        if (cartRes.ok) {
          const cartData = await cartRes.json()
          if (cartData.success) setActiveCarts(cartData.carts)
        }
      } catch (e) {
        console.error('Polling error:', e)
      }
    }, 12000)

    return () => clearInterval(pollInterval)
  }, [])

  // Initialize Homepage Layout Builder
  useEffect(() => {
    const layoutSetting = settings?.find(s => s.key === 'homepage_layout')?.value
    if (layoutSetting && Array.isArray(layoutSetting)) {
      setHomepageLayout(layoutSetting)
    } else {
      setHomepageLayout([
        { id: 'hero', name: 'Hero Slider', visible: true },
        { id: 'featured_collections', name: 'Featured Collections Slider', visible: true },
        { id: 'new_arrivals', name: 'New Arrivals Products', visible: true },
        { id: 'how_it_works', name: 'How It Works Panel', visible: true },
        { id: 'promo_1', name: 'Promotion Banner 1', visible: true },
        { id: 'explore', name: 'Explore Collections Grid', visible: true },
        { id: 'best_sellers', name: 'Best Sellers Slider', visible: true },
        { id: 'promo_2', name: 'Promotion Banner 2', visible: true },
        { id: 'large_product', name: 'Large Product Spotlight', visible: true },
        { id: 'featured_products', name: 'Featured Items Grid', visible: true },
        { id: 'departments', name: 'Department Collections Slider', visible: true },
        { id: 'blog', name: 'Latest Crafting Journal Blog', visible: true },
        { id: 'reviews', name: 'Customer Testimonials Slider', visible: true }
      ])
    }
  }, [settings])

  // Fetch gift cards on mount
  const fetchGiftCards = async () => {
    try {
      const res = await fetch('/api/admin/gift-cards')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setGiftCards(data.giftCards || [])
        }
      }
    } catch (err) {
      console.warn('Failed to fetch gift cards:', err)
    }
  }

  useEffect(() => {
    fetchGiftCards()
  }, [])

  // Poll active storefront visitors (only when overview tab is active)
  useEffect(() => {
    if (activeTab !== 'overview') return

    const fetchVisitors = async () => {
      try {
        const res = await fetch('/api/admin/visitors')
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setLiveVisitors(data.visitors || [])
          }
        }
      } catch (err) {
        console.warn('Failed to fetch visitors:', err)
      }
    }

    fetchVisitors()
    const interval = setInterval(fetchVisitors, 5000)
    return () => clearInterval(interval)
  }, [activeTab])

  const handleMarkNotificationRead = async (id: string, isRead: boolean) => {
    if (isRead) return
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      }
    } catch (e) {
      console.error('Failed to mark notification as read:', e)
    }
  }

  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      }
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const [ticketReplyText, setTicketReplyText] = useState<Record<string, string>>({})

  // Product Form states
  const [editingProduct, setEditingProduct] = useState<CustomProduct | null>(null)
  const [productForm, setProductForm] = useState({
    title: '',
    price: '',
    description: '',
    imageUrl: '',
    galleryUrlsText: '',
    collectionHandle: 'accessories',
    status: 'New in',
    careInstruction: '',
    shippingAndReturn: '',
    featuresText: '',
    stock: '10',
    colorsText: '',
    sizesText: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogImage: '',
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Extra features states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [stockUpdatingId, setStockUpdatingId] = useState<string | null>(null)
  const [analyticsDateFilter, setAnalyticsDateFilter] = useState<'today' | '7days' | '30days' | 'all'>('all')

  // Global settings parsed states
  const initialAnnouncement = settings?.find((s: any) => s.key === 'announcement')?.value || 'Free shipping on all prepaid orders over ₹999!'
  const initialContact = settings?.find((s: any) => s.key === 'contact')?.value || { phone: '+91 98765 43210', email: 'support@threadandlove.com' }
  const initialRates = settings?.find((s: any) => s.key === 'rates')?.value || { tax: 5, shipping: 99 }
  const initialBanners = settings?.find((s: any) => s.key === 'banners')?.value || []

  const [announcement, setAnnouncement] = useState<string>(initialAnnouncement)
  const [contactPhone, setContactPhone] = useState<string>(initialContact.phone)
  const [contactEmail, setContactEmail] = useState<string>(initialContact.email)
  const [taxRate, setTaxRate] = useState<string>(String(initialRates.tax))
  const [shippingFee, setShippingFee] = useState<string>(String(initialRates.shipping))
  const [banners, setBanners] = useState<any[]>(initialBanners)
  const [newSlide, setNewSlide] = useState({ title: '', subtitle: '', image: '', link: '' })


  // Coupon Form states
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount: '',
    type: 'percent' as 'percent' | 'fixed',
    description: '',
  })

  const [isPending, startTransition] = useTransition()

  // ----------------------------------------------------
  // CSV DATA REPORTS EXPORT
  // ----------------------------------------------------
  const exportToCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [
          headers.join(","), 
          ...rows.map(e => e.map(val => `"${(val || '').replace(/"/g, '""')}"`).join(","))
        ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const exportOrders = () => {
    const headers = ["Order Number", "Date", "Customer Name", "Customer Email", "Status", "Grand Total (INR)", "Items"]
    const rows = orders.map(o => [
      o.number,
      o.date,
      o.customer.name,
      o.customer.email,
      o.status,
      `₹${Math.round(o.total * 84)}`,
      o.items.map(it => `${it.name} (x${it.quantity})`).join("; ")
    ])
    exportToCSV("orders_report.csv", headers, rows)
  }

  const exportProducts = () => {
    const headers = ["Product ID", "Title", "Price (INR)", "Collection", "Stock", "Status", "Features"]
    const rows = products.map(p => [
      p.id,
      p.title,
      `₹${p.price}`,
      p.collectionHandle,
      String(p.stock !== undefined ? p.stock : 10),
      p.status,
      (p.features || []).join("; ")
    ])
    exportToCSV("products_catalog.csv", headers, rows)
  }

  const exportCustomers = () => {
    const headers = ["Customer ID", "Name", "Email", "Phone", "Role", "Joined Date", "Orders Count", "Total Spent (INR)", "Status"]
    const rows = customers.map(c => [
      c.id,
      c.name,
      c.email,
      c.phone || "N/A",
      c.role,
      c.joinedAt,
      String(c.orderCount),
      `₹${Math.round(c.totalSpent * 84)}`,
      c.blocked ? "Blocked" : "Active"
    ])
    exportToCSV("customers_directory.csv", headers, rows)
  }

  // ----------------------------------------------------
  // SEARCH / FILTER ROUTING
  // ----------------------------------------------------
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim())
    } else {
      params.delete('search')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatusFilter(status)
    const params = new URLSearchParams(searchParams.toString())
    if (status) {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedStatusFilter('')
    router.push(pathname)
  }

  // ----------------------------------------------------
  // SERVER API MUTATIONS
  // ----------------------------------------------------
  const handleStatusUpdate = async (orderNumber: string, newStatus: string) => {
    setUpdatingOrderNo(orderNumber)
    try {
      const response = await fetch('/api/admin/update-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, status: newStatus }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update status')
      toast.success(`Order #${orderNumber} status updated to ${newStatus}`)
      startTransition(() => { router.refresh() })
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setUpdatingOrderNo(null)
    }
  }

  const handleRefund = async (order: Order) => {
    if (!confirm(`Are you sure you want to refund order #${order.number}? This will refund the payment via Razorpay, restore items to stock, send a confirmation email, and log the action.`)) {
      return
    }
    setRefundingOrderId(order.id)
    try {
      const res = await fetch('/api/admin/orders/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Refund issued successfully! (Method: ${data.refundMethod})`)
        setSelectedOrder(prev => prev ? { ...prev, status: 'Refunded' } : null)
        startTransition(() => {
          router.refresh()
        })
      } else {
        toast.error(data.error || 'Failed to issue refund')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error executing refund')
    } finally {
      setRefundingOrderId(null)
    }
  }

  const handleFetchStockLogs = async (product: CustomProduct) => {
    setSelectedStockLogProduct(product)
    setLoadingStockLogs(true)
    setProductStockLogs([])
    try {
      const res = await fetch(`/api/admin/products/stock-logs?productId=${product.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setProductStockLogs(data.logs || [])
        } else {
          toast.error(data.error || 'Failed to load stock logs')
        }
      } else {
        toast.error('Failed to query stock logs')
      }
    } catch (e: any) {
      toast.error(e.message || 'Error fetching stock logs')
    } finally {
      setLoadingStockLogs(false)
    }
  }

  const handleRefreshAuditLogs = async () => {
    setRefreshingAuditLogs(true)
    try {
      const res = await fetch('/api/admin/audit-logs')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setAuditLogs(data.logs || [])
          toast.success('Audit trail logs refreshed')
        } else {
          toast.error(data.error || 'Failed to fetch logs')
        }
      } else {
        toast.error('Failed to reload logs')
      }
    } catch (e: any) {
      toast.error(e.message || 'Error reloading audit logs')
    } finally {
      setRefreshingAuditLogs(false)
    }
  }

  const handleSendCartRecovery = async () => {
    if (!selectedRecoveryCart) return
    setSendingRecovery(true)
    try {
      const res = await fetch('/api/admin/carts/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedRecoveryCart.user.id,
          couponCode: recoveryCouponCode || undefined,
          customMessage: recoveryCustomMessage || undefined
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Recovery email sent successfully to ${selectedRecoveryCart.user.email}!`)
        setSelectedRecoveryCart(null)
        setRecoveryCouponCode('')
        setRecoveryCustomMessage('')
        handleRefreshAuditLogs()
      } else {
        toast.error(data.error || 'Failed to send recovery email')
      }
    } catch (e: any) {
      toast.error(e.message || 'Error sending recovery email')
    } finally {
      setSendingRecovery(false)
    }
  }

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setProductForm(prev => ({ ...prev, imageUrl: data.url }))
      toast.success('Image uploaded successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploadingImage(false)
    }
  }  // Product mutations
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    const features = productForm.featuresText.split('\n').map(f => f.trim()).filter(Boolean)
    const galleryUrls = productForm.galleryUrlsText.split(/[\n,]/).map(url => url.trim()).filter(Boolean)
    const colors = productForm.colorsText.split(',').map(c => c.trim()).filter(Boolean)
    const sizes = productForm.sizesText.split(',').map(s => s.trim()).filter(Boolean)

    const payload = {
      id: editingProduct?.id,
      title: productForm.title,
      price: Number(productForm.price),
      description: productForm.description,
      imageUrl: productForm.imageUrl,
      galleryUrls,
      collectionHandle: productForm.collectionHandle,
      status: productForm.status,
      careInstruction: productForm.careInstruction,
      shippingAndReturn: productForm.shippingAndReturn,
      features,
      stock: Number(productForm.stock || 10),
      colors,
      sizes,
      metaTitle: productForm.metaTitle,
      metaDescription: productForm.metaDescription,
      metaKeywords: productForm.metaKeywords,
      ogImage: productForm.ogImage
    }

    try {
      const method = editingProduct ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save product')

      toast.success(editingProduct ? 'Product edited successfully!' : 'Product added successfully!')
      setProductForm({
        title: '',
        price: '',
        description: '',
        imageUrl: '',
        galleryUrlsText: '',
        collectionHandle: 'accessories',
        status: 'New in',
        careInstruction: '',
        shippingAndReturn: '',
        featuresText: '',
        stock: '10',
        colorsText: '',
        sizesText: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        ogImage: '',
      })
      setEditingProduct(null)
      startTransition(() => { router.refresh() })
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product')
    } finally {
      setActionLoading(false)
    }
  }

  const handleProductDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom product? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      toast.success('Product deleted successfully')
      startTransition(() => { router.refresh() })
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleStockAdjust = async (productId: string, newStock: number) => {
    if (newStock < 0) return
    setStockUpdatingId(productId)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, stock: newStock }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update stock')
      toast.success('Stock level updated')
      startTransition(() => { router.refresh() })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setStockUpdatingId(null)
    }
  }

  const handleCustomerBlockToggle = async (userId: string, currentBlocked: boolean) => {
    if (!confirm(`Are you sure you want to ${currentBlocked ? 'unblock' : 'block'} this customer?`)) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/profiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, blocked: !currentBlocked }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update status')
      toast.success(currentBlocked ? 'Customer unblocked successfully' : 'Customer blocked successfully')
      startTransition(() => { router.refresh() })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSettingsSave = async (key: string, value: any) => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save settings')
      toast.success('Store settings updated successfully!')
      startTransition(() => { router.refresh() })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCampaignSend = async (emails: string[]) => {
    if (!campaignSubject.trim() || !campaignBody.trim()) {
      toast.error('Please enter a subject and email body')
      return
    }
    setSendingCampaign(true)
    try {
      const res = await fetch('/api/admin/customers/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails,
          subject: campaignSubject,
          body: campaignBody
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch email campaign')
      toast.success(data.message || 'Campaign sent successfully!')
      setShowCampaignModal(false)
      setCampaignSubject('')
      setCampaignBody('')
      startTransition(() => { router.refresh() })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSendingCampaign(false)
    }
  }

  const handleGenerateGiftCard = async () => {
    if (!giftBalance || isNaN(Number(giftBalance)) || Number(giftBalance) <= 0) {
      toast.error('Please enter a valid balance')
      return
    }
    setGeneratingGiftCard(true)
    try {
      const res = await fetch('/api/admin/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: giftCode.trim() || undefined,
          balance: Number(giftBalance),
          expiresAt: giftExpiry || null
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate gift card')
      toast.success(`Generated gift card: ${data.giftCard?.code}`)
      setGiftCode('')
      setGiftBalance('')
      setGiftExpiry('')
      fetchGiftCards()
      startTransition(() => { router.refresh() })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setGeneratingGiftCard(false)
    }
  }

  const handleDeactivateGiftCard = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this gift card?')) return
    try {
      const res = await fetch(`/api/admin/gift-cards?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to deactivate')
      toast.success('Gift card deactivated')
      fetchGiftCards()
      startTransition(() => { router.refresh() })
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleStoreCreditAdjust = async (userId: string) => {
    if (!creditAmount || isNaN(Number(creditAmount)) || Number(creditAmount) === 0) {
      toast.error('Please enter a non-zero adjustment amount')
      return
    }
    setAdjustingCredit(true)
    try {
      const res = await fetch('/api/admin/customers/store-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: Number(creditAmount),
          reason: creditReason
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to adjust credit')
      toast.success(data.message || 'Store credit adjusted')
      setCreditAmount('')
      setCreditReason('')
      startTransition(() => { router.refresh() })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setAdjustingCredit(false)
    }
  }

  const handleEditInit = (prod: CustomProduct) => {
    setEditingProduct(prod)
    const galleryUrls = (prod.images || []).slice(1).map((img: any) => typeof img === 'string' ? img : img.src || '')
    const colorOpts = (prod.options || []).find((o: any) => o.name === 'Color')?.optionValues || []
    const sizeOpts = (prod.options || []).find((o: any) => o.name === 'Size')?.optionValues || []

    setProductForm({
      title: prod.title,
      price: prod.price.toString(),
      description: prod.description,
      imageUrl: prod.imageUrl,
      galleryUrlsText: galleryUrls.join(', '),
      collectionHandle: prod.collectionHandle,
      status: prod.status,
      careInstruction: prod.careInstruction,
      shippingAndReturn: prod.shippingAndReturn,
      featuresText: (prod.features || []).join('\n'),
      stock: (prod.stock !== undefined ? prod.stock : 10).toString(),
      colorsText: colorOpts.map((v: any) => v.name).join(', '),
      sizesText: sizeOpts.map((v: any) => v.name).join(', '),
      metaTitle: prod.metaTitle || '',
      metaDescription: prod.metaDescription || '',
      metaKeywords: prod.metaKeywords || '',
      ogImage: prod.ogImage || '',
    })
  }

  // Customer role toggle
  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!confirm(`Are you sure you want to change this customer's role to ${newRole}?`)) return

    try {
      const res = await fetch('/api/admin/profiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update role')
      toast.success(`Role updated successfully to ${newRole}!`)
      startTransition(() => { router.refresh() })
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // Review delete
  const handleReviewDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this customer review?')) return
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      toast.success('Review deleted')
      startTransition(() => { router.refresh() })
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // Coupon mutations
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)

    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponForm.code,
          discount: Number(couponForm.discount),
          type: couponForm.type,
          description: couponForm.description,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Coupon creation failed')
      toast.success(`Coupon ${couponForm.code.toUpperCase()} created successfully!`)
      setCouponForm({ code: '', discount: '', type: 'percent', description: '' })
      startTransition(() => { router.refresh() })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCouponDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this discount coupon code?')) return
    try {
      const res = await fetch(`/api/admin/discounts?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      toast.success('Coupon code deleted')
      startTransition(() => { router.refresh() })
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // Support Ticket Handlers
  const handleTicketStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSupportTickets(prev => prev.map(t => t.id === id ? data.ticket : t))
        toast.success(`Ticket status updated to ${newStatus}`)
      } else {
        toast.error(data.error || 'Failed to update ticket status')
      }
    } catch (e: any) {
      toast.error(e.message || 'Error updating status')
    }
  }

  const handleTicketReplySubmit = async (id: string) => {
    const replyText = ticketReplyText[id]
    if (!replyText || !replyText.trim()) {
      toast.error('Reply message cannot be empty')
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Resolved', replyText: replyText.trim() })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSupportTickets(prev => prev.map(t => t.id === id ? data.ticket : t))
        setTicketReplyText(prev => ({ ...prev, [id]: '' }))
        toast.success(data.emailSent ? 'Reply sent via email & ticket marked as Resolved!' : 'Ticket reply saved!')
      } else {
        toast.error(data.error || 'Failed to submit ticket reply')
      }
    } catch (e: any) {
      toast.error(e.message || 'Error submitting reply')
    } finally {
      setActionLoading(false)
    }
  }

  // CSV Bulk Upload Handlers
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvFileName(file.name)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return
      
      try {
        const parsed = parseCSV(text)
        if (parsed.length === 0) {
          toast.error('No products found in CSV or invalid format.')
          setParsedCsvProducts(null)
          return
        }
        setParsedCsvProducts(parsed)
        toast.success(`Parsed ${parsed.length} products. Review details below.`)
      } catch (err) {
        toast.error('Error parsing CSV file.')
        setParsedCsvProducts(null)
      }
    }
    reader.readAsText(file)
  }

  const handleBatchUploadSubmit = async () => {
    if (!parsedCsvProducts || parsedCsvProducts.length === 0) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/products/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: parsedCsvProducts })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Successfully uploaded ${data.count} products!`)
        setParsedCsvProducts(null)
        setCsvFileName('')
        startTransition(() => { router.refresh() })
      } else {
        toast.error(data.error || 'Failed to upload products batch')
      }
    } catch (e: any) {
      toast.error(e.message || 'Error uploading products batch')
    } finally {
      setActionLoading(false)
    }
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'text-green-800 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
      case 'Processing':
        return 'text-blue-800 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
      case 'Shipped':
        return 'text-purple-800 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400'
      case 'Delivered':
        return 'text-emerald-800 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'Cancelled':
      case 'Refunded':
        return 'text-rose-800 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400'
      default:
        return 'text-neutral-800 bg-neutral-100 dark:bg-neutral-900/30 dark:text-neutral-400'
    }
  }

  // Custom SVG Charts calculations
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1000)
  const chartHeight = 200
  const chartWidth = 500

  return (
    <div className="space-y-10">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-150 dark:border-neutral-850 pb-5 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-600 dark:text-neutral-300 transition shadow-sm lg:flex hidden items-center justify-center shrink-0"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronDoubleRightIcon className="h-5 w-5" />
            ) : (
              <ChevronDoubleLeftIcon className="h-5 w-5" />
            )}
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-amber-600">
              Thread &amp; Love
            </h1>
            <p className="text-2xs text-neutral-450 dark:text-neutral-555 font-bold mt-1 uppercase tracking-wider">
              Admin Enterprise Control Center
            </p>
          </div>
        </div>
        
        {/* Notifications Center Bell & Dropdown */}
        <div className="relative self-end sm:self-center">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-600 dark:text-neutral-300 transition shadow-sm"
          >
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-3.5 w-80 sm:w-96 rounded-3xl border border-neutral-200 dark:border-neutral-850 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-2xl p-5 z-50 animate-fadeIn space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-400">Live Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    className="text-[10px] font-bold text-primary-600 hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-850">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-neutral-450">
                    No active notifications
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkNotificationRead(notif.id, notif.read)}
                      className={`py-3 flex gap-3 cursor-pointer items-start text-xs transition ${
                        notif.read ? 'opacity-65 hover:opacity-100' : 'font-semibold bg-neutral-50/50 dark:bg-neutral-800/10 px-2.5 py-2 rounded-2xl'
                      }`}
                    >
                      <span className="text-base leading-none">
                        {notif.type === 'new_order' ? '📦' : notif.type === 'new_review' ? '⭐' : notif.type === 'low_stock' ? '⚠️' : '✉️'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed text-[11px]">
                          {notif.message}
                        </p>
                        <span className="text-[9px] text-neutral-400 block mt-1">
                          {new Date(notif.created_at).toLocaleString()}
                        </span>
                      </div>
                      {!notif.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-600 self-center shrink-0"></span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Responsive layout container: Left Sidebar + Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Side Navigation Panel */}
        {!sidebarCollapsed && (
          <div className="lg:col-span-1 print:hidden">
            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-none sticky top-6 bg-neutral-50 dark:bg-neutral-900/30 p-2.5 lg:p-4 rounded-2xl lg:rounded-3xl border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200 dark:border-neutral-800 lg:flex hidden">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Navigation</span>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  title="Collapse Sidebar"
                >
                  <ChevronDoubleLeftIcon className="h-4 w-4" />
                </button>
              </div>
              {[
                { id: 'overview', name: 'Overview', icon: HomeIcon },
                { id: 'orders', name: 'Orders', icon: ClipboardDocumentListIcon },
                { id: 'products', name: 'Products Catalog', icon: TagIcon },
                { id: 'customers', name: 'Customers', icon: UserGroupIcon },
                { id: 'carts', name: 'Active Carts', icon: ShoppingCartIcon },
                { id: 'support', name: 'Support Inbox', icon: EnvelopeIcon },
                { id: 'reviews', name: 'Reviews Moderation', icon: StarIcon },
                { id: 'coupons', name: 'Coupons', icon: TagIcon },
                { id: 'analytics', name: 'Sales Analytics', icon: ChartBarIcon },
                { id: 'settings', name: 'Store Settings', icon: Cog6ToothIcon },
                { id: 'audit', name: 'Audit Trail', icon: ClockIcon },
              ].map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2.5 py-3 px-4 text-xs font-bold rounded-xl lg:rounded-2xl transition whitespace-nowrap ${
                      isActive
                        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                        : 'text-neutral-500 dark:text-neutral-450 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-neutral-850/30'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        )}

        {/* Right Side Content Canvas */}
        <div className={sidebarCollapsed ? "lg:col-span-4 min-w-0" : "lg:col-span-3 min-w-0"}>

      {/* ---------------------------------------------------- */}
      {/* TAB: OVERVIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Today's Sales"
              value={`₹${Math.round(
                orders
                  .filter(o => o.date === new Date().toLocaleDateString('en-IN') || o.date === new Date().toLocaleDateString())
                  .reduce((sum, o) => sum + o.total, 0) * 84
              ).toLocaleString('en-IN')}`}
              icon={CurrencyRupeeIcon}
              description="Gross sales placed today"
              colorClass="text-emerald-600 bg-emerald-500"
            />
            <MetricCard
              title="Average Order Value"
              value={`₹${Math.round(
                (metrics.totalCount > 0 ? metrics.totalRevenue / metrics.totalCount : 0) * 84
              ).toLocaleString('en-IN')}`}
              icon={ChartBarIcon}
              description="Average value per customer cart"
              colorClass="text-blue-600 bg-blue-500"
            />
            <MetricCard
              title="Pending Shipments"
              value={metrics.paidCount + metrics.processingCount}
              icon={ClockIcon}
              description="Orders waiting to be dispatched"
              colorClass="text-amber-600 bg-amber-500"
            />
            <MetricCard
              title="Low Stock Items"
              value={products.filter(p => (p.stock !== undefined ? p.stock : 10) < 5).length}
              icon={TagIcon}
              description="Inventory items running out"
              colorClass={products.filter(p => (p.stock !== undefined ? p.stock : 10) < 5).length > 0 ? "text-rose-600 bg-rose-500" : "text-neutral-600 bg-neutral-500"}
            />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Left Column Stack */}
            <div className="md:col-span-1 space-y-6">
              {/* Quick Actions Panel */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/50 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-450">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-neutral-200 hover:bg-neutral-50 text-left font-semibold text-neutral-800 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-neutral-200 transition"
                  >
                    <ClipboardDocumentListIcon className="h-4.5 w-4.5 text-neutral-500" />
                    <span>Ship Pending Orders</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-neutral-200 hover:bg-neutral-50 text-left font-semibold text-neutral-800 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-neutral-200 transition"
                  >
                    <PlusIcon className="h-4.5 w-4.5 text-neutral-500" />
                    <span>Add New Store Product</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('coupons')}
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-neutral-200 hover:bg-neutral-50 text-left font-semibold text-neutral-800 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-neutral-200 transition"
                  >
                    <TagIcon className="h-4.5 w-4.5 text-neutral-500" />
                    <span>Create Discount Coupon</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-neutral-200 hover:bg-neutral-50 text-left font-semibold text-neutral-800 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-neutral-200 transition"
                  >
                    <Cog6ToothIcon className="h-4.5 w-4.5 text-neutral-500" />
                    <span>Update Tax & Shipping</span>
                  </button>
                </div>
              </div>

              {/* Live Storefront Visitor Monitor */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-450">Live Traffic</h3>
                  <div className="flex items-center gap-1.5 bg-green-500/10 text-green-700 dark:text-green-400 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span>{liveVisitors.length} Online</span>
                  </div>
                </div>

                {liveVisitors.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-455 italic">
                    No active storefront sessions
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                    {liveVisitors.map((visitor, idx) => {
                      const diffSecs = Math.max(0, Math.floor((Date.now() - new Date(visitor.last_active_at).getTime()) / 1000))
                      const timeString = diffSecs < 10 ? 'Just now' : `${diffSecs}s ago`

                      return (
                        <div key={visitor.session_id || idx} className="text-xs p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/20 border border-neutral-100 dark:border-neutral-800/60 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[140px]" title={visitor.user_email || 'Anonymous Guest'}>
                              {visitor.user_email || 'Anonymous Guest'}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-medium">{timeString}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-neutral-500">
                            <span className="truncate max-w-[130px] font-mono text-neutral-450" title={visitor.current_page}>{visitor.current_page}</span>
                            <div className="flex items-center gap-1 text-primary-600 font-semibold bg-primary-50/50 dark:bg-primary-950/20 px-1.5 py-0.5 rounded">
                              <ShoppingCartIcon className="h-3 w-3" />
                              <span>{visitor.cart_items_count}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Inventory Alerts & Banners */}
            <div className="md:col-span-2 space-y-6">
              {products.filter(p => (p.stock !== undefined ? p.stock : 10) < 5).length > 0 ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-500/5 p-6 dark:border-rose-950 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">⚠️</span>
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Low Stock Warnings</h4>
                      <p className="text-xs text-neutral-500 mt-1">The following items are running low on stock and need restocking soon:</p>
                    </div>
                  </div>
                  <div className="divide-y divide-rose-100 dark:divide-rose-950 border-t border-rose-100 dark:border-rose-950 pt-2 text-xs max-h-48 overflow-y-auto">
                    {products
                      .filter(p => (p.stock !== undefined ? p.stock : 10) < 5)
                      .map(p => (
                        <div key={p.id} className="py-2.5 flex justify-between items-center">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{p.title}</span>
                          <span className="font-extrabold text-rose-600">{p.stock} remaining</span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/50 flex flex-col items-center justify-center py-12 text-center text-xs">
                  <CheckCircleIcon className="h-10 w-10 text-emerald-500 mb-3" />
                  <h4 className="font-bold text-neutral-900 dark:text-white">All Inventory Healthy</h4>
                  <p className="text-neutral-450 mt-1">There are no low stock warnings at this time.</p>
                </div>
              )}

              {/* Recent Orders Overview */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-450">Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-primary-600">View All</button>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-850">
                  {orders.slice(0, 4).map(o => (
                    <div key={o.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-neutral-900 dark:text-white">Order #{o.number}</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">{o.customer.name} • {o.items.length} item(s)</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-neutral-900 dark:text-white">₹{Math.round(o.total * 84).toLocaleString('en-IN')}</div>
                        <span className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold mt-1 ${getStatusColor(o.status)}`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: ORDERS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Metrics summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={`₹${Math.round(metrics.totalRevenue * 84).toLocaleString('en-IN')}`}
              icon={CurrencyRupeeIcon}
              description="Gross lifetime store sales"
              colorClass="text-emerald-600 bg-emerald-500"
            />
            <MetricCard
              title="Total Orders"
              value={metrics.totalCount}
              icon={ClipboardDocumentListIcon}
              description="Total orders placed"
              colorClass="text-neutral-600 bg-neutral-500"
            />
            <MetricCard
              title="Pending / Processing"
              value={metrics.paidCount + metrics.processingCount}
              icon={ClockIcon}
              description="Awaiting processing or pack"
              colorClass="text-blue-600 bg-blue-500"
            />
            <MetricCard
              title="Delivered"
              value={metrics.deliveredCount}
              icon={CheckCircleIcon}
              description="Orders completed successfully"
              colorClass="text-green-600 bg-green-500"
            />
          </div>

          {/* Search/Filter wrapper */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800/20">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search orders (order #, customer, email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <MagnifyingGlassIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
            </form>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={exportOrders}
                className="flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2 text-xs font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white transition"
              >
                <span>Export CSV</span>
              </button>

              <FunnelIcon className="h-4 w-4 text-neutral-450" />
              <select
                value={selectedStatusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <option value="">All Statuses</option>
                {VALID_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {(searchTerm || selectedStatusFilter) && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-primary-600"
                >
                  <ArrowPathIcon className="h-4 w-4" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Orders list */}
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-neutral-455" />
              <h3 className="mt-4 text-sm font-semibold text-neutral-905 dark:text-white">No Orders Found</h3>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-750 dark:bg-neutral-800/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-750 dark:bg-neutral-800/30">
                      <th className="py-3 px-5">Order</th>
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Customer</th>
                      <th className="py-3 px-5">Items</th>
                      <th className="py-3 px-5">Total</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-750 text-xs">
                    {orders.map(order => {
                      const isUpdating = updatingOrderNo === order.number
                      return (
                        <tr key={order.id} className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10">
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <Link href={`/orders/${order.number}`} className="font-bold text-primary-600">
                              #{order.number}
                            </Link>
                          </td>
                          <td className="py-3.5 px-5 whitespace-nowrap text-neutral-500">{order.date}</td>
                          <td className="py-3.5 px-5">
                            <div className="font-semibold">{order.customer.name}</div>
                            <div className="text-[10px] text-neutral-400">{order.customer.email}</div>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="max-w-[150px] truncate text-neutral-600 dark:text-neutral-350">
                              {order.items.map(it => `${it.name} (x${it.quantity})`).join(', ')}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 font-bold"><Prices price={order.total} plainText /></td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                              <select
                                disabled={isUpdating}
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order.number, e.target.value)}
                                className="text-[10px] rounded border border-neutral-350 bg-white px-1.5 py-0.5 outline-none dark:border-neutral-700 dark:bg-neutral-850"
                              >
                                {VALID_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              {isUpdating && <ArrowPathIcon className="h-3.5 w-3.5 animate-spin text-neutral-500" />}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 whitespace-nowrap text-right space-x-1.5">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="inline-flex rounded border border-neutral-300 px-2 py-1 text-[11px] font-semibold hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrder(order)
                                setTimeout(() => window.print(), 150)
                              }}
                              className="inline-flex rounded border border-neutral-300 px-2 py-1 text-[11px] font-semibold hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                            >
                              Print
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: PRODUCTS CATALOG */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="grid gap-8 lg:grid-cols-3 animate-fadeIn">
          {/* Add/Edit Product Form */}
          <div className="lg:col-span-1 rounded-2xl border border-neutral-200 bg-white p-5 space-y-5 dark:border-neutral-700 dark:bg-neutral-805">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {editingProduct ? 'Edit Product' : 'Add Custom Product'}
            </h3>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Amigurumi Teddy Bear"
                  value={productForm.title}
                  onChange={(e) => setProductForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Price (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Collection</label>
                  <select
                    value={productForm.collectionHandle}
                    onChange={(e) => setProductForm(prev => ({ ...prev, collectionHandle: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    {COLLECTIONS.map(col => <option key={col.handle} value={col.handle}>{col.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Featured Image</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                  <div className="flex items-center justify-center border-2 border-dashed border-neutral-300 rounded-xl p-4 transition hover:border-neutral-500 relative bg-neutral-50/50 dark:border-neutral-700 dark:bg-neutral-800/30">
                    {uploadingImage ? (
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <ArrowPathIcon className="h-4 w-4 animate-spin" /> Uploading...
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-1.5 cursor-pointer text-xs text-neutral-550">
                        <DocumentArrowUpIcon className="h-6 w-6 text-neutral-400" />
                        <span>Upload Custom Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="Describe your handcrafted crochet item..."
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-20 rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Key Features (One per line)</label>
                <textarea
                  placeholder="100% Organic Cotton&#10;Hypoallergenic materials"
                  value={productForm.featuresText}
                  onChange={(e) => setProductForm(prev => ({ ...prev, featuresText: e.target.value }))}
                  className="w-full h-16 rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Additional Gallery Images (Comma-separated URLs)</label>
                <textarea
                  placeholder="https://example.com/img2.jpg, https://example.com/img3.jpg"
                  value={productForm.galleryUrlsText}
                  onChange={(e) => setProductForm(prev => ({ ...prev, galleryUrlsText: e.target.value }))}
                  className="w-full h-14 rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Colors (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Beige, Pink, White"
                    value={productForm.colorsText}
                    onChange={(e) => setProductForm(prev => ({ ...prev, colorsText: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Sizes (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Small, Medium, Large"
                    value={productForm.sizesText}
                    onChange={(e) => setProductForm(prev => ({ ...prev, sizesText: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Stock Level</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="10"
                  value={productForm.stock}
                  onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">SEO & Social Settings</h4>
                
                <div>
                  <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Meta Title</label>
                  <input
                    type="text"
                    placeholder="Custom SEO Title"
                    value={productForm.metaTitle}
                    onChange={(e) => setProductForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Meta Description</label>
                  <textarea
                    placeholder="Custom SEO Description"
                    value={productForm.metaDescription}
                    onChange={(e) => setProductForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                    rows={2}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Meta Keywords (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="crochet, teddy bear, handcrafted"
                    value={productForm.metaKeywords}
                    onChange={(e) => setProductForm(prev => ({ ...prev, metaKeywords: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">OG Share Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/social-share.jpg"
                    value={productForm.ogImage}
                    onChange={(e) => setProductForm(prev => ({ ...prev, ogImage: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 rounded-xl bg-neutral-900 text-white font-bold py-2.5 text-xs transition disabled:opacity-50 dark:bg-primary-600"
                >
                  {actionLoading ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Create Product')}
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null)
                      setProductForm({
                        title: '',
                        price: '',
                        description: '',
                        imageUrl: '',
                        galleryUrlsText: '',
                        collectionHandle: 'accessories',
                        status: 'New in',
                        careInstruction: '',
                        shippingAndReturn: '',
                        featuresText: '',
                        stock: '10',
                        colorsText: '',
                        sizesText: '',
                        metaTitle: '',
                        metaDescription: '',
                        metaKeywords: '',
                        ogImage: '',
                      })
                    }}
                    className="rounded-xl border border-neutral-305 px-3 py-2.5 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Database Catalog Listings */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Supabase Custom Products</h3>
              {products.length > 0 && (
                <button
                  type="button"
                  onClick={exportProducts}
                  className="rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-1.5 text-xs font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white transition animate-fadeIn"
                >
                  Export Catalog CSV
                </button>
              )}
            </div>

            {/* CSV Import Box */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-750 dark:bg-neutral-800/10 space-y-4 animate-fadeIn">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-neutral-950 dark:text-white">Bulk Products CSV Import</h4>
                  <p className="text-2xs text-neutral-450 mt-1 leading-relaxed">
                    Upload a CSV file containing: <strong>title, price</strong>, description, imageUrl, galleryUrls, collectionHandle, stock, colors, sizes.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white cursor-pointer text-xs font-semibold transition shadow-sm w-full sm:w-auto justify-center">
                  <span>📂 Select CSV File</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileChange}
                    className="hidden"
                  />
                </label>
                {csvFileName && (
                  <span className="text-xs font-medium text-neutral-500 truncate max-w-xs">{csvFileName}</span>
                )}
                {parsedCsvProducts && (
                  <button
                    onClick={handleBatchUploadSubmit}
                    disabled={actionLoading}
                    className="sm:ml-auto w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Uploading...' : `Confirm Upload (${parsedCsvProducts.length} Items)`}
                  </button>
                )}
              </div>

              {parsedCsvProducts && (
                <div className="mt-4 rounded-xl border border-neutral-150 dark:border-neutral-750 max-h-48 overflow-y-auto divide-y divide-neutral-150 dark:divide-neutral-800 text-[10px]">
                  {parsedCsvProducts.slice(0, 5).map((p, idx) => (
                    <div key={idx} className="p-3 flex justify-between bg-neutral-50/20 dark:bg-neutral-800/5 hover:bg-neutral-50/50 transition">
                      <div>
                        <span className="font-bold text-neutral-850 dark:text-neutral-200">{p.title || 'Untitled'}</span>
                        <p className="text-neutral-450 mt-0.5 max-w-[300px] truncate">{p.description || 'No description'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold">₹{p.price || 0}</span>
                        <p className="text-neutral-450 mt-0.5">Stock: {p.stock || 10}</p>
                      </div>
                    </div>
                  ))}
                  {parsedCsvProducts.length > 5 && (
                    <div className="p-2.5 text-center text-neutral-450 bg-neutral-50/30 dark:bg-neutral-800/10 font-medium border-t border-neutral-150 dark:border-neutral-750">
                      and {parsedCsvProducts.length - 5} more items...
                    </div>
                  )}
                </div>
              )}
            </div>

            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
                <TagIcon className="mx-auto h-12 w-12 text-neutral-400" />
                <h4 className="mt-4 text-sm font-semibold">No Custom Products Added</h4>
                <p className="text-xs text-neutral-500 mt-1">Use the form to create your first database-backed product.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {products.map(prod => (
                  <div key={prod.id} className="flex gap-3 bg-white border border-neutral-200 rounded-2xl p-3.5 transition hover:shadow dark:border-neutral-750 dark:bg-neutral-800/10">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-50">
                      {prod.imageUrl && (
                        <img src={prod.imageUrl} alt={prod.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-semibold truncate text-sm text-neutral-950 dark:text-white">{prod.title}</h4>
                        <p className="text-xs text-neutral-500 mt-0.5">₹{prod.price}</p>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-primary-600 mt-1">
                          {COLLECTIONS.find(c => c.handle === prod.collectionHandle)?.name || prod.collectionHandle}
                        </p>
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span className="text-[10px] text-neutral-450 uppercase font-semibold">Stock:</span>
                          {(prod.stock !== undefined && prod.stock < 5) ? (
                            <span className="inline-flex items-center gap-1.5 rounded bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900/20 dark:text-amber-450 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Low Stock ({prod.stock})
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                              {prod.stock !== undefined ? prod.stock : 10}
                            </span>
                          )}
                          <div className="flex items-center gap-1 ml-auto">
                            <button
                              type="button"
                              disabled={stockUpdatingId === prod.id}
                              onClick={() => handleStockAdjust(prod.id, (prod.stock !== undefined ? prod.stock : 10) - 1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-neutral-100 hover:bg-neutral-250 dark:bg-neutral-800 text-[10px] font-bold text-neutral-700 dark:text-neutral-300"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              disabled={stockUpdatingId === prod.id}
                              onClick={() => handleStockAdjust(prod.id, (prod.stock !== undefined ? prod.stock : 10) + 1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-neutral-100 hover:bg-neutral-250 dark:bg-neutral-800 text-[10px] font-bold text-neutral-700 dark:text-neutral-300"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5 mt-2">
                        <button
                          type="button"
                          onClick={() => handleFetchStockLogs(prod)}
                          className="flex items-center gap-1 rounded bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-700 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          <ClockIcon className="h-3.5 w-3.5" /> Stock History
                        </button>
                        <button
                          onClick={() => handleEditInit(prod)}
                          className="flex items-center gap-1 rounded bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-700 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          <PencilSquareIcon className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleProductDelete(prod.id)}
                          className="flex items-center gap-1 rounded bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-900/20"
                        >
                          <TrashIcon className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: CUSTOMERS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'customers' && (() => {
        const vipThreshold = 10000 / 84
        const filteredCustomers = customers.filter(cust => {
          if (selectedSegment === 'all') return true
          if (selectedSegment === 'vip') return cust.totalSpent >= vipThreshold
          if (selectedSegment === 'slipping') {
            const joinedTime = new Date(cust.joinedAt).getTime()
            const daysSinceJoined = isNaN(joinedTime) ? 0 : (Date.now() - joinedTime) / (24 * 60 * 60 * 1000)
            return cust.orderCount === 0 && daysSinceJoined > 60
          }
          if (selectedSegment === 'frequent') return cust.orderCount >= 3
          return true
        })

        const vipCount = customers.filter(c => c.totalSpent >= vipThreshold).length
        const slippingCount = customers.filter(c => {
          const joinedTime = new Date(c.joinedAt).getTime()
          const daysSinceJoined = isNaN(joinedTime) ? 0 : (Date.now() - joinedTime) / (24 * 60 * 60 * 1000)
          return c.orderCount === 0 && daysSinceJoined > 60
        }).length
        const frequentCount = customers.filter(c => c.orderCount >= 3).length

        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Registered Users Directory</h3>
                <p className="text-xs text-neutral-500 mt-0.5 font-medium">Segment and engage your store customers</p>
              </div>
              <div className="flex items-center gap-2">
                {filteredCustomers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCampaignSubject(`Exclusive Offer for our ${selectedSegment === 'all' ? 'Customers' : selectedSegment === 'vip' ? 'VIPs' : selectedSegment === 'slipping' ? 'Valued Members' : 'Frequent Shoppers'}`)
                      setShowCampaignModal(true)
                    }}
                    className="rounded-xl bg-neutral-900 hover:bg-neutral-800 px-3.5 py-1.5 text-xs font-semibold text-white transition dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
                  >
                    Email Campaign
                  </button>
                )}
                {customers.length > 0 && (
                  <button
                    type="button"
                    onClick={exportCustomers}
                    className="rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-1.5 text-xs font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white transition cursor-pointer"
                  >
                    Export Directory CSV
                  </button>
                )}
              </div>
            </div>

            {/* Segment Selector Pills */}
            <div className="flex flex-wrap gap-2 p-1 bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl border border-neutral-200/60 dark:border-neutral-800">
              <button
                onClick={() => setSelectedSegment('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${selectedSegment === 'all' ? 'bg-white shadow-sm text-neutral-900 dark:bg-neutral-850 dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
              >
                All ({customers.length})
              </button>
              <button
                onClick={() => setSelectedSegment('vip')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${selectedSegment === 'vip' ? 'bg-white shadow-sm text-neutral-900 dark:bg-neutral-850 dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
              >
                💎 VIPs ({vipCount})
              </button>
              <button
                onClick={() => setSelectedSegment('slipping')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${selectedSegment === 'slipping' ? 'bg-white shadow-sm text-neutral-900 dark:bg-neutral-850 dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
              >
                💤 Slipping Away ({slippingCount})
              </button>
              <button
                onClick={() => setSelectedSegment('frequent')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${selectedSegment === 'frequent' ? 'bg-white shadow-sm text-neutral-900 dark:bg-neutral-850 dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
              >
                🔥 Frequent Shoppers ({frequentCount})
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-750 dark:bg-neutral-800/30">
                      <th className="py-3 px-5">Name</th>
                      <th className="py-3 px-5">Role</th>
                      <th className="py-3 px-5">Joined</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5">Total Orders</th>
                      <th className="py-3 px-5">Total Spent</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-750 text-xs">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-neutral-450 italic">
                          No customers found in this segment
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map(cust => (
                        <tr key={cust.id} className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/15">
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-neutral-900 dark:text-white">{cust.name}</div>
                            <div className="text-[10px] text-neutral-400">{cust.email}</div>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              cust.role === 'admin' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-450' : 'bg-neutral-100 text-neutral-700'
                            }`}>
                              {cust.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-neutral-500">{cust.joinedAt}</td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              cust.blocked ? 'bg-rose-105 text-rose-800 dark:bg-rose-900/20 dark:text-rose-450' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-455'
                            }`}>
                              {cust.blocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 font-medium">{cust.orderCount} orders</td>
                          <td className="py-3.5 px-5 font-bold">₹{Math.round(cust.totalSpent * 84).toLocaleString('en-IN')}</td>
                          <td className="py-3.5 px-5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedCustomer(cust)}
                              className="rounded border border-neutral-300 px-2 py-1 text-[10px] font-semibold hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 cursor-pointer"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleRoleToggle(cust.id, cust.role)}
                              className="rounded border border-neutral-300 px-2 py-1 text-[10px] font-semibold hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 cursor-pointer"
                            >
                              Toggle Role
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleCustomerBlockToggle(cust.id, !!cust.blocked)}
                              className={`rounded px-2.5 py-1 text-[10px] font-semibold text-white transition cursor-pointer ${
                                cust.blocked ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-650 hover:bg-rose-600'
                              }`}
                            >
                              {cust.blocked ? 'Unblock' : 'Block'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ---------------------------------------------------- */}
      {/* TAB: ACTIVE CARTS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'carts' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Active Customer Shopping Carts</h3>
              <p className="text-xs text-neutral-500 mt-1">Real-time monitoring of products currently held in shopper carts</p>
            </div>
            <span className="text-xs font-bold bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-xl text-neutral-700 dark:text-neutral-300">
              {activeCarts.length} Active Session(s)
            </span>
          </div>

          {activeCarts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
              <ShoppingCartIcon className="mx-auto h-12 w-12 text-neutral-450" />
              <h4 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white">No Active Carts</h4>
              <p className="text-xs text-neutral-500 mt-1">There are no customer carts saved in the database currently.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activeCarts.map((cart, idx) => (
                <div key={idx} className="bg-white border border-neutral-200 rounded-3xl p-5 dark:border-neutral-750 dark:bg-neutral-900/50 space-y-4 transition hover:shadow-sm">
                  {/* Cart Header */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center font-extrabold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 text-sm">
                      {cart.user?.avatar_url ? (
                        <img src={cart.user.avatar_url} alt={cart.user.full_name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        cart.user?.full_name?.charAt(0).toUpperCase() || 'C'
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{cart.user?.full_name || 'Anonymous User'}</h4>
                      <p className="text-2xs text-neutral-450">{cart.user?.email || 'No email'}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="text-xs font-extrabold text-neutral-900 dark:text-white">
                        ₹{Math.round(cart.totalValue * 84).toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] text-neutral-450 mt-0.5">{cart.totalItems} item(s)</p>
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <div className="border-t border-neutral-100 dark:border-neutral-805 pt-3.5 space-y-3">
                    {cart.items.map((item: any, idx2: number) => (
                      <div key={idx2} className="flex gap-3 items-center text-xs">
                        <div className="h-12 w-12 rounded-lg bg-neutral-50 shrink-0 overflow-hidden relative border border-neutral-100 dark:border-neutral-800">
                          {item.image && (
                            <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-neutral-900 dark:text-white truncate">{item.title}</h5>
                          <p className="text-[10px] text-neutral-500 mt-0.5">
                            {item.color ? `Color: ${item.color}` : ''}{item.color && item.size ? ' · ' : ''}{item.size ? `Size: ${item.size}` : ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-neutral-850 dark:text-neutral-200">
                            ₹{Math.round(item.price * 84).toLocaleString('en-IN')}
                          </span>
                          <p className="text-[10px] text-neutral-450 mt-0.5">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recovery Action Footer */}
                  {cart.user?.email && cart.user.email !== 'Unknown Email' && (
                    <div className="border-t border-neutral-100 dark:border-neutral-805 pt-3.5 flex justify-end">
                      <button
                        onClick={() => setSelectedRecoveryCart(cart)}
                        className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 text-xs font-semibold shadow-sm transition-colors"
                      >
                        <EnvelopeIcon className="w-3.5 h-3.5" /> Recovery Campaign
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: SUPPORT INBOX */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'support' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Customer Support Inbox</h3>
              <p className="text-xs text-neutral-500 mt-1">Read contact queries and send responses directly via Resend email</p>
            </div>
            <span className="text-xs font-bold bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-xl text-neutral-700 dark:text-neutral-300">
              {supportTickets.length} Inquiries
            </span>
          </div>

          {supportTickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
              <EnvelopeIcon className="mx-auto h-12 w-12 text-neutral-455 animate-pulse" />
              <h4 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white">Inbox Empty</h4>
              <p className="text-xs text-neutral-500 mt-1">No customer help inquiries found in the database.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {supportTickets.map((ticket) => {
                const hasReplied = !!ticket.reply_body
                const currentReply = ticketReplyText[ticket.id] || ''
                return (
                  <div key={ticket.id} className="bg-white border border-neutral-200 rounded-3xl p-6 dark:border-neutral-750 dark:bg-neutral-900/50 space-y-4 transition hover:shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                      <div>
                        <h4 className="font-bold text-sm text-neutral-950 dark:text-white flex items-center gap-2">
                          <span>{ticket.name}</span>
                          <span className="text-neutral-450 font-normal">({ticket.email})</span>
                        </h4>
                        <span className="text-[10px] text-neutral-450 mt-1 block">
                          Submitted on {new Date(ticket.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] uppercase font-semibold text-neutral-450">Status:</span>
                        <select
                          value={ticket.status || 'New'}
                          onChange={(e) => handleTicketStatusUpdate(ticket.id, e.target.value)}
                          className="text-[11px] font-bold rounded-lg border border-neutral-300 bg-neutral-50 px-2 py-1 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        >
                          <option value="New">New</option>
                          <option value="Pending">Pending</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          ticket.status === 'Resolved'
                            ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-450'
                            : ticket.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-450'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-955/20 dark:text-blue-450'
                        }`}>
                          {ticket.status || 'New'}
                        </span>
                      </div>
                    </div>

                    {/* Customer Message */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Customer Message</span>
                      <div className="bg-neutral-50/50 border border-neutral-100 p-4 rounded-2xl text-xs text-neutral-800 dark:bg-neutral-800/10 dark:border-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                        {ticket.message}
                      </div>
                    </div>

                    {/* Previous Reply Display */}
                    {hasReplied && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-455 uppercase tracking-wider block">✓ Sent Reply Details</span>
                        <div className="bg-emerald-500/5 border border-emerald-100 p-4 rounded-2xl text-xs text-neutral-705 dark:border-emerald-950 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                          {ticket.reply_body}
                        </div>
                      </div>
                    )}

                    {/* Reply Form */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        {hasReplied ? 'Send Another Email Response' : 'Write Email Response'}
                      </span>
                      <textarea
                        rows={3}
                        placeholder={`Dear ${ticket.name}, thank you for reaching out to Thread & Love. Regarding your query...`}
                        value={currentReply}
                        onChange={(e) => setTicketReplyText(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                      <button
                        onClick={() => handleTicketReplySubmit(ticket.id)}
                        disabled={actionLoading || !currentReply.trim()}
                        className="rounded-2xl bg-neutral-950 text-white font-bold py-2.5 px-6 text-xs hover:bg-neutral-850 dark:bg-primary-600 dark:hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {actionLoading ? 'Sending...' : '✉️ Send Email Response'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: REVIEWS MODERATION */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-fadeIn">
          <h3 className="text-base font-bold text-neutral-909 dark:text-white">Customer Reviews Moderation</h3>
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
              <StarIcon className="mx-auto h-12 w-12 text-neutral-400" />
              <h4 className="mt-4 text-sm font-semibold">No Customer Reviews Yet</h4>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.map(rev => (
                <div key={rev.id} className="flex flex-col justify-between border border-neutral-200 rounded-2xl p-4 bg-white dark:border-neutral-750 dark:bg-neutral-800/10">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-neutral-900 dark:text-white">{rev.authorName}</h4>
                      <div className="flex text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <StarIcon key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-primary-650 mt-1 uppercase font-semibold">Product: {rev.productId}</p>
                    {rev.title && <h5 className="font-medium text-xs text-neutral-805 mt-2 dark:text-neutral-200">"{rev.title}"</h5>}
                    <p className="text-xs text-neutral-500 mt-1 dark:text-neutral-400 font-normal leading-relaxed">
                      {rev.content}
                    </p>
                  </div>
                  <div className="flex justify-end border-t border-neutral-100 pt-3.5 mt-4 dark:border-neutral-750">
                    <button
                      onClick={() => handleReviewDelete(rev.id)}
                      className="flex items-center gap-1 rounded bg-rose-50 px-2.5 py-1.5 text-[10px] font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-900/20"
                    >
                      <TrashIcon className="h-3.5 w-3.5" /> Remove Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: COUPONS */}
         {activeTab === 'coupons' && (
        <div className="grid gap-8 lg:grid-cols-3 animate-fadeIn">
          {/* Create Coupon & Gift Card Forms Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Create Coupon Form */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-5 dark:border-neutral-700 dark:bg-neutral-805">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Create Discount Code</h3>
              <form onSubmit={handleCouponSubmit} className="space-y-4">
                <div>
                  <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="FESTIVE20"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-303 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 text-neutral-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Discount Val</label>
                    <input
                      type="number"
                      required
                      placeholder="20"
                      value={couponForm.discount}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, discount: e.target.value }))}
                      className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 text-neutral-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Type</label>
                    <select
                      value={couponForm.type}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-800 text-neutral-800 dark:text-white"
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Fixed Flat (₹)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Description</label>
                  <input
                    type="text"
                    placeholder="20% off your crochet purchase!"
                    value={couponForm.description}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 text-neutral-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full rounded-xl bg-neutral-900 text-white font-bold py-2.5 text-xs transition disabled:opacity-50 dark:bg-primary-600 cursor-pointer"
                >
                  {actionLoading ? 'Creating...' : 'Add Coupon'}
                </button>
              </form>
            </div>

            {/* Create Gift Card Form */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-5 dark:border-neutral-700 dark:bg-neutral-805">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Issue Gift Card</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Card Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="Leave blank for auto-generate"
                    value={giftCode}
                    onChange={(e) => setGiftCode(e.target.value)}
                    className="w-full rounded-xl border border-neutral-303 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 text-neutral-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Value (₹)</label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={giftBalance}
                      onChange={(e) => setGiftBalance(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 text-neutral-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
                    <input
                      type="date"
                      value={giftExpiry}
                      onChange={(e) => setGiftExpiry(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 text-neutral-800 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateGiftCard}
                  disabled={generatingGiftCard}
                  className="w-full rounded-xl bg-neutral-900 text-white font-bold py-2.5 text-xs transition disabled:opacity-50 dark:bg-primary-600 cursor-pointer"
                >
                  {generatingGiftCard ? 'Generating...' : 'Issue Gift Card'}
                </button>
              </div>
            </div>
          </div>

          {/* Lists Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Coupons List */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Active Discount Codes</h3>
              {coupons.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center dark:border-neutral-700">
                  <TagIcon className="mx-auto h-12 w-12 text-neutral-400" />
                  <h4 className="mt-4 text-sm font-semibold">No Coupon Codes Available</h4>
                  <p className="text-xs text-neutral-500 mt-1">Please configure the `discount_codes` table in Supabase to sync custom coupon codes.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800/10">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-750 dark:bg-neutral-800/30">
                          <th className="py-3 px-5">Code</th>
                          <th className="py-3 px-5">Discount</th>
                          <th className="py-3 px-5">Description</th>
                          <th className="py-3 px-5">Status</th>
                          <th className="py-3 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-750 text-xs">
                        {coupons.map(coupon => (
                          <tr key={coupon.id} className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/15">
                            <td className="py-3.5 px-5 font-bold uppercase tracking-wider text-neutral-950 dark:text-white font-mono">
                              {coupon.code}
                            </td>
                            <td className="py-3.5 px-5">
                              {coupon.type === 'percent' ? `${coupon.discount}%` : `₹${coupon.discount}`}
                            </td>
                            <td className="py-3.5 px-5 text-neutral-500">{coupon.description}</td>
                            <td className="py-3.5 px-5">
                              <span className="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/20 dark:text-green-455">
                                Active
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <button
                                onClick={() => handleCouponDelete(coupon.id)}
                                className="inline-flex rounded bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 cursor-pointer"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Gift Cards List */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white font-medium">Issued Gift Cards</h3>
              {giftCards.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center dark:border-neutral-700 bg-white/40">
                  <TagIcon className="mx-auto h-12 w-12 text-neutral-450" />
                  <h4 className="mt-4 text-sm font-semibold">No Gift Cards Issued Yet</h4>
                  <p className="text-xs text-neutral-500 mt-1">Use the panel on the left to issue digital gift cards with custom values.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800/10">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-750 dark:bg-neutral-800/30">
                          <th className="py-3 px-5">Gift Code</th>
                          <th className="py-3 px-5">Initial</th>
                          <th className="py-3 px-5">Balance</th>
                          <th className="py-3 px-5">Expires</th>
                          <th className="py-3 px-5">Status</th>
                          <th className="py-3 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-750 text-xs">
                        {giftCards.map(gc => {
                          const expired = gc.expires_at && new Date(gc.expires_at).getTime() < Date.now()
                          const isActive = gc.active && !expired

                          return (
                            <tr key={gc.id} className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/15">
                              <td className="py-3.5 px-5 font-bold uppercase tracking-wider text-neutral-950 dark:text-white font-mono">
                                {gc.code}
                              </td>
                              <td className="py-3.5 px-5 font-semibold text-neutral-500">
                                ₹{Math.round(gc.initial_balance * 84).toLocaleString('en-IN')}
                              </td>
                              <td className="py-3.5 px-5 font-bold text-green-700 dark:text-green-400">
                                ₹{Math.round(gc.balance * 84).toLocaleString('en-IN')}
                              </td>
                              <td className="py-3.5 px-5 text-neutral-500">
                                {gc.expires_at ? new Date(gc.expires_at).toLocaleDateString() : 'Never'}
                              </td>
                              <td className="py-3.5 px-5">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  isActive ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-455' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-455'
                                }`}>
                                  {isActive ? 'Active' : expired ? 'Expired' : 'Deactivated'}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-right">
                                {isActive && (
                                  <button
                                    onClick={() => handleDeactivateGiftCard(gc.id)}
                                    className="inline-flex rounded bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 cursor-pointer"
                                    title="Deactivate Gift Card"
                                  >
                                    Deactivate
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: SALES ANALYTICS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'analytics' && (() => {
        const filteredOrders = orders.filter(o => {
          if (analyticsDateFilter === 'all') return true
          const dateStr = o.date
          if (!dateStr) return true
          const oDate = new Date(dateStr)
          const now = new Date()
          const diffMs = now.getTime() - oDate.getTime()
          const diffDays = diffMs / (1000 * 60 * 60 * 24)
          
          if (analyticsDateFilter === 'today') return diffDays <= 1
          if (analyticsDateFilter === '7days') return diffDays <= 7
          if (analyticsDateFilter === '30days') return diffDays <= 30
          return true
        })

        const rangeRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0)
        const rangeCount = filteredOrders.length

        // Best Sellers List computation
        const salesMap: Record<string, { qty: number; revenue: number }> = {}
        filteredOrders.forEach(o => {
          o.items.forEach(it => {
            if (!salesMap[it.name]) {
              salesMap[it.name] = { qty: 0, revenue: 0 }
            }
            salesMap[it.name].qty += it.quantity
            salesMap[it.name].revenue += it.price * it.quantity
          })
        })
        const bestSellers = Object.entries(salesMap)
          .map(([name, stat]) => ({ name, qty: stat.qty, revenue: stat.revenue }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5)

        // Category breakdown computation
        const categoryMap: Record<string, number> = {}
        filteredOrders.forEach(o => {
          o.items.forEach(it => {
            const prod = products.find(p => p.title.toLowerCase() === it.name.toLowerCase())
            const handle = prod?.collectionHandle || 'accessories'
            const categoryName = COLLECTIONS.find(col => col.handle === handle)?.name || 'Accessories & Decor'
            categoryMap[categoryName] = (categoryMap[categoryName] || 0) + (it.price * it.quantity)
          })
        })
        const categoryTotal = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1
        const categorySplit = Object.entries(categoryMap).map(([name, rev]) => ({
          name,
          revenue: rev,
          percentage: Math.round((rev / categoryTotal) * 100)
        })).sort((a, b) => b.revenue - a.revenue)

        // Monthly comparison calculations
        const nowMs = Date.now()
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
        const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000

        const thisMonthSales = orders
          .filter(o => {
            const oDate = new Date(o.created_at || o.date)
            const diff = nowMs - oDate.getTime()
            return diff >= 0 && diff <= thirtyDaysMs
          })
          .reduce((sum, o) => sum + Number(o.total || 0), 0) * 84

        const lastMonthSales = orders
          .filter(o => {
            const oDate = new Date(o.created_at || o.date)
            const diff = nowMs - oDate.getTime()
            return diff > thirtyDaysMs && diff <= sixtyDaysMs
          })
          .reduce((sum, o) => sum + Number(o.total || 0), 0) * 84

        const maxCompRevenue = Math.max(thisMonthSales, lastMonthSales, 1000)

        return (

          <div className="space-y-8 animate-fadeIn">
            {/* Header controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Store Sales Analytics</h3>
                <p className="text-xs text-neutral-500 mt-1">Review revenue summaries and customer preferences</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-450 uppercase font-semibold">Period:</span>
                <select
                  value={analyticsDateFilter}
                  onChange={(e) => setAnalyticsDateFilter(e.target.value as any)}
                  className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white font-medium"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                </select>
              </div>
            </div>

            {/* Quick Metrics Summary for selected range */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Filtered Revenue</span>
                  <h4 className="text-xl font-extrabold text-neutral-900 dark:text-white mt-1">
                    ₹{Math.round(rangeRevenue * 84).toLocaleString('en-IN')}
                  </h4>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <CurrencyRupeeIcon className="w-6 h-6" />
                </div>
              </div>
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Filtered Orders</span>
                  <h4 className="text-xl font-extrabold text-neutral-900 dark:text-white mt-1">
                    {rangeCount} orders
                  </h4>
                </div>
                <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-600">
                  <ClipboardDocumentListIcon className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* SVG Revenue Graphs */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Timeline Chart */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-750 dark:bg-neutral-800/10 space-y-4 animate-fadeIn">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white font-semibold">Revenue Timeline (Last 10 Orders)</h4>
                <p className="text-[10px] text-neutral-500 mt-0.5">Visual tracking of active order progression totals</p>
                
                <div className="flex justify-center items-end h-[220px] relative pb-8 pr-4">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-[170px] flex flex-col justify-between text-[10px] text-neutral-450 pr-4 border-r border-neutral-150 dark:border-neutral-750">
                    <span>₹{Math.round(maxRevenue).toLocaleString('en-IN')}</span>
                    <span>₹{Math.round(maxRevenue / 2).toLocaleString('en-IN')}</span>
                    <span>₹0</span>
                  </div>

                  {/* Chart Grid Lines */}
                  <div className="absolute left-[80px] right-4 top-0 h-[170px] flex flex-col justify-between pointer-events-none z-0">
                    <div className="border-t border-dashed border-neutral-200 dark:border-neutral-755 w-full"></div>
                    <div className="border-t border-dashed border-neutral-200 dark:border-neutral-755 w-full"></div>
                    <div className="border-t border-dashed border-neutral-200 dark:border-neutral-755 w-full"></div>
                  </div>

                  {/* Chart Data Bars */}
                  <div className="ml-[90px] flex-1 flex items-end justify-between h-[170px] z-10">
                    {chartData.map((d, i) => {
                      const percentHeight = Math.max((d.revenue / maxRevenue) * 100, 5)
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end group relative mx-1 h-full">
                          {/* Tooltip on Hover */}
                          <div className="absolute bottom-full mb-2 bg-neutral-900 text-white text-[10px] font-semibold px-2 py-1 rounded shadow opacity-0 pointer-events-none transition group-hover:opacity-100 whitespace-nowrap z-30">
                            ₹{Math.round(d.revenue).toLocaleString('en-IN')} ({d.itemsCount} items)
                          </div>
                          {/* SVG Bar */}
                          <div
                            style={{ height: `${percentHeight}%` }}
                            className="w-full max-w-[20px] rounded-t bg-emerald-500/80 transition-all duration-350 hover:bg-emerald-500 hover:scale-x-110 shadow-sm"
                          ></div>
                          {/* Label */}
                          <span className="absolute top-[175px] text-[8px] text-neutral-500 tracking-wider truncate max-w-[40px]" title={d.label}>
                            #{d.label.length > 8 ? `${d.label.slice(0, 5)}...` : d.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Comparative Month Sales SVG Bar Chart */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-755 dark:bg-neutral-800/10 space-y-4 animate-fadeIn">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white font-semibold">Monthly Sales Comparison</h4>
                <p className="text-[10px] text-neutral-500 mt-0.5">Gross revenue of This Month vs Last Month</p>
                
                <div className="flex justify-center items-center h-[220px]">
                  <svg viewBox="0 0 350 200" className="w-full h-full font-sans">
                    <line x1="50" y1="20" x2="320" y2="20" stroke="#f0ece8" strokeDasharray="4" />
                    <line x1="50" y1="80" x2="320" y2="80" stroke="#f0ece8" strokeDasharray="4" />
                    <line x1="50" y1="140" x2="320" y2="140" stroke="#e6e0da" strokeWidth="1.5" />
                    
                    <text x="40" y="25" textAnchor="end" fontSize="9" className="fill-neutral-450 font-semibold">₹{Math.round(maxCompRevenue).toLocaleString('en-IN')}</text>
                    <text x="40" y="85" textAnchor="end" fontSize="9" className="fill-neutral-450 font-semibold">₹{Math.round(maxCompRevenue / 2).toLocaleString('en-IN')}</text>
                    <text x="40" y="145" textAnchor="end" fontSize="9" className="fill-neutral-450 font-semibold">₹0</text>
                    
                    {/* Last Month Bar */}
                    <g className="group cursor-pointer">
                      <rect
                        x="90"
                        y={140 - (lastMonthSales / maxCompRevenue) * 110}
                        width="50"
                        height={Math.max((lastMonthSales / maxCompRevenue) * 110, 4)}
                        rx="8"
                        className="fill-neutral-250 dark:fill-neutral-700 transition-all duration-300 group-hover:fill-neutral-350 dark:group-hover:fill-neutral-600"
                      />
                      <text
                        x="115"
                        y={Math.min(130 - (lastMonthSales / maxCompRevenue) * 110, 125)}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        className="fill-neutral-700 dark:fill-neutral-305 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        ₹{Math.round(lastMonthSales).toLocaleString('en-IN')}
                      </text>
                    </g>
                    
                    {/* This Month Bar */}
                    <g className="group cursor-pointer">
                      <defs>
                        <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" />
                          <stop offset="100%" stopColor="#818cf8" />
                        </linearGradient>
                      </defs>
                      <rect
                        x="210"
                        y={140 - (thisMonthSales / maxCompRevenue) * 110}
                        width="50"
                        height={Math.max((thisMonthSales / maxCompRevenue) * 110, 4)}
                        rx="8"
                        fill="url(#primaryGrad)"
                        className="transition-all duration-300 group-hover:brightness-110"
                      />
                      <text
                        x="235"
                        y={Math.min(130 - (thisMonthSales / maxCompRevenue) * 110, 125)}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        className="fill-primary-600 dark:fill-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        ₹{Math.round(thisMonthSales).toLocaleString('en-IN')}
                      </text>
                    </g>
                    
                    <text x="115" y="165" textAnchor="middle" fontSize="10" fontWeight="bold" className="fill-neutral-500">Last Month</text>
                    <text x="235" y="165" textAnchor="middle" fontSize="10" fontWeight="bold" className="fill-primary-600">This Month</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom Insight Widgets */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Best Sellers */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-5 space-y-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Best Sellers (Items Sold)</h4>
                {bestSellers.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">No sales tracked yet.</p>
                ) : (
                  <div className="space-y-3">
                    {bestSellers.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-100 dark:border-neutral-850 last:border-0">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-neutral-450">{idx + 1}</span>
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-neutral-900 dark:text-white">{item.qty} sold</span>
                          <p className="text-[10px] text-neutral-450 mt-0.5">₹{Math.round(item.revenue * 84).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category split SVG Donut Chart */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-5 space-y-4 dark:border-neutral-850 dark:bg-neutral-900/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-450">Category share split</h4>
                {categorySplit.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">No category insights yet.</p>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                      <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
                        <circle
                          cx="70"
                          cy="70"
                          r="50"
                          fill="transparent"
                          stroke="var(--neutral-100)"
                          strokeWidth="14"
                          className="stroke-neutral-100 dark:stroke-neutral-800"
                        />
                        {(() => {
                          let accumulated = 0
                          const circumference = 314.16 // 2 * pi * 50
                          return categorySplit.map((item, idx) => {
                            const strokeVal = (item.percentage / 100) * circumference
                            const offsetVal = circumference - (accumulated / 100) * circumference
                            accumulated += item.percentage
                            const colors = ['stroke-primary-500', 'stroke-amber-500', 'stroke-emerald-500', 'stroke-pink-500', 'stroke-purple-500', 'stroke-neutral-400']
                            const color = colors[idx % colors.length]
                            
                            return (
                              <circle
                                key={idx}
                                cx="70"
                                cy="70"
                                r="50"
                                fill="transparent"
                                strokeWidth="15"
                                strokeDasharray={`${strokeVal} ${circumference}`}
                                strokeDashoffset={offsetVal}
                                strokeLinecap="round"
                                className={`${color} transition-all duration-300 hover:stroke-[18px] cursor-pointer group`}
                              >
                                <title>{item.name}: {item.percentage}% (₹{Math.round(item.revenue).toLocaleString('en-IN')})</title>
                              </circle>
                            )
                          })
                        })()}
                      </svg>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-[8px] text-neutral-400 uppercase font-bold tracking-wider">Total Sales</span>
                        <span className="text-xs font-extrabold text-neutral-900 dark:text-white mt-0.5">
                          ₹{Math.round(categoryTotal).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 space-y-2.5 w-full">
                      {categorySplit.map((item, idx) => {
                        const colors = ['bg-primary-500', 'bg-amber-500', 'bg-emerald-500', 'bg-pink-500', 'bg-purple-500', 'bg-neutral-450']
                        const bg = colors[idx % colors.length]
                        return (
                          <div key={idx} className="flex items-center justify-between text-[11px] py-1 border-b border-neutral-100 dark:border-neutral-850 last:border-0 hover:bg-neutral-50/30 px-2 rounded-xl transition cursor-pointer group">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-2.5 h-2.5 rounded-full ${bg} shrink-0`}></span>
                              <span className="font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-primary-600 transition truncate max-w-[100px]">{item.name}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-neutral-900 dark:text-white">{item.percentage}%</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}
      {/* ---------------------------------------------------- */}
      {/* TAB: STORE SETTINGS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="grid gap-8 lg:grid-cols-3 animate-fadeIn">
          {/* General Config Form */}
          <div className="lg:col-span-1 rounded-3xl border border-neutral-200 bg-white p-6 space-y-6 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">General Settings</h3>
              <p className="text-xs text-neutral-450 mt-1">Configure global store variables</p>
            </div>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Announcement Bar Text</label>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
                <button
                  disabled={actionLoading}
                  onClick={() => handleSettingsSave('announcement', announcement)}
                  className="mt-2 text-[10px] font-bold text-primary-600 hover:text-primary-750"
                >
                  Update Announcement
                </button>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Support Hotline Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Support Email</label>
                  <input
                    type="text"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <button
                  disabled={actionLoading}
                  onClick={() => handleSettingsSave('contact', { phone: contactPhone, email: contactEmail })}
                  className="text-[10px] font-bold text-primary-600 hover:text-primary-750"
                >
                  Update Contact Info
                </button>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Tax Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Shipping Flat (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                  </div>
                </div>
                <button
                  disabled={actionLoading}
                  onClick={() => handleSettingsSave('rates', { tax: Number(taxRate), shipping: Number(shippingFee) })}
                  className="text-[10px] font-bold text-primary-600 hover:text-primary-750"
                >
                  Update Rates & Fees
                </button>
              </div>
            </div>
          </div>

          {/* Banner Slider editor */}
          <div className="lg:col-span-2 rounded-3xl border border-neutral-200 bg-white p-6 space-y-6 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Homepage Promo Banners</h3>
              <p className="text-xs text-neutral-450 mt-1">Manage slides displayed on the main home screen hero carousel</p>
            </div>

            {/* List slides */}
            <div className="space-y-4">
              {banners.map((b, idx) => (
                <div key={idx} className="flex gap-4 p-4 border border-neutral-150 rounded-2xl bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/20 text-xs items-center justify-between">
                  <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                    <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-neutral-900 dark:text-white truncate">{b.title}</div>
                    <div className="text-neutral-450 truncate">{b.subtitle}</div>
                    <div className="text-[10px] font-medium text-primary-600 truncate mt-1">CTA Link: {b.link}</div>
                  </div>
                  <button
                    onClick={() => {
                      const updated = banners.filter((_, i) => i !== idx)
                      setBanners(updated)
                      handleSettingsSave('banners', updated)
                    }}
                    className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-105"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Banner Form */}
            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-5 space-y-4">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Add New Promo Slide</h4>
              
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Slide Title</label>
                  <input
                    type="text"
                    placeholder="New Collection Out Now"
                    value={newSlide.title}
                    onChange={(e) => setNewSlide(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Slide Subtitle</label>
                  <input
                    type="text"
                    placeholder="Get 10% discount this week"
                    value={newSlide.subtitle}
                    onChange={(e) => setNewSlide(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newSlide.image}
                    onChange={(e) => setNewSlide(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">CTA Redirect Link</label>
                  <input
                    type="text"
                    placeholder="/collection/accessories"
                    value={newSlide.link}
                    onChange={(e) => setNewSlide(prev => ({ ...prev, link: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={actionLoading || !newSlide.title || !newSlide.image}
                onClick={() => {
                  const updated = [...banners, newSlide]
                  setBanners(updated)
                  setNewSlide({ title: '', subtitle: '', image: '', link: '' })
                  handleSettingsSave('banners', updated)
                }}
                className="rounded-xl bg-neutral-900 text-white font-bold py-2 px-4 text-xs transition hover:bg-neutral-850 dark:bg-primary-600 disabled:opacity-50"
              >
                Add Slide
              </button>
            </div>
          </div>

          {/* Homepage Section Layout Builder */}
          <div className="lg:col-span-3 rounded-3xl border border-neutral-200 bg-white p-6 space-y-6 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Homepage Layout Builder</h3>
              <p className="text-xs text-neutral-450 mt-1">Visually reorder homepage sections and toggle their visibility on the storefront</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {homepageLayout.map((section, idx) => {
                const isFirst = idx === 0
                const isLast = idx === homepageLayout.length - 1

                const moveSection = (direction: 'up' | 'down') => {
                  const updated = [...homepageLayout]
                  const targetIdx = direction === 'up' ? idx - 1 : idx + 1
                  if (targetIdx < 0 || targetIdx >= updated.length) return
                  // Swap elements
                  const temp = updated[idx]
                  updated[idx] = updated[targetIdx]
                  updated[targetIdx] = temp
                  setHomepageLayout(updated)
                }

                const toggleVisibility = () => {
                  const updated = homepageLayout.map((sec, i) => 
                    i === idx ? { ...sec, visible: !sec.visible } : sec
                  )
                  setHomepageLayout(updated)
                }

                return (
                  <div 
                    key={section.id} 
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      section.visible 
                        ? 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/40 shadow-sm' 
                        : 'border-neutral-100 bg-neutral-50/50 dark:border-neutral-800/40 dark:bg-neutral-950/20 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => moveSection('up')}
                          className="p-1 rounded hover:bg-neutral-150 dark:hover:bg-neutral-800 disabled:opacity-30 text-neutral-500 cursor-pointer"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => moveSection('down')}
                          className="p-1 rounded hover:bg-neutral-150 dark:hover:bg-neutral-800 disabled:opacity-30 text-neutral-500 cursor-pointer"
                        >
                          ▼
                        </button>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-neutral-900 dark:text-white truncate">{section.name}</div>
                        <div className="text-[10px] text-neutral-450 font-mono mt-0.5">{section.id}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleVisibility}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                          section.visible 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : 'bg-neutral-105 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}
                      >
                        {section.visible ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleSettingsSave('homepage_layout', homepageLayout)}
                className="rounded-xl bg-neutral-900 hover:bg-neutral-850 disabled:opacity-50 text-white dark:bg-primary-600 dark:hover:bg-primary-700 px-4 py-2.5 text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Save Layout Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: AUDIT TRAIL */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Administrative Audit Trail</h3>
              <p className="text-xs text-neutral-450 mt-1">Real-time log of administrative activities and changes.</p>
            </div>
            <button
              onClick={handleRefreshAuditLogs}
              disabled={refreshingAuditLogs}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2 text-xs font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white transition shadow-sm disabled:opacity-50 self-start sm:self-auto"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${refreshingAuditLogs ? 'animate-spin' : ''}`} />
              Refresh Logs
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-450">
                <MagnifyingGlassIcon className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search logs by email, target, details..."
                value={auditSearchTerm}
                onChange={(e) => setAuditSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-300 bg-white outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                value={selectedAuditActionFilter}
                onChange={(e) => setSelectedAuditActionFilter(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <option value="">All Actions</option>
                <option value="refund_order">Refund Order</option>
                <option value="update_order_status">Update Order Status</option>
                <option value="block_profile">Block Customer</option>
                <option value="unblock_profile">Unblock Customer</option>
                <option value="create_product">Create Product</option>
                <option value="update_product">Update Product</option>
                <option value="delete_product">Delete Product</option>
                <option value="batch_create_products">CSV Batch Products</option>
                <option value="create_coupon">Create Coupon</option>
                <option value="delete_coupon">Delete Coupon</option>
                <option value="update_coupon_status">Toggle Coupon Status</option>
                <option value="update_settings">Update Settings</option>
                <option value="reply_support">Reply Support Ticket</option>
                <option value="delete_review">Delete Review</option>
              </select>
            </div>
          </div>

          {(() => {
            const filteredLogs = auditLogs.filter(log => {
              const matchesAction = !selectedAuditActionFilter || log.action === selectedAuditActionFilter
              const query = auditSearchTerm.toLowerCase()
              const matchesSearch = !auditSearchTerm || 
                (log.admin_email || '').toLowerCase().includes(query) ||
                (log.target_type || '').toLowerCase().includes(query) ||
                (log.target_id || '').toLowerCase().includes(query) ||
                (log.details || '').toLowerCase().includes(query) ||
                (log.action || '').toLowerCase().includes(query)

              return matchesAction && matchesSearch
            })

            const getActionBadgeColor = (action: string) => {
              if (action.includes('delete') || action.includes('block')) return 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-450'
              if (action.includes('create') || action.includes('unblock')) return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-450'
              if (action.includes('refund')) return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-450'
              return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-350'
            }

            const formatActionName = (action: string) => {
              return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            }

            if (filteredLogs.length === 0) {
              return (
                <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
                  <ClockIcon className="mx-auto h-12 w-12 text-neutral-450" />
                  <h4 className="mt-4 text-sm font-semibold">No Audit Logs Found</h4>
                  <p className="text-xs text-neutral-500 mt-1">Try resetting search query or action filters.</p>
                </div>
              )
            }

            return (
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-750 dark:bg-neutral-800/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-750 dark:bg-neutral-800/30">
                        <th className="py-3 px-5">Timestamp</th>
                        <th className="py-3 px-5">Admin Email</th>
                        <th className="py-3 px-5">Action Type</th>
                        <th className="py-3 px-5">Target</th>
                        <th className="py-3 px-5">Log Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-750 text-xs">
                      {filteredLogs.map(log => (
                        <tr key={log.id} className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 align-top">
                          <td className="py-3.5 px-5 whitespace-nowrap text-neutral-500">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-5 font-medium text-neutral-850 dark:text-neutral-200">
                            {log.admin_email || 'System'}
                          </td>
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold ${getActionBadgeColor(log.action)}`}>
                              {formatActionName(log.action)}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-neutral-800 dark:text-neutral-350">
                              {log.target_type ? formatActionName(log.target_type) : 'N/A'}
                            </div>
                            {log.target_id && (
                              <div className="text-[10px] text-neutral-450 mt-0.5 font-mono">
                                ID: {log.target_id}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-neutral-600 dark:text-neutral-350 leading-relaxed font-normal max-w-sm break-words">
                            {log.details || 'No additional details.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })()}
        </div>
      )}

        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* DRAWER: ORDER DETAILS */}
      {/* ---------------------------------------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex justify-end animate-fadeIn print:hidden">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col animate-slideLeft">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Order #{selectedOrder.number}</h3>
                <p className="text-xs text-neutral-450 mt-1">Placed on {selectedOrder.date}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-550"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-850 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Customer Details</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-neutral-500">Name:</span> <span className="font-semibold text-neutral-900 dark:text-white">{selectedOrder.customer.name}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Email:</span> <span className="text-neutral-900 dark:text-white">{selectedOrder.customer.email}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Status:</span> <span className="font-semibold text-emerald-600">{selectedOrder.status}</span></div>
                </div>
              </div>

              {/* Courier Tracking Details */}
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-850 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Courier & Tracking</h4>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Courier Partner</label>
                    <select
                      value={selectedOrder.carrier || ''}
                      onChange={async (e) => {
                        const newCarrier = e.target.value
                        setSelectedOrder(prev => prev ? { ...prev, carrier: newCarrier } : null)
                        await fetch('/api/admin/update-order-status', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ orderNumber: selectedOrder.number, status: selectedOrder.status, carrier: newCarrier })
                        })
                        toast.success('Courier partner updated')
                        startTransition(() => { router.refresh() })
                      }}
                      className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                    >
                      <option value="">Select Courier...</option>
                      <option value="Delhivery">Delhivery</option>
                      <option value="Blue Dart">Blue Dart</option>
                      <option value="DTDC">DTDC</option>
                      <option value="FedEx">FedEx</option>
                      <option value="DHL">DHL</option>
                      <option value="Speed Post">Speed Post</option>
                      <option value="Custom">Custom Carrier</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Tracking ID</label>
                    <input
                      type="text"
                      placeholder="Ex: 1234567890"
                      defaultValue={selectedOrder.tracking_number || ''}
                      onBlur={async (e) => {
                        const newTracking = e.target.value
                        setSelectedOrder(prev => prev ? { ...prev, tracking_number: newTracking } : null)
                        await fetch('/api/admin/update-order-status', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ orderNumber: selectedOrder.number, status: selectedOrder.status, trackingNumber: newTracking })
                        })
                        toast.success('Tracking ID updated')
                        startTransition(() => { router.refresh() })
                      }}
                      className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Items Ordered</h4>
                <div className="divide-y divide-neutral-150 dark:divide-neutral-850">
                  {selectedOrder.items.map(it => (
                    <div key={it.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-neutral-900 dark:text-white">{it.name}</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">₹{it.price.toLocaleString('en-IN')} x {it.quantity}</div>
                      </div>
                      <div className="font-bold text-neutral-900 dark:text-white">
                        ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-850 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-550">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-neutral-550">
                  <span>Shipping Flat Fee</span>
                  <span>₹{Number(shippingFee || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-neutral-550">
                  <span>Tax Amount ({Number(taxRate || 0)}%)</span>
                  <span>₹{Math.round(selectedOrder.total * Number(taxRate || 0) / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-750 my-2 pt-2 flex justify-between font-bold text-sm text-neutral-900 dark:text-white">
                  <span>Grand Total</span>
                  <span>₹{(selectedOrder.total + Math.round(selectedOrder.total * Number(taxRate || 0) / 100) + Number(shippingFee || 0)).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
              {['Paid', 'Delivered'].includes(selectedOrder.status) && (
                <button
                  disabled={refundingOrderId === selectedOrder.id}
                  onClick={() => handleRefund(selectedOrder)}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-4 py-2.5 text-xs font-semibold shadow-sm transition-colors"
                >
                  {refundingOrderId === selectedOrder.id ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <CurrencyRupeeIcon className="w-4 h-4" /> Issue Refund
                    </>
                  )}
                </button>
              )}
              <a
                href={`/api/admin/orders/invoice/pdf?orderNumber=${selectedOrder.number}`}
                className="flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 px-4 py-2.5 text-xs font-semibold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download PDF Invoice
              </a>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 px-4 py-2.5 text-xs font-semibold"
              >
                <PrinterIcon className="w-4 h-4" /> Print Commercial Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DRAWER: CUSTOMER DETAILS */}
      {/* ---------------------------------------------------- */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex justify-end animate-fadeIn print:hidden">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col animate-slideLeft">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{selectedCustomer.name}</h3>
                <p className="text-xs text-neutral-450 mt-1">Joined on {selectedCustomer.joinedAt}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-550"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-850 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Customer Details</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-neutral-500">Email:</span> <span className="font-semibold text-neutral-900 dark:text-white">{selectedCustomer.email}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Phone:</span> <span className="text-neutral-900 dark:text-white">{selectedCustomer.phone || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Role Status:</span> <span className="font-semibold text-primary-650">{selectedCustomer.role}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Account:</span> <span className={`font-semibold ${selectedCustomer.blocked ? 'text-rose-605' : 'text-green-600'}`}>{selectedCustomer.blocked ? 'Blocked' : 'Active'}</span></div>
                </div>
              </div>

              {(() => {
                const currentCust = customers.find(c => c.id === selectedCustomer.id) || selectedCustomer
                const currentStoreCredit = (currentCust as any).storeCredit || 0

                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-850 p-3 text-center">
                        <h4 className="text-[9px] font-bold uppercase tracking-wider text-neutral-450">Total Spent</h4>
                        <p className="text-sm font-extrabold text-neutral-900 dark:text-white mt-1">
                          ₹{Math.round(currentCust.totalSpent * 84).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-850 p-3 text-center">
                        <h4 className="text-[9px] font-bold uppercase tracking-wider text-neutral-450">Total Orders</h4>
                        <p className="text-sm font-extrabold text-neutral-900 dark:text-white mt-1">
                          {currentCust.orderCount} orders
                        </p>
                      </div>
                      <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-850 p-3 text-center">
                        <h4 className="text-[9px] font-bold uppercase tracking-wider text-neutral-450">Store Credit</h4>
                        <p className="text-sm font-extrabold text-green-600 dark:text-green-400 mt-1">
                          ₹{Math.round(currentStoreCredit * 84).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Store Credit Adjuster Form */}
                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Adjust Store Credit</h4>
                      <div className="space-y-2.5">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Amount (e.g. 500 or -200 in ₹)"
                            value={creditAmount}
                            onChange={(e) => setCreditAmount(e.target.value)}
                            className="flex-1 rounded-xl border border-neutral-250 bg-white px-3 py-1.5 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-800 text-neutral-800 dark:text-white"
                          />
                          <button
                            disabled={adjustingCredit}
                            onClick={() => handleStoreCreditAdjust(currentCust.id)}
                            className="rounded-xl bg-neutral-900 hover:bg-neutral-800 px-4 py-1.5 text-xs font-semibold text-white transition dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer disabled:opacity-50"
                          >
                            {adjustingCredit ? '...' : 'Apply'}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Reason for adjustment (optional)"
                          value={creditReason}
                          onChange={(e) => setCreditReason(e.target.value)}
                          className="w-full rounded-xl border border-neutral-250 bg-white px-3 py-1.5 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-800 text-neutral-800 dark:text-white"
                        />
                        <p className="text-[10px] text-neutral-450">Note: Use negative values to deduct credit. Values are entered in INR. Updates are computed in USD base.</p>
                      </div>
                    </div>
                  </>
                )
              })()}

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Order Logs</h4>
                {orders.filter(o => o.customer.email === selectedCustomer.email).length === 0 ? (
                  <p className="text-xs text-neutral-550 italic">No orders placed yet.</p>
                ) : (
                  <div className="space-y-3">
                    {orders
                      .filter(o => o.customer.email === selectedCustomer.email)
                      .map(o => (
                        <div key={o.id} className="rounded-2xl border border-neutral-150 p-3.5 flex items-center justify-between text-xs dark:border-neutral-800 dark:bg-neutral-800/10">
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-white">Order #{o.number}</div>
                            <div className="text-[10px] text-neutral-505 mt-0.5">{o.date} • {o.items.length} item(s)</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-neutral-900 dark:text-white">₹{Math.round(o.total * 84).toLocaleString('en-IN')}</div>
                            <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold mt-1 ${getStatusColor(o.status)}`}>
                              {o.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DRAWER: PRODUCT STOCK LOGS */}
      {/* ---------------------------------------------------- */}
      {selectedStockLogProduct && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex justify-end animate-fadeIn print:hidden">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col animate-slideLeft">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{selectedStockLogProduct.title}</h3>
                <p className="text-xs text-neutral-450 mt-1">Stock History & Logs (ID: {selectedStockLogProduct.id})</p>
              </div>
              <button
                onClick={() => {
                  setSelectedStockLogProduct(null)
                  setProductStockLogs([])
                }}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-550"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-850 p-4 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-800/10">
                <div>
                  <h4 className="text-2xs font-bold uppercase tracking-wider text-neutral-400">Current Stock Level</h4>
                  <p className="text-xl font-extrabold text-neutral-900 dark:text-white mt-0.5">
                    {selectedStockLogProduct.stock !== undefined ? selectedStockLogProduct.stock : 10} units
                  </p>
                </div>
                {selectedStockLogProduct.stock !== undefined && selectedStockLogProduct.stock < 5 && (
                  <span className="inline-flex items-center gap-1.5 rounded bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-900/20 dark:text-amber-450 animate-pulse">
                    Low Stock Alert
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Activity History</h4>
                
                {loadingStockLogs ? (
                  <div className="flex items-center gap-2 text-xs text-neutral-500 py-4 justify-center">
                    <ArrowPathIcon className="h-5 w-5 animate-spin" /> Loading stock history...
                  </div>
                ) : productStockLogs.length === 0 ? (
                  <p className="text-xs text-neutral-550 italic text-center py-8">No stock movements recorded for this product.</p>
                ) : (
                  <div className="space-y-3">
                    {productStockLogs.map(log => {
                      const isPositive = Number(log.change) > 0
                      return (
                        <div key={log.id} className="rounded-2xl border border-neutral-150 p-3.5 flex items-center justify-between text-xs dark:border-neutral-800 dark:bg-neutral-800/10 transition-all hover:bg-neutral-50/20">
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-white">{log.reason}</div>
                            <div className="text-[10px] text-neutral-400 mt-1">{new Date(log.created_at).toLocaleString()}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-extrabold ${
                              isPositive ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-405' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-405'
                            }`}>
                              {isPositive ? `+${log.change}` : log.change}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: EMAIL CAMPAIGN */}
      {/* ---------------------------------------------------- */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn print:hidden">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp border border-neutral-200 dark:border-neutral-800">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Email Campaign</h3>
                <p className="text-xs text-neutral-450 mt-0.5">Send custom message to {customers.filter(cust => {
                  const vipThreshold = 10000 / 84
                  if (selectedSegment === 'all') return true
                  if (selectedSegment === 'vip') return cust.totalSpent >= vipThreshold
                  if (selectedSegment === 'slipping') {
                    const joinedTime = new Date(cust.joinedAt).getTime()
                    const daysSinceJoined = isNaN(joinedTime) ? 0 : (Date.now() - joinedTime) / (24 * 60 * 60 * 1000)
                    return cust.orderCount === 0 && daysSinceJoined > 60
                  }
                  if (selectedSegment === 'frequent') return cust.orderCount >= 3
                  return true
                }).length} selected customers ({selectedSegment === 'all' ? 'All' : selectedSegment === 'vip' ? 'VIP' : selectedSegment === 'slipping' ? 'Slipping Away' : 'Frequent Shoppers'} segment)</p>
              </div>
              <button
                onClick={() => {
                  setShowCampaignModal(false)
                  setCampaignSubject('')
                  setCampaignBody('')
                }}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-555"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Recipients Preview</label>
                <div className="rounded-xl bg-neutral-50 dark:bg-neutral-850 p-3 max-h-20 overflow-y-auto text-neutral-500 font-mono scrollbar-thin">
                  {customers.filter(cust => {
                    const vipThreshold = 10000 / 84
                    if (selectedSegment === 'all') return true
                    if (selectedSegment === 'vip') return cust.totalSpent >= vipThreshold
                    if (selectedSegment === 'slipping') {
                      const joinedTime = new Date(cust.joinedAt).getTime()
                      const daysSinceJoined = isNaN(joinedTime) ? 0 : (Date.now() - joinedTime) / (24 * 60 * 60 * 1000)
                      return cust.orderCount === 0 && daysSinceJoined > 60
                    }
                    if (selectedSegment === 'frequent') return cust.orderCount >= 3
                    return true
                  }).map(c => c.email).join(', ')}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Subject</label>
                <input
                  type="text"
                  placeholder="Campaign Subject"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Email Body</label>
                <textarea
                  placeholder="Enter your message here... Use plain text, we will format it with a premium look."
                  value={campaignBody}
                  onChange={(e) => setCampaignBody(e.target.value)}
                  rows={8}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCampaignModal(false)
                  setCampaignSubject('')
                  setCampaignBody('')
                }}
                className="rounded-xl border border-neutral-355 dark:border-neutral-700 px-4 py-2.5 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-850"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingCampaign}
                onClick={() => {
                  const currentSegmentCustomers = customers.filter(cust => {
                    const vipThreshold = 10000 / 84
                    if (selectedSegment === 'all') return true
                    if (selectedSegment === 'vip') return cust.totalSpent >= vipThreshold
                    if (selectedSegment === 'slipping') {
                      const joinedTime = new Date(cust.joinedAt).getTime()
                      const daysSinceJoined = isNaN(joinedTime) ? 0 : (Date.now() - joinedTime) / (24 * 60 * 60 * 1000)
                      return cust.orderCount === 0 && daysSinceJoined > 60
                    }
                    if (selectedSegment === 'frequent') return cust.orderCount >= 3
                    return true
                  })
                  handleCampaignSend(currentSegmentCustomers.map(c => c.email))
                }}
                className="flex items-center gap-1.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 text-white dark:text-neutral-900 px-4 py-2.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                {sendingCampaign ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <EnvelopeIcon className="w-4 h-4" /> Send Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: CART RECOVERY CAMPAIGN */}
      {/* ---------------------------------------------------- */}
      {selectedRecoveryCart && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn print:hidden">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp border border-neutral-200 dark:border-neutral-800">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Cart Recovery Campaign</h3>
                <p className="text-xs text-neutral-450 mt-0.5">Send checkout incentive email to {selectedRecoveryCart.user?.full_name}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedRecoveryCart(null)
                  setRecoveryCouponCode('')
                  setRecoveryCustomMessage('')
                }}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-555"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Selected Cart Value</label>
                <div className="rounded-xl bg-neutral-50 dark:bg-neutral-850 p-3 flex justify-between items-center">
                  <span className="font-bold text-neutral-850 dark:text-neutral-200">Total Value:</span>
                  <span className="font-extrabold text-neutral-955 dark:text-white text-sm">
                    ₹{Math.round(selectedRecoveryCart.totalValue * 84).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Attach Incentive Coupon Code (Optional)</label>
                <select
                  value={recoveryCouponCode}
                  onChange={(e) => setRecoveryCouponCode(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="">Do not attach coupon...</option>
                  {coupons.filter(c => c.active).map(c => (
                    <option key={c.id} value={c.code}>
                      {c.code} ({c.type === 'percent' ? `${c.discount}% Off` : `₹${Math.round(c.discount * 84)} Off`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Personal Message Note (Optional)</label>
                <textarea
                  placeholder="Hi! We saw you left some items in your cart. Complete your checkout today and get them before they sell out..."
                  value={recoveryCustomMessage}
                  onChange={(e) => setRecoveryCustomMessage(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedRecoveryCart(null)
                  setRecoveryCouponCode('')
                  setRecoveryCustomMessage('')
                }}
                className="rounded-xl border border-neutral-350 dark:border-neutral-700 px-4 py-2.5 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-850"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingRecovery}
                onClick={handleSendCartRecovery}
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2.5 text-xs font-semibold shadow-sm transition-colors"
              >
                {sendingRecovery ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <EnvelopeIcon className="w-4 h-4" /> Send Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PRINT AREA: INVOICE LAYOUT (Only visible when printing) */}
      {/* ---------------------------------------------------- */}
      {selectedOrder && (
        <div className="hidden print:block absolute inset-0 bg-white text-black p-8 font-sans z-50 text-xs space-y-6">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">THREAD & LOVE</h1>
              <p className="text-[10px] text-gray-500 mt-1">Artisanal Crochet & Knitting Boutique</p>
            </div>
            <div className="text-right">
              <h2 className="text-base font-bold uppercase tracking-wider">Commercial Receipt</h2>
              <p className="text-[10px] text-gray-500 mt-1">Invoice #{selectedOrder.number}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-gray-500 text-[10px] mb-1">Store details:</h3>
              <p className="font-semibold">Thread & Love Customer Support</p>
              <p>Email: {contactEmail}</p>
              <p>Phone: {contactPhone}</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold uppercase tracking-wider text-gray-500 text-[10px] mb-1">Bill to:</h3>
              <p className="font-semibold">{selectedOrder.customer.name}</p>
              <p>Email: {selectedOrder.customer.email}</p>
              <p>Order Date: {selectedOrder.date}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse border-t border-b">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-600 border-b">
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Unit Price</th>
                <th className="py-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.items.map(it => (
                <tr key={it.id} className="border-b">
                  <td className="py-3 font-semibold">{it.name}</td>
                  <td className="py-3 text-center">{it.quantity}</td>
                  <td className="py-3 text-right">₹{it.price.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-right font-bold">₹{(it.price * it.quantity).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-1/2 space-y-2 text-right">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Estimated Tax ({Number(taxRate || 0)}%):</span>
                <span>₹{Math.round(selectedOrder.total * Number(taxRate || 0) / 100).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping Fee:</span>
                <span>₹{Number(shippingFee || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-sm">
                <span>Total Amount Paid:</span>
                <span>₹{(selectedOrder.total + Math.round(selectedOrder.total * Number(taxRate || 0) / 100) + Number(shippingFee || 0)).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 text-center text-gray-400 text-[10px]">
            Thank you for supporting hand-knitted artisanal products from Thread & Love!
          </div>
        </div>
      )}
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  description: string
  colorClass: string
}

function MetricCard({ title, value, icon: Icon, description, colorClass }: MetricCardProps) {
  const isEmerald = colorClass.includes('emerald')
  const isBlue = colorClass.includes('blue')
  const isGreen = colorClass.includes('green')
  
  const iconBgClass = isEmerald
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450'
    : isBlue
    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-450'
    : isGreen
    ? 'bg-green-500/10 text-green-600 dark:text-green-455'
    : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400'

  return (
    <div className="flex flex-col justify-between p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 shadow-sm relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-2xl ${iconBgClass} transition group-hover:scale-110 duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{value}</h4>
        <p className="mt-1 text-[11px] text-neutral-450 dark:text-neutral-500 font-medium">{description}</p>
      </div>
    </div>
  )
}

