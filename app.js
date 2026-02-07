// ============================================
// GIF98 - Windows 98/XP GIF Visualizer
// ============================================

// --- Application State ---
const AppState = {
    currentPage: 'index',
    uploadedGifs: [],
    settings: {
        bpm: 120,
        maxWindows: 5,
        glitchIntensity: 5,
        selectedEffect: 'Window Cascade Glitch',
        windowBehavior: 'Random'
    },
    playState: {
        isPlaying: false,
        beatInterval: null,
        activeWindows: [],
        glitchActive: false,
        beatCount: 0
    }
};

// --- Authentic Windows Error Messages ---
const errorMessages = [
    "Ce programme a effectue une operation illegale et va etre ferme.",
    "Une exception fatale s'est produite a 0028:C0011E36 dans VXD VMM(01).",
    "Erreur de protection generale dans le module KERNEL32.DLL.",
    "Erreur de page invalide dans le module EXPLORER.EXE a 0167:BFF9DB61.",
    "Violation d'acces a l'adresse 0x00000000. Lecture de l'adresse 0x00000000.",
    "Impossible de trouver le fichier HIMEM.SYS.",
    "Memoire insuffisante. Fermez des applications et reessayez.",
    "Le fichier RUNDLL32.EXE a provoque une erreur dans USER.EXE.",
    "Erreur fatale 0E a 0028:C001A2B4 dans VXD VWIN32(05).",
    "Pilote d'affichage incorrect. Contactez le fabricant de votre materiel."
];

// --- Presets: Authentic Win98/XP Glitch Combos ---
const PRESETS = {
    'Cascade Spam': {
        effect: 'Window Cascade Glitch',
        bpm: 160,
        intensity: 8,
        maxWindows: 10,
        behavior: 'Cascade',
        description: 'Spam classique de fenetres XP'
    },
    'BSOD Panic': {
        effect: 'Blue Screen of Death',
        bpm: 80,
        intensity: 7,
        maxWindows: 3,
        behavior: 'Random',
        description: 'Ecrans bleus de la mort repetitifs'
    },
    'DLL Hell': {
        effect: 'Error Dialog Spam',
        bpm: 180,
        intensity: 9,
        maxWindows: 8,
        behavior: 'Random',
        description: 'Enfer des boites de dialogue'
    },
    'Registry Corrupt': {
        effect: 'Screen Corruption',
        bpm: 140,
        intensity: 10,
        maxWindows: 6,
        behavior: 'Center',
        description: 'Corruption visuelle totale'
    },
    'Memory Leak': {
        effect: 'Memory Leak Visual',
        bpm: 100,
        intensity: 6,
        maxWindows: 10,
        behavior: 'Grid',
        description: 'Fuite memoire progressive'
    },
    'System Hang': {
        effect: 'System Freeze',
        bpm: 60,
        intensity: 8,
        maxWindows: 4,
        behavior: 'Cascade',
        description: 'Gel complet du systeme'
    },
    'Matrix XP': {
        effect: 'Matrix Rain',
        bpm: 130,
        intensity: 7,
        maxWindows: 6,
        behavior: 'Grid',
        description: 'Pluie de fenetres style Matrix'
    },
    'Defrag': {
        effect: 'Mosaic Grid',
        bpm: 110,
        intensity: 5,
        maxWindows: 8,
        behavior: 'Grid',
        description: 'Defragmentation visuelle'
    },
    'Screensaver': {
        effect: 'Orbit System',
        bpm: 90,
        intensity: 4,
        maxWindows: 5,
        behavior: 'Circle',
        description: 'Economiseur d\'ecran orbital'
    },
    'Psychedelic': {
        effect: 'Kaleidoscope',
        bpm: 150,
        intensity: 8,
        maxWindows: 8,
        behavior: 'Circle',
        description: 'Kaleidoscope psychedelique'
    }
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    updateClock();
    setInterval(updateClock, 1000);
    updateControlDisplays();
    makeWindowsDraggable();
    handleRouting();
    window.addEventListener('hashchange', handleRouting);
}

