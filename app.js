// Application State
const AppState = {
    currentPage: 'index',
    uploadedGifs: [],
    settings: {
        bpm: 120,
        maxWindows: 5,
        glitchIntensity: 5,
        selectedEffect: 'Error Dialog Spam',
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

// Error messages from the data
const errorMessages = [
    "Ce programme a effectué une opération illégale et va être fermé",
    "Une exception fatale s'est produite",
    "Erreur de protection générale",
    "Erreur de page invalide dans le module KERNEL32.DLL",
    "Violation d'accès à l'adresse",
    "Erreur d'exécution"
];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initializing...');
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    updateClock();
    setInterval(updateClock, 1000);
    updateControlDisplays();
    makeWindowsDraggable();
    
    // Handle URL hash for routing
    handleRouting();
    window.addEventListener('hashchange', handleRouting);
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // GIF upload
    const gifUpload = document.getElementById('gif-upload');
    if (gifUpload) {
        gifUpload.addEventListener('change', handleGifUpload);
    }
    
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
    
    // Other controls
    const effectSelect = document.getElementById('effect-select');
    if (effectSelect) {
        effectSelect.addEventListener('change', updateEffect);
    }
    
    const intensitySlider = document.getElementById('intensity-slider');
    if (intensitySlider) {
        intensitySlider.addEventListener('input', updateIntensity);
        intensitySlider.addEventListener('change', updateIntensity);
    }
    
    const maxWindowsSlider = document.getElementById('max-windows-slider');
    if (maxWindowsSlider) {
        maxWindowsSlider.addEventListener('input', updateMaxWindows);
        maxWindowsSlider.addEventListener('change', updateMaxWindows);
    }
    
    const behaviorSelect = document.getElementById('behavior-select');
    if (behaviorSelect) {
        behaviorSelect.addEventListener('change', updateBehavior);
    }
    
    // Launch button
    const launchBtn = document.getElementById('launch-btn');
    if (launchBtn) {
        launchBtn.addEventListener('click', launchVisualizer);
    }
    
    // Back button
    const backBtn = document.getElementById('back-to-index');
    if (backBtn) {
        backBtn.addEventListener('click', backToIndex);
    }
    
    // Window controls
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('window-control')) {
            handleWindowControl(e);
        }
    });
    
    console.log('Event listeners set up complete');
}

function handleWindowControl(e) {
    const control = e.target;
    const window = control.closest('.window');
    
    if (control.classList.contains('close')) {
        const windowId = control.getAttribute('data-window');
        if (windowId && windowId !== 'launch-window') {
            const targetWindow = document.getElementById(windowId);
            if (targetWindow) {
                targetWindow.style.display = 'none';
            }
        } else if (control.closest('.error-dialog')) {
            control.closest('.error-dialog').remove();
        } else if (control.closest('.gif-window')) {
            closeGifWindow(control);
        }
    } else if (control.classList.contains('minimize') && window) {
        const content = window.querySelector('.window-content');
        if (content) {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        }
    }
}

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

function updateClock() {
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');
    const timeElement = document.getElementById('taskbar-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

function handleGifUpload(event) {
    console.log('Handling GIF upload...');
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
        console.log('Processing file:', file.name, file.type);
        if (file.type === 'image/gif') {
            const reader = new FileReader();
            reader.onload = function(e) {
                const gifData = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    url: e.target.result,
                    size: file.size
                };
                
                AppState.uploadedGifs.push(gifData);
                console.log('GIF added:', gifData.name);
                updateGifList();
            };
            reader.readAsDataURL(file);
        } else {
            console.log('File rejected - not a GIF:', file.name);
        }
    });
}

function updateGifList() {
    const gifList = document.getElementById('gif-list');
    if (!gifList) return;
    
    if (AppState.uploadedGifs.length === 0) {
        gifList.innerHTML = '<div class="no-gifs">Aucun GIF uploadé</div>';
        return;
    }
    
    gifList.innerHTML = AppState.uploadedGifs.map(gif => `
        <div class="gif-item">
            <img src="${gif.url}" alt="${gif.name}" class="gif-preview">
            <div class="gif-info">
                <div>${gif.name}</div>
                <div>${formatFileSize(gif.size)}</div>
            </div>
            <button class="gif-remove" onclick="removeGif('${gif.id}')">×</button>
        </div>
    `).join('');
}

