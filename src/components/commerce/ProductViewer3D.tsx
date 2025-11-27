"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stage, useGLTF } from "@react-three/drei"
import { Suspense } from "react"

interface ProductViewer3DProps {
  modelPath: string
}

function Model({ path }: { path: string }) {
  const { scene } = useGLTF(path)
  return <primitive object={scene} />
}

export default function ProductViewer3D({ modelPath }: ProductViewer3DProps) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <Suspense fallback={null}>
        <Stage
          intensity={0.8}
          environment="city"
          shadows="contact"
          adjustCamera={false}
        >
          <Model path={modelPath} />
        </Stage>
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Suspense>
    </Canvas>
  )
}
