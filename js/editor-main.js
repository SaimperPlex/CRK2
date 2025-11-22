// ============================================
// EDITOR MAIN - Primera Mitad OPTIMIZADA
// Gestos táctiles fluidos y responsivos
// ============================================

// Estado global del editor
const EditorState = {
    canvas: null,
    elements: [],
    selectedElement: null,
    history: [],
    historyIndex: -1,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    configManager: null,
    fonts: [],
    colors: [],
    currentProduct: null,
    welcomeBackground: null
};

// ============================================
// CONFIG MANAGER
// ============================================
class ConfigManager {
    constructor() {
        this.storageKey = 'crk2_event_config';
    }

    loadConfig() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    welcomeBackground: parsed.welcomeBackground || null,
                    eventLogo: parsed.eventLogo || null,
                    products: Array.isArray(parsed.products) ? parsed.products : [],
                    customImages: Array.isArray(parsed.customImages) ? parsed.customImages : [],
                    cliparts: Array.isArray(parsed.cliparts) ? parsed.cliparts : [],
                    colors: Array.isArray(parsed.colors) ? parsed.colors : ['#000000', '#FFFFFF', '#FF0000'],
                    fonts: Array.isArray(parsed.fonts) ? parsed.fonts : ['Roboto', 'Montserrat', 'Bebas Neue'],
                    configured: parsed.configured || false
                };
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
        }
        
        return {
            welcomeBackground: null,
            eventLogo: null,
            products: [],
            customImages: [],
            cliparts: [],
            colors: ['#000000', '#FFFFFF', '#FF0000'],
            fonts: ['Roboto', 'Montserrat', 'Bebas Neue'],
            configured: false
        };
    }

    getConfig() {
        return this.loadConfig();
    }
}

// ============================================
// CARGAR CONFIGURACIÓN
// ============================================
function loadConfig() {
    EditorState.configManager = new ConfigManager();
    const config = EditorState.configManager.getConfig();
    
    console.log('📦 Configuración cargada');
    
    if (!config.configured || config.products.length === 0) {
        alert('No hay productos configurados. Redirigiendo al panel de administración...');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
        return;
    }
    
    EditorState.welcomeBackground = config.welcomeBackground;
    initializeWithConfig(config);
}

