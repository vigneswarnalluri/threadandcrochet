import collectionImage1 from '@/images/collections/1.png'
import collectionImage2 from '@/images/collections/2.png'
import collectionImage3 from '@/images/collections/3.png'
import collectionImage4 from '@/images/collections/4.png'
import collectionImage5 from '@/images/collections/5.png'
import collectionImage6 from '@/images/collections/6.png'
import collectionImage7 from '@/images/collections/7.png'
import boothImage1 from '@/images/collections/booth1.png'
import boothImage2 from '@/images/collections/booth2.png'
import boothImage3 from '@/images/collections/booth3.png'
import boothImage4 from '@/images/collections/booth4.png'
import productImage1_1 from '@/images/products/p1-1.jpg'
import productImage1_2 from '@/images/products/p1-2.jpg'
import productImage1_3 from '@/images/products/p1-3.jpg'
import productImage1 from '@/images/products/p1.jpg'
import productImage2_1 from '@/images/products/p2-1.jpg'
import productImage2_2 from '@/images/products/p2-2.jpg'
import productImage2_3 from '@/images/products/p2-3.jpg'
import productImage2 from '@/images/products/p2.jpg'
import productImage3_1 from '@/images/products/p3-1.jpg'
import productImage3_2 from '@/images/products/p3-2.jpg'
import productImage3_3 from '@/images/products/p3-3.jpg'
import productImage3 from '@/images/products/p3.jpg'
import productImage4_1 from '@/images/products/p4-1.jpg'
import productImage4_2 from '@/images/products/p4-2.jpg'
import productImage4_3 from '@/images/products/p4-3.jpg'
import productImage4 from '@/images/products/p4.jpg'
import productImage5_1 from '@/images/products/p5-1.jpg'
import productImage5_2 from '@/images/products/p5-2.jpg'
import productImage5_3 from '@/images/products/p5-3.jpg'
import productImage5 from '@/images/products/p5.jpg'
import productImage6_1 from '@/images/products/p6-1.jpg'
import productImage6_2 from '@/images/products/p6-2.jpg'
import productImage6_3 from '@/images/products/p6-3.jpg'
import productImage6 from '@/images/products/p6.jpg'
import productImage7_1 from '@/images/products/p7-1.jpg'
import productImage7_2 from '@/images/products/p7-2.jpg'
import productImage7_3 from '@/images/products/p7-3.jpg'
import productImage7 from '@/images/products/p7.jpg'
import productImage8_1 from '@/images/products/p8-1.jpg'
import productImage8_2 from '@/images/products/p8-2.jpg'
import productImage8_3 from '@/images/products/p8-3.jpg'
import productImage8 from '@/images/products/p8.jpg'
import avatarImage1 from '@/images/users/avatar1.jpg'
import avatarImage2 from '@/images/users/avatar2.jpg'
import avatarImage3 from '@/images/users/avatar3.jpg'
import avatarImage4 from '@/images/users/avatar4.jpg'
import { shuffleArray } from '@/utils/shuffleArray'
import { fetchPinterestProducts } from '@/utils/pinterest'
import { fetchMagicNeedlesProducts } from '@/utils/magicneedles'

export async function getOrder(number: string) {
  const allOrders = await getOrders()
  let order = allOrders.find((order) => order.number.toString() === number)

  if (!order) {
    // throw new Error( `Order with number ${number} not found.` )

    // for demo purposes, we can log a warning and return the first order
    // If no order found, return the first order as a fallback
    console.warn(`Order with number ${number} not found. Returning the first order as a fallback.`)
    order = allOrders[0]
  }

  return order
}
export async function getOrders() {
  return [
    {
      number: '4657',
      date: 'March 22, 2025',
      status: 'Delivered on January 11, 2025',
      invoiceHref: '#',
      totalQuantity: 4,
      cost: {
        subtotal: 199,
        shipping: 0,
        tax: 0,
        total: 199,
        discount: 0,
      },
      products: [
        {
          id: 'gid://2',
          title: 'Nomad Tumbler',
          handle: 'nomad-tumbler',
          description:
            'This durable and portable insulated tumbler will keep your beverage at the perfect temperature during your next adventure.',
          href: '#',
          price: 35,
          status: 'Preparing to ship',
          step: 1,
          date: 'March 24, 2021',
          datetime: '2021-03-24',
          address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
          email: 'f•••@example.com',
          phone: '1•••••••••40',
          featuredImage: {
            src: productImage2.src,
            width: productImage2.width,
            height: productImage2.height,
            alt: 'Insulated bottle with white base and black snap lid.',
          },
          quantity: 1,
          size: 'XS',
          color: 'Black Brown',
        },
        {
          id: 'gid://3',
          title: 'Minimalist Wristwatch',
          handle: 'minimalist-wristwatch',
          description: 'This contemporary wristwatch has a clean, minimalist look and high quality components.',
          href: '#',
          price: 149,
          status: 'Shipped',
          step: 0,
          date: 'March 23, 2021',
          datetime: '2021-03-23',
          address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
          email: 'f•••@example.com',
          phone: '1•••••••••40',
          featuredImage: {
            src: productImage4.src,
            width: productImage4.width,
            height: productImage4.height,
            alt: 'Insulated bottle with white base and black snap lid.',
          },
          quantity: 1,
          size: 'XL',
          color: 'White',
        },
      ],
    },
    {
      number: '4376',
      status: 'Delivered on January 08, 2028',
      invoiceHref: '#',
      date: 'March 22, 2025',
      totalQuantity: 4,
      cost: {
        subtotal: 199,
        shipping: 0,
        tax: 0,
        total: 199,
        discount: 0,
      },
      products: [
        {
          id: 'gid://1',
          title: 'Nomad Tumbler',
          handle: 'nomad-tumbler',
          description:
            'This durable and portable insulated tumbler will keep your beverage at the perfect temperature during your next adventure.',
          href: '#',
          price: 99,
          status: 'Preparing to ship',
          step: 1,
          date: 'March 24, 2021',
          datetime: '2021-03-24',
          address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
          email: 'f•••@example.com',
          phone: '1•••••••••40',
          featuredImage: {
            src: productImage1.src,
            width: productImage1.width,
            height: productImage1.height,
            alt: 'Insulated bottle with white base and black snap lid.',
          },
          quantity: 1,
          size: 'M',
          color: 'Black',
        },
      ],
    },
  ]
}

export async function getCountries() {
  return [
    {
      name: 'Canada',
      code: 'CA',
      flagUrl: '/flags/ca.svg',
      regions: [
        'Alberta',
        'British Columbia',
        'Manitoba',
        'New Brunswick',
        'Newfoundland and Labrador',
        'Northwest Territories',
        'Nova Scotia',
        'Nunavut',
        'Ontario',
        'Prince Edward Island',
        'Quebec',
        'Saskatchewan',
        'Yukon',
      ],
    },
    {
      name: 'Mexico',
      code: 'MX',
      flagUrl: '/flags/mx.svg',
      regions: [
        'Aguascalientes',
        'Baja California',
        'Baja California Sur',
        'Campeche',
        'Chiapas',
        'Chihuahua',
        'Ciudad de Mexico',
        'Coahuila',
        'Colima',
        'Durango',
        'Guanajuato',
        'Guerrero',
        'Hidalgo',
        'Jalisco',
        'Mexico State',
        'Michoacán',
        'Morelos',
        'Nayarit',
        'Nuevo León',
        'Oaxaca',
        'Puebla',
        'Querétaro',
        'Quintana Roo',
        'San Luis Potosí',
        'Sinaloa',
        'Sonora',
        'Tabasco',
        'Tamaulipas',
        'Tlaxcala',
        'Veracruz',
        'Yucatán',
        'Zacatecas',
      ],
    },
    {
      name: 'United States',
      code: 'US',
      flagUrl: '/flags/us.svg',
      regions: [
        'Alabama',
        'Alaska',
        'American Samoa',
        'Arizona',
        'Arkansas',
        'California',
        'Colorado',
        'Connecticut',
        'Delaware',
        'Washington DC',
        'Micronesia',
        'Florida',
        'Georgia',
        'Guam',
        'Hawaii',
        'Idaho',
        'Illinois',
        'Indiana',
        'Iowa',
        'Kansas',
        'Kentucky',
        'Louisiana',
        'Maine',
        'Marshall Islands',
        'Maryland',
        'Massachusetts',
        'Michigan',
        'Minnesota',
        'Mississippi',
        'Missouri',
        'Montana',
        'Nebraska',
        'Nevada',
        'New Hampshire',
        'New Jersey',
        'New Mexico',
        'New York',
        'North Carolina',
        'North Dakota',
        'Northern Mariana Islands',
        'Ohio',
        'Oklahoma',
        'Oregon',
        'Palau',
        'Pennsylvania',
        'Puerto Rico',
        'Rhode Island',
        'South Carolina',
        'South Dakota',
        'Tennessee',
        'Texas',
        'Utah',
        'Vermont',
        'U.S. Virgin Islands',
        'Virginia',
        'Washington',
        'West Virginia',
        'Wisconsin',
        'Wyoming',
        'Armed Forces Americas',
        'Armed Forces Europe',
        'Armed Forces Pacific',
      ],
    },
  ]
}

export async function getShopData() {
  return {
    description: 'An example shop with GraphQL.',
    name: 'graphql',
    termsOfService: {
      url: 'https://checkout.shopify.com/13120893/policies/30401347.html?locale=en',
      title: 'Terms of Service',
      id: 'gid://shopify/ShopPolicy/30401347',
      handle: 'terms-of-service',
      body: 'lorem ispsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nisl nunc egestas nunc, vitae facilisis nunc nisi euismod nisi.',
    },
    subscriptionPolicy: {
      body: '<p>Subscription Policy</p>',
      handle: 'refund-policy',
      id: 'gid://shopify/ShopPolicy/30401219',
      title: 'Refund Policy',
      url: 'https://checkout.shopify.com/13120893/policies/30401219.html?locale=en',
    },
    shippingPolicy: {
      body: '<p>Shipping Policy</p>',
      handle: 'shipping-policy',
      id: 'gid://shopify/ShopPolicy/23745298488',
      title: 'Shipping Policy',
      url: 'https://checkout.shopify.com/13120893/policies/23745298488.html?locale=en',
    },
    refundPolicy: {
      body: '<p>refundPolicy</p>',
      handle: 'refund-policy',
      id: 'gid://shopify/ShopPolicy/30401219',
      title: 'Refund Policy',
      url: 'https://checkout.shopify.com/13120893/policies/30401219.html?locale=en',
    },
    privacyPolicy: {
      body: '<p>privacyPolicy</p>',
      handle: 'privacy-policy',
      id: 'gid://shopify/ShopPolicy/30401283',
      title: 'Privacy Policy',
      url: 'https://checkout.shopify.com/13120893/policies/30401283.html?locale=en',
    },
    primaryDomain: {
      url: 'https://graphql.myshopify.com',
    },
  }
}

