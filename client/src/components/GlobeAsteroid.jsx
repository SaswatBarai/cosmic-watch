import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Float } from '@react-three/drei';
import * as THREE from 'three';


const EARTH_MAP   = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg';
const EARTH_BUMP  = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png';
const EARTH_SPEC  = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-water.png';
const EARTH_NIGHT = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-night.jpg';




function EarthTextured() {
  const earthRef = useRef(null);
  const cloudRef = useRef(null);

  const textures = useTexture({
    map: EARTH_MAP,
    bumpMap: EARTH_BUMP,
    specularMap: EARTH_SPEC,
    emissiveMap: EARTH_NIGHT,
  });

  
  Object.values(textures).forEach((tex) => {
    tex.anisotropy = 16;
    tex.colorSpace = THREE.SRGBColorSpace;
  });

  useFrame((_, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.06;
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.08;
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.4, 128, 128]} />
        <meshPhongMaterial
          map={textures.map}
          bumpMap={textures.bumpMap}
          bumpScale={0.04}
          specularMap={textures.specularMap}
          specular={new THREE.Color('#222222')}
          shininess={15}
          emissiveMap={textures.emissiveMap}
          emissive={new THREE.Color('#ffbb55')}
          emissiveIntensity={0.05}
        />
      </mesh>

      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.425, 64, 64]} />
        <meshPhongMaterial
          map={textures.specularMap}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  );
}


function EarthFallback() {
  const ref = useRef(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.06;
  });
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshPhongMaterial
          color="#0c4a6e"
          emissive="#0a3050"
          emissiveIntensity={0.5}
          transparent opacity={0.9}
          wireframe
        />
      </mesh>
      <mesh scale={1.2}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshBasicMaterial color="#4488ff" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function Earth() {
  return (
    <Suspense fallback={<EarthFallback />}>
      <EarthTextured />
    </Suspense>
  );
}


const ASTEROID_COLORS = [
  { color: '#9e9080', emissive: '#3a2e20' },
  { color: '#7a7268', emissive: '#2a2218' },
  { color: '#b0a090', emissive: '#4a3a28' },
  { color: '#686058', emissive: '#201a14' },
  { color: '#8a7e70', emissive: '#352a1e' },
];

function Asteroid({ orbitRadius, speed, angleOffset, size, yTilt, inclination = 0 }) {
  const groupRef = useRef(null);
  const meshRef = useRef(null);
  const trailRef = useRef(null);

  const seed = orbitRadius * 100 + angleOffset * 10 + size * 1000;
  const colorIdx = Math.abs(Math.floor(seed)) % ASTEROID_COLORS.length;
  const { color, emissive } = ASTEROID_COLORS[colorIdx];

  
  const geometry = useMemo(() => {
    const detail = size > 0.09 ? 3 : 2;
    const geo = new THREE.IcosahedronGeometry(size, detail);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      const orig = v.length();

      
      const n1 = Math.sin(seed + v.x * 12 + v.y * 8) * Math.cos(seed + v.z * 10 + v.x * 6);
      
      const n2 = Math.sin(seed * 1.3 + v.x * 25 + v.z * 18) * Math.cos(seed * 0.7 + v.y * 22);
      
      const n3 = Math.sin(seed * 2.1 + v.y * 40 + v.x * 35) * 0.5;

      const displacement = 1 + n1 * 0.18 + n2 * 0.1 + n3 * 0.04;

      
      const squash = 0.85 + Math.sin(seed) * 0.15;

      v.normalize().multiplyScalar(orig * displacement);
      v.y *= squash;

      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [size, seed]);

  
  const trailGeo = useMemo(() => {
    const count = 20;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    // Use deterministic sizes based on index instead of random
    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      // Deterministic size variation based on index
      sizes[i] = 0.005 + (i % 10) * 0.002;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed + angleOffset;
    const r = orbitRadius;
    const x = Math.cos(t) * r;
    const z = Math.sin(t) * r * 0.55;
    const y = Math.sin(t * 0.8 + inclination) * yTilt;

    meshRef.current.position.set(x, y, z);
    meshRef.current.rotation.x += 0.012;
    meshRef.current.rotation.z += 0.008;
    meshRef.current.rotation.y += 0.005;

    
    if (trailRef.current) {
      const tp = trailRef.current.geometry.attributes.position;
      for (let i = 0; i < tp.count; i++) {
        const spread = (i / tp.count) * 0.3;
        const tOff = t - spread * 2;
        tp.setXYZ(i,
          Math.cos(tOff) * r + (Math.sin(seed + i * 5) * 0.05),
          y + (Math.cos(seed + i * 3) * 0.04),
          Math.sin(tOff) * r * 0.55 + (Math.sin(seed + i * 7) * 0.05),
        );
      }
      tp.needsUpdate = true;
    }
  });

  const isLarge = size > 0.09;

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.15}
          metalness={isLarge ? 0.12 : 0.04}
          roughness={0.95}
          flatShading
        />
      </mesh>
      <points ref={trailRef} geometry={trailGeo}>
        <pointsMaterial
          size={0.015}
          color="#a09888"
          transparent
          opacity={0.35}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}


function OrbitPath({ radius, dashScale = 1 }) {
  const lineGeo = useMemo(() => {
    const pts = [];
    const segments = 256;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius * 0.55,
      ));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  useEffect(() => () => lineGeo.dispose(), [lineGeo]);

  return (
    <lineLoop>
      <primitive object={lineGeo} attach="geometry" />
      <lineDashedMaterial
        color="#7c6cf6"
        transparent
        opacity={0.1}
        dashSize={0.3 * dashScale}
        gapSize={0.15 * dashScale}
      />
    </lineLoop>
  );
}


