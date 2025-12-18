"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import type PhotoSwipeLightboxType from "photoswipe/lightbox"

interface ProductImageLightboxProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  images: string[]
  productName: string
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  className?: string
}

type Dimensions = { width: number; height: number }

function wrapIndex(index: number, count: number) {
  if (count <= 0) return 0
  return ((index % count) + count) % count
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
  const displayIndex = useMemo(() => wrapIndex(activeIndex, count), [activeIndex, count])

  const reactId = useId()
  const galleryId = useMemo(() => {
    const safe = reactId.replace(/[:]/g, "")
    return `pswp-gallery-${safe}`
  }, [reactId])

  const [isReady, setIsReady] = useState(false)
  const [dimensions, setDimensions] = useState<Array<Dimensions | null>>(() =>
    Array.from({ length: count }, () => null)
  )

  const lightboxRef = useRef<PhotoSwipeLightboxType | null>(null)
  const dimensionsRef = useRef<Array<Dimensions | null>>(dimensions)
  const pendingRef = useRef<Map<number, Promise<Dimensions>>>(new Map())

  useEffect(() => {
    const next = Array.from({ length: images.length }, () => null as Dimensions | null)
    setDimensions(next)
    dimensionsRef.current = next
    pendingRef.current.clear()
  }, [images])

  const ensureDimensions = useCallback(
    (index: number) => {
      const idx = wrapIndex(index, images.length)
      const existing = dimensionsRef.current[idx]
      if (existing) return Promise.resolve(existing)

      const pending = pendingRef.current.get(idx)
      if (pending) return pending

      const src = images[idx]
      const promise = new Promise<Dimensions>((resolve) => {
        const img = new window.Image()
        img.decoding = "async"
        img.src = src

        const finalize = (nextDims: Dimensions) => {
          pendingRef.current.delete(idx)
          dimensionsRef.current[idx] = nextDims
          const galleryEl = document.getElementById(galleryId)
          const anchorEl = galleryEl?.querySelectorAll("a").item(idx) ?? null
          if (anchorEl) {
            anchorEl.setAttribute("data-pswp-width", String(nextDims.width))
            anchorEl.setAttribute("data-pswp-height", String(nextDims.height))
          }
          setDimensions((prev) => {
            if (prev[idx]?.width === nextDims.width && prev[idx]?.height === nextDims.height) {
              return prev
            }
            const next = [...prev]
            next[idx] = nextDims
            return next
          })
          resolve(nextDims)
        }

        img.onload = () => {
          const width = img.naturalWidth || 1600
          const height = img.naturalHeight || 1600
          finalize({ width, height })
        }
        img.onerror = () => finalize({ width: 1600, height: 1600 })
      })

      pendingRef.current.set(idx, promise)
      return promise
    },
    [galleryId, images]
  )

  useEffect(() => {
    if (count === 0) return

    let isCancelled = false

    void (async () => {
      const { default: PhotoSwipeLightbox } = await import("photoswipe/lightbox")
      if (isCancelled) return

      const lightbox = new PhotoSwipeLightbox({
        gallery: `#${galleryId}`,
        children: "a",
        pswpModule: () => import("photoswipe"),
      })

      lightbox.on("close", () => onOpenChange(false))
      lightbox.on("change", () => {
        const idx = lightbox.pswp?.currIndex
        if (typeof idx === "number") onActiveIndexChange(idx)
      })

      lightbox.init()
      lightboxRef.current = lightbox
      setIsReady(true)
    })()

    return () => {
      isCancelled = true
      setIsReady(false)
      lightboxRef.current?.destroy()
      lightboxRef.current = null
    }
  }, [count, galleryId, onActiveIndexChange, onOpenChange])

  useEffect(() => {
    const lightbox = lightboxRef.current
    if (!lightbox || !isReady || count === 0) return

    if (!open) {
      lightbox.pswp?.close()
      return
    }

    void ensureDimensions(displayIndex).then(() => {
      if (!open) return
      if (!lightbox.pswp) {
        lightbox.loadAndOpen(displayIndex)
        return
      }

      if (lightbox.pswp.currIndex !== displayIndex) {
        lightbox.pswp.goTo(displayIndex)
      }
    })
  }, [count, displayIndex, ensureDimensions, isReady, open])

  if (count === 0) return null

  return (
    <div id={galleryId} className={className} data-pswp-product={productName} hidden>
      {images.map((src, idx) => {
        const itemDims = dimensions[idx] || { width: 1600, height: 1600 }
        return (
          <a
            key={`${src}-${idx}`}
            href={src}
            data-pswp-width={itemDims.width}
            data-pswp-height={itemDims.height}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${productName} image ${idx + 1}`}
          />
        )
      })}
    </div>
  )
}