export async function getProductReviews(handle: string): Promise<TReview[]> {
  return []
}

export async function getBlogPosts() {
  return [
    {
      id: '1',
      title: "Beginner's Guide to Crochet: Basic Stitches Explained",
      handle: 'graduation-dresses-style-guide',
      excerpt:
        'Discover the wonderful world of crochet! We break down the absolute essential stitches, from the magic ring to single and double crochets, to get you crafting with confidence.',
      featuredImage: {
        src: 'https://images.unsplash.com/photo-1608096299210-db7e38487075?auto=format&fit=crop&q=80&w=600',
        alt: "Beginner's Guide to Crochet: Basic Stitches Explained",
        width: 3637,
        height: 2432,
      },
      date: 'May 20, 2025',
      datetime: '2025-05-20',
      category: { title: 'Tutorials', href: '#' },
      timeToRead: '5 min read',
      author: {
        name: 'Clara Lovelace',
        avatar: {
          src: avatarImage1.src,
          alt: 'Clara Lovelace',
          width: avatarImage1.width,
          height: avatarImage1.height,
        },
        description:
          'Clara Lovelace is the founder of Thread & Love and has been crocheting cozy creations for over 15 years. She loves teaching and sharing stitches with beginners.',
      },
    },
    {
      id: '2',
      title: 'How to Care for Handmade Crochet Cardigans & Wearables',
      handle: 'how-to-wear-your-eid-pieces-all-year-long',
      excerpt:
        'Handmade wearables deserve special care. Learn how to wash, shape, and store your cozy cardigans so they stay beautiful and snuggly for years to come.',
      featuredImage: {
        src: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600',
        alt: 'How to Care for Handmade Crochet Cardigans & Wearables',
        width: 3637,
        height: 2432,
      },
      date: 'May 18, 2025',
      datetime: '2025-05-18',
      category: { title: 'Care Guides', href: '#' },
      timeToRead: '4 min read',
      author: {
        name: 'Erica Alexander',
        avatar: {
          src: avatarImage2.src,
          alt: 'Erica Alexander',
          width: avatarImage2.width,
          height: avatarImage2.height,
        },
        description:
          'Erica is our resident textile designer who believes in sustainable fashion and preserving the lifespan of hand-knitted and crocheted heirloom garments.',
      },
    },
    {
      id: '3',
      title: 'The Art of Amigurumi: Crafting Cuddly Companions',
      handle: 'the-must-have-hijabi-friendly-fabrics-for-2024',
      excerpt:
        'Step into the delightful universe of amigurumi. We share tips on achieving tight stitches, embroidering cute baby-safe features, and stuffed toy assembly secrets.',
      featuredImage: {
        src: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=600',
        alt: 'The Art of Amigurumi: Crafting Cuddly Companions',
        width: 3637,
        height: 2432,
      },
      date: 'May 15, 2025',
      datetime: '2025-05-15',
      category: { title: 'Amigurumi', href: '#' },
      timeToRead: '6 min read',
      author: {
        name: 'Wellie Edwards',
        avatar: {
          src: avatarImage3.src,
          alt: 'Wellie Edwards',
          width: avatarImage3.width,
          height: avatarImage3.height,
        },
        description:
          'Wellie is a master toy maker and specializes in designing cute character patterns that bring whimsical stories to life in yarn form.',
      },
    },
    {
      id: '4',
      title: 'Eco-Friendly Yarns: Choosing Sustainable Materials',
      handle: 'the-must-have-hijabi-friendly-fabrics-for',
      excerpt:
        'What goes into your yarn? We explore organic cotton, natural bamboo fibers, and cruelty-free merino wool to help you make mindful choices for your craft.',
      featuredImage: {
        src: 'https://images.unsplash.com/photo-1591522810850-58128c5fb0a0?auto=format&fit=crop&q=80&w=600',
        alt: 'Eco-Friendly Yarns: Choosing Sustainable Materials',
        width: 3637,
        height: 2432,
      },
      date: 'May 10, 2025',
      datetime: '2025-05-10',
      category: { title: 'Sustainability', href: '#' },
      timeToRead: '3 min read',
      author: {
        name: 'Alex Klein',
        avatar: {
          src: avatarImage4.src,
          alt: 'Alex Klein',
          width: avatarImage4.width,
          height: avatarImage4.height,
        },
        description:
          'Alex is a fiber researcher who advises our workshop on picking organic, ethical, and local suppliers to maintain our minimal eco footprint.',
      },
    },
    {
      id: '5',
      title: 'Decorating Your Home with Warm, Handcrafted Textures',
      handle: 'boost-your-conversion-rate',
      excerpt:
        'Transform your living spaces into cozy sanctuaries. Discover how simple touches like crochet planters, textured pillows, and blankets add premium warmth.',
      featuredImage: {
        src: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600',
        alt: 'Decorating Your Home with Warm, Handcrafted Textures',
        width: 3637,
        height: 2432,
      },
      date: 'May 05, 2025',
      datetime: '2025-05-05',
      category: { title: 'Home Decor', href: '#' },
      timeToRead: '4 min read',
      author: {
        name: 'Eden Birch',
        avatar: {
          src: avatarImage1.src,
          alt: 'Eden Birch',
          width: avatarImage1.width,
          height: avatarImage1.height,
        },
        description:
          'Eden is an interior stylist who specializes in incorporating hand-woven elements into modern minimalist design layouts.',
      },
    },
    {
      id: '6',
      title: 'Autumn Color Palettes: Yarn Inspiration',
      handle: 'graduation-dresses-style-guide-2',
      excerpt:
        'Take inspiration from changing autumn leaves. We assemble our favorite cozy color combinations—rust terracottas, warm ambers, and sage greens.',
      featuredImage: {
        src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600',
        alt: 'Autumn Color Palettes: Yarn Inspiration',
        width: 3773,
        height: 600,
      },
      date: 'Apr 28, 2025',
      datetime: '2025-04-28',
      category: { title: 'Inspiration', href: '#' },
      timeToRead: '3 min read',
      author: {
        name: 'Scott Edwards',
        avatar: {
          src: avatarImage2.src,
          alt: 'Scott Edwards',
          width: avatarImage2.width,
          height: avatarImage2.height,
        },
        description:
          'Scott is a creative color coordinator who helps select seasonal collections and curate starter yarn kits for our boutique craft community.',
      },
    },
  ]
}
export async function getBlogPostsByHandle(handle: string) {
  // lower case the handle
  handle = handle.toLowerCase()

  const posts = await getBlogPosts()
  let post = posts.find((post) => post.handle === handle)

  if (!post) {
    // throw new Error(`Post with handle ${handle} not found.`)

    // for demo purposes, we can log a warning and return the first post
    console.warn(`Post with handle ${handle} not found. Returning the first post as a fallback.`)
    post = posts[0]
  }

  return {
    ...post,
    content: 'Lorem ipsum dolor ...',
    tags: ['fashion', 'style', 'trends'],
  }
}

export function getCart(id: string) {
  return {
    id: 'gid://shopify/Cart/1',
    note: 'This is a note',
    createdAt: '2025-01-06',
    totalQuantity: 4,
    cost: {
      subtotal: 199,
      shipping: 0,
      tax: 0,
      total: 199,
      discount: 0,
    },
    lines: [
      {
        id: '1',
        name: 'Basic Tee',
        handle: 'basic-tee',
        price: 199,
        color: 'Sienna',
        inStock: true,
        size: 'L',
        quantity: 1,
        image: {
          src: productImage1.src,
          width: productImage1.width,
          height: productImage1.height,
          alt: 'Front of Basic Tee in black.',
        },
      },
      {
        id: '2',
        name: 'Basic Coahuila',
        handle: 'basic-coahuila',
        price: 99,
        color: 'Black',
        inStock: false,
        leadTime: '3–4 weeks',
        size: 'XL',
        quantity: 2,
        image: {
          src: productImage2.src,
          width: productImage2.width,
          height: productImage2.height,
          alt: 'Front of Basic Coahuila in black.',
        },
      },
      {
        id: '3',
        name: 'Nomad Tumbler',
        handle: 'nomad-tumbler',
        price: 119,
        color: 'White',
        inStock: true,
        size: 'M',
        quantity: 1,
        image: {
          src: productImage3.src,
          width: productImage3.width,
          height: productImage3.height,
          alt: 'Front of Nomad Tumbler in white.',
        },
      },
    ],
  }
}

