export const siteConfig = {
  name: 'StarterSpark',
  tagline: 'Open Source Robotics Kits',
  description:
    'Precision robotics kits for the next generation of engineers. Designed in Hawaii.',
  url: 'https://starterspark.com',
  ogImage: '/og.png',
  links: {
    github: 'https://github.com/starterspark',
    twitter: 'https://twitter.com/starterspark',
    instagram: 'https://instagram.com/starterspark',
  },
  charity: {
    percentage: 70,
    description: '70% of profits donated to local STEM charities',
  },
  location: 'Honolulu, HI',
}

export type SiteConfig = typeof siteConfig
