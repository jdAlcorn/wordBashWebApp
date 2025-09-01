import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Tile {
  letter: string;
  points: number;
  id: string;
}

interface ThreeGameBoardProps {
  onTilePlaced?: (row: number, col: number, tile: Tile) => void;
}

export function ThreeGameBoard({ onTilePlaced }: ThreeGameBoardProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const [hand, setHand] = useState<Tile[]>([]);

  // Generate random hand of 7 tiles
  const generateRandomHand = (): Tile[] => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const points = [1, 3, 3, 2, 1, 4, 2, 4, 1, 8, 5, 1, 3, 1, 1, 3, 10, 1, 1, 1, 1, 4, 4, 8, 4, 10];
    
    return Array.from({ length: 7 }, (_, i) => {
      const letterIndex = Math.floor(Math.random() * letters.length);
      return {
        letter: letters[letterIndex],
        points: points[letterIndex],
        id: `tile-${i}-${Date.now()}`
      };
    });
  };

  useEffect(() => {
    setHand(generateRandomHand());
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.7);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create game board (15x15 grid)
    const boardSize = 15;
    const tileSize = 0.8;
    const spacing = 1;

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const geometry = new THREE.BoxGeometry(tileSize, 0.1, tileSize);
        const material = new THREE.MeshLambertMaterial({ 
          color: (row + col) % 2 === 0 ? 0x8B4513 : 0xA0522D 
        });
        const tile = new THREE.Mesh(geometry, material);
        
        tile.position.set(
          (col - boardSize / 2) * spacing,
          0,
          (row - boardSize / 2) * spacing
        );
        tile.receiveShadow = true;
        
        scene.add(tile);
      }
    }

    // Create hand tiles
    hand.forEach((tile, index) => {
      const geometry = new THREE.BoxGeometry(0.7, 0.2, 0.7);
      const material = new THREE.MeshLambertMaterial({ color: 0xF5DEB3 });
      const tileMesh = new THREE.Mesh(geometry, material);
      
      tileMesh.position.set(
        (index - 3) * 1.2,
        0.5,
        8
      );
      tileMesh.castShadow = true;
      tileMesh.userData = { tile, onTilePlaced }; // Store for future click handling
      
      // Add letter text (simplified - in real implementation you'd use TextGeometry)
      const textGeometry = new THREE.PlaneGeometry(0.4, 0.4);
      const textMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x000000,
        transparent: true
      });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(0, 0.11, 0);
      textMesh.rotation.x = -Math.PI / 2;
      tileMesh.add(textMesh);
      
      scene.add(tileMesh);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.7);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [hand]);

  return (
    <div className="flex flex-col items-center">
      <div ref={mountRef} className="border border-gray-300 rounded-lg" />
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Your Hand:</h3>
        <div className="flex gap-2">
          {hand.map((tile) => (
            <div key={tile.id} className="bg-yellow-100 border border-yellow-300 rounded p-2 text-center">
              <div className="font-bold text-xl">{tile.letter}</div>
              <div className="text-xs text-gray-600">{tile.points}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
