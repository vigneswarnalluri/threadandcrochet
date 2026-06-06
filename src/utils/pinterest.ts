import { TProductItem } from '@/data/data'

const globalForPinterest = globalThis as unknown as {
  pinterestCache?: Record<string, TProductItem[]>
}

// Decode basic HTML/XML entities
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ')
}

// Fallback high-quality Pinterest products if request fails or is rate-limited
export const FALLBACK_PINTEREST_PRODUCTS: TProductItem[] = [
  {
    id: 'pinterest-fallback-1',
    title: 'Vintage Granny Square Cardigan',
    handle: 'pinterest-fallback-1',
    createdAt: new Date().toISOString(),
    vendor: 'Pinterest Creator',
    price: 68,
    featuredImage: {
      src: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=736',
      width: 736,
      height: 1100,
      alt: 'Vintage Granny Square Cardigan',
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=736',
        width: 736,
        height: 1100,
        alt: 'Vintage Granny Square Cardigan',
      }
    ],
    reviewNumber: 42,
    rating: 4.8,
    status: 'Pinterest Pin',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Multicolor', swatch: { color: '#e09f3e', image: null } },
          { name: 'Pastel Patchwork', swatch: { color: '#ffcad4', image: null } }
        ]
      },
      {
        name: 'Size',
        optionValues: [{ name: 'S', swatch: null }, { name: 'M', swatch: null }, { name: 'L', swatch: null }]
      }
    ],
    selectedOptions: [
      { name: 'Color', value: 'Multicolor' },
      { name: 'Size', value: 'M' }
    ]
  },
  {
    id: 'pinterest-fallback-2',
    title: 'Handcrafted Boho Fringe Bag',
    handle: 'pinterest-fallback-2',
    createdAt: new Date().toISOString(),
    vendor: 'Pinterest Creator',
    price: 45,
    featuredImage: {
      src: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=736',
      width: 736,
      height: 1100,
      alt: 'Handcrafted Boho Fringe Bag',
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=736',
        width: 736,
        height: 1100,
        alt: 'Handcrafted Boho Fringe Bag',
      }
    ],
    reviewNumber: 29,
    rating: 4.7,
    status: 'Pinterest Pin',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Beige Straw', swatch: { color: '#ebd9be', image: null } },
          { name: 'Terracotta', swatch: { color: '#c07c65', image: null } }
        ]
      },
      {
        name: 'Size',
        optionValues: [{ name: 'One Size', swatch: null }]
      }
    ],
    selectedOptions: [
      { name: 'Color', value: 'Beige Straw' },
      { name: 'Size', value: 'One Size' }
    ]
  },
  {
    id: 'pinterest-fallback-3',
    title: 'Cute Amigurumi Chubby Penguin',
    handle: 'pinterest-fallback-3',
    createdAt: new Date().toISOString(),
    vendor: 'Pinterest Creator',
    price: 24,
    featuredImage: {
      src: 'https://images.unsplash.com/photo-1608096299210-db7e38487075?auto=format&fit=crop&q=80&w=736',
      width: 736,
      height: 1100,
      alt: 'Cute Amigurumi Chubby Penguin',
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1608096299210-db7e38487075?auto=format&fit=crop&q=80&w=736',
        width: 736,
        height: 1100,
        alt: 'Cute Amigurumi Chubby Penguin',
      }
    ],
    reviewNumber: 56,
    rating: 4.9,
    status: 'Pinterest Pin',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Classic Black/White', swatch: { color: '#1a1a1a', image: null } },
          { name: 'Blue Penguin', swatch: { color: '#3d5a80', image: null } }
        ]
      },
      {
        name: 'Size',
        optionValues: [{ name: 'Mini (4")', swatch: null }, { name: 'Standard (7")', swatch: null }]
      }
    ],
    selectedOptions: [
      { name: 'Color', value: 'Classic Black/White' },
      { name: 'Size', value: 'Standard (7")' }
    ]
  },
  {
    id: 'pinterest-fallback-4',
    title: 'Modern Crochet Plant Hanger',
    handle: 'pinterest-fallback-4',
    createdAt: new Date().toISOString(),
    vendor: 'Pinterest Creator',
    price: 35,
    featuredImage: {
      src: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=736',
      width: 736,
      height: 1100,
      alt: 'Modern Crochet Plant Hanger',
    },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=736',
        width: 736,
        height: 1100,
        alt: 'Modern Crochet Plant Hanger',
      }
    ],
    reviewNumber: 18,
    rating: 4.6,
    status: 'Pinterest Pin',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Off-White Sage', swatch: { color: '#faeee2', image: null } },
          { name: 'Forest Green', swatch: { color: '#8ba88f', image: null } }
        ]
      },
      {
        name: 'Size',
        optionValues: [{ name: 'Standard (36")', swatch: null }]
      }
    ],
    selectedOptions: [
      { name: 'Color', value: 'Off-White Sage' },
      { name: 'Size', value: 'Standard (36")' }
    ]
  }
]

/**
 * Fetches and parses a public Pinterest board RSS feed.
 * Converted to standard e-commerce TProductItem structures.
 */
