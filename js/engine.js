/**
 * ============================================================================
 * GEOMETRY ARCHITECT - CORE GAME & SIMULATION ENGINE
 * ============================================================================
 * Core Canvas Engine, Geometry State Management, Magnetic Snapping,
 * Space Blueprint rendering, and Ray Optics Reflection Physics.
 * ============================================================================
 */

class GeometryEngine {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.math = window.GeoMath;

    // Callbacks for UI communication
    this.onLevelWin = options.onLevelWin || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});
    this.onToolChange = options.onToolChange || (() => {});

    // Player state & entities
    this.activeLevel = null;
    this.playerEntities = [];      // Player created entities (Points, Lines, Circles)
    this.undoStack = [];           // Undo history stack
    this.currentTool = 'line';     // 'point' | 'line' | 'circle' | 'aim' | 'delete'
    
    // Mouse and interaction
    this.mouse = { x: 0, y: 0, isDown: false };
    this.snappedPoint = null;      // Active magnetic snapped point
    this.inProgressEntity = null;  // Entity currently being drawn (awaiting 2nd click)
    this.laserAimTarget = null;    // Aim target vector for laser

    // Snapping configuration
    this.snapRadius = 14;          // Snapping radius in pixels
    this.cachedIntersections = []; // Cached intersection points

    // Simulation & Physics
    this.isSimulating = false;
    this.simProgress = 0;          // Laser beam animation progress (0 to 1)
    this.laserSegments = [];       // Reflected laser segments
    this.laserHitSuccess = false;
    this.particles = [];           // Reflection impact sparks
    this.shieldWaveRadius = 0;     // Forcefield wave animation radius

    // Web Audio API Synthesizer (No external sound files required)
    this.initAudio();

    // Canvas setup, events & render loop
    this.setupCanvasDPI();
    this.bindEvents();
    this.startAnimationLoop();
  }

  // --------------------------------------------------------------------------
  // [1] Canvas DPI & Audio Setup
  // --------------------------------------------------------------------------

  setupCanvasDPI() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.logicalWidth = rect.width > 50 ? rect.width : 900;
    this.logicalHeight = rect.height > 50 ? rect.height : 560;

    this.canvas.width = this.logicalWidth * dpr;
    this.canvas.height = this.logicalHeight * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
  }

  initAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.soundEnabled = true;
    } catch (e) {
      console.warn("Web Audio API not supported", e);
      this.soundEnabled = false;
    }
  }

  playSound(type) {
    if (!this.soundEnabled || !this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    if (type === 'snap') {
      // Magnetic snap tick
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1320, t + 0.04);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.start(t);
      osc.stop(t + 0.04);
    } else if (type === 'draw') {
      // Confirmation tone
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(660, t + 0.08);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.start(t);
      osc.stop(t + 0.08);
    } else if (type === 'laser') {
      // High-energy laser pulse
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.linearRampToValueAtTime(880, t + 0.15);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.4);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.start(t);
      osc.stop(t + 0.4);
    } else if (type === 'bounce') {
      // Mirror reflection ping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
    } else if (type === 'win') {
      // Mission accomplished fanfare chord
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        o.connect(g);
        g.connect(this.audioCtx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, t + i * 0.08);
        g.gain.setValueAtTime(0.1, t + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.6);
        o.start(t + i * 0.08);
        o.stop(t + i * 0.08 + 0.6);
      });
    }
  }

  // --------------------------------------------------------------------------
  // [2] Level Loading & Entity Management
  // --------------------------------------------------------------------------

  loadLevel(level) {
    this.activeLevel = JSON.parse(JSON.stringify(level));
    this.playerEntities = [];
    this.undoStack = [];
    this.inProgressEntity = null;
    this.isSimulating = false;
    this.laserSegments = [];
    this.laserHitSuccess = false;
    this.particles = [];
    this.shieldWaveRadius = 0;

    if (this.activeLevel.emitterConfig && this.activeLevel.emitterConfig.defaultAngle !== undefined) {
      const emitter = this.getEntityById(this.activeLevel.emitterConfig.sourceId);
      if (emitter) {
        const rad = (this.activeLevel.emitterConfig.defaultAngle * Math.PI) / 180;
        this.laserAimTarget = {
          x: emitter.x + Math.cos(rad) * 150,
          y: emitter.y + Math.sin(rad) * 150
        };
      }
    } else {
      this.laserAimTarget = null;
    }

    if (this.activeLevel.availableTools.includes('line')) {
      this.setTool('line');
    } else {
      this.setTool(this.activeLevel.availableTools[0] || 'point');
    }

    this.recalculateAllIntersections();
    this.onStatusChange({ message: `Loaded '${this.activeLevel.title}'. Ready for construction.`, type: 'info' });
  }

  getEntityById(id) {
    if (!this.activeLevel) return null;
    return this.activeLevel.initialEntities.find(e => e.id === id) ||
           this.playerEntities.find(e => e.id === id);
  }

  setTool(tool) {
    if (this.isSimulating) return;
    this.currentTool = tool;
    this.inProgressEntity = null;
    this.onToolChange(tool);
    this.onStatusChange({
      message: `Selected tool: ${this.getToolNameEnglish(tool)}`,
      type: 'info'
    });
  }

  getToolNameEnglish(tool) {
    switch (tool) {
      case 'point': return 'Point Tool';
      case 'line': return 'Straightedge Line Tool';
      case 'circle': return 'Compass Circle Tool';
      case 'aim': return 'Aim Laser Tool';
      case 'delete': return 'Eraser Tool';
      default: return tool;
    }
  }

  undo() {
    if (this.playerEntities.length === 0 || this.isSimulating) return;
    const removed = this.playerEntities.pop();
    this.undoStack.push(removed);
    this.recalculateAllIntersections();
    this.onStatusChange({ message: 'Last action undone.', type: 'info' });
  }

  clearPlayerEntities() {
    if (this.isSimulating) return;
    this.playerEntities = [];
    this.undoStack = [];
    this.inProgressEntity = null;
    this.recalculateAllIntersections();
    this.onStatusChange({ message: 'All constructed entities cleared.', type: 'info' });
  }

  // --------------------------------------------------------------------------
  // [3] Magnetic Snapping System
  // --------------------------------------------------------------------------

  recalculateAllIntersections() {
    if (!this.activeLevel) return;
    this.cachedIntersections = [];

    const allLines = [];
    const allCircles = [];

    const collectFrom = (list) => {
      for (const e of list) {
        if (e.type === 'line') allLines.push(e);
        else if (e.type === 'circle') allCircles.push(e);
      }
    };

    collectFrom(this.activeLevel.initialEntities);
    collectFrom(this.playerEntities);

    // 1. Line - Line Intersections
    for (let i = 0; i < allLines.length; i++) {
      for (let j = i + 1; j < allLines.length; j++) {
        const l1 = allLines[i];
        const l2 = allLines[j];
        const pt = window.GeoMath.intersectLineLine(l1.p1, l1.p2, l2.p1, l2.p2, true);
        if (pt) {
          this.cachedIntersections.push({
            x: pt.x,
            y: pt.y,
            type: 'intersection',
            label: `(${l1.label || 'L'} ∩ ${l2.label || 'L'})`
          });
        }
      }
    }

    // 2. Line - Circle Intersections
    for (const line of allLines) {
      for (const circ of allCircles) {
        const pts = window.GeoMath.intersectLineCircle(line.p1, line.p2, circ.center, circ.radius, true);
        for (const pt of pts) {
          this.cachedIntersections.push({
            x: pt.x,
            y: pt.y,
            type: 'intersection',
            label: `(${line.label || 'Line'} ∩ Circle)`
          });
        }
      }
    }

    // 3. Circle - Circle Intersections
    for (let i = 0; i < allCircles.length; i++) {
      for (let j = i + 1; j < allCircles.length; j++) {
        const c1 = allCircles[i];
        const c2 = allCircles[j];
        const pts = window.GeoMath.intersectCircleCircle(c1.center, c1.radius, c2.center, c2.radius);
        for (const pt of pts) {
          this.cachedIntersections.push({
            x: pt.x,
            y: pt.y,
            type: 'intersection',
            label: `(Circle ∩ Circle)`
          });
        }
      }
    }
  }

  findSnapCandidate(cursorPos) {
    let closest = null;
    let minDistance = this.snapRadius;

    // A. Intersections (Highest priority for geometry)
    for (const pt of this.cachedIntersections) {
      const dist = window.GeoMath.distance(cursorPos, pt);
      if (dist < minDistance) {
        minDistance = dist;
        closest = {
          x: pt.x,
          y: pt.y,
          type: 'intersection',
          label: pt.label
        };
      }
    }

    // B. Fixed & Player Points / Centers
    const checkPoint = (pt, label, type = 'point') => {
      const dist = window.GeoMath.distance(cursorPos, pt);
      if (dist < minDistance) {
        minDistance = dist;
        closest = { x: pt.x, y: pt.y, type, label };
      }
    };

    if (this.activeLevel) {
      for (const e of this.activeLevel.initialEntities) {
        if (e.type === 'point') checkPoint(e, e.label || 'Node');
        else if (e.type === 'line') {
          checkPoint(e.p1, `${e.label || 'Line'} P1`);
          checkPoint(e.p2, `${e.label || 'Line'} P2`);
        }
      }
    }

    for (const e of this.playerEntities) {
      if (e.type === 'point') checkPoint(e, e.label || 'Constructed Point');
      else if (e.type === 'line') {
        checkPoint(e.p1, 'Line Endpoint');
        checkPoint(e.p2, 'Line Endpoint');
      } else if (e.type === 'circle') {
        checkPoint(e.center, 'Circle Center', 'center');
      }
    }

    return closest;
  }

  // --------------------------------------------------------------------------
  // [4] Event Handling
  // --------------------------------------------------------------------------

  bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - rect.left) / rect.width) * this.logicalWidth,
        y: ((clientY - rect.top) / rect.height) * this.logicalHeight
      };
    };

    const handlePointerMove = (e) => {
      const pos = getPos(e);
      this.mouse.x = pos.x;
      this.mouse.y = pos.y;

      const previousSnap = this.snappedPoint;
      this.snappedPoint = this.findSnapCandidate(pos);

      if (this.snappedPoint && !previousSnap) {
        this.playSound('snap');
      }

      const activePos = this.snappedPoint ? { x: this.snappedPoint.x, y: this.snappedPoint.y } : pos;
      if (this.inProgressEntity) {
        if (this.inProgressEntity.type === 'line') {
          this.inProgressEntity.p2 = activePos;
        } else if (this.inProgressEntity.type === 'circle') {
          this.inProgressEntity.radius = window.GeoMath.distance(this.inProgressEntity.center, activePos);
        }
      }

      if (this.currentTool === 'aim' && this.mouse.isDown) {
        this.laserAimTarget = activePos;
      }
    };

    const handlePointerDown = (e) => {
      if (this.isSimulating) return;
      this.mouse.isDown = true;
      const pos = getPos(e);
      const activePos = this.snappedPoint ? { x: this.snappedPoint.x, y: this.snappedPoint.y } : pos;

      if (this.currentTool === 'point') {
        const newPoint = {
          id: `p_${Date.now()}`,
          type: 'point',
          x: activePos.x,
          y: activePos.y,
          label: `P${this.playerEntities.filter(p => p.type === 'point').length + 1}`,
          style: { fillStyle: '#ffffff', radius: 4.5 }
        };
        this.playerEntities.push(newPoint);
        this.playSound('draw');
        this.recalculateAllIntersections();
      } else if (this.currentTool === 'line') {
        if (!this.inProgressEntity) {
          this.inProgressEntity = {
            id: `line_${Date.now()}`,
            type: 'line',
            p1: activePos,
            p2: activePos,
            label: `L${this.playerEntities.filter(l => l.type === 'line').length + 1}`,
            style: { strokeStyle: '#ffffff', lineWidth: 1.8 }
          };
          this.playSound('snap');
        } else {
          this.inProgressEntity.p2 = activePos;
          if (window.GeoMath.distance(this.inProgressEntity.p1, this.inProgressEntity.p2) > 4) {
            this.playerEntities.push(this.inProgressEntity);
            this.playSound('draw');
            this.recalculateAllIntersections();
          }
          this.inProgressEntity = null;
        }
      } else if (this.currentTool === 'circle') {
        if (!this.inProgressEntity) {
          this.inProgressEntity = {
            id: `circ_${Date.now()}`,
            type: 'circle',
            center: activePos,
            radius: 0,
            style: { strokeStyle: 'rgba(56, 189, 248, 0.85)', lineWidth: 1.6, lineDash: [6, 4] }
          };
          this.playSound('snap');
        } else {
          this.inProgressEntity.radius = window.GeoMath.distance(this.inProgressEntity.center, activePos);
          if (this.inProgressEntity.radius > 6) {
            this.playerEntities.push(this.inProgressEntity);
            this.playSound('draw');
            this.recalculateAllIntersections();
          }
          this.inProgressEntity = null;
        }
      } else if (this.currentTool === 'aim') {
        this.laserAimTarget = activePos;
        this.playSound('snap');
      } else if (this.currentTool === 'delete') {
        this.handleDeleteAt(activePos);
      }
    };

    const handlePointerUp = () => {
      this.mouse.isDown = false;
    };

    this.canvas.addEventListener('mousemove', handlePointerMove);
    this.canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);

    this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); handlePointerMove(e); }, { passive: false });
    this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handlePointerDown(e); }, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  handleDeleteAt(pos) {
    for (let i = this.playerEntities.length - 1; i >= 0; i--) {
      const e = this.playerEntities[i];
      let match = false;
      if (e.type === 'point' && window.GeoMath.distance(pos, e) < 12) {
        match = true;
      } else if (e.type === 'line') {
        const cp = window.GeoMath.closestPointOnSegment(pos, e.p1, e.p2);
        if (window.GeoMath.distance(pos, cp) < 10) match = true;
      } else if (e.type === 'circle') {
        const cp = window.GeoMath.closestPointOnCircle(pos, e.center, e.radius);
        if (cp.distToEdge < 10 || window.GeoMath.distance(pos, e.center) < 10) match = true;
      }

      if (match) {
        this.playerEntities.splice(i, 1);
        this.playSound('snap');
        this.recalculateAllIntersections();
        this.onStatusChange({ message: 'Entity deleted.', type: 'info' });
        break;
      }
    }
  }

  // --------------------------------------------------------------------------
  // [5] Physics Simulation & Win Verification
  // --------------------------------------------------------------------------

  runSimulation() {
    if (this.isSimulating || !this.activeLevel) return;

    if (this.activeLevel.winCondition.type === 'laser_hit_target') {
      this.simulateLaserBeam();
    } else if (this.activeLevel.winCondition.type === 'circumcircle_fit') {
      this.simulateCircumcenterShield();
    }
  }

  simulateLaserBeam() {
    const emitter = this.getEntityById(this.activeLevel.emitterConfig.sourceId);
    const target = this.getEntityById(this.activeLevel.winCondition.targetId);

    if (!emitter || !target) {
      this.onStatusChange({ message: 'Laser emitter or target not found in this mission.', type: 'error' });
      return;
    }

    let dir;
    if (this.laserAimTarget) {
      dir = window.GeoMath.normalize(window.GeoMath.sub(this.laserAimTarget, emitter));
    } else {
      dir = { x: 1, y: 0 };
    }

    const mirrors = [];
    const obstacles = [];

    const collectSurfaces = (list) => {
      for (const e of list) {
        if (e.type === 'line') {
          if (e.role === 'mirror') mirrors.push(e);
          else if (e.role === 'obstacle') obstacles.push(e);
        }
      }
    };

    collectSurfaces(this.activeLevel.initialEntities);
    collectSurfaces(this.playerEntities);

    let currentOrigin = { x: emitter.x, y: emitter.y };
    let currentDir = { ...dir };
    const maxBounces = this.activeLevel.winCondition.maxBounces || 5;
    const minBounces = this.activeLevel.winCondition.minBounces || 0;
    const segments = [];
    let hitTarget = false;

    for (let bounce = 0; bounce <= maxBounces; bounce++) {
      let closestHit = null;
      let minDistance = 2500;
      let hitType = null;
      let hitNormal = null;

      // 1. Check strike on Target (only if minimum bounces satisfied)
      if (bounce >= minBounces) {
        const toTarget = window.GeoMath.sub(target, currentOrigin);
        const projDist = window.GeoMath.dot(toTarget, currentDir);
        if (projDist > window.GeoMath.EPSILON) {
          const closestPointOnRay = window.GeoMath.add(currentOrigin, window.GeoMath.scale(currentDir, projDist));
          const distToTarget = window.GeoMath.distance(closestPointOnRay, target);

          if (distToTarget <= this.activeLevel.winCondition.tolerance) {
            closestHit = { x: target.x, y: target.y, distance: projDist };
            hitType = 'target';
            minDistance = projDist;
          }
        }
      }

      // 2. Check collision with Mirrors
      for (const mirror of mirrors) {
        const hit = window.GeoMath.intersectRaySegment(currentOrigin, currentDir, mirror.p1, mirror.p2);
        if (hit && hit.distance > window.GeoMath.EPSILON && hit.distance < minDistance) {
          minDistance = hit.distance;
          closestHit = hit;
          hitType = 'mirror';
          let normal = window.GeoMath.normal(mirror.p1, mirror.p2);
          if (window.GeoMath.dot(currentDir, normal) > 0) {
            normal = window.GeoMath.scale(normal, -1);
          }
          hitNormal = normal;
        }
      }

      // 3. Check collision with Obstacles (blocks beam)
      for (const obs of obstacles) {
        const hit = window.GeoMath.intersectRaySegment(currentOrigin, currentDir, obs.p1, obs.p2);
        if (hit && hit.distance > window.GeoMath.EPSILON && hit.distance < minDistance) {
          minDistance = hit.distance;
          closestHit = hit;
          hitType = 'obstacle';
        }
      }

      const endPoint = closestHit
        ? { x: closestHit.x, y: closestHit.y }
        : window.GeoMath.add(currentOrigin, window.GeoMath.scale(currentDir, 1200));

      segments.push({
        from: currentOrigin,
        to: endPoint,
        hitType,
        hitPoint: closestHit ? { ...endPoint } : null
      });

      if (hitType === 'target') {
        hitTarget = true;
        break;
      } else if (hitType === 'obstacle' || !closestHit) {
        break;
      } else if (hitType === 'mirror') {
        currentOrigin = endPoint;
        currentDir = window.GeoMath.reflect(currentDir, hitNormal);
      }
    }

    this.laserSegments = segments;
    this.laserHitSuccess = hitTarget;
    this.isSimulating = true;
    this.simProgress = 0;
    this.playSound('laser');

    this.onStatusChange({
      message: 'Simulating quantum beam ray reflection...',
      type: 'simulating'
    });
  }

  simulateCircumcenterShield() {
    this.isSimulating = true;
    this.playSound('laser');

    const nodeA = this.getEntityById('base_A');
    const nodeB = this.getEntityById('base_B');
    const nodeC = this.getEntityById('base_C');

    if (!nodeA || !nodeB || !nodeC) {
      this.isSimulating = false;
      return;
    }

    const tolerance = this.activeLevel.winCondition.tolerance || 12;
    let isMatched = false;

    for (const circ of this.playerEntities.filter(e => e.type === 'circle')) {
      const dA = Math.abs(window.GeoMath.distance(circ.center, nodeA) - circ.radius);
      const dB = Math.abs(window.GeoMath.distance(circ.center, nodeB) - circ.radius);
      const dC = Math.abs(window.GeoMath.distance(circ.center, nodeC) - circ.radius);

      if (dA <= tolerance && dB <= tolerance && dC <= tolerance) {
        isMatched = true;
        break;
      }
    }

    this.shieldWaveRadius = 10;
    const animateShield = () => {
      this.shieldWaveRadius += 6;
      if (this.shieldWaveRadius < 450) {
        requestAnimationFrame(animateShield);
      } else {
        this.isSimulating = false;
        if (isMatched) {
          this.playSound('win');
          this.onLevelWin(this.activeLevel.winCondition.successMessage);
        } else {
          this.onStatusChange({
            message: 'Forcefield shield does not encompass all 3 defense outposts! Construct perpendicular bisectors to find the true circumcenter.',
            type: 'error'
          });
        }
      }
    };
    animateShield();
  }

  // --------------------------------------------------------------------------
  // [6] Render Loop & Canvas Drawing
  // --------------------------------------------------------------------------

  startAnimationLoop() {
    const loop = () => {
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  render() {
    const ctx = this.ctx;
    const w = this.logicalWidth;
    const h = this.logicalHeight;

    this.renderBlueprintGrid(ctx, w, h);

    if (!this.activeLevel) return;

    for (const entity of this.activeLevel.initialEntities) {
      this.renderEntity(ctx, entity, true);
    }

    for (const entity of this.playerEntities) {
      this.renderEntity(ctx, entity, false);
    }

    if (this.inProgressEntity) {
      this.renderInProgressEntity(ctx);
    }

    if (this.currentTool === 'aim' || (this.laserAimTarget && !this.isSimulating)) {
      this.renderLaserAimGuide(ctx);
    }

    if (this.isSimulating && this.laserSegments.length > 0) {
      this.renderLaserSimulation(ctx);
    }

    if (this.shieldWaveRadius > 0) {
      this.renderShieldEffect(ctx);
    }

    this.renderParticles(ctx);

    if (this.snappedPoint && !this.isSimulating) {
      this.renderSnappingReticle(ctx, this.snappedPoint);
    }

    this.renderCoordinatesHUD(ctx, w, h);
  }

  renderBlueprintGrid(ctx, w, h) {
    ctx.fillStyle = '#070e1e';
    ctx.fillRect(0, 0, w, h);

    // Minor grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 20) {
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += 20) {
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Major grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 100) {
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += 100) {
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Technical crosshairs
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    for (let x = 100; x < w; x += 100) {
      for (let y = 100; y < h; y += 100) {
        ctx.beginPath();
        ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y);
        ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4);
        ctx.stroke();
      }
    }
  }

  renderEntity(ctx, entity, isFixed = false) {
    ctx.save();

    if (entity.type === 'point') {
      const radius = entity.style?.radius || 5;
      const fill = entity.style?.fillStyle || '#ffffff';

      ctx.shadowBlur = isFixed ? 12 : 6;
      ctx.shadowColor = fill;

      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(entity.x, entity.y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (entity.role === 'target' || entity.role === 'shield_node' || entity.role === 'laser_source') {
        ctx.strokeStyle = fill;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(entity.x, entity.y, radius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (entity.label) {
        ctx.shadowBlur = 0;
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
        ctx.fillText(entity.label, entity.x + 10, entity.y - 8);
      }
    } else if (entity.type === 'line') {
      const stroke = entity.style?.strokeStyle || '#ffffff';
      const lineWidth = entity.style?.lineWidth || 2;
      const lineDash = entity.style?.lineDash || [];

      ctx.setLineDash(lineDash);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;

      if (entity.style?.glow || entity.role === 'mirror') {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
      }

      ctx.beginPath();
      ctx.moveTo(entity.p1.x, entity.p1.y);
      ctx.lineTo(entity.p2.x, entity.p2.y);
      ctx.stroke();

      if (entity.role === 'mirror') {
        this.renderMirrorHatch(ctx, entity.p1, entity.p2);
      }

      if (entity.label && entity.role !== 'guide') {
        const midX = (entity.p1.x + entity.p2.x) / 2;
        const midY = (entity.p1.y + entity.p2.y) / 2;
        ctx.shadowBlur = 0;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
        ctx.fillText(entity.label, midX + 8, midY - 6);
      }
    } else if (entity.type === 'circle') {
      ctx.strokeStyle = entity.style?.strokeStyle || 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = entity.style?.lineWidth || 1.6;
      ctx.setLineDash(entity.style?.lineDash || [6, 4]);

      ctx.beginPath();
      ctx.arc(entity.center.x, entity.center.y, entity.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(entity.center.x - 4, entity.center.y);
      ctx.lineTo(entity.center.x + 4, entity.center.y);
      ctx.moveTo(entity.center.x, entity.center.y - 4);
      ctx.lineTo(entity.center.x, entity.center.y + 4);
      ctx.stroke();
    }

    ctx.restore();
  }

  renderMirrorHatch(ctx, p1, p2) {
    ctx.save();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = 0;

    const normal = window.GeoMath.normal(p1, p2);
    const d = window.GeoMath.sub(p2, p1);
    const len = window.GeoMath.length(d);
    const u = window.GeoMath.normalize(d);

    for (let dist = 10; dist < len; dist += 16) {
      const bx = p1.x + u.x * dist;
      const by = p1.y + u.y * dist;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + (normal.x + u.x * 0.5) * 8, by + (normal.y + u.y * 0.5) * 8);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderInProgressEntity(ctx) {
    ctx.save();
    if (this.inProgressEntity.type === 'line') {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(this.inProgressEntity.p1.x, this.inProgressEntity.p1.y);
      ctx.lineTo(this.inProgressEntity.p2.x, this.inProgressEntity.p2.y);
      ctx.stroke();

      const len = Math.round(window.GeoMath.distance(this.inProgressEntity.p1, this.inProgressEntity.p2));
      const midX = (this.inProgressEntity.p1.x + this.inProgressEntity.p2.x) / 2;
      const midY = (this.inProgressEntity.p1.y + this.inProgressEntity.p2.y) / 2;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`L: ${len}px`, midX + 10, midY - 6);
    } else if (this.inProgressEntity.type === 'circle') {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(this.inProgressEntity.center.x, this.inProgressEntity.center.y, this.inProgressEntity.radius, 0, Math.PI * 2);
      ctx.stroke();

      const r = Math.round(this.inProgressEntity.radius);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`R: ${r}px`, this.inProgressEntity.center.x + r + 6, this.inProgressEntity.center.y);
    }
    ctx.restore();
  }

  renderLaserAimGuide(ctx) {
    if (!this.activeLevel?.emitterConfig) return;
    const emitter = this.getEntityById(this.activeLevel.emitterConfig.sourceId);
    if (!emitter || !this.laserAimTarget) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(emitter.x, emitter.y);
    ctx.lineTo(this.laserAimTarget.x, this.laserAimTarget.y);
    ctx.stroke();

    ctx.strokeStyle = '#ef4444';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(this.laserAimTarget.x, this.laserAimTarget.y, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  renderLaserSimulation(ctx) {
    ctx.save();
    this.simProgress += 0.035;
    const progress = Math.min(1, this.simProgress);

    let totalLength = 0;
    const segLengths = this.laserSegments.map(s => {
      const len = window.GeoMath.distance(s.from, s.to);
      totalLength += len;
      return len;
    });

    let currentDrawLength = totalLength * progress;

    for (let i = 0; i < this.laserSegments.length; i++) {
      const seg = this.laserSegments[i];
      const segLen = segLengths[i];

      if (currentDrawLength <= 0) break;

      const fraction = Math.min(1, currentDrawLength / segLen);
      const drawTo = {
        x: seg.from.x + (seg.to.x - seg.from.x) * fraction,
        y: seg.from.y + (seg.to.y - seg.from.y) * fraction
      };

      ctx.shadowBlur = 18;
      ctx.shadowColor = '#ff0055';
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(seg.from.x, seg.from.y);
      ctx.lineTo(drawTo.x, drawTo.y);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(seg.from.x, seg.from.y);
      ctx.lineTo(drawTo.x, drawTo.y);
      ctx.stroke();

      if (fraction >= 1 && seg.hitPoint && Math.random() < 0.4) {
        this.addSparks(seg.hitPoint.x, seg.hitPoint.y, '#ff0055');
      }

      currentDrawLength -= segLen;
    }

    if (this.simProgress >= 1) {
      if (this.laserHitSuccess) {
        this.playSound('win');
        this.addSparks(this.laserSegments[this.laserSegments.length - 1].to.x,
                       this.laserSegments[this.laserSegments.length - 1].to.y, '#10b981', 40);
        this.onLevelWin(this.activeLevel.winCondition.successMessage);
      } else {
        this.onStatusChange({
          message: 'Laser beam missed the target! Construct reflection points to find the exact launch trajectory.',
          type: 'error'
        });
      }
      this.isSimulating = false;
    }

    ctx.restore();
  }

  addSparks(x, y, color = '#ff0055', count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color
      });
    }
  }

  renderParticles(ctx) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  renderShieldEffect(ctx) {
    const nodeA = this.getEntityById('base_A');
    const nodeB = this.getEntityById('base_B');
    const nodeC = this.getEntityById('base_C');
    if (!nodeA || !nodeB || !nodeC) return;

    const sol = window.GeoMath.getCircumcenter(nodeA, nodeB, nodeC);
    if (!sol) return;

    ctx.save();
    ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, 1 - this.shieldWaveRadius / 450)})`;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#38bdf8';
    ctx.beginPath();
    ctx.arc(sol.center.x, sol.center.y, this.shieldWaveRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  renderSnappingReticle(ctx, snap) {
    ctx.save();
    ctx.strokeStyle = '#06b6d4';
    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.lineWidth = 1.6;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;

    // Diamond HUD
    ctx.beginPath();
    ctx.moveTo(snap.x, snap.y - 8);
    ctx.lineTo(snap.x + 8, snap.y);
    ctx.lineTo(snap.x, snap.y + 8);
    ctx.lineTo(snap.x - 8, snap.y);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    // Snap label tooltip
    ctx.shadowBlur = 0;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#67e8f9';
    const tag = snap.type === 'intersection' ? 'SNAP [INTERSECTION]' : `SNAP [${snap.type.toUpperCase()}]`;
    ctx.fillText(tag, snap.x + 12, snap.y + 4);

    ctx.restore();
  }

  renderCoordinatesHUD(ctx, w, h) {
    ctx.save();
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.textAlign = 'right';
    const snapLabel = this.snappedPoint ? ` | ${this.snappedPoint.label || 'SNAPPED'}` : '';
    ctx.fillText(`COORD [X: ${Math.round(this.mouse.x)}, Y: ${Math.round(this.mouse.y)}]${snapLabel}`, w - 16, h - 12);
    ctx.restore();
  }
}

if (typeof window !== 'undefined') {
  window.GeometryEngine = GeometryEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GeometryEngine };
}
