import { Reagent, VesselState, ReagentQuantity } from '../types';

export const CHEMICAL_REAGENTS: Reagent[] = [
  {
    id: 'h2o',
    name: 'Distilled Water',
    formula: 'H₂O',
    colorHex: '#38BDF8',
    ph: 7.0,
    density: 1.0,
    molarMass: 18.015,
    state: 'liquid',
    description: 'Purified universal solvent used as reaction medium.',
  },
  {
    id: 'hcl',
    name: 'Hydrochloric Acid (1M)',
    formula: 'HCl (aq)',
    colorHex: '#0EA5E9',
    ph: 1.0,
    density: 1.02,
    molarMass: 36.46,
    state: 'solution',
    hazardNote: 'Corrosive acid. Causes skin burns.',
    description: 'Strong mineral acid used in titrations and acid-base reactions.',
  },
  {
    id: 'naoh',
    name: 'Sodium Hydroxide (1M)',
    formula: 'NaOH (aq)',
    colorHex: '#F0F9FF',
    ph: 13.0,
    density: 1.04,
    molarMass: 39.997,
    state: 'solution',
    hazardNote: 'Caustic base. Wear eye protection!',
    description: 'Strong caustic alkali base used in neutralization and extractions.',
  },
  {
    id: 'cuso4',
    name: 'Copper(II) Sulfate',
    formula: 'CuSO₄ (aq)',
    colorHex: '#0284C7',
    ph: 4.5,
    density: 1.10,
    molarMass: 159.6,
    state: 'solution',
    description: 'Bright blue transition metal salt solution for flame tests & precipitates.',
  },
  {
    id: 'nacl',
    name: 'Sodium Chloride Solution',
    formula: 'NaCl (aq)',
    colorHex: '#E2E8F0',
    ph: 7.0,
    density: 1.02,
    molarMass: 58.44,
    state: 'solution',
    description: 'Neutral saline solution. Yellow-gold sodium flame spectrum.',
  },
  {
    id: 'kcl',
    name: 'Potassium Chloride Solution',
    formula: 'KCl (aq)',
    colorHex: '#F8FAFC',
    ph: 7.0,
    density: 1.03,
    molarMass: 74.55,
    state: 'solution',
    description: 'Potassium salt solution. Emits soft lilac/violet flame wavelength.',
  },
  {
    id: 'phenolphthalein',
    name: 'Phenolphthalein Indicator',
    formula: 'C₂₀H₁₄O₄',
    colorHex: '#F1F5F9',
    ph: 7.0,
    density: 1.0,
    molarMass: 318.32,
    state: 'solution',
    isIndicator: true,
    description: 'Acid-base indicator: Colorless in acid (pH < 8.2), bright magenta in base.',
  },
  {
    id: 'universal_ind',
    name: 'Universal Indicator',
    formula: 'Mixture',
    colorHex: '#22C55E',
    ph: 7.0,
    density: 1.0,
    molarMass: 100,
    state: 'solution',
    isIndicator: true,
    description: 'pH indicator spanning red (acid pH 1) through green (pH 7) to purple (pH 14).',
  },
  {
    id: 'h2o2',
    name: 'Hydrogen Peroxide (30%)',
    formula: 'H₂O₂',
    colorHex: '#E0F2FE',
    ph: 5.5,
    density: 1.11,
    molarMass: 34.01,
    state: 'solution',
    hazardNote: 'Strong oxidizer.',
    description: 'Concentrated oxidizer. Undergoes rapid catalytic oxygen evolution.',
  },
  {
    id: 'ki',
    name: 'Potassium Iodide Solution',
    formula: 'KI (aq)',
    colorHex: '#FEF08A',
    ph: 7.0,
    density: 1.12,
    molarMass: 166.0,
    state: 'solution',
    description: 'Iodide catalyst for peroxide decomposition and redox tests.',
  },
  {
    id: 'ch3cooh',
    name: 'Acetic Acid (Vinegar)',
    formula: 'CH₃COOH',
    colorHex: '#FEF9C3',
    ph: 3.0,
    density: 1.01,
    molarMass: 60.05,
    state: 'solution',
    description: 'Weak organic acid used in organic extraction and buffers.',
  },
  {
    id: 'na2co3',
    name: 'Sodium Carbonate Solution',
    formula: 'Na₂CO₃ (aq)',
    colorHex: '#F1F5F9',
    ph: 11.5,
    density: 1.05,
    molarMass: 105.99,
    state: 'solution',
    description: 'Basic carbonate solution that releases CO₂ gas with acid.',
  },
  {
    id: 'ethyl_acetate',
    name: 'Ethyl Acetate (Solvent)',
    formula: 'CH₃COOCH₂CH₃',
    colorHex: '#FAF5FF',
    ph: 6.5,
    density: 0.90, // Less dense than water! Organic layer floats!
    molarMass: 88.11,
    state: 'liquid',
    hazardNote: 'Flammable organic solvent.',
    description: 'Immiscible organic extraction solvent (density 0.90 g/mL, floats on water).',
  },
  {
    id: 'tea_extract',
    name: 'Botanical Tea Extract (Caffeine & Tannins)',
    formula: 'Aqueous Extract',
    colorHex: '#78350F',
    ph: 5.2,
    density: 1.01,
    molarMass: 194.19,
    state: 'solution',
    description: 'Natural extract containing natural alkaloids (caffeine) and polyphenols.',
  },
  {
    id: 'citrus_peel',
    name: 'Orange Citrus Peel Mash (Limonene source)',
    formula: 'C₁₀H₁₆ (Organic)',
    colorHex: '#F97316',
    ph: 4.8,
    density: 0.84,
    molarMass: 136.23,
    state: 'liquid',
    description: 'Natural source of d-limonene essential oil for steam distillation.',
  },
  {
    id: 'zn_metal',
    name: 'Zinc Metal Granules',
    formula: 'Zn (s)',
    colorHex: '#94A3B8',
    ph: 7.0,
    density: 7.14,
    molarMass: 65.38,
    state: 'solid',
    description: 'Active metal that reacts with acid to yield H₂ gas.',
  },
  {
    id: 'agno3',
    name: 'Silver Nitrate Solution',
    formula: 'AgNO₃ (aq)',
    colorHex: '#F8FAFC',
    ph: 6.0,
    density: 1.10,
    molarMass: 169.87,
    state: 'solution',
    description: 'Reagent for halogens forming insoluble silver chloride precipitate.',
  }
];