function setupEventListeners() {
    // GIF upload
    const gifUpload = document.getElementById('gif-upload');
    if (gifUpload) gifUpload.addEventListener('change', handleGifUpload);

    // BPM Controls
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmInput = document.getElementById('bpm-input');
    if (bpmSlider) {
        bpmSlider.addEventListener('input', updateBPM);
        bpmSlider.addEventListener('change', updateBPM);
    }
    if (bpmInput) {
        bpmInput.addEventListener('input', updateBPM);
        bpmInput.addEventListener('change', updateBPM);
    }

    // Effect / Intensity / Windows / Behavior
    bindControl('effect-select', 'change', updateEffect);
    bindControl('intensity-slider', 'input', updateIntensity);
    bindControl('intensity-slider', 'change', updateIntensity);
    bindControl('max-windows-slider', 'input', updateMaxWindows);
    bindControl('max-windows-slider', 'change', updateMaxWindows);
    bindControl('behavior-select', 'change', updateBehavior);

    // Launch & Back
    bindControl('launch-btn', 'click', launchVisualizer);
    bindControl('back-to-index', 'click', backToIndex);

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            applyPreset(this.dataset.preset);
        });
    });

    // Window controls (delegated)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('window-control')) {
            handleWindowControl(e);
        }
        // Error OK buttons
        if (e.target.classList.contains('error-ok-btn')) {
            const dialog = e.target.closest('.error-dialog');
            if (dialog) dialog.remove();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

function bindControl(id, event, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
}

// ============================================
// Keyboard Shortcuts
// ============================================

function handleKeyboard(e) {
    // Only active on play page
    if (AppState.currentPage !== 'play') {
        // Space on index page launches
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
            e.preventDefault();
            launchVisualizer();
        }
        // ? shows help
        if (e.key === '?' || (e.key === 'h' && e.target.tagName !== 'INPUT')) {
            toggleShortcutsHelp();
        }
        return;
    }

    switch (e.code) {
        case 'Escape':
            backToIndex();
            break;
        case 'Space':
            e.preventDefault();
            // Pause/resume
            if (AppState.playState.isPlaying) {
                pauseVisualization();
            } else {
                resumeVisualization();
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            adjustBPM(5);
            break;
        case 'ArrowDown':
            e.preventDefault();
            adjustBPM(-5);
            break;
        case 'ArrowRight':
            e.preventDefault();
            adjustIntensity(1);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            adjustIntensity(-1);
            break;
        case 'KeyC':
            clearPlayArea();
            showToast('Ecran nettoye');
            break;
        case 'KeyG':
            triggerGlitchEffect();
            break;
        case 'KeyH':
            togglePlayControls();
            break;
        case 'KeyF':
            toggleFullscreen();
            break;
    }

    // Number keys 1-9 for quick effect switch
    if (e.key >= '1' && e.key <= '9') {
        const effectSelect = document.getElementById('play-effect-select') || document.getElementById('effect-select');
        if (effectSelect) {
            const index = parseInt(e.key) - 1;
            if (index < effectSelect.options.length) {
                effectSelect.selectedIndex = index;
                AppState.settings.selectedEffect = effectSelect.value;
                showToast('Effet: ' + effectSelect.value);
            }
        }
    }
}

function adjustBPM(delta) {
    const newBpm = Math.max(60, Math.min(200, AppState.settings.bpm + delta));
    AppState.settings.bpm = newBpm;
    syncAllBPMDisplays();
    if (AppState.playState.isPlaying) updateBeatInterval();
    showToast('BPM: ' + newBpm);
}

function adjustIntensity(delta) {
    const newVal = Math.max(1, Math.min(10, AppState.settings.glitchIntensity + delta));
    AppState.settings.glitchIntensity = newVal;
    syncAllIntensityDisplays();
    showToast('Intensite: ' + newVal);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
}

function togglePlayControls() {
    const controls = document.querySelector('.play-controls');
    if (controls) {
        controls.classList.toggle('collapsed');
    }
}

// ============================================
// Toast Notifications
// ============================================

let toastTimeout = null;
function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 1500);
}

// ============================================
// Shortcuts Help Overlay
// ============================================

function toggleShortcutsHelp() {
    let overlay = document.querySelector('.shortcuts-overlay');
    if (overlay) {
        overlay.remove();
        return;
    }
    overlay = document.createElement('div');
    overlay.className = 'shortcuts-overlay';
    const shortcuts = AppState.currentPage === 'play' ? [
        ['Esc', 'Retour'],
        ['Espace', 'Pause / Reprendre'],
        ['\u2191\u2193', 'BPM +/- 5'],
        ['\u2190\u2192', 'Intensite +/- 1'],
        ['1-9', 'Changer d\'effet'],
        ['G', 'Declencher effet'],
        ['C', 'Nettoyer ecran'],
        ['H', 'Masquer controles'],
        ['F', 'Plein ecran'],
    ] : [
        ['Espace', 'Lancer le spectacle'],
        ['?', 'Afficher l\'aide'],
    ];

    overlay.innerHTML = `
        <div class="window-title-bar">
            <div class="window-title">Raccourcis Clavier</div>
            <div class="window-controls">
                <button class="window-control close" type="button" onclick="this.closest('.shortcuts-overlay').remove()">x</button>
            </div>
        </div>
        <div class="window-content">
            ${shortcuts.map(([key, desc]) => `
                <div class="shortcut-row">
                    <span class="shortcut-desc">${desc}</span>
                    <span class="shortcut-key">${key}</span>
                </div>
            `).join('')}
        </div>
    `;
    document.body.appendChild(overlay);
}

// ============================================
// Presets
// ============================================

function applyPreset(presetName) {
    const preset = PRESETS[presetName];
    if (!preset) return;

    AppState.settings.selectedEffect = preset.effect;
    AppState.settings.bpm = preset.bpm;
    AppState.settings.glitchIntensity = preset.intensity;
    AppState.settings.maxWindows = preset.maxWindows;
    AppState.settings.windowBehavior = preset.behavior;

    updateControlDisplays();

    // Highlight active preset
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === presetName);
    });

    showToast(presetName);
}

// ============================================
// Window Controls
// ============================================

function handleWindowControl(e) {
    const control = e.target;
    const win = control.closest('.window') || control.closest('.error-dialog') || control.closest('.shortcuts-overlay');

    if (control.classList.contains('close')) {
        const windowId = control.getAttribute('data-window');
        if (windowId) {
            const targetWindow = document.getElementById(windowId);
            if (targetWindow) targetWindow.style.display = 'none';
        } else if (control.closest('.error-dialog')) {
            control.closest('.error-dialog').remove();
        } else if (control.closest('.gif-window')) {
            closeGifWindow(control);
        } else if (control.closest('.shortcuts-overlay')) {
            control.closest('.shortcuts-overlay').remove();
        }
    } else if (control.classList.contains('minimize') && win) {
        const content = win.querySelector('.window-content');
        if (content) {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        }
    }
}

// ============================================
// Routing
// ============================================

function handleRouting() {
    const hash = window.location.hash.substring(1) || 'index';
    if (hash === 'play') {
        showPlayPage();
    } else {
        showIndexPage();
    }
}

