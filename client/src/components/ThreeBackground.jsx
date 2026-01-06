import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars, Trail, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/**
 * GOD-LEVEL 3D Animated Background
 * Stunning visual effects with particles, orbs, and cosmic elements
 */

// Cosmic Gradient Orb - Main attraction
const CosmicOrb = ({ position = [0, 0, 0], color1 = "#6366f1", color2 = "#8b5cf6", scale = 1.5 }) => {
    const meshRef = useRef();
    const materialRef = useRef();
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
        }
        if (materialRef.current) {
            materialRef.current.distort = 0.3 + Math.sin(state.clock.elapsedTime) * 0.1;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
            <Trail width={3} length={6} color={color1} attenuation={(t) => t * t}>
                <Sphere ref={meshRef} args={[1, 128, 128]} position={position} scale={scale}>
                    <MeshDistortMaterial
                        ref={materialRef}
                        color={color1}
                        attach="material"
                        distort={0.4}
                        speed={2}
                        roughness={0.1}
                        metalness={0.9}
                        emissive={color2}
                        emissiveIntensity={0.2}
                    />
                </Sphere>
            </Trail>
        </Float>
    );
};

// Floating Mini Orbs
const FloatingOrbs = ({ count = 15 }) => {
    const orbs = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            position: [
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 6 - 2
            ],
            scale: Math.random() * 0.3 + 0.1,
            speed: Math.random() * 0.5 + 0.3,
            color: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'][Math.floor(Math.random() * 5)]
        }));
    }, [count]);

    return (
        <>
            {orbs.map((orb, i) => (
                <MiniOrb key={i} {...orb} />
            ))}
        </>
    );
};

const MiniOrb = ({ position, scale, speed, color }) => {
    const meshRef = useRef();
    const initialPos = useMemo(() => [...position], [position]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = initialPos[1] + Math.sin(state.clock.elapsedTime * speed + initialPos[0]) * 0.5;
            meshRef.current.position.x = initialPos[0] + Math.cos(state.clock.elapsedTime * speed * 0.5) * 0.2;
            meshRef.current.rotation.x = state.clock.elapsedTime * speed;
            meshRef.current.rotation.z = state.clock.elapsedTime * speed * 0.5;
        }
    });

    return (
        <Float speed={speed * 2} floatIntensity={0.5}>
            <Sphere ref={meshRef} args={[1, 32, 32]} position={position} scale={scale}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                    roughness={0.2}
                    metalness={0.8}
                    transparent
                    opacity={0.8}
                />
            </Sphere>
        </Float>
    );
};

// Particle Wave System
const ParticleWave = ({ count = 1000 }) => {
    const meshRef = useRef();
    
    const { positions, colors } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const color1 = new THREE.Color('#6366f1');
        const color2 = new THREE.Color('#8b5cf6');
        
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const radius = Math.random() * 10 + 3;
            pos[i * 3] = Math.cos(theta) * radius;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
            pos[i * 3 + 2] = Math.sin(theta) * radius - 5;
            
            const mixFactor = Math.random();
            const mixedColor = color1.clone().lerp(color2, mixFactor);
            col[i * 3] = mixedColor.r;
            col[i * 3 + 1] = mixedColor.g;
            col[i * 3 + 2] = mixedColor.b;
        }
        return { positions: pos, colors: col };
    }, [count]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.03;
            const positions = meshRef.current.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                positions[i3 + 1] += Math.sin(state.clock.elapsedTime + i * 0.01) * 0.002;
            }
            meshRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.03} vertexColors transparent opacity={0.8} sizeAttenuation />
        </points>
    );
};

// Glowing Ring
const GlowRing = ({ position = [0, 0, -3], scale = 4 }) => {
    const meshRef = useRef();
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.PI * 0.5 + Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
            meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
        }
    });

    return (
        <mesh ref={meshRef} position={position} scale={scale}>
            <torusGeometry args={[1, 0.02, 16, 100]} />
            <meshStandardMaterial
                color="#8b5cf6"
                emissive="#6366f1"
                emissiveIntensity={2}
                transparent
                opacity={0.6}
            />
        </mesh>
    );
};

// Camera animation
const CameraRig = () => {
    const { camera } = useThree();
    
    useFrame((state) => {
        camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
        camera.position.y = Math.cos(state.clock.elapsedTime * 0.15) * 0.3;
        camera.lookAt(0, 0, 0);
    });
    
    return null;
};

// Main Scene
const Scene = ({ variant = 'default' }) => {
    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
            <spotLight position={[0, 10, 0]} intensity={0.5} color="#a855f7" angle={0.5} />
            
            <CameraRig />
            
            {/* Star field */}
            <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
            
            {/* Sparkles */}
            <Sparkles count={100} scale={15} size={2} speed={0.4} color="#8b5cf6" />
            
            {/* Main cosmic orb */}
            <CosmicOrb position={[0, 0, -2]} scale={1.2} />
            
            {/* Floating mini orbs */}
            <FloatingOrbs count={20} />
            
            {/* Particle wave */}
            <ParticleWave count={800} />
            
            {/* Glow rings */}
            <GlowRing position={[0, 0, -2]} scale={3} />
            <GlowRing position={[0, 0, -3]} scale={4.5} />
            
            {/* Fog for depth */}
            <fog attach="fog" args={['#0a0a0f', 5, 25]} />
        </>
    );
};

// Login variant - More minimal
const LoginScene = () => {
    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color="#6366f1" />
            <pointLight position={[-5, -5, -5]} intensity={0.8} color="#a855f7" />
            
            <Stars radius={30} depth={30} count={1500} factor={3} saturation={0} fade speed={0.5} />
            <Sparkles count={50} scale={10} size={1.5} speed={0.3} color="#a855f7" />
            
            <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
                <Sphere args={[2, 64, 64]} position={[3, 0, -5]}>
                    <MeshDistortMaterial color="#6366f1" distort={0.3} speed={1.5} roughness={0.2} metalness={0.8} />
                </Sphere>
            </Float>
            
            <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
                <Sphere args={[1.5, 64, 64]} position={[-4, 2, -6]}>
                    <MeshDistortMaterial color="#8b5cf6" distort={0.4} speed={2} roughness={0.2} metalness={0.8} />
                </Sphere>
            </Float>
            
            <fog attach="fog" args={['#0a0a0f', 3, 20]} />
        </>
    );
};

// Main Export Component
const ThreeBackground = ({ variant = 'default', className = '' }) => {
    return (
        <div className={`fixed inset-0 -z-10 ${className}`} style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)' }}>
            <Canvas
                camera={{ position: [0, 0, 8], fov: 45 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
            >
                <Suspense fallback={null}>
                    {variant === 'login' ? <LoginScene /> : <Scene variant={variant} />}
                </Suspense>
            </Canvas>
            
            {/* Overlay gradient for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none" />
        </div>
    );
};

export default ThreeBackground;

// Additional export for simple usage
export const SimpleBackground = () => (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]">
        <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
    </div>
);
