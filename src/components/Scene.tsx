"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, PerspectiveCamera, PointerLockControls } from "@react-three/drei";
import { Suspense, useRef, useState, useCallback } from "react";
import { Beat } from "../types/beat";
import * as THREE from 'three';
import React from "react";

// Global constants
const PLAYER_HEIGHT = -1; // Fixed player height - change this value to adjust camera height
const ROOM_SIZE = 19; // Half of the room size (40/2 - 1 for safety margin)

// Move hitmarker sound outside of component to avoid recreation
const hitmarkerSound = new Audio('/sounds/hitmarker.wav');
hitmarkerSound.volume = 0.2;

interface SceneProps {
  beats: Beat[];
  onBeatSelect: (beat: Beat) => void;
  activeBeat?: Beat;
}

// Add this before the Scene component
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

function Room() {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Front wall */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, 20]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 0, -20]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-20, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[20, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </>
  )
}

function Sky() {
  return (
    <group>
      {/* Sky dome */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[100, 32, 32]} />
        <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
      </mesh>

      {/* Sun with light */}
      <group position={[20, 15, 20]}>
        {/* Sun mesh */}
        <mesh>
          <sphereGeometry args={[2, 128, 127]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
        {/* Sun light */}
        <pointLight
          color="#FFD700"
          intensity={1}
          distance={100}
          decay={1}
        />
      </group>

    </group>
  );
}

function BeatSneaker({ beat, position, isActive, onClick }: { beat: Beat; position: [number, number, number]; isActive: boolean; onClick: () => void }) {
  return (
    <group position={position} onClick={onClick}>
      {/* Black holder */}
      <mesh position={[0, 2.6, -3.5]}>
        <boxGeometry args={[1, 0.2, 1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      {/* Sneaker box */}
      <mesh scale={isActive ? 1.1 : 1} position={[0, 3, -3.5]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial
          color={isActive ? '#ff3366' : '#ffffff'}
          emissive={isActive ? '#ff3366' : '#000000'}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
      </mesh>
    </group>
  );
}

function SneakerWall({ beats, onBeatSelect, activeBeat }: SceneProps) {
  const rows = 5;
  const columns = 5;
  const spacing = 3; // Increased spacing between sneakers

  return (
    <group position={[0, 0, -16]}> {/* Moved wall closer to camera */}
      {beats.map((beat, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const x = (col - (columns - 1) / 2) * spacing;
        const y = (row - (rows - 1) / 2) * spacing;
        
        return (
          <BeatSneaker
            key={beat.id}
            beat={beat}
            position={[x, y, 0]}
            isActive={activeBeat?.id === beat.id}
            onClick={() => onBeatSelect(beat)}
          />
        );
      })}
    </group>
  );
}

function Player({ children, onLockChange }: { children: React.ReactNode; onLockChange: (locked: boolean) => void }) {
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const controlsRef = useRef<any>(null);

  // Add keyboard event listeners
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          setMoveForward(true);
          break;
        case 'KeyS':
          setMoveBackward(true);
          break;
        case 'KeyA':
          setMoveLeft(true);
          break;
        case 'KeyD':
          setMoveRight(true);
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          setMoveForward(false);
          break;
        case 'KeyS':
          setMoveBackward(false);
          break;
        case 'KeyA':
          setMoveLeft(false);
          break;
        case 'KeyD':
          setMoveRight(false);
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((state) => {
    const { camera } = state;
    velocity.current.x -= velocity.current.x * 10.0 * 0.016;
    velocity.current.z -= velocity.current.z * 10.0 * 0.016;

    // Get camera's forward direction
    direction.current.set(0, 0, -1).applyQuaternion(camera.quaternion);
    
    // Calculate movement based on camera direction
    if (moveForward || moveBackward) {
      const distance = moveForward ? 0.1 : -0.1;
      const newPosition = camera.position.clone().addScaledVector(direction.current, distance);
      
      // Check boundaries before applying movement
      if (Math.abs(newPosition.x) <= ROOM_SIZE && Math.abs(newPosition.z) <= ROOM_SIZE) {
        camera.position.copy(newPosition);
      }
    }
    
    if (moveLeft || moveRight) {
      // Get camera's right direction
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
      const distance = moveRight ? 0.1 : -0.1;
      const newPosition = camera.position.clone().addScaledVector(right, distance);
      
      // Check boundaries before applying movement
      if (Math.abs(newPosition.x) <= ROOM_SIZE && Math.abs(newPosition.z) <= ROOM_SIZE) {
        camera.position.copy(newPosition);
      }
    }

    // Maintain fixed height
    camera.position.y = PLAYER_HEIGHT;
  });

  return (
    <>
      <PointerLockControls
        ref={controlsRef}
        onLock={() => {
          document.body.style.cursor = 'crosshair';
          document.body.style.userSelect = 'none';
          onLockChange(true);
        }}
        onUnlock={() => {
          document.body.style.cursor = 'auto';
          document.body.style.userSelect = 'auto';
          onLockChange(false);
        }}
        selector="canvas"
      />
      {/* Change initial camera position here: [x, y, z] */}
      {/* x: left/right, y: up/down, z: forward/backward */}
      <PerspectiveCamera makeDefault position={[0, PLAYER_HEIGHT, 5]} />
      {children}
    </>
  );
}

function CoordinateSystem() {
  return (
    <primitive object={new THREE.AxesHelper(5)} />
  );
}

function Hitmarker({ show }: { show: boolean }) {
  if (!show) return null;
  
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 text-white text-2xl font-bold animate-hitmarker">
      ×
    </div>
  );
}

export default function Scene({ beats, onBeatSelect, activeBeat }: SceneProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [showHitmarker, setShowHitmarker] = useState(false);
  const [hitmarkerEnabled, setHitmarkerEnabled] = useLocalStorage('hitmarkerEnabled', false);

  const handleClick = useCallback(() => {
    if (isLocked && hitmarkerEnabled) {
      setShowHitmarker(true);
      hitmarkerSound.currentTime = 0;
      hitmarkerSound.play();
      setTimeout(() => setShowHitmarker(false), 100);
    }
  }, [isLocked, hitmarkerEnabled]);

  React.useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick]);

  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [0, PLAYER_HEIGHT, 5], fov: 75 }}>
        <color attach="background" args={['#87CEEB']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        
        {/* Environment */}
        <Player onLockChange={setIsLocked}>
          <Room />
          <Sky />
          <SneakerWall beats={beats} onBeatSelect={onBeatSelect} activeBeat={activeBeat} />
        </Player>
        
        <Environment preset="city" />
      </Canvas>

      {/* Custom Cursor */}
      {isLocked && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 border border-white rounded-full pointer-events-none" />
      )}

      {/* Hitmarker */}
      <Hitmarker show={showHitmarker} />

      {/* Movement Instructions */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-[2px] shadow-sm flex justify-center items-center">
        {!isLocked ? (
          <span className="text-white/80 text-xs">Click to start</span>
        ) : (
          <div className="flex items-center space-x-6">
            <span className="text-white/80 text-xs">WASD to move</span>
            <span className="text-white/80 text-xs">Mouse to look</span>
            <span className="text-white/80 text-xs">← → to skip</span>
            <span className="text-white/80 text-xs">↑ ↓ for volume</span>
            <span className="text-white/80 text-xs">ESC to exit</span>
          </div>
        )}
      </div>
    </div>
  );
}