function showIndexPage() {
    const desktop = document.getElementById('desktop');
    const playPage = document.getElementById('play-page');
    if (desktop) desktop.style.display = 'block';
    if (playPage) playPage.classList.add('hidden');
    AppState.currentPage = 'index';
    stopVisualization();
}

function showPlayPage() {
    const desktop = document.getElementById('desktop');
    const playPage = document.getElementById('play-page');
    if (desktop) desktop.style.display = 'none';
    if (playPage) playPage.classList.remove('hidden');
    AppState.currentPage = 'play';
    startVisualization();
}

function launchVisualizer() {
    window.location.hash = 'play';
}

function backToIndex() {
    window.location.hash = 'index';
}

// ============================================
// Clock
// ============================================

function updateClock() {
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' +
                       now.getMinutes().toString().padStart(2, '0');
    const el = document.getElementById('taskbar-time');
    if (el) el.textContent = timeString;
}

// ============================================
// GIF Upload & Management
// ============================================

function handleGifUpload(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        if (file.type === 'image/gif') {
            const reader = new FileReader();
            reader.onload = function(e) {
                AppState.uploadedGifs.push({
                    id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    name: file.name,
                    url: e.target.result,
                    size: file.size
                });
                updateGifList();
                updateGifCount();
            };
            reader.readAsDataURL(file);
        }
    });
    // Reset input so same file can be re-uploaded
    event.target.value = '';
}

function updateGifList() {
    const gifList = document.getElementById('gif-list');
    if (!gifList) return;

    if (AppState.uploadedGifs.length === 0) {
        gifList.innerHTML = '<div class="no-gifs">Aucun GIF uploade</div>';
        return;
    }

    gifList.innerHTML = AppState.uploadedGifs.map(gif => `
        <div class="gif-item">
            <img src="${gif.url}" alt="${escapeHtml(gif.name)}" class="gif-preview">
            <div class="gif-info">
                <div>${escapeHtml(gif.name)}</div>
                <div>${formatFileSize(gif.size)}</div>
            </div>
            <button class="gif-remove" onclick="removeGif('${gif.id}')" title="Supprimer">x</button>
        </div>
    `).join('');
}

function removeGif(gifId) {
    AppState.uploadedGifs = AppState.uploadedGifs.filter(gif => gif.id !== gifId);
    updateGifList();
    updateGifCount();
}

