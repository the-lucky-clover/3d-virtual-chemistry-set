export type PhysicalState = 'liquid' | 'solid' | 'gas' | 'solution';

export interface Reagent {
  id: string;
  name: string;
  formula: string;
  colorHex: string; // Base color
  ph: number;
  density: number; // g/mL
  molarMass: number; // g/mol
  state: PhysicalState;
  hazardNote?: string;
  isIndicator?: boolean;
  description: string;
}

export interface ReagentQuantity {
  reagentId: string;
  volumeMl: number; // mL for liquid/solution
  massGram?: number; // g for solid
}

export interface VesselState {
  id: string;
  type: 'beaker' | 'erlenmeyer' | 'testTube' | 'sepFunnel' | 'liebigCondenser' | 'crucible';
  capacityMl: number;
  contents: ReagentQuantity[];
  temperatureC: number;
  isHeating: boolean;
  isStirring: boolean;
  organicLayerContents?: ReagentQuantity[]; // For separatory funnel dual-layer
  precipitateColor?: string;
  precipitateMassG?: number;
  bubblesRate?: number; // 0 to 10
  gasType?: string;
}

export interface SafetyGearState {
  gogglesOn: boolean;
  glovesOn: boolean;
  labCoatOn: boolean;
  fumeHoodActive: boolean;
  tongsHeld: boolean;
  eyeWashTested: boolean;
}

export interface ExperimentStep {
  id: string;
  title: string;
  instruction: string;
  hint: string;
  targetVesselId?: string;
  isCompleted: boolean;
  validationCheck: (vessel: VesselState, safety: SafetyGearState, labHistory: string[]) => boolean;
}

export interface ExperimentModule {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'Novice' | 'Intermediate' | 'Advanced' | 'Master Chemist';
  estimatedMinutes: number;
  badgeName: string;
  description: string;
  steps: ExperimentStep[];
}

export interface LabLogEntry {
  timestamp: string;
  title: string;
  details: string;
  type: 'info' | 'reaction' | 'safety' | 'badge';
}
