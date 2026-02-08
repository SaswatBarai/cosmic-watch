import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const EARTH_MAP = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg';
const EARTH_BUMP = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png';
const EARTH_SPEC = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-water.png';
const EARTH_NIGHT = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-night.jpg';

function getHazardConfig(riskScore, isHazardous, distance) {
  
  const distanceScale = distance ? Math.max(2.5, Math.min(5.5, distance / 10000000)) : 3.5;
  
  if (riskScore > 75 || (isHazardous && riskScore > 50)) {
    return {
      level: 2,
      asteroidDistance: Math.min(distanceScale, 2.8),
      asteroidSpeed: 0.12,
      asteroidColor: '#aa7055',
      asteroidEmissive: '#ff4433',
      warningRingColor: '#ff4466',
      warningRingOpacity: 0.4,
      pulseSpeed: 2,
      orbitSpeed: 1.2,
      glowColor: '#ff2244',
      glowIntensity: 0.6,
    };
  }
  if (riskScore > 50 || isHazardous) {
    return {
      level: 1,
      asteroidDistance: distanceScale * 0.9,
      asteroidSpeed: 0.08,
      asteroidColor: '#998877',
      asteroidEmissive: '#ff8833',
      warningRingColor: '#ffaa55',
      warningRingOpacity: 0.25,
      pulseSpeed: 1.2,
      orbitSpeed: 0.8,
      glowColor: '#ff8833',
      glowIntensity: 0.35,
    };
  }
  return {
    level: 0,
    asteroidDistance: distanceScale * 1.2,
    asteroidSpeed: 0.04,
    asteroidColor: '#887766',
    asteroidEmissive: '#445544',
    warningRingColor: '#66cc99',
    warningRingOpacity: 0.15,
    pulseSpeed: 0.6,
    orbitSpeed: 0.4,
    glowColor: '#55aa77',
    glowIntensity: 0.2,
  };
}

const generateStarPositions = () => {
  const starCount = 5000;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 400;
  }
  return positions;
};

const STAR_POSITIONS = generateStarPositions();

function BrightStarfield() {
  const starsRef = useRef(null);
  
  const starGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(STAR_POSITIONS, 3));
    return geo;
  }, []);

 
  const starTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
  
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <points ref={starsRef} geometry={starGeometry}>
      <pointsMaterial
        map={starTexture}
        color="#ffffff"
        size={1.5}
        transparent
        opacity={1.0}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Earth() {
  const earthRef = useRef(null);
  const cloudsRef = useRef(null);
  const atmosphereRef = useRef(null);
  
  const textures = useTexture({
    map: EARTH_MAP,
    bumpMap: EARTH_BUMP,
    specularMap: EARTH_SPEC,
    emissiveMap: EARTH_NIGHT,
  });

  
  Object.values(textures).forEach((tex) => {
    tex.anisotropy = 16;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
  });

  
  const atmosphereMat = useMemo(
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
        depthWrite: false,
      }),
    []
  );

  useFrame((state, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.015;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.02;
  });

  return (
    <group>
    
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[1.2, 128, 128]} />
        <meshPhongMaterial
          map={textures.map}
          bumpMap={textures.bumpMap}
          bumpScale={0.1}
          specularMap={textures.specularMap}
          specular={new THREE.Color('#222222')}
          emissiveMap={textures.emissiveMap}
          emissive={new THREE.Color('#ffffcc')}
          emissiveIntensity={0.5}
          shininess={8}
        />
      </mesh>

   
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.21, 96, 96]} />
        <meshPhongMaterial
          map={textures.specularMap}
          transparent
          opacity={0.25}
          depthWrite={false}
          color="#ffffff"
          side={THREE.FrontSide}
        />
      </mesh>

    
      <mesh ref={atmosphereRef} scale={1.1}>
        <sphereGeometry args={[1.2, 96, 96]} />
        <primitive object={atmosphereMat} attach="material" />
      </mesh>
    </group>
  );
}

