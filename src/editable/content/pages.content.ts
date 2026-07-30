import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'Places and Guides for local discovery',
      description: 'Search local places and downloadable guides through a calm, useful directory experience.',
      openGraphTitle: 'Places and Guides for local discovery',
      openGraphDescription: 'Find local records, compare practical details, and open helpful guides from one searchable index.',
      keywords: ['places directory', 'guide library', 'local discovery', 'reference guides'],
    },
    hero: {
      badge: 'Places and Guides',
      title: ['A calm index for', 'local records and useful references.'],
      description: 'Find practical local details, compare records, and open saved reference material from one focused search surface.',
      primaryCta: { label: 'Browse Places', href: '/listing' },
      secondaryCta: { label: 'Open Guides', href: '/pdf' },
      searchPlaceholder: 'Search places, categories, guide topics',
      focusLabel: 'Focus',
      featureCardBadge: 'latest cover rotation',
      featureCardTitle: 'Latest posts shape the visual identity of the homepage.',
      featureCardDescription: 'Recent images and stories stay at the center of the experience without changing any core platform behavior.',
    },
    intro: {
      badge: 'About the platform',
      title: 'Built for reading, browsing, and connecting different kinds of content.',
      paragraphs: [
        'This site brings together article-style reading, visual browsing, and structured discovery so visitors can move naturally between different content types.',
        'Instead of separating stories, visuals, and supporting resources into disconnected surfaces, the platform keeps them connected in one place with consistent navigation and easier exploration.',
        'Whether someone starts with a story, an image-led post, a listing, or a resource page, they can keep discovering related content without friction.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'Reading-first homepage with stronger emphasis on stories and imagery.',
        'Connected sections for articles, visuals, listings, and supporting resources.',
        'Cleaner browsing rhythm designed to make exploration feel easier.',
        'Lightweight interactions that keep the experience fast and readable.',
      ],
      primaryLink: { label: 'Browse articles', href: '/article' },
      secondaryLink: { label: 'See visuals', href: '/image' },
    },
    cta: {
      badge: 'Start exploring',
      title: 'Explore local records and reference material through one connected experience.',
      description: 'Move between places, articles, profiles, images, bookmarks, and guides through one clearer visual system.',
      primaryCta: { label: 'Browse Articles', href: '/article' },
      secondaryCta: { label: 'Contact Sales', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest posts in this section.',
    },
  },
  about: {
    badge: 'About the index',
    title: 'A calmer, clearer way to find local records and useful guides.',
    description: `${slot4BrandConfig.siteName} helps visitors search practical local records, compare useful details, and open reference material from one connected index.`,
    paragraphs: [
      'Instead of splitting useful information into disconnected pages, the platform keeps related records, articles, images, profiles, bookmarks, and guides close together.',
      'Whether someone starts with a local record or a guide, they can continue exploring without losing context.',
    ],
    values: [
      {
        title: 'Reading-first experience',
        description: 'We prioritize clarity, pacing, and structure so people can read, browse, and discover without noise.',
      },
      {
        title: 'Connected content surfaces',
        description: 'Articles, visual posts, listings, resources, and profiles stay connected so discovery feels natural across the site.',
      },
      {
        title: 'Simple and trustworthy',
        description: 'We focus on clean navigation and clear page structure to help visitors find useful content faster.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'Send corrections, submissions, and support notes to the right desk.',
    description: 'Tell us what you want to add, fix, clarify, or publish. Specific page names, categories, and source details help us respond with less back-and-forth.',
    formTitle: 'Send a message',
  },

  search: {
    metadata: {
      title: 'Search',
      description: 'Search posts, topics, categories, and content across the site.',
    },
    hero: {
      badge: 'Search the archive',
      title: 'Find stories, listings, visuals, and resources faster.',
      description: 'Use keywords, categories, and content types to discover posts from every active section of the site.',
      placeholder: 'Search by keyword, topic, category, or title',
    },
    resultsTitle: 'Latest searchable content',
  },
  create: {
    metadata: {
      title: 'Create',
      description: 'Create and submit new content for the site.',
    },
    locked: {
      badge: 'Creator access',
      title: 'Login to create new content.',
      description: 'Use your account to open the publishing workspace and create posts for the active sections of this site.',
    },
    hero: {
      badge: 'Publishing workspace',
      title: 'Create content for every active section.',
      description: 'Choose the content type, add details, and prepare a clean post with images, links, summary, and body content.',
    },
    formTitle: 'Content details',
    submitLabel: 'Submit content',
    successTitle: 'Content submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Sign in to submit places, publish guides, and manage local site access.',
      badge: 'Member access',
      title: 'Welcome back to your publishing desk.',
      description: 'Sign in to submit records, publish reference guides, and continue from the same account on this browser.',
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create an account first, then login.',
      success: 'Login successful. Redirecting...',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Create an account to submit local records, publish guides, and save useful finds.',
      badge: 'Site access',
      title: 'Create your account and start contributing.',
      description: 'Create an account to submit places, publish guides, save useful finds, and return to the publishing workspace.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created successfully. Redirecting...',
      loginCta: 'Login',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related articles',
      fallbackTitle: 'Article details',
    },
    listing: {
      relatedTitle: 'Related places',
      fallbackTitle: 'Place details',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Image details',
    },
    profile: {
      relatedTitle: 'Suggested articles',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit Official Site',
    },
  },
} as const
