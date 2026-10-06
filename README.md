# 📐 Geometry Architect - Space Euclidean CAD & Optics Game

An interactive educational web application designed for high school students (ages 12-18) to master classical Euclidean geometry (compass & straightedge constructions) and ray optics reflection physics.

---

## 🚀 Quick Start (Instant Play)

This application is **Zero-Config & Standalone**:
1. Double-click to open [`index.html`](./index.html) in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Brave, Safari).
2. Or serve it via any local web server (e.g., VS Code Live Server).

---

## 🏗️ Data-Driven Architecture

The core **Geometry Game Engine** is completely decoupled from the **Level Data System**:

```
GeometryArchitect/
├── index.html          # Space Blueprint UI markup + Tailwind CSS v3
├── css/
│   └── style.css       # Space blueprint styling, neon glows, scanlines, and UI animations
└── js/
    ├── math.js         # Vector math & intersections (Line-Line, Line-Circle, Circle-Circle, Ray Reflection)
    ├── levels.js       # Level Data System: 100% decoupled mission definitions
    ├── engine.js       # Core Engine: Canvas render loop, 14px magnetic snapping, audio synthesizer
    └── main.js         # Controller binding DOM, keyboard shortcuts, sound, and event handlers
```

---

## 🧩 Adding New Levels

To add up to 100+ missions, developers only need to append objects to the `levelData` array in [`js/levels.js`](./js/levels.js) without touching any rendering code:

```javascript
{
  id: "level-4",
  title: "Level 4: Triple Prism Convergence",
  subtitle: "Equilateral Prism Deflection",
  briefing: "Sci-Fi mission briefing and narrative...",
  geometricTheory: "Euclidean construction guide for students...",
  availableTools: ["point", "line", "circle", "aim"],
  emitterConfig: {
    sourceId: "emitter_1",
    defaultAngle: -45,
    canAim: true
  },
  initialEntities: [
    {
      id: "mirror_1",
      type: "line",
      p1: { x: 150, y: 150 },
      p2: { x: 650, y: 150 },
      role: "mirror",
      label: "Nano-Mirror Alpha",
      isFixed: true,
      style: { strokeStyle: "#38bdf8", lineWidth: 4, glow: true }
    }
  ],
  winCondition: {
    type: "laser_hit_target", // or "circumcircle_fit"
    targetId: "target_1",
    tolerance: 15,
    minBounces: 2,
    maxBounces: 5,
    successMessage: "SUCCESS: ELEGANT SOLUTION!"
  }
}
```

---

## 🎮 Mission Catalogue

1. **Level 1: First Reflection** — Hero of Alexandria's Principle of Least Distance (1-bounce flat mirror).
2. **Level 2: Circumcenter Shield** — Triangle Circumcenter Construction via Perpendicular Bisectors.
3. **Level 3: Dual Reflection** — 2-bounce corner deflector navigating around security blast barriers.
4. **Level 4: Oblique Deflector** — Reflection across an arbitrary 45° diagonal mirror line (90° turn).
5. **Level 5: Triple Mirror Vault** — 3-bounce zig-zag optical waveguide snaking through staggered pillars.
6. **Level 6: Periscope Relay** — Submarine periscope optics with parallel 45° mirrors scaling a towering Citadel Wall.

---

## 🧮 Mathematical & Physics Foundation

1. **Law of Reflection:**
   $$\vec{r} = \vec{d} - 2(\vec{d} \cdot \vec{n})\vec{n}$$
   Where $\vec{d}$ is the incident unit vector and $\vec{n}$ is the mirror surface normal.

2. **Magnetic Snapping (14px Radius):**
   - Real-time precalculated candidate points:
     - Line segment intersections (Cramer's rule / cross product determinant)
     - Line vs. circle intersections (Quadratic discriminant)
     - Circle vs. circle intersections (Radical chord axis)
   - Cursor auto-magnetizes within 14 pixels for 100% geometric accuracy.

3. **Circumcenter Shield Construction:**
   - Evaluates perpendicular bisectors of the triangle edges to find the circumcenter equidistant to all three defense nodes.

4. **Multi-Bounce Waveguides & Slanted Mirrors (Levels 3, 4, 5, 6):**
   - Staggered blast walls obstruct direct line-of-sight and shortcut bypasses.
   - Enforces minimum bounce thresholds (`minBounces: 1, 2, 3`) with exact mathematical solvability.

---

## ⌨️ Keyboard Shortcuts

| Key | Action | Description |
| :---: | :--- | :--- |
| **P** | Point Tool | Place points freely or snap to intersections |
| **L** | Line Tool | Classical straightedge line segment |
| **C** | Circle Tool | Classical compass circle |
| **A** | Aim Laser | Adjust quantum beam launch trajectory |
| **E / D** | Eraser | Delete clicked entities |
| **Ctrl + Z** | Undo | Undo last construction step |
| **Space** | Run Simulation | Fire laser or evaluate shield coverage |