function HazardAsteroid({ config, diameter, velocity }) {
  const asteroidRef = useRef(null);
  const trailRef = useRef(null);


  const size = useMemo(() => {
    if (!diameter || diameter === 0) {
      // Default if no data - larger default
      return 0.25;
    }
    
  
    const earthRadiusUnits = 1.2;
    const earthRadiusKm = 6371;
    const diameterKm = diameter / 1000; // meters to kilometers
    
    
    const proportionalSize = (diameterKm / earthRadiusKm) * earthRadiusUnits;
    
    
    const visibleSize = proportionalSize * 150;
    
    return Math.max(0.12, Math.min(0.7, visibleSize));
  }, [diameter]);

  const geometry = useMemo(() => {
   
    const geo = new THREE.IcosahedronGeometry(size, 3);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    
    for (let i = 0; i < pos.count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      const len = v.length();
      
     
      const n1 = Math.sin(i * 4.3 + v.x * 15) * Math.cos(i * 3.2 + v.z * 12);
      const n2 = Math.sin(i * 7.5 + v.y * 22) * Math.cos(i * 5.8 + v.x * 18);
      const n3 = Math.sin(i * 12.1) * 0.5;
      
     
      const crater = Math.sin(i * 2.7) * Math.cos(i * 1.9);
      const craterDepth = crater > 0.7 ? -0.08 : 0;
      
      const displacement = 1 + n1 * 0.22 + n2 * 0.12 + n3 * 0.06 + craterDepth;
      v.normalize().multiplyScalar(len * displacement);
      
      
      v.y *= 0.88 + Math.sin(i) * 0.1;
      v.x *= 1.05 + Math.cos(i * 1.3) * 0.08;
      
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [size]);

  
  const rotationSpeed = useMemo(() => {
    const baseSpeed = 0.008;
    const velocityFactor = velocity ? Math.min(2, velocity / 50000) : 1;
    return baseSpeed * velocityFactor;
  }, [velocity]);

  useFrame((state) => {
    if (!asteroidRef.current) return;
    const t = state.clock.elapsedTime * config.orbitSpeed;
    const angle = t * config.asteroidSpeed;
    const distance = config.asteroidDistance;
    
   
    const a = distance;
    const b = distance * 0.92; 
    asteroidRef.current.position.x = Math.cos(angle) * a;
    asteroidRef.current.position.z = Math.sin(angle) * b;
    asteroidRef.current.position.y = Math.sin(angle * 0.6 + 0.5) * 0.5;
    
    
    asteroidRef.current.rotation.x += rotationSpeed * 1.3;
    asteroidRef.current.rotation.y += rotationSpeed * 0.9;
    asteroidRef.current.rotation.z += rotationSpeed * 0.6;

    if (trailRef.current && config.level >= 1) {
      trailRef.current.position.copy(asteroidRef.current.position);
      const scale = 1 + Math.sin(t * config.pulseSpeed) * 0.15;
      trailRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      <mesh ref={asteroidRef} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={config.asteroidColor}
          emissive={config.asteroidEmissive}
          emissiveIntensity={config.level === 2 ? 0.25 : config.level === 1 ? 0.15 : 0.05}
          roughness={0.95}
          metalness={0.1}
        />
      </mesh>
      {config.level >= 1 && (
        <mesh ref={trailRef}>
          <sphereGeometry args={[size * 2.2, 16, 16]} />
          <meshBasicMaterial
            color={config.asteroidEmissive}
            transparent
            opacity={config.level === 2 ? 0.2 : 0.12}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

function WarningRings({ config }) {
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.3;
      const pulse = 1 + Math.sin(t * config.pulseSpeed) * 0.15;
      ring1Ref.current.scale.setScalar(pulse);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.2;
      const pulse = 1 + Math.sin(t * config.pulseSpeed + Math.PI) * 0.15;
      ring2Ref.current.scale.setScalar(pulse);
    }
  });

  if (config.level === 0) return null;

  return (
    <group>
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.7, 32]} />
        <meshBasicMaterial
          color={config.warningRingColor}
          transparent
          opacity={config.warningRingOpacity}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {config.level === 2 && (
        <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2.0, 32]} />
          <meshBasicMaterial
            color={config.warningRingColor}
            transparent
            opacity={config.warningRingOpacity * 0.6}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}


const generateDangerParticles = () => {
  const count = 100;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const radius = 2.5 + Math.random() * 1.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  return positions;
};

const DANGER_PARTICLES = generateDangerParticles();

function DangerParticles({ config }) {
  const particlesRef = useRef(null);
  
  const particles = useMemo(() => {
    if (config.level < 2) return null;
    return DANGER_PARTICLES;
  }, [config.level]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  if (!particles) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={config.warningRingColor}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Scene({ riskScore, isHazardous, diameter, distance, velocity }) {
  const config = useMemo(
    () => getHazardConfig(riskScore, isHazardous, distance),
    [riskScore, isHazardous, distance]
  );

  return (
    <>
      
      <BrightStarfield />
      
     
      <ambientLight intensity={0.2} color="#404040" />
      
     
      <directionalLight 
        position={[-50, 20, 50]} 
        intensity={3.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      
  
      <pointLight position={[20, 10, -30]} intensity={0.3} color="#6688aa" distance={50} />
      
      <Earth />
      <WarningRings config={config} />
      <HazardAsteroid 
        config={config} 
        diameter={diameter} 
        velocity={velocity}
      />
      <DangerParticles config={config} />

    
      <Sphere args={[1.38, 32, 32]}>
        <meshBasicMaterial
          color={config.glowColor}
          transparent
          opacity={config.glowIntensity * 0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={12}
        autoRotate={false}
        maxPolarAngle={Math.PI * 0.95}
        minPolarAngle={Math.PI * 0.05}
      />
    </>
  );
}

export default function EarthHazardView({
  riskScore = 0,
  isHazardous = false,
  diameter,
  distance,
  velocity,
  className = '',
}) {
  return (
    <div
      className={className}
      style={{ width: '100%', height: '100%', minHeight: '320px', background: 'transparent' }}
    >
      <Canvas
        camera={{ position: [0, 2, 5.5], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
          outputColorSpace: THREE.SRGBColorSpace
        }}
        dpr={[1, 2]}
        shadows
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene 
            riskScore={riskScore} 
            isHazardous={isHazardous} 
            diameter={diameter}
            distance={distance}
            velocity={velocity}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