function initializeWithConfig(config) {
    if (config.eventLogo) {
        document.body.style.backgroundImage = `url(${config.eventLogo})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
    }
    
    EditorState.colors = config.colors || ['#000000', '#FFFFFF', '#FF0000'];
    EditorState.fonts = config.fonts || ['Roboto', 'Montserrat', 'Bebas Neue'];
    
    loadProducts(config.products);
    loadCliparts(config.cliparts);
    loadCustomImages(config.customImages);
    loadFonts();
    loadColorPalette();
    
    console.log('✅ Editor inicializado');
}

// ============================================
// CARGAR PRODUCTOS
// ============================================
function loadProducts(products) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    if (!products || products.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No hay productos disponibles</p>';
        return;
    }
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.productId = product.id;
        
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
        
        const name = document.createElement('div');
        name.className = 'product-name';
        name.textContent = product.name;
        
        card.appendChild(img);
        card.appendChild(name);
        card.addEventListener('click', () => selectProduct(product, card));
        grid.appendChild(card);
    });
}

function selectProduct(product, card) {
    document.querySelectorAll('.product-card.selected').forEach(c => {
        c.classList.remove('selected');
    });
    
    card.classList.add('selected');
    EditorState.currentProduct = product;
    
    const canvas = document.getElementById('editor-canvas');
    const existingProductImg = canvas.querySelector('.product-background-image');
    if (existingProductImg) {
        existingProductImg.remove();
    }
    
    if (product.image) {
        const productImg = document.createElement('img');
        productImg.src = product.image;
        productImg.className = 'product-background-image';
        productImg.style.position = 'absolute';
        productImg.style.top = '50%';
        productImg.style.left = '50%';
        productImg.style.transform = 'translate(-50%, -50%)';
        productImg.style.maxWidth = '100%';
        productImg.style.maxHeight = '100%';
        productImg.style.width = 'auto';
        productImg.style.height = 'auto';
        productImg.style.objectFit = 'contain';
        productImg.style.pointerEvents = 'none';
        productImg.style.zIndex = '0';
        productImg.draggable = false;
        
        canvas.insertBefore(productImg, canvas.firstChild);
    }
}

// ============================================
// CARGAR CLIPARTS Y OTROS
// ============================================
function loadCliparts(cliparts) {
    const list = document.getElementById('cliparts-list');
    list.innerHTML = '';
    
    if (!cliparts || cliparts.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No hay stickers disponibles</p>';
        return;
    }
    
    cliparts.forEach(clipart => {
        const item = document.createElement('div');
        item.className = 'clipart-item';
        
        const img = document.createElement('img');
        img.src = clipart.image;
        img.alt = clipart.name || 'Sticker';
        
        item.appendChild(img);
        item.addEventListener('click', () => createImageElement(clipart.image));
        list.appendChild(item);
    });
}

function loadCustomImages(images) {
    const list = document.getElementById('custom-images-list');
    list.innerHTML = '';
    
    if (images && images.length > 0) {
        images.forEach(image => {
            const item = document.createElement('div');
            item.className = 'clipart-item';
            
            const img = document.createElement('img');
            img.src = image.image;
            img.alt = image.name || 'Imagen';
            
            item.appendChild(img);
            item.addEventListener('click', () => createImageElement(image.image));
            list.appendChild(item);
        });
    } else {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No hay imágenes personalizadas</p>';
    }
}

function loadColorPalette() {
    const colorPickerPanel = document.getElementById('color-picker-panel');
    if (!colorPickerPanel) return;
    
    colorPickerPanel.innerHTML = '';
    
    const palette = document.createElement('div');
    palette.className = 'color-palette';
    palette.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
        gap: 10px;
        padding: 16px;
    `;
    
    EditorState.colors.forEach(color => {
        const colorBtn = document.createElement('button');
        colorBtn.className = 'color-palette-btn';
        colorBtn.style.cssText = `
            width: 45px;
            height: 45px;
            border-radius: 8px;
            background-color: ${color};
            border: 3px solid var(--border-color);
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        
        colorBtn.addEventListener('click', () => {
            if (!EditorState.selectedElement || !EditorState.selectedElement.classList.contains('text-element')) {
                alert('Primero selecciona un texto');
                return;
            }
            
            changeTextColor(color);
        });
        
        palette.appendChild(colorBtn);
    });
    
    colorPickerPanel.appendChild(palette);
}

function loadFonts() {
    const list = document.getElementById('fonts-list');
    list.innerHTML = '';
    
    if (!EditorState.fonts || EditorState.fonts.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No hay fuentes</p>';
        return;
    }
    
    EditorState.fonts.forEach(font => {
        const item = document.createElement('div');
        item.className = 'font-item';
        
        const preview = document.createElement('div');
        preview.className = 'font-preview';
        preview.style.fontFamily = font;
        preview.textContent = font;
        
        item.appendChild(preview);
        item.addEventListener('click', () => applyFont(font, item));
        list.appendChild(item);
    });
}

function applyFont(font, item) {
    if (!EditorState.selectedElement || !EditorState.selectedElement.classList.contains('text-element')) {
        alert('Primero selecciona un texto');
        return;
    }
    
    EditorState.selectedElement.style.fontFamily = font;
    
    document.querySelectorAll('.font-item.selected').forEach(f => {
        f.classList.remove('selected');
    });
    item.classList.add('selected');
    
    saveState();
}

// ============================================
// CREAR ELEMENTOS
// ============================================
function createTextElement(text = 'Tu texto') {
    const canvas = document.getElementById('editor-canvas');
    const canvasRect = canvas.getBoundingClientRect();
    
    const element = document.createElement('div');
    element.className = 'canvas-element text-element';
    element.contentEditable = true;
    element.textContent = text;
    element.style.cssText = `
        position: absolute;
        font-size: 48px;
        font-family: ${EditorState.fonts[0] || 'Roboto'};
        color: ${EditorState.colors[0] || '#000000'};
        font-weight: normal;
        padding: 8px;
        cursor: move;
        user-select: none;
        -webkit-user-select: none;
        z-index: 10;
        white-space: nowrap;
        transform: scale(1) rotate(0deg);
        transform-origin: center center;
        touch-action: none;
        will-change: transform;
        text-shadow: none;
        box-shadow: none;
    `;
    
    canvas.appendChild(element);
    
    const elementRect = element.getBoundingClientRect();
    const centerX = (canvasRect.width - elementRect.width) / 2;
    const centerY = (canvasRect.height - elementRect.height) / 2;
    
    element.style.left = centerX + 'px';
    element.style.top = centerY + 'px';
    
    setupElementEvents(element);
    EditorState.elements.push(element);
    selectElement(element);
    saveState();
}

function createImageElement(src) {
    const element = document.createElement('div');
    element.className = 'canvas-element image-element';
    element.style.cssText = `
        position: absolute;
        left: 100px;
        top: 100px;
        width: 150px;
        height: 150px;
        cursor: move;
        z-index: 10;
        transform: scale(1) rotate(0deg);
        transform-origin: center center;
        touch-action: none;
        will-change: transform;
    `;
    
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
        pointer-events: none;
    `;
    img.draggable = false;
    
    element.appendChild(img);
    
    setupElementEvents(element);
    EditorState.canvas.appendChild(element);
    EditorState.elements.push(element);
    selectElement(element);
    saveState();
}

// ============================================
// SISTEMA DE EVENTOS OPTIMIZADO Y FLUIDO
// ============================================
function setupElementEvents(element) {
    let isEditing = false;
    let touchTimer = null;
    let isMultiTouch = false;
    let touchMoveListener = null;
    let touchEndListener = null;
    
    // Variables para transformación suave
    let transformState = {
        initialDistance: 0,
        initialAngle: 0,
        initialScale: 1,
        initialRotation: 0,
        lastScale: 1,
        lastRotation: 0
    };
    
    // Detectar si es texto (necesita optimizaciones especiales)
    const isTextElement = element.classList.contains('text-element');
    
    // Obtener transformación actual (optimizada)
    const getCurrentTransform = () => {
        const transform = element.style.transform || '';
        const scaleMatch = transform.match(/scale\(([\d.]+)\)/);
        const rotateMatch = transform.match(/rotate\(([-\d.]+)deg\)/);
        
        return {
            scale: scaleMatch ? parseFloat(scaleMatch[1]) : 1,
            rotation: rotateMatch ? parseFloat(rotateMatch[1]) : 0
        };
    };
    
    // Aplicar transformación con requestAnimationFrame para fluidez
    const applyTransform = (scale, rotation) => {
        requestAnimationFrame(() => {
            element.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
        });
    };
    
    // Calcular distancia (optimizada)
    const getDistance = (t1, t2) => {
        const dx = t2.clientX - t1.clientX;
        const dy = t2.clientY - t1.clientY;
        return Math.hypot(dx, dy);
    };
    
    // Calcular ángulo (optimizada)
    const getAngle = (t1, t2) => {
        return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI;
    };
    
    // ============================================
    // MOUSE EVENTS (Desktop)
    // ============================================
    element.addEventListener('mousedown', (e) => {
        if (isTextElement && isEditing) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        selectElement(element);
        startDrag(e, element);
    });
    
    // ============================================
    // TEXTO - Edición
    // ============================================
    if (isTextElement) {
        element.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            enterEditMode(element);
            isEditing = true;
        });
        
        element.addEventListener('blur', () => {
            isEditing = false;
            element.style.cursor = 'move';
            element.style.userSelect = 'none';
            element.style.WebkitUserSelect = 'none';
            saveState();
        });
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                element.blur();
            }
        });
    }
    
    // ============================================
    // TOUCH START - Detectar gestos
    // ============================================
    element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        selectElement(element);
        
        const touches = e.touches;
        
        // ============================================
        // UN DEDO - Mover
        // ============================================
        if (touches.length === 1) {
            isMultiTouch = false;
            
            // Timer para editar texto
            if (isTextElement) {
                touchTimer = setTimeout(() => {
                    enterEditMode(element);
                    isEditing = true;
                    touchTimer = null;
                }, 500);
            }
            
            // Cancelar timer al mover
            const cancelTimer = () => {
                if (touchTimer) {
                    clearTimeout(touchTimer);
                    touchTimer = null;
                }
            };
            
            element.addEventListener('touchmove', cancelTimer, { once: true, passive: true });
            startDrag(touches[0], element);
        }
        
        // ============================================
        // DOS DEDOS - Escalar y Rotar (OPTIMIZADO PARA TEXTO)
        // ============================================
        else if (touches.length === 2) {
            isMultiTouch = true;
            
            // Cancelar timer y drag
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
            EditorState.isDragging = false;
            
            // Guardar estado inicial
            const currentTransform = getCurrentTransform();
            transformState = {
                initialScale: currentTransform.scale,
                initialRotation: currentTransform.rotation,
                initialDistance: getDistance(touches[0], touches[1]),
                initialAngle: getAngle(touches[0], touches[1]),
                lastScale: currentTransform.scale,
                lastRotation: currentTransform.rotation
            };
            
            // Para texto, desactivar temporalmente contentEditable
            if (isTextElement) {
                element.contentEditable = false;
                element.style.pointerEvents = 'none';
            }
            
            element.style.transition = 'opacity 0.1s ease';
            element.style.opacity = '0.9';
            
            // ============================================
            // TOUCH MOVE - Actualizar transformación (MÁS FLUIDO PARA TEXTO)
            // ============================================
            touchMoveListener = (moveEvent) => {
                if (!isMultiTouch || moveEvent.touches.length !== 2) return;
                
                moveEvent.preventDefault();
                moveEvent.stopPropagation();
                
                const t1 = moveEvent.touches[0];
                const t2 = moveEvent.touches[1];
                
                // Calcular escala con suavizado más agresivo para texto
                const currentDistance = getDistance(t1, t2);
                const scaleRatio = currentDistance / transformState.initialDistance;
                let newScale = transformState.initialScale * scaleRatio;
                
                // Límites de escala
                newScale = Math.max(0.2, Math.min(6, newScale));
                
                // Suavizado más agresivo para texto (evita saltos)
                const smoothingFactor = isTextElement ? 0.9 : 0.8;
                newScale = transformState.lastScale + (newScale - transformState.lastScale) * smoothingFactor;
                transformState.lastScale = newScale;
                
                // Calcular rotación con suavizado
                const currentAngle = getAngle(t1, t2);
                const angleDiff = currentAngle - transformState.initialAngle;
                let newRotation = transformState.initialRotation + angleDiff;
                
                // Suavizado de rotación
                newRotation = transformState.lastRotation + (newRotation - transformState.lastRotation) * smoothingFactor;
                transformState.lastRotation = newRotation;
                
                // Aplicar transformación fluida
                applyTransform(newScale, newRotation);
            };
            
            // ============================================
            // TOUCH END - Finalizar transformación
            // ============================================
            touchEndListener = (endEvent) => {
                if (endEvent.touches.length < 2) {
                    element.style.opacity = '1';
                    element.style.transition = '';
                    isMultiTouch = false;
                    
                    // Restaurar contentEditable para texto
                    if (isTextElement) {
                        element.contentEditable = true;
                        element.style.pointerEvents = 'auto';
                    }
                    
                    // Limpiar listeners
                    document.removeEventListener('touchmove', touchMoveListener);
                    document.removeEventListener('touchend', touchEndListener);
                    
                    saveState();
                    console.log('✅ Transformación aplicada');
                }
            };
            
            // Agregar listeners con passive: false para preventDefault
            document.addEventListener('touchmove', touchMoveListener, { passive: false });
            document.addEventListener('touchend', touchEndListener, { passive: false });
        }
    }, { passive: false });
    
    // TOUCH END en el elemento
    element.addEventListener('touchend', () => {
        if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
        }
    });
}