function updateGifCount() {
    const statusEl = document.getElementById('gif-count');
    if (statusEl) {
        statusEl.textContent = AppState.uploadedGifs.length + ' GIF(s)';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================
// Control Updates
// ============================================

function updateBPM(event) {
    const bpm = parseInt(event.target.value);
    if (isNaN(bpm) || bpm < 60 || bpm > 200) return;
    AppState.settings.bpm = bpm;
    syncAllBPMDisplays();
    if (AppState.playState.isPlaying) updateBeatInterval();
}

function syncAllBPMDisplays() {
    const bpm = AppState.settings.bpm;
    setValueIfExists('bpm-display', bpm, 'text');
    setValueIfExists('bpm-slider', bpm, 'value');
    setValueIfExists('bpm-input', bpm, 'value');
    setValueIfExists('play-bpm-slider', bpm, 'value');
    setValueIfExists('play-bpm-display', bpm, 'text');
}

function syncAllIntensityDisplays() {
    const val = AppState.settings.glitchIntensity;
    setValueIfExists('intensity-display', val, 'text');
    setValueIfExists('intensity-slider', val, 'value');
    setValueIfExists('play-intensity-slider', val, 'value');
    setValueIfExists('play-intensity-display', val, 'text');
}

function setValueIfExists(id, val, type) {
    const el = document.getElementById(id);
    if (!el) return;
    if (type === 'text') el.textContent = val;
    else el.value = val;
}

function updateEffect(event) {
    AppState.settings.selectedEffect = event.target.value;
    // Sync both selects
    setValueIfExists('effect-select', event.target.value, 'value');
    setValueIfExists('play-effect-select', event.target.value, 'value');
}

function updateIntensity(event) {
    AppState.settings.glitchIntensity = parseInt(event.target.value);
    syncAllIntensityDisplays();
}

function updateMaxWindows(event) {
    const maxWindows = parseInt(event.target.value);
    AppState.settings.maxWindows = maxWindows;
    setValueIfExists('max-windows-display', maxWindows, 'text');
}

function updateBehavior(event) {
    AppState.settings.windowBehavior = event.target.value;
}

function updateControlDisplays() {
    syncAllBPMDisplays();
    setValueIfExists('effect-select', AppState.settings.selectedEffect, 'value');
    setValueIfExists('play-effect-select', AppState.settings.selectedEffect, 'value');
    syncAllIntensityDisplays();
    setValueIfExists('max-windows-display', AppState.settings.maxWindows, 'text');
    setValueIfExists('max-windows-slider', AppState.settings.maxWindows, 'value');
    setValueIfExists('behavior-select', AppState.settings.windowBehavior, 'value');
}

// ============================================
// Visualization Control
// ============================================

function startVisualization() {
    AppState.playState.isPlaying = true;
    AppState.playState.beatCount = 0;
    updateBeatInterval();

    // Sync play controls with current settings
    syncPlayControls();

    if (AppState.uploadedGifs.length === 0) {
        createPlaceholderContent();
    }
}

function stopVisualization() {
    AppState.playState.isPlaying = false;
    if (AppState.playState.beatInterval) {
        clearInterval(AppState.playState.beatInterval);
        AppState.playState.beatInterval = null;
    }
    clearPlayArea();
}

function pauseVisualization() {
    AppState.playState.isPlaying = false;
    if (AppState.playState.beatInterval) {
        clearInterval(AppState.playState.beatInterval);
        AppState.playState.beatInterval = null;
    }
    showToast('Pause');
}

function resumeVisualization() {
    AppState.playState.isPlaying = true;
    updateBeatInterval();
    showToast('Reprise');
}

function syncPlayControls() {
    setValueIfExists('play-bpm-slider', AppState.settings.bpm, 'value');
    setValueIfExists('play-bpm-display', AppState.settings.bpm, 'text');
    setValueIfExists('play-effect-select', AppState.settings.selectedEffect, 'value');
    setValueIfExists('play-intensity-slider', AppState.settings.glitchIntensity, 'value');
    setValueIfExists('play-intensity-display', AppState.settings.glitchIntensity, 'text');
}

function createPlaceholderContent() {
    const playArea = document.getElementById('play-area');
    if (!playArea) return;

    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    for (let i = 0; i < 3; i++) {
        const win = document.createElement('div');
        win.className = 'window gif-window';
        win.innerHTML = `
            <div class="window-title-bar">
                <div class="window-title">Demo ${i + 1}</div>
                <div class="window-controls">
                    <button class="window-control close" type="button">x</button>
                </div>
            </div>
            <div class="window-content">
                <div style="width:120px;height:120px;background:${colors[i]};display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;font-family:Tahoma,sans-serif;">
                    GIF ${i + 1}
                </div>
            </div>
        `;
        positionWindow(win);
        playArea.appendChild(win);
        AppState.playState.activeWindows.push(win);
    }
}

// ============================================
// Beat Engine
// ============================================

function updateBeatInterval() {
    if (AppState.playState.beatInterval) {
        clearInterval(AppState.playState.beatInterval);
    }
    const beatDuration = 60000 / AppState.settings.bpm;
    AppState.playState.beatInterval = setInterval(onBeat, beatDuration);
}

function onBeat() {
    AppState.playState.beatCount++;

    // Beat indicator pulse
    const beatIndicator = document.getElementById('beat-indicator');
    if (beatIndicator) {
        beatIndicator.classList.add('pulse');
        setTimeout(() => beatIndicator.classList.remove('pulse'), 100);
    }

    // Spawn new GIF window every 2 beats
    if (AppState.playState.beatCount % 2 === 0 &&
        AppState.playState.activeWindows.length < AppState.settings.maxWindows) {
        spawnGifWindow();
    }

    // Trigger effects based on frequency
    if (AppState.playState.beatCount % getEffectFrequency() === 0) {
        triggerGlitchEffect();
    }

    // Cleanup old windows every 8 beats
    if (AppState.playState.beatCount % 8 === 0) {
        cleanupOldWindows();
    }
}

function getEffectFrequency() {
    return Math.max(1, 11 - AppState.settings.glitchIntensity);
}

// ============================================
// Window Spawning & Positioning
// ============================================

function spawnGifWindow() {
    if (AppState.uploadedGifs.length === 0) return;

    const randomGif = AppState.uploadedGifs[Math.floor(Math.random() * AppState.uploadedGifs.length)];
    const windowElement = createGifWindow(randomGif);
    positionWindow(windowElement);

    const playArea = document.getElementById('play-area');
    if (playArea) {
        playArea.appendChild(windowElement);
        AppState.playState.activeWindows.push(windowElement);
        windowElement.classList.add('cascade-animation');
    }
}

function createGifWindow(gif) {
    const windowDiv = document.createElement('div');
    windowDiv.className = 'window gif-window';
    windowDiv.innerHTML = `
        <div class="window-title-bar">
            <div class="window-title">${escapeHtml(gif.name)}</div>
            <div class="window-controls">
                <button class="window-control close" type="button">x</button>
            </div>
        </div>
        <div class="window-content">
            <img src="${gif.url}" alt="${escapeHtml(gif.name)}" class="gif-display">
        </div>
    `;
    return windowDiv;
}

function positionWindow(windowElement) {
    const playArea = document.getElementById('play-area');
    if (!playArea) return;

    const areaWidth = playArea.clientWidth;
    const areaHeight = playArea.clientHeight;
    let x, y;
    const idx = AppState.playState.activeWindows.length;

    switch (AppState.settings.windowBehavior) {
        case 'Grid': {
            const gridSize = Math.ceil(Math.sqrt(AppState.settings.maxWindows));
            const cellWidth = areaWidth / gridSize;
            const cellHeight = areaHeight / gridSize;
            x = (idx % gridSize) * cellWidth + Math.random() * 20;
            y = Math.floor(idx / gridSize) * cellHeight + Math.random() * 20;
            break;
        }
        case 'Cascade': {
            const offset = idx * 28;
            x = 30 + (offset % (areaWidth - 300));
            y = 30 + (offset % (areaHeight - 200));
            break;
        }
        case 'Circle': {
            const cx = areaWidth / 2;
            const cy = areaHeight / 2;
            const radius = Math.min(areaWidth, areaHeight) * 0.3;
            const angle = (idx / AppState.settings.maxWindows) * Math.PI * 2;
            x = cx + Math.cos(angle) * radius - 125;
            y = cy + Math.sin(angle) * radius - 80;
            break;
        }
        case 'Diagonal': {
            const diagStep = Math.min(areaWidth, areaHeight) / (AppState.settings.maxWindows + 1);
            x = idx * diagStep;
            y = idx * diagStep;
            break;
        }
        case 'Center': {
            const ecx = areaWidth / 2 - 125;
            const ecy = areaHeight / 2 - 80;
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * Math.min(areaWidth, areaHeight) * 0.3;
            x = ecx + Math.cos(angle) * dist;
            y = ecy + Math.sin(angle) * dist;
            break;
        }
        default: // Random
            x = Math.random() * (areaWidth - 280);
            y = Math.random() * (areaHeight - 220);
    }

    windowElement.style.left = Math.max(0, x) + 'px';
    windowElement.style.top = Math.max(0, y) + 'px';
}

function closeGifWindow(button) {
    const win = button.closest('.gif-window');
    if (win) {
        AppState.playState.activeWindows = AppState.playState.activeWindows.filter(w => w !== win);
        win.remove();
    }
}

function cleanupOldWindows() {
    while (AppState.playState.activeWindows.length > AppState.settings.maxWindows) {
        const oldest = AppState.playState.activeWindows.shift();
        if (oldest && oldest.parentNode) oldest.remove();
    }
}

function clearPlayArea() {
    const playArea = document.getElementById('play-area');
    if (playArea) {
        // Remove gif-windows and effect elements, keep controls
        playArea.querySelectorAll('.gif-window, .error-dialog, .bsod').forEach(el => el.remove());
    }
    AppState.playState.activeWindows = [];
}

// ============================================
// Effect Router
// ============================================

const EFFECT_MAP = {
    'Matrix Rain': matrixRainEffect,
    'Kaleidoscope': kaleidoscopeEffect,
    'Vortex Spiral': vortexSpiralEffect,
    'DNA Helix': dnaHelixEffect,
    'Particle Fireworks': particleFireworksEffect,
    'Wave Motion': waveMotionEffect,
    '3D Cube Rotation': cubicRotationEffect,
    'Mosaic Grid': mosaicGridEffect,
    'Orbit System': orbitSystemEffect,
    'Tunnel Vision': tunnelVisionEffect,
    'Flip Book': flipBookEffect,
    'Error Dialog Spam': spawnErrorDialog,
    'Blue Screen of Death': showBSOD,
    'Window Cascade Glitch': cascadeGlitch,
    'Screen Corruption': screenCorruption,
    'Memory Leak Visual': memoryLeakEffect,
    'System Freeze': systemFreeze,
};

function triggerGlitchEffect() {
    const fn = EFFECT_MAP[AppState.settings.selectedEffect];
    if (fn) fn();
}

// ============================================
// Classic System Effects (Authentic Win98/XP)
// ============================================

function spawnErrorDialog() {
    const errorTemplate = document.getElementById('error-dialog-template');
    if (!errorTemplate) return;

    const playArea = document.getElementById('play-area');
    if (!playArea) return;

    const numDialogs = Math.min(Math.ceil(AppState.settings.glitchIntensity / 3), 4);

    for (let d = 0; d < numDialogs; d++) {
        setTimeout(() => {
            const errorDialog = errorTemplate.cloneNode(true);
            errorDialog.id = 'error-' + Date.now() + '-' + d;
            errorDialog.classList.remove('hidden');

            const message = errorMessages[Math.floor(Math.random() * errorMessages.length)];
            const messageEl = errorDialog.querySelector('.error-message');
            if (messageEl) messageEl.textContent = message;

            errorDialog.style.left = Math.random() * (playArea.clientWidth - 350) + 'px';
            errorDialog.style.top = Math.random() * (playArea.clientHeight - 180) + 'px';
            errorDialog.classList.add('error-shake');

            playArea.appendChild(errorDialog);

            const autoClose = Math.max(800, 4000 - (AppState.settings.glitchIntensity * 350));
            setTimeout(() => {
                if (errorDialog.parentNode) errorDialog.remove();
            }, autoClose);
        }, d * 120);
    }
}

function showBSOD() {
    const bsodTemplate = document.getElementById('bsod-template');
    if (!bsodTemplate) return;
    const playArea = document.getElementById('play-area');
    if (!playArea) return;

    const bsod = bsodTemplate.cloneNode(true);
    bsod.id = 'bsod-' + Date.now();
    bsod.classList.remove('hidden');
    playArea.appendChild(bsod);

    const duration = Math.max(400, 2500 - (AppState.settings.glitchIntensity * 200));
    setTimeout(() => {
        if (bsod.parentNode) bsod.remove();
    }, duration);
}

function cascadeGlitch() {
    const num = Math.min(AppState.settings.glitchIntensity + 2, 12);
    for (let i = 0; i < num; i++) {
        setTimeout(() => {
            if (AppState.uploadedGifs.length > 0) spawnGifWindow();
        }, i * 60);
    }
}

function screenCorruption() {
    const playArea = document.getElementById('play-area');
    if (!playArea) return;
    playArea.classList.add('glitch-corruption');
    const duration = AppState.settings.glitchIntensity * 250;
    setTimeout(() => playArea.classList.remove('glitch-corruption'), duration);
}

function memoryLeakEffect() {
    const intensity = AppState.settings.glitchIntensity;
    // More windows leak at higher intensity
    AppState.playState.activeWindows.forEach(win => {
        if (Math.random() < intensity * 0.08) {
            win.classList.add('memory-leak');
        }
    });

    // Spawn extra windows that don't get tracked (simulating leak)
    if (AppState.uploadedGifs.length > 0 && Math.random() < 0.5) {
        spawnGifWindow();
    }

    setTimeout(() => {
        AppState.playState.activeWindows.forEach(win => {
            win.classList.remove('memory-leak');
        });
    }, 3000);
}

function systemFreeze() {
    const playArea = document.getElementById('play-area');
    if (!playArea) return;
    playArea.classList.add('glitch-freeze');
    document.body.style.cursor = 'wait';
    const duration = Math.max(300, AppState.settings.glitchIntensity * 250);
    setTimeout(() => {
        playArea.classList.remove('glitch-freeze');
        document.body.style.cursor = 'default';
    }, duration);
}

// ============================================
// Artistic Effects
// ============================================

function matrixRainEffect() {
    const playArea = document.getElementById('play-area');
    if (!playArea || AppState.uploadedGifs.length === 0) return;

    const numColumns = Math.min(AppState.settings.glitchIntensity * 2, 12);
    const columnWidth = playArea.clientWidth / numColumns;

    for (let i = 0; i < numColumns; i++) {
        setTimeout(() => {
            const gif = randomGif();
            const win = createGifWindow(gif);
            win.style.left = (i * columnWidth + Math.random() * 20) + 'px';
            win.style.top = '-120px';
            win.style.transition = 'top 2.5s linear, opacity 0.5s';
            win.classList.add('matrix-fall');
            playArea.appendChild(win);

            requestAnimationFrame(() => {
                win.style.top = playArea.clientHeight + 'px';
            });

            setTimeout(() => {
                win.style.opacity = '0';
            }, 2000);
            setTimeout(() => safeRemove(win), 3000);
        }, i * 80);
    }
}

function kaleidoscopeEffect() {
    const playArea = document.getElementById('play-area');
    if (!playArea || AppState.uploadedGifs.length === 0) return;

    const cx = playArea.clientWidth / 2;
    const cy = playArea.clientHeight / 2;
    const segments = Math.min(AppState.settings.glitchIntensity, 8);
    const radius = Math.min(cx, cy) * 0.5;

    for (let i = 0; i < segments; i++) {
        const angle = (Math.PI * 2 / segments) * i;
        const x = cx + Math.cos(angle) * radius - 60;
        const y = cy + Math.sin(angle) * radius - 60;

        const win = createGifWindow(randomGif());
        win.style.left = x + 'px';
        win.style.top = y + 'px';
        win.style.transform = `rotate(${angle * 180 / Math.PI}deg) scale(0.8)`;
        win.style.transition = 'all 1.2s ease-in-out';
        win.style.opacity = '0';
        win.classList.add('kaleidoscope-segment');
        playArea.appendChild(win);

        requestAnimationFrame(() => {
            win.style.opacity = '1';
            win.style.transform = `rotate(${angle * 180 / Math.PI}deg) scale(1)`;
        });

        setTimeout(() => {
            win.style.transform = `rotate(${angle * 180 / Math.PI + 360}deg) scale(0.3)`;
            win.style.opacity = '0';
        }, 1200);
        setTimeout(() => safeRemove(win), 2000);
    }
}

function vortexSpiralEffect() {
    const playArea = document.getElementById('play-area');
    if (!playArea || AppState.uploadedGifs.length === 0) return;

    const cx = playArea.clientWidth / 2;
    const cy = playArea.clientHeight / 2;
    const count = Math.min(AppState.settings.glitchIntensity * 2, 10);

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const angle = (i / count) * Math.PI * 4;
            const radius = (i / count) * Math.min(cx, cy) * 0.7;
            const x = cx + Math.cos(angle) * radius - 60;
            const y = cy + Math.sin(angle) * radius - 60;

            const win = createGifWindow(randomGif());
            win.style.left = cx + 'px';
            win.style.top = cy + 'px';
            win.style.opacity = '0';
            win.style.transition = 'all 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            win.classList.add('vortex-spiral');
            playArea.appendChild(win);

            requestAnimationFrame(() => {
                win.style.left = x + 'px';
                win.style.top = y + 'px';
                win.style.opacity = '1';
                win.style.transform = `rotate(${angle * 30}deg) scale(1)`;
            });

            setTimeout(() => {
                win.style.opacity = '0';
                win.style.transform = `rotate(${angle * 30 + 180}deg) scale(0.1)`;
            }, 900);
            setTimeout(() => safeRemove(win), 1600);
        }, i * 70);
    }
}

