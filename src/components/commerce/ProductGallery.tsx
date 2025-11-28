"use client"

import { Button } from "@/components/ui/button"
import { Box, Image as ImageIcon } from "lucide-react"
import dynamic from "next/dynamic"
import { useState } from "react"

// Lazy load the 3D component
const ProductViewer3D = dynamic(() => import("./ProductViewer3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-cyan-700 font-mono text-xs space-y-2">
      <div className="w-12 h-12 border border-cyan-700 border-t-cyan-400 animate-spin rounded-full" />
      <span>Loading 3D model...</span>
    </div>
  ),
})

interface ProductGalleryProps {
  images?: string[]
  modelPath?: string
  productName: string
}

export function ProductGallery({
  images = [],
  modelPath,
  productName,
}: ProductGalleryProps) {
  const [view, setView] = useState<"3d" | "images">(modelPath ? "3d" : "images")
  const [selectedImage, setSelectedImage] = useState(0)

  // Placeholder thumbnails if no images provided
  const thumbnails = images.length
    ? images
    : ["Assembled", "Components", "Electronics", "In Action"]

  return (
    <div className="space-y-4">
      {/* Main Display */}
      <div className="relative aspect-square bg-white rounded border border-slate-200 overflow-hidden">
        {/* View Toggle */}
        {modelPath && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              variant={view === "3d" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("3d")}
              className={`font-mono text-xs ${
                view === "3d"
                  ? "bg-cyan-700 text-white"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              <Box className="w-4 h-4 mr-1" />
              3D
            </Button>
            <Button
              variant={view === "images" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("images")}
              className={`font-mono text-xs ${
                view === "images"
                  ? "bg-cyan-700 text-white"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              Photos
            </Button>
          </div>
        )}

        {/* Content */}
        {view === "3d" && modelPath ? (
          <ProductViewer3D modelPath={modelPath} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="w-24 h-24 mb-4 rounded-full bg-slate-200 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-slate-500 font-mono text-sm">{productName}</p>
            <p className="text-slate-500 text-xs mt-1">
              {typeof thumbnails[selectedImage] === "string"
                ? thumbnails[selectedImage]
                : `View ${selectedImage + 1}`}
            </p>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2">
        {/* 3D Thumbnail (if model available) */}
        {modelPath && (
          <button
            onClick={() => setView("3d")}
            className={`flex-1 aspect-square rounded border overflow-hidden transition-all cursor-pointer ${
              view === "3d"
                ? "border-cyan-700 ring-2 ring-cyan-700/20 bg-cyan-50"
                : "border-slate-200 hover:border-slate-300 bg-slate-50"
            }`}
          >
            <div className="w-full h-full flex flex-col items-center justify-center">
              <Box className={`w-4 h-4 mb-0.5 ${view === "3d" ? "text-cyan-700" : "text-slate-500"}`} />
              <span className={`text-[10px] font-mono ${view === "3d" ? "text-cyan-700" : "text-slate-500"}`}>
                3D
              </span>
            </div>
          </button>
        )}
        {/* Image Thumbnails */}
        {thumbnails.map((thumb, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedImage(idx)
              setView("images")
            }}
            className={`flex-1 aspect-square rounded border overflow-hidden transition-all cursor-pointer ${
              selectedImage === idx && view === "images"
                ? "border-cyan-700 ring-2 ring-cyan-700/20"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
              <span className="text-slate-500 text-[10px] font-mono">
                {typeof thumb === "string" ? thumb : `View ${idx + 1}`}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