console.log('✅ Primera mitad optimizada cargada - Gestos fluidos activados');

// ============================================
// EDITOR MAIN - SEGUNDA MITAD OPTIMIZADA
// ============================================

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function enterEditMode(element) {
    element.style.cursor = 'text';
    element.style.userSelect = 'text';
    element.style.WebkitUserSelect = 'text';
    element.focus();
    
    const range = document.createRange();
    range.selectNodeContents(element);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    
    console.log('✏️ Modo edición activado');
}

function selectElement(element) {
    if (EditorState.selectedElement) {
        EditorState.selectedElement.classList.remove('selected');
    }
    
    element.classList.add('selected');
    EditorState.selectedElement = element;
    
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) deleteBtn.disabled = false;
}

function startDrag(e, element) {
    EditorState.isDragging = true;
    element.classList.add('dragging');
    
    const rect = element.getBoundingClientRect();
    const canvasRect = EditorState.canvas.getBoundingClientRect();
    
    EditorState.dragOffset = {
        x: (e.clientX || e.pageX) - rect.left,
        y: (e.clientY || e.pageY) - rect.top
    };
    
    // Usar requestAnimationFrame para drag más fluido
    let rafId = null;
    let lastX = null;
    let lastY = null;
    
    const onMove = (moveEvent) => {
        if (!EditorState.isDragging) return;
        
        moveEvent.preventDefault();
        
        const clientX = moveEvent.clientX || moveEvent.touches?.[0]?.clientX;
        const clientY = moveEvent.clientY || moveEvent.touches?.[0]?.clientY;
        
        if (!clientX || !clientY) return;
        
        // Guardar posición para el siguiente frame
        lastX = clientX;
        lastY = clientY;
        
        // Cancelar frame anterior si existe
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        
        // Actualizar posición en el siguiente frame
        rafId = requestAnimationFrame(() => {
            const newX = lastX - canvasRect.left - EditorState.dragOffset.x;
            const newY = lastY - canvasRect.top - EditorState.dragOffset.y;
            
            element.style.left = Math.max(0, Math.min(newX, canvasRect.width - rect.width)) + 'px';
            element.style.top = Math.max(0, Math.min(newY, canvasRect.height - rect.height)) + 'px';
        });
    };
    
    const onEnd = () => {
        EditorState.isDragging = false;
        element.classList.remove('dragging');
        
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        
        saveState();
    };
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
}