function Stars() {
  const ref = useRef(null);
  const COUNT = 2500;

  const [geo] = useState(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      sizes[i] = Math.random() * 0.08 + 0.02;
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return g;
  });

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.003;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.06}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}


function HazardAsteroid() {
  const meshRef = useRef(null);
  const glowRef = useRef(null);
  const trailRef = useRef(null);
  const TRAIL_COUNT = 40;

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.16, 3);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      const orig = v.length();
      const n1 = Math.sin(i * 3.7 + v.x * 15) * Math.cos(i * 2.1 + v.z * 12);
      const n2 = Math.sin(i * 7.3 + v.y * 25) * 0.5;
      v.normalize().multiplyScalar(orig * (1 + n1 * 0.22 + n2 * 0.08));
      v.y *= 0.82;
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  const trailGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(TRAIL_COUNT * 3);
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * 0.3 + 2.5;
    const x = Math.cos(t) * 1.9;
    const z = Math.sin(t) * 1.15;
    const y = Math.sin(t * 0.6) * 0.3;

    meshRef.current.position.set(x, y, z);
    meshRef.current.rotation.x += 0.018;
    meshRef.current.rotation.z += 0.012;

    
    if (glowRef.current) {
      glowRef.current.position.set(x, y, z);
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      glowRef.current.scale.setScalar(pulse);
    }

    
    if (trailRef.current) {
      const tp = trailRef.current.geometry.attributes.position;
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const age = (i / TRAIL_COUNT) * 0.6;
        const tOff = t - age * 1.5;
        tp.setXYZ(i,
          Math.cos(tOff) * 1.9 + Math.sin(i * 4.3) * 0.03 * age,
          y + Math.cos(i * 3.1) * 0.025 * age,
          Math.sin(tOff) * 1.15 + Math.sin(i * 5.7) * 0.03 * age,
        );
      }
      tp.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color="#aa3333"
          emissive="#ff4411"
          emissiveIntensity={0.5}
          metalness={0.2}
          roughness={0.75}
          flatShading
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color="#ff4422"
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <points ref={trailRef} geometry={trailGeo}>
        <pointsMaterial
          size={0.025}
          color="#ff6633"
          transparent
          opacity={0.5}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}


function Scene() {
  const groupRef = useRef(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.015;
  });

  const asteroids = useMemo(() => [
    
    { orbitRadius: 2.3, speed: 0.28,  angleOffset: 0,              size: 0.09,  yTilt: 0.3,   inclination: 0 },
    { orbitRadius: 2.3, speed: 0.28,  angleOffset: Math.PI,        size: 0.07,  yTilt: 0.2,   inclination: 0.5 },
    { orbitRadius: 2.3, speed: 0.28,  angleOffset: Math.PI * 0.66, size: 0.08,  yTilt: -0.25, inclination: 1.0 },
    { orbitRadius: 2.3, speed: 0.28,  angleOffset: Math.PI * 1.4,  size: 0.06,  yTilt: 0.15,  inclination: 1.8 },
    
    { orbitRadius: 2.9, speed: 0.16,  angleOffset: 0.5,            size: 0.13,  yTilt: 0.5,   inclination: 0.3 },
    { orbitRadius: 2.9, speed: 0.16,  angleOffset: Math.PI + 0.5,  size: 0.08,  yTilt: -0.4,  inclination: 0.8 },
    { orbitRadius: 2.9, speed: 0.16,  angleOffset: Math.PI * 1.3,  size: 0.10,  yTilt: 0.35,  inclination: 1.5 },
    { orbitRadius: 2.9, speed: 0.16,  angleOffset: 3.8,            size: 0.07,  yTilt: -0.3,  inclination: 2.0 },
    
    { orbitRadius: 3.6, speed: 0.09,  angleOffset: 1.2,            size: 0.15,  yTilt: 0.7,   inclination: 0.2 },
    { orbitRadius: 3.6, speed: 0.09,  angleOffset: Math.PI + 1.2,  size: 0.09,  yTilt: -0.6,  inclination: 1.2 },
    { orbitRadius: 3.6, speed: 0.09,  angleOffset: Math.PI * 0.5,  size: 0.11,  yTilt: 0.45,  inclination: 0.7 },
    { orbitRadius: 3.6, speed: 0.09,  angleOffset: 5.2,            size: 0.08,  yTilt: -0.35, inclination: 1.6 },
  ], []);

  return (
    <>
    
      <ambientLight intensity={0.08} />
      <directionalLight position={[5, 2, 4]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-4, 1, -3]} intensity={0.3} color="#334488" />
      <pointLight position={[-3, -2, 4]} intensity={0.3} color="#22d3ee" />
      <pointLight position={[3, 3, -2]} intensity={0.2} color="#8b5cf6" />

      <Stars />

      <group ref={groupRef} rotation={[0.25, 0, 0.08]}>
        <Float speed={0.8} rotationIntensity={0} floatIntensity={0.3} floatingRange={[-0.05, 0.05]}>
          <Earth />
        </Float>

        <OrbitPath radius={2.3} dashScale={0.8} />
        <OrbitPath radius={2.9} dashScale={1} />
        <OrbitPath radius={3.6} dashScale={1.2} />

        <HazardAsteroid />

        {asteroids.map((a, i) => (
          <Asteroid key={i} {...a} />
        ))}
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  );
}


export default function GlobeAsteroid({ className = '' }) {
  return (
    <div className={className} style={{ width: '100%', height: '100%', minHeight: '320px' }}>
      <Canvas
        camera={{ position: [0, 0.8, 5.8], fov: 40 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
