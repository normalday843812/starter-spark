"use client"

import { Button } from "@/components/ui/button"
import { Menu, X, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useCartStore, selectCartCount } from "@/store/cart"

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/learn", label: "Learn" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartCount = useCartStore(selectCartCount)
  const openCart = useCartStore((state) => state.openCart)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-20">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-mono text-xl font-bold text-slate-900 tracking-tighter">
              STARTER<span className="text-cyan-700">SPARK</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-sm text-slate-600 hover:text-cyan-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-600 hover:text-cyan-700 hover:bg-slate-100"
              aria-label="Cart"
              onClick={openCart}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-700 text-white text-xs font-mono rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Button>
            <Link
              href="/workshop"
              className="inline-flex items-center justify-center h-9 px-4 py-2 rounded-md border border-slate-200 hover:border-cyan-700 text-slate-600 hover:text-cyan-700 font-mono text-sm transition-colors"
            >
              Workshop
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center h-9 px-4 py-2 rounded-md bg-cyan-700 hover:bg-cyan-600 text-white font-mono text-sm transition-colors"
            >
              Shop Kits
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-slate-600 hover:text-cyan-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200">
          <nav className="px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block font-mono text-sm text-slate-600 hover:text-cyan-700 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <button
                type="button"
                onClick={() => {
                  openCart()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center justify-center gap-2 py-2 font-mono text-sm text-slate-600 hover:text-cyan-700 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                Cart {cartCount > 0 && `(${cartCount})`}
              </button>
              <Link
                href="/workshop"
                className="block w-full text-center py-2 px-4 rounded-md border border-slate-200 hover:border-cyan-700 text-slate-600 hover:text-cyan-700 font-mono text-sm transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Workshop
              </Link>
              <Link
                href="/shop"
                className="block w-full text-center py-2 px-4 rounded-md bg-cyan-700 hover:bg-cyan-600 text-white font-mono text-sm transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop Kits
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