// ============================================
// GESTIÓN DE ESTADO (UNDO/REDO)
// ============================================
function saveState() {
    const state = {
        productId: EditorState.currentProduct?.id,
        elements: EditorState.elements.map(el => ({
            type: el.classList.contains('text-element') ? 'text' : 'image',
            left: el.style.left,
            top: el.style.top,
            fontSize: el.style.fontSize,
            fontFamily: el.style.fontFamily,
            color: el.style.color,
            width: el.style.width,
            height: el.style.height,
            transform: el.style.transform,
            content: el.classList.contains('text-element') ? el.textContent : el.querySelector('img')?.src
        }))
    };
    
    EditorState.history = EditorState.history.slice(0, EditorState.historyIndex + 1);
    EditorState.history.push(state);
    EditorState.historyIndex++;
    
    if (EditorState.history.length > 50) {
        EditorState.history.shift();
        EditorState.historyIndex--;
    }
    
    updateUndoRedoButtons();
}

function undo() {
    if (EditorState.historyIndex > 0) {
        EditorState.historyIndex--;
        restoreState(EditorState.history[EditorState.historyIndex]);
        updateUndoRedoButtons();
        console.log('⏪ Deshacer');
    }
}

function redo() {
    if (EditorState.historyIndex < EditorState.history.length - 1) {
        EditorState.historyIndex++;
        restoreState(EditorState.history[EditorState.historyIndex]);
        updateUndoRedoButtons();
        console.log('⏩ Rehacer');
    }
}

