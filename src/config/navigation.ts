export const mainNav = [
  { title: 'Shop', href: '/shop' },
  { title: 'Learn', href: '/learn' },
  { title: 'Community', href: '/community' },
  { title: 'About', href: '/about' },
] as const

export const footerNav = {
  main: [
    { title: 'Shop', href: '/shop' },
    { title: 'Learn', href: '/learn' },
    { title: 'Community', href: '/community' },
  ],
  legal: [
    { title: 'Privacy', href: '/privacy' },
    { title: 'Terms', href: '/terms' },
  ],
} as const

export type MainNavItem = (typeof mainNav)[number]
export type FooterNavItem = (typeof footerNav.main)[number]
