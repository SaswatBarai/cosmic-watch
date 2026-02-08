import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const EARTH_MAP = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg';
const EARTH_NIGHT = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-night.jpg';
const EARTH_BUMP = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png';

// Generate star positions outside component
const generateStars = () => {
  const starCount = 4000;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 1200;
  }
  return positions;
};

const STAR_POSITIONS = generateStars();

function Starfield() {
  const starGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(STAR_POSITIONS, 3));
    return geo;
  }, []);

  return (
    <points geometry={starGeo}>
      <pointsMaterial
        color={0xffffff}
        size={1.5}
        transparent
        opacity={1.0}
        sizeAttenuation
      />
    </points>
  );
}

function EarthFallback() {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.001;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[5, 32, 32]} />
      <meshPhongMaterial
        color={0x0c4a6e}
        emissive={0x0a3050}
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
}

function Earth() {
  const earthRef = useRef();
  const textures = useTexture({
    map: EARTH_MAP,
    bumpMap: EARTH_BUMP,
    emissiveMap: EARTH_NIGHT,
  });

  Object.values(textures).forEach((tex) => {
    tex.anisotropy = 16;
    tex.colorSpace = THREE.SRGBColorSpace;
  });

  const atmosMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 6.0);
            gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
      }),
    []
  );

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshPhongMaterial
          map={textures.map}
          bumpMap={textures.bumpMap}
          bumpScale={0.1}
          emissiveMap={textures.emissiveMap}
          emissive={new THREE.Color(0xaaccff)}
          emissiveIntensity={0.5}
          shininess={8}
          color={0xbbeeff}
        />
      </mesh>
      <mesh scale={1.1}>
        <sphereGeometry args={[5, 64, 64]} />
        <primitive object={atmosMat} attach="material" />
      </mesh>
    </group>
  );
}

// Generate asteroid orbital parameters outside component
const generateAsteroidData = () => {
  const asteroidCount = 12;
  return Array.from({ length: asteroidCount }, () => ({
    size: 0.15 + Math.random() * 0.25,
    a: 12 + Math.random() * 8,
    e: 0.1 + Math.random() * 0.4,
    inc: (Math.random() - 0.5) * 0.8,
    speed: 0.05 + Math.random() * 0.1,
    phase: Math.random() * Math.PI * 2,
  }));
};

const ASTEROID_DATA = generateAsteroidData();

function Asteroid({ data }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const angle = t * data.speed + data.phase;
    const r = (data.a * (1 - data.e * data.e)) / (1 + data.e * Math.cos(angle));

    meshRef.current.position.x = r * Math.cos(angle);
    meshRef.current.position.z = r * Math.sin(angle) * Math.cos(data.inc);
    meshRef.current.position.y = r * Math.sin(angle) * Math.sin(data.inc);

    meshRef.current.rotation.x += 0.005;
    meshRef.current.rotation.y += 0.005;
  });

  return (
    <mesh ref={meshRef} scale={data.size}>
      <dodecahedronGeometry args={[1, 2]} />
      <meshStandardMaterial color={0x777777} flatShading roughness={0.9} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} color={0x88aacc} />
      <directionalLight position={[-50, 20, 50]} intensity={3.5} color={0xffffff} />

      <Starfield />
      <Suspense fallback={<EarthFallback />}>
        <Earth />
      </Suspense>
      {ASTEROID_DATA.map((data, i) => (
        <Asteroid key={i} data={data} />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.15}
        enablePan={false}
        minDistance={15}
        maxDistance={60}
      />
    </>
  );
}

export default function SatelliteEarthView({ className = '' }) {
  return (
    <div className={className} style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <Canvas
        camera={{ position: [0, 10, 35], fov: 35 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