// ------------------------  DATA ------------------------
export async function getCollections() {
  return [
    // default collections 1 - 7 (mapped to support routes & layout)
    {
      id: 'gid://1',
      title: 'Cozy Wearables',
      handle: 'jackets',
      description: 'Lovingly hand-stitched chunky cardigans, pullovers, and seasonal sweaters to keep you warm.',
      sortDescription: 'Chunky cardigans & sweaters',
      color: 'bg-[#FAF6F0]',
      count: 24,
      image: {
        src: productImage1.src,
        width: productImage1.width,
        height: productImage1.height,
        alt: 'Cozy Wearables',
      },
    },
    {
      id: 'gid://2',
      title: 'Amigurumi Toys',
      handle: 't-shirts',
      sortDescription: 'Sweet cuddly companions',
      description: 'Adorably handcrafted plush animals, toys, and custom creations crocheted with 100% organic cotton thread.',
      image: {
        src: '/Crochet/IMG_20260605_154015_438.jpg',
        width: 1000,
        height: 1000,
        alt: 'Amigurumi Toys',
      },
      color: 'bg-[#FAF6F0]',
      count: 42,
    },
    {
      id: 'gid://3',
      title: 'Bags & Purses',
      handle: 'jeans',
      sortDescription: 'Artisanal bags & purses',
      description: 'Chic granny square shoulder bags, crossbody purses, and durable textured tote bags for carrying your essentials.',
      image: {
        src: '/Crochet/IMG_20260605_154047_393.jpg',
        width: 1000,
        height: 1000,
        alt: 'Bags & Purses',
      },
      color: 'bg-[#FAF6F0]',
      count: 18,
    },
    {
      id: 'gid://4',
      title: 'Home & Living',
      handle: 'coats',
      sortDescription: 'Cozy textured home goods',
      description: 'Beautifully textured coasters, soft plant hangers, woven table runner pieces, and handcrafted blankets to warm your home.',
      image: {
        src: '/Crochet/IMG_20260605_154025_177.jpg',
        width: 1000,
        height: 1000,
        alt: 'Home & Living',
      },
      color: 'bg-[#FAF6F0]',
      count: 36,
    },
    {
      id: 'gid://5',
      title: 'Artisanal Kits',
      handle: 'shoes',
      sortDescription: 'Complete DIY starter kits',
      description: 'Premium curated crochet starter kits filled with gorgeous yarn, bamboo hooks, needles, and step-by-step printed patterns.',
      image: {
        src: productImage8.src,
        width: productImage8.width,
        height: productImage8.height,
        alt: 'Artisanal Kits',
      },
      color: 'bg-[#FAF6F0]',
      count: 12,
    },
    {
      id: 'gid://6',
      title: 'Soft Accessories',
      handle: 'accessories',
      sortDescription: 'Scarves, beanies & hairbands',
      description: 'Charming beanies, floral hairbands, and warm infinity scarves crocheted in soft pastel palettes.',
      image: {
        src: '/Crochet/IMG_20260605_154008_671.jpg',
        width: 1000,
        height: 1000,
        alt: 'Soft Accessories',
      },
      color: 'bg-[#FAF6F0]',
      count: 29,
    },
    {
      id: 'gid://7',
      title: 'Bags & Totes',
      handle: 'bags',
      sortDescription: 'Intricate granny-squares',
      description: 'Add a touch of vintage artisanal charm with our beautifully detailed sunburst granny-square tote bags.',
      image: {
        src: '/Crochet/IMG_20260605_154246_117.jpg',
        width: 1000,
        height: 1000,
        alt: 'Bags & Totes',
      },
      color: 'bg-[#FAF6F0]',
      count: 15,
    },
  
    //  Featured collections 8 - 11
    {
      id: 'gid://8',
      title: 'Explore new creations',
      handle: 'explore-new-arrivals',
      sortDescription: 'Explore the latest <br /> crafted beauties',
      description: 'Our latest handmade drops. Each piece is unique, lovingly crocheted by hand, and freshly listed for our collection.',
      color: 'bg-orange-50',
      count: 18,
      image: {
        src: '/Crochet/IMG_20260605_154009_634.jpg',
        width: 1000,
        height: 1000,
        alt: 'Explore new creations',
      },
    },
    {
      id: 'gid://9',
      title: 'Cozy Autumn Sale',
      handle: 'sale-collection',
      sortDescription: 'Up to <br /> 40% off patterns',
      description: 'Special seasonal discounts on selected cozy home goods and digital crochet pattern downloads.',
      color: 'bg-green-50',
      count: 25,
      image: {
        src: '/Crochet/IMG_20260605_154013_495.jpg',
        width: 1000,
        height: 1000,
        alt: 'Cozy Autumn Sale',
      },
    },
    {
      id: 'gid://10',
      title: 'DIY patterns pack',
      handle: 'sale-collection-2',
      sortDescription: 'Save big on <br /> bundle pattern downloads',
      description: 'Perfect bundle deals containing multiple step-by-step amigurumi and wearable patterns for you to craft at home.',
      color: 'bg-blue-50',
      count: 8,
      image: {
        src: '/Crochet/IMG_20260605_154006_048.jpg',
        width: 1000,
        height: 1000,
        alt: 'DIY patterns pack',
      },
    },
    {
      id: 'gid://11',
      title: 'Thread & Love Gift Cards',
      handle: 'digital-gift-cards',
      sortDescription: 'Give the gift <br /> of handcrafted choice',
      description: 'Can’t decide which plush friend or cardigan they’ll love most? Share the joy of handmade with our beautiful digital gift cards.',
      color: 'bg-red-50',
      count: 4,
      image: {
        src: '/Crochet/IMG_20260605_154046_274.jpg',
        width: 1000,
        height: 1000,
        alt: 'Thread & Love Gift Cards',
      },
    },
  
    // Brands collections 12 - 15 (mapped for department sliders)
    {
      id: 'gid://12',
      title: 'Beginner DIY Kits',
      handle: 'sport-kits',
      sortDescription: 'All-in-one kit',
      description: 'Contains premium yarns, ergonomic hooks, needles, and a fully illustrated tutorial pamphlet.',
      color: 'bg-neutral-100',
      count: 6,
      image: {
        src: productImage8.src,
        width: productImage8.width,
        height: productImage8.height,
        alt: 'Beginner DIY Kits',
      },
    },
    {
      id: 'gid://13',
      title: 'Plush Amigurumi',
      handle: 'beauty-products',
      color: 'bg-neutral-100',
      sortDescription: 'Sweet nursery toys',
      description: 'Lovingly stitched animal plushies with baby-safe embroidered eyes and ultra-soft organic stuffing.',
      count: 22,
      image: {
        src: '/Crochet/IMG_20260605_154026_131.jpg',
        width: 1000,
        height: 1000,
        alt: 'Plush Amigurumi',
      },
    },
    {
      id: 'gid://14',
      title: 'Soft Wearables',
      handle: 'travel-kits',
      sortDescription: 'Boutique apparel',
      description: 'Chunky cardigans, slouchy cozy beanies, and custom knitted cotton apparel built to last.',
      color: 'bg-neutral-100',
      count: 14,
      image: {
        src: productImage1.src,
        width: productImage1.width,
        height: productImage1.height,
        alt: 'Soft Wearables',
      },
    },
    {
      id: 'gid://15',
      title: 'Home Decoration',
      handle: 'pets-food',
      sortDescription: 'Textured living decor',
      description: 'Bring warm, hand-loomed charm to your kitchen and living rooms with our floral coasters and baskets.',
      color: 'bg-neutral-100',
      count: 16,
      image: {
        src: '/Crochet/IMG_20260605_154023_102.jpg',
        width: 1000,
        height: 1000,
        alt: 'Home Decoration',
      },
    },
  ]
}

export async function getGroupCollections() {
  const allCollections = await getCollections()
  const collections = allCollections.slice(0, 6)
  return [
    {
      id: '1',
      title: 'Women',
      handle: 'women',
      description: 'lorem ipsum',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16C15.866 16 19 12.866 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.866 8.13401 16 12 16Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 16V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 19H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`,
      collections,
    },
    {
      id: '2',
      title: 'Man',
      handle: 'man',
      description: 'lorem ipsum',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.25 21.5C14.5302 21.5 18 18.0302 18 13.75C18 9.46979 14.5302 6 10.25 6C5.96979 6 2.5 9.46979 2.5 13.75C2.5 18.0302 5.96979 21.5 10.25 21.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21.5 2.5L16 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 2.5H21.5V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`,
      collections: shuffleArray(collections),
    },
    {
      id: '3',
      title: 'Accessories',
      handle: 'accessories',
      description: 'lorem ipsum',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.08 8.58003V15.42C21.08 16.54 20.48 17.58 19.51 18.15L13.57 21.58C12.6 22.14 11.4 22.14 10.42 21.58L4.48003 18.15C3.51003 17.59 2.91003 16.55 2.91003 15.42V8.58003C2.91003 7.46003 3.51003 6.41999 4.48003 5.84999L10.42 2.42C11.39 1.86 12.59 1.86 13.57 2.42L19.51 5.84999C20.48 6.41999 21.08 7.45003 21.08 8.58003Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 11.0001C13.2869 11.0001 14.33 9.95687 14.33 8.67004C14.33 7.38322 13.2869 6.34009 12 6.34009C10.7132 6.34009 9.67004 7.38322 9.67004 8.67004C9.67004 9.95687 10.7132 11.0001 12 11.0001Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 16.6601C16 14.8601 14.21 13.4001 12 13.4001C9.79 13.4001 8 14.8601 8 16.6601" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`,
      collections: shuffleArray(collections),
    },
    {
      id: '4',
      title: 'Footwear',
      handle: 'footwear',
      description: 'lorem ipsum',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.1801 18C19.5801 18 20.1801 16.65 20.1801 15V9C20.1801 7.35 19.5801 6 17.1801 6C14.7801 6 14.1801 7.35 14.1801 9V15C14.1801 16.65 14.7801 18 17.1801 18Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.81995 18C4.41995 18 3.81995 16.65 3.81995 15V9C3.81995 7.35 4.41995 6 6.81995 6C9.21995 6 9.81995 7.35 9.81995 9V15C9.81995 16.65 9.21995 18 6.81995 18Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.81995 12H14.1799" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22.5 14.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M1.5 14.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`,
      collections: shuffleArray(collections),
    },
    {
      id: '5',
      title: 'Jewelry',
      handle: 'jewelry',
      description: 'lorem ipsum',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.7 18.98H7.30002C6.88002 18.98 6.41002 18.65 6.27002 18.25L2.13002 6.66999C1.54002 5.00999 2.23002 4.49999 3.65002 5.51999L7.55002 8.30999C8.20002 8.75999 8.94002 8.52999 9.22002 7.79999L10.98 3.10999C11.54 1.60999 12.47 1.60999 13.03 3.10999L14.79 7.79999C15.07 8.52999 15.81 8.75999 16.45 8.30999L20.11 5.69999C21.67 4.57999 22.42 5.14999 21.78 6.95999L17.74 18.27C17.59 18.65 17.12 18.98 16.7 18.98Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 22H17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.5 14H14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`,
      collections: shuffleArray(collections),
    },
    {
      id: '6',
      title: 'Beauty',
      handle: 'beauty',
      description: 'lorem ipsum',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.7 18.98H7.30002C6.88002 18.98 6.41002 18.65 6.27002 18.25L2.13002 6.66999C1.54002 5.00999 2.23002 4.49999 3.65002 5.51999L7.55002 8.30999C8.20002 8.75999 8.94002 8.52999 9.22002 7.79999L10.98 3.10999C11.54 1.60999 12.47 1.60999 13.03 3.10999L14.79 7.79999C15.07 8.52999 15.81 8.75999 16.45 8.30999L20.11 5.69999C21.67 4.57999 22.42 5.14999 21.78 6.95999L17.74 18.27C17.59 18.65 17.12 18.98 16.7 18.98Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 22H17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.5 14H14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`,
      collections: shuffleArray(collections),
    },
  ]
}

export async function getCollectionByHandle(handle: string) {
  // lowercase handle
  handle = handle.toLowerCase()
  // const all products slug: /collections/all
  if (handle === 'all') {
    return {
      id: 'gid://all',
      title: 'All products',
      handle: 'all',
      description: 'Explore our entire collection of products, from clothing to accessories.',
      sortDescription: 'All products',
      color: 'bg-indigo-50',
      count: 77,
      image: {
        src: collectionImage1.src,
        width: collectionImage1.width,
        height: collectionImage1.height,
        alt: 'Explore new arrivals',
      },
    }
  }

  const allCollections = await getCollections()
  let collection = allCollections?.find((collection) => collection?.handle === handle)

  if (!collection) {
    //  throw new Error(`Collection with handle "${handle}" not found`)

    // for demo purposes, return a default collection
    collection = allCollections[0] // fallback to the first collection
  }

  return collection
}

