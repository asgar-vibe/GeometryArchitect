/**
 * ============================================================================
 * GEOMETRY ARCHITECT - CREATOR STUDIO & LEVEL EDITOR ENGINE
 * ============================================================================
 * Visual CAD editor for designing, simulating, and exporting custom missions.
 * Strict Data-Driven Architecture matching `js/levels.js` schema.
 * ============================================================================
 */

class CreatorStudio {
  constructor() {
    this.canvas = document.getElementById('blueprint-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.math = window.GeoMath;

    // Logical dimensions (matches engine aspect ratio)
    this.logicalWidth = 900;
    this.logicalHeight = 560;

    // Editor Scene Data
    this.entities = [];
    this.selectedEntity = null;
    this.hoveredEntity = null;
    this.hoveredHandle = null;     // 'p1' | 'p2' | null
    this.dragTarget = null;        // { entity, part: 'body' | 'p1' | 'p2', offset: {x, y} }
    this.inProgressLine = null;    // { p1, tool, role }
    this.activeTool = 'select';    // 'select' | 'mirror' | 'obstacle' | 'guide' | 'emitter' | 'target' | 'node' | 'delete'
    this.gridSnap = 20;            // 20 | 10 | 0 (free)
    this.snappedPoint = null;
    this.mouse = { x: 0, y: 0, isDown: false };
    this.undoStack = [];

    // Test Simulation Engine
    this.isTestMode = false;
    this.testEngine = null;

    // Web Audio Synthesizer
    this.initAudio();

    // DOM Element References
    this.initDOM();

    // Setup Canvas DPI & Bindings
    this.setupCanvasDPI();
    this.bindEvents();
    this.populatePresets();
    this.loadInitialScene();

    // Start Editor Render Loop
    this.startEditorLoop();
  }

  // --------------------------------------------------------------------------
  // [1] Audio Synthesizer
  // --------------------------------------------------------------------------

  initAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.soundEnabled = true;
    } catch (e) {
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
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, t);
      osc.frequency.exponentialRampToValueAtTime(1400, t + 0.03);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      osc.start(t);
      osc.stop(t + 0.03);
    } else if (type === 'place') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.start(t);
      osc.stop(t + 0.08);
    } else if (type === 'delete') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.1);
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
    } else if (type === 'select') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(750, t + 0.04);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.start(t);
      osc.stop(t + 0.04);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.setValueAtTime(140, t + 0.06);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  }

  // --------------------------------------------------------------------------
  // [2] DOM References & Tool Switching
  // --------------------------------------------------------------------------

  initDOM() {
    // Toolbar buttons
    this.toolButtons = {
      select: document.getElementById('tool-select'),
      mirror: document.getElementById('tool-place-mirror'),
      obstacle: document.getElementById('tool-place-obstacle'),
      guide: document.getElementById('tool-place-guide'),
      emitter: document.getElementById('tool-place-emitter'),
      target: document.getElementById('tool-place-target'),
      node: document.getElementById('tool-place-node'),
      delete: document.getElementById('tool-delete-entity')
    };

    // Other control elements
    this.btnToggleTest = document.getElementById('btn-toggle-test');
    this.testModeIcon = document.getElementById('test-mode-icon');
    this.testModeLabel = document.getElementById('test-mode-label');
    this.btnExportCode = document.getElementById('btn-export-code');
    this.presetSelect = document.getElementById('preset-select');
    this.gridSnapSelect = document.getElementById('grid-snap-select');
    this.btnClearCanvas = document.getElementById('btn-clear-canvas');

    // Status HUD
    this.statusIndicator = document.getElementById('status-indicator');
    this.statusMessage = document.getElementById('status-message');
    this.entityCounter = document.getElementById('entity-counter');
    this.coordHud = document.getElementById('coord-hud');

    // Tabs
    this.tabMissionBtn = document.getElementById('tab-mission-btn');
    this.tabEntitiesBtn = document.getElementById('tab-entities-btn');
    this.tabMissionContent = document.getElementById('tab-mission-content');
    this.tabEntitiesContent = document.getElementById('tab-entities-content');
    this.tabEntityCount = document.getElementById('tab-entity-count');
    this.entityTreeCount = document.getElementById('entity-tree-count');
    this.entityListContainer = document.getElementById('entity-list-container');

    // Mission Settings Form
    this.form = {
      id: document.getElementById('cfg-id'),
      title: document.getElementById('cfg-title'),
      subtitle: document.getElementById('cfg-subtitle'),
      briefing: document.getElementById('cfg-briefing'),
      theory: document.getElementById('cfg-theory'),
      winType: document.getElementById('cfg-win-type'),
      tolerance: document.getElementById('cfg-tolerance'),
      minBounces: document.getElementById('cfg-min-bounces'),
      maxBounces: document.getElementById('cfg-max-bounces'),
      allowPoint: document.getElementById('tool-allow-point'),
      allowLine: document.getElementById('tool-allow-line'),
      allowCircle: document.getElementById('tool-allow-circle'),
      allowAim: document.getElementById('tool-allow-aim')
    };

    // Test Mode Overlays
    this.testModeBanner = document.getElementById('test-mode-banner');
    this.testVictoryBanner = document.getElementById('test-victory-banner');
    this.testVictorySub = document.getElementById('test-victory-sub');
    this.testControlsBar = document.getElementById('test-controls-bar');
    this.testToolAim = document.getElementById('test-tool-aim');
    this.testToolLine = document.getElementById('test-tool-line');
    this.testToolCircle = document.getElementById('test-tool-circle');
    this.testToolPoint = document.getElementById('test-tool-point');
    this.testBtnUndo = document.getElementById('test-btn-undo');
    this.testBtnClear = document.getElementById('test-btn-clear');
    this.testBtnFire = document.getElementById('test-btn-fire');
    this.testFireLabel = document.getElementById('test-fire-label');
    this.testBtnExit = document.getElementById('test-btn-exit');

    // Export Modal
    this.exportModal = document.getElementById('export-modal');
    this.exportCodeArea = document.getElementById('export-code-area');
    this.btnCopyCode = document.getElementById('btn-copy-code');
    this.btnCloseExport = document.getElementById('btn-close-export');
    this.btnDismissExport = document.getElementById('btn-dismiss-export');
    this.copyStatus = document.getElementById('copy-status');
  }

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

  setTool(tool) {
    if (this.isTestMode) return;
    this.activeTool = tool;
    this.inProgressLine = null;
    this.selectedEntity = null;

    Object.keys(this.toolButtons).forEach((key) => {
      const btn = this.toolButtons[key];
      if (btn) {
        if (key === tool) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    const toolPrompts = {
      select: 'SELECT: Click an entity to select/inspect. Drag endpoints or bodies to reposition.',
      mirror: 'MIRROR: Click 1st point, then click 2nd point to place a Speculum Nano-Mirror line.',
      obstacle: 'OBSTACLE: Click 1st point, then click 2nd point to place a Dark Matter Blast Barrier.',
      guide: 'GUIDE: Click 1st point, then click 2nd point to place a dashed geometric reference line.',
      emitter: 'EMITTER: Click canvas to position the Quantum Laser Emitter source.',
      target: 'TARGET: Click canvas to position the Target Receiver sensor.',
      node: 'NODE: Click canvas to place an Orbital Shield Defense Node (for Circumcircle missions).',
      delete: 'ERASER: Click any entity or handle to immediately delete it from the scene.'
    };

    this.setStatus(toolPrompts[tool] || 'Ready', 'info');
    this.playSound('select');
  }

  setStatus(message, type = 'info') {
    if (this.statusMessage) {
      this.statusMessage.textContent = message;
    }
    if (this.statusIndicator) {
      this.statusIndicator.className = 'w-2 h-2 rounded-full mr-2';
      if (type === 'error') {
        this.statusIndicator.classList.add('bg-rose-500', 'shadow-[0_0_8px_#ef4444]');
      } else if (type === 'success') {
        this.statusIndicator.classList.add('bg-emerald-400', 'shadow-[0_0_8px_#10b981]');
      } else if (type === 'warning') {
        this.statusIndicator.classList.add('bg-amber-400', 'shadow-[0_0_8px_#f59e0b]');
      } else {
        this.statusIndicator.classList.add('bg-cyan-400', 'shadow-[0_0_8px_#06b6d4]');
      }
    }
  }

  // --------------------------------------------------------------------------
  // [3] Event Bindings & Snapping
  // --------------------------------------------------------------------------

  bindEvents() {
    window.addEventListener('resize', () => {
      this.setupCanvasDPI();
    });

    // Toolbar buttons
    Object.keys(this.toolButtons).forEach((key) => {
      this.toolButtons[key]?.addEventListener('click', () => this.setTool(key));
    });

    // Grid snap selector
    this.gridSnapSelect?.addEventListener('change', (e) => {
      this.gridSnap = parseInt(e.target.value, 10);
      this.playSound('snap');
      this.setStatus(`Grid snapping set to ${this.gridSnap === 0 ? 'OFF (Free)' : this.gridSnap + 'px'}.`);
    });

    // Clear canvas
    this.btnClearCanvas?.addEventListener('click', () => {
      if (this.entities.length === 0) return;
      if (confirm('Clear all entities from the scene?')) {
        this.recordUndo();
        this.entities = [];
        this.selectedEntity = null;
        this.inProgressLine = null;
        this.updateInspectorUI();
        this.playSound('delete');
        this.setStatus('Scene cleared.', 'warning');
      }
    });

    // Preset level loader
    this.presetSelect?.addEventListener('change', (e) => {
      const val = e.target.value;
      if (!val) {
        if (confirm('Reset to an empty mission template?')) {
          this.resetToBlankMission();
        }
      } else {
        this.loadPresetLevel(val);
      }
    });

    // Test mode toggle
    this.btnToggleTest?.addEventListener('click', () => this.toggleTestMode());
    this.testBtnExit?.addEventListener('click', () => this.toggleTestMode());

    // Export code modal buttons
    this.btnExportCode?.addEventListener('click', () => this.openExportModal());
    this.btnCloseExport?.addEventListener('click', () => this.closeExportModal());
    this.btnDismissExport?.addEventListener('click', () => this.closeExportModal());
    this.btnCopyCode?.addEventListener('click', () => this.copyExportedCode());

    // Inspector Tabs
    this.tabMissionBtn?.addEventListener('click', () => this.switchTab('mission'));
    this.tabEntitiesBtn?.addEventListener('click', () => this.switchTab('entities'));

    // Canvas Pointer Events
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
      if (this.isTestMode) return;
      const rawPos = getPos(e);
      this.mouse.x = rawPos.x;
      this.mouse.y = rawPos.y;

      const prevSnap = this.snappedPoint;
      this.snappedPoint = this.calculateSnapPoint(rawPos);
      const activePos = this.snappedPoint ? { x: this.snappedPoint.x, y: this.snappedPoint.y } : rawPos;

      if (this.snappedPoint && !prevSnap) {
        this.playSound('snap');
      }

      // Update Coordinate HUD
      if (this.coordHud) {
        this.coordHud.textContent = `X: ${Math.round(activePos.x)}, Y: ${Math.round(activePos.y)}${this.snappedPoint ? ' (SNAP)' : ''}`;
      }

      // Dragging logic
      if (this.mouse.isDown && this.dragTarget) {
        this.handleDragMove(activePos);
        return;
      }

      // In-progress line preview
      if (this.inProgressLine) {
        this.inProgressLine.p2 = activePos;
        return;
      }

      // Hover detection in Select / Delete tools
      if (this.activeTool === 'select' || this.activeTool === 'delete') {
        const hit = this.hitTest(rawPos);
        this.hoveredEntity = hit ? hit.entity : null;
        this.hoveredHandle = hit ? hit.part : null;
        this.canvas.style.cursor = hit ? (hit.part ? 'crosshair' : 'move') : 'default';
      } else {
        this.hoveredEntity = null;
        this.hoveredHandle = null;
        this.canvas.style.cursor = 'crosshair';
      }
    };

    const handlePointerDown = (e) => {
      if (this.isTestMode) return;
      if (e.button && e.button !== 0) return; // Only primary button
      this.mouse.isDown = true;
      const rawPos = getPos(e);
      const activePos = this.snappedPoint ? { x: this.snappedPoint.x, y: this.snappedPoint.y } : rawPos;

      this.handleCanvasClick(activePos, rawPos);
    };

    const handlePointerUp = () => {
      if (this.isTestMode) return;
      this.mouse.isDown = false;
      if (this.dragTarget) {
        this.dragTarget = null;
        this.updateInspectorUI();
      }
    };

    this.canvas.addEventListener('mousemove', handlePointerMove);
    this.canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);

    this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); handlePointerMove(e); }, { passive: false });
    this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handlePointerDown(e); }, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts if user is typing in form inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      const key = e.key.toLowerCase();
      if (key === 'v') this.setTool('select');
      else if (key === 'm') this.setTool('mirror');
      else if (key === 'o') this.setTool('obstacle');
      else if (key === 'g') this.setTool('guide');
      else if (key === 'e') this.setTool('emitter');
      else if (key === 't') this.setTool('target');
      else if (key === 'n') this.setTool('node');
      else if (key === 'escape') {
        if (this.inProgressLine) {
          this.inProgressLine = null;
          this.setStatus('Placement cancelled.', 'info');
        } else if (this.selectedEntity) {
          this.selectedEntity = null;
          this.updateInspectorUI();
        }
      } else if (key === 'delete' || key === 'backspace') {
        if (this.selectedEntity) {
          this.recordUndo();
          this.deleteEntity(this.selectedEntity);
          this.selectedEntity = null;
          this.updateInspectorUI();
          this.playSound('delete');
          this.setStatus('Selected entity deleted.', 'warning');
        }
      } else if (e.ctrlKey && key === 'z') {
        e.preventDefault();
        this.undo();
      } else if (key === ' ' && this.isTestMode) {
        // Space fires laser in test mode
        e.preventDefault();
        this.testEngine?.runSimulation();
      }
    });
  }

  // --------------------------------------------------------------------------
  // [4] Snapping Calculations & Hit Testing
  // --------------------------------------------------------------------------

  calculateSnapPoint(pos) {
    const snapThreshold = 14;
    let closestPoint = null;
    let minDist = snapThreshold;

    // 1. Prioritize snapping to existing points & line endpoints
    for (const e of this.entities) {
      if (e.type === 'point') {
        const d = this.math.distance(pos, e);
        if (d < minDist) {
          minDist = d;
          closestPoint = { x: e.x, y: e.y, label: e.label, type: e.role };
        }
      } else if (e.type === 'line') {
        const d1 = this.math.distance(pos, e.p1);
        if (d1 < minDist) {
          minDist = d1;
          closestPoint = { x: e.p1.x, y: e.p1.y, label: `${e.label} P1`, type: 'endpoint' };
        }
        const d2 = this.math.distance(pos, e.p2);
        if (d2 < minDist) {
          minDist = d2;
          closestPoint = { x: e.p2.x, y: e.p2.y, label: `${e.label} P2`, type: 'endpoint' };
        }
      }
    }

    if (closestPoint) return closestPoint;

    // 2. Secondary: Snap to Cartesian Grid (if gridSnap enabled)
    if (this.gridSnap > 0) {
      const gx = Math.round(pos.x / this.gridSnap) * this.gridSnap;
      const gy = Math.round(pos.y / this.gridSnap) * this.gridSnap;
      const dGrid = this.math.distance(pos, { x: gx, y: gy });
      if (dGrid < 12) {
        return { x: gx, y: gy, label: `GRID (${gx}, ${gy})`, type: 'grid' };
      }
    }

    return null;
  }

  hitTest(pos) {
    const handleRadius = 12;

    // Reverse iterate so top-rendered entities are hit first
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];

      if (e.type === 'point') {
        const d = this.math.distance(pos, e);
        if (d <= Math.max(handleRadius, (e.style?.radius || 8) + 4)) {
          return { entity: e, part: 'body' };
        }
      } else if (e.type === 'line') {
        // Check endpoint handles first
        if (this.math.distance(pos, e.p1) <= handleRadius) {
          return { entity: e, part: 'p1' };
        }
        if (this.math.distance(pos, e.p2) <= handleRadius) {
          return { entity: e, part: 'p2' };
        }
        // Check line body
        const cp = this.math.closestPointOnSegment(pos, e.p1, e.p2);
        if (this.math.distance(pos, cp) <= 10) {
          return { entity: e, part: 'body' };
        }
      }
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // [5] Canvas Click & Tool Actions
  // --------------------------------------------------------------------------

  handleCanvasClick(activePos, rawPos) {
    // [A] SELECT TOOL
    if (this.activeTool === 'select') {
      const hit = this.hitTest(rawPos);
      if (hit) {
        this.selectedEntity = hit.entity;
        this.dragTarget = {
          entity: hit.entity,
          part: hit.part,
          startX: activePos.x,
          startY: activePos.y,
          originP1: hit.entity.p1 ? { ...hit.entity.p1 } : null,
          originP2: hit.entity.p2 ? { ...hit.entity.p2 } : null,
          originPos: hit.entity.x !== undefined ? { x: hit.entity.x, y: hit.entity.y } : null
        };
        this.recordUndo();
        this.playSound('select');
        this.updateInspectorUI();
        this.setStatus(`Selected ${hit.entity.label || hit.entity.role}. Drag to reposition.`);
      } else {
        this.selectedEntity = null;
        this.updateInspectorUI();
      }
      return;
    }

    // [B] DELETE TOOL
    if (this.activeTool === 'delete') {
      const hit = this.hitTest(rawPos);
      if (hit) {
        this.recordUndo();
        this.deleteEntity(hit.entity);
        if (this.selectedEntity === hit.entity) this.selectedEntity = null;
        this.playSound('delete');
        this.updateInspectorUI();
        this.setStatus(`Deleted ${hit.entity.label || hit.entity.role}.`, 'warning');
      }
      return;
    }

    // [C] LINE TOOLS: Mirror, Obstacle, Guide
    if (['mirror', 'obstacle', 'guide'].includes(this.activeTool)) {
      if (!this.inProgressLine) {
        // Step 1: Place first endpoint
        this.inProgressLine = {
          p1: { x: activePos.x, y: activePos.y },
          p2: { x: activePos.x, y: activePos.y },
          tool: this.activeTool
        };
        this.playSound('snap');
        this.setStatus(`Placed Start Point at (${Math.round(activePos.x)}, ${Math.round(activePos.y)}). Click to set End Point.`);
      } else {
        // Step 2: Place second endpoint
        const p1 = this.inProgressLine.p1;
        const p2 = { x: activePos.x, y: activePos.y };
        if (this.math.distance(p1, p2) < 10) {
          this.playSound('error');
          this.setStatus('Line too short. Please click a point further away.', 'warning');
          return;
        }

        this.recordUndo();
        const role = this.activeTool;
        let style = { strokeStyle: '#38bdf8', lineWidth: 4, glow: true };
        let prefix = 'mirror';
        let defaultLabel = `Mirror M${this.entities.filter(e => e.role === 'mirror').length + 1}`;

        if (role === 'obstacle') {
          style = { strokeStyle: '#ef4444', lineWidth: 6, lineDash: [8, 4] };
          prefix = 'barrier';
          defaultLabel = `Barrier W${this.entities.filter(e => e.role === 'obstacle').length + 1}`;
        } else if (role === 'guide') {
          style = { strokeStyle: '#64748b', lineWidth: 1.5, lineDash: [5, 5] };
          prefix = 'guide';
          defaultLabel = `Guide G${this.entities.filter(e => e.role === 'guide').length + 1}`;
        }

        const newEntity = {
          id: `${prefix}_${Date.now()}`,
          type: 'line',
          p1: p1,
          p2: p2,
          role: role,
          label: defaultLabel,
          isFixed: true,
          style: style
        };

        this.entities.push(newEntity);
        this.selectedEntity = newEntity;
        this.inProgressLine = null;
        this.playSound('place');
        this.updateInspectorUI();
        this.setStatus(`Created ${newEntity.label}.`, 'success');
      }
      return;
    }

    // [D] POINT TOOLS: Emitter, Target, Node
    if (['emitter', 'target', 'node'].includes(this.activeTool)) {
      this.recordUndo();

      if (this.activeTool === 'emitter') {
        // Enforce 1 primary emitter
        let existingEmitter = this.entities.find(e => e.role === 'laser_source');
        if (existingEmitter) {
          existingEmitter.x = activePos.x;
          existingEmitter.y = activePos.y;
          this.selectedEntity = existingEmitter;
          this.playSound('place');
          this.setStatus(`Moved Laser Emitter to (${Math.round(activePos.x)}, ${Math.round(activePos.y)}).`, 'success');
        } else {
          const newEmitter = {
            id: `emitter_A`,
            type: 'point',
            x: activePos.x,
            y: activePos.y,
            role: 'laser_source',
            label: 'Emitter Alpha (A)',
            isFixed: true,
            style: { fillStyle: '#06b6d4', radius: 8 }
          };
          this.entities.push(newEmitter);
          this.selectedEntity = newEmitter;
          this.playSound('place');
          this.setStatus('Laser Emitter Alpha deployed.', 'success');
        }
      } else if (this.activeTool === 'target') {
        // Enforce 1 primary target
        let existingTarget = this.entities.find(e => e.role === 'target');
        if (existingTarget) {
          existingTarget.x = activePos.x;
          existingTarget.y = activePos.y;
          this.selectedEntity = existingTarget;
          this.playSound('place');
          this.setStatus(`Moved Target Receiver to (${Math.round(activePos.x)}, ${Math.round(activePos.y)}).`, 'success');
        } else {
          const newTarget = {
            id: `target_B`,
            type: 'point',
            x: activePos.x,
            y: activePos.y,
            role: 'target',
            label: 'Receiver Beta (B)',
            isFixed: true,
            style: { fillStyle: '#10b981', radius: 10, pulsing: true }
          };
          this.entities.push(newTarget);
          this.selectedEntity = newTarget;
          this.playSound('place');
          this.setStatus('Target Receiver deployed.', 'success');
        }
      } else if (this.activeTool === 'node') {
        const nodeCount = this.entities.filter(e => e.role === 'shield_node').length;
        const letter = String.fromCharCode(65 + (nodeCount % 26));
        const newNode = {
          id: `node_${letter.toLowerCase()}_${Date.now()}`,
          type: 'point',
          x: activePos.x,
          y: activePos.y,
          role: 'shield_node',
          label: `Node ${letter}`,
          isFixed: true,
          style: { fillStyle: '#3b82f6', radius: 7 }
        };
        this.entities.push(newNode);
        this.selectedEntity = newNode;
        this.playSound('place');
        this.setStatus(`Orbital Shield Node ${letter} deployed.`, 'success');
      }

      this.updateInspectorUI();
    }
  }

  handleDragMove(pos) {
    const dt = this.dragTarget;
    if (!dt || !dt.entity) return;

    if (dt.entity.type === 'point') {
      dt.entity.x = pos.x;
      dt.entity.y = pos.y;
    } else if (dt.entity.type === 'line') {
      if (dt.part === 'p1') {
        dt.entity.p1.x = pos.x;
        dt.entity.p1.y = pos.y;
      } else if (dt.part === 'p2') {
        dt.entity.p2.x = pos.x;
        dt.entity.p2.y = pos.y;
      } else if (dt.part === 'body') {
        const dx = pos.x - dt.startX;
        const dy = pos.y - dt.startY;
        dt.entity.p1.x = dt.originP1.x + dx;
        dt.entity.p1.y = dt.originP1.y + dy;
        dt.entity.p2.x = dt.originP2.x + dx;
        dt.entity.p2.y = dt.originP2.y + dy;
      }
    }
  }

  deleteEntity(entity) {
    const idx = this.entities.indexOf(entity);
    if (idx !== -1) {
      this.entities.splice(idx, 1);
    }
  }

  recordUndo() {
    this.undoStack.push(JSON.stringify(this.entities));
    if (this.undoStack.length > 25) this.undoStack.shift();
  }

  undo() {
    if (this.undoStack.length === 0) return;
    const prev = this.undoStack.pop();
    this.entities = JSON.parse(prev);
    this.selectedEntity = null;
    this.inProgressLine = null;
    this.updateInspectorUI();
    this.playSound('snap');
    this.setStatus('Undid last action.', 'info');
  }

  // --------------------------------------------------------------------------
  // [6] Presets & Initial Scene Loader
  // --------------------------------------------------------------------------

  populatePresets() {
    if (!this.presetSelect || !window.levelData) return;
    this.presetSelect.innerHTML = '<option value="">-- Blank Mission --</option>';

    window.levelData.forEach((lvl, i) => {
      const opt = document.createElement('option');
      opt.value = lvl.id;
      opt.textContent = `${lvl.title}`;
      this.presetSelect.appendChild(opt);
    });
  }

  loadInitialScene() {
    // Default to Level 1 as an educational starting template
    if (window.levelData && window.levelData.length > 0) {
      this.loadPresetLevel(window.levelData[0].id);
      if (this.presetSelect) this.presetSelect.value = window.levelData[0].id;
    } else {
      this.resetToBlankMission();
    }
  }

  loadPresetLevel(levelId) {
    const template = window.levelData?.find(l => l.id === levelId);
    if (!template) return;

    this.recordUndo();
    this.entities = JSON.parse(JSON.stringify(template.initialEntities || []));
    this.selectedEntity = null;
    this.inProgressLine = null;

    // Populate Mission Settings Form
    if (this.form.id) this.form.id.value = template.id || 'custom-mission';
    if (this.form.title) this.form.title.value = template.title || 'Custom Mission';
    if (this.form.subtitle) this.form.subtitle.value = template.subtitle || 'Geometric Construction';
    if (this.form.briefing) this.form.briefing.value = template.briefing || '';
    if (this.form.theory) this.form.theory.value = template.geometricTheory || '';

    if (template.winCondition) {
      if (this.form.winType) this.form.winType.value = template.winCondition.type || 'laser_hit_target';
      if (this.form.tolerance) this.form.tolerance.value = template.winCondition.tolerance ?? 15;
      if (this.form.minBounces) this.form.minBounces.value = template.winCondition.minBounces ?? 1;
      if (this.form.maxBounces) this.form.maxBounces.value = template.winCondition.maxBounces ?? 5;
    }

    const tools = template.availableTools || ['point', 'line', 'circle', 'aim'];
    if (this.form.allowPoint) this.form.allowPoint.checked = tools.includes('point');
    if (this.form.allowLine) this.form.allowLine.checked = tools.includes('line');
    if (this.form.allowCircle) this.form.allowCircle.checked = tools.includes('circle');
    if (this.form.allowAim) this.form.allowAim.checked = tools.includes('aim');

    this.updateInspectorUI();
    this.setStatus(`Loaded template: '${template.title}'. Ready to edit or test!`, 'success');
  }

  resetToBlankMission() {
    this.recordUndo();
    this.entities = [];
    this.selectedEntity = null;
    this.inProgressLine = null;

    if (this.form.id) this.form.id.value = `custom-mission-${Date.now().toString().slice(-4)}`;
    if (this.form.title) this.form.title.value = 'My Custom Mission';
    if (this.form.subtitle) this.form.subtitle.value = 'Euclidean Laser Construction';
    if (this.form.briefing) this.form.briefing.value = 'Transmit the quantum laser beam from Emitter to Target Receiver by constructing the optimal reflection path!';
    if (this.form.theory) this.form.theory.value = '💡 Architect\'s Field Manual:\nConstruct lines and circles to locate the exact reflection point on the mirrors!';
    if (this.form.winType) this.form.winType.value = 'laser_hit_target';
    if (this.form.tolerance) this.form.tolerance.value = 15;
    if (this.form.minBounces) this.form.minBounces.value = 1;
    if (this.form.maxBounces) this.form.maxBounces.value = 5;

    this.updateInspectorUI();
    this.setStatus('Blank mission created. Use the palette on the left to place mirrors and sensors.', 'info');
  }

  // --------------------------------------------------------------------------
  // [7] Inspector & UI Synchronization
  // --------------------------------------------------------------------------

  switchTab(tab) {
    if (tab === 'mission') {
      this.tabMissionBtn?.classList.add('border-cyan-400', 'text-cyan-300', 'bg-blueprint-800/40');
      this.tabMissionBtn?.classList.remove('border-transparent', 'text-slate-400');
      this.tabEntitiesBtn?.classList.remove('border-cyan-400', 'text-cyan-300', 'bg-blueprint-800/40');
      this.tabEntitiesBtn?.classList.add('border-transparent', 'text-slate-400');
      this.tabMissionContent?.classList.remove('hidden');
      this.tabEntitiesContent?.classList.add('hidden');
    } else {
      this.tabEntitiesBtn?.classList.add('border-cyan-400', 'text-cyan-300', 'bg-blueprint-800/40');
      this.tabEntitiesBtn?.classList.remove('border-transparent', 'text-slate-400');
      this.tabMissionBtn?.classList.remove('border-cyan-400', 'text-cyan-300', 'bg-blueprint-800/40');
      this.tabMissionBtn?.classList.add('border-transparent', 'text-slate-400');
      this.tabEntitiesContent?.classList.remove('hidden');
      this.tabMissionContent?.classList.add('hidden');
    }
  }

  updateInspectorUI() {
    const count = this.entities.length;
    if (this.entityCounter) this.entityCounter.textContent = `ENTITIES: ${count}`;
    if (this.tabEntityCount) this.tabEntityCount.textContent = count;
    if (this.entityTreeCount) this.entityTreeCount.textContent = `${count} item${count === 1 ? '' : 's'}`;

    if (!this.entityListContainer) return;

    if (count === 0) {
      this.entityListContainer.innerHTML = `
        <p class="text-slate-500 italic py-6 text-center text-xs">
          No entities placed yet.<br>Use the toolbar on the left to add items.
        </p>
      `;
      return;
    }

    this.entityListContainer.innerHTML = '';
    this.entities.forEach((entity) => {
      const isSelected = this.selectedEntity === entity;
      const row = document.createElement('div');
      row.className = `p-2 rounded border transition-all text-xs flex flex-col space-y-1.5 ${
        isSelected
          ? 'bg-cyan-950/60 border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
          : 'bg-blueprint-800/60 border-sky-900/60 hover:border-sky-500/40'
      }`;

      // Badge role details
      let badgeColor = 'bg-sky-900 text-sky-200';
      let roleIcon = '📏';
      if (entity.role === 'mirror') {
        badgeColor = 'bg-cyan-950 text-cyan-300 border border-cyan-500/30';
        roleIcon = '🪞';
      } else if (entity.role === 'obstacle') {
        badgeColor = 'bg-rose-950 text-rose-300 border border-rose-500/30';
        roleIcon = '🛑';
      } else if (entity.role === 'guide') {
        badgeColor = 'bg-slate-800 text-slate-300 border border-slate-600/30';
        roleIcon = '📐';
      } else if (entity.role === 'laser_source') {
        badgeColor = 'bg-cyan-900 text-cyan-200 border border-cyan-400/40';
        roleIcon = '⚡';
      } else if (entity.role === 'target') {
        badgeColor = 'bg-emerald-950 text-emerald-300 border border-emerald-500/30';
        roleIcon = '🎯';
      } else if (entity.role === 'shield_node') {
        badgeColor = 'bg-blue-950 text-blue-300 border border-blue-500/30';
        roleIcon = '🛡️';
      }

      // Format coordinates
      let coordStr = '';
      if (entity.type === 'point') {
        coordStr = `(${Math.round(entity.x)}, ${Math.round(entity.y)})`;
      } else if (entity.type === 'line') {
        coordStr = `(${Math.round(entity.p1.x)}, ${Math.round(entity.p1.y)}) → (${Math.round(entity.p2.x)}, ${Math.round(entity.p2.y)})`;
      }

      row.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 truncate">
            <span class="text-xs">${roleIcon}</span>
            <span class="font-bold text-white truncate cursor-pointer hover:text-cyan-300">${entity.label || entity.id}</span>
            <span class="text-[9px] uppercase px-1 py-0.5 rounded ${badgeColor} font-mono">${entity.role || entity.type}</span>
          </div>
          <div class="flex items-center space-x-1">
            <button class="btn-del-item text-slate-400 hover:text-rose-400 px-1 py-0.5 rounded text-xs" title="Delete">🗑</button>
          </div>
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>${coordStr}</span>
          <button class="btn-select-item text-cyan-400 hover:underline text-[10px]">SELECT</button>
        </div>
      `;

      // Click to select
      row.querySelector('.btn-select-item').addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedEntity = entity;
        this.updateInspectorUI();
        this.playSound('select');
      });
      row.addEventListener('click', () => {
        this.selectedEntity = entity;
        this.updateInspectorUI();
        this.playSound('select');
      });

      // Click to delete
      row.querySelector('.btn-del-item').addEventListener('click', (e) => {
        e.stopPropagation();
        this.recordUndo();
        this.deleteEntity(entity);
        if (this.selectedEntity === entity) this.selectedEntity = null;
        this.updateInspectorUI();
        this.playSound('delete');
        this.setStatus(`Deleted ${entity.label}.`, 'warning');
      });

      this.entityListContainer.appendChild(row);
    });
  }

  // --------------------------------------------------------------------------
  // [8] Test Simulation Mode (Player Experience Validation)
  // --------------------------------------------------------------------------

  toggleTestMode() {
    if (this.isTestMode) {
      this.exitTestMode();
    } else {
      this.enterTestMode();
    }
  }

  enterTestMode() {
    // Mission validation check
    const winType = this.form.winType ? this.form.winType.value : 'laser_hit_target';
    const emitter = this.entities.find(e => e.role === 'laser_source');
    const target = this.entities.find(e => e.role === 'target');
    const nodes = this.entities.filter(e => e.role === 'shield_node');

    if (winType === 'laser_hit_target') {
      if (!emitter) {
        alert("Cannot start test mode: No Laser Emitter placed in scene! Place an Emitter using the [E] tool.");
        this.setStatus("Test Aborted: Emitter required for laser missions.", "error");
        this.playSound('error');
        return;
      }
      if (!target) {
        alert("Cannot start test mode: No Target Receiver placed in scene! Place a Target using the [T] tool.");
        this.setStatus("Test Aborted: Target Receiver required.", "error");
        this.playSound('error');
        return;
      }
    } else if (winType === 'circumcircle_fit') {
      if (nodes.length < 3) {
        alert("Cannot start test mode: Circumcircle missions require at least 3 Shield Nodes [N] placed on canvas.");
        this.setStatus("Test Aborted: At least 3 nodes required.", "error");
        this.playSound('error');
        return;
      }
    }

    this.isTestMode = true;
    this.selectedEntity = null;
    this.inProgressLine = null;

    // Build complete level object
    const levelObj = this.buildLevelObject();

    // UI Updates
    if (this.testModeIcon) this.testModeIcon.textContent = '■';
    if (this.testModeLabel) this.testModeLabel.textContent = 'EDIT SCENE';
    if (this.btnToggleTest) {
      this.btnToggleTest.classList.remove('text-amber-300', 'border-amber-500/40');
      this.btnToggleTest.classList.add('text-rose-400', 'border-rose-500', 'bg-rose-950/40');
    }

    if (this.testModeBanner) this.testModeBanner.classList.remove('hidden');
    if (this.testControlsBar) this.testControlsBar.classList.remove('hidden');
    if (this.testVictoryBanner) this.testVictoryBanner.classList.add('hidden');

    // Instantiate fresh GeometryEngine on canvas
    this.testEngine = new window.GeometryEngine(this.canvas, {
      onLevelWin: (details) => {
        if (this.testVictoryBanner) {
          this.testVictoryBanner.classList.remove('hidden');
          if (this.testVictorySub && details?.bounces !== undefined) {
            this.testVictorySub.textContent = `Laser struck Receiver with ${details.bounces} reflections (Required min: ${levelObj.winCondition.minBounces}).`;
          }
        }
        this.setStatus("★ TEST PASSED: Solution verified! Level is solvable.", "success");
      },
      onStatusChange: (status) => {
        this.setStatus(status.message, status.type);
      },
      onToolChange: (tool) => {
        this.updateTestToolButtons(tool);
      }
    });

    // Configure test engine with our custom level
    this.testEngine.loadLevel(levelObj);

    // Bind Test Bar Buttons
    this.bindTestBarControls(levelObj);

    this.setStatus("TEST MODE ACTIVE: Test laser aiming and Euclidean CAD tools as a player.", "info");
    this.playSound('place');
  }

  exitTestMode() {
    this.isTestMode = false;

    if (this.testEngine) {
      this.testEngine.destroy();
      this.testEngine = null;
    }

    // Restore UI
    if (this.testModeIcon) this.testModeIcon.textContent = '▶';
    if (this.testModeLabel) this.testModeLabel.textContent = 'TEST PUZZLE';
    if (this.btnToggleTest) {
      this.btnToggleTest.classList.remove('text-rose-400', 'border-rose-500', 'bg-rose-950/40');
      this.btnToggleTest.classList.add('text-amber-300', 'border-amber-500/40');
    }

    if (this.testModeBanner) this.testModeBanner.classList.add('hidden');
    if (this.testControlsBar) this.testControlsBar.classList.add('hidden');
    if (this.testVictoryBanner) this.testVictoryBanner.classList.add('hidden');

    this.setupCanvasDPI();
    this.setTool(this.activeTool);
    this.updateInspectorUI();
    this.setStatus("Returned to Editor Mode. Continue designing or export JS code.", "info");
    this.playSound('snap');
  }

  bindTestBarControls(levelObj) {
    if (!this.testEngine) return;

    // Filter available tools according to level configuration
    const allowed = levelObj.availableTools || ['point', 'line', 'circle', 'aim'];

    if (this.testToolAim) {
      this.testToolAim.style.display = allowed.includes('aim') ? 'inline-flex' : 'none';
      this.testToolAim.onclick = () => this.testEngine?.setTool('aim');
    }
    if (this.testToolLine) {
      this.testToolLine.style.display = allowed.includes('line') ? 'inline-flex' : 'none';
      this.testToolLine.onclick = () => this.testEngine?.setTool('line');
    }
    if (this.testToolCircle) {
      this.testToolCircle.style.display = allowed.includes('circle') ? 'inline-flex' : 'none';
      this.testToolCircle.onclick = () => this.testEngine?.setTool('circle');
    }
    if (this.testToolPoint) {
      this.testToolPoint.style.display = allowed.includes('point') ? 'inline-flex' : 'none';
      this.testToolPoint.onclick = () => this.testEngine?.setTool('point');
    }

    if (this.testBtnUndo) {
      this.testBtnUndo.onclick = () => this.testEngine?.undo();
    }
    if (this.testBtnClear) {
      this.testBtnClear.onclick = () => {
        this.testEngine?.clearPlayerEntities();
        if (this.testVictoryBanner) this.testVictoryBanner.classList.add('hidden');
      };
    }
    if (this.testBtnFire) {
      if (this.testFireLabel) {
        this.testFireLabel.textContent = levelObj.winCondition.type === 'circumcircle_fit' ? 'DEPLOY SHIELD' : 'FIRE LASER';
      }
      this.testBtnFire.onclick = () => {
        if (this.testVictoryBanner) this.testVictoryBanner.classList.add('hidden');
        this.testEngine?.runSimulation();
      };
    }
  }

  updateTestToolButtons(activeTool) {
    const map = {
      aim: this.testToolAim,
      line: this.testToolLine,
      circle: this.testToolCircle,
      point: this.testToolPoint
    };

    Object.keys(map).forEach((t) => {
      const btn = map[t];
      if (btn) {
        if (t === activeTool) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // [9] Level Data Serialization & Code Exporter
  // --------------------------------------------------------------------------

  buildLevelObject() {
    const emitter = this.entities.find(e => e.role === 'laser_source');
    const target = this.entities.find(e => e.role === 'target');

    // Available tools list
    const availableTools = [];
    if (this.form.allowPoint?.checked) availableTools.push('point');
    if (this.form.allowLine?.checked) availableTools.push('line');
    if (this.form.allowCircle?.checked) availableTools.push('circle');
    if (this.form.allowAim?.checked && emitter) availableTools.push('aim');

    // Emitter configuration
    const emitterConfig = emitter ? {
      sourceId: emitter.id,
      defaultAngle: -45,
      canAim: true
    } : null;

    // Win condition configuration
    const winType = this.form.winType ? this.form.winType.value : 'laser_hit_target';
    const tolerance = parseInt(this.form.tolerance?.value || '15', 10);
    const minBounces = parseInt(this.form.minBounces?.value || '1', 10);
    const maxBounces = parseInt(this.form.maxBounces?.value || '5', 10);

    let winCondition;
    if (winType === 'laser_hit_target') {
      winCondition = {
        type: 'laser_hit_target',
        targetId: target ? target.id : 'target_B',
        tolerance: tolerance,
        minBounces: minBounces,
        maxBounces: maxBounces,
        successMessage: `SUCCESS: Quantum signal established with ${minBounces}+ reflection${minBounces > 1 ? 's' : ''}!`
      };
    } else {
      winCondition = {
        type: 'circumcircle_fit',
        tolerance: tolerance,
        successMessage: 'SUCCESS: Circumcenter shield deployed successfully!'
      };
    }

    return {
      id: this.form.id?.value.trim() || `custom-mission-${Date.now()}`,
      title: this.form.title?.value.trim() || 'Custom Mission',
      subtitle: this.form.subtitle?.value.trim() || 'Euclidean Construction',
      briefing: this.form.briefing?.value.trim() || '',
      geometricTheory: this.form.theory?.value.trim() || '',
      canvasSize: { width: 900, height: 560 },
      availableTools: availableTools.length > 0 ? availableTools : ['point', 'line', 'circle', 'aim'],
      emitterConfig: emitterConfig,
      initialEntities: JSON.parse(JSON.stringify(this.entities)),
      winCondition: winCondition
    };
  }

  generateExportJavascript(levelObj) {
    // Generate beautiful, human-readable JavaScript code matching levels.js
    const indent = '  ';
    let code = `  // --------------------------------------------------------------------------\n`;
    code += `  // ${levelObj.title.toUpperCase()}\n`;
    code += `  // --------------------------------------------------------------------------\n`;
    code += `  {\n`;
    code += `    id: ${JSON.stringify(levelObj.id)},\n`;
    code += `    title: ${JSON.stringify(levelObj.title)},\n`;
    code += `    subtitle: ${JSON.stringify(levelObj.subtitle)},\n`;
    code += `    briefing: \`${levelObj.briefing.replace(/`/g, '\\`')}\`,\n`;
    code += `    geometricTheory: \`${levelObj.geometricTheory.replace(/`/g, '\\`')}\`,\n`;
    code += `    canvasSize: { width: 900, height: 560 },\n`;
    code += `    availableTools: ${JSON.stringify(levelObj.availableTools)},\n`;

    if (levelObj.emitterConfig) {
      code += `    emitterConfig: {\n`;
      code += `      sourceId: ${JSON.stringify(levelObj.emitterConfig.sourceId)},\n`;
      code += `      defaultAngle: ${levelObj.emitterConfig.defaultAngle},\n`;
      code += `      canAim: true\n`;
      code += `    },\n`;
    } else {
      code += `    emitterConfig: null,\n`;
    }

    code += `    initialEntities: [\n`;
    levelObj.initialEntities.forEach((ent, idx) => {
      code += `      {\n`;
      code += `        id: ${JSON.stringify(ent.id)},\n`;
      code += `        type: ${JSON.stringify(ent.type)},\n`;
      if (ent.type === 'point') {
        code += `        x: ${Math.round(ent.x)},\n`;
        code += `        y: ${Math.round(ent.y)},\n`;
      } else if (ent.type === 'line') {
        code += `        p1: { x: ${Math.round(ent.p1.x)}, y: ${Math.round(ent.p1.y)} },\n`;
        code += `        p2: { x: ${Math.round(ent.p2.x)}, y: ${Math.round(ent.p2.y)} },\n`;
      }
      code += `        role: ${JSON.stringify(ent.role)},\n`;
      code += `        label: ${JSON.stringify(ent.label)},\n`;
      code += `        isFixed: true,\n`;
      code += `        style: ${JSON.stringify(ent.style)}\n`;
      code += `      }${idx < levelObj.initialEntities.length - 1 ? ',' : ''}\n`;
    });
    code += `    ],\n`;

    code += `    winCondition: {\n`;
    code += `      type: ${JSON.stringify(levelObj.winCondition.type)},\n`;
    if (levelObj.winCondition.type === 'laser_hit_target') {
      code += `      targetId: ${JSON.stringify(levelObj.winCondition.targetId)},\n`;
      code += `      tolerance: ${levelObj.winCondition.tolerance},\n`;
      code += `      minBounces: ${levelObj.winCondition.minBounces},\n`;
      code += `      maxBounces: ${levelObj.winCondition.maxBounces},\n`;
    } else {
      code += `      tolerance: ${levelObj.winCondition.tolerance},\n`;
    }
    code += `      successMessage: ${JSON.stringify(levelObj.winCondition.successMessage)}\n`;
    code += `    }\n`;
    code += `  },`;

    return code;
  }

  openExportModal() {
    const levelObj = this.buildLevelObject();
    const jsCode = this.generateExportJavascript(levelObj);

    if (this.exportCodeArea) {
      this.exportCodeArea.value = jsCode;
    }
    if (this.copyStatus) {
      this.copyStatus.classList.add('hidden');
    }
    if (this.exportModal) {
      this.exportModal.classList.remove('hidden');
    }
    this.playSound('select');
  }

  closeExportModal() {
    if (this.exportModal) {
      this.exportModal.classList.add('hidden');
    }
  }

  copyExportedCode() {
    if (!this.exportCodeArea) return;
    this.exportCodeArea.select();
    navigator.clipboard.writeText(this.exportCodeArea.value).then(() => {
      if (this.copyStatus) {
        this.copyStatus.classList.remove('hidden');
        setTimeout(() => {
          if (this.copyStatus) this.copyStatus.classList.add('hidden');
        }, 3000);
      }
      this.playSound('place');
    }).catch(err => {
      console.warn('Clipboard write failed, selected text instead', err);
    });
  }

  // --------------------------------------------------------------------------
  // [10] Editor Canvas Rendering Loop
  // --------------------------------------------------------------------------

  startEditorLoop() {
    const loop = () => {
      if (!this.isTestMode) {
        this.renderEditor();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  renderEditor() {
    const ctx = this.ctx;
    const w = this.logicalWidth;
    const h = this.logicalHeight;

    // 1. Blueprint Grid Background
    this.renderBlueprintGrid(ctx, w, h);

    // 2. Render Scene Entities
    for (const e of this.entities) {
      this.renderEntity(ctx, e, e === this.selectedEntity, e === this.hoveredEntity);
    }

    // 3. Render In-Progress Line Placement
    if (this.inProgressLine && this.inProgressLine.p1 && this.inProgressLine.p2) {
      this.renderInProgressLine(ctx, this.inProgressLine);
    }

    // 4. Snapping Reticle
    if (this.snappedPoint) {
      this.renderSnappingReticle(ctx, this.snappedPoint);
    }
  }

  renderBlueprintGrid(ctx, w, h) {
    ctx.fillStyle = '#050a16';
    ctx.fillRect(0, 0, w, h);

    // Minor Grid (20px)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 20) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += 20) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Major Grid (100px)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 100) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += 100) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Corner Alignment Marks
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
    ctx.lineWidth = 1.5;
    const corners = [
      { x: 12, y: 12, dx: 1, dy: 1 },
      { x: w - 12, y: 12, dx: -1, dy: 1 },
      { x: 12, y: h - 12, dx: 1, dy: -1 },
      { x: w - 12, y: h - 12, dx: -1, dy: -1 }
    ];
    for (const c of corners) {
      ctx.beginPath();
      ctx.moveTo(c.x, c.y + c.dy * 14);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(c.x + c.dx * 14, c.y);
      ctx.stroke();
    }
  }

  renderEntity(ctx, e, isSelected, isHovered) {
    ctx.save();

    if (e.type === 'line') {
      const isMirror = e.role === 'mirror';
      const isObstacle = e.role === 'obstacle';
      const isGuide = e.role === 'guide';

      // Glow behind mirrors
      if (isMirror) {
        ctx.strokeStyle = isSelected ? 'rgba(6, 182, 212, 0.5)' : 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(e.p1.x, e.p1.y);
        ctx.lineTo(e.p2.x, e.p2.y);
        ctx.stroke();
      }

      // Line Body
      ctx.strokeStyle = isSelected ? '#ffffff' : (e.style?.strokeStyle || '#38bdf8');
      ctx.lineWidth = isSelected ? (e.style?.lineWidth || 3) + 1.5 : (e.style?.lineWidth || 3);
      if (e.style?.lineDash) {
        ctx.setLineDash(e.style.lineDash);
      }
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(e.p1.x, e.p1.y);
      ctx.lineTo(e.p2.x, e.p2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Endpoint Handles
      const renderHandle = (p, isP1) => {
        const handleHover = isHovered && ((isP1 && this.hoveredHandle === 'p1') || (!isP1 && this.hoveredHandle === 'p2'));
        ctx.beginPath();
        ctx.arc(p.x, p.y, handleHover || isSelected ? 5.5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = handleHover ? '#38bdf8' : (isSelected ? '#ffffff' : '#0e7490');
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      };

      renderHandle(e.p1, true);
      renderHandle(e.p2, false);

      // Label at midpoint
      const mid = { x: (e.p1.x + e.p2.x) / 2, y: (e.p1.y + e.p2.y) / 2 };
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
      ctx.fillText(e.label || e.id, mid.x + 8, mid.y - 8);

      // Selection Halo
      if (isSelected) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(e.p1.x, e.p1.y);
        ctx.lineTo(e.p2.x, e.p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

    } else if (e.type === 'point') {
      const radius = e.style?.radius || 8;
      const isEmitter = e.role === 'laser_source';
      const isTarget = e.role === 'target';
      const isNode = e.role === 'shield_node';

      // Outer Glow & Pulses
      if (isEmitter) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.beginPath();
        ctx.arc(e.x, e.y, radius * 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (isTarget) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(e.x, e.y, radius * 1.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Main Point Body
      ctx.beginPath();
      ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#ffffff' : (e.style?.fillStyle || '#06b6d4');
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#06b6d4' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Point Label
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = isSelected ? '#ffffff' : '#e2e8f0';
      ctx.fillText(e.label || e.id, e.x + radius + 6, e.y + 4);
    }

    ctx.restore();
  }

  renderInProgressLine(ctx, line) {
    ctx.save();
    const { p1, p2, tool } = line;

    let strokeColor = '#38bdf8';
    if (tool === 'obstacle') strokeColor = '#ef4444';
    if (tool === 'guide') strokeColor = '#94a3b8';

    // Rubber band preview
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = tool === 'obstacle' ? 5 : 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Distance and Angle HUD
    const dist = Math.round(this.math.distance(p1, p2));
    const angleDeg = Math.round((Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI) * 10) / 10;
    const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

    ctx.fillStyle = '#050a16';
    ctx.fillRect(mid.x + 8, mid.y - 18, 120, 18);
    ctx.strokeStyle = strokeColor;
    ctx.strokeRect(mid.x + 8, mid.y - 18, 120, 18);

    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`L:${dist}px | ∠:${angleDeg}°`, mid.x + 14, mid.y - 6);

    ctx.restore();
  }

  renderSnappingReticle(ctx, snap) {
    ctx.save();
    ctx.strokeStyle = '#06b6d4';
    ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
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
    ctx.fillText(`SNAP [${(snap.label || snap.type).toUpperCase()}]`, snap.x + 12, snap.y + 4);

    ctx.restore();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.creatorStudio = new CreatorStudio();
});