export async function fetchPinterestProducts(rssUrl: string): Promise<TProductItem[]> {
  if (!globalForPinterest.pinterestCache) {
    globalForPinterest.pinterestCache = {}
  }
  if (globalForPinterest.pinterestCache[rssUrl]) {
    return globalForPinterest.pinterestCache[rssUrl]
  }

  try {
    // 5-second fetch timeout to maintain fast page load times
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(rssUrl, {
      signal: controller.signal,
      next: { revalidate: 3600 }, // Cache on CDN / Next.js server for 1 hour
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`Failed to fetch Pinterest RSS feed: ${rssUrl} - Status: ${response.status}. Using fallbacks.`)
      return FALLBACK_PINTEREST_PRODUCTS
    }

    const xmlText = await response.text()
    if (!xmlText || !xmlText.includes('<item>')) {
      console.warn(`Invalid or empty Pinterest RSS XML from: ${rssUrl}. Using fallbacks.`)
      return FALLBACK_PINTEREST_PRODUCTS
    }

    // Parse items using string splitting to avoid external dependencies
    const itemsXml = xmlText.split('<item>')
    itemsXml.shift() // Remove header chunk before first <item>

    const products: TProductItem[] = []

    for (const itemXml of itemsXml) {
      // Extract title
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/)
      let title = titleMatch ? titleMatch[1].trim() : 'Pinterest Inspired Piece'
      title = decodeHtmlEntities(title)

      // Extract link/guid
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/)
      const link = linkMatch ? linkMatch[1].trim() : '#'

      // Extract guid/pinId
      const guidMatch = itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)
      const guid = guidMatch ? guidMatch[1].trim() : link

      // Try to parse Pinterest numerical Pin ID
      const pinIdMatch = guid.match(/pin\/(\d+)/)
      const pinIdStr = pinIdMatch ? pinIdMatch[1] : Math.abs(hashCode(title)).toString()
      const pinIdNum = parseInt(pinIdStr, 10) || 0

      // Extract description (which holds HTML representation of pin description and image)
      const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/)
      let rawDescription = descMatch ? descMatch[1].trim() : ''
      rawDescription = decodeHtmlEntities(rawDescription)

      // Extract Image Source URL from description
      // It can be encoded like src=&quot;url&quot; or src="url"
      const imgRegex = /src=(?:&quot;|")([^&"\s]+)(?:&quot;|")/i
      const imgMatch = rawDescription.match(imgRegex)

      let imageUrl = ''
      if (imgMatch) {
        imageUrl = imgMatch[1]
        // Upgrade size from 236x/474x to high-res 736x
        imageUrl = imageUrl.replace(/\/(236|474|170)x\//i, '/736x/')
      }

      // Skip items that don't have images
      if (!imageUrl) continue

      // Clean up description text (strip out HTML links and images)
      let cleanDescription = rawDescription
        .replace(/<a[^>]*>[\s\S]*?<\/a>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim()

      if (!cleanDescription) {
        cleanDescription = `A beautiful handmade design found on Pinterest. Every details is carefully crafted to inspire your next cozy crochet project.`
      }

      // Truncate title if it's way too long (Pinterest pins sometimes copy the full description into title)
      if (title.length > 50) {
        title = title.substring(0, 47) + '...'
      }

      // Parse price if present in description (e.g. $45), otherwise generate consistent mock price
      let price = 35
      const priceMatch = cleanDescription.match(/\$(\d+)/)
      if (priceMatch) {
        price = parseInt(priceMatch[1], 10)
      } else {
        // Generate a stable mock price between $18 and $65 based on Pin ID
        price = (pinIdNum % 48) + 18
      }

      // Generate stable rating between 4.5 and 5.0
      const rating = parseFloat((4.5 + ((pinIdNum % 6) * 0.1)).toFixed(1))
      // Stable review number between 10 and 150
      const reviewNumber = (pinIdNum % 141) + 10

      // Option mock-ups (Color & Size) for full catalog features compatibility
      const colorOptionValues = [
        { name: 'Warm Terracotta', swatch: { color: '#c07c65', image: null } },
        { name: 'Off-White Cream', swatch: { color: '#faeee2', image: null } },
        { name: 'Forest Green', swatch: { color: '#8ba88f', image: null } },
      ]
      // Pick color based on pin ID
      const chosenColor = colorOptionValues[pinIdNum % colorOptionValues.length].name

      const product: TProductItem = {
        id: `pinterest-${pinIdStr}`,
        title,
        handle: `pinterest-${pinIdStr}`,
        createdAt: new Date().toISOString(),
        vendor: 'Pinterest Inspiration',
        price,
        featuredImage: {
          src: imageUrl,
          width: 736,
          height: 1100,
          alt: title,
        },
        images: [
          {
            src: imageUrl,
            width: 736,
            height: 1100,
            alt: title,
          }
        ],
        reviewNumber,
        rating,
        status: 'Pinterest Pin',
        options: [
          {
            name: 'Color',
            optionValues: colorOptionValues
          },
          {
            name: 'Size',
            optionValues: [{ name: 'S', swatch: null }, { name: 'M', swatch: null }, { name: 'L', swatch: null }]
          }
        ],
        selectedOptions: [
          { name: 'Color', value: chosenColor },
          { name: 'Size', value: 'M' }
        ]
      }

      // Map clean description to detail parser lookup
      // We will attach dynamic properties that the detail page can read
      ;(product as any).pinterestDescription = cleanDescription
      ;(product as any).pinterestLink = link
      ;(product as any).isFromPinterest = true

      products.push(product)
    }

    const result = products.length > 0 ? products : FALLBACK_PINTEREST_PRODUCTS
    globalForPinterest.pinterestCache[rssUrl] = result
    return result
  } catch (error) {
    console.error(`Error fetching or parsing Pinterest RSS feed: ${rssUrl}`, error)
    return FALLBACK_PINTEREST_PRODUCTS
  }
}

// Simple string hash helper
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}
