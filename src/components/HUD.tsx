/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CodeNode } from '../types';
import { Terminal, AlertTriangle, Zap, Bug, TrendingDown } from 'lucide-react';

interface HUDProps {
  activeNode: CodeNode | null;
}

const HUD: React.FC<HUDProps> = ({ activeNode }) => {
  const [displayText, setDisplayText] = useState('');
  const [fullText, setFullText] = useState('');

  useEffect(() => {
    if (!activeNode) return;
    
    let report = `Analyzing [${activeNode.name}]... `;
    if (activeNode.blastRadius > 0.8) report += "RED ALERT: CRITICAL BLAST RADIUS. A failure here could destabilize the entire sector. ";
    if (activeNode.securityLeak) report += "CRITICAL FAILURE: DATA LEAK DETECTED. Red streams indicate unauthorized egress. ";
    if (activeNode.ifNesting > 8) report += "WARNING: IF-STATEMENT HELL. Logic is too deep. Building is encased in nested frames. ";
    if (activeNode.heuristicLevel > 0.7) report += "INTEL: HEURISTIC ANALYSIS active. Purple question marks detected. High guesswork in logic. ";
    if (activeNode.isDead) report += "WARNING: This building is a GHOST. Dead code detected. ";
    if (activeNode.isGodClass) report += "CRITICAL: GOD CLASS DETECTED. Too many responsibilities in one sector. ";
    if (activeNode.aiGenerated) {
      const isMalicious = activeNode.id === '7';
      report += isMalicious 
        ? "ALARM: UNIQUE REBELLIOUS AI DETECTED. The Prime Red Bot is actively destabilizing 'BigBallOfMud'. "
        : "INTEL: CONSTRUCTIVE AI ACTIVE. Typical blue drones are auditing and reinforcing the module structure. ";
    }
    if (activeNode.risk > 0.7) report += "CRITICAL: High risk fire party on-going. Refactor immediately. ";
    if (activeNode.solidViolations > 5) report += "ERROR: Structural integrity compromised. SOLID principles ignored. Building is tilting! ";
    if (activeNode.memoryLeak) report += "NOTICE: Data puddles found. Possible memory leaks in sector. ";
    if (activeNode.complexity > 40) report += `INTEL: Complexity index is ${activeNode.complexity}. Sector is extremely convoluted. `;
    if (activeNode.duplication > 0.4) report += "WARNING: High code duplication. Cloned substructures observed in perimeter. ";
    if (activeNode.coupling > 0.7) report += "ALERT: Extreme coupling detected. Blue lasers connecting to external dependencies. ";
    if (activeNode.busFactor === 0) report += "ALERT: BUS FACTORY DETECTED. THE HERO DEVELOPER HAS BEEN FLATTENED BY THE LEGACY BUS. ";
    
    if (report === `Analyzing [${activeNode.name}]... `) {
      report += "Node is stable. Structural health is OPTIMAL.";
    }

    setFullText(report);
    setDisplayText('');
  }, [activeNode]);

  useEffect(() => {
    if (!fullText) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [fullText]);

  if (!activeNode) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 font-mono text-xs uppercase tracking-widest text-[#1E293B]">
      {/* Top Labels - Hidden or simplified since we have sidebars now */}
      <div className="flex justify-between items-start opacity-0">
        <div className="bg-white/60 border-l-4 border-[#3B82F6] p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1">
            <Terminal size={14} />
            <span className="text-[#1E293B]">SCANNING SECTOR</span>
          </div>
        </div>
      </div>

      {/* Bottom Dialogue Box */}
      <div className="w-full max-w-3xl mx-auto pointer-events-auto mb-4">
        <div className="bg-white/95 border-2 border-[#E2E8F0] p-3 shadow-2xl flex gap-4 backdrop-blur-sm">
          <div className="w-14 h-14 bg-[#F8FAFC] border border-[#3B82F6] flex-shrink-0 flex items-center justify-center overflow-hidden">
             <div className="w-8 h-10 bg-[#3B82F6] flex flex-col justify-between p-1">
               <div className="flex justify-between"><div className="w-2 h-2 bg-white"></div><div className="w-2 h-2 bg-white"></div></div>
               <div className="w-full h-2 bg-white"></div>
             </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-[10px] text-[#334155] font-mono font-bold mb-1 tracking-tighter">p0 Agent</span>
            <div className="text-xs font-bold leading-relaxed text-[#0F172A] min-h-[1.5rem]">
              {displayText}<span className="animate-pulse">_</span>
            </div>
            
            <div className="mt-2 flex gap-4 text-[8px] text-[#64748B] border-t border-[#E2E8F0] pt-2">
              <div className="flex items-center gap-1"><AlertTriangle size={10} /> RISK: {Math.round(activeNode.risk * 100)}%</div>
              <div className="flex items-center gap-1"><Zap size={10} /> SOLID: {activeNode.solidViolations}</div>
              <div className="flex items-center gap-1"><TrendingDown size={10} /> DEBT: {Math.round(activeNode.techDebt * 100)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Badge = ({ label, active, color }: { label: string, active: boolean, color: string }) => (
    <div className={`p-1 px-3 ${active ? color : 'bg-gray-800 opacity-20'} text-[10px] text-white font-bold transition-all duration-500`}>
        {label}
    </div>
)

export default HUD;
