/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import World from './components/World';
import HUD from './components/HUD';
import { CodeNode } from './types';

export default function App() {
  const [activeNode, setActiveNode] = useState<CodeNode | null>(null);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-mono">
      <World onNodeFocus={setActiveNode} />
      <HUD activeNode={activeNode} />
      
      {/* Visual Glitch Overlays */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,_#fff_1px,_transparent_1px)] bg-[length:20px_20px]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#00FF41]/5 to-transparent h-20 animate-scanline" />
    </div>
  );
}
