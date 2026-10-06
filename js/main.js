/**
 * ============================================================================
 * GEOMETRY ARCHITECT - MAIN UI & CONTROLLER SCRIPT
 * ============================================================================
 * Coordinates DOM UI with GeometryEngine and Level Data.
 * Handles Keyboard Shortcuts, Level Navigation, Audio Toggle, and Modals.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const levelData = window.levelData || [];
  const GeometryEngine = window.GeometryEngine;

  // --------------------------------------------------------------------------
  // [1] DOM Elements
  // --------------------------------------------------------------------------
  const canvas = document.getElementById('blueprint-canvas');
  const levelSelect = document.getElementById('level-select');
  const levelTitle = document.getElementById('level-title');
  const levelSubtitle = document.getElementById('level-subtitle');
  const levelBriefing = document.getElementById('level-briefing');
  const levelTheoryContent = document.getElementById('theory-content');
  const statusBar = document.getElementById('status-message');
  const statusIndicator = document.getElementById('status-indicator');
  
  // Toolbar Buttons
  const toolBtns = {
    point: document.getElementById('tool-point'),
    line: document.getElementById('tool-line'),
    circle: document.getElementById('tool-circle'),
    aim: document.getElementById('tool-aim'),
    delete: document.getElementById('tool-delete')
  };

  const btnUndo = document.getElementById('btn-undo');
  const btnClear = document.getElementById('btn-clear');
  const btnRunSim = document.getElementById('btn-run-sim');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');

  // Victory Modal Elements
  const victoryModal = document.getElementById('victory-modal');
  const victoryTitle = document.getElementById('victory-title');
  const victoryMessage = document.getElementById('victory-message');
  const btnNextLevel = document.getElementById('btn-next-level');
  const btnReplayLevel = document.getElementById('btn-replay-level');

  let currentLevelIndex = 0;

  // --------------------------------------------------------------------------
  // [2] GeometryEngine Instance
  // --------------------------------------------------------------------------
  const engine = new GeometryEngine(canvas, {
    onLevelWin: (message) => {
      showVictoryModal(message);
    },
    onStatusChange: ({ message, type }) => {
      updateStatus(message, type);
    },
    onToolChange: (tool) => {
      updateToolUI(tool);
    }
  });

  // --------------------------------------------------------------------------
  // [3] Level Management
  // --------------------------------------------------------------------------

  function initLevelDropdown() {
    levelSelect.innerHTML = '';
    levelData.forEach((lvl, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = lvl.title;
      levelSelect.appendChild(option);
    });

    levelSelect.addEventListener('change', (e) => {
      loadLevelByIndex(parseInt(e.target.value, 10));
    });
  }

  function loadLevelByIndex(index) {
    if (index < 0 || index >= levelData.length) return;
    currentLevelIndex = index;
    levelSelect.value = index;
    const lvl = levelData[index];

    // Update UI information
    levelTitle.textContent = lvl.title;
    levelSubtitle.textContent = lvl.subtitle || 'Advanced Euclidean CAD';
    levelBriefing.innerHTML = lvl.briefing.replace(/\n/g, '<br/>');
    levelTheoryContent.innerHTML = lvl.geometricTheory
      ? lvl.geometricTheory.replace(/\n/g, '<br/>')
      : 'No additional field hints for this mission.';

    // Toggle button availability per `availableTools`
    Object.keys(toolBtns).forEach(t => {
      const btn = toolBtns[t];
      if (btn) {
        const isAllowed = lvl.availableTools.includes(t);
        btn.disabled = !isAllowed;
        if (!isAllowed) {
          btn.classList.add('opacity-30', 'cursor-not-allowed');
          btn.classList.remove('active');
        } else {
          btn.classList.remove('opacity-30', 'cursor-not-allowed');
        }
      }
    });

    // Toggle Aim tool container visibility
    if (toolBtns.aim) {
      if (lvl.emitterConfig && lvl.emitterConfig.canAim) {
        toolBtns.aim.parentElement.classList.remove('hidden');
      } else {
        toolBtns.aim.parentElement.classList.add('hidden');
      }
    }

    victoryModal.classList.add('hidden');
    engine.loadLevel(lvl);
  }

  // --------------------------------------------------------------------------
  // [4] Status & Tool UI
  // --------------------------------------------------------------------------

  function updateToolUI(activeTool) {
    Object.keys(toolBtns).forEach(t => {
      const btn = toolBtns[t];
      if (btn) {
        if (t === activeTool) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });
  }

  function updateStatus(message, type = 'info') {
    statusBar.textContent = message;
    statusIndicator.className = 'w-2 h-2 rounded-full mr-2';

    if (type === 'error') {
      statusIndicator.classList.add('bg-rose-500', 'animate-pulse');
      statusBar.className = 'text-xs text-rose-300 font-mono';
    } else if (type === 'simulating') {
      statusIndicator.classList.add('bg-amber-400', 'animate-ping');
      statusBar.className = 'text-xs text-amber-200 font-mono';
    } else {
      statusIndicator.classList.add('bg-cyan-400');
      statusBar.className = 'text-xs text-cyan-200 font-mono';
    }
  }

  function showVictoryModal(message) {
    victoryTitle.textContent = "MISSION ACCOMPLISHED!";
    victoryMessage.textContent = message;
    victoryModal.classList.remove('hidden');

    if (currentLevelIndex >= levelData.length - 1) {
      btnNextLevel.textContent = "RESTART MISSION";
    } else {
      btnNextLevel.textContent = "NEXT LEVEL →";
    }
  }

  // --------------------------------------------------------------------------
  // [5] Event Listeners
  // --------------------------------------------------------------------------

  Object.keys(toolBtns).forEach(tool => {
    const btn = toolBtns[tool];
    if (btn) {
      btn.addEventListener('click', () => {
        engine.setTool(tool);
      });
    }
  });

  btnUndo.addEventListener('click', () => engine.undo());
  btnClear.addEventListener('click', () => engine.clearPlayerEntities());

  btnRunSim.addEventListener('click', () => {
    engine.runSimulation();
  });

  btnSoundToggle.addEventListener('click', () => {
    engine.soundEnabled = !engine.soundEnabled;
    if (engine.soundEnabled) {
      soundIcon.textContent = '🔊';
      btnSoundToggle.classList.remove('opacity-50');
      updateStatus('Sound FX Enabled', 'info');
    } else {
      soundIcon.textContent = '🔇';
      btnSoundToggle.classList.add('opacity-50');
      updateStatus('Sound FX Muted', 'info');
    }
  });

  btnNextLevel.addEventListener('click', () => {
    victoryModal.classList.add('hidden');
    if (currentLevelIndex < levelData.length - 1) {
      loadLevelByIndex(currentLevelIndex + 1);
    } else {
      loadLevelByIndex(0);
    }
  });

  btnReplayLevel.addEventListener('click', () => {
    victoryModal.classList.add('hidden');
    loadLevelByIndex(currentLevelIndex);
  });

  // --------------------------------------------------------------------------
  // [6] Keyboard Shortcuts
  // --------------------------------------------------------------------------
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    const key = e.key.toLowerCase();
    if (key === 'p') {
      if (engine.activeLevel?.availableTools.includes('point')) engine.setTool('point');
    } else if (key === 'l') {
      if (engine.activeLevel?.availableTools.includes('line')) engine.setTool('line');
    } else if (key === 'c') {
      if (engine.activeLevel?.availableTools.includes('circle')) engine.setTool('circle');
    } else if (key === 'a') {
      if (engine.activeLevel?.availableTools.includes('aim')) engine.setTool('aim');
    } else if (key === 'e' || key === 'd') {
      engine.setTool('delete');
    } else if ((e.ctrlKey || e.metaKey) && key === 'z') {
      e.preventDefault();
      engine.undo();
    } else if (e.code === 'Space') {
      e.preventDefault();
      engine.runSimulation();
    }
  });

  window.addEventListener('resize', () => {
    engine.setupCanvasDPI();
  });

  // Initial load
  initLevelDropdown();
  loadLevelByIndex(0);
});
