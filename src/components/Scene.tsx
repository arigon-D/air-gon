"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { Suspense, useState } from "react";
import { playBeat } from "@/player/sound";

export default function Scene(){
    const [clicked, setClicked] = useState(false);
    return(
        <Canvas style={{ width: "100%", height: "100vh" }}>
            {/* Lichtquellen */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />

            {/* Klickbares 3D-Objekt */}
            <Suspense fallback={null}>
                <Sphere 
                    args={[1, 32, 32]} 
                    position={[0, 1, 0]}
                    onClick={() => {
                        setClicked(!clicked);
                        playBeat();
                    }}
                >
                    <meshStandardMaterial color={clicked ? "red" : "blue"} />
                </Sphere>
            </Suspense>

            {/* Kamera-Steuerung */}
            <OrbitControls />
        </Canvas>
    )
}