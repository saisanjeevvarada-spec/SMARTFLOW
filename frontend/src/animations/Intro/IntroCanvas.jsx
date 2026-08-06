import React, { useEffect, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import Lighting from './Lighting'
import Background from './Background'
import ThinRing from './ThinRing'
import LightSweep from './LightSweep'
import Letters3D from './Letters3D'
import SmartFlowLogo from '../../components/common/SmartFlowLogo'

const initialLetterStates = {
  S: { x: -3.4, y: 5.5, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1, glow: 0 },
  M: { x: 6, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1, glow: 0 },
  A: { x: -1.7, y: 0, z: 0, rotX: Math.PI, rotY: Math.PI * 2, rotZ: 0, scale: 1, glow: 0 },
  R: { x: -6.5, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1, glow: 0 },
  T: { x: 0, y: 5.5, z: 0, rotX: 0, rotY: 0, rotZ: 0.25, scale: 1, glow: 0 },
  F: { x: 0.85, y: 0, z: 0, rotX: 0, rotY: 1.2, rotZ: 0.8, scale: 1, glow: 0 },
  L: { x: 1.7, y: -4.5, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1, glow: 0 },
  O: { x: 0, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: -Math.PI * 2, scale: 1, glow: 0 },
  W: { x: 3.4, y: 4.5, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1.4, glow: 0 },
}

const targetLetterStates = {
  S: { x: -3.4, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1, glow: 0 },
  M: { x: -2.55, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1, glow: 0 },
  A: { x: -1.7, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1, glow: 0 },
  R: { x: -0.85, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1, glow: 0 },
  T: { x: 0, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1, glow: 0 },
  F: { x: 0.85, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1, glow: 0 },
  L: { x: 1.7, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1, glow: 0 },
  O: { x: 2.55, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1, glow: 0 },
  W: { x: 3.4, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1, glow: 0 },
}

export default function IntroCanvas({ onComplete, children }) {
  const [letterStates, setLetterStates] = useState(initialLetterStates)
  const [ringProgress, setRingProgress] = useState(0)
  const [showRing, setShowRing] = useState(true)
  const [lightSweepProgress, setLightSweepProgress] = useState(0)
  const [showSweep, setShowSweep] = useState(false)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [isDocked, setIsDocked] = useState(false)
  const [introFinished, setIntroFinished] = useState(false)

  const statesRef = useRef(initialLetterStates)

  const playAnimation = () => {
    setLetterStates(initialLetterStates)
    statesRef.current = initialLetterStates
    setRingProgress(0)
    setShowRing(true)
    setLightSweepProgress(0)
    setShowSweep(false)
    setShowSubtitle(false)
    setIsDocked(false)
    setIntroFinished(false)

    const tl = gsap.timeline({
      onComplete: () => {
        setIntroFinished(true)
        if (onComplete) onComplete()
      }
    })

    // Phase 1: Thin Ring appear and rotate quickly (0.05s delay, 0.35s duration)
    tl.to({}, {
      duration: 0.35,
      delay: 0.05,
      onUpdate: function () {
        setRingProgress(this.progress())
      },
      onComplete: () => setShowRing(false)
    })

    // Helper to animate letter state with swift visual presence
    const animateLetter = (char, duration, ease, delayOverlap = 0.14) => {
      const start = initialLetterStates[char]
      const target = targetLetterStates[char]
      const cur = { ...start }

      tl.to(cur, {
        ...target,
        glow: 1,
        duration: duration,
        ease: ease,
        onUpdate: () => {
          statesRef.current = {
            ...statesRef.current,
            [char]: { ...cur }
          }
          setLetterStates({ ...statesRef.current })
        },
        onComplete: () => {
          gsap.to(cur, {
            glow: 0,
            duration: 0.2,
            onUpdate: () => {
              statesRef.current = {
                ...statesRef.current,
                [char]: { ...cur }
              }
              setLetterStates({ ...statesRef.current })
            }
          })
        }
      }, `-=${delayOverlap}`)
    }

    // Phase 2: Fast sequential letter arrivals
    // S drops from above
    animateLetter('S', 0.25, 'bounce.out', 0)
    // M slides from right
    animateLetter('M', 0.22, 'power3.out', 0.14)
    // A rotates into place
    animateLetter('A', 0.25, 'back.out(1.5)', 0.14)
    // R slides from left
    animateLetter('R', 0.22, 'power2.out', 0.14)
    // T drops vertically
    animateLetter('T', 0.22, 'bounce.out', 0.14)
    // F rotates gently
    animateLetter('F', 0.20, 'power1.out', 0.12)
    // L rises from below
    animateLetter('L', 0.22, 'power3.out', 0.14)
    // O rolls into place
    animateLetter('O', 0.25, 'power2.inOut', 0.14)
    // W lands last
    animateLetter('W', 0.26, 'elastic.out(1, 0.6)', 0.14)

    // Phase 3: Fast Light Sweep across letters (0.6s duration)
    tl.to({}, {
      duration: 0.6,
      onStart: () => setShowSweep(true),
      onUpdate: function () {
        setLightSweepProgress(this.progress())
      },
      onComplete: () => setShowSweep(false)
    })

    // Phase 4: Subtitle quick fade-in (0.25s)
    tl.to({}, {
      duration: 0.25,
      onStart: () => setShowSubtitle(true)
    })

    // Brief pause (0.15s)
    tl.to({}, { duration: 0.15 })

    // Phase 5: Smooth dock into topbar (0.45s)
    tl.to({}, {
      duration: 0.45,
      onStart: () => setIsDocked(true)
    })
  }

  useEffect(() => {
    playAnimation()
  }, [])

  return (
    <div className="intro-orchestrator-shell" style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden', backgroundColor: '#ffffff' }}>



      {/* 3D R3F Canvas Layer */}
      <motion.div
        className="intro-canvas-container"
        animate={isDocked ? {
          scale: 0.36,
          x: -290,
          y: -215,
          opacity: 0
        } : {
          scale: 1,
          x: 0,
          y: 0,
          opacity: 1
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: isDocked ? 10 : 100,
          pointerEvents: 'none'
        }}
      >
        <Canvas
          shadows
          camera={{ position: [0, 0, 7.5], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
        >
          <Background />
          <Lighting />
          <ThinRing visible={showRing} progress={ringProgress} />
          <LightSweep active={showSweep} progress={lightSweepProgress} />
          <Letters3D letterStates={letterStates} lightSweepProgress={lightSweepProgress} />
        </Canvas>
      </motion.div>

      {/* Subtitle "AI Powered Inventory Management System" */}
      <AnimatePresence>
        {showSubtitle && !isDocked && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '62%',
              left: 0,
              width: '100%',
              textAlign: 'center',
              zIndex: 101,
              pointerEvents: 'none'
            }}
          >
            <p style={{
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              fontSize: '1.05rem',
              fontWeight: '600',
              letterSpacing: '0.22em',
              color: '#2563eb',
              textTransform: 'uppercase',
              margin: 0
            }}>
              AI Powered Inventory Management System
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seamless Login / App Content Fade-In */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isDocked ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
        style={{
          position: 'relative',
          zIndex: 20,
          width: '100%',
          minHeight: '100vh'
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
