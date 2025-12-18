"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import type React from "react"
import { ChevronLeft, ChevronRight, XIcon } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ProductImage, ThumbnailImage } from "@/components/ui/optimized-image"
import { cn } from "@/lib/utils"

interface ProductImageLightboxProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  images: string[]
  productName: string
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  className?: string
}

export function ProductImageLightbox({
  open,
  onOpenChange,
  images,
  productName,
  activeIndex,
  onActiveIndexChange,
  className,
}: ProductImageLightboxProps) {
  const count = images.length

  const displayIndex = useMemo(() => {
    if (count === 0) return 0
    return ((activeIndex % count) + count) % count
  }, [activeIndex, count])

  const selectIndex = useCallback(
    (nextIndex: number) => {
      if (count === 0) return
      const wrapped = ((nextIndex % count) + count) % count
      onActiveIndexChange(wrapped)
    },
    [count, onActiveIndexChange]
  )

  const goPrev = useCallback(() => selectIndex(displayIndex - 1), [displayIndex, selectIndex])
  const goNext = useCallback(() => selectIndex(displayIndex + 1), [displayIndex, selectIndex])

  useEffect(() => {
    if (!open || count < 2) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        goPrev()
      }
      if (e.key === "ArrowRight") {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, count, goPrev, goNext])

  const pointerStartRef = useRef<{ x: number; y: number; id: number } | null>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (count < 2) return
      if (e.pointerType === "mouse") return
      pointerStartRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
    },
    [count]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const start = pointerStartRef.current
      pointerStartRef.current = null
      if (!start || count < 2) return
      if (start.id !== e.pointerId) return

      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return

      if (dx < 0) goNext()
      else goPrev()
    },
    [count, goNext, goPrev]
  )

  const handlePointerCancel = useCallback(() => {
    pointerStartRef.current = null
  }, [])

  if (count === 0) return null

  const activeSrc = images[displayIndex]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "!w-[calc(100vw-2rem)] !h-[calc(100vh-2rem)] !max-w-[calc(100vw-2rem)] !max-h-[calc(100vh-2rem)] !p-0 !gap-0 overflow-hidden bg-white text-slate-900 border border-slate-200 shadow-2xl",
          className
        )}
      >
        <DialogTitle className="sr-only">{productName} images</DialogTitle>

        <div className="relative h-full w-full">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              className="absolute right-3 top-3 z-30 bg-white/90 hover:bg-white border border-slate-200 shadow-sm text-slate-800"
              aria-label="Close image viewer"
            >
              <XIcon className="size-5" />
            </Button>
          </DialogClose>

          <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Left: image */}
            <div className="relative flex items-center justify-center p-3 sm:p-5 lg:p-6">
              <div
                className="relative w-full max-w-[calc(100vh-6rem)] aspect-square overflow-hidden rounded border border-slate-200 bg-slate-50"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
              >
                {/* Soft backdrop to make letterboxing feel intentional */}
                <Image
                  src={activeSrc}
                  alt=""
                  fill
                  sizes="100vw"
                  quality={20}
                  className="object-cover blur-2xl scale-110 opacity-25 pointer-events-none"
                  aria-hidden={true}
                />
                <div className="absolute inset-0 bg-white/55" aria-hidden="true" />

                <ProductImage
                  key={activeSrc}
                  src={activeSrc}
                  alt={`${productName} - Image ${displayIndex + 1}`}
                  sizes="100vw"
                  quality={100}
                  wrapperClassName="absolute inset-0"
                />

                {count > 1 && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-lg"
                      onClick={goPrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white border border-slate-200 shadow-sm text-slate-800"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="size-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-lg"
                      onClick={goNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white border border-slate-200 shadow-sm text-slate-800"
                      aria-label="Next image"
                    >
                      <ChevronRight className="size-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Right: title + thumbnails */}
            <div className="border-t lg:border-t-0 lg:border-l border-slate-200 bg-white p-3 sm:p-5 lg:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm text-slate-900 line-clamp-2">{productName}</p>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {displayIndex + 1} / {count}
                  </p>
                </div>
              </div>

              {count > 1 && (
                <div className="mt-4 grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-4 gap-2">
                  {images.map((imageUrl, idx) => (
                    <button
                      key={imageUrl + idx}
                      type="button"
                      onMouseEnter={() => selectIndex(idx)}
                      onFocus={() => selectIndex(idx)}
                      onClick={() => selectIndex(idx)}
                      className={cn(
                        "relative aspect-square w-full rounded border overflow-hidden transition-all",
                        idx === displayIndex
                          ? "border-cyan-700 ring-2 ring-cyan-700/20"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <ThumbnailImage
                        src={imageUrl}
                        alt={`${productName} thumbnail ${idx + 1}`}
                        size={64}
                        wrapperClassName="absolute inset-0"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
