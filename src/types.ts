/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CodeNode {
  id: string;
  name: string;
  type: 'class' | 'module' | 'function';
  loc: number; // Lines of Code
  risk: number; // 0 to 1
  solidViolations: number;
  spaghettiFactor: number;
  testCoverage: number; // 0 to 1
  techDebt: number; // 0 to 1
  isDead: boolean;
  memoryLeak: boolean;
  busFactor: number;
  complexity: number; // Cyclomatic complexity score
  duplication: number; // 0 to 1
  coupling: number; // 0 to 1
  aiGenerated: boolean;
  isGodClass: boolean;
  dependencies: string[];
  securityLeak: boolean;
  heuristicLevel: number; // 0 to 1
  ifNesting: number; // Max nesting depth
  blastRadius: number; // 0 to 1 (Impact of failure)
}

export interface WorldState {
  nodes: CodeNode[];
  activeNodeId: string | null;
}