export const LOCAL_CROCHET_PRODUCTS: TProductItem[] = [
  {
    id: 'crochet-drawstring-pouch',
    title: 'Handcrafted Crochet Drawstring Pouch',
    handle: 'crochet-drawstring-pouch',
    collectionHandles: ['jeans', 'bags'],
    createdAt: '2026-06-05T12:00:00Z',
    vendor: 'Thread & Love',
    price: 16,
    featuredImage: {
      src: '/Crochet/IMG_20260605_154246_117.jpg',
      width: 1000,
      height: 1000,
      alt: 'Handcrafted Crochet Drawstring Pouch Group',
      color: 'Cherry'
    },
    images: [
      {
        src: '/Crochet/IMG_20260605_154246_117.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handcrafted Crochet Drawstring Pouch Group',
        color: 'Cherry'
      },
      {
        src: '/Crochet/IMG_20260605_154007_485.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handcrafted Crochet Drawstring Pouch Cherry',
        color: 'Cherry'
      },
      {
        src: '/Crochet/IMG_20260605_154052_809.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handcrafted Crochet Drawstring Pouch Mushroom',
        color: 'Mushroom'
      },
      {
        src: '/Crochet/IMG_20260605_154053_875.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handcrafted Crochet Drawstring Pouch Flower',
        color: 'Flower'
      },
      {
        src: '/Crochet/IMG_20260605_154055_020.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handcrafted Crochet Drawstring Pouch Clover',
        color: 'Clover'
      },
      {
        src: '/Crochet/IMG_20260605_154056_038.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handcrafted Crochet Drawstring Pouch Fish',
        color: 'Fish'
      },
      {
        src: '/Crochet/IMG_20260605_154057_159.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handcrafted Crochet Drawstring Pouch Watermelon',
        color: 'Watermelon'
      },
      {
        src: '/Crochet/IMG_20260605_154058_219.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handcrafted Crochet Drawstring Pouch Evil Eye',
        color: 'Evil Eye'
      },
      {
        src: '/Crochet/IMG_20260605_154059_250.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handcrafted Crochet Drawstring Pouch Cupcake',
        color: 'Cupcake'
      }
    ],
    reviewNumber: 54,
    rating: 4.9,
    status: 'Popular Choice',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Cherry', swatch: { color: '#a3c1ad', image: '/Crochet/IMG_20260605_154007_485.jpg' } },
          { name: 'Mushroom', swatch: { color: '#d62828', image: '/Crochet/IMG_20260605_154052_809.jpg' } },
          { name: 'Flower', swatch: { color: '#fcbf49', image: '/Crochet/IMG_20260605_154053_875.jpg' } },
          { name: 'Clover', swatch: { color: '#2a9d8f', image: '/Crochet/IMG_20260605_154055_020.jpg' } },
          { name: 'Fish', swatch: { color: '#457b9d', image: '/Crochet/IMG_20260605_154056_038.jpg' } },
          { name: 'Watermelon', swatch: { color: '#e63946', image: '/Crochet/IMG_20260605_154057_159.jpg' } },
          { name: 'Evil Eye', swatch: { color: '#1d3557', image: '/Crochet/IMG_20260605_154058_219.jpg' } },
          { name: 'Cupcake', swatch: { color: '#ffb703', image: '/Crochet/IMG_20260605_154059_250.jpg' } }
        ]
      },
      {
        name: 'Size',
        optionValues: [{ name: 'Standard', swatch: null }]
      }
    ],
    selectedOptions: [
      { name: 'Color', value: 'Cherry' },
      { name: 'Size', value: 'Standard' }
    ],
    description: 'This delightfully cute, hand-woven drawstring pouch is crafted from 100% premium soft cotton thread. Each design features a charming 3D character accent, double-knotted drawstring pull chords, and a spacious internal compartment for tiny daily treasures.',
    features: [
      'Material: 100% Premium Organic Combed Cotton',
      'Intricate, durable hand-lock crochet stitching',
      'Secure, adjustable drawstring closure with double knots',
      'Perfect for coins, keys, cosmetics, or lip balm'
    ],
    careInstruction: 'Hand wash gently in cold water with mild detergent. Do not squeeze, twist, or wring. Lay flat on dry towel to air dry. Do not machine wash.',
    shippingAndReturn: 'We offer free shipping on all orders over $50. Since each item is made to order by hand, please allow 3-5 days for crafting. Returns are welcome within 30 days.'
  },
  {
    id: 'crochet-chunky-shoulder-bag',
    title: 'Chunky Crochet Shoulder Bag',
    handle: 'crochet-chunky-shoulder-bag',
    collectionHandles: ['jeans', 'bags'],
    createdAt: '2026-06-05T12:00:00Z',
    vendor: 'Thread & Love',
    price: 38,
    featuredImage: {
      src: '/Crochet/IMG_20260605_154047_393.jpg',
      width: 1000,
      height: 1000,
      alt: 'Chunky Crochet Shoulder Bag Lavender',
      color: 'Lavender'
    },
    images: [
      {
        src: '/Crochet/IMG_20260605_154047_393.jpg',
        width: 1000,
        height: 1000,
        alt: 'Chunky Crochet Shoulder Bag Lavender',
        color: 'Lavender'
      }
    ],
    reviewNumber: 32,
    rating: 4.8,
    status: 'New Arrival',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Lavender', swatch: { color: '#c8b6e2', image: '/Crochet/IMG_20260605_154047_393.jpg' } }
        ]
      },
      {
        name: 'Size',
        optionValues: [{ name: 'Standard', swatch: null }]
      }
    ],
    selectedOptions: [
      { name: 'Color', value: 'Lavender' },
      { name: 'Size', value: 'Standard' }
    ],
    description: 'Make a bold statement with our Chunky Crochet Shoulder Bag. Intricately hand-looped from thick, cushioned cotton tube yarn, it features a unique marshmallow-textured bubble stitch weave and two secure shoulder straps. Holds your daily essentials in premium, fluffy comfort.',
    features: [
      'Crafted from thick, cushioned premium cotton tube yarn',
      'Distinctive chunky marshmallow-style bubble stitch weave',
      'Reinforced double shoulder straps for durability',
      'Generous interior space for phone, wallet, and keys'
    ],
    careInstruction: 'Spot clean only with cold water and mild soap. Lay flat to dry out of direct sunlight. Do not wring or machine dry.',
    shippingAndReturn: 'Free shipping on orders over $50. Lovingly hand-knitted and shipped within 3-4 business days. Returns accepted within 30 days.'
  },
  {
    id: 'crochet-daisy-coaster-set',
    title: 'Handmade Daisy Flower Coaster Set',
    handle: 'crochet-daisy-coaster-set',
    collectionHandles: ['coats'],
    createdAt: '2026-06-05T12:00:00Z',
    vendor: 'Thread & Love',
    price: 18,
    featuredImage: {
      src: '/Crochet/IMG_20260605_154025_177.jpg',
      width: 1000,
      height: 1000,
      alt: 'Handmade Daisy Flower Coasters Quartet',
      color: 'Quartet Meadow'
    },
    images: [
      {
        src: '/Crochet/IMG_20260605_154022_135.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handmade Daisy Flower Coasters Single',
        color: 'Single White'
      },
      {
        src: '/Crochet/IMG_20260605_154023_102.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handmade Daisy Flower Coasters Duo',
        color: 'Duo Blossom'
      },
      {
        src: '/Crochet/IMG_20260605_154024_068.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handmade Daisy Flower Coasters Trio',
        color: 'Trio Pastel'
      },
      {
        src: '/Crochet/IMG_20260605_154025_177.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handmade Daisy Flower Coasters Quartet',
        color: 'Quartet Meadow'
      }
    ],
    reviewNumber: 41,
    rating: 4.9,
    status: 'Best Seller',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Single White', swatch: { color: '#faf8f5', image: '/Crochet/IMG_20260605_154022_135.jpg' } },
          { name: 'Duo Blossom', swatch: { color: '#ffccd5', image: '/Crochet/IMG_20260605_154023_102.jpg' } },
          { name: 'Trio Pastel', swatch: { color: '#dec0f1', image: '/Crochet/IMG_20260605_154024_068.jpg' } },
          { name: 'Quartet Meadow', swatch: { color: '#c5e8d1', image: '/Crochet/IMG_20260605_154025_177.jpg' } }
        ]
      },
      {
        name: 'Size',
        optionValues: [{ name: 'Standard', swatch: null }]
      }
    ],
    selectedOptions: [
      { name: 'Color', value: 'Quartet Meadow' },
      { name: 'Size', value: 'Standard' }
    ],
    description: 'Brighten your morning coffee routine with our Handmade Daisy Flower Coasters. Meticulously crocheted into cute, flat sunburst flower designs, they protect your table surfaces from heat and spills while adding a gorgeous touch of cottagecore aesthetic. Available in single units or bundles of coordinating pastel shades.',
    features: [
      'Protective flat-laying double-threaded crochet build',
      '100% thick organic cotton yarn for maximum absorption',
      'Cute cottagecore daisy shape with yellow center detailing',
      'Available in coordinating, stacked pastel sets'
    ],
    careInstruction: 'Hand wash cold or machine wash on ultra-gentle cycle in a mesh laundry bag. Lay flat to dry.',
    shippingAndReturn: 'Free shipping on orders over $50. Shipped within 2 business days. Returns accepted within 30 days.'
  },
  {
    id: 'crochet-amigurumi-keychain',
    title: 'Whimsical Amigurumi Keychains',
    handle: 'crochet-amigurumi-keychain',
    collectionHandles: ['t-shirts', 'accessories'],
    createdAt: '2026-06-05T12:00:00Z',
    vendor: 'Thread & Love',
    price: 14,
    featuredImage: {
      src: '/Crochet/IMG_20260605_154015_438.jpg',
      width: 1000,
      height: 1000,
      alt: 'Whimsical Amigurumi Keychains Cuddly Bear',
      color: 'Cuddly Bear'
    },
    images: [
      {
        src: '/Crochet/IMG_20260605_154015_438.jpg',
        width: 1000,
        height: 1000,
        alt: 'Whimsical Amigurumi Keychains Cuddly Bear',
        color: 'Cuddly Bear'
      },
      {
        src: '/Crochet/IMG_20260605_154020_237.jpg',
        width: 1000,
        height: 1000,
        alt: 'Whimsical Amigurumi Keychains Web-Slinger',
        color: 'Web-Slinger'
      },
      {
        src: '/Crochet/IMG_20260605_154026_131.jpg',
        width: 1000,
        height: 1000,
        alt: 'Whimsical Amigurumi Keychains Baby Piggy',
        color: 'Baby Piggy'
      },
      {
        src: '/Crochet/IMG_20260605_154029_904.jpg',
        width: 1000,
        height: 1000,
        alt: 'Whimsical Amigurumi Keychains Smiley Daisy',
        color: 'Smiley Daisy'
      },
      {
        src: '/Crochet/IMG_20260605_154030_919.jpg',
        width: 1000,
        height: 1000,
        alt: 'Whimsical Amigurumi Keychains Initial Heart',
        color: 'Initial Heart'
      },
      {
        src: '/Crochet/IMG_20260605_154048_506.jpg',
        width: 1000,
        height: 1000,
        alt: 'Whimsical Amigurumi Keychains Peacock Feather',
        color: 'Peacock Feather'
      }
    ],
    reviewNumber: 68,
    rating: 5.0,
    status: 'Must Have',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Cuddly Bear', swatch: { color: '#a67c52', image: '/Crochet/IMG_20260605_154015_438.jpg' } },
          { name: 'Web-Slinger', swatch: { color: '#d62828', image: '/Crochet/IMG_20260605_154020_237.jpg' } },
          { name: 'Baby Piggy', swatch: { color: '#ffccd5', image: '/Crochet/IMG_20260605_154026_131.jpg' } },
          { name: 'Smiley Daisy', swatch: { color: '#f4c430', image: '/Crochet/IMG_20260605_154029_904.jpg' } },
          { name: 'Initial Heart', swatch: { color: '#b7094c', image: '/Crochet/IMG_20260605_154030_919.jpg' } },
          { name: 'Peacock Feather', swatch: { color: '#0077b6', image: '/Crochet/IMG_20260605_154048_506.jpg' } }
        ]
      },
      {
        name: 'Size',
        optionValues: [{ name: 'Standard', swatch: null }]
      }
    ],
    selectedOptions: [
      { name: 'Color', value: 'Cuddly Bear' },
      { name: 'Size', value: 'Standard' }
    ],
    description: 'Add a splash of cozy charm to your bag or keys. Our Whimsical Amigurumi Keychains are hand-stitched with tight stitches to ensure durability, stuffed with organic fluff, and fitted with robust metal key rings. Choose from cute animal characters, miniature flowers, or customized initial pieces.',
    features: [
      '100% organic combed cotton yarn with baby-safe stuffing',
      'Equipped with durable, polished metal keyrings',
      'Ultra-tight stitch work prevents loose strings',
      'Available in highly detailed custom shapes'
    ],
    careInstruction: 'Hand wash gently or spot clean with a damp cloth. Lay flat to dry.',
    shippingAndReturn: 'Free shipping on orders over $50. Handmade and dispatched within 2-3 business days. Returns accepted within 30 days.'
  },
  {
    id: 'crochet-evil-eye-charm',
    title: 'Protective Evil Eye Hanging Charm',
    handle: 'crochet-evil-eye-charm',
    collectionHandles: ['coats', 'accessories'],
    createdAt: '2026-06-05T12:00:00Z',
    vendor: 'Thread & Love',
    price: 15,
    featuredImage: {
      src: '/Crochet/IMG_20260605_154051_384.jpg',
      width: 1000,
      height: 1000,
      alt: 'Protective Evil Eye Hanging Charm Tasseled Medallion',
      color: 'Tasseled Medallion'
    },
    images: [
      {
        src: '/Crochet/IMG_20260605_154016_391.jpg',
        width: 1000,
        height: 1000,
        alt: 'Protective Evil Eye Hanging Charm Classic Flat',
        color: 'Classic Flat'
      },
      {
        src: '/Crochet/IMG_20260605_154027_953.jpg',
        width: 1000,
        height: 1000,
        alt: 'Protective Evil Eye Hanging Charm Scalloped Border',
        color: 'Scalloped Border'
      },
      {
        src: '/Crochet/IMG_20260605_154051_384.jpg',
        width: 1000,
        height: 1000,
        alt: 'Protective Evil Eye Hanging Charm Tasseled Medallion',
        color: 'Tasseled Medallion'
      }
    ],
    reviewNumber: 27,
    rating: 4.8,
    status: 'Handmade Charm',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Classic Flat', swatch: { color: '#03045e', image: '/Crochet/IMG_20260605_154016_391.jpg' } },
          { name: 'Scalloped Border', swatch: { color: '#00b4d8', image: '/Crochet/IMG_20260605_154027_953.jpg' } },
          { name: 'Tasseled Medallion', swatch: { color: '#0077b6', image: '/Crochet/IMG_20260605_154051_384.jpg' } }
        ]
      },
      {
        name: 'Size',
        optionValues: [{ name: 'Standard', swatch: null }]
      }
    ],
    selectedOptions: [
      { name: 'Color', value: 'Tasseled Medallion' },
      { name: 'Size', value: 'Standard' }
    ],
    description: 'Invite protection and style into your home or car. Handcrafted with traditional concentric rings of deep indigo, light blue, and crisp white, these Evil Eye charms feature gorgeous tassels and braided cords. Ideal for hanging on rearview mirrors, door knobs, or walls.',
    features: [
      'Concentric protective rings crocheted with bright, vivid yarn',
      'Equipped with a sturdy braided loop hanger',
      'Beautiful textured tassels or scalloped margins',
      'Perfect size for rearview mirrors or home accent spaces'
    ],
    careInstruction: 'Dust lightly with a soft brush. Hand wash cold if needed. Do not wring or scrub.',
    shippingAndReturn: 'Free shipping on orders over $50. Dispatched within 24-48 hours. Returns allowed within 30 days.'
  },
  {
    id: 'crochet-greeting-card',
    title: 'Handmade Greeting Card & Pocket Hug',
    handle: 'crochet-greeting-card',
    collectionHandles: ['accessories', 'coats'],
    createdAt: '2026-06-05T12:00:00Z',
    vendor: 'Thread & Love',
    price: 8,
    featuredImage: {
      src: '/Crochet/IMG_20260605_154006_048.jpg',
      width: 1000,
      height: 1000,
      alt: 'Handmade Greeting Card Little Pocket Hug',
      color: 'Little Pocket Hug'
    },
    images: [
      {
        src: '/Crochet/IMG_20260605_154006_048.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handmade Greeting Card Little Pocket Hug',
        color: 'Little Pocket Hug'
      },
      {
        src: '/Crochet/IMG_20260605_154035_122.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handmade Greeting Card Mom Special',
        color: 'Mom Special'
      },
      {
        src: '/Crochet/IMG_20260605_154036_581.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handmade Greeting Card It Was Always You',
        color: 'It Was Always You'
      },
      {
        src: '/Crochet/IMG_20260605_154037_830.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handmade Greeting Card Happy Birthday',
        color: 'Happy Birthday'
      },
      {
        src: '/Crochet/IMG_20260605_154043_995.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handmade Greeting Card Just For You',
        color: 'Just For You'
      },
      {
        src: '/Crochet/IMG_20260605_154045_116.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handmade Greeting Card Warmest Hugs',
        color: 'Warmest Hugs'
      },
      {
        src: '/Crochet/IMG_20260605_154046_274.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handmade Greeting Card Keepsake Card',
        color: 'Keepsake Card'
      }
    ],
    reviewNumber: 83,
    rating: 4.9,
    status: 'Cute Gift',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Little Pocket Hug', swatch: { color: '#e5989b', image: '/Crochet/IMG_20260605_154006_048.jpg' } },
          { name: 'Mom Special', swatch: { color: '#f4a460', image: '/Crochet/IMG_20260605_154035_122.jpg' } },
          { name: 'It Was Always You', swatch: { color: '#9e2a2b', image: '/Crochet/IMG_20260605_154036_581.jpg' } },
          { name: 'Happy Birthday', swatch: { color: '#f4c430', image: '/Crochet/IMG_20260605_154037_830.jpg' } },
          { name: 'Just For You', swatch: { color: '#ebd9be', image: '/Crochet/IMG_20260605_154043_995.jpg' } },
          { name: 'Warmest Hugs', swatch: { color: '#8ba88f', image: '/Crochet/IMG_20260605_154045_116.jpg' } },
          { name: 'Keepsake Card', swatch: { color: '#faeee2', image: '/Crochet/IMG_20260605_154046_274.jpg' } }
        ]
      },
      {
        name: 'Size',
        optionValues: [{ name: 'Standard', swatch: null }]
      }
    ],
    selectedOptions: [
      { name: 'Color', value: 'Little Pocket Hug' },
      { name: 'Size', value: 'Standard' }
    ],
    description: 'Send love with our Handmade Greeting Cards. Each premium heavy-cardstock card features a sweet, printed motivational quote and holds an adorable hand-crocheted pocket hug keepsake (a heart, a smile, or a flower) that can be removed and carried in a pocket or wallet as a constant comfort.',
    features: [
      'Heavyweight kraft/white cardstock card with crisp printing',
      'Removable, hand-knitted mini pocket hug token included',
      'Includes premium envelopes for mailing',
      'Perfect for mother\'s day, birthdays, thank yous, or sympathy'
    ],
    careInstruction: 'Keep card dry. The pocket hug token can be hand-washed in cold water if needed.',
    shippingAndReturn: 'Shipped within 24 hours. Regular lettermail available. Returns accepted on unused cards within 30 days.'
  },
  {
    id: 'crochet-hair-accessory-set',
    title: 'Aura Crochet Hair Accessory Set',
    handle: 'crochet-hair-accessory-set',
    collectionHandles: ['accessories'],
    createdAt: '2026-06-05T12:00:00Z',
    vendor: 'Thread & Love',
    price: 12,
    featuredImage: {
      src: '/Crochet/IMG_20260605_154008_671.jpg',
      width: 1000,
      height: 1000,
      alt: 'Aura Crochet Hair Accessory Pretty Bows Clip',
      color: 'Pretty Bows Clip'
    },
    images: [
      {
        src: '/Crochet/IMG_20260605_154008_671.jpg',
        width: 1000,
        height: 1000,
        alt: 'Aura Crochet Hair Accessory Pretty Bows Clip',
        color: 'Pretty Bows Clip'
      },
      {
        src: '/Crochet/IMG_20260605_154017_348.jpg',
        width: 1000,
        height: 1000,
        alt: 'Aura Crochet Hair Accessory Floral Meadow Clip',
        color: 'Floral Meadow Clip'
      },
      {
        src: '/Crochet/IMG_20260605_154018_327.jpg',
        width: 1000,
        height: 1000,
        alt: 'Aura Crochet Hair Accessory Sweet Cherry Ties',
        color: 'Sweet Cherry Ties'
      },
      {
        src: '/Crochet/IMG_20260605_154042_767.jpg',
        width: 1000,
        height: 1000,
        alt: 'Aura Crochet Hair Accessory Mini Hearts Clip',
        color: 'Mini Hearts Clip'
      },
      {
        src: '/Crochet/IMG_20260605_154050_342.jpg',
        width: 1000,
        height: 1000,
        alt: 'Aura Crochet Hair Accessory Rainbow Pastel Clip',
        color: 'Rainbow Pastel Clip'
      }
    ],
    reviewNumber: 19,
    rating: 4.7,
    status: 'Cute Accessory',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Pretty Bows Clip', swatch: { color: '#ffcad4', image: '/Crochet/IMG_20260605_154008_671.jpg' } },
          { name: 'Floral Meadow Clip', swatch: { color: '#faeee2', image: '/Crochet/IMG_20260605_154017_348.jpg' } },
          { name: 'Sweet Cherry Ties', swatch: { color: '#d00000', image: '/Crochet/IMG_20260605_154018_327.jpg' } },
          { name: 'Mini Hearts Clip', swatch: { color: '#e5989b', image: '/Crochet/IMG_20260605_154042_767.jpg' } },
          { name: 'Rainbow Pastel Clip', swatch: { color: '#dec0f1', image: '/Crochet/IMG_20260605_154050_342.jpg' } }
        ]
      },
      {
        name: 'Size',
        optionValues: [{ name: 'Standard', swatch: null }]
      }
    ],
    selectedOptions: [
      { name: 'Color', value: 'Pretty Bows Clip' },
      { name: 'Size', value: 'Standard' }
    ],
    description: 'Charming hair accessories crocheted in soft cotton threads. Fitted with secure non-slip metal snap clips or strong elastic ties, they add a sweet, handcrafted cottagecore touch to any hairstyle. Choose from bows, flowers, cherries, hearts, or rainbows.',
    features: [
      'Mounted on premium non-slip metal snap clips or soft elastic bands',
      'Hand-woven details with no glue overflow',
      'Cute pastel styles suitable for all ages',
      'Lightweight and comfortable for all-day wear'
    ],
    careInstruction: 'Spot clean with a damp cloth. Do not soak metal clips to prevent rust.',
    shippingAndReturn: 'Dispatched within 24 hours. Free shipping on orders over $50. Returns accepted within 30 days.'
  },
  {
    id: 'crochet-specialty-holders',
    title: 'Handcrafted Crochet Specialty Holders',
    handle: 'crochet-specialty-holders',
    collectionHandles: ['accessories'],
    createdAt: '2026-06-05T12:00:00Z',
    vendor: 'Thread & Love',
    price: 10,
    featuredImage: {
      src: '/Crochet/IMG_20260605_154039_796.jpg',
      width: 1000,
      height: 1000,
      alt: 'Handcrafted Crochet Specialty Holders Sunflower Spectacles',
      color: 'Sunflower Spectacles'
    },
    images: [
      {
        src: '/Crochet/IMG_20260605_154039_796.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handcrafted Crochet Specialty Holders Sunflower Spectacles',
        color: 'Sunflower Spectacles'
      },
      {
        src: '/Crochet/IMG_20260605_154041_532.jpg',
        width: 1000,
        height: 1000,
        alt: 'Handcrafted Crochet Specialty Holders Snuggly Bear Balm',
        color: 'Snuggly Bear Balm'
      }
    ],
    reviewNumber: 14,
    rating: 4.8,
    status: 'Clever Design',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Sunflower Spectacles', swatch: { color: '#ffb703', image: '/Crochet/IMG_20260605_154039_796.jpg' } },
          { name: 'Snuggly Bear Balm', swatch: { color: '#9c6644', image: '/Crochet/IMG_20260605_154041_532.jpg' } }
        ]
      },
      {
        name: 'Size',
        optionValues: [{ name: 'Standard', swatch: null }]
      }
    ],
    selectedOptions: [
      { name: 'Color', value: 'Sunflower Spectacles' },
      { name: 'Size', value: 'Standard' }
    ],
    description: 'Keep your small accessories safe in style. Our Sunflower Spectacles holder wraps securely around glasses templates to keep them protected from scratches, while the Snuggly Bear Balm holder hangs onto bags or keyrings, keeping your favorite lip balm close at hand.',
    features: [
      'Soft, scratch-resistant cotton yarn sleeves',
      'Fitted with small keychain attachment loops',
      'Cute designs: Sunflower and Snuggly Bear',
      'Perfect functional gifts'
    ],
    careInstruction: 'Hand wash cold and lay flat to dry. Do not bleach.',
    shippingAndReturn: 'Dispatched within 24-48 hours. Returnable within 30 days.'
  },
  {
    id: 'crochet-flower-bouquet',
    title: 'Premium Crochet Flower Bouquet',
    handle: 'crochet-flower-bouquet',
    collectionHandles: ['coats'],
    createdAt: '2026-06-05T12:00:00Z',
    vendor: 'Thread & Love',
    price: 28,
    featuredImage: {
      src: '/Crochet/IMG_20260605_154009_634.jpg',
      width: 1000,
      height: 1000,
      alt: 'Premium Crochet Flower Bouquet Spring Tulips',
      color: 'Spring Tulips'
    },
    images: [
      {
        src: '/Crochet/IMG_20260605_154009_634.jpg',
        width: 1000,
        height: 1000,
        alt: 'Premium Crochet Flower Bouquet Spring Tulips',
        color: 'Spring Tulips'
      },
      {
        src: '/Crochet/IMG_20260605_154010_583.jpg',
        width: 1000,
        height: 1000,
        alt: 'Premium Crochet Flower Bouquet Bright Lilies',
        color: 'Bright Lilies'
      },
      {
        src: '/Crochet/IMG_20260605_154012_462.jpg',
        width: 1000,
        height: 1000,
        alt: 'Premium Crochet Flower Bouquet Warm Sunflowers',
        color: 'Warm Sunflowers'
      },
      {
        src: '/Crochet/IMG_20260605_154013_495.jpg',
        width: 1000,
        height: 1000,
        alt: 'Premium Crochet Flower Bouquet Red Roses Bundle',
        color: 'Red Roses Bundle'
      },
      {
        src: '/Crochet/IMG_20260605_154014_510.jpg',
        width: 1000,
        height: 1000,
        alt: 'Premium Crochet Flower Bouquet I Heart U Burlap',
        color: 'I Heart U Burlap'
      },
      {
        src: '/Crochet/IMG_20260605_154027_060.jpg',
        width: 1000,
        height: 1000,
        alt: 'Premium Crochet Flower Bouquet Single Stem Rose',
        color: 'Single Stem Rose'
      }
    ],
    reviewNumber: 47,
    rating: 4.9,
    status: 'Romantic Gift',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Spring Tulips', swatch: { color: '#ffcad4', image: '/Crochet/IMG_20260605_154009_634.jpg' } },
          { name: 'Bright Lilies', swatch: { color: '#ffe5ec', image: '/Crochet/IMG_20260605_154010_583.jpg' } },
          { name: 'Warm Sunflowers', swatch: { color: '#fcbf49', image: '/Crochet/IMG_20260605_154012_462.jpg' } },
          { name: 'Red Roses Bundle', swatch: { color: '#d62828', image: '/Crochet/IMG_20260605_154013_495.jpg' } },
          { name: 'I Heart U Burlap', swatch: { color: '#ebd9be', image: '/Crochet/IMG_20260605_154014_510.jpg' } },
          { name: 'Single Stem Rose', swatch: { color: '#9e2a2b', image: '/Crochet/IMG_20260605_154027_060.jpg' } }
        ]
      },
      {
        name: 'Size',
        optionValues: [{ name: 'Standard', swatch: null }]
      }
    ],
    selectedOptions: [
      { name: 'Color', value: 'Spring Tulips' },
      { name: 'Size', value: 'Standard' }
    ],
    description: 'Give a gift of everlasting blooms. Our Premium Crochet Flower Bouquets are handcrafted stitch by stitch, with wire-reinforced stems that allow you to pose and arrange them beautifully. Perfect for dining table decor, office desks, or as a romantic keepsake that never fades.',
    features: [
      'Everlasting, hypoallergenic hand-crocheted flowers',
      'Wire-reinforced leaves and stems for poseable structure',
      'Beautifully wrapped in tissue or rustic burlap sheets',
      'Tulips, Lilies, Sunflowers, Roses, and customized configurations'
    ],
    careInstruction: 'Dust gently with a soft duster or hairdryer on cool/low setting. Do not wash in washing machine.',
    shippingAndReturn: 'Free shipping on orders over $50. Hand-packaged securely in sturdy boxes to protect structure. Returnable in original condition within 30 days.'
  }
]