export function getReagentById(id: string): Reagent | undefined {
  return CHEMICAL_REAGENTS.find((r) => r.id === id);
}

// Calculate combined pH, liquid color, and reaction state
export function processVesselReaction(vessel: VesselState): {
  updatedVessel: VesselState;
  reactionOccurred: boolean;
  logMessage?: string;
} {
  const contents = vessel.contents;
  if (contents.length === 0) {
    return {
      updatedVessel: {
        ...vessel,
        temperatureC: Math.max(25, vessel.temperatureC - (vessel.isHeating ? 0 : 0.5)),
        bubblesRate: 0,
      },
      reactionOccurred: false,
    };
  }

  let totalVol = contents.reduce((acc, c) => acc + c.volumeMl, 0);
  let totalH = 0;
  let totalOH = 0;
  let hasIndicatorP = contents.some((c) => c.reagentId === 'phenolphthalein');
  let hasIndicatorU = contents.some((c) => c.reagentId === 'universal_ind');

  let hasHCl = contents.some((c) => c.reagentId === 'hcl');
  let hasNaOH = contents.some((c) => c.reagentId === 'naoh');
  let hasH2O2 = contents.some((c) => c.reagentId === 'h2o2');
  let hasKI = contents.some((c) => c.reagentId === 'ki');
  let hasNa2CO3 = contents.some((c) => c.reagentId === 'na2co3');
  let hasZn = contents.some((c) => c.reagentId === 'zn_metal');
  let hasCuSO4 = contents.some((c) => c.reagentId === 'cuso4');
  let hasAgNO3 = contents.some((c) => c.reagentId === 'agno3');
  let hasNaCl = contents.some((c) => c.reagentId === 'nacl');

  contents.forEach((item) => {
    const reg = getReagentById(item.reagentId);
    if (reg) {
      if (reg.ph < 7) {
        totalH += Math.pow(10, -reg.ph) * (item.volumeMl / 1000);
      } else if (reg.ph > 7) {
        totalOH += Math.pow(10, -(14 - reg.ph)) * (item.volumeMl / 1000);
      }
    }
  });

  // Calculate net pH
  let netPh = 7.0;
  let molesHNet = totalH - totalOH;
  if (molesHNet > 1e-9) {
    let conc = molesHNet / (totalVol / 1000);
    netPh = Math.max(0.1, -Math.log10(conc));
  } else if (molesHNet < -1e-9) {
    let concOH = -molesHNet / (totalVol / 1000);
    let pOH = -Math.log10(concOH);
    netPh = Math.min(13.9, 14 - pOH);
  }

  // Determine Temp change and special reaction flags
  let tempDelta = vessel.isHeating ? 1.5 : -0.2;
  let bubbles = 0;
  let precipitateColor: string | undefined = undefined;
  let precipitateMass = 0;
  let reactionLog: string | undefined;
  let reactionOccurred = false;

  // Reaction 1: Neutralization (HCl + NaOH)
  if (hasHCl && hasNaOH) {
    tempDelta += 2.0; // Exothermic neutralization
    reactionOccurred = true;
    reactionLog = 'Neutralization: HCl + NaOH → NaCl + H₂O (Exothermic ΔH = -57.1 kJ/mol)';
  }

  // Reaction 2: Peroxide catalytic decomposition (H2O2 + KI)
  if (hasH2O2 && hasKI) {
    tempDelta += 4.5;
    bubbles = 8;
    reactionOccurred = true;
    reactionLog = 'Exothermic Catalytic Decomposition: 2H₂O₂ (KI) → 2H₂O + O₂ (g)';
  }

  // Reaction 3: Carbonate Acid Gas Release
  if (hasNa2CO3 && hasHCl) {
    bubbles = 6;
    reactionOccurred = true;
    reactionLog = 'Effervescence: Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂ (g) ↑';
  }

  // Reaction 4: Metal Oxidation & Hydrogen Gas
  if (hasZn && hasHCl) {
    bubbles = 5;
    tempDelta += 1.0;
    reactionOccurred = true;
    reactionLog = 'Single Replacement: Zn (s) + 2HCl (aq) → ZnCl₂ (aq) + H₂ (g) ↑';
  }

  // Reaction 5: Silver Chloride Precipitation
  if ((hasAgNO3 && hasNaCl) || (hasAgNO3 && hasHCl)) {
    precipitateColor = '#FFFFFF'; // White AgCl precipitate
    precipitateMass = 0.5;
    reactionOccurred = true;
    reactionLog = 'Precipitation: Ag⁺ + Cl⁻ → AgCl (s) ↓ (Curdy white precipitate)';
  }

  // Reaction 6: Copper Hydroxide Precipitation
  if (hasCuSO4 && hasNaOH) {
    precipitateColor = '#0284C7'; // Royal blue Cu(OH)2
    precipitateMass = 0.8;
    reactionOccurred = true;
    reactionLog = 'Precipitation: Cu²⁺ + 2OH⁻ → Cu(OH)₂ (s) ↓ (Pale blue precipitate)';
  }

  // Boiling check
  const newTemp = Math.min(130, Math.max(20, vessel.temperatureC + tempDelta));
  if (newTemp > 98) {
    bubbles = Math.max(bubbles, 7);
  }

  // Calculate Indicator Color
  let dominantColor = '#38BDF8';
  if (hasIndicatorP) {
    dominantColor = netPh >= 8.2 ? '#EC4899' : '#E2E8F0'; // Bright Magenta in alkali
  } else if (hasIndicatorU) {
    if (netPh < 3) dominantColor = '#EF4444'; // Red
    else if (netPh < 6) dominantColor = '#F97316'; // Orange
    else if (netPh < 8) dominantColor = '#22C55E'; // Green (Neutral)
    else if (netPh < 11) dominantColor = '#3B82F6'; // Blue
    else dominantColor = '#A855F7'; // Purple
  } else {
    // Blend reagent base colors
    let firstReg = getReagentById(contents[0]?.reagentId);
    if (firstReg) dominantColor = firstReg.colorHex;
  }

  return {
    updatedVessel: {
      ...vessel,
      temperatureC: Number(newTemp.toFixed(1)),
      bubblesRate: bubbles,
      precipitateColor: precipitateColor || vessel.precipitateColor,
      precipitateMassG: precipitateMass || vessel.precipitateMassG,
    },
    reactionOccurred,
    logMessage: reactionLog,
  };
}

// Flame Test Color Spectrum Helper
export function getFlameColorByReagent(reagentId: string): string {
  switch (reagentId) {
    case 'nacl':
      return '#EAB308'; // Golden Yellow (Na 589 nm)
    case 'kcl':
      return '#C084FC'; // Lilac Violet (K 766 nm)
    case 'cuso4':
      return '#10B981'; // Emerald Green (Cu)
    default:
      return '#3B82F6'; // Standard Blue methane Bunsen flame
  }
}
