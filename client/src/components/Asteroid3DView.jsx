import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Hazard level: 0 = safe, 1 = warning, 2 = critical
function getHazardLevel(riskScore, isHazardous) {
  if (riskScore > 75 || isHazardous && riskScore > 50) return 2;
  if (riskScore > 50 || isHazardous) return 1;
  return 0;
}

function HazardAsteroid({ riskScore = 0, isHazardous = false, diameter = 500 }) {
  const meshRef = useRef(null);
  const glowRef = useRef(null);
  const level = getHazardLevel(riskScore, isHazardous);

  const config = useMemo(() => {
    if (level === 2) {
      return {
        color: '#cc3344',
        emissive: '#660011',
        emissiveIntensity: 0.4,
        rotationSpeed: 0.08,
        scale: 1.2,
        wireframe: false,
        pulseScale: 1.08,
        glowColor: '#ff4466',
        glowOpacity: 0.35,
      };
    }
    if (level === 1) {
      return {
        color: '#c97a2a',
        emissive: '#4a2a0a',
        emissiveIntensity: 0.25,
        rotationSpeed: 0.04,
        scale: 1,
        wireframe: false,
        pulseScale: 1.03,
        glowColor: '#e89540',
        glowOpacity: 0.2,
      };
    }
    return {
      color: '#5a9a7a',
      emissive: '#0d2a1a',
      emissiveIntensity: 0.12,
      rotationSpeed: 0.015,
      scale: 0.9,
      wireframe: false,
      pulseScale: 1.01,
      glowColor: '#6ab88a',
      glowOpacity: 0.12,
    };
  }, [level]);

  const seed = useMemo(() => (riskScore * 7 + (isHazardous ? 100 : 0)) % 10000, [riskScore, isHazardous]);
  const size = useMemo(() => Math.min(0.5, 0.15 + (diameter || 0) / 5000), [diameter]);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(size * config.scale, 2);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      const orig = v.length();
      const n1 = Math.sin(seed + v.x * 12 + v.y * 8) * Math.cos(seed + v.z * 10);
      const n2 = Math.sin(seed * 1.3 + v.x * 25) * Math.cos(seed * 0.7 + v.y * 22);
      const displacement = 1 + n1 * 0.2 + n2 * 0.08;
      v.normalize().multiplyScalar(orig * displacement);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [size, config.scale, seed]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * config.rotationSpeed * 0.7;
    meshRef.current.rotation.y = t * config.rotationSpeed;
    meshRef.current.rotation.z = t * config.rotationSpeed * 0.5;
    if (level >= 1) {
      const pulse = 1 + Math.sin(t * 2) * (config.pulseScale - 1);
      meshRef.current.scale.setScalar(pulse);
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = config.glowOpacity * (0.85 + Math.sin(t * 1.5) * 0.15);
    }
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhongMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={config.emissiveIntensity}
          shininess={level === 2 ? 40 : 20}
          specular={new THREE.Color('#333333')}
          wireframe={config.wireframe}
        />
      </mesh>
      {(level >= 1) && (
        <mesh ref={glowRef} scale={1.4}>
          <sphereGeometry args={[size * config.scale, 32, 32]} />
          <meshBasicMaterial
            color={config.glowColor}
            transparent
            opacity={config.glowOpacity}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

function Scene({ riskScore, isHazardous, diameter }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-3, -2, 2]} intensity={0.5} color="#4488ff" />
      <HazardAsteroid riskScore={riskScore} isHazardous={isHazardous} diameter={diameter} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        autoRotate={false}
        minDistance={2}
        maxDistance={8}
      />
    </>
  );
}

export default function Asteroid3DView({ riskScore = 0, isHazardous = false, diameter, className = '' }) {
  return (
    <div className={className} style={{ width: '100%', height: '100%', minHeight: '280px', background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene riskScore={riskScore} isHazardous={isHazardous} diameter={diameter} />
        </Suspense>
      </Canvas>
    </div>
  );
}
