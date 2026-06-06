import { TProductItem } from '@/data/data'

const globalForMagicNeedles = globalThis as unknown as {
  magicNeedlesCache?: TProductItem[]
}

// Decode basic HTML entities for clean display
function decodeHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]+>/g, '') // Strip HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function cleanTitle(title: string): string {
  if (!title) return ''
  
  let base = title
    .replace(/#\d{3,6}\b/g, '') // strip #10497
    .replace(/\b\d{3,6}\b/g, '') // strip 10497
    .replace(/#/g, '') // strip #
    .replace(/\s*-\s*-\s*/g, ' - ')
    .replace(/\s*-\s*$/g, '')
    .replace(/^\s*-\s*/g, '')
    .trim()
  
  return base.replace(/\s+/g, ' ').trim()
}

function parseProductTitle(title: string): { baseTitle: string; color: string; code: string } {
  if (!title) return { baseTitle: '', color: '', code: '' }

  // 1. Extract stock code (3-to-6 digits)
  let code = ''
  const codeMatch = title.match(/\b(\d{3,6})\b/)
  if (codeMatch) {
    code = codeMatch[1]
  }

  // Remove the code number and any extra spaces
  let clean = title
    .replace(/\b\d{3,6}\b/g, '')
    .replace(/#/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const knownColors = [
    'chilli pepper red', 'navy blue melange', 'faded denim melange', 'denim melange',
    'dark grey melange', 'light grey melange', 'brown melange', 'baby yellow',
    'pista green', 'navy blue', 'sage green', 'pale green', 'dark green',
    'leaf green', 'lime green', 'cool grey', 'powder pink', 'pretty pink',
    'royal blue', 'neon yellow', 'light grey', 'dark grey', 'golden brown',
    'beige powder', 'marine blue', 'sky blue', 'sea blue', 'smoky blue',
    'boysenberry', 'old rose', 'autumn rose', 'dried rose', 'just brown',
    'just blue', 'shocking green', 'sea green', 'olive green', 'forest green',
    'bottle green', 'teal green', 'mint green', 'grass green', 'emerald green',
    'light blue', 'ice blue', 'baby blue', 'powder blue', 'dusty blue',
    'light pink', 'baby pink', 'dusty pink', 'dusty rose', 'blush pink',
    'hot pink', 'candy pink', 'flamingo pink',
    'dark brown', 'light brown', 'dark blue', 'dark yellow', 'dark red',
    'dark purple', 'dark violet', 'dark orange', 'dark beige', 'light beige',
    'neon pink', 'neon green', 'neon orange', 'neon blue',
    'bright pink', 'bright green', 'bright blue', 'bright yellow', 'bright red',
    'orange', 'purple', 'yellow', 'mustard', 'apricot',
    'peach', 'cream', 'white', 'black', 'brown', 'green', 'olive', 'coral red',
    'red', 'maroon', 'crimson', 'claret', 'grey', 'gray', 'pink', 'rose',
    'beige', 'tan', 'violet', 'khaki', 'ivory', 'fuchsia', 'lilac', 'grape',
    'tomato', 'citron', 'lavender', 'lavendar', 'mocha', 'stone', 'skin', 'teal',
    'coral', 'rust', 'terracotta', 'burgundy', 'wine', 'copper', 'gold',
    'silver', 'nude', 'champagne', 'charcoal', 'indigo', 'cobalt', 'azure',
    'cyan', 'turquoise', 'aqua', 'mint', 'sage', 'mauve', 'plum', 'magenta',
    'multicolor', 'multi color', 'multi-color', 'multi colored', 'multicoloured', 'blue'
  ]

  knownColors.sort((a, b) => b.length - a.length)

  // Noun colors that conflict with fruits/flowers/styles and should only be matched at suffix/prefix
  const nounColors = ['rose', 'orange', 'peach', 'mint']

  let color = ''
  let baseTitle = clean

  let foundColors: string[] = []
  let workingTitle = clean

  let strippedSuffix = true
  while (strippedSuffix) {
    strippedSuffix = false
    workingTitle = workingTitle.replace(/[\s\-\/\&]+$/, '').trim()

    for (const kc of knownColors) {
      const regexSuffix = new RegExp(`\\b${kc}$`, 'i')
      if (regexSuffix.test(workingTitle)) {
        foundColors.unshift(kc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
        workingTitle = workingTitle.replace(regexSuffix, '').trim()
        strippedSuffix = true
        break
      }
    }
  }

  if (foundColors.length > 0) {
    color = foundColors.join('/')
    baseTitle = workingTitle
  } else {
    let workingPrefixTitle = clean
    let foundPrefixColors: string[] = []
    let strippedPrefix = true
    while (strippedPrefix) {
      strippedPrefix = false
      workingPrefixTitle = workingPrefixTitle.replace(/^[\s\-\/\&]+/, '').trim()

      for (const kc of knownColors) {
        const regexPrefix = new RegExp(`^${kc}\\b`, 'i')
        if (regexPrefix.test(workingPrefixTitle)) {
          const candidateRest = workingPrefixTitle.replace(regexPrefix, '').trim()
          if (candidateRest.toLowerCase().startsWith('handmade')) {
            foundPrefixColors.push(kc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
            workingPrefixTitle = candidateRest
            strippedPrefix = true
            break
          }
        }
      }
    }

    if (foundPrefixColors.length > 0) {
      color = foundPrefixColors.join('/')
      baseTitle = workingPrefixTitle
    }
  }

  // If still no color was found, strip any non-noun color from anywhere in the title
  if (!color) {
    const nonNounColors = knownColors.filter(kc => !nounColors.includes(kc))
    for (const kc of nonNounColors) {
      const regexAnywhere = new RegExp(`\\b${kc}\\b`, 'i')
      if (regexAnywhere.test(clean)) {
        color = kc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        baseTitle = clean.replace(regexAnywhere, '').trim()
        break
      }
    }
  }

  baseTitle = baseTitle
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s*-\s*-\s*/g, ' - ')
    .replace(/\s*-\s*$/g, '')
    .replace(/^\s*-\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!color && code) {
    color = `Style #${code}`
  } else if (!color) {
    color = 'Original'
  }

  return { baseTitle, color, code }
}

function getColorHex(color: string): string {
  let colorHex = '#ebd9be' // default beige
  const valLower = color.toLowerCase()
  if (valLower.includes('white') || valLower.includes('cream') || valLower.includes('ivory') || valLower.includes('nude') || valLower.includes('champagne')) colorHex = '#faeee2'
  else if (valLower.includes('navy') || valLower.includes('cobalt') || valLower.includes('indigo') || valLower.includes('royal blue')) colorHex = '#1e3a5f'
  else if (valLower.includes('sky blue') || valLower.includes('baby blue') || valLower.includes('powder blue') || valLower.includes('light blue') || valLower.includes('ice blue') || valLower.includes('azure') || valLower.includes('dusty blue')) colorHex = '#a8d1e7'
  else if (valLower.includes('blue') || valLower.includes('marine')) colorHex = '#3d5a80'
  else if (valLower.includes('teal') || valLower.includes('turquoise') || valLower.includes('aqua') || valLower.includes('cyan')) colorHex = '#1b998b'
  else if (valLower.includes('mint') || valLower.includes('sage') || valLower.includes('pale green') || valLower.includes('pista')) colorHex = '#c5e8d1'
  else if (valLower.includes('shocking green') || valLower.includes('neon')) colorHex = '#39ff14'
  else if (valLower.includes('sea green') || valLower.includes('bottle green') || valLower.includes('forest green') || valLower.includes('emerald') || valLower.includes('dark green')) colorHex = '#2d6a4f'
  else if (valLower.includes('green') || valLower.includes('olive')) colorHex = '#8ba88f'
  else if (valLower.includes('red') || valLower.includes('coral') || valLower.includes('tomato') || valLower.includes('maroon') || valLower.includes('crimson') || valLower.includes('claret') || valLower.includes('rust') || valLower.includes('terracotta') || valLower.includes('chilli pepper red')) colorHex = '#9e2a2b'
  else if (valLower.includes('black') || valLower.includes('charcoal')) colorHex = '#222222'
  else if (valLower.includes('grey') || valLower.includes('gray') || valLower.includes('silver') || valLower.includes('stone')) colorHex = '#888888'
  else if (valLower.includes('hot pink') || valLower.includes('magenta') || valLower.includes('fuchsia')) colorHex = '#ff1493'
  else if (valLower.includes('pink') || valLower.includes('rose') || valLower.includes('blush') || valLower.includes('candy pink') || valLower.includes('flamingo') || valLower.includes('powder pink')) colorHex = '#e5989b'
  else if (valLower.includes('lavender') || valLower.includes('lavendar') || valLower.includes('lilac') || valLower.includes('mauve')) colorHex = '#c8b6e2'
  else if (valLower.includes('purple') || valLower.includes('violet') || valLower.includes('plum') || valLower.includes('grape') || valLower.includes('boysenberry')) colorHex = '#7b2d8b'
  else if (valLower.includes('yellow') || valLower.includes('mustard') || valLower.includes('citron') || valLower.includes('gold') || valLower.includes('baby yellow')) colorHex = '#f4c430'
  else if (valLower.includes('orange') || valLower.includes('apricot') || valLower.includes('peach')) colorHex = '#f4a460'
  else if (valLower.includes('brown') || valLower.includes('tan') || valLower.includes('mocha') || valLower.includes('copper')) colorHex = '#c07c65'
  else if (valLower.includes('beige') || valLower.includes('khaki') || valLower.includes('skin')) colorHex = '#e8d5b7'
  else if (valLower.includes('burgundy') || valLower.includes('wine')) colorHex = '#6d0f1d'
  else if (valLower.includes('multicolor') || valLower.includes('multi')) colorHex = '#ff69b4'
  return colorHex
}

function needsSizes(p: TProductItem): boolean {
  const typeLower = ((p as any).productType || '').toLowerCase()
  const titleLower = (p.title || '').toLowerCase()
  
  // Exclude non-clothing items
  if (
    titleLower.includes('toy') ||
    titleLower.includes('keychain') ||
    titleLower.includes('flower') ||
    titleLower.includes('coaster') ||
    titleLower.includes('pillow') ||
    titleLower.includes('blanket') ||
    titleLower.includes('bag') ||
    titleLower.includes('hat') ||
    titleLower.includes('beanie') ||
    titleLower.includes('cap') ||
    titleLower.includes('scarf') ||
    titleLower.includes('cowl') ||
    titleLower.includes('muffler') ||
    titleLower.includes('booties') ||
    titleLower.includes('socks') ||
    titleLower.includes('slippers') ||
    titleLower.includes('shoes') ||
    titleLower.includes('magnet') ||
    titleLower.includes('lantern') ||
    titleLower.includes('hanging') ||
    titleLower.includes('decor') ||
    titleLower.includes('poncho') ||
    titleLower.includes('cape') ||
    titleLower.includes('shawl') ||
    titleLower.includes('wrap')
  ) {
    return false
  }

  return (
    typeLower.includes('sweater') ||
    typeLower.includes('cardigan') ||
    typeLower.includes('pullover') ||
    typeLower.includes('jacket') ||
    typeLower.includes('apparel') ||
    typeLower.includes('shrug') ||
    titleLower.includes('sweater') ||
    titleLower.includes('cardigan') ||
    titleLower.includes('pullover') ||
    titleLower.includes('jacket') ||
    titleLower.includes('shrug') ||
    titleLower.includes('top') ||
    titleLower.includes('vest') ||
    titleLower.includes('bralette')
  )
}

function groupAndMergeProducts(products: TProductItem[]): TProductItem[] {
  const groups: Record<string, TProductItem[]> = {}
  
  // Group products by their base title slug/key (or normalized base title)
  products.forEach(p => {
    const { baseTitle } = parseProductTitle((p as any).originalTitle || p.title)
    const key = baseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || p.handle
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(p)
  })

  const mergedProducts: TProductItem[] = []

  // Merge each group into a single product with variant options
  Object.entries(groups).forEach(([key, groupProducts]) => {
    // Parse all products in the group to extract their original base colors and codes
    const parsedItems = groupProducts.map(gp => {
      const parsed = parseProductTitle((gp as any).originalTitle || gp.title)
      return {
        gp,
        baseTitle: parsed.baseTitle,
        color: parsed.color,
        code: parsed.code
      }
    })

    // Count color occurrences to detect duplicate colors within the same group
    const colorCounts: Record<string, number> = {}
    parsedItems.forEach(item => {
      const cLower = item.color.toLowerCase()
      colorCounts[cLower] = (colorCounts[cLower] || 0) + 1
    })

    // Assign resolved colors (append code/index if there are duplicates)
    const colorIndices: Record<string, number> = {}
    const resolvedItems = parsedItems.map(item => {
      const cLower = item.color.toLowerCase()
      let resolvedColor = item.color
      if (colorCounts[cLower] > 1) {
        if (item.code) {
          resolvedColor = `${item.color} #${item.code}`
        } else {
          colorIndices[cLower] = (colorIndices[cLower] || 0) + 1
          resolvedColor = `${item.color} #${colorIndices[cLower]}`
        }
      }
      return {
        ...item,
        resolvedColor
      }
    })

    // Attach resolved color tag to all product images so we can identify variant photos
    resolvedItems.forEach(item => {
      const { gp, resolvedColor } = item
      if (gp.featuredImage) {
        ;(gp.featuredImage as any).color = resolvedColor
      }
      if (gp.images) {
        gp.images.forEach(img => {
          ;(img as any).color = resolvedColor
        })
      }
    })

    if (groupProducts.length === 1) {
      const item = resolvedItems[0]
      const single = item.gp
      const baseTitle = item.baseTitle
      const color = item.resolvedColor

      // Update single product's title to be clean
      single.title = baseTitle
      
      // Determine swatch color
      const colorHex = getColorHex(item.color)

      const colorOption = {
        name: 'Color',
        optionValues: [
          {
            name: color,
            swatch: {
              color: colorHex,
              image: single.featuredImage?.src || null
            }
          }
        ]
      }

      // Collect existing Size options or default to Standard
      const existingSizeOpt = single.options?.find(opt => opt.name === 'Size')
      const sizeOption = {
        name: 'Size',
        optionValues: existingSizeOpt?.optionValues || [{ name: 'Standard', swatch: null }]
      }

      single.options = [colorOption, sizeOption]
      single.selectedOptions = [
        { name: 'Color', value: color },
        { name: 'Size', value: sizeOption.optionValues[0]?.name || 'Standard' }
      ]

      mergedProducts.push(single)
      return
    }

    const master = groupProducts[0]
    const mergedTitle = resolvedItems[0].baseTitle
    const mergedHandle = `magic-${key}`

    // Collect all unique images from all products in the group
    const allImages: typeof master.images = []
    const seenImageUrls = new Set<string>()

    resolvedItems.forEach(item => {
      const gp = item.gp
      // Add featured image first
      if (gp.featuredImage?.src && !seenImageUrls.has(gp.featuredImage.src)) {
        seenImageUrls.add(gp.featuredImage.src)
        allImages.push(gp.featuredImage)
      }
      // Add other images
      if (gp.images) {
        gp.images.forEach(img => {
          if (img.src && !seenImageUrls.has(img.src)) {
            seenImageUrls.add(img.src)
            allImages.push(img)
          }
        })
      }
    })

    // Construct Color option values for the grouped variants
    const colorValues: { name: string; swatch: { color: string; image: string | null } | null }[] = []
    
    resolvedItems.forEach(item => {
      const gp = item.gp
      const color = item.resolvedColor
      const colorHex = getColorHex(item.color)

      if (!colorValues.some(cv => cv.name === color)) {
        colorValues.push({
          name: color,
          swatch: {
            color: colorHex,
            image: gp.featuredImage?.src || null
          }
        })
      }
    })

    // Collect all unique Size options
    const sizeValues: { name: string; swatch?: any }[] = []
    const seenSizes = new Set<string>()

    groupProducts.forEach(gp => {
      if (gp.options) {
        gp.options.forEach(opt => {
          if (opt.name.toLowerCase().includes('size')) {
            opt.optionValues?.forEach(val => {
              if (!seenSizes.has(val.name)) {
                seenSizes.add(val.name)
                sizeValues.push(val)
              }
            })
          }
        })
      }
    })

    if (sizeValues.length === 0) {
      sizeValues.push({ name: 'Standard', swatch: null })
    }

    const mergedOptions = [
      {
        name: 'Color',
        optionValues: colorValues
      },
      {
        name: 'Size',
        optionValues: sizeValues
      }
    ]

    const mergedSelectedOptions = [
      { name: 'Color', value: colorValues[0]?.name || 'Original' },
      { name: 'Size', value: sizeValues[0]?.name || 'Standard' }
    ]

    const mergedItem: TProductItem = {
      ...master,
      title: mergedTitle,
      handle: mergedHandle,
      images: allImages,
      featuredImage: allImages[0] || master.featuredImage,
      options: mergedOptions,
      selectedOptions: mergedSelectedOptions
    }

    mergedProducts.push(mergedItem)
  })

  // Normalize sizes based on whether the product actually needs sizing options
  mergedProducts.forEach(p => {
    const sizeOpt = p.options?.find(opt => opt.name === 'Size')

    if (sizeOpt) {
      if (needsSizes(p)) {
        const sizeValues = sizeOpt.optionValues || []
        const hasMultipleRealSizes = sizeValues.some(sv => {
          const n = sv.name.toLowerCase()
          return n !== 'standard' && n !== 'one size' && n !== 'default' && n !== 'default title'
        })

        if (!hasMultipleRealSizes || sizeValues.length <= 1) {
          sizeOpt.optionValues = [
            { name: 'S', swatch: null },
            { name: 'M', swatch: null },
            { name: 'L', swatch: null },
            { name: 'XL', swatch: null }
          ]
          const sizeSelOpt = p.selectedOptions?.find(opt => opt.name === 'Size')
          if (sizeSelOpt) {
            sizeSelOpt.value = 'S'
          }
        }
      } else {
        sizeOpt.optionValues = [{ name: 'Standard', swatch: null }]
        const sizeSelOpt = p.selectedOptions?.find(opt => opt.name === 'Size')
        if (sizeSelOpt) {
          sizeSelOpt.value = 'Standard'
        }
      }
    }
  })

  return mergedProducts
}

/**
 * Fetches products from magicneedles.in JSON endpoint across multiple pages
 * and maps them to the store's TProductItem format, filtering out raw supplies.
 */
export async function fetchMagicNeedlesProducts(): Promise<TProductItem[]> {
  if (globalForMagicNeedles.magicNeedlesCache && globalForMagicNeedles.magicNeedlesCache.length > 0) {
    return globalForMagicNeedles.magicNeedlesCache
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000) // 12-second timeout for 8 pages

    // Fetch pages 1 to 8 in parallel to build a comprehensive catalog of live finished products
    const pageNumbers = [1, 2, 3, 4, 5, 6, 7, 8]
    const fetchPromises = pageNumbers.map((page) =>
      fetch(`https://magicneedles.in/products.json?limit=100&page=${page}`, {
        signal: controller.signal,
        next: { revalidate: 3600 }, // Cache for 1 hour
      }).then(async (res) => {
        if (!res.ok) {
          console.warn(`Page ${page} failed with status ${res.status}`)
          return []
        }
        const json = await res.json()
        return Array.isArray(json.products) ? json.products : []
      })
    )

    const pagesResults = await Promise.all(fetchPromises)
    clearTimeout(timeoutId)

    // Flatten all pages
    const allProducts = pagesResults.flat()
    if (allProducts.length === 0) {
      console.warn('No products fetched from magicneedles.in')
      return []
    }

    // De-duplicate products by ID
    const seenIds = new Set<number>()
    const uniqueProducts = allProducts.filter((p: any) => {
      if (seenIds.has(p.id)) return false
      seenIds.add(p.id)
      return true
    })

    // Filter out raw craft supplies, tools, and Hobby/Happy Store branded products
    const finishedProducts = uniqueProducts.filter((p: any) => {
      const productType = (p.product_type || '').toLowerCase()
      const titleLower = (p.title || '').toLowerCase()
      const tags = (p.tags || []).map((t: string) => t.toLowerCase())
      const bodyLower = (p.body_html || '').toLowerCase()
      const vendorLower = (p.vendor || '').toLowerCase()

      // Exclude raw craft supplies, knitting needles, crochet hooks, looms, tools, patterns, books, workshops/offline classes
      const isSupplyOrWorkshop =
        productType.includes('yarn') ||
        productType.includes('needle') ||
        productType.includes('hook') ||
        productType.includes('slick') ||
        productType.includes('loom') ||
        productType.includes('tool') ||
        productType.includes('pattern') ||
        productType.includes('book') ||
        productType.includes('button') ||
        productType.includes('marker') ||
        productType.includes('gauge') ||
        productType.includes('rope') ||
        productType.includes('cord') ||
        productType.includes('workshop') ||
        productType.includes('class') ||
        titleLower.includes('yarn') ||
        titleLower.includes('needle') ||
        titleLower.includes('hook') ||
        titleLower.includes('skein') ||
        titleLower.includes('loom') ||
        titleLower.includes('tool') ||
        titleLower.includes('pattern') ||
        titleLower.includes('book') ||
        titleLower.includes('button') ||
        titleLower.includes('clover') ||
        titleLower.includes('pony') ||
        titleLower.includes('workshop') ||
        titleLower.includes('offline') ||
        titleLower.includes('class') ||
        tags.includes('yarn') ||
        tags.includes('needles') ||
        tags.includes('hooks') ||
        tags.includes('loom') ||
        tags.includes('kit') ||
        tags.includes('tools') ||
        tags.includes('patterns') ||
        tags.includes('workshop') ||
        tags.includes('workshops') ||
        tags.includes('classes')

      // Exclude any product associated with Hobby Store or Happy Store (typo fallback)
      const isHobbyStore =
        titleLower.includes('hobby store') ||
        titleLower.includes('hobbystore') ||
        titleLower.includes('happy store') ||
        titleLower.includes('happystore') ||
        bodyLower.includes('hobby store') ||
        bodyLower.includes('hobbystore') ||
        bodyLower.includes('happy store') ||
        bodyLower.includes('happystore') ||
        vendorLower.includes('hobby store') ||
        vendorLower.includes('hobbystore') ||
        vendorLower.includes('happy store') ||
        vendorLower.includes('happystore') ||
        productType.includes('hobby store') ||
        productType.includes('hobbystore') ||
        productType.includes('happy store') ||
        productType.includes('happystore') ||
        tags.some((t: string) =>
          t.includes('hobby store') ||
          t.includes('hobbystore') ||
          t.includes('happy store') ||
          t.includes('happystore')
        )

      return !isSupplyOrWorkshop && !isHobbyStore
    })

    const mappedProducts: TProductItem[] = finishedProducts.map((p: any) => {
      const idStr = p.id.toString()
      const idNum = parseInt(idStr, 10) || 0
      const cleanedTitle = cleanTitle(p.title || '')

      // Map featured image
      let featuredImage = {
        src: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=736',
        width: 1000,
        height: 1000,
        alt: cleanedTitle,
      }

      if (p.images && p.images.length > 0) {
        featuredImage = {
          src: p.images[0].src,
          width: p.images[0].width || 1000,
          height: p.images[0].height || 1000,
          alt: cleanedTitle,
        }
      }

      // Map all images
      const images = (p.images || []).map((img: any) => ({
        src: img.src,
        width: img.width || 1000,
        height: img.height || 1000,
        alt: cleanedTitle,
      }))

      // Convert price from variant
      let price = 45
      if (p.variants && p.variants.length > 0 && p.variants[0].price) {
        const inrPrice = parseFloat(p.variants[0].price)
        if (inrPrice > 0) {
          // Scale INR price to USD-like range ($15 to $120)
          price = Math.round(inrPrice / 40)
          if (price < 10) price = 15
        }
      }

      // Map collection handles based on type, title, and tags
      const collectionHandles: string[] = []
      const productType = (p.product_type || '').toLowerCase()
      const titleLower = (p.title || '').toLowerCase()
      const tags = (p.tags || []).map((t: string) => t.toLowerCase())

      // 1. Cozy Wearables (jackets)
      if (
        productType.includes('poncho') ||
        productType.includes('sweater') ||
        productType.includes('shrug') ||
        productType.includes('cardigan') ||
        productType.includes('cape') ||
        productType.includes('shawl') ||
        productType.includes('apparel') ||
        productType.includes('wrap') ||
        titleLower.includes('sweater') ||
        titleLower.includes('cardigan') ||
        titleLower.includes('pullover') ||
        titleLower.includes('poncho') ||
        titleLower.includes('shrug') ||
        titleLower.includes('top') ||
        titleLower.includes('vest') ||
        titleLower.includes('jacket') ||
        titleLower.includes('shawl') ||
        titleLower.includes('shrug') ||
        titleLower.includes('cape') ||
        titleLower.includes('crochet top') ||
        tags.includes('sweater') ||
        tags.includes('cardigan') ||
        tags.includes('shawls')
      ) {
        collectionHandles.push('jackets')
      }

      // 2. Accessories (accessories) - caps, hats, scarves, socks, cup cozies
      if (
        productType.includes('cap') ||
        productType.includes('hat') ||
        productType.includes('glove') ||
        productType.includes('mittens') ||
        productType.includes('scarf') ||
        productType.includes('cowl') ||
        productType.includes('muffler') ||
        productType.includes('accessory') ||
        productType.includes('cozy') ||
        titleLower.includes('beanie') ||
        titleLower.includes('cap') ||
        titleLower.includes('hat') ||
        titleLower.includes('scarf') ||
        titleLower.includes('cowl') ||
        titleLower.includes('mittens') ||
        titleLower.includes('socks') ||
        titleLower.includes('headband') ||
        titleLower.includes('scrunchie') ||
        titleLower.includes('cozy') ||
        titleLower.includes('ear warmer') ||
        titleLower.includes('hand warmer') ||
        titleLower.includes('cozies') ||
        tags.includes('cap') ||
        tags.includes('scarf') ||
        tags.includes('hat') ||
        tags.includes('accessories') ||
        tags.includes('cozy')
      ) {
        collectionHandles.push('accessories')
      }

      // 3. Bags (jeans / bags)
      if (
        productType.includes('bag') ||
        productType.includes('tote') ||
        productType.includes('purse') ||
        productType.includes('pouch') ||
        titleLower.includes('bag') ||
        titleLower.includes('tote') ||
        titleLower.includes('purse') ||
        titleLower.includes('pouch') ||
        titleLower.includes('backpack') ||
        titleLower.includes('clutch') ||
        titleLower.includes('sling') ||
        titleLower.includes('bottle holder') ||
        tags.includes('bag') ||
        tags.includes('tote') ||
        tags.includes('purse')
      ) {
        collectionHandles.push('jeans')
        collectionHandles.push('bags')
      }

      // 4. Artisanal Kits & Baby Shoes / Slippers (shoes)
      if (
        productType.includes('shoes') ||
        productType.includes('booties') ||
        productType.includes('slippers') ||
        titleLower.includes('booties') ||
        titleLower.includes('socks') ||
        titleLower.includes('slippers') ||
        titleLower.includes('shoes') ||
        tags.includes('booties') ||
        tags.includes('socks')
      ) {
        collectionHandles.push('shoes')
      }

      // 5. Home Decor / Living (coats) - cushion covers, blankets, throws, coaster sets, hanging lanterns
      if (
        productType.includes('decor') ||
        productType.includes('home') ||
        productType.includes('cushion') ||
        productType.includes('blanket') ||
        productType.includes('throw') ||
        productType.includes('coaster') ||
        productType.includes('lantern') ||
        titleLower.includes('blanket') ||
        titleLower.includes('cushion') ||
        titleLower.includes('pillow') ||
        titleLower.includes('coaster') ||
        titleLower.includes('rug') ||
        titleLower.includes('hanger') ||
        titleLower.includes('basket') ||
        titleLower.includes('mat') ||
        titleLower.includes('lantern') ||
        titleLower.includes('hanging') ||
        titleLower.includes('holder') ||
        tags.includes('blanket') ||
        tags.includes('decor') ||
        tags.includes('cushion') ||
        tags.includes('coaster') ||
        tags.includes('lantern')
      ) {
        collectionHandles.push('coats')
      }

      // 6. Toys / Amigurumi / Keychains (t-shirts)
      if (
        titleLower.includes('toy') ||
        titleLower.includes('amigurumi') ||
        titleLower.includes('plush') ||
        titleLower.includes('doll') ||
        titleLower.includes('stuffed') ||
        titleLower.includes('keychain') ||
        titleLower.includes('key ring') ||
        titleLower.includes('charm') ||
        titleLower.includes('heart') ||
        tags.includes('toy') ||
        tags.includes('amigurumi') ||
        tags.includes('plushie') ||
        tags.includes('keychain')
      ) {
        collectionHandles.push('t-shirts')
      }

      // If no categories mapped, push default fallback category based on name hash
      if (collectionHandles.length === 0) {
        const categories = ['jackets', 'accessories', 'coats', 'jeans', 'bags']
        collectionHandles.push(categories[idNum % categories.length])
      }

      // Map options (these will be overridden by groupAndMergeProducts if merged)
      let options = [
        {
          name: 'Color',
          optionValues: [
            { name: 'Original', swatch: { color: '#ebd9be', image: null } },
            { name: 'Sage Green', swatch: { color: '#8ba88f', image: null } },
            { name: 'Dusty Rose', swatch: { color: '#e5989b', image: null } }
          ]
        },
        {
          name: 'Size',
          optionValues: [{ name: 'Standard', swatch: null }]
        }
      ]

      if (p.options && p.options.length > 0) {
        options = p.options.map((opt: any) => {
          const name = opt.name
          const values = opt.values || []
          return {
            name,
            optionValues: values.map((val: string, index: number) => {
              let swatch = null
              if (name.toLowerCase().includes('color') || name.toLowerCase().includes('colour')) {
                let colorHex = '#e09f3e'
                const valLower = val.toLowerCase()
                if (valLower.includes('white') || valLower.includes('cream')) colorHex = '#faeee2'
                else if (valLower.includes('blue') || valLower.includes('navy')) colorHex = '#3d5a80'
                else if (valLower.includes('green') || valLower.includes('olive')) colorHex = '#8ba88f'
                else if (valLower.includes('red') || valLower.includes('maroon') || valLower.includes('crimson')) colorHex = '#9e2a2b'
                else if (valLower.includes('black') || valLower.includes('grey') || valLower.includes('gray')) colorHex = '#333333'
                else if (valLower.includes('pink') || valLower.includes('rose')) colorHex = '#e5989b'
                else if (valLower.includes('yellow') || valLower.includes('mustard')) colorHex = '#fff3b0'
                else if (valLower.includes('brown') || valLower.includes('beige') || valLower.includes('tan')) colorHex = '#c07c65'

                swatch = { color: colorHex, image: null }
              }
              return {
                name: val,
                swatch,
              }
            })
          }
        })
      }

      // Selected options
      const selectedOptions = options.map((opt) => ({
        name: opt.name,
        value: opt.optionValues[0]?.name || ''
      }))

      // Rating/Reviews
      const rating = parseFloat((4.5 + ((idNum % 6) * 0.1)).toFixed(1))
      const reviewNumber = (idNum % 98) + 8

      // Clean HTML description
      const cleanDesc = decodeHtml(p.body_html || '')

      const item: TProductItem = {
        id: `magic-${idStr}`,
        title: cleanedTitle,
        handle: `magic-${p.handle}`,
        createdAt: p.created_at,
        vendor: p.vendor || 'Magic Needles',
        price,
        featuredImage,
        images,
        reviewNumber,
        rating,
        status: tags.includes('tag__hot_clearance') ? '50% Discount' : (idNum % 10 === 0 ? 'limited edition' : 'New in'),
        options,
        selectedOptions,
      }

      // Attach raw details for routing
      ;(item as any).magicDescription = cleanDesc
      ;(item as any).isFromMagicNeedles = true
      ;(item as any).collectionHandles = collectionHandles
      ;(item as any).originalUrl = `https://magicneedles.in/products/${p.handle}`
      ;(item as any).originalTitle = p.title || ''
      ;(item as any).productType = p.product_type || ''
      ;(item as any).tags = p.tags || []

      return item
    })

    const result = groupAndMergeProducts(mappedProducts)
    globalForMagicNeedles.magicNeedlesCache = result
    return result
  } catch (error) {
    console.error('Error fetching magicneedles.in products:', error)
    return []
  }
}
