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
  },

  // --------------------------------------------------------------------------
  // LEVEL 7: RETROREFLECTOR CHAMBER (CORNER-CUBE 180° RETURN)
  // --------------------------------------------------------------------------
  {
    id: "level-7",
    title: "Level 7: Retroreflector Chamber",
    subtitle: "Orthogonal Corner-Cube Optics (180° Antiparallel Return)",
    briefing: `Emitter Alpha and Receiver Beta are mounted in the same transceiver pod on the left bulkhead.
A thick security blast shield directly separates them.
To the right, an orthogonal retroreflector corner (horizontal floor mirror and vertical wall mirror) reflects rays by 180 degrees.

Objective: Calculate the entry trajectory into the 90° corner trap so the returning beam strikes Receiver Beta precisely!`,
    geometricTheory: `💡 Architect's Field Manual (Corner-Cube Retroreflection):
When a beam reflects off two mutually perpendicular mirrors (horizontal then vertical):
1. The outgoing ray is antiparallel to the incoming ray (slope magnitude |m| = 1/2 is preserved).
2. The beam leaves Emitter Alpha (240, 260) with slope +1/2.
3. It strikes Mirror Alpha (Floor, y = 380) at P1 (480, 380) and deflects upward to Mirror Beta (Wall, x = 560) at P2 (560, 340).
4. Mirror Beta deflects the ray upward-left, returning along y = 1/2(x - 560) + 340 into Receiver Beta (240, 180)!`,
    canvasSize: { width: 900, height: 560 },
    availableTools: ["point", "line", "circle", "aim"],
    emitterConfig: {
      sourceId: "emitter_Alpha",
      defaultAngle: 0,
      canAim: true
    },
    initialEntities: [
      // Mirror Alpha: Floor horizontal mirror (y = 380)
      {
        id: "mirror_retro_floor",
        type: "line",
        p1: { x: 380, y: 380 },
        p2: { x: 560, y: 380 },
        role: "mirror",
        label: "Mirror Alpha (Floor)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      // Mirror Beta: Right vertical mirror (x = 560)
      {
        id: "mirror_retro_wall",
        type: "line",
        p1: { x: 560, y: 220 },
        p2: { x: 560, y: 380 },
        role: "mirror",
        label: "Mirror Beta (Wall)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },

      // Security Blast Divider separating Emitter and Receiver
      {
        id: "blast_divider",
        type: "line",
        p1: { x: 180, y: 220 },
        p2: { x: 300, y: 220 },
        role: "obstacle",
        label: "Pod Isolation Barrier",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 6, lineDash: [8, 4] }
      },
      // High Ceiling Hazard Shield
      {
        id: "ceiling_shield",
        type: "line",
        p1: { x: 200, y: 120 },
        p2: { x: 560, y: 120 },
        role: "obstacle",
        label: "High Radiation Ceiling",
        isFixed: true,
        style: { strokeStyle: "#f43f5e", lineWidth: 5, lineDash: [6, 3] }
      },

      // Emitter Alpha (lower pod)
      {
        id: "emitter_Alpha",
        type: "point",
        x: 240,
        y: 260,
        role: "laser_source",
        label: "Emitter Alpha",
        isFixed: true,
        style: { fillStyle: "#06b6d4", radius: 8 }
      },
      // Receiver Beta (upper pod)
      {
        id: "target_Beta",
        type: "point",
        x: 240,
        y: 180,
        role: "target",
        label: "Receiver Beta",
        isFixed: true,
        style: { fillStyle: "#10b981", radius: 10, pulsing: true }
      }
    ],
    winCondition: {
      type: "laser_hit_target",
      targetId: "target_Beta",
      tolerance: 15,
      minBounces: 2,
      maxBounces: 5,
      successMessage: "SUCCESS: ELEGANT SOLUTION! 180° corner-cube retroreflection verified. Returning beam engaged Receiver Beta!"
    }
  },

  // --------------------------------------------------------------------------
  // LEVEL 8: THE DIAMOND RESONATOR (FOUR-MIRROR CLOSED CAVITY)
  // --------------------------------------------------------------------------
  {
    id: "level-8",
    title: "Level 8: The Diamond Resonator",
    subtitle: "Four-Mirror Perimeter Loop Around a Singularity",
    briefing: `A critical Dark Matter Singularity occupies the exact center of Sector 8.
No beam can penetrate the event horizon. Four tactical mirrors enclose the quadrant in an optical resonator cavity:
Top (Alpha), Right (Beta), Bottom (Gamma), and Left (Delta).

Objective: Execute a continuous 4-mirror perimeter loop around the singularity to deliver energy to Target Gamma!`,
    geometricTheory: `💡 Architect's Field Manual (Optical Resonator Perimeter):
A ray reflecting off four planar mirrors can establish a closed diamond orbit with slope magnitude |m| = 2/3:
1. Aim Emitter S (360, 160) up-right toward P1 (450, 100) on Mirror Alpha.
2. The beam reflects:
   - M1 (Top, y = 100) at P1 (450, 100) -> slope +2/3
   - M2 (Right, x = 720) at P2 (720, 280) -> slope -2/3
   - M3 (Bottom, y = 460) at P3 (450, 460) -> slope +2/3
   - M4 (Left, x = 180) at P4 (180, 280) -> slope -2/3
3. Exiting M4, the beam enters Target Gamma (270, 220) dead center!`,
    canvasSize: { width: 900, height: 560 },
    availableTools: ["point", "line", "circle", "aim"],
    emitterConfig: {
      sourceId: "emitter_S",
      defaultAngle: 0,
      canAim: true
    },
    initialEntities: [
      // 4 Resonator Mirrors
      {
        id: "mirror_res_top",
        type: "line",
        p1: { x: 360, y: 100 },
        p2: { x: 540, y: 100 },
        role: "mirror",
        label: "Mirror Alpha (Top)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      {
        id: "mirror_res_right",
        type: "line",
        p1: { x: 720, y: 190 },
        p2: { x: 720, y: 370 },
        role: "mirror",
        label: "Mirror Beta (Right)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      {
        id: "mirror_res_bottom",
        type: "line",
        p1: { x: 360, y: 460 },
        p2: { x: 540, y: 460 },
        role: "mirror",
        label: "Mirror Gamma (Bottom)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      {
        id: "mirror_res_left",
        type: "line",
        p1: { x: 180, y: 190 },
        p2: { x: 180, y: 370 },
        role: "mirror",
        label: "Mirror Delta (Left)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },

      // Central Dark Matter Singularity Box (impenetrable core)
      {
        id: "singularity_top",
        type: "line",
        p1: { x: 360, y: 200 },
        p2: { x: 540, y: 200 },
        role: "obstacle",
        label: "Singularity Core",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 6, lineDash: [8, 4] }
      },
      {
        id: "singularity_right",
        type: "line",
        p1: { x: 540, y: 200 },
        p2: { x: 540, y: 360 },
        role: "obstacle",
        label: "Singularity Event Horizon",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 6, lineDash: [8, 4] }
      },
      {
        id: "singularity_bottom",
        type: "line",
        p1: { x: 540, y: 360 },
        p2: { x: 360, y: 360 },
        role: "obstacle",
        label: "Singularity Boundary",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 6, lineDash: [8, 4] }
      },
      {
        id: "singularity_left",
        type: "line",
        p1: { x: 360, y: 360 },
        p2: { x: 360, y: 200 },
        role: "obstacle",
        label: "Singularity Field",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 6, lineDash: [8, 4] }
      },

      // Target Backstop Shield
      {
        id: "target_backstop",
        type: "line",
        p1: { x: 230, y: 250 },
        p2: { x: 230, y: 190 },
        role: "obstacle",
        label: "Receiver Backstop",
        isFixed: true,
        style: { strokeStyle: "#f43f5e", lineWidth: 4, lineDash: [6, 3] }
      },

      // Emitter S
      {
        id: "emitter_S",
        type: "point",
        x: 360,
        y: 160,
        role: "laser_source",
        label: "Emitter Hub S",
        isFixed: true,
        style: { fillStyle: "#06b6d4", radius: 8 }
      },
      // Target Gamma
      {
        id: "target_Gamma",
        type: "point",
        x: 270,
        y: 220,
        role: "target",
        label: "Target Gamma",
        isFixed: true,
        style: { fillStyle: "#10b981", radius: 10, pulsing: true }
      }
    ],
    winCondition: {
      type: "laser_hit_target",
      targetId: "target_Gamma",
      tolerance: 15,
      minBounces: 4, // Strict 4-bounce perimeter loop!
      maxBounces: 7,
      successMessage: "SUCCESS: ELEGANT SOLUTION! Four-mirror resonator loop closed. Beam orbited the singularity into Target Gamma!"
    }
  },

  // --------------------------------------------------------------------------
  // LEVEL 9: THE ORTHIC PRISM (MULTI-ANGLE BILLIARD)
  // --------------------------------------------------------------------------
  {
    id: "level-9",
    title: "Level 9: The Orthic Prism",
    subtitle: "Coordinate Transformation Across a 45° Slanted Cavity",
    briefing: `Target Theta is protected inside a subterranean research bunker.
Two horizontal mirrors and one 45-degree diagonal mirror form a high-precision optical cavity.
A massive central security bulkhead prohibits direct lines of sight.

Objective: Exploit 45° reflection vector swapping (u, v) -> (-v, -u) across Mirror Beta to route the beam through all three mirrors into Target Theta!`,
    geometricTheory: `💡 Architect's Field Manual (Slanted Vector Transformation):
Reflection across a line with equation x + y = c swaps and inverts velocity components:
1. Aim Emitter S (160, 220) with slope -1/2 toward P1 (360, 120) on Mirror Alpha (Top).
2. Mirror Alpha deflects the ray into slope +1/2 (direction [2, 1]) toward Mirror Beta (Slanted, x + y = 780).
3. Striking Mirror Beta at P2 (560, 220), the velocity vector [2, 1] transforms into [-1, -2] (slope +2, upward-left).
4. The beam strikes Mirror Gamma (Ceiling, y = 80) at P3 (490, 80) and deflects downward into Target Theta (330, 400)!`,
    canvasSize: { width: 900, height: 560 },
    availableTools: ["point", "line", "circle", "aim"],
    emitterConfig: {
      sourceId: "emitter_S",
      defaultAngle: 0,
      canAim: true
    },
    initialEntities: [
      // Mirror Alpha: Top horizontal mirror (y = 120)
      {
        id: "mirror_orthic_1",
        type: "line",
        p1: { x: 240, y: 120 },
        p2: { x: 440, y: 120 },
        role: "mirror",
        label: "Mirror Alpha (y=120)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      // Mirror Beta: Slanted 45° mirror (x + y = 780)
      {
        id: "mirror_orthic_2",
        type: "line",
        p1: { x: 500, y: 280 },
        p2: { x: 620, y: 160 },
        role: "mirror",
        label: "Mirror Beta (45° Slanted)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      // Mirror Gamma: High ceiling mirror (y = 80)
      {
        id: "mirror_orthic_3",
        type: "line",
        p1: { x: 420, y: 80 },
        p2: { x: 560, y: 80 },
        role: "mirror",
        label: "Mirror Gamma (y=80)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },

      // Central Security Bulkhead
      {
        id: "bulkhead_vertical",
        type: "line",
        p1: { x: 260, y: 170 },
        p2: { x: 260, y: 460 },
        role: "obstacle",
        label: "Central Bulkhead",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 7, lineDash: [8, 4] }
      },
      {
        id: "bulkhead_horizontal",
        type: "line",
        p1: { x: 260, y: 280 },
        p2: { x: 460, y: 280 },
        role: "obstacle",
        label: "Containment Shield",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 6, lineDash: [8, 4] }
      },

      // Emitter S (upper left)
      {
        id: "emitter_S",
        type: "point",
        x: 160,
        y: 220,
        role: "laser_source",
        label: "Laser Hub S",
        isFixed: true,
        style: { fillStyle: "#06b6d4", radius: 8 }
      },
      // Target Theta (lower chamber)
      {
        id: "target_Theta",
        type: "point",
        x: 330,
        y: 400,
        role: "target",
        label: "Receiver Theta",
        isFixed: true,
        style: { fillStyle: "#10b981", radius: 10, pulsing: true }
      }
    ],
    winCondition: {
      type: "laser_hit_target",
      targetId: "target_Theta",
      tolerance: 15,
      minBounces: 3, // Must bounce 3 times!
      maxBounces: 6,
      successMessage: "SUCCESS: ELEGANT SOLUTION! Slanted cavity vector transformation solved. Quantum beam locked into Target Theta!"
    }
  },

  // --------------------------------------------------------------------------
  // LEVEL 10: THE GRANDMASTER LABYRINTH (FIVE-BOUNCE QUANTUM RELAY)
  // --------------------------------------------------------------------------
  {
    id: "level-10",
    title: "Level 10: The Grandmaster Labyrinth",
    subtitle: "Five-Stage Quantum Relay Through the Citadel Maze",
    briefing: `The ultimate examination of the Geometry Architect Academy.
Target Omega Prime is sealed inside the fortified Inner Sanctum.
Five tactical mirrors enclose the labyrinth chambers. A single fraction of a degree error will trigger the thermal containment field!

Objective: Chain five consecutive reflections across all five mirrors (Top, Right, Bottom, Left, Sub-Ceiling) to breach the Inner Sanctum!`,
    geometricTheory: `💡 Architect's Field Manual (Five-Stage Relay):
Chain five symmetric 45° reflections across the citadel mirrors:
1. Aim Emitter S (140, 280) with slope -1 toward P1 (340, 80) on Mirror Alpha (Top).
2. The relay sequence executes:
   - M1 (Top, y=80) at P1 (340, 80) -> down-right (slope +1)
   - M2 (Right, x=640) at P2 (640, 380) -> down-left (slope -1)
   - M3 (Bottom, y=480) at P3 (540, 480) -> up-left (slope +1)
   - M4 (Left, x=240) at P4 (240, 180) -> up-right (slope -1)
   - M5 (Sub-Ceiling, y=100) at P5 (320, 100) -> down-right (slope +1)
3. Exiting M5, the beam enters the Inner Sanctum and strikes Target Omega Prime (480, 260) dead center!`,
    canvasSize: { width: 900, height: 560 },
    availableTools: ["point", "line", "circle", "aim"],
    emitterConfig: {
      sourceId: "emitter_S",
      defaultAngle: 0,
      canAim: true
    },
    initialEntities: [
      // Mirror 1: Top horizontal (y = 80)
      {
        id: "mirror_lab_1",
        type: "line",
        p1: { x: 260, y: 80 },
        p2: { x: 420, y: 80 },
        role: "mirror",
        label: "Mirror Alpha (y=80)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      // Mirror 2: Right vertical (x = 640)
      {
        id: "mirror_lab_2",
        type: "line",
        p1: { x: 640, y: 300 },
        p2: { x: 640, y: 460 },
        role: "mirror",
        label: "Mirror Beta (x=640)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      // Mirror 3: Bottom horizontal (y = 480)
      {
        id: "mirror_lab_3",
        type: "line",
        p1: { x: 460, y: 480 },
        p2: { x: 600, y: 480 },
        role: "mirror",
        label: "Mirror Gamma (y=480)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      // Mirror 4: Left vertical (x = 240)
      {
        id: "mirror_lab_4",
        type: "line",
        p1: { x: 240, y: 120 },
        p2: { x: 240, y: 260 },
        role: "mirror",
        label: "Mirror Delta (x=240)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },
      // Mirror 5: Sub-Ceiling horizontal (y = 100)
      {
        id: "mirror_lab_5",
        type: "line",
        p1: { x: 260, y: 100 },
        p2: { x: 380, y: 100 },
        role: "mirror",
        label: "Mirror Epsilon (y=100)",
        isFixed: true,
        style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
      },

      // Inner Sanctum Maze Barriers
      {
        id: "maze_wall_1",
        type: "line",
        p1: { x: 440, y: 130 },
        p2: { x: 440, y: 210 },
        role: "obstacle",
        label: "Sanctum Wall 1",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 6, lineDash: [8, 4] }
      },
      {
        id: "maze_wall_2",
        type: "line",
        p1: { x: 380, y: 300 },
        p2: { x: 560, y: 300 },
        role: "obstacle",
        label: "Sanctum Wall 2",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 6, lineDash: [8, 4] }
      },
      {
        id: "maze_wall_3",
        type: "line",
        p1: { x: 530, y: 160 },
        p2: { x: 530, y: 300 },
        role: "obstacle",
        label: "Sanctum Wall 3",
        isFixed: true,
        style: { strokeStyle: "#ef4444", lineWidth: 6, lineDash: [8, 4] }
      },

      // Emitter S
      {
        id: "emitter_S",
        type: "point",
        x: 140,
        y: 280,
        role: "laser_source",
        label: "Grandmaster Emitter S",
        isFixed: true,
        style: { fillStyle: "#06b6d4", radius: 8 }
      },
      // Target Omega Prime
      {
        id: "target_Omega_Prime",
        type: "point",
        x: 480,
        y: 260,
        role: "target",
        label: "Target Omega Prime",
        isFixed: true,
        style: { fillStyle: "#10b981", radius: 10, pulsing: true }
      }
    ],
    winCondition: {
      type: "laser_hit_target",
      targetId: "target_Omega_Prime",
      tolerance: 15,
      minBounces: 5, // Master 5-bounce challenge!
      maxBounces: 8,
      successMessage: "SUCCESS: ELEGANT SOLUTION! Grandmaster 5-stage labyrinth solved. Citadel Inner Sanctum breached!"
    }
  },
  // --------------------------------------------------------------------------
  // LEVEL 1: FIRST REFLECTION
  // --------------------------------------------------------------------------
  {
    id: "level-11",
    title: "Level 11: First Reflection",
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
      defaultAngle: -45,
      canAim: true
    },
    initialEntities: [
      {
        id: "node_a_1791298919126",
        type: "point",
        x: 520,
        y: 180,
        role: "shield_node",
        label: "Node A",
        isFixed: true,
        style: { "fillStyle": "#3b82f6", "radius": 7 }
      },
      {
        id: "node_b_1791298919501",
        type: "point",
        x: 380,
        y: 300,
        role: "shield_node",
        label: "Node B",
        isFixed: true,
        style: { "fillStyle": "#3b82f6", "radius": 7 }
      },
      {
        id: "node_c_1791298919813",
        type: "point",
        x: 620,
        y: 380,
        role: "shield_node",
        label: "Node C",
        isFixed: true,
        style: { "fillStyle": "#3b82f6", "radius": 7 }
      },
      {
        id: "node_d_1791298920133",
        type: "point",
        x: 620,
        y: 440,
        role: "shield_node",
        label: "Node D",
        isFixed: true,
        style: { "fillStyle": "#3b82f6", "radius": 7 }
      },
      {
        id: "node_e_1791298920414",
        type: "point",
        x: 440,
        y: 480,
        role: "shield_node",
        label: "Node E",
        isFixed: true,
        style: { "fillStyle": "#3b82f6", "radius": 7 }
      },
      {
        id: "node_f_1791298920704",
        type: "point",
        x: 660,
        y: 200,
        role: "shield_node",
        label: "Node F",
        isFixed: true,
        style: { "fillStyle": "#3b82f6", "radius": 7 }
      },
      {
        id: "emitter_A",
        type: "point",
        x: 200,
        y: 120,
        role: "laser_source",
        label: "Emitter Alpha (A)",
        isFixed: true,
        style: { "fillStyle": "#06b6d4", "radius": 8 }
      },
      {
        id: "target_B",
        type: "point",
        x: 820,
        y: 260,
        role: "target",
        label: "Receiver Beta (B)",
        isFixed: true,
        style: { "fillStyle": "#10b981", "radius": 10, "pulsing": true }
      },
      {
        id: "guide_1791298930549",
        type: "line",
        p1: { x: 440, y: 100 },
        p2: { x: 340, y: 220 },
        role: "guide",
        label: "Guide G1",
        isFixed: true,
        style: { "strokeStyle": "#64748b", "lineWidth": 1.5, "lineDash": [5, 5] }
      },
      {
        id: "barrier_1791298932655",
        type: "line",
        p1: { x: 500, y: 120 },
        p2: { x: 240, y: 380 },
        role: "obstacle",
        label: "Barrier W1",
        isFixed: true,
        style: { "strokeStyle": "#ef4444", "lineWidth": 6, "lineDash": [8, 4] }
      },
      {
        id: "mirror_1791298935093",
        type: "line",
        p1: { x: 590, y: 20 },
        p2: { x: 900, y: 110 },
        role: "mirror",
        label: "Mirror M1",
        isFixed: true,
        style: { "strokeStyle": "#38bdf8", "lineWidth": 4, "glow": true }
      },
      {
        id: "mirror_1791298936413",
        type: "line",
        p1: { x: 760, y: 260 },
        p2: { x: 480, y: 520 },
        role: "mirror",
        label: "Mirror M2",
        isFixed: true,
        style: { "strokeStyle": "#38bdf8", "lineWidth": 4, "glow": true }
      },
      {
        id: "mirror_1791298937878",
        type: "line",
        p1: { x: 500, y: 320 },
        p2: { x: 268, y: 329 },
        role: "mirror",
        label: "Mirror M3",
        isFixed: true,
        style: { "strokeStyle": "#38bdf8", "lineWidth": 4, "glow": true }
      },
      {
        id: "mirror_1791298938790",
        type: "line",
        p1: { x: 260, y: 420 },
        p2: { x: 60, y: 460 },
        role: "mirror",
        label: "Mirror M4",
        isFixed: true,
        style: { "strokeStyle": "#38bdf8", "lineWidth": 4, "glow": true }
      },
      {
        id: "mirror_1791298940071",
        type: "line",
        p1: { x: 60, y: 540 },
        p2: { x: 380, y: 480 },
        role: "mirror",
        label: "Mirror M5",
        isFixed: true,
        style: { "strokeStyle": "#38bdf8", "lineWidth": 4, "glow": true }
      }
    ],
    winCondition: {
      type: "laser_hit_target",
      targetId: "target_B",
      tolerance: 10,
      minBounces: 1,
      maxBounces: 4,
      successMessage: "SUCCESS: Quantum signal established with 1+ reflection!"
    }
  },
];

if (typeof window !== 'undefined') {
  window.levelData = levelData;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { levelData };
}
