"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
  aspectRatioHint?: number
  className?: string
}

export function ProductImageLightbox({
  open,
  onOpenChange,
  images,
  productName,
  activeIndex,
  onActiveIndexChange,
  aspectRatioHint,
  className,
}: ProductImageLightboxProps) {
  const count = images.length
  const [activeAspectRatio, setActiveAspectRatio] = useState<number | null>(null)
  const [viewport, setViewport] = useState(() => {
    if (typeof window === "undefined") return { width: 0, height: 0 }
    return { width: window.innerWidth, height: window.innerHeight }
  })
  const [chromeHeights, setChromeHeights] = useState(() => ({
    header: 52,
    thumbs: 92,
  }))

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
  const headerRef = useRef<HTMLDivElement | null>(null)
  const thumbsRef = useRef<HTMLDivElement | null>(null)
  const aspectCacheRef = useRef<Record<string, number>>({})

  useEffect(() => {
    if (typeof window === "undefined") return
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    if (!open) return
    const headerHeight = headerRef.current?.getBoundingClientRect().height ?? chromeHeights.header
    const thumbsHeight = thumbsRef.current?.getBoundingClientRect().height ?? chromeHeights.thumbs
    setChromeHeights({ header: headerHeight, thumbs: thumbsHeight })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, count, displayIndex, viewport.width, viewport.height])

  useEffect(() => {
    if (!open || count === 0) return
    if (typeof window === "undefined") return

    const url = images[displayIndex]
    if (!url) {
      setActiveAspectRatio(null)
      return
    }

    const hintedRatio =
      typeof aspectRatioHint === "number" && Number.isFinite(aspectRatioHint) && aspectRatioHint > 0
        ? Math.max(1, Math.min(2.4, aspectRatioHint))
        : null

    const cachedRatio = aspectCacheRef.current[url]
    if (typeof cachedRatio === "number") setActiveAspectRatio(cachedRatio)
    else if (hintedRatio) setActiveAspectRatio(hintedRatio)

    let cancelled = false
    const img = new window.Image()
    img.decoding = "async"
    img.src = url

    img.onload = () => {
      if (cancelled) return
      const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 0
      if (!Number.isFinite(ratio) || ratio <= 0) return
      const clamped = Math.max(1, Math.min(2.4, ratio))
      aspectCacheRef.current[url] = clamped
      setActiveAspectRatio(clamped)
    }

    img.onerror = () => {
      if (cancelled) return
      setActiveAspectRatio(null)
    }

    return () => {
      cancelled = true
    }
  }, [open, count, images, displayIndex, aspectRatioHint])

  const modalWidth = useMemo(() => {
    if (!open) return 0
    const ratio = activeAspectRatio ?? 1
    // Increased max width from 1152 to 1400 (~20% larger) and reduced padding from 32px to 16px
    const maxWidth = Math.max(0, Math.min(1400, viewport.width - 16))
    const maxHeight = Math.max(0, viewport.height - 16)
    const reservedHeight = chromeHeights.header + (count > 1 ? chromeHeights.thumbs : 0)
    const availableHeight = Math.max(240, maxHeight - reservedHeight)
    const minWidth = Math.min(320, maxWidth)
    return Math.max(minWidth, Math.min(maxWidth, availableHeight * ratio))
  }, [open, activeAspectRatio, viewport.width, viewport.height, chromeHeights.header, chromeHeights.thumbs, count])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (count < 2) return
    if (e.pointerType === "mouse") return
    pointerStartRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
  }, [count])

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "p-0 gap-0 overflow-hidden bg-white text-slate-900 border border-slate-200 shadow-2xl",
          className
        )}
        style={{
          width: modalWidth ? `${modalWidth}px` : undefined,
          maxWidth: "calc(100vw - 1rem)",
          maxHeight: "calc(100vh - 1rem)",
        }}
      >
        <DialogTitle className="sr-only">{productName} images</DialogTitle>

        {/* Header */}
        <div
          ref={headerRef}
          className="flex items-center justify-between border-b border-slate-200 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate font-mono text-sm text-slate-700">{productName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500">
              {displayIndex + 1} / {count}
            </span>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Close image viewer"
              >
                <XIcon />
              </Button>
            </DialogClose>
          </div>
        </div>

        {/* Main Image */}
        <div
          className="relative w-full bg-slate-50 touch-pan-y"
          style={{
            aspectRatio: activeAspectRatio ?? 1,
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <Image
            src={images[displayIndex]}
            alt=""
            fill
            sizes="100vw"
            quality={25}
            className="object-cover blur-2xl scale-110 opacity-30 pointer-events-none"
            aria-hidden={true}
          />
          <div className="absolute inset-0 bg-white/60" aria-hidden="true" />

          <ProductImage
            src={images[displayIndex]}
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
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-slate-200 shadow-sm text-slate-800"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-slate-200 shadow-sm text-slate-800"
                aria-label="Next image"
              >
                <ChevronRight className="size-5" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {count > 1 && (
          <div ref={thumbsRef} className="border-t border-slate-200 bg-white px-3 py-3">
            <div className="flex gap-2 overflow-x-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {images.map((imageUrl, idx) => (
                <button
                  key={imageUrl + idx}
                  type="button"
                  onClick={() => selectIndex(idx)}
                  className={cn(
                    "relative shrink-0 size-16 rounded border overflow-hidden transition-all",
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