export async function getProducts(): Promise<TProductItem[]> {
  const liveProducts = await fetchMagicNeedlesProducts()

  const localItems = [
    {
      id: 'gid://1001',
      title: 'Aura Crochet Halter Top',
      handle: 'aura-crochet-halter-top',
      collectionHandles: ['jackets', 'accessories'],
      createdAt: '2025-05-06T10:00:00-04:00',
      vendor: 'Thread & Love',
      price: 48,
      featuredImage: {
        src: productImage1.src,
        width: productImage1.width,
        height: productImage1.height,
        alt: 'Aura Crochet Halter Top',
      },
      images: [
        {
          src: productImage1.src,
          width: productImage1.width,
          height: productImage1.height,
          alt: 'Aura Crochet Halter Top',
        },
        {
          src: productImage1_1.src,
          width: productImage1_1.width,
          height: productImage1_1.height,
          alt: 'Aura Crochet Halter Top Side View',
        },
        {
          src: productImage1_2.src,
          width: productImage1_2.width,
          height: productImage1_2.height,
          alt: 'Aura Crochet Halter Top Flatlay',
        },
        {
          src: productImage1_3.src,
          width: productImage1_3.width,
          height: productImage1_3.height,
          alt: 'Aura Crochet Halter Top Packaging',
        },
      ],
      reviewNumber: 87,
      rating: 4.8,
      status: 'Handmade with Love',
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Soft Cream',
              swatch: {
                color: '#FAEEE2',
                image: null,
              },
            },
            {
              name: 'Rose Terracotta',
              swatch: {
                color: '#c07c65',
                image: null,
              },
            },
            {
              name: 'Sage Green',
              swatch: {
                color: '#8ba88f',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              swatch: null,
              name: 'S',
            },
            {
              swatch: null,
              name: 'M',
            },
            {
              swatch: null,
              name: 'L',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Color',
          value: 'Soft Cream',
        },
        {
          name: 'Size',
          value: 'S',
        },
      ],
    },
    {
      id: 'gid://1002',
      title: 'Amigurumi Oliver the Owl',
      handle: 'amigurumi-oliver-the-owl',
      collectionHandles: ['t-shirts'],
      createdAt: '2025-05-07T09:30:00-04:00',
      vendor: 'Thread & Love',
      price: 35,
      featuredImage: {
        src: productImage2.src,
        width: productImage2.width,
        height: productImage2.height,
        alt: 'Amigurumi Oliver the Owl',
      },
      images: [
        {
          src: productImage2.src,
          width: productImage2.width,
          height: productImage2.height,
          alt: 'Amigurumi Oliver the Owl',
        },
        {
          src: productImage2_1.src,
          width: productImage2_1.width,
          height: productImage2_1.height,
          alt: 'Amigurumi Oliver the Owl Side View',
        },
        {
          src: productImage2_2.src,
          width: productImage2_2.width,
          height: productImage2_2.height,
          alt: 'Amigurumi Oliver the Owl Flatlay',
        },
        {
          src: productImage2_3.src,
          width: productImage2_3.width,
          height: productImage2_3.height,
          alt: 'Amigurumi Oliver the Owl Packaged',
        },
      ],
      reviewNumber: 95,
      rating: 4.9,
      status: 'Best Seller',
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Forest Grey',
              swatch: {
                color: '#8c8c8c',
                image: null,
              },
            },
            {
              name: 'Warm Cinnamon',
              swatch: {
                color: '#b07d62',
                image: null,
              },
            },
            {
              name: 'Linen White',
              swatch: {
                color: '#faf8f5',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              swatch: null,
              name: 'Mini Owl (4")',
            },
            {
              swatch: null,
              name: 'Medium Owl (8")',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Color',
          value: 'Warm Cinnamon',
        },
        {
          name: 'Size',
          value: 'Medium Owl (8")',
        },
      ],
    },
    {
      id: 'gid://1003',
      title: 'Sunburst Granny Square Tote',
      handle: 'sunburst-granny-square-tote',
      collectionHandles: ['jeans', 'bags'],
      createdAt: '2025-05-08T11:15:00-04:00',
      vendor: 'Thread & Love',
      price: 55,
      featuredImage: {
        src: productImage3.src,
        width: productImage3.width,
        height: productImage3.height,
        alt: 'Sunburst Granny Square Tote',
      },
      images: [
        {
          src: productImage3.src,
          width: productImage3.width,
          height: productImage3.height,
          alt: 'Sunburst Granny Square Tote',
        },
        {
          src: productImage3_1.src,
          width: productImage3_1.width,
          height: productImage3_1.height,
          alt: 'Sunburst Granny Square Tote Back',
        },
        {
          src: productImage3_2.src,
          width: productImage3_2.width,
          height: productImage3_2.height,
          alt: 'Sunburst Granny Square Tote Model',
        },
        {
          src: productImage3_3.src,
          width: productImage3_3.width,
          height: productImage3_3.height,
          alt: 'Sunburst Granny Square Tote Detail',
        },
      ],
      reviewNumber: 120,
      rating: 4.7,
      status: 'Handmade with Love',
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Autumn Sunburst',
              swatch: {
                color: '#e09f3e',
                image: null,
              },
            },
            {
              name: 'Ocean Breeze',
              swatch: {
                color: '#3d5a80',
                image: null,
              },
            },
            {
              name: 'Pastel Dreams',
              swatch: {
                color: '#ffcad4',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              swatch: null,
              name: 'Standard Size',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Color',
          value: 'Autumn Sunburst',
        },
        {
          name: 'Size',
          value: 'Standard Size',
        },
      ],
    },
    {
      id: 'gid://1004',
      title: 'Aura Pastel Crochet Beanie',
      handle: 'aura-pastel-crochet-beanie',
      collectionHandles: ['jackets', 'accessories'],
      createdAt: '2025-05-09T14:20:00-04:00',
      vendor: 'Thread & Love',
      price: 28,
      featuredImage: {
        src: productImage4.src,
        width: productImage4.width,
        height: productImage4.height,
        alt: 'Aura Pastel Crochet Beanie',
      },
      images: [
        {
          src: productImage4.src,
          width: productImage4.width,
          height: productImage4.height,
          alt: 'Aura Pastel Crochet Beanie',
        },
        {
          src: productImage4_1.src,
          width: productImage4_1.width,
          height: productImage4_1.height,
          alt: 'Aura Pastel Crochet Beanie Variant 1',
        },
        {
          src: productImage4_2.src,
          width: productImage4_2.width,
          height: productImage4_2.height,
          alt: 'Aura Pastel Crochet Beanie Variant 2',
        },
        {
          src: productImage4_3.src,
          width: productImage4_3.width,
          height: productImage4_3.height,
          alt: 'Aura Pastel Crochet Beanie Variant 3',
        },
      ],
      reviewNumber: 75,
      rating: 4.8,
      status: 'Limited Edition',
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Blush Pink',
              swatch: {
                color: '#ffb5a7',
                image: null,
              },
            },
            {
              name: 'Soft Lilac',
              swatch: {
                color: '#dec0f1',
                image: null,
              },
            },
            {
              name: 'Sage Green',
              swatch: {
                color: '#8ba88f',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              swatch: null,
              name: 'Standard Fit',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Color',
          value: 'Soft Lilac',
        },
        {
          name: 'Size',
          value: 'Standard Fit',
        },
      ],
    },
    {
      id: 'gid://1005',
      title: 'Boho Plant Hanger',
      handle: 'boho-plant-hanger',
      collectionHandles: ['coats'],
      createdAt: '2025-05-10T08:45:00-04:00',
      vendor: 'Thread & Love',
      price: 32,
      featuredImage: {
        src: productImage5.src,
        width: productImage5.width,
        height: productImage5.height,
        alt: 'Boho Plant Hanger',
      },
      images: [
        {
          src: productImage5.src,
          width: productImage5.width,
          height: productImage5.height,
          alt: 'Boho Plant Hanger',
        },
        {
          src: productImage5_1.src,
          width: productImage5_1.width,
          height: productImage5_1.height,
          alt: 'Boho Plant Hanger Detail',
        },
        {
          src: productImage5_2.src,
          width: productImage5_2.width,
          height: productImage5_2.height,
          alt: 'Boho Plant Hanger Hanging',
        },
        {
          src: productImage5_3.src,
          width: productImage5_3.width,
          height: productImage5_3.height,
          alt: 'Boho Plant Hanger Flatlay',
        },
      ],
      reviewNumber: 60,
      rating: 4.6,
      status: 'Handmade Decor',
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Cream Hemp',
              swatch: {
                color: '#e6dfd3',
                image: null,
              },
            },
            {
              name: 'Natural Jute',
              swatch: {
                color: '#c5b358',
                image: null,
              },
            },
            {
              name: 'Olive Green',
              swatch: {
                color: '#808000',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              swatch: null,
              name: 'Small (2ft)',
            },
            {
              swatch: null,
              name: 'Medium (3ft)',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Color',
          value: 'Cream Hemp',
        },
        {
          name: 'Size',
          value: 'Medium (3ft)',
        },
      ],
    },
    {
      id: 'gid://1006',
      title: 'Blossom Crochet Coaster Set',
      handle: 'blossom-crochet-coaster-set',
      collectionHandles: ['coats'],
      createdAt: '2025-05-11T12:10:00-04:00',
      vendor: 'Thread & Love',
      price: 18,
      featuredImage: {
        src: productImage6.src,
        width: productImage6.width,
        height: productImage6.height,
        alt: 'Blossom Crochet Coaster Set',
      },
      images: [
        {
          src: productImage6.src,
          width: productImage6.width,
          height: productImage6.height,
          alt: 'Blossom Crochet Coaster Set',
        },
        {
          src: productImage6_1.src,
          width: productImage6_1.width,
          height: productImage6_1.height,
          alt: 'Blossom Crochet Coaster Set Closeup',
        },
        {
          src: productImage6_2.src,
          width: productImage6_2.width,
          height: productImage6_2.height,
          alt: 'Blossom Crochet Coaster Set Stacked',
        },
        {
          src: productImage6_3.src,
          width: productImage6_3.width,
          height: productImage6_3.height,
          alt: 'Blossom Crochet Coaster Set Packaging',
        },
      ],
      reviewNumber: 45,
      rating: 4.9,
      status: 'Trending Cozy Decor',
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Warm Autumn Set',
              swatch: {
                color: '#d95d39',
                image: null,
              },
            },
            {
              name: 'Summer Pastel Set',
              swatch: {
                color: '#f5cac3',
                image: null,
              },
            },
            {
              name: 'Forest Pine Set',
              swatch: {
                color: '#264653',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              swatch: null,
              name: 'Set of 4',
            },
            {
              swatch: null,
              name: 'Set of 6',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Color',
          value: 'Warm Autumn Set',
        },
        {
          name: 'Size',
          value: 'Set of 6',
        },
      ],
    },
    {
      id: 'gid://1007',
      title: 'Daisy Chain Crossbody Purse',
      handle: 'daisy-chain-crossbody-purse',
      collectionHandles: ['jeans', 'bags'],
      createdAt: '2025-05-12T10:25:00-04:00',
      vendor: 'Thread & Love',
      price: 45,
      featuredImage: {
        src: productImage7.src,
        width: productImage7.width,
        height: productImage7.height,
        alt: 'Daisy Chain Crossbody Purse',
      },
      images: [
        {
          src: productImage7.src,
          width: productImage7.width,
          height: productImage7.height,
          alt: 'Daisy Chain Crossbody Purse',
        },
        {
          src: productImage7_1.src,
          width: productImage7_1.width,
          height: productImage7_1.height,
          alt: 'Daisy Chain Crossbody Purse Model',
        },
        {
          src: productImage7_2.src,
          width: productImage7_2.width,
          height: productImage7_2.height,
          alt: 'Daisy Chain Crossbody Purse Interior',
        },
        {
          src: productImage7_3.src,
          width: productImage7_3.width,
          height: productImage7_3.height,
          alt: 'Daisy Chain Crossbody Purse Detail',
        },
      ],
      reviewNumber: 80,
      rating: 4.8,
      status: 'Handmade Accent',
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Sweet Daisy Beige',
              swatch: {
                color: '#ebd9be',
                image: null,
              },
            },
            {
              name: 'Midnight Indigo',
              swatch: {
                color: '#1a2535',
                image: null,
              },
            },
            {
              name: 'Rose Bloom',
              swatch: {
                color: '#e5989b',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              swatch: null,
              name: 'Standard Size',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Color',
          value: 'Sweet Daisy Beige',
        },
        {
          name: 'Size',
          value: 'Standard Size',
        },
      ],
    },
    {
      id: 'gid://1008',
      title: 'Artisanal Crochet Starter Kit',
      handle: 'artisanal-crochet-starter-kit',
      collectionHandles: ['shoes'],
      createdAt: '2025-05-13T09:00:00-04:00',
      vendor: 'Thread & Love',
      price: 65,
      featuredImage: {
        src: productImage8.src,
        width: productImage8.width,
        height: productImage8.height,
        alt: 'Artisanal Crochet Starter Kit',
      },
      images: [
        {
          src: productImage8.src,
          width: productImage8.width,
          height: productImage8.height,
          alt: 'Artisanal Crochet Starter Kit',
        },
        {
          src: productImage8_1.src,
          width: productImage8_1.width,
          height: productImage8_1.height,
          alt: 'Artisanal Crochet Starter Kit Opened',
        },
        {
          src: productImage8_2.src,
          width: productImage8_2.width,
          height: productImage8_2.height,
          alt: 'Artisanal Crochet Starter Kit Pattern Book',
        },
        {
          src: productImage8_3.src,
          width: productImage8_3.width,
          height: productImage8_3.height,
          alt: 'Artisanal Crochet Starter Kit Supplies',
        },
      ],
      reviewNumber: 110,
      rating: 4.9,
      status: 'Highly Recommended DIY',
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Pastel Starter Pack',
              swatch: {
                color: '#f4e3b1',
                image: null,
              },
            },
            {
              name: 'Autumn Warmth Pack',
              swatch: {
                color: '#b07d62',
                image: null,
              },
            },
            {
              name: 'Cool Ocean Pack',
              swatch: {
                color: '#8ba88f',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              swatch: null,
              name: 'Complete Kit',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Color',
          value: 'Autumn Warmth Pack',
        },
        {
          name: 'Size',
          value: 'Complete Kit',
        },
      ],
    },
  ]
  if (liveProducts && liveProducts.length > 0) {
    return [...LOCAL_CROCHET_PRODUCTS, ...localItems, ...liveProducts]
  }
  return [...LOCAL_CROCHET_PRODUCTS, ...localItems]
}