function dnaHelixEffect() {
    const playArea = document.getElementById('play-area');
    if (!playArea || AppState.uploadedGifs.length === 0) return;

    const cx = playArea.clientWidth / 2;
    const points = Math.min(AppState.settings.glitchIntensity * 2, 12);
    const helixH = playArea.clientHeight * 0.7;

    for (let i = 0; i < points; i++) {
        setTimeout(() => {
            const progress = i / points;
            const angle = progress * Math.PI * 4;
            const yPos = 50 + progress * helixH;
            const radius = 120;

            [1, -1].forEach(dir => {
                const xPos = cx + Math.sin(angle) * radius * dir - 60;
                const win = createGifWindow(randomGif());
                win.style.left = xPos + 'px';
                win.style.top = '-80px';
                win.style.opacity = '0';
                win.style.transition = 'all 0.5s ease-out';
                win.classList.add('dna-helix');
                playArea.appendChild(win);

                requestAnimationFrame(() => {
                    win.style.top = yPos + 'px';
                    win.style.opacity = '1';
                });

                setTimeout(() => {
                    win.style.opacity = '0';
                    win.style.transform = 'scale(0.3) rotate(90deg)';
                }, 1400);
                setTimeout(() => safeRemove(win), 2000);
            });
        }, i * 90);
    }
}

