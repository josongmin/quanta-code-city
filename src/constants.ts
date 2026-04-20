/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodeNode } from './types';

export const THEME = {
  bg: '#FFFFFF',
  grid: '#E2E8F0',
  sky: '#F0F9FF',
  buildingBase: '#E2E8F0',
  neonBlue: '#3B82F6', // Brighter Blue for Light theme
  neonPink: '#EF4444', // Red for Risk
  neonGreen: '#22C55E', // Safe Green
  fire: '#F97316',     // Orange Fire
  toxic: '#84CC16',
  ghost: '#CBD5E1',
};

export const MOCK_NODES: CodeNode[] = [
  { id: '1', name: 'AuthMiddleware', type: 'class', loc: 1200, risk: 0.8, solidViolations: 3, spaghettiFactor: 0.5, testCoverage: 0.2, techDebt: 0.7, isDead: false, memoryLeak: true, busFactor: 1, complexity: 45, duplication: 0.3, coupling: 0.8, aiGenerated: true, isGodClass: false, dependencies: ['2', '4'], securityLeak: false, heuristicLevel: 0.2, ifNesting: 4, blastRadius: 0.6 },
  { id: '2', name: 'PaymentService', type: 'class', loc: 10000, risk: 0.2, solidViolations: 0, spaghettiFactor: 0.1, testCoverage: 0.95, techDebt: 0.1, isDead: false, memoryLeak: false, busFactor: 3, complexity: 12, duplication: 0.05, coupling: 0.2, aiGenerated: false, isGodClass: true, dependencies: ['4'], securityLeak: false, heuristicLevel: 0.1, ifNesting: 2, blastRadius: 0.9 },
  { id: '3', name: 'LegacyUserSync', type: 'module', loc: 2500, risk: 0.9, solidViolations: 10, spaghettiFactor: 0.9, testCoverage: 0.05, techDebt: 0.95, isDead: true, memoryLeak: false, busFactor: 1, complexity: 88, duplication: 0.6, coupling: 0.9, aiGenerated: false, isGodClass: false, dependencies: ['1', '5'], securityLeak: false, heuristicLevel: 0.8, ifNesting: 12, blastRadius: 0.8 },
  { id: '4', name: 'CircularStoreA', type: 'class', loc: 1500, risk: 0.7, solidViolations: 5, spaghettiFactor: 0.8, testCoverage: 0.2, techDebt: 0.8, isDead: false, memoryLeak: true, busFactor: 1, complexity: 50, duplication: 0.4, coupling: 0.95, aiGenerated: true, isGodClass: false, dependencies: ['11'], securityLeak: false, heuristicLevel: 0.5, ifNesting: 5, blastRadius: 0.7 },
  { id: '5', name: 'CircularStoreB', type: 'module', loc: 1200, risk: 0.7, solidViolations: 5, spaghettiFactor: 0.8, testCoverage: 0.2, techDebt: 0.8, isDead: false, memoryLeak: true, busFactor: 1, complexity: 50, duplication: 0.4, coupling: 0.95, aiGenerated: false, isGodClass: false, dependencies: ['4'], securityLeak: false, heuristicLevel: 0.1, ifNesting: 5, blastRadius: 0.7 },
  { id: '6', name: 'HardcodedKeys', type: 'class', loc: 400, risk: 0.95, solidViolations: 0, spaghettiFactor: 0.1, testCoverage: 0.0, techDebt: 0.9, isDead: false, memoryLeak: false, busFactor: 1, complexity: 10, duplication: 0.01, coupling: 0.3, aiGenerated: false, isGodClass: false, dependencies: ['1'], securityLeak: false, heuristicLevel: 0.3, ifNesting: 2, blastRadius: 0.99 },
  { id: '7', name: 'BigBallOfMud', type: 'class', loc: 7000, risk: 0.9, solidViolations: 15, spaghettiFactor: 1.0, testCoverage: 0.01, techDebt: 1.0, isDead: false, memoryLeak: true, busFactor: 0, complexity: 150, duplication: 0.8, coupling: 1.0, aiGenerated: true, isGodClass: true, dependencies: ['1', '2', '3', '4', '6', '16'], securityLeak: false, heuristicLevel: 0.9, ifNesting: 20, blastRadius: 1.0 },
  { id: '8', name: 'SpaghettiRouter', type: 'function', loc: 3500, risk: 0.8, solidViolations: 8, spaghettiFactor: 0.9, testCoverage: 0.1, techDebt: 0.8, isDead: false, memoryLeak: false, busFactor: 1, complexity: 95, duplication: 0.5, coupling: 0.8, aiGenerated: false, isGodClass: false, dependencies: ['7'], securityLeak: false, heuristicLevel: 0.4, ifNesting: 15, blastRadius: 0.8 },
  { id: '9', name: 'AnalyticsSlop', type: 'class', loc: 2100, risk: 0.6, solidViolations: 4, spaghettiFactor: 0.4, testCoverage: 0.4, techDebt: 0.6, isDead: false, memoryLeak: false, busFactor: 1, complexity: 55, duplication: 0.4, coupling: 0.7, aiGenerated: true, isGodClass: false, dependencies: ['4', '10'], securityLeak: false, heuristicLevel: 0.6, ifNesting: 6, blastRadius: 0.7 },
  { id: '10', name: 'MassiveDuplicate', type: 'module', loc: 500, risk: 0.5, solidViolations: 2, spaghettiFactor: 0.3, testCoverage: 0.2, techDebt: 0.7, isDead: false, memoryLeak: false, busFactor: 2, complexity: 20, duplication: 0.99, coupling: 0.5, aiGenerated: false, isGodClass: false, dependencies: ['5'], securityLeak: false, heuristicLevel: 0.2, ifNesting: 2, blastRadius: 0.2 },
  { id: '11', name: 'ZombieWrapper', type: 'class', loc: 800, risk: 0.4, solidViolations: 3, spaghettiFactor: 0.2, testCoverage: 0.0, techDebt: 0.4, isDead: true, memoryLeak: false, busFactor: 1, complexity: 35, duplication: 0.1, coupling: 0.4, aiGenerated: false, isGodClass: false, dependencies: ['5'], securityLeak: false, heuristicLevel: 0.8, ifNesting: 4, blastRadius: 0.4 },
  { id: '12', name: 'MemoryHog', type: 'class', loc: 700, risk: 0.5, solidViolations: 2, spaghettiFactor: 0.5, testCoverage: 0.6, techDebt: 0.5, isDead: false, memoryLeak: true, busFactor: 2, complexity: 28, duplication: 0.15, coupling: 0.6, aiGenerated: false, isGodClass: false, dependencies: ['1'], securityLeak: false, heuristicLevel: 0.5, ifNesting: 3, blastRadius: 0.4 },
  { id: '13', name: 'CopyPasteHell', type: 'function', loc: 4000, risk: 0.4, solidViolations: 10, spaghettiFactor: 0.7, testCoverage: 0.05, techDebt: 0.9, isDead: false, memoryLeak: false, busFactor: 1, complexity: 80, duplication: 0.9, coupling: 0.5, aiGenerated: true, isGodClass: false, dependencies: ['10'], securityLeak: false, heuristicLevel: 0.4, ifNesting: 6, blastRadius: 0.3 },
  { id: '14', name: 'JobScheduler', type: 'class', loc: 1100, risk: 0.2, solidViolations: 2, spaghettiFactor: 0.2, testCoverage: 0.8, techDebt: 0.2, isDead: false, memoryLeak: false, busFactor: 1, complexity: 30, duplication: 0.1, coupling: 0.4, aiGenerated: true, isGodClass: false, dependencies: ['1', '2', '3', '9'], securityLeak: false, heuristicLevel: 0.7, ifNesting: 3, blastRadius: 0.3 },
  { id: '15', name: 'IfStatementCity', type: 'module', loc: 1500, risk: 0.6, solidViolations: 0, spaghettiFactor: 0.5, testCoverage: 0.5, techDebt: 0.6, isDead: false, memoryLeak: false, busFactor: 2, complexity: 120, duplication: 0.2, coupling: 0.4, aiGenerated: true, isGodClass: false, dependencies: [], securityLeak: false, heuristicLevel: 0.1, ifNesting: 50, blastRadius: 0.5 },
  { id: '16', name: 'ApiGateway', type: 'class', loc: 3200, risk: 0.5, solidViolations: 4, spaghettiFactor: 0.8, testCoverage: 0.4, techDebt: 0.6, isDead: false, memoryLeak: false, busFactor: 2, complexity: 70, duplication: 0.2, coupling: 0.9, aiGenerated: false, isGodClass: false, dependencies: ['1', '12'], securityLeak: true, heuristicLevel: 0.3, ifNesting: 5, blastRadius: 0.95 },
  { id: '17', name: 'DeadCodeRemnant', type: 'class', loc: 900, risk: 0.1, solidViolations: 0, spaghettiFactor: 0.0, testCoverage: 1.0, techDebt: 0.0, isDead: true, memoryLeak: false, busFactor: 1, complexity: 5, duplication: 0.0, coupling: 0.0, aiGenerated: false, isGodClass: false, dependencies: [], securityLeak: false, heuristicLevel: 0.0, ifNesting: 1, blastRadius: 0.0 },
];