export const COLLECTION_PINTEREST_FEEDS: Record<string, string> = {
  jackets: 'https://www.pinterest.com/annabooshouse/crochet-wearables.rss',
  coats: 'https://www.pinterest.com/pinterest/home-decor.rss',
  't-shirts': 'https://www.pinterest.com/pinterest/creative-ideas.rss',
  jeans: 'https://www.pinterest.com/pinterest/official-news.rss',
  bags: 'https://www.pinterest.com/pinterest/official-news.rss',
}

export async function getProductsForCollection(handle: string): Promise<TProductItem[]> {
  const lowercaseHandle = handle.toLowerCase()
  const allProducts = await getProducts()
  
  const localProducts = lowercaseHandle === 'all'
    ? allProducts
    : allProducts.filter((product) => product.collectionHandles?.includes(lowercaseHandle))

  const pinterestFeedUrl = COLLECTION_PINTEREST_FEEDS[lowercaseHandle]
  if (pinterestFeedUrl) {
    const pinterestProducts = await fetchPinterestProducts(pinterestFeedUrl)
    return [...localProducts, ...pinterestProducts]
  }

  return localProducts
}

export async function getProductByHandle(handle: string) {
  // lowercase handle
  handle = handle.toLowerCase()

  if (handle.startsWith('pinterest-')) {
    // Search in active feeds
    for (const feedUrl of Object.values(COLLECTION_PINTEREST_FEEDS)) {
      const pins = await fetchPinterestProducts(feedUrl)
      const pin = pins.find((p) => p.handle === handle)
      if (pin) return pin
    }
    // Fall back to a dynamically constructed Pinterest product on the fly
    const pinId = handle.replace('pinterest-', '')
    const pinIdNum = parseInt(pinId, 10) || 0
    return {
      id: handle,
      title: `Pinterest Crochet Inspiration #${pinId.slice(0, 6)}`,
      handle,
      createdAt: new Date().toISOString(),
      vendor: 'Pinterest Inspiration',
      price: (pinIdNum % 48) + 18,
      featuredImage: {
        src: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=736',
        width: 736,
        height: 1100,
        alt: 'Pinterest Inspiration',
      },
      images: [
        {
          src: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=736',
          width: 736,
          height: 1100,
          alt: 'Pinterest Inspiration',
        }
      ],
      reviewNumber: (pinIdNum % 141) + 10,
      rating: parseFloat((4.5 + ((pinIdNum % 6) * 0.1)).toFixed(1)),
      status: 'Pinterest Pin',
      options: [
        {
          name: 'Color',
          optionValues: [
            { name: 'Warm Terracotta', swatch: { color: '#c07c65', image: null } },
            { name: 'Off-White Cream', swatch: { color: '#faeee2', image: null } },
            { name: 'Forest Green', swatch: { color: '#8ba88f', image: null } }
          ]
        },
        {
          name: 'Size',
          optionValues: [{ name: 'S', swatch: null }, { name: 'M', swatch: null }, { name: 'L', swatch: null }]
        }
      ],
      selectedOptions: [
        { name: 'Color', value: 'Off-White Cream' },
        { name: 'Size', value: 'M' }
      ]
    }
  }

  const products = await getProducts()
  let product = products.find((product) => product.handle === handle)

  if (!product) {
    product = products[0] // fallback to the first product
  }

  return product
}

