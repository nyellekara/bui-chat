/** @jsxImportSource @blender-ui/react */
import React, { useState, useEffect } from 'react'

export function AmbientBackground({ children }) {
  const [glowPhase, setGlowPhase] = useState(0)

  useEffect(() => {
    let t = 0
    const timer = setInterval(() => {
      t = (t + 0.04) % (Math.PI * 2)
      setGlowPhase(t)
    }, 60)
    return () => clearInterval(timer)
  }, [])

  // Smooth breathing calculation
  const phase = glowPhase.value ?? 0
  const opacity = 0.22 + 0.12 * Math.sin(phase)
  const shiftX = 50 + 8 * Math.cos(phase * 0.7)
  const shiftY = 30 + 10 * Math.sin(phase * 0.5)

  const gradientStyle = {
    background: `radial-gradient(circle at ${shiftX}% ${shiftY}%, rgba(139, 92, 246, ${opacity}) 0%, rgba(30, 27, 75, ${opacity * 0.6}) 35%, #07080C 75%)`,
  }

  return (
    <div className="relative w-full h-full bg-[#07080C] text-[#F5F5F5] overflow-hidden flex flex-col">
      {/* Ambient glowing atmosphere layer */}
      <div
        className="absolute inset-0 pointer-events-none transition"
        style={gradientStyle}
      />
      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
