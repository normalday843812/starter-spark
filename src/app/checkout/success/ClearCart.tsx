"use client"

import { useEffect } from "react"
import { useCartStore } from "@/store/cart"

export function ClearCart() {
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    // Clear the cart after successful checkout
    clearCart()
  }, [clearCart])

  return null
}
