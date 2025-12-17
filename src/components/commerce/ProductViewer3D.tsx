"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stage, useGLTF } from "@react-three/drei"
import { Suspense, useState, useEffect } from "react"
import { Box } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductViewer3DProps {
  modelPath: string
  previewUrl?: string
  previewAlt?: string
}

function Model({ path, onLoad }: { path: string; onLoad: () => void }) {
  const { scene } = useGLTF(path)

  useEffect(() => {
    // Once the model is loaded and the scene is available, trigger onLoad
    if (scene) {
      onLoad()
    }
  }, [scene, onLoad])

  return <primitive object={scene} />
}

export default function ProductViewer3D({
  modelPath,
}: ProductViewer3DProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      role="img"
      aria-label="Interactive 3D product viewer - use mouse to rotate and zoom"
    >
      {/* Loading indicator */}
      {!isLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center z-20 bg-gradient-to-br from-slate-50 to-slate-100"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Box className="w-10 h-10 text-cyan-700" />
              <div
                className="absolute inset-0 w-10 h-10 border-2 border-slate-200 border-t-cyan-700 rounded-full animate-spin"
                aria-hidden="true"
              />
            </div>
            <p className="text-sm font-mono text-slate-500">
              Loading 3D Model...
            </p>
          </div>
        </div>
      )}

      {/* 3D Canvas - always rendered, opacity transitions when loaded */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} aria-hidden="true">
          <Suspense fallback={null}>
            <Stage
              intensity={0.8}
              environment="city"
              shadows="contact"
              adjustCamera={false}
            >
              <Model path={modelPath} onLoad={() => setIsLoaded(true)} />
            </Stage>
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.5}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}