function particleFireworksEffect() {
    const playArea = document.getElementById('play-area');
    if (!playArea || AppState.uploadedGifs.length === 0) return;

    const explosions = Math.min(AppState.settings.glitchIntensity, 4);

    for (let e = 0; e < explosions; e++) {
        setTimeout(() => {
            const ox = 100 + Math.random() * (playArea.clientWidth - 200);
            const oy = 100 + Math.random() * (playArea.clientHeight - 200);
            const particles = 6 + Math.floor(Math.random() * 4);

            for (let i = 0; i < particles; i++) {
                const angle = (Math.PI * 2 / particles) * i;
                const dist = 120 + Math.random() * 100;

                const win = createGifWindow(randomGif());
                win.style.left = ox + 'px';
                win.style.top = oy + 'px';
                win.style.transform = 'scale(0.2)';
                win.style.opacity = '0';
                win.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                win.classList.add('particle-firework');
                playArea.appendChild(win);

                requestAnimationFrame(() => {
                    win.style.left = (ox + Math.cos(angle) * dist) + 'px';
                    win.style.top = (oy + Math.sin(angle) * dist) + 'px';
                    win.style.transform = 'scale(0.9)';
                    win.style.opacity = '1';
                });

                setTimeout(() => {
                    win.style.opacity = '0';
                    win.style.transform = 'scale(0) rotate(180deg)';
                }, 900);
                setTimeout(() => safeRemove(win), 1800);
            }
        }, e * 500);
    }
}

