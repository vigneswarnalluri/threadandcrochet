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

export async function getProductReviews(handle: string) {
  return [
    {
      id: '1',
      title: "Can't say enough good things",
      rating: 5,
      content: `
        <p>I was really pleased with the overall shopping experience. My order even included a little personal, handwritten note, which delighted me!</p>
        <p>The product quality is amazing, it looks and feel even better than I had anticipated. </p>
      `,
      author: 'S. Walkinshaw',
      authorAvatar: avatarImage1,
      date: 'May 16, 2025',
      datetime: '2025-01-06',
    },
    {
      id: '2',
      title: 'Perfect for going out when you want to stay comfy',
      rating: 4,
      content: `
        <p>The product quality is amazing, it looks and feel even better than I had anticipated.</p>
        <p>I like it better than a regular hoody because it is tailored to be a slimmer fit. Perfect for going out when you want to stay comfy. The head opening is a little tight which makes it a little.</p>
      `,
      author: 'Risako M',
      authorAvatar: avatarImage2,
      date: 'May 16, 2025',
      datetime: '2025-01-06',
    },
    {
      id: '3',
      title: 'Very nice feeling sweater!',
      rating: 4,
      content: `
        <p> I would gladly recommend this store to my friends. And, now that I think of it... I actually have, many times.</p>
        <p>The product quality is amazing!</p>
      `,
      author: 'Eden Birch',
      authorAvatar: avatarImage3,
      date: 'May 16, 2025',
      datetime: '2025-01-06',
    },
    {
      id: '4',
      title: 'Very nice feeling sweater!',
      rating: 5,
      content: `
        <p> I would gladly recommend this store to my friends. And, now that I think of it... I actually have, many times.</p>
        <p>The product quality is amazing!</p>
      `,
      author: 'Jonathan Edwards',
      authorAvatar: avatarImage4,
      date: 'May 16, 2025',
      datetime: '2025-01-06',
    },
  ]
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
      description: 'Lovingly hand-stitched chuny cardigans, pullovers, and seasonal sweaters to keep you warm.',
      sortDescription: 'Chunky cardigans & sweaters',
      color: 'bg-[#FAF6F0]',
      count: 24,
      image: {
        src: collectionImage1.src,
        width: collectionImage1.width,
        height: collectionImage1.height,
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
        src: collectionImage2.src,
        width: collectionImage2.width,
        height: collectionImage2.height,
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
        src: collectionImage3.src,
        width: collectionImage3.width,
        height: collectionImage3.height,
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
        src: collectionImage4.src,
        width: collectionImage4.width,
        height: collectionImage4.height,
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
        src: collectionImage5.src,
        width: collectionImage5.width,
        height: collectionImage5.height,
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
        src: collectionImage6.src,
        width: collectionImage6.width,
        height: collectionImage6.height,
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
        src: collectionImage7.src,
        width: collectionImage7.width,
        height: collectionImage7.height,
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
        src: collectionImage5.src,
        width: collectionImage5.width,
        height: collectionImage5.height,
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
        src: collectionImage4.src,
        width: collectionImage4.width,
        height: collectionImage4.height,
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
        src: collectionImage3.src,
        width: collectionImage3.width,
        height: collectionImage3.height,
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
        src: collectionImage2.src,
        width: collectionImage2.width,
        height: collectionImage2.height,
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
        src: boothImage1.src,
        width: boothImage1.width,
        height: boothImage1.height,
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
        src: boothImage2.src,
        width: boothImage2.width,
        height: boothImage2.height,
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
        src: boothImage3.src,
        width: boothImage3.width,
        height: boothImage3.height,
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
        src: boothImage4.src,
        width: boothImage4.width,
        height: boothImage4.height,
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

export async function getProducts() {
  return [
    {
      id: 'gid://1001',
      title: 'Aura Crochet Halter Top',
      handle: 'leather-tote-bag',
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
      handle: 'silk-midi-dress',
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
      handle: 'denim-jacket',
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
      handle: 'cashmere-sweater',
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
      handle: 'linen-blazer',
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
      handle: 'velvet-skirt',
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
      handle: 'wool-trench-coat',
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
      handle: 'cotton-shirt',
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
}

export async function getProductByHandle(handle: string) {
  // lowercase handle
  handle = handle.toLowerCase()

  const products = await getProducts()
  let product = products.find((product) => product.handle === handle)

  if (!product) {
    // throw new Error(`Product with handle "${handle}" not found.`)

    // for demo purposes, we are using a static product detail
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

  // if ( !product?.id ) {
  //   throw new Error(`Product with handle "${handle}" not found.`)
  // }

  return {
    ...product,
    status: 'In Stock',
    breadcrumbs: [
      { id: 1, name: 'Home', href: '/' },
      { id: 2, name: 'Handmade Crochet', href: '/collections/all' },
    ],
    description:
      'Every single piece is lovingly hand-crafted by our master artisans with the softest, premium organic cotton and ethically sourced wool. We pay careful attention to every stitch, creating durable, cozy, and highly expressive heirloom pieces designed to last a lifetime.',
    publishedAt: '2025-05-15T12:00:00Z',
    selectedOptions: [
      {
        name: 'Color',
        value: product?.options.find((option) => option.name === 'Color')?.optionValues[0].name,
      },
      {
        name: 'Size',
        value: product?.options.find((option) => option.name === 'Size')?.optionValues[0].name,
      },
    ],
    features: [
      'Material: 100% Organic Combed Cotton & Ethically Sourced Wool',
      'Handcrafted with extremely precise, premium lock-stitch patterns',
      'Soft, breathable, skin-friendly, and naturally hypoallergenic',
      'Supports and empowers independent local women artisans'
    ],
    careInstruction:
      'Hand wash gently in cold water with a mild liquid wool detergent. Do not wring, twist, or scrub. Lay flat on a clean, dry towel to air dry. Do not tumble dry. Do not bleach.',
    shippingAndReturn:
      'We offer free worldwide shipping on all orders over $50. Each item is made to order with care. If you are not satisfied with your purchase, you can return it within 30 days for a full refund.',
  }
}

// COMMON Types ------------------------------------------------------------------------
export type TCollection = Partial<Awaited<ReturnType<typeof getCollections>>[number]>
export type TProductItem = Partial<Awaited<ReturnType<typeof getProducts>>[number]>
export type TProductDetail = Partial<Awaited<ReturnType<typeof getProductDetailByHandle>>>
export type TCardProduct = Partial<Awaited<ReturnType<typeof getCart>['lines'][number]>>
export type TBlogPost = Partial<Awaited<ReturnType<typeof getBlogPosts>>[number]>
export type TReview = Partial<Awaited<ReturnType<typeof getProductReviews>>[number]>
export type TOrder = Partial<Awaited<ReturnType<typeof getOrders>>[number]>