// get product by handle
export async function getProductDetailByHandle(handle: string) {
  // lowercase handle
  handle = handle.toLowerCase()

  // for demo purposes, we are using a static product detail
  const product = await getProductByHandle(handle)
  const isPinterest = handle.startsWith('pinterest-')
  const isMagic = handle.startsWith('magic-')

  return {
    ...product,
    status: isPinterest ? 'Pinterest Pin' : (product?.status || 'In Stock'),
    breadcrumbs: [
      { id: 1, name: 'Home', href: '/' },
      { id: 2, name: 'Handmade Crochet', href: '/collections/all' },
    ],
    description: isPinterest 
      ? ((product as any).pinterestDescription || 'This gorgeous piece was discovered on Pinterest. Lovingly hand-crafted, it features high-quality premium fibers and intricate stitch detailing to bring creative crochet patterns to life.')
      : (isMagic 
          ? ((product as any).magicDescription || 'A beautifully designed premium handcrafted item from Magic Needles. Made with high-quality yarn and designed with meticulous attention to detail.') 
          : ((product as any).description || 'Every single piece is lovingly hand-crafted by our master artisans with the softest, premium organic cotton and ethically sourced wool. We pay careful attention to every stitch, creating durable, cozy, and highly expressive heirloom pieces designed to last a lifetime.')),
    publishedAt: '2025-05-15T12:00:00Z',
    selectedOptions: [
      {
        name: 'Color',
        value: product?.options?.find((option) => option.name === 'Color')?.optionValues[0]?.name || 'Original',
      },
      {
        name: 'Size',
        value: product?.options?.find((option) => option.name === 'Size')?.optionValues[0]?.name || 'Standard',
      },
    ],
    features: (product as any).features || (isPinterest 
      ? [
          'Sourced from curated Pinterest design collection',
          'Premium, highly expressive visual details',
          'Handcrafted look with high-fidelity finish',
          'Direct Pinterest reference design'
        ]
      : (isMagic 
          ? [
              `Authentic design from ${product?.vendor || 'Magic Needles'}`,
              'Lovingly hand-knitted and crocheted premium accessories',
              'Soft, breathable, and extremely cozy textures',
              'Crafted by expert artisans with years of experience'
            ]
          : [
              'Material: 100% Organic Combed Cotton & Ethically Sourced Wool',
              'Handcrafted with extremely precise, premium lock-stitch patterns',
              'Soft, breathable, skin-friendly, and naturally hypoallergenic',
              'Supports and empowers independent local women artisans'
            ])),
    careInstruction:
      (product as any).careInstruction || 'Hand wash gently in cold water with a mild liquid wool detergent. Do not wring, twist, or scrub. Lay flat on a clean, dry towel to air dry. Do not tumble dry. Do not bleach.',
    shippingAndReturn: isPinterest
      ? `This design is featured in our Pinterest Inspiration series. For purchasing inquiries, refer to the original pin: ${(product as any).pinterestLink || 'https://www.pinterest.com'}.`
      : (isMagic
          ? `This is a live premium product from Magic Needles. For more information, visit the original listing: ${(product as any).originalUrl || 'https://magicneedles.in'}.`
          : ((product as any).shippingAndReturn || 'We offer free worldwide shipping on all orders over $50. Each item is made to order with care. If you are not satisfied with your purchase, you can return it within 30 days for a full refund.')),
  }
}

