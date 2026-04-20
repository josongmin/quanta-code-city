/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { MOCK_NODES, THEME } from '../constants';
import { CodeNode } from '../types';

interface WorldProps {
  onNodeFocus: (node: CodeNode | null) => void;
}

const World: React.FC<WorldProps> = ({ onNodeFocus }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const workerRef = useRef<THREE.Group | null>(null);
  const nodesGroupRef = useRef<THREE.Group | null>(null);
  
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const activeNodeIndexRef = useRef(0);
  const targetFocalPoint = useRef(new THREE.Vector3(0, 0, 0));
  const cameraOrbitRadius = useRef(60);
  const cameraOrbitHeight = useRef(35);

  useEffect(() => {
    activeNodeIndexRef.current = activeNodeIndex;
  }, [activeNodeIndex]);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(THEME.sky);
    scene.fog = new THREE.Fog(THEME.sky, 60, 250);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(30, 60, 30);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(20, 40, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // --- Floor / Grid ---
    const gridHelper = new THREE.GridHelper(100, 50, THEME.grid, THEME.grid);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: THEME.bg });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    // --- Nodes (Buildings) ---
    const nodesGroup = new THREE.Group();
    nodesGroupRef.current = nodesGroup;
    scene.add(nodesGroup);

    const nodePositions: Record<string, THREE.Vector3> = {};

    MOCK_NODES.forEach((node, index) => {
      const group = new THREE.Group();
      
      // Calculate position in a larger grid
      const gridCols = 4;
      const spacing = 20;
      const x = (index % gridCols) * spacing - ((gridCols - 1) * spacing) / 2;
      const z = Math.floor(index / gridCols) * spacing - ((gridCols - 1) * spacing) / 2;
      group.position.set(x, 0, z);
      nodePositions[node.id] = new THREE.Vector3(x, 0, z);

      // 1. Building Height (LoC) - Stacked Blocks
      const height = node.loc / 100;
      const blockSize = 2;
      const numBlocks = Math.max(1, Math.ceil(height / blockSize));
      const isMessy = node.solidViolations > 3 || node.risk > 0.6 || node.techDebt > 0.6 || node.complexity > 50;
      const isWireframe = node.testCoverage < 0.3;

      for (let i = 0; i < numBlocks; i++) {
        const blockGeo = new THREE.BoxGeometry(4, blockSize - 0.1, 4); // Small gap between blocks
        
        const blockMat = new THREE.MeshStandardMaterial({
          color: node.isDead ? THEME.ghost : (isWireframe ? '#94A3B8' : THEME.buildingBase),
          transparent: node.isDead || isWireframe,
          opacity: node.isDead ? 0.3 : (isWireframe ? 0.4 : 1),
        });
        const blockMesh = new THREE.Mesh(blockGeo, blockMat);
        blockMesh.castShadow = true;
        blockMesh.receiveShadow = true;

        let offsetX = 0;
        let offsetZ = 0;
        let rotX = 0;
        let rotY = 0;
        let rotZ = 0;

        if (isMessy) {
          // Intensify randomness for messy code, increasing with height
          const intensity = 0.5 + (i / numBlocks) * 1.5;
          offsetX = (Math.random() - 0.5) * intensity;
          offsetZ = (Math.random() - 0.5) * intensity;
          rotX = (Math.random() - 0.5) * 0.2 * intensity;
          rotY = (Math.random() - 0.5) * 0.5 * intensity;
          rotZ = (Math.random() - 0.5) * 0.2 * intensity;
        }

        const baseHeight = i * blockSize + blockSize / 2;
        blockMesh.position.set(offsetX, baseHeight, offsetZ);
        blockMesh.rotation.set(rotX, rotY, rotZ);
        group.add(blockMesh);

        // --- Building Block Animation (Floating blocks) ---
        gsap.to(blockMesh.position, {
          y: baseHeight + (Math.random() * 0.4 + 0.1),
          duration: 1.5 + Math.random() * 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 2
        });
      }

      // 3. SOLID Violations (Tilt)
      if (node.solidViolations > 5) {
        group.rotation.z = Math.PI / 8;
      } else if (node.solidViolations > 0) {
        group.rotation.z = (node.solidViolations / 10) * (Math.PI / 8);
      }

      // 2. Risk (Fire) - Muted and subtler
      if (node.risk > 0.5) {
        const fireParticles = new THREE.Group();
        const fireCount = node.risk > 0.8 ? 30 : 15; 
        for (let i = 0; i < fireCount; i++) {
          const sizeRandom = Math.random() * 0.3 + 0.15;
          const p = new THREE.Mesh(
            new THREE.SphereGeometry(sizeRandom, 4, 4),
            new THREE.MeshBasicMaterial({ 
              color: i % 3 === 0 ? THEME.fire : (i % 3 === 1 ? '#ffcc00' : '#ff4400'), 
              transparent: true 
            })
          );
          const startY = Math.random() * height;
          const range = 1.5 + node.risk * 1.5; 
          p.position.set(
            (Math.random() - 0.5) * range,
            startY,
            (Math.random() - 0.5) * range
          );
          fireParticles.add(p);
          
          gsap.to(p.position, {
            y: startY + 3 + Math.random() * 3,
            x: p.position.x + (Math.random() - 0.5) * 1.5,
            z: p.position.z + (Math.random() - 0.5) * 1.5,
            duration: 1.2 + Math.random(), 
            repeat: -1,
            ease: "power1.out",
            delay: Math.random()
          });
          gsap.fromTo(p.scale, { x: 1.2, y: 1.2, z: 1.2 }, {
             x: 0, y: 0, z: 0,
             duration: 1.2 + Math.random(),
             repeat: -1,
             ease: "none",
             delay: Math.random()
          });
          gsap.to(p.material, {
            opacity: 0,
            duration: 1.2 + Math.random(),
            repeat: -1,
            ease: "none",
            delay: Math.random()
          });
        }
        group.add(fireParticles);
      }

      // --- Lightning Visual (For severe issues) ---
      if (node.blastRadius > 0.7 || node.securityLeak || node.risk > 0.8) {
        const lightningGroup = new THREE.Group();
        
        const createBolt = () => {
          const boltPoints = [];
          let currentPos = new THREE.Vector3((Math.random() - 0.5) * 4, height + 10, (Math.random() - 0.5) * 4);
          boltPoints.push(currentPos.clone());
          
          const segments = 5;
          for (let i = 0; i < segments; i++) {
            currentPos.x += (Math.random() - 0.5) * 3;
            currentPos.y -= (height + 10) / segments;
            currentPos.z += (Math.random() - 0.5) * 3;
            boltPoints.push(currentPos.clone());
          }
          
          const boltGeo = new THREE.BufferGeometry().setFromPoints(boltPoints);
          const boltMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
          const bolt = new THREE.Line(boltGeo, boltMat);
          lightningGroup.add(bolt);
          
          gsap.to(boltMat, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
              lightningGroup.remove(bolt);
              boltGeo.dispose();
              boltMat.dispose();
            }
          });
        };

        const strikeLoop = () => {
          if (!sceneRef.current) return;
          createBolt();
          setTimeout(strikeLoop, Math.random() * 3000 + 500);
        };
        strikeLoop();
        group.add(lightningGroup);
      }

      // --- Security Leak Visual (PII flying up) ---
      if (node.securityLeak) {
        const leakGroup = new THREE.Group();
        const piiLabels = ['USER_NAME', 'PHONE_NUM', 'SSN', 'EMAIL', 'ADDRESS', 'CREDIT_CARD'];
        const dataCount = 12;
        
        for (let i = 0; i < dataCount; i++) {
          const text = piiLabels[i % piiLabels.length];
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 64;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.9)'; // Alarm red leakage
            ctx.font = 'bold 30px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(text, 128, 40);
          }
          const texture = new THREE.CanvasTexture(canvas);
          const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
          const sprite = new THREE.Sprite(spriteMat);
          sprite.scale.set(3, 0.75, 1);
          
          const startX = (Math.random() - 0.5) * 5;
          const startZ = (Math.random() - 0.5) * 5;
          sprite.position.set(startX, Math.random() * height, startZ);
          leakGroup.add(sprite);

          gsap.to(sprite.position, {
            y: height + 25 + Math.random() * 25,
            x: startX + (Math.random() - 0.5) * 15,
            z: startZ + (Math.random() - 0.5) * 15,
            duration: 8 + Math.random() * 4, // Much slower
            repeat: -1,
            ease: "power1.in",
            delay: Math.random() * 5
          });
          
          gsap.to(spriteMat, {
            opacity: 0,
            duration: 8 + Math.random() * 4, // Matches position duration
            repeat: -1,
            ease: "power2.in",
            delay: Math.random() * 5
          });
        }
        group.add(leakGroup);
      }

      // --- Building Name Label (Enhanced with Hints) ---
      const canvas = document.createElement('canvas');
      canvas.width = 1024; // Wider canvas for more text space
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
          const isBad = node.securityLeak || node.risk > 0.7 || node.ifNesting > 8 || node.techDebt > 0.7 || node.isDead || node.isGodClass || node.blastRadius > 0.8;
          const labelColor = isBad ? '#FF4444' : THEME.neonBlue; // Red for bad
          const alertColor = '#FF4444'; // Red for alerts

          // Background (Semi-transparent)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.roundRect(0, 0, 1024, 256, 20);
          ctx.fill();
          
          // NO THICK SOLID BORDER (Removed strokeRect)
          
          ctx.fillStyle = labelColor;
          ctx.font = 'bold 64px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(node.name, 512, 80);

          let hint = '';
          if (node.securityLeak) hint = '[SECURITY LEAK!!]';
          else if (node.isGodClass) hint = '[GOD CLASS / RED ALERT]';
          else if (node.blastRadius > 0.8) hint = '[CRITICAL BLAST RADIUS]';
          else if (node.ifNesting > 8) hint = '[IF-STATEMENT HELL]';
          else if (node.isDead) hint = '[DEAD CODE / GHOST]';
          else if (node.risk > 0.7) hint = '[CRITICAL RISK]';
          else if (node.aiGenerated) hint = '[AI SLOP DETECTED]';
          else if (node.heuristicLevel > 0.7) hint = '[HEURISTIC GUESSING]';
          else hint = '[SECTOR OPTIMAL]';

          ctx.font = '32px monospace';
          ctx.fillStyle = isBad ? alertColor : '#1E293B';
          ctx.fillText(hint, 512, 140);
          
          ctx.font = '24px monospace';
          ctx.fillStyle = '#64748B';
          ctx.fillText(`LOC: ${node.loc} | NEST: ${node.ifNesting} | BLAST: ${node.blastRadius.toFixed(1)}`, 512, 190);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const labelMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const label = new THREE.Sprite(labelMat);
      label.scale.set(12, 3, 1); // Larger scale to match 1024px width
      label.position.set(0, height + 4, 0);
      group.add(label);

      // --- Special "GOD CLASS" Aerial Label (Sky-high) ---
      if (node.isGodClass) {
        const skyLabelCanvas = document.createElement('canvas');
        skyLabelCanvas.width = 512;
        skyLabelCanvas.height = 128;
        const skyCtx = skyLabelCanvas.getContext('2d');
        if (skyCtx) {
          skyCtx.fillStyle = '#FFC107'; // Golden Yellow
          skyCtx.font = 'bold 80px monospace';
          skyCtx.textAlign = 'center';
          skyCtx.shadowColor = 'rgba(0,0,0,0.5)';
          skyCtx.shadowBlur = 10;
          skyCtx.fillText('GOD CLASS', 256, 80);
        }
        const skyTexture = new THREE.CanvasTexture(skyLabelCanvas);
        const skyLabelSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: skyTexture, transparent: true }));
        skyLabelSprite.scale.set(10, 2.5, 1);
        skyLabelSprite.position.set(0, height + 15, 0); // Very high up
        group.add(skyLabelSprite);
      }

      // --- AI Generated Visual (Dual-Mode Autonomous Drones) ---
      if (node.aiGenerated) {
        const droneGroup = new THREE.Group();
        // ONLY ONE RED DRONE (at BigBallOfMud, id '7')
        const isMalicious = node.id === '7';
        const droneColor = isMalicious ? 0xff0000 : 0x00ccff;
        const droneCount = 1; // Only one drone per building as requested
        
        for (let i = 0; i < droneCount; i++) {
          const droneHost = new THREE.Group();
          const drone = new THREE.Group();
          
          // Sleek aerodynamic body (Larger if red)
          const scaleMult = isMalicious ? 2 : 1;
          const dBody = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.3 * scaleMult, 0.6 * scaleMult, 4, 8),
            new THREE.MeshStandardMaterial({ 
              color: isMalicious ? 0x000000 : 0xffffff, 
              emissive: droneColor,
              emissiveIntensity: 0.8,
              metalness: 1.0, 
              roughness: 0.05 
            })
          );
          dBody.rotation.x = Math.PI / 2;
          drone.add(dBody);
          
          // Sensor eye
          const dEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.15 * scaleMult, 8, 8),
            new THREE.MeshBasicMaterial({ color: droneColor })
          );
          dEye.position.z = 0.45 * scaleMult;
          drone.add(dEye);
          
          // Pulsing animation for the sensor
          gsap.to(dEye.material, { opacity: 0.3, duration: isMalicious ? 0.4 : 1.2, repeat: -1, yoyo: true });

          // Initial positioning
          const angle = Math.random() * Math.PI * 2;
          const radius = isMalicious ? 10 : 8;
          droneHost.position.set(
            Math.cos(angle) * radius,
            height * 0.7,
            Math.sin(angle) * radius
          );
          
          droneHost.add(drone);
          droneGroup.add(droneHost);
          
          if (isMalicious) {
            // RED BOT (Aggressive but controlled): Active scanning, no chaotic spin
            gsap.to(droneHost.position, {
              y: "+=3",
              duration: 2,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut"
            });
            
            // Random scanning movements
            const scan = () => {
              if (!sceneRef.current) return;
              gsap.to(droneHost.position, {
                x: (Math.random() - 0.5) * 15,
                z: (Math.random() - 0.5) * 15,
                duration: 2,
                ease: "power2.inOut",
                onComplete: () => setTimeout(scan, Math.random() * 1000 + 1000)
              });
              
              // Look at a point on the building
              drone.lookAt(0, height * Math.random(), 0);
            };
            scan();

            // Subtle roll instead of chaotic spin
            gsap.to(drone.rotation, {
              z: 0.2,
              duration: 0.5,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut"
            });
          } else {
            // BLUE BOT (Constructive): Smooth, focused movement
            gsap.to(droneHost.position, {
              y: droneHost.position.y + 2,
              duration: 4,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut"
            });

            // Smoothly orbit
            gsap.to(droneGroup.rotation, {
              y: Math.PI * 2,
              duration: 15,
              repeat: -1,
              ease: "none"
            });
            
            drone.lookAt(0, height / 2, 0);
          }
        }
        group.add(droneGroup);
      }

      // 6. Tech Debt (Trash and Clutter)
      if (node.techDebt > 0.6) {
        const trashGroup = new THREE.Group();
        for (let i = 0; i < 5; i++) {
          const trash = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x4B3621 }) // Brownish "trash"
          );
          trash.position.set(
            (Math.random() - 0.5) * 4,
            0.25,
            (Math.random() - 0.5) * 4
          );
          trash.rotation.set(Math.random(), Math.random(), Math.random());
          trashGroup.add(trash);
        }
        group.add(trashGroup);
      }

      // 8. Memory Leak (Leaking Pipes)
      if (node.memoryLeak) {
        // Puddle
        const puddle = new THREE.Mesh(
          new THREE.CircleGeometry(4, 16),
          new THREE.MeshBasicMaterial({ color: '#3B82F6', transparent: true, opacity: 0.4 })
        );
        puddle.rotation.x = -Math.PI / 2;
        puddle.position.y = 0.05;
        group.add(puddle);

        // Pipe
        const pipe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 2),
          new THREE.MeshStandardMaterial({ color: 0x888888 })
        );
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set(2, height / 2, 0);
        group.add(pipe);

        // Dripping particles
        const dripGroup = new THREE.Group();
        for (let i = 0; i < 3; i++) {
          const drip = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: '#3B82F6' }));
          drip.position.set(2, height / 2, 0);
          dripGroup.add(drip);
          gsap.to(drip.position, {
            y: 0.1,
            duration: 1 + Math.random(),
            repeat: -1,
            delay: i * 0.3,
            ease: "bounce.out"
          });
        }
        group.add(dripGroup);
      }

      // 11. Duplication (Cloned sub-blocks)
      if (node.duplication > 0.4) {
        const clone = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.MeshStandardMaterial({ color: THEME.buildingBase, wireframe: true })
        );
        clone.position.set(3, 1, 0);
        group.add(clone);
        gsap.to(clone.rotation, { y: Math.PI * 2, duration: 10, repeat: -1, ease: "none" });
      }

      // 9. Bus Factor
      if (node.busFactor === 0) {
          // Bus
          const bus = new THREE.Group();
          const busBody = new THREE.Mesh(
              new THREE.BoxGeometry(6, 3, 3),
              new THREE.MeshStandardMaterial({ color: 0xffcc00 })
          );
          bus.add(busBody);

          // Windows
          const windowMat = new THREE.MeshStandardMaterial({ color: 0x33ccff, transparent: true, opacity: 0.6 });
          const frontWindow = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.5), windowMat);
          frontWindow.position.set(-3.05, 0.5, 0);
          frontWindow.rotation.y = -Math.PI / 2;
          bus.add(frontWindow);

          for (let i = 0; i < 2; i++) {
            const sideWindow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1), windowMat);
            sideWindow.position.set(i * 2 - 1, 0.5, 1.55);
            bus.add(sideWindow);
            const sideWindow2 = sideWindow.clone();
            sideWindow2.position.z = -1.55;
            sideWindow2.rotation.y = Math.PI;
            bus.add(sideWindow2);
          }

          // Lights
          const lightGeo = new THREE.SphereGeometry(0.2);
          const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const light1 = new THREE.Mesh(lightGeo, lightMat);
          light1.position.set(-3, -0.5, 1);
          bus.add(light1);
          const light2 = light1.clone();
          light2.position.z = -1;
          bus.add(light2);

          // Wheels
          const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 3.2);
          const wheel1 = new THREE.Mesh(wheelGeo, new THREE.MeshStandardMaterial({ color: 0x000000 }));
          wheel1.rotation.z = Math.PI/2;
          wheel1.position.set(2, -1.2, 0);
          bus.add(wheel1);
          const wheel2 = wheel1.clone();
          wheel2.position.set(-2, -1.2, 0);
          bus.add(wheel2);

          bus.position.set(8, 1.5, 0);
          group.add(bus);
          
          // Hero (Flattened)
          const hero = new THREE.Group();
          const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 2), new THREE.MeshStandardMaterial({ color: 0xffd700 }));
          hero.add(torso);
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.4), new THREE.MeshStandardMaterial({ color: 0xffd700 }));
          head.position.z = 1.2;
          hero.add(head);

          hero.position.set(8, 0.1, 3.5);
          group.add(hero);

          // Bus Factor Label
          const bfCanvas = document.createElement('canvas');
          bfCanvas.width = 256;
          bfCanvas.height = 64;
          const bfCtx = bfCanvas.getContext('2d');
          if (bfCtx) {
            bfCtx.fillStyle = 'rgba(15, 23, 42, 0.9)'; // Dark slate background
            bfCtx.roundRect(0, 0, 256, 64, 10);
            bfCtx.fill();
            bfCtx.fillStyle = '#ffffff';
            bfCtx.font = 'bold 24px monospace';
            bfCtx.textAlign = 'center';
            bfCtx.fillText(`BUS FACTOR: ${node.busFactor}`, 128, 40);
          }
          const bfTexture = new THREE.CanvasTexture(bfCanvas);
          const bfSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: bfTexture, transparent: true }));
          bfSprite.scale.set(4, 1, 1);
          bfSprite.position.set(8, 2, 4);
          group.add(bfSprite);

          // Animation: Bus moving slightly
          gsap.to(bus.position, { x: 9, duration: 2, repeat: -1, yoyo: true, ease: "power1.inOut" });
      }

      // Label (using Group but HUD will handle UI)
      nodesGroup.add(group);
    });

    // --- Dependency Wires (High overhead) ---
    MOCK_NODES.forEach((node) => {
      const fromPos = nodePositions[node.id];
      const fromHeight = node.loc / 100;
      
      node.dependencies.forEach((depId) => {
        const toPos = nodePositions[depId];
        const toHeight = MOCK_NODES.find(n => n.id === depId)!.loc / 100;
        
        if (fromPos && toPos) {
          // Arc curve for high overhead wires
          const midX = (fromPos.x + toPos.x) / 2;
          const midZ = (fromPos.z + toPos.z) / 2;
          const arcHeight = Math.max(fromHeight, toHeight) + 15;
          
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(fromPos.x, fromHeight, fromPos.z),
            new THREE.Vector3(midX, arcHeight, midZ),
            new THREE.Vector3(toPos.x, toHeight, toPos.z)
          ]);
          
          const points = curve.getPoints(50);
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({ 
            color: THEME.neonBlue, 
            transparent: true, 
            opacity: 0.3 
          });
          const line = new THREE.Line(lineGeo, lineMat);
          scene.add(line);
        }
      });
    });

    // --- Worker Character ---
    const worker = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1.2, 0.5), new THREE.MeshStandardMaterial({ color: 0x3366ff }));
    body.position.y = 1.2;
    worker.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), new THREE.MeshStandardMaterial({ color: 0xffcc99 }));
    head.position.y = 2.1;
    worker.add(head);

    const legGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.25, 0.4, 0);
    worker.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.25, 0.4, 0);
    worker.add(rightLeg);

    worker.position.set(0, 0, 5);
    scene.add(worker);
    workerRef.current = worker;

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Walking animation if moving (using indices to check if we should be "walking")
      // Simple logic: if distance to target is significant, animate legs
      if (workerRef.current) {
        // Legs swing
        leftLeg.rotation.x = Math.sin(time * 10) * 0.5;
        rightLeg.rotation.x = -Math.sin(time * 10) * 0.5;
        // Body bob
        body.position.y = 1.2 + Math.abs(Math.sin(time * 10)) * 0.1;
        head.position.y = 2.1 + Math.abs(Math.sin(time * 10)) * 0.1;
      }
      // Helicopter orbit & Focus
      if (cameraRef.current) {
        const orbitSpeed = 0.15;
        const radius = cameraOrbitRadius.current;
        const height = cameraOrbitHeight.current;
        const angle = time * orbitSpeed;
        
        // Orbital path around focal point
        cameraRef.current.position.x = targetFocalPoint.current.x + Math.cos(angle) * radius;
        cameraRef.current.position.z = targetFocalPoint.current.z + Math.sin(angle) * radius;
        cameraRef.current.position.y = height + Math.sin(time * 0.5) * 2; // Subtle vertical sway
        
        // Constantly look at the focal point (smoothly)
        cameraRef.current.lookAt(targetFocalPoint.current);
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Handle Resize ---
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  // --- Patrolling Logic ---
  useEffect(() => {
    const patrol = async () => {
      const nodes = MOCK_NODES;
      const targetNode = nodes[activeNodeIndex];
      const gridCols = 4;
      const spacing = 20;
      const targetPos = {
        x: (activeNodeIndex % gridCols) * spacing - ((gridCols - 1) * spacing) / 2,
        z: Math.floor(activeNodeIndex / gridCols) * spacing - ((gridCols - 1) * spacing) / 2
      };

      if (workerRef.current && cameraRef.current) {
        onNodeFocus(targetNode);
        
        const currentPos = workerRef.current.position.clone();
        const destX = targetPos.x + 8;
        const destZ = targetPos.z + 8;
        
        // Calculate distance and duration for constant speed
        const dist = Math.sqrt(Math.pow(destX - currentPos.x, 2) + Math.pow(destZ - currentPos.z, 2));
        const speed = 6; // units per second (Slower movement)
        const duration = dist / speed;

        // Move worker to target building (offset)
        gsap.to(workerRef.current.position, {
          x: destX,
          z: destZ,
          duration: duration,
          ease: "none",
          onComplete: () => {
            // Stay for a bit
            setTimeout(() => {
              setActiveNodeIndex((prev) => (prev + 1) % nodes.length);
            }, 6000); // 1s more
          }
        });

        // Rotate worker to face move direction
        workerRef.current.lookAt(destX, 0, destZ);

        // Update focal point
        gsap.to(targetFocalPoint.current, {
          x: targetPos.x,
          y: 0,
          z: targetPos.z,
          duration: 3,
          ease: "power2.inOut"
        });
      }
    };

    patrol();
  }, [activeNodeIndex, onNodeFocus]);

  return <div ref={containerRef} className="w-full h-screen overflow-hidden bg-black" />;
};

export default World;