function removeGif(gifId) {
    AppState.uploadedGifs = AppState.uploadedGifs.filter(gif => gif.id != gifId);
    updateGifList();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function updateBPM(event) {
    const bpm = parseInt(event.target.value);
    if (isNaN(bpm) || bpm < 60 || bpm > 200) return;
    
    AppState.settings.bpm = bpm;
    
    // Update all BPM displays
    const bpmDisplay = document.getElementById('bpm-display');
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmInput = document.getElementById('bpm-input');
    
    if (bpmDisplay) bpmDisplay.textContent = bpm;
    if (bpmSlider && bpmSlider !== event.target) bpmSlider.value = bpm;
    if (bpmInput && bpmInput !== event.target) bpmInput.value = bpm;
    
    if (AppState.playState.isPlaying) {
        updateBeatInterval();
    }
}

function updateEffect(event) {
    AppState.settings.selectedEffect = event.target.value;
    console.log('Effect updated to:', event.target.value);
}

function updateIntensity(event) {
    const intensity = parseInt(event.target.value);
    AppState.settings.glitchIntensity = intensity;
    
    const display = document.getElementById('intensity-display');
    if (display) display.textContent = intensity;
}

function updateMaxWindows(event) {
    const maxWindows = parseInt(event.target.value);
    AppState.settings.maxWindows = maxWindows;
    
    const display = document.getElementById('max-windows-display');
    if (display) display.textContent = maxWindows;
}

function updateBehavior(event) {
    AppState.settings.windowBehavior = event.target.value;
    console.log('Behavior updated to:', event.target.value);
}

function updateControlDisplays() {
    const bpmDisplay = document.getElementById('bpm-display');
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmInput = document.getElementById('bpm-input');
    const effectSelect = document.getElementById('effect-select');
    const intensityDisplay = document.getElementById('intensity-display');
    const intensitySlider = document.getElementById('intensity-slider');
    const maxWindowsDisplay = document.getElementById('max-windows-display');
    const maxWindowsSlider = document.getElementById('max-windows-slider');
    const behaviorSelect = document.getElementById('behavior-select');
    
    if (bpmDisplay) bpmDisplay.textContent = AppState.settings.bpm;
    if (bpmSlider) bpmSlider.value = AppState.settings.bpm;
    if (bpmInput) bpmInput.value = AppState.settings.bpm;
    if (effectSelect) effectSelect.value = AppState.settings.selectedEffect;
    if (intensityDisplay) intensityDisplay.textContent = AppState.settings.glitchIntensity;
    if (intensitySlider) intensitySlider.value = AppState.settings.glitchIntensity;
    if (maxWindowsDisplay) maxWindowsDisplay.textContent = AppState.settings.maxWindows;
    if (maxWindowsSlider) maxWindowsSlider.value = AppState.settings.maxWindows;
    if (behaviorSelect) behaviorSelect.value = AppState.settings.windowBehavior;
}

function launchVisualizer() {
    console.log('Launching visualizer...');
    window.location.hash = 'play';
}

function backToIndex() {
    console.log('Going back to index...');
    window.location.hash = 'index';
}

function startVisualization() {
    console.log('Starting visualization...');
    
    AppState.playState.isPlaying = true;
    AppState.playState.beatCount = 0;
    updateBeatInterval();
    
    // If no GIFs uploaded, create some placeholder windows
    if (AppState.uploadedGifs.length === 0) {
        createPlaceholderContent();
    }
}

function createPlaceholderContent() {
    // Create some placeholder content if no GIFs are uploaded
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    for (let i = 0; i < 3; i++) {
        const placeholderWindow = document.createElement('div');
        placeholderWindow.className = 'window gif-window';
        placeholderWindow.innerHTML = `
            <div class="window-title-bar">
                <div class="window-title">📁 Démo ${i + 1}</div>
                <div class="window-controls">
                    <button class="window-control close">×</button>
                </div>
            </div>
            <div class="window-content">
                <div style="width: 150px; height: 150px; background: ${colors[i % colors.length]}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                    Démo ${i + 1}
                </div>
            </div>
        `;
        
        positionWindow(placeholderWindow);
        document.getElementById('play-area').appendChild(placeholderWindow);
        AppState.playState.activeWindows.push(placeholderWindow);
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

function updateBeatInterval() {
    if (AppState.playState.beatInterval) {
        clearInterval(AppState.playState.beatInterval);
    }
    
    const beatDuration = 60000 / AppState.settings.bpm; // ms per beat
    AppState.playState.beatInterval = setInterval(onBeat, beatDuration);
}

function onBeat() {
    AppState.playState.beatCount++;
    
    // Beat indicator pulse
    const beatIndicator = document.getElementById('beat-indicator');
    if (beatIndicator) {
        beatIndicator.classList.add('pulse');
        setTimeout(() => beatIndicator.classList.remove('pulse'), 150);
    }
    
    // Spawn new GIF window occasionally
    if (AppState.playState.beatCount % 2 === 0 && 
        AppState.playState.activeWindows.length < AppState.settings.maxWindows) {
        spawnGifWindow();
    }
    
    // Trigger glitch effects
    if (AppState.playState.beatCount % getEffectFrequency() === 0) {
        triggerGlitchEffect();
    }
    
    // Clean up old windows occasionally
    if (AppState.playState.beatCount % 8 === 0) {
        cleanupOldWindows();
    }
}

function getEffectFrequency() {
    // Higher intensity = more frequent effects
    return Math.max(1, 11 - AppState.settings.glitchIntensity);
}

function spawnGifWindow() {
    if (AppState.uploadedGifs.length === 0) return;
    
    const randomGif = AppState.uploadedGifs[Math.floor(Math.random() * AppState.uploadedGifs.length)];
    const windowElement = createGifWindow(randomGif);
    
    positionWindow(windowElement);
    
    const playArea = document.getElementById('play-area');
    if (playArea) {
        playArea.appendChild(windowElement);
        AppState.playState.activeWindows.push(windowElement);
        
        // Add entrance animation
        windowElement.classList.add('cascade-animation');
    }
}

function createGifWindow(gif) {
    const windowDiv = document.createElement('div');
    windowDiv.className = 'window gif-window';
    windowDiv.innerHTML = `
        <div class="window-title-bar">
            <div class="window-title">📁 ${gif.name}</div>
            <div class="window-controls">
                <button class="window-control close">×</button>
            </div>
        </div>
        <div class="window-content">
            <img src="${gif.url}" alt="${gif.name}" class="gif-display">
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
    
    switch (AppState.settings.windowBehavior) {
        case 'Grid':
            const gridSize = Math.ceil(Math.sqrt(AppState.settings.maxWindows));
            const cellWidth = areaWidth / gridSize;
            const cellHeight = areaHeight / gridSize;
            const index = AppState.playState.activeWindows.length;
            x = (index % gridSize) * cellWidth;
            y = Math.floor(index / gridSize) * cellHeight;
            break;
            
        case 'Cascade':
            const offset = AppState.playState.activeWindows.length * 30;
            x = 50 + offset;
            y = 50 + offset;
            break;
            
        default: // Random
            x = Math.random() * (areaWidth - 300);
            y = Math.random() * (areaHeight - 200);
    }
    
    windowElement.style.left = Math.max(0, x) + 'px';
    windowElement.style.top = Math.max(0, y) + 'px';
}

function closeGifWindow(button) {
    const window = button.closest('.gif-window');
    if (window) {
        AppState.playState.activeWindows = AppState.playState.activeWindows.filter(w => w !== window);
        window.remove();
    }
}

function cleanupOldWindows() {
    // Remove oldest windows if we have too many
    while (AppState.playState.activeWindows.length > AppState.settings.maxWindows) {
        const oldestWindow = AppState.playState.activeWindows.shift();
        if (oldestWindow && oldestWindow.parentNode) {
            oldestWindow.remove();
        }
    }
}

function clearPlayArea() {
    const playArea = document.getElementById('play-area');
    if (playArea) {
        playArea.innerHTML = '';
    }
    AppState.playState.activeWindows = [];
}

function triggerGlitchEffect() {
    const effect = AppState.settings.selectedEffect;
    
    switch (effect) {
        case 'Error Dialog Spam':
            spawnErrorDialog();
            break;
        case 'Blue Screen of Death':
            showBSOD();
            break;
        case 'Window Cascade Glitch':
            cascadeGlitch();
            break;
        case 'Screen Corruption':
            screenCorruption();
            break;
        case 'Memory Leak Visual':
            memoryLeakEffect();
            break;
        case 'System Freeze':
            systemFreeze();
            break;
    }
}

function spawnErrorDialog() {
    const errorTemplate = document.getElementById('error-dialog-template');
    if (!errorTemplate) return;
    
    const errorDialog = errorTemplate.cloneNode(true);
    errorDialog.id = 'error-' + Date.now();
    errorDialog.classList.remove('hidden');
    
    const message = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    const messageElement = errorDialog.querySelector('.error-message');
    if (messageElement) {
        messageElement.textContent = message;
    }
    
    // Random position
    const playArea = document.getElementById('play-area');
    if (playArea) {
        errorDialog.style.left = Math.random() * (playArea.clientWidth - 300) + 'px';
        errorDialog.style.top = Math.random() * (playArea.clientHeight - 150) + 'px';
        
        // Add shake animation
        errorDialog.classList.add('error-shake');
        
        playArea.appendChild(errorDialog);
        
        // Auto-close after some time based on intensity
        const autoCloseTime = Math.max(1000, 5000 - (AppState.settings.glitchIntensity * 400));
        setTimeout(() => {
            if (errorDialog.parentNode) {
                errorDialog.remove();
            }
        }, autoCloseTime);
    }
}

function showBSOD() {
    const bsodTemplate = document.getElementById('bsod-template');
    if (!bsodTemplate) return;
    
    const bsod = bsodTemplate.cloneNode(true);
    bsod.id = 'bsod-' + Date.now();
    bsod.classList.remove('hidden');
    
    const playArea = document.getElementById('play-area');
    if (playArea) {
        playArea.appendChild(bsod);
        
        // Duration based on intensity
        const duration = Math.max(500, 3000 - (AppState.settings.glitchIntensity * 200));
        setTimeout(() => {
            if (bsod.parentNode) {
                bsod.remove();
            }
        }, duration);
    }
}

function cascadeGlitch() {
    const numberOfWindows = AppState.settings.glitchIntensity;
    
    for (let i = 0; i < numberOfWindows; i++) {
        setTimeout(() => {
            if (AppState.uploadedGifs.length > 0) {
                spawnGifWindow();
            }
        }, i * 100);
    }
}

function screenCorruption() {
    const playArea = document.getElementById('play-area');
    if (playArea) {
        playArea.classList.add('glitch-corruption');
        
        const duration = AppState.settings.glitchIntensity * 300;
        setTimeout(() => {
            playArea.classList.remove('glitch-corruption');
        }, duration);
    }
}

function memoryLeakEffect() {
    AppState.playState.activeWindows.forEach(window => {
        if (Math.random() < 0.3) { // 30% chance
            window.classList.add('memory-leak');
        }
    });
    
    // Don't clean up immediately - let them accumulate
    setTimeout(() => {
        AppState.playState.activeWindows.forEach(window => {
            window.classList.remove('memory-leak');
        });
    }, 2000);
}

function systemFreeze() {
    const playArea = document.getElementById('play-area');
    if (playArea) {
        playArea.classList.add('glitch-freeze');
        
        // Show loading cursor
        document.body.style.cursor = 'wait';
        
        const duration = AppState.settings.glitchIntensity * 200;
        setTimeout(() => {
            playArea.classList.remove('glitch-freeze');
            document.body.style.cursor = 'default';
        }, duration);
    }
}

function makeWindowsDraggable() {
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(window => {
        const titleBar = window.querySelector('.window-title-bar');
        if (!titleBar) return;
        
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        titleBar.addEventListener('mousedown', dragStart);
        
        function dragStart(e) {
            if (e.target.classList.contains('window-control')) return;
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
            if (e.target === titleBar || titleBar.contains(e.target)) {
                isDragging = true;
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', dragEnd);
                window.classList.add('dragging');
            }
        }
        
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                
                const rect = window.getBoundingClientRect();
                const maxX = document.body.clientWidth - rect.width;
                const maxY = document.body.clientHeight - rect.height - 30; // Account for taskbar
                
                currentX = Math.max(0, Math.min(currentX, maxX));
                currentY = Math.max(0, Math.min(currentY, maxY));
                
                window.style.left = currentX + 'px';
                window.style.top = currentY + 'px';
            }
        }
        
        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', dragEnd);
            window.classList.remove('dragging');
        }
    });
}