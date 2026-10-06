/**
 * ============================================================================
 * GEOMETRY ARCHITECT - LEVEL DATA SYSTEM (DATA-DRIVEN ARCHITECTURE)
 * ============================================================================
 * Level Data System strictly decoupled from the Game Engine.
 * Add new missions anytime by simply adding objects to `levelData`.
 * 
 * Data Schema:
 * - id: Unique mission identifier
 * - title: Mission title
 * - subtitle: Mathematical principle or Euclidean category
 * - briefing: Sci-Fi Space Blueprint narrative & objective
 * - geometricTheory: Educational Euclidean geometry guide & tips
 * - initialEntities: Fixed scene objects (points, mirrors, obstacles, emitter, target)
 * - availableTools: Allowed tools for this level ("point", "line", "circle", "aim")
 * - emitterConfig: Laser source and aiming configuration
 * - winCondition: Verification rules (e.g., laser_hit_target, circumcircle_fit)
 * ============================================================================
 */

const levelData = [
  // --------------------------------------------------------------------------
  // LEVEL 1: FIRST REFLECTION
  // --------------------------------------------------------------------------
  {
    id: "level-1",
    title: "Level 1: First Reflection",
    subtitle: "Hero of Alexandria's Principle of Reflection",
    briefing: `Exploration Vessel ALPHA must transmit a quantum laser signal to Receiver BETA.
A dense dark matter wall directly blocks the line of sight. The beam must bounce off the 'Speculum Nano-Mirror' once to reach its destination.

Objective: Use Euclidean geometry to find the exact point of reflection on the mirror, then aim the laser emitter to strike Receiver BETA!`,
    geometricTheory: `💡 Architect's Field Manual (Hero of Alexandria):
Light follows the path of least distance!
1. Reflect target point B across the mirror line to find its virtual image B' (draw a perpendicular line and measure equal distance).
2. Connect emitter A to virtual image B' with a straight line.
3. The intersection point of line AB' with the mirror is the "Perfect Reflection Point" (where Angle of Incidence = Angle of Reflection).
4. Aim the laser emitter from A straight toward that intersection point!`,
    canvasSize: { width: 900, height: 560 },
    availableTools: ["point", "line", "circle", "aim"],
    emitterConfig: {
      sourceId: "emitter_A",
      defaultAngle: -45, // Degrees
      canAim: true
    },
    initialEntities: [
      // Speculum Mirror at the top
      {
        id: "mirror_main",
        type: "line",
        p1: { x: 120, y: 140 },
        p2: { x: 780, y: 140 },
        role: "mirror",
        label: "Speculum Mirror M",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      // Dark Matter Barrier blocking direct line of sight between A and B
      {
        id: "barrier_wall",
        type: "line",
        p1: { x: 450, y: 260 },
        p2: { x: 450, y: 520 },
        role: "obstacle",
        label: "Dark Matter Barrier",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 6, lineDash: [8, 4] }
      },
      // Laser Emitter A
      {
        id: "emitter_A",
        type: "point",
        x: 220,
        y: 420,
        role: "laser_source",
        label: "Emitter Alpha (A)",
        isFixed: true,
        style: { fillStyle: "#06b6d4", radius: 8 }
      },
      // Target Receiver B
      {
        id: "target_B",
        type: "point",
        x: 680,
        y: 420,
        role: "target",
        label: "Receiver Beta (B)",
        isFixed: true,
        style: { fillStyle: "#10b981", radius: 10, pulsing: true }
      }
    ],
    winCondition: {
      type: "laser_hit_target",
      targetId: "target_B",
      tolerance: 15,
      minBounces: 1,
      maxBounces: 4,
      successMessage: "SUCCESS: ELEGANT SOLUTION! Law of Reflection (θ₁ = θ₂) verified. Quantum signal established at 100% efficiency!"
    }
  },

  // --------------------------------------------------------------------------
  // LEVEL 2: CIRCUMCENTER SHIELD
  // --------------------------------------------------------------------------
  {
    id: "level-2",
    title: "Level 2: Circumcenter Shield",
    subtitle: "Triangle Circumcenter Construction",
    briefing: `Three orbital defense outposts (Node Alpha, Beta, Gamma) are exposed to an incoming cosmic radiation surge.
A single spherical forcefield shield must be deployed such that its boundary intersects all three outposts simultaneously.

Objective: Construct the perpendicular bisectors of the triangle edges to locate the Circumcenter O, then use the Compass tool to deploy the protective shield!`,
    geometricTheory: `💡 Architect's Field Manual (Circumcircle Construction):
The center of a circle circumscribing three triangle vertices is the intersection of its edge perpendicular bisectors:
1. Using the Compass tool with equal radius, draw two circles centered at A and B that intersect at two points.
2. Draw a line connecting these two intersection points to produce the Perpendicular Bisector of chord AB.
3. Repeat the construction for chord BC.
4. The intersection of the two perpendicular bisectors is the **Circumcenter O**!
5. Select the Compass tool, click center at O, and expand to Node A (or B or C) to activate the planetary shield!`,
    canvasSize: { width: 900, height: 560 },
    availableTools: ["point", "line", "circle"],
    emitterConfig: null,
    initialEntities: [
      {
        id: "base_A",
        type: "point",
        x: 250,
        y: 380,
        role: "shield_node",
        label: "Node Alpha (A)",
        isFixed: true,
        style: { fillStyle: "#38bdf8", radius: 8 }
      },
      {
        id: "base_B",
        type: "point",
        x: 650,
        y: 400,
        role: "shield_node",
        label: "Node Beta (B)",
        isFixed: true,
        style: { fillStyle: "#38bdf8", radius: 8 }
      },
      {
        id: "base_C",
        type: "point",
        x: 420,
        y: 160,
        role: "shield_node",
        label: "Node Gamma (C)",
        isFixed: true,
        style: { fillStyle: "#38bdf8", radius: 8 }
      },
      // Guide chords
      {
        id: "tri_ab",
        type: "line",
        p1: { x: 250, y: 380 },
        p2: { x: 650, y: 400 },
        role: "guide",
        label: "Sector AB",
        isFixed: true,
        style: { strokeStyle: "rgba(56, 189, 248, 0.2)", lineWidth: 1.5, lineDash: [5, 5] }
      },
      {
        id: "tri_bc",
        type: "line",
        p1: { x: 650, y: 400 },
        p2: { x: 420, y: 160 },
        role: "guide",
        label: "Sector BC",
        isFixed: true,
        style: { strokeStyle: "rgba(56, 189, 248, 0.2)", lineWidth: 1.5, lineDash: [5, 5] }
      },
      {
        id: "tri_ca",
        type: "line",
        p1: { x: 420, y: 160 },
        p2: { x: 250, y: 380 },
        role: "guide",
        label: "Sector CA",
        isFixed: true,
        style: { strokeStyle: "rgba(56, 189, 248, 0.2)", lineWidth: 1.5, lineDash: [5, 5] }
      }
    ],
    winCondition: {
      type: "circumcircle_fit",
      nodes: ["base_A", "base_B", "base_C"],
      tolerance: 12,
      successMessage: "SUCCESS: ELEGANT SOLUTION! Circumcircle forcefield active at 100%! All three defense outposts are fully shielded!"
    }
  },

  // --------------------------------------------------------------------------
  // LEVEL 3: DUAL REFLECTION (PERISCOPE DEFLECTION)
  // --------------------------------------------------------------------------
  {
    id: "level-3",
    title: "Level 3: Dual Reflection",
    subtitle: "Two-Bounce Mirror Deflection & Periscope Optics",
    briefing: `The quantum receiver Target Omega is sheltered inside a fortified bunker.
A heavy security blast wall blocks direct lines of sight, and a reinforced ceiling shields against overhead shortcuts.
The beam must deflect off Mirror Alpha (Top) AND Mirror Beta (Right) in sequence to enter the receiver chamber from the open flank!

Objective: Calculate the double-reflection path using virtual images, aim Laser Hub S to strike Mirror Alpha, and route the beam through both mirrors into Target Omega!`,
    geometricTheory: `💡 Architect's Field Manual (Double Reflection Geometry):
To route a ray via two mirrors M1 and M2 to target T:
1. Reflect target T across Mirror M2 (x = 600) to find virtual image T' (780, 320).
2. Reflect virtual image T' across Mirror M1 (y = 180) to find second virtual image T'' (780, 40).
3. Connect line ST'' from Emitter S (220, 320) toward T'' (780, 40).
4. The intersection with Mirror M1 marks the exact first reflection point P1 (500, 180)!
5. Aim the laser from Emitter S toward P1 to automatically bounce off M2 and strike Target Omega!`,
    canvasSize: { width: 900, height: 560 },
    availableTools: ["point", "line", "circle", "aim"],
    emitterConfig: {
      sourceId: "emitter_S",
      defaultAngle: -45, // Requires aiming toward P1 (-26.6 deg)
      canAim: true
    },
    initialEntities: [
      // Mirror Alpha (Horizontal Top)
      {
        id: "mirror_top",
        type: "line",
        p1: { x: 180, y: 180 },
        p2: { x: 560, y: 180 },
        role: "mirror",
        label: "Mirror Alpha (Top)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      // Mirror Beta (Vertical Right)
      {
        id: "mirror_right",
        type: "line",
        p1: { x: 600, y: 140 },
        p2: { x: 600, y: 420 },
        role: "mirror",
        label: "Mirror Beta (Right)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },

      // Security Blast Wall: Blocks direct horizontal line of sight between S and Omega
      {
        id: "obstacle_wall_v",
        type: "line",
        p1: { x: 320, y: 285 },
        p2: { x: 320, y: 480 },
        role: "obstacle",
        label: "Blast Shield Barrier",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 6, lineDash: [8, 4] }
      },
      // Bunker Ceiling: Encapsulates Target Omega from direct overhead or single-bounce strikes
      {
        id: "bunker_roof",
        type: "line",
        p1: { x: 350, y: 260 },
        p2: { x: 460, y: 260 },
        role: "obstacle",
        label: "Bunker Ceiling",
        isFixed: true,
        style: { strokeStyle: "#f43f5e", lineWidth: 6, lineDash: [6, 3] }
      },

      // Laser Emitter Hub S (left side)
      {
        id: "emitter_S",
        type: "point",
        x: 220,
        y: 320,
        role: "laser_source",
        label: "Laser Hub S",
        isFixed: true,
        style: { fillStyle: "#06b6d4", radius: 8 }
      },
      // Target Receiver Omega (inside bunker, accessible only from the right flank)
      {
        id: "target_Omega",
        type: "point",
        x: 420,
        y: 320,
        role: "target",
        label: "Target Omega",
        isFixed: true,
        style: { fillStyle: "#10b981", radius: 10, pulsing: true }
      }
    ],
    winCondition: {
      type: "laser_hit_target",
      targetId: "target_Omega",
      tolerance: 15,
      minBounces: 2, // Must bounce at least twice (off both mirrors)!
      maxBounces: 5,
      successMessage: "SUCCESS: ELEGANT SOLUTION! Dual-reflection beam successfully routed around blast walls into Target Omega!"
    }
  },

  // --------------------------------------------------------------------------
  // LEVEL 4: OBLIQUE DEFLECTOR (45-DEGREE SLANTED MIRROR)
  // --------------------------------------------------------------------------
  {
    id: "level-4",
    title: "Level 4: Oblique Deflector",
    subtitle: "Reflection Across an Angled Line (45° Diagonal Mirror)",
    briefing: `A radioactive asteroid ridge completely isolates Target Delta.
An ancient alien relay outpost features an angled mirror tilted at 45 degrees.
The laser beam must strike this diagonal mirror to negotiate the 90-degree turn and bypass the hazard zone!

Objective: Reflect Target Delta perpendicular across the slanted mirror line to find virtual image T', connect Emitter S to T', and aim at the exact intersection point P!`,
    geometricTheory: `💡 Architect's Field Manual (Slanted Mirror Reflection):
The Law of Reflection applies identically to slanted lines:
1. From target Delta (620, 240), construct a perpendicular line to the 45° mirror (slope -1).
2. Measure equal distance across the mirror to mark virtual image T' (320, 540).
3. Connect Emitter S (320, 100) to virtual image T' (320, 540) with a straight line.
4. The intersection with the slanted mirror is the exact reflection point P (320, 240)!
5. Aim the laser downward at P(320, 240) to reflect horizontally into Target Delta!`,
    canvasSize: { width: 900, height: 560 },
    availableTools: ["point", "line", "circle", "aim"],
    emitterConfig: {
      sourceId: "emitter_S",
      defaultAngle: 0,
      canAim: true
    },
    initialEntities: [
      // Slanted 45-degree Mirror (x - y = 80)
      {
        id: "mirror_oblique",
        type: "line",
        p1: { x: 240, y: 160 },
        p2: { x: 480, y: 400 },
        role: "mirror",
        label: "Diagonal Mirror Sigma (45°)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      // Central Asteroid Barrier blocking direct line of sight between S and Delta
      {
        id: "hazard_ridge",
        type: "line",
        p1: { x: 470, y: 110 },
        p2: { x: 470, y: 210 },
        role: "obstacle",
        label: "Asteroid Hazard Ridge",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 6, lineDash: [8, 4] }
      },
      // Target Bunker Roof: prevents overhead shortcut shots
      {
        id: "target_roof",
        type: "line",
        p1: { x: 560, y: 190 },
        p2: { x: 700, y: 190 },
        role: "obstacle",
        label: "Bunker Ceiling",
        isFixed: true,
        style: { strokeStyle: "#f43f5e", lineWidth: 5, lineDash: [6, 3] }
      },
      // Target Bunker Floor: prevents low-angle shortcut shots
      {
        id: "target_floor",
        type: "line",
        p1: { x: 560, y: 290 },
        p2: { x: 700, y: 290 },
        role: "obstacle",
        label: "Bunker Floor",
        isFixed: true,
        style: { strokeStyle: "#f43f5e", lineWidth: 5, lineDash: [6, 3] }
      },
      // Emitter S (top left)
      {
        id: "emitter_S",
        type: "point",
        x: 320,
        y: 100,
        role: "laser_source",
        label: "Emitter Hub S",
        isFixed: true,
        style: { fillStyle: "#06b6d4", radius: 8 }
      },
      // Target Delta (inside horizontal tunnel)
      {
        id: "target_Delta",
        type: "point",
        x: 620,
        y: 240,
        role: "target",
        label: "Receiver Delta",
        isFixed: true,
        style: { fillStyle: "#10b981", radius: 10, pulsing: true }
      }
    ],
    winCondition: {
      type: "laser_hit_target",
      targetId: "target_Delta",
      tolerance: 15,
      minBounces: 1,
      maxBounces: 4,
      successMessage: "SUCCESS: ELEGANT SOLUTION! Slanted mirror deflection verified (90° turn). Quantum beam entered Target Delta!"
    }
  },

  // --------------------------------------------------------------------------
  // LEVEL 5: TRIPLE MIRROR VAULT (ZIG-ZAG WAVEGUIDE)
  // --------------------------------------------------------------------------
  {
    id: "level-5",
    title: "Level 5: Triple Mirror Vault",
    subtitle: "Three-Bounce Serpentine Optical Waveguide",
    briefing: `The high-security vault houses Target Sigma deep within a serpentine corridor.
Staggered security blast pillars block all direct and two-bounce routes.
The laser beam must weave through three alternating mirrors (Top, Bottom, Top) to snake past every blast pillar!

Objective: Use multi-stage reflections to determine the required trajectory, aim from Emitter S, and execute a 3-bounce laser sequence!`,
    geometricTheory: `💡 Architect's Field Manual (Multi-Bounce Waveguide):
In a uniform parallel corridor, angle of incidence equals angle of reflection on every bounce:
1. To bounce 3 times: Top (M1) -> Bottom (M2) -> Top (M3) -> Target Sigma.
2. The beam follows a symmetric zig-zag with consistent slope magnitude (|m| = 2).
3. The first reflection point P1 lies at (290, 120) on Mirror Alpha.
4. Aim Emitter S (160, 380) toward P1 (290, 120) to launch the serpentine beam across all three mirrors!`,
    canvasSize: { width: 900, height: 560 },
    availableTools: ["point", "line", "circle", "aim"],
    emitterConfig: {
      sourceId: "emitter_S",
      defaultAngle: -30,
      canAim: true
    },
    initialEntities: [
      // Mirror Alpha (Top Left)
      {
        id: "mirror_top_left",
        type: "line",
        p1: { x: 230, y: 120 },
        p2: { x: 350, y: 120 },
        role: "mirror",
        label: "Mirror Alpha (Top)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      // Mirror Beta (Bottom Center)
      {
        id: "mirror_bottom",
        type: "line",
        p1: { x: 390, y: 440 },
        p2: { x: 510, y: 440 },
        role: "mirror",
        label: "Mirror Beta (Floor)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      // Mirror Gamma (Top Right)
      {
        id: "mirror_top_right",
        type: "line",
        p1: { x: 550, y: 120 },
        p2: { x: 670, y: 120 },
        role: "mirror",
        label: "Mirror Gamma (Top)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },

      // Security Pillar 1 (blocks direct horizontal shot)
      {
        id: "pillar_1",
        type: "line",
        p1: { x: 370, y: 320 },
        p2: { x: 370, y: 500 },
        role: "obstacle",
        label: "Blast Pillar 1",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 6, lineDash: [8, 4] }
      },
      // Security Pillar 2 (hanging ceiling pillar: blocks top ceiling shortcuts)
      {
        id: "pillar_2",
        type: "line",
        p1: { x: 450, y: 60 },
        p2: { x: 450, y: 300 },
        role: "obstacle",
        label: "Security Ceiling Barrier",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 6, lineDash: [8, 4] }
      },
      // Security Pillar 3 (blocks horizontal corridor bypass)
      {
        id: "pillar_3",
        type: "line",
        p1: { x: 530, y: 320 },
        p2: { x: 530, y: 500 },
        role: "obstacle",
        label: "Blast Pillar 2",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 6, lineDash: [8, 4] }
      },

      // Emitter S (bottom left)
      {
        id: "emitter_S",
        type: "point",
        x: 160,
        y: 380,
        role: "laser_source",
        label: "Laser Hub S",
        isFixed: true,
        style: { fillStyle: "#06b6d4", radius: 8 }
      },
      // Target Sigma (bottom right)
      {
        id: "target_Sigma",
        type: "point",
        x: 740,
        y: 380,
        role: "target",
        label: "Target Sigma",
        isFixed: true,
        style: { fillStyle: "#10b981", radius: 10, pulsing: true }
      }
    ],
    winCondition: {
      type: "laser_hit_target",
      targetId: "target_Sigma",
      tolerance: 15,
      minBounces: 3, // Must bounce at least 3 times!
      maxBounces: 6,
      successMessage: "SUCCESS: ELEGANT SOLUTION! Triple-reflection waveguide solved. Serpentine beam reached Target Sigma!"
    }
  },

  // --------------------------------------------------------------------------
  // LEVEL 6: PERISCOPE RELAY (PARALLEL 45-DEGREE PERISCOPE)
  // --------------------------------------------------------------------------
  {
    id: "level-6",
    title: "Level 6: Periscope Relay",
    subtitle: "Classical Submarine Periscope Optics (Parallel 45° Mirrors)",
    briefing: `Target Psi is elevated on an orbital observation deck behind a towering Citadel Wall.
Neither straight lines nor single reflections can overcome the wall's height.
Employing classical periscope physics, two parallel 45-degree mirrors must route the beam vertically over the Citadel Wall and into Target Psi!

Objective: Aim Emitter S horizontally into Mirror Alpha (45° inclination), elevating the beam vertically to Mirror Beta (parallel 45° mirror), which redirects it horizontally into Target Psi!`,
    geometricTheory: `💡 Architect's Field Manual (Periscope Optics):
Two parallel 45° inclined mirrors (slope -1) produce consecutive 90° deflections:
1. Mirror Alpha (lower, slope -1) intercepts the horizontal ray (1, 0) and reflects it vertically upward (0, -1).
2. The beam ascends vertically along x = 320, soaring over the Citadel Wall.
3. Mirror Beta (upper, slope -1) intercepts the vertical ray (0, -1) and reflects it horizontally rightward (1, 0).
4. The horizontal beam enters Target Psi (740, 140) dead center!`,
    canvasSize: { width: 900, height: 560 },
    availableTools: ["point", "line", "circle", "aim"],
    emitterConfig: {
      sourceId: "emitter_S",
      defaultAngle: -25,
      canAim: true
    },
    initialEntities: [
      // Mirror Alpha: Lower 45° inclined mirror (x + y = 740, slope -1)
      {
        id: "mirror_alpha_lower",
        type: "line",
        p1: { x: 240, y: 500 },
        p2: { x: 400, y: 340 },
        role: "mirror",
        label: "Mirror Alpha (Elevator)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      // Mirror Beta: Upper 45° inclined mirror (x + y = 460, slope -1, parallel to Mirror Alpha)
      {
        id: "mirror_beta_upper",
        type: "line",
        p1: { x: 240, y: 220 },
        p2: { x: 400, y: 60 },
        role: "mirror",
        label: "Mirror Beta (Periscope)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },

      // Massive Citadel Wall: Dividing the lower world from the upper observation deck
      {
        id: "citadel_wall",
        type: "line",
        p1: { x: 480, y: 190 },
        p2: { x: 480, y: 520 },
        role: "obstacle",
        label: "Citadel Blast Wall",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 8, lineDash: [10, 4] }
      },
      // Target Psi Bunker Roof (blocks diagonal overhead shots)
      {
        id: "psi_roof",
        type: "line",
        p1: { x: 620, y: 80 },
        p2: { x: 790, y: 80 },
        role: "obstacle",
        label: "Observation Ceiling",
        isFixed: true,
        style: { strokeStyle: "#f43f5e", lineWidth: 5, lineDash: [6, 3] }
      },
      // Target Psi Bunker Floor (blocks lower shots)
      {
        id: "psi_floor",
        type: "line",
        p1: { x: 620, y: 200 },
        p2: { x: 790, y: 200 },
        role: "obstacle",
        label: "Observation Platform",
        isFixed: true,
        style: { strokeStyle: "#f43f5e", lineWidth: 5, lineDash: [6, 3] }
      },

      // Emitter S (bottom left, firing towards lower elevator mirror)
      {
        id: "emitter_S",
        type: "point",
        x: 140,
        y: 420,
        role: "laser_source",
        label: "Emitter Hub S",
        isFixed: true,
        style: { fillStyle: "#06b6d4", radius: 8 }
      },
      // Target Psi (top right inside observation deck)
      {
        id: "target_Psi",
        type: "point",
        x: 740,
        y: 140,
        role: "target",
        label: "Target Psi",
        isFixed: true,
        style: { fillStyle: "#10b981", radius: 10, pulsing: true }
      }
    ],
    winCondition: {
      type: "laser_hit_target",
      targetId: "target_Psi",
      tolerance: 15,
      minBounces: 2, // Must bounce twice (through both 45° periscope mirrors)!
      maxBounces: 5,
      successMessage: "SUCCESS: ELEGANT SOLUTION! Classical periscope relay executed. Quantum beam scaled the Citadel Wall into Target Psi!"
    }
  }
];

if (typeof window !== 'undefined') {
  window.levelData = levelData;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { levelData };
}
