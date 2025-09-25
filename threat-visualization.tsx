"use client" // Mark as client component

import { useRef, useEffect, useState, useCallback } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

interface Threat {
  id: string
  position: [number, number, number]
  type: "motion" | "presence"
  level: "low" | "medium" | "high"
}

export default function ThreatVisualization() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [threats, setThreats] = useState<Threat[]>([])
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const threatMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map())

  const addThreat = useCallback((threat: Threat) => {
    if (!sceneRef.current) return

    const geometry = new THREE.SphereGeometry(0.2, 32, 32)
    let material: THREE.MeshBasicMaterial

    switch (threat.level) {
      case "low":
        material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.7 }) // Green
        break
      case "medium":
        material = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.7 }) // Yellow
        break
      case "high":
        material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.7 }) // Red
        break
      default:
        material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
    }

    const sphere = new THREE.Mesh(geometry, material)
    sphere.position.set(threat.position[0], threat.position[1], threat.position[2])
    sceneRef.current.add(sphere)
    threatMeshesRef.current.set(threat.id, sphere)

    // Add a pulsing animation
    const initialScale = sphere.scale.x
    const pulseSpeed = 0.05
    const pulseMagnitude = 0.2

    const animatePulse = () => {
      if (sphere.parent) {
        // Check if sphere is still in the scene
        const scale = initialScale + Math.sin(Date.now() * pulseSpeed) * pulseMagnitude
        sphere.scale.set(scale, scale, scale)
        requestAnimationFrame(animatePulse)
      }
    }
    animatePulse()
  }, [])

  const removeThreat = useCallback((threatId: string) => {
    if (sceneRef.current) {
      const mesh = threatMeshesRef.current.get(threatId)
      if (mesh) {
        sceneRef.current.remove(mesh)
        threatMeshesRef.current.delete(threatId)
        mesh.geometry.dispose()
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose())
        } else {
          mesh.material.dispose()
        }
      }
    }
  }, [])

  useEffect(() => {
    if (!mountRef.current) return

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene
    scene.background = new THREE.Color(0x1a1a2e) // Dark background for the visualization

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    )
    cameraRef.current = camera
    camera.position.set(5, 5, 5)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    rendererRef.current = renderer
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    mountRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controlsRef.current = controls
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.maxPolarAngle = Math.PI / 2

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(1, 1, 1).normalize()
    scene.add(directionalLight)

    // Load a placeholder 3D floor plan model (replace with actual floor plan)
    const loader = new GLTFLoader()
    loader.load(
      "/placeholder.glb",
      (gltf) => {
        // Using a placeholder GLB model
        gltf.scene.scale.set(2, 2, 2)
        gltf.scene.position.set(0, -1, 0)
        scene.add(gltf.scene)
      },
      undefined,
      (error) => {
        console.error("An error occurred while loading the GLTF model:", error)
        // Fallback: create a simple grid if model fails to load
        const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x888888)
        scene.add(gridHelper)
        const planeGeometry = new THREE.PlaneGeometry(10, 10)
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide })
        const plane = new THREE.Mesh(planeGeometry, planeMaterial)
        plane.rotation.x = Math.PI / 2
        scene.add(plane)
      },
    )

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (mountRef.current && cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
      }
    }
    window.addEventListener("resize", handleResize)

    // Simulate threat data
    const threatSimulationInterval = setInterval(() => {
      const newThreats: Threat[] = []
      // Simulate new threats appearing
      if (Math.random() < 0.7) {
        const id = `threat-${Date.now()}-${Math.random()}`
        const position: [number, number, number] = [
          Math.random() * 8 - 4,
          Math.random() * 2 + 0.5,
          Math.random() * 8 - 4,
        ]
        const type = Math.random() > 0.5 ? "motion" : "presence"
        const level = Math.random() > 0.7 ? "high" : Math.random() > 0.3 ? "medium" : "low"
        newThreats.push({ id, position, type, level })
      }

      // Add new threats
      newThreats.forEach((threat) => addThreat(threat))
      setThreats((prev) => [...prev, ...newThreats])

      // Simulate threats disappearing after some time
      setThreats((prev) => {
        const updatedThreats = prev.filter((threat) => {
          if (Math.random() < 0.1) {
            // 10% chance to remove a threat
            removeThreat(threat.id)
            return false
          }
          return true
        })
        return updatedThreats
      })
    }, 2000) // Update every 2 seconds

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement)
      }
      if (rendererRef.current) rendererRef.current.dispose()
      if (controlsRef.current) controlsRef.current.dispose()
      clearInterval(threatSimulationInterval)
      // Dispose of all threat meshes
      threatMeshesRef.current.forEach((mesh) => {
        if (sceneRef.current) sceneRef.current.remove(mesh)
        mesh.geometry.dispose()
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose())
        } else {
          mesh.material.dispose()
        }
      })
      threatMeshesRef.current.clear()
    }
  }, [addThreat, removeThreat])

  return (
    <div ref={mountRef} className="w-full h-[600px] relative overflow-hidden rounded-lg">
      <div className="absolute top-4 left-4 z-10 p-2 bg-card/80 backdrop-blur-sm rounded-md text-sm text-muted-foreground">
        Threats Detected: <span className="font-bold text-primary">{threats.length}</span>
      </div>
    </div>
  )
}