function waveMotionEffect() {
    const playArea = document.getElementById('play-area');
    if (!playArea || AppState.uploadedGifs.length === 0) return;

    const count = Math.min(AppState.settings.glitchIntensity * 2, 10);
    const width = playArea.clientWidth;
    const midY = playArea.clientHeight / 2;
    const amplitude = playArea.clientHeight * 0.25;

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const x = (i / count) * width;
            const phase = (i / count) * Math.PI * 2;
            const y = midY + Math.sin(phase) * amplitude - 60;

            const win = createGifWindow(randomGif());
            win.style.left = x + 'px';
            win.style.top = midY + 'px';
            win.style.opacity = '0';
            win.style.transition = 'all 0.8s ease-in-out';
            win.classList.add('wave-motion');
            playArea.appendChild(win);

            requestAnimationFrame(() => {
                win.style.top = y + 'px';
                win.style.opacity = '1';
            });

            setTimeout(() => {
                const y2 = midY + Math.sin(phase + Math.PI) * amplitude - 60;
                win.style.top = y2 + 'px';
                win.style.opacity = '0';
            }, 1400);
            setTimeout(() => safeRemove(win), 2200);
        }, i * 100);
    }
}

// ============================================
// Geometric Effects
// ============================================

function cubicRotationEffect() {
    const playArea = document.getElementById('play-area');
    if (!playArea || AppState.uploadedGifs.length === 0) return;

    const cx = playArea.clientWidth / 2;
    const cy = playArea.clientHeight / 2;
    const size = 130;

    const faces = [
        { rx: 0, ry: 0 },
        { rx: 0, ry: 180 },
        { rx: 0, ry: 90 },
        { rx: 0, ry: -90 },
        { rx: 90, ry: 0 },
        { rx: -90, ry: 0 }
    ];

    faces.forEach((face, i) => {
        setTimeout(() => {
            const win = createGifWindow(randomGif());
            win.style.left = (cx - size / 2) + 'px';
            win.style.top = (cy - size / 2) + 'px';
            win.style.width = size + 'px';
            win.style.transformStyle = 'preserve-3d';
            win.style.transform = `rotateX(${face.rx}deg) rotateY(${face.ry}deg) translateZ(${size / 2}px)`;
            win.style.transition = 'all 2s ease-in-out';
            win.classList.add('cube-face');
            playArea.appendChild(win);

            requestAnimationFrame(() => {
                win.style.transform = `rotateX(${face.rx + 360}deg) rotateY(${face.ry + 360}deg) translateZ(${size / 2}px)`;
            });

            setTimeout(() => { win.style.opacity = '0'; }, 1800);
            setTimeout(() => safeRemove(win), 2200);
        }, i * 120);
    });
}

function mosaicGridEffect() {
    const playArea = document.getElementById('play-area');
    if (!playArea || AppState.uploadedGifs.length === 0) return;

    const gridSize = Math.min(AppState.settings.glitchIntensity, 5);
    const cellW = playArea.clientWidth / gridSize;
    const cellH = playArea.clientHeight / gridSize;

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            setTimeout(() => {
                const win = createGifWindow(randomGif());
                win.style.left = (c * cellW) + 'px';
                win.style.top = (r * cellH) + 'px';
                win.style.width = cellW + 'px';
                win.style.opacity = '0';
                win.style.transform = 'scale(0)';
                win.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                win.classList.add('mosaic-tile');
                playArea.appendChild(win);

                requestAnimationFrame(() => {
                    win.style.opacity = '1';
                    win.style.transform = 'scale(1)';
                });

                setTimeout(() => {
                    win.style.opacity = '0';
                    win.style.transform = 'scale(0) rotate(90deg)';
                }, 1200);
                setTimeout(() => safeRemove(win), 1700);
            }, (r * gridSize + c) * 60);
        }
    }
}