export interface TProductItem {
  id: string
  title: string
  handle: string
  description?: string
  features?: string[]
  careInstruction?: string
  shippingAndReturn?: string
  createdAt?: string
  vendor?: string
  price: number
  featuredImage: {
    src: any
    width: number
    height: number
    alt: string
    color?: string
  }
  images: Array<{
    src: any
    width: number
    height: number
    alt: string
    color?: string
  }>
  reviewNumber?: number
  rating?: number
  status?: string
  collectionHandles?: string[]
  isFromPinterest?: boolean
  isFromMagicNeedles?: boolean
  originalUrl?: string
  pinterestDescription?: string
  pinterestLink?: string
  magicDescription?: string
  options: Array<{
    name: string
    optionValues: Array<{
      name: string
      swatch?: {
        color: string
        image: string | null
      } | null
    }>
  }>
  selectedOptions: Array<{
    name: string
    value: string
  }>
}

export type TCollection = Partial<Awaited<ReturnType<typeof getCollections>>[number]>
export type TProductDetail = Partial<Awaited<ReturnType<typeof getProductDetailByHandle>>>
export type TCardProduct = Partial<Awaited<ReturnType<typeof getCart>['lines'][number]>>
export type TBlogPost = Partial<Awaited<ReturnType<typeof getBlogPosts>>[number]>
export interface TReview {
  id?: string
  title?: string
  rating?: number
  content?: string
  author?: string
  authorAvatar?: { src?: string }
  isVerifiedBuyer?: boolean
  date?: string
  datetime?: string
}
export type TOrder = Partial<Awaited<ReturnType<typeof getOrders>>[number]>