function restoreState(state) {
    const productImg = EditorState.canvas.querySelector('.product-background-image');
    
    const elementsToRemove = EditorState.canvas.querySelectorAll('.canvas-element');
    elementsToRemove.forEach(el => el.remove());
    
    EditorState.elements = [];
    
    state.elements.forEach(elData => {
        if (elData.type === 'text') {
            const el = document.createElement('div');
            el.className = 'canvas-element text-element';
            el.contentEditable = true;
            el.textContent = elData.content;
            el.style.cssText = `
                position: absolute;
                left: ${elData.left};
                top: ${elData.top};
                font-size: ${elData.fontSize};
                font-family: ${elData.fontFamily};
                color: ${elData.color};
                font-weight: bold;
                padding: 8px;
                cursor: move;
                z-index: 10;
                user-select: none;
                -webkit-user-select: none;
                transform: ${elData.transform || 'scale(1) rotate(0deg)'};
                transform-origin: center center;
                touch-action: none;
                will-change: transform;
            `;
            
            setupElementEvents(el);
            EditorState.canvas.appendChild(el);
            EditorState.elements.push(el);
        } else if (elData.type === 'image') {
            const el = document.createElement('div');
            el.className = 'canvas-element image-element';
            el.style.cssText = `
                position: absolute;
                left: ${elData.left};
                top: ${elData.top};
                width: ${elData.width};
                height: ${elData.height};
                cursor: move;
                z-index: 10;
                transform: ${elData.transform || 'scale(1) rotate(0deg)'};
                transform-origin: center center;
                touch-action: none;
                will-change: transform;
            `;
            
            const img = document.createElement('img');
            img.src = elData.content;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: contain;
                pointer-events: none;
            `;
            img.draggable = false;
            el.appendChild(img);
            
            setupElementEvents(el);
            EditorState.canvas.appendChild(el);
            EditorState.elements.push(el);
        }
    });
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    if (undoBtn) undoBtn.disabled = EditorState.historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = EditorState.historyIndex >= EditorState.history.length - 1;
}

// ============================================
// ACCIONES DEL TOOLBAR
// ============================================
function deleteSelected() {
    if (!EditorState.selectedElement) return;
    
    EditorState.selectedElement.remove();
    EditorState.elements = EditorState.elements.filter(el => el !== EditorState.selectedElement);
    EditorState.selectedElement = null;
    
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) deleteBtn.disabled = true;
    
    saveState();
    console.log('🗑️ Elemento eliminado');
}

function resetCanvas() {
    if (!confirm('¿Estás seguro de que quieres reiniciar el diseño?')) return;
    
    EditorState.canvas.innerHTML = '';
    EditorState.elements = [];
    EditorState.selectedElement = null;
    EditorState.history = [];
    EditorState.historyIndex = -1;
    EditorState.currentProduct = null;
    
    document.querySelectorAll('.product-card.selected').forEach(c => {
        c.classList.remove('selected');
    });
    
    updateUndoRedoButtons();
    
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) deleteBtn.disabled = true;
    
    saveState();
    console.log('🔄 Canvas reiniciado');
}

function changeTextColor(color) {
    if (!EditorState.selectedElement || !EditorState.selectedElement.classList.contains('text-element')) {
        return;
    }
    
    EditorState.selectedElement.style.color = color;
    saveState();
    console.log('🎨 Color cambiado:', color);
}

// ============================================
// THEME TOGGLE
// ============================================
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    const icon = document.getElementById('theme-icon');
    if (icon) {
        if (isDark) {
            icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        } else {
            icon.innerHTML = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
        }
    }
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ============================================
// PANEL TOGGLES
// ============================================
function togglePanel(panelId) {
    const panels = ['product-selector', 'fonts-panel', 'custom-images-panel', 'cliparts-panel'];
    
    panels.forEach(id => {
        const panel = document.getElementById(id);
        if (panel) {
            if (id === panelId) {
                panel.classList.toggle('open');
            } else {
                panel.classList.remove('open');
            }
        }
    });
    
    const colorPanel = document.getElementById('color-picker-panel');
    if (colorPanel) colorPanel.classList.remove('active');
}

function toggleColorPicker() {
    const panel = document.getElementById('color-picker-panel');
    if (!panel) return;
    
    panel.classList.toggle('active');
    
    ['product-selector', 'fonts-panel', 'custom-images-panel', 'cliparts-panel'].forEach(id => {
        const p = document.getElementById(id);
        if (p) p.classList.remove('open');
    });
}

// ============================================
// GUARDAR DISEÑO Y EXPORTAR
// ============================================
function saveDesign() {
    if (!EditorState.currentProduct) {
        alert('Primero selecciona un producto');
        return;
    }
    
    const modal = document.getElementById('save-modal');
    if (modal) modal.classList.add('active');
}

async function confirmSave() {
    const clientName = document.getElementById('client-name-input')?.value.trim();
    
    if (!clientName) {
        alert('Por favor ingresa tu nombre');
        return;
    }
    
    try {
        const saveModal = document.getElementById('save-modal');
        if (saveModal) saveModal.classList.remove('active');
        
        if (!window.DOMExporter) {
            throw new Error('DOMExporter no está cargado. Verifica que export-dom.js esté incluido.');
        }
        
        const exporter = new DOMExporter(EditorState.canvas);
        const fileName = await exporter.exportToPNG(clientName);
        
        console.log('✅ Imagen exportada:', fileName);
        
        // Guardar diseño en localStorage
        const designData = {
            id: Date.now(),
            clientName,
            productId: EditorState.currentProduct?.id,
            productName: EditorState.currentProduct?.name,
            fileName: fileName,
            elements: EditorState.elements.map(el => ({
                type: el.classList.contains('text-element') ? 'text' : 'image',
                left: el.style.left,
                top: el.style.top,
                content: el.classList.contains('text-element') ? el.textContent : el.querySelector('img')?.src,
                fontSize: el.style.fontSize,
                fontFamily: el.style.fontFamily,
                color: el.style.color,
                width: el.style.width,
                height: el.style.height,
                transform: el.style.transform
            })),
            timestamp: new Date().toISOString()
        };
        
        const designs = JSON.parse(localStorage.getItem('crk2_designs') || '[]');
        designs.push(designData);
        localStorage.setItem('crk2_designs', JSON.stringify(designs));
        
        const successModal = document.getElementById('success-modal');
        const successMessage = document.getElementById('success-message');
        
        if (successModal) successModal.classList.add('active');
        if (successMessage) successMessage.textContent = `¡Diseño guardado y descargado correctamente, ${clientName}!`;
        
        console.log('💾 Diseño guardado:', designData);
        
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        alert('Error al exportar el diseño: ' + error.message);
        
        const saveModal = document.getElementById('save-modal');
        if (saveModal) saveModal.classList.add('active');
    }
}

// ============================================
// INICIALIZACIÓN OPTIMIZADA
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando editor optimizado...');
    
    EditorState.canvas = document.getElementById('editor-canvas');
    
    if (!EditorState.canvas) {
        console.error('❌ No se encontró el canvas');
        return;
    }
    
    // Optimizar canvas para touch
    EditorState.canvas.style.touchAction = 'none';
    
    loadConfig();
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // Event Listeners - Toolbar Secondary
    const themeBtn = document.getElementById('theme-toggle-btn');
    const homeBtn = document.getElementById('home-btn');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    if (homeBtn) homeBtn.addEventListener('click', () => window.location.href = 'index.html');
    if (undoBtn) undoBtn.addEventListener('click', undo);
    if (redoBtn) redoBtn.addEventListener('click', redo);
    if (deleteBtn) deleteBtn.addEventListener('click', deleteSelected);
    if (resetBtn) resetBtn.addEventListener('click', resetCanvas);
    
    // Event Listeners - Toolbar Primary
    const productsBtn = document.getElementById('toggle-products-btn');
    const textBtn = document.getElementById('toggle-text-btn');
    const imagesBtn = document.getElementById('toggle-custom-images-btn');
    const clipartsBtn = document.getElementById('toggle-cliparts-btn');
    const colorBtn = document.getElementById('color-btn');
    const saveBtn = document.getElementById('save-btn');
    
    if (productsBtn) productsBtn.addEventListener('click', () => togglePanel('product-selector'));
    if (textBtn) textBtn.addEventListener('click', () => togglePanel('fonts-panel'));
    if (imagesBtn) imagesBtn.addEventListener('click', () => togglePanel('custom-images-panel'));
    if (clipartsBtn) clipartsBtn.addEventListener('click', () => togglePanel('cliparts-panel'));
    if (colorBtn) colorBtn.addEventListener('click', toggleColorPicker);
    if (saveBtn) saveBtn.addEventListener('click', saveDesign);
    
    // Event Listeners - Panels
    const closeFontsBtn = document.getElementById('close-fonts-btn');
    const addTextBtn = document.getElementById('add-text-action');
    
    if (closeFontsBtn) {
        closeFontsBtn.addEventListener('click', () => {
            const fontsPanel = document.getElementById('fonts-panel');
            if (fontsPanel) fontsPanel.classList.remove('open');
        });
    }
    
    if (addTextBtn) addTextBtn.addEventListener('click', () => createTextElement());
    
    // Modales
    const cancelSaveBtn = document.getElementById('cancel-save-btn');
    const confirmSaveBtn = document.getElementById('confirm-save-btn');
    const newDesignBtn = document.getElementById('new-design-btn');
    
    if (cancelSaveBtn) {
        cancelSaveBtn.addEventListener('click', () => {
            const saveModal = document.getElementById('save-modal');
            const clientInput = document.getElementById('client-name-input');
            if (saveModal) saveModal.classList.remove('active');
            if (clientInput) clientInput.value = '';
        });
    }
    
    if (confirmSaveBtn) confirmSaveBtn.addEventListener('click', confirmSave);
    
    if (newDesignBtn) {
        newDesignBtn.addEventListener('click', () => {
            const successModal = document.getElementById('success-modal');
            if (successModal) successModal.classList.remove('active');
            resetCanvas();
        });
    }
    
    // Click fuera del canvas para deseleccionar
    if (EditorState.canvas) {
        EditorState.canvas.addEventListener('click', (e) => {
            if (e.target === EditorState.canvas) {
                if (EditorState.selectedElement) {
                    EditorState.selectedElement.classList.remove('selected');
                    EditorState.selectedElement = null;
                    const deleteBtn = document.getElementById('delete-btn');
                    if (deleteBtn) deleteBtn.disabled = true;
                }
            }
        });
    }
    
    saveState();
    
    console.log('✅ Editor optimizado inicializado - 60 FPS ready 🚀');
});

console.log('✅ Segunda mitad optimizada cargada');