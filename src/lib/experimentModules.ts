import { ExperimentModule } from '../types';

export const EXPERIMENT_MODULES: ExperimentModule[] = [
  {
    id: 'mod_1_safety',
    title: 'Lab Safety & Equipment Mastery',
    subtitle: 'Module 1: Safety Gear, Tongs & Tare Measurement',
    difficulty: 'Novice',
    estimatedMinutes: 5,
    badgeName: 'Safety Ace Champion',
    description: 'Master mandatory Personal Protective Equipment (PPE), handle hot crucibles safely with tongs, and operate analytical digital balances.',
    steps: [
      {
        id: 'step_ppe',
        title: 'Don Personal Protective Equipment (PPE)',
        instruction: 'Open the Safety Station and equip Splash Goggles, Nitrile Gloves, and Lab Coat.',
        hint: 'Click "Safety Gear" in the navigation bar and toggle all three safety items to ON.',
        isCompleted: false,
        validationCheck: (_, safety) => safety.gogglesOn && safety.glovesOn && safety.labCoatOn,
      },
      {
        id: 'step_tare',
        title: 'Operate Analytical Scale & Tongs',
        instruction: 'Hold Crucible Tongs and zero (tare) the Digital Balance before weighing.',
        hint: 'Toggle Crucible Tongs in the Equipment drawer, then select the Digital Scale.',
        isCompleted: false,
        validationCheck: (_, safety) => safety.tongsHeld,
      },
      {
        id: 'step_volume',
        title: 'Precise Volumetric Measurement',
        instruction: 'Add exactly 50 mL of Distilled Water (H₂O) into the 250 mL Beaker.',
        hint: 'Use the Reagents Drawer to add Distilled Water to the Beaker until volume reaches 50 mL.',
        isCompleted: false,
        validationCheck: (vessel) => {
          if (vessel.type !== 'beaker') return false;
          const h2o = vessel.contents.find((c) => c.reagentId === 'h2o');
          return (h2o?.volumeMl || 0) >= 45 && (h2o?.volumeMl || 0) <= 55;
        },
      },
    ],
  },
  {
    id: 'mod_2_flame',
    title: 'Flame Spectroscopy & Quantum Emissions',
    subtitle: 'Module 2: Identifying Cations by Atomic Emission Spectra',
    difficulty: 'Novice',
    estimatedMinutes: 8,
    badgeName: 'Spectroscopy Ace',
    description: 'Observe excited electron transitions as metal ions emit characteristic light wavelengths when heated in a high-temperature Bunsen flame.',
    steps: [
      {
        id: 'step_ignite',
        title: 'Ignite & Tune Bunsen Burner',
        instruction: 'Activate the Bunsen Burner heating element on the workspace.',
        hint: 'Click the Bunsen Burner controls or toggle Heat on the vessel.',
        isCompleted: false,
        validationCheck: (vessel) => vessel.isHeating,
      },
      {
        id: 'step_flame_na',
        title: 'Sodium D-Line Emission (589 nm)',
        instruction: 'Add Sodium Chloride (NaCl) solution to observe the golden-yellow atomic emission.',
        hint: 'Select NaCl from the Reagents drawer and add it to the heated vessel.',
        isCompleted: false,
        validationCheck: (vessel) => vessel.contents.some((c) => c.reagentId === 'nacl') && vessel.isHeating,
      },
      {
        id: 'step_flame_cu',
        title: 'Copper Emission (Emerald Green)',
        instruction: 'Add Copper(II) Sulfate (CuSO₄) solution to observe the emerald green flame test.',
        hint: 'Add CuSO₄ to the test tube on the burner stage.',
        isCompleted: false,
        validationCheck: (vessel) => vessel.contents.some((c) => c.reagentId === 'cuso4') && vessel.isHeating,
      },
    ],
  },
  {
    id: 'mod_3_titration',
    title: 'Quantitative Acid-Base Volumetric Titration',
    subtitle: 'Module 3: Equivalence Point & Phenolphthalein Endpoint',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    badgeName: 'Titration Ace',
    description: 'Perform a high-precision volumetric titration of Hydrochloric Acid with Sodium Hydroxide using Phenolphthalein to pinpoint the exact neutralization endpoint.',
    steps: [
      {
        id: 'step_tit_acid',
        title: 'Charge Erlenmeyer Flask with Acid',
        instruction: 'Add 30 mL Hydrochloric Acid (1M HCl) into the Erlenmeyer Flask.',
        hint: 'Select the Erlenmeyer Flask vessel and add 30 mL HCl.',
        isCompleted: false,
        validationCheck: (vessel) => {
          if (vessel.type !== 'erlenmeyer') return false;
          const hcl = vessel.contents.find((c) => c.reagentId === 'hcl');
          return (hcl?.volumeMl || 0) >= 25;
        },
      },
      {
        id: 'step_tit_ind',
        title: 'Add Acid-Base Indicator',
        instruction: 'Add Phenolphthalein Indicator to the acid solution (solution remains colorless).',
        hint: 'Add Phenolphthalein from the Reagents drawer to the Erlenmeyer Flask.',
        isCompleted: false,
        validationCheck: (vessel) => vessel.type === 'erlenmeyer' && vessel.contents.some((c) => c.reagentId === 'phenolphthalein'),
      },
      {
        id: 'step_tit_endpoint',
        title: 'Reach Neutral Equivalence Point',
        instruction: 'Titrate Sodium Hydroxide (1M NaOH) dropwise until the solution turns faint persistent pink (pH ~8.2).',
        hint: 'Add NaOH until pH rises to ~8.2 and the liquid changes color to pink!',
        isCompleted: false,
        validationCheck: (vessel) => {
          if (vessel.type !== 'erlenmeyer') return false;
          const hasNaOH = vessel.contents.some((c) => c.reagentId === 'naoh');
          return hasNaOH && vessel.contents.some((c) => c.reagentId === 'phenolphthalein');
        },
      },
    ],
  },
  {
    id: 'mod_4_distillation',
    title: 'Essential Oil Steam Distillation',
    subtitle: 'Module 4: Extracting Limonene via Liebig Condenser',
    difficulty: 'Intermediate',
    estimatedMinutes: 12,
    badgeName: 'Master Distiller',
    description: 'Utilize a 3D Liebig condenser with circulating cooling water to co-distill d-limonene essential oils from organic citrus peel mash.',
    steps: [
      {
        id: 'step_dist_load',
        title: 'Charge Distillation Apparatus',
        instruction: 'Select the Liebig Condenser & Receiver setup, then add Citrus Peel Mash and Water.',
        hint: 'Choose the Liebig Condenser vessel option and add Citrus Peel Mash.',
        isCompleted: false,
        validationCheck: (vessel) => vessel.type === 'liebigCondenser' && vessel.contents.some((c) => c.reagentId === 'citrus_peel'),
      },
      {
        id: 'step_dist_heat',
        title: 'Heat Distillation Boiling Vessel to 100°C',
        instruction: 'Turn on heat to generate steam vapor carrying essential oil vapor through the condenser tube.',
        hint: 'Enable heating on the Liebig condenser setup until temperature reaches > 95°C.',
        isCompleted: false,
        validationCheck: (vessel) => vessel.type === 'liebigCondenser' && vessel.isHeating && vessel.temperatureC >= 90,
      },
    ],
  },
  {
    id: 'mod_5_extraction',
    title: 'Liquid-Liquid Partitioning & Solvent Extraction',
    subtitle: 'Module 5: Caffeine Separation via Separatory Funnel',
    difficulty: 'Advanced',
    estimatedMinutes: 12,
    badgeName: 'Separation Ace',
    description: 'Partition natural alkaloids (caffeine) between immiscible aqueous tea extract and organic Ethyl Acetate solvent using a 3D Separatory Funnel.',
    steps: [
      {
        id: 'step_sep_charge',
        title: 'Fill Separatory Funnel with Botanical Tea Extract',
        instruction: 'Select the Separatory Funnel and pour 40 mL Botanical Tea Extract (Aqueous phase).',
        hint: 'Set vessel to Separatory Funnel and add Tea Extract from the reagents menu.',
        isCompleted: false,
        validationCheck: (vessel) => vessel.type === 'sepFunnel' && vessel.contents.some((c) => c.reagentId === 'tea_extract'),
      },
      {
        id: 'step_sep_solvent',
        title: 'Add Immiscible Organic Solvent (Ethyl Acetate)',
        instruction: 'Add 30 mL Ethyl Acetate (Organic solvent, density 0.90 g/mL). Observe the lighter organic layer floating on top!',
        hint: 'Add Ethyl Acetate. Notice the floating organic solvent layer on top of the dark aqueous layer.',
        isCompleted: false,
        validationCheck: (vessel) => vessel.type === 'sepFunnel' && vessel.contents.some((c) => c.reagentId === 'ethyl_acetate'),
      },
      {
        id: 'step_sep_vent',
        title: 'Agitate & Vent Pressure Valve Safely',
        instruction: 'Ensure Fume Hood is active and vent vapor pressure using the separatory stopcock.',
        hint: 'Activate the Fume Hood in the Safety panel to safely vent organic vapors.',
        isCompleted: false,
        validationCheck: (_, safety) => safety.fumeHoodActive,
      },
    ],
  },
  {
    id: 'mod_6_exothermic',
    title: 'Exothermic Catalytic Decomposition (Elephant Toothpaste)',
    subtitle: 'Module 6: Peroxide Disproportionation Enthalpy',
    difficulty: 'Master Chemist',
    estimatedMinutes: 10,
    badgeName: 'Master Enthalpy Ace',
    description: 'Investigate the high-energy catalytic decomposition of concentrated hydrogen peroxide catalyzed by potassium iodide ions.',
    steps: [
      {
        id: 'step_exo_peroxide',
        title: 'Prepare Concentrated Oxidizer',
        instruction: 'Add 40 mL Hydrogen Peroxide (30% H₂O₂) to the 250 mL Beaker.',
        hint: 'Add H₂O₂ to the beaker.',
        isCompleted: false,
        validationCheck: (vessel) => vessel.contents.some((c) => c.reagentId === 'h2o2'),
      },
      {
        id: 'step_exo_catalyst',
        title: 'Introduce Iodide Catalyst (KI)',
        instruction: 'Add Potassium Iodide (KI) to trigger rapid oxygen gas evolution and steam production!',
        hint: 'Add KI solution and observe the dramatic exothermic bubbling and rapid temperature spike!',
        isCompleted: false,
        validationCheck: (vessel) => vessel.contents.some((c) => c.reagentId === 'h2o2') && vessel.contents.some((c) => c.reagentId === 'ki'),
      },
    ],
  },
  {
    id: 'boss_1_stoichiometry',
    title: '👑 BOSS LEVEL 1: Stoichiometric Buffer Grandmaster',
    subtitle: 'High-Complexity Challenge: Multi-Stage Precision Stoichiometry',
    difficulty: 'Master Chemist',
    estimatedMinutes: 15,
    badgeName: 'Stoichiometry Grandmaster',
    description: 'Execute a flawless multi-step buffer synthesis and neutralization with magnetic stirring under zero safety violations.',
    steps: [
      {
        id: 'boss1_ppe',
        title: 'Advanced Laboratory Protocol Compliance',
        instruction: 'Equip Splash Goggles, Nitrile Gloves, Lab Coat, and ensure Eye Wash Station is tested.',
        hint: 'Turn on all PPE and test the eye wash in the Safety Gear station.',
        isCompleted: false,
        validationCheck: (_, safety) => safety.gogglesOn && safety.glovesOn && safety.labCoatOn && safety.eyeWashTested,
      },
      {
        id: 'boss1_stir',
        title: 'Charge Buffer Flask & Engage Magnetic Vortex',
        instruction: 'Select 500mL Flask, add 50 mL Water, 25 mL Na₂CO₃, and activate Magnetic Stirrer.',
        hint: 'Select 500mL Flask, add H₂O and Sodium Carbonate, then click "START STIRRER".',
        isCompleted: false,
        validationCheck: (vessel) => 
          vessel.type === 'erlenmeyer' && 
          vessel.isStirring && 
          vessel.contents.some((c) => c.reagentId === 'na2co3'),
      },
      {
        id: 'boss1_titrate',
        title: 'Stoichiometric Equivalence Point Endpoint',
        instruction: 'Add Phenolphthalein indicator and titrate 25 mL HCl into the stirred carbonate solution.',
        hint: 'Add Phenolphthalein and HCl to complete the stoichiometric back-titration.',
        isCompleted: false,
        validationCheck: (vessel) => 
          vessel.type === 'erlenmeyer' && 
          vessel.isStirring && 
          vessel.contents.some((c) => c.reagentId === 'phenolphthalein') &&
          vessel.contents.some((c) => c.reagentId === 'hcl'),
      },
    ],
  },
  {
    id: 'boss_2_calcination',
    title: '👑 BOSS LEVEL 2: High-Temp Crucible Calcination',
    subtitle: 'High-Complexity Challenge: Thermal Gravimetric Pyrolysis',
    difficulty: 'Master Chemist',
    estimatedMinutes: 15,
    badgeName: 'Calcination Pyro-Master',
    description: 'Operate porcelain crucible with tongs engaged, heating inorganic salts past dehydration thresholds to induce crystal luminescence.',
    steps: [
      {
        id: 'boss2_tongs',
        title: 'High-Temperature Thermal Safety Protocol',
        instruction: 'Hold Crucible Tongs, wear Goggles & Gloves, and ensure Fume Hood ventilation is active.',
        hint: 'Toggle Crucible Tongs and Fume Hood in the Safety Gear panel.',
        isCompleted: false,
        validationCheck: (_, safety) => safety.tongsHeld && safety.gogglesOn && safety.glovesOn && safety.fumeHoodActive,
      },
      {
        id: 'boss2_crucible_charge',
        title: 'Mount Porcelain Crucible & Reagent',
        instruction: 'Select the Crucible apparatus and charge with Copper(II) Sulfate (CuSO₄) crystals.',
        hint: 'Click "Crucible" in apparatus selector and pour CuSO₄.',
        isCompleted: false,
        validationCheck: (vessel) => vessel.type === 'crucible' && vessel.contents.some((c) => c.reagentId === 'cuso4'),
      },
      {
        id: 'boss2_calcine',
        title: 'Ignite Burner & Heat Crucible Past 90°C',
        instruction: 'Ignite the Bunsen Burner and calcine the reagent until temperature surpasses 90°C with glowing incandescence.',
        hint: 'Ignite Bunsen Burner and let temperature rise above 90°C.',
        isCompleted: false,
        validationCheck: (vessel, safety) => 
          vessel.type === 'crucible' && 
          vessel.isHeating && 
          vessel.temperatureC >= 90 && 
          safety.tongsHeld,
      },
    ],
  },
  {
    id: 'boss_3_separation',
    title: '👑 BOSS LEVEL 3: Dual-Phase Extraction & Distillation',
    subtitle: 'High-Complexity Challenge: Multi-Apparatus Partitioning',
    difficulty: 'Master Chemist',
    estimatedMinutes: 20,
    badgeName: 'Grandmaster Chemist',
    description: 'Master advanced organic partitioning in a Separatory Funnel with vapor ventilation, followed by continuous fractional steam distillation.',
    steps: [
      {
        id: 'boss3_hood_prep',
        title: 'Vapor Extraction Safety Rig',
        instruction: 'Activate Fume Hood, equip Full PPE, and select the Separatory Funnel.',
        hint: 'Turn on Fume Hood and set apparatus to Sep Funnel.',
        isCompleted: false,
        validationCheck: (vessel, safety) => 
          safety.fumeHoodActive && safety.gogglesOn && safety.glovesOn && vessel.type === 'sepFunnel',
      },
      {
        id: 'boss3_partition',
        title: 'Execute Liquid-Liquid Immiscible Partitioning',
        instruction: 'Add Botanical Tea Extract (Aqueous) and Ethyl Acetate (Organic) into the Separatory Funnel.',
        hint: 'Pour Tea Extract and Ethyl Acetate to generate the dual-layer immiscible interface.',
        isCompleted: false,
        validationCheck: (vessel) => 
          vessel.type === 'sepFunnel' && 
          vessel.contents.some((c) => c.reagentId === 'tea_extract') && 
          vessel.contents.some((c) => c.reagentId === 'ethyl_acetate'),
      },
      {
        id: 'boss3_distill',
        title: 'Continuous Liebig Condensation Recovery',
        instruction: 'Switch to Liebig Distillation apparatus, charge Citrus Peel, and heat to 95°C for pure fractional recovery.',
        hint: 'Select Liebig Distill apparatus, add Citrus Peel mash, and heat to > 90°C.',
        isCompleted: false,
        validationCheck: (vessel, safety) => 
          vessel.type === 'liebigCondenser' && 
          vessel.isHeating && 
          vessel.temperatureC >= 90 && 
          safety.fumeHoodActive,
      },
    ],
  }
];