function orbitSystemEffect() {
    const playArea = document.getElementById('play-area');
    if (!playArea || AppState.uploadedGifs.length === 0) return;

    const cx = playArea.clientWidth / 2;
    const cy = playArea.clientHeight / 2;
    const planets = Math.min(AppState.settings.glitchIntensity, 6);

    // Sun
    const sun = createGifWindow(randomGif());
    sun.style.left = (cx - 60) + 'px';
    sun.style.top = (cy - 60) + 'px';
    sun.style.transform = 'scale(1.5)';
    sun.classList.add('orbit-sun');
    playArea.appendChild(sun);
    setTimeout(() => safeRemove(sun), 3500);

    // Planets
    for (let i = 0; i < planets; i++) {
        const orbitRadius = 80 + i * 45;
        const speed = 2 + i * 0.4;
        const startAngle = (Math.PI * 2 / planets) * i;

        const planet = createGifWindow(randomGif());
        const px = cx + Math.cos(startAngle) * orbitRadius - 40;
        const py = cy + Math.sin(startAngle) * orbitRadius - 40;

        planet.style.left = px + 'px';
        planet.style.top = py + 'px';
        planet.style.transition = `all ${speed}s linear`;
        planet.classList.add('orbit-planet');
        playArea.appendChild(planet);

        requestAnimationFrame(() => {
            const endAngle = startAngle + Math.PI;
            planet.style.left = (cx + Math.cos(endAngle) * orbitRadius - 40) + 'px';
            planet.style.top = (cy + Math.sin(endAngle) * orbitRadius - 40) + 'px';
            planet.style.transform = 'rotate(360deg)';
        });

        setTimeout(() => safeRemove(planet), speed * 1000 + 200);
    }
}

function tunnelVisionEffect() {
    const playArea = document.getElementById('play-area');
    if (!playArea || AppState.uploadedGifs.length === 0) return;

    const cx = playArea.clientWidth / 2;
    const cy = playArea.clientHeight / 2;
    const rings = Math.min(AppState.settings.glitchIntensity, 7);

    for (let i = 0; i < rings; i++) {
        setTimeout(() => {
            const win = createGifWindow(randomGif());
            const scale = 2.5 - (i / rings) * 2;

            win.style.left = (cx - 60) + 'px';
            win.style.top = (cy - 60) + 'px';
            win.style.transform = `scale(${scale})`;
            win.style.opacity = '0.4';
            win.style.transition = 'all 1.5s ease-out';
            win.classList.add('tunnel-ring');
            playArea.appendChild(win);

            requestAnimationFrame(() => {
                win.style.transform = 'scale(0.05)';
                win.style.opacity = '0';
            });

            setTimeout(() => safeRemove(win), 1600);
        }, i * 120);
    }
}

function flipBookEffect() {
    const playArea = document.getElementById('play-area');
    if (!playArea || AppState.uploadedGifs.length === 0) return;

    const cx = playArea.clientWidth / 2 - 130;
    const cy = playArea.clientHeight / 2 - 90;
    const frames = Math.min(AppState.uploadedGifs.length, AppState.settings.glitchIntensity * 2);

    for (let i = 0; i < frames; i++) {
        setTimeout(() => {
            playArea.querySelectorAll('.flipbook-frame').forEach(f => f.remove());
            const gif = AppState.uploadedGifs[i % AppState.uploadedGifs.length];
            const win = createGifWindow(gif);
            win.style.left = cx + 'px';
            win.style.top = cy + 'px';
            win.style.width = '260px';
            win.style.zIndex = '1000';
            win.classList.add('flipbook-frame');
            playArea.appendChild(win);
        }, i * 180);
    }

    setTimeout(() => {
        playArea.querySelectorAll('.flipbook-frame').forEach(f => f.remove());
    }, frames * 180 + 400);
}

// ============================================
// Utilities
// ============================================

function randomGif() {
    return AppState.uploadedGifs[Math.floor(Math.random() * AppState.uploadedGifs.length)];
}

function safeRemove(el) {
    if (el && el.parentNode) el.remove();
}

// ============================================
// Draggable Windows
// ============================================

function makeWindowsDraggable() {
    document.querySelectorAll('#desktop > .window').forEach(win => {
        enableDrag(win);
    });
}

function enableDrag(win) {
    const titleBar = win.querySelector('.window-title-bar');
    if (!titleBar) return;

    let isDragging = false;
    let startX, startY, origLeft, origTop;

    titleBar.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('window-control')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = win.getBoundingClientRect();
        origLeft = rect.left;
        origTop = rect.top;
        win.classList.add('dragging');
        win.style.zIndex = 100;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onDragEnd);
    });

    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const maxX = document.body.clientWidth - win.offsetWidth;
        const maxY = document.body.clientHeight - win.offsetHeight - 30;
        win.style.left = Math.max(0, Math.min(origLeft + dx, maxX)) + 'px';
        win.style.top = Math.max(0, Math.min(origTop + dy, maxY)) + 'px';
    }

    function onDragEnd() {
        isDragging = false;
        win.classList.remove('dragging');
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onDragEnd);
    }
}

// ============================================
// Play Controls Event Binding (called after DOM ready)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Play page BPM slider
    bindControl('play-bpm-slider', 'input', function(e) {
        const bpm = parseInt(e.target.value);
        if (isNaN(bpm)) return;
        AppState.settings.bpm = bpm;
        syncAllBPMDisplays();
        if (AppState.playState.isPlaying) updateBeatInterval();
    });

    // Play page effect select
    bindControl('play-effect-select', 'change', function(e) {
        AppState.settings.selectedEffect = e.target.value;
        setValueIfExists('effect-select', e.target.value, 'value');
    });

    // Play page intensity slider
    bindControl('play-intensity-slider', 'input', function(e) {
        AppState.settings.glitchIntensity = parseInt(e.target.value);
        syncAllIntensityDisplays();
    });

    // Play controls toggle
    const toggleBtn = document.querySelector('.play-controls-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', togglePlayControls);
    }

    // Play controls back button
    bindControl('play-back-btn', 'click', backToIndex);
});
