"use client"

import { useGLTF, Stage, OrbitControls, PerspectiveCamera, Environment, Grid } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"

function Model(props: any) {
  const { scene } = useGLTF("/assets/3d/arm/arm.glb")
  return <primitive object={scene} {...props} />
}

export default function HeroArm({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[5, 3.5, 5]} fov={40} />
          
          {/* Blueprint Grid Floor (Light Mode) */}
          <Grid 
            position={[0, -0.5, 0]} 
            args={[10, 10]} 
            cellSize={0.5} 
            cellThickness={0.5} 
            cellColor="#e2e8f0" // Slate-200
            sectionSize={3} 
            sectionThickness={1} 
            sectionColor="#0e7490" // Cyan-700
            fadeDistance={30} 
            fadeStrength={1}
          />

          <Stage
            environment="city"
            intensity={0.8}
            shadows="contact"
            adjustCamera={false}
          >
            <Model scale={0.85} />
          </Stage>

          <OrbitControls 
            autoRotate 
            autoRotateSpeed={0.8}
            enableZoom={false} 
            enablePan={false}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2} 
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Preload the model
useGLTF.preload("/assets/3d/arm/arm.glb")