// Advanced Visual Hotspot Editor for Fallrisk Game
class AdvancedHotspotEditor {
    constructor() {
        this.container = null;
        this.currentHotspots = {};
        this.workplaceImages = [
            'media/Workplace1.png',
            'media/Workplace2.png', 
            'media/Workplace3.png'
        ];
        
        // Default hotspots (fallback)
        this.defaultHotspots = {
            'media/Workplace1.png': [
                { x: 13.8, y: 75.5, width: 19.9, height: 11.7, name: 'Förlängningskabel på golv' },
                { x: 64.1, y: 87.1, width: 15.3, height: 7.9, name: 'Vattenpöl under handfat' },
                { x: 30.9, y: 28.9, width: 11.6, height: 29.6, name: 'Osäkrad stege' },
                { x: 55.1, y: 62.5, width: 21, height: 10, name: 'Lös matta med uppvikt hörn' },
                { x: 66.7, y: 76.3, width: 17.1, height: 9.6, name: 'Verktyg på golvet' }
            ],
            'media/Workplace2.png': [
                { x: 45.3, y: 55.8, width: 11.2, height: 44.6, name: 'Elkabel över golv' },
                { x: 24.3, y: 85.1, width: 16.4, height: 9.7, name: 'Spillt verktyg' },
                { x: 60.9, y: 73.9, width: 25.8, height: 11.9, name: 'Ojämnt golv' },
                { x: 57.5, y: 58.8, width: 12.4, height: 14.4, name: 'Fuktig fläck från fönster' },
                { x: 74.4, y: 59.6, width: 7.8, height: 10.1, name: 'Hink i gångväg' }
            ],
            'media/Workplace3.png': [
                { x: 44.3, y: 83.3, width: 10.9, height: 5.4, name: 'Upphöjd metalltröskel' },
                { x: 8.8, y: 65.2, width: 9.7, height: 7.6, name: 'Oljefläck på golv' },
                { x: 60.5, y: 56.3, width: 11, height: 8.6, name: 'Tappat säkerhetskägla' },
                { x: 74.5, y: 74.6, width: 23.7, height: 9.6, name: 'Kondensvatten/pöl' },
                { x: 69, y: 67, width: 19.8, height: 7.7, name: 'Lös gummitröskel' }
            ]
        };
        
        // Interaction state
        this.isDragging = false;
        this.isResizing = false;
        this.activeElement = null;
        this.activeHandle = null;
        this.startPos = { x: 0, y: 0 };
        this.startSize = { width: 0, height: 0 };
        this.dragOffset = { x: 0, y: 0 };
        
        this.initialize();
    }
    
    initialize() {
        console.log('🎯 Initializing Advanced Hotspot Editor...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }
    
    start() {
        console.log('🚀 Starting editor...');
        this.container = document.getElementById('facit-container');
        
        if (!this.container) {
            console.error('❌ Facit container not found!');
            return;
        }
        
        // Load hotspots and verify success
        if (!this.loadHotspots()) {
            console.error('❌ Failed to load hotspots - cannot start editor');
            return;
        }
        
        this.createMainInterface();
        this.setupGlobalEventHandlers();
        
        console.log('✅ Editor ready!');
    }
    
    loadHotspots() {
        console.log('🔄 Loading hotspots...');
        try {
            if (window.FallRiskGame) {
                console.log('📥 Loading hotspots from game.js...');
                const tempGame = new window.FallRiskGame();
                this.currentHotspots = JSON.parse(JSON.stringify(tempGame.hotspots));
                console.log('✅ Hotspots loaded from game.js:', this.currentHotspots);
            } else {
                throw new Error('FallRiskGame not available');
            }
        } catch (error) {
            console.log('⚠️ Using default hotspots:', error.message);
            this.currentHotspots = JSON.parse(JSON.stringify(this.defaultHotspots));
            console.log('📋 Default hotspots loaded:', this.currentHotspots);
        }
        
        // Verify we have data
        if (!this.currentHotspots || Object.keys(this.currentHotspots).length === 0) {
            console.error('❌ No hotspots data available!');
            return false;
        }
        
        console.log('✅ Hotspots ready for', Object.keys(this.currentHotspots).length, 'workplaces');
        return true;
    }
    
    createMainInterface() {
        console.log('🏗️ Creating main interface...');
        this.container.innerHTML = '';
        
        // Create header with save button
        console.log('📄 Creating header...');
        this.createHeader();
        
        // Create workplaces
        console.log('🏢 Creating workplaces for', this.workplaceImages.length, 'images...');
        this.workplaceImages.forEach((imagePath, index) => {
            console.log(`🖼️ Creating workplace ${index + 1}: ${imagePath}`);
            this.createWorkplaceEditor(imagePath, index);
        });
        
        console.log('✅ Main interface created');
    }
    
    createHeader() {
        const header = document.createElement('div');
        header.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 15px;
            margin-bottom: 3rem;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        `;
        
        header.innerHTML = `
            <h1 style="margin: 0 0 1rem 0; font-size: 2.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                🎯 Avancerad Hotspot-Redigerare
            </h1>
            <p style="margin: 0 0 2rem 0; font-size: 1.2rem; opacity: 0.9;">
                Dra hotspots för att flytta dem • Dra hörn-handtagen för att ändra storlek • Koordinater uppdateras automatiskt
            </p>
            <button id="saveCodeBtn" style="
                background: linear-gradient(45deg, #27ae60, #2ecc71);
                color: white;
                border: none;
                padding: 1rem 2rem;
                font-size: 1.2rem;
                font-weight: bold;
                border-radius: 50px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(39, 174, 96, 0.4);
                text-transform: uppercase;
                letter-spacing: 1px;
            ">
                💾 Generera & Spara Kod
            </button>
        `;
        
        this.container.appendChild(header);
        
        // Add save button functionality
        document.getElementById('saveCodeBtn').addEventListener('click', () => this.generateAndDownloadCode());
        
        // Add hover effect
        const saveBtn = document.getElementById('saveCodeBtn');
        saveBtn.addEventListener('mouseenter', () => {
            saveBtn.style.background = 'linear-gradient(45deg, #2ecc71, #27ae60)';
            saveBtn.style.transform = 'translateY(-3px)';
            saveBtn.style.boxShadow = '0 8px 25px rgba(39, 174, 96, 0.6)';
        });
        
        saveBtn.addEventListener('mouseleave', () => {
            saveBtn.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
            saveBtn.style.transform = 'translateY(0)';
            saveBtn.style.boxShadow = '0 5px 15px rgba(39, 174, 96, 0.4)';
        });
    }
    
    createWorkplaceEditor(imagePath, workplaceIndex) {
        console.log(`🏗️ Creating workplace editor ${workplaceIndex + 1} for ${imagePath}`);
        
        const workplaceSection = document.createElement('div');
        workplaceSection.className = 'workplace-editor-section';
        workplaceSection.style.cssText = `
            background: rgba(255, 255, 255, 0.98);
            border-radius: 20px;
            padding: 2.5rem;
            margin-bottom: 4rem;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            border: 2px solid #e9ecef;
        `;
        
        // Title
        const title = document.createElement('h2');
        title.textContent = `🏢 Workplace ${workplaceIndex + 1}`;
        title.style.cssText = `
            color: #2c3e50;
            margin-bottom: 2rem;
            text-align: center;
            font-size: 2rem;
            font-weight: 700;
            border-bottom: 3px solid #3498db;
            padding-bottom: 1rem;
        `;
        workplaceSection.appendChild(title);
        
        // Content container - vertical layout
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 2rem;
            align-items: center;
        `;
        
        // Image section
        const imageSection = this.createImageEditor(imagePath, workplaceIndex);
        contentContainer.appendChild(imageSection);
        
        // Coordinates section
        const coordSection = this.createCoordinatesPanel(imagePath, workplaceIndex);
        contentContainer.appendChild(coordSection);
        
        workplaceSection.appendChild(contentContainer);
        this.container.appendChild(workplaceSection);
        
        console.log(`✅ Workplace editor ${workplaceIndex + 1} created and added to container`);
    }
    
    createImageEditor(imagePath, workplaceIndex) {
        console.log(`🖼️ Creating image editor for ${imagePath}`);
        
        const imageSection = document.createElement('div');
        imageSection.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
        `;
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-editor-container';
        imageContainer.id = `image-editor-${workplaceIndex}`;
        imageContainer.style.cssText = `
            position: relative;
            display: inline-block;
            border: 4px solid #34495e;
            border-radius: 15px;
            overflow: visible;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
            background: #f8f9fa;
            max-width: 100%;
        `;
        
        const img = document.createElement('img');
        console.log(`📷 Creating img element for ${imagePath}`);
        img.src = imagePath;
        img.alt = `Workplace ${workplaceIndex + 1}`;
        img.style.cssText = `
            display: block;
            max-width: 1000px;
            width: 100%;
            height: auto;
            border-radius: 11px;
        `;
        
        console.log(`⏳ Setting up image load handlers for ${imagePath}`);
        
        img.onload = () => {
            console.log(`✅ Image ${workplaceIndex + 1} loaded successfully - creating hotspots...`);
            this.createEditableHotspots(imageContainer, imagePath, workplaceIndex);
            this.updateCoordinatesDisplay(workplaceIndex, imagePath);
        };
        
        img.onerror = () => {
            console.error(`❌ Failed to load: ${imagePath}`);
            img.alt = `⚠️ Bild kunde inte laddas: ${imagePath}`;
            img.style.cssText += `
                min-height: 400px;
                background: #ecf0f1;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #7f8c8d;
                font-size: 1.5rem;
                text-align: center;
            `;
        };
        
        imageContainer.appendChild(img);
        imageSection.appendChild(imageContainer);
        
        // Ensure proper positioning for hotspots
        imageContainer.style.position = 'relative';
        imageContainer.style.overflow = 'visible';
        
        console.log(`✅ Image editor created for workplace ${workplaceIndex + 1}`);
        return imageSection;
    }
    
    createCoordinatesPanel(imagePath, workplaceIndex) {
        const panel = document.createElement('div');
        panel.className = 'coordinates-panel';
        panel.id = `coords-panel-${workplaceIndex}`;
        panel.style.cssText = `
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 2px solid #dee2e6;
            border-radius: 15px;
            padding: 2rem;
            width: 100%;
            max-width: 1000px;
            max-height: 500px;
            overflow-y: auto;
        `;
        
        const panelHeader = document.createElement('div');
        panelHeader.innerHTML = `
            <h3 style="
                color: #2c3e50;
                margin-bottom: 1.5rem;
                font-size: 1.4rem;
                text-align: center;
                border-bottom: 2px solid #3498db;
                padding-bottom: 0.8rem;
            ">📊 Live Koordinater</h3>
        `;
        panel.appendChild(panelHeader);
        
        const coordsList = document.createElement('div');
        coordsList.className = 'coordinates-list';
        coordsList.id = `coords-list-${workplaceIndex}`;
        panel.appendChild(coordsList);
        
        return panel;
    }
    
    createEditableHotspots(imageContainer, imagePath, workplaceIndex) {
        const hotspots = this.currentHotspots[imagePath];
        if (!hotspots) {
            console.warn(`⚠️ No hotspots found for ${imagePath}`);
            return;
        }
        
        console.log(`🎯 Creating ${hotspots.length} editable hotspots for workplace ${workplaceIndex + 1}`);
        
        hotspots.forEach((hotspot, hotspotIndex) => {
            this.createEditableHotspot(imageContainer, hotspot, workplaceIndex, hotspotIndex);
        });
    }
    
    createEditableHotspot(imageContainer, hotspot, workplaceIndex, hotspotIndex) {
        const hotspotContainer = document.createElement('div');
        hotspotContainer.className = 'editable-hotspot';
        hotspotContainer.id = `hotspot-${workplaceIndex}-${hotspotIndex}`;
        hotspotContainer.dataset.workplace = workplaceIndex;
        hotspotContainer.dataset.hotspot = hotspotIndex;
        
        hotspotContainer.style.cssText = `
            position: absolute;
            left: ${hotspot.x}%;
            top: ${hotspot.y}%;
            width: ${hotspot.width}%;
            height: ${hotspot.height}%;
            background-color: rgba(46, 204, 113, 0.6);
            border: 3px solid #27ae60;
            border-radius: 8px;
            cursor: move;
            transition: all 0.2s ease;
            z-index: 100;
            min-width: 40px;
            min-height: 30px;
            box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
        `;
        
        // Create main content area
        const contentArea = document.createElement('div');
        contentArea.className = 'hotspot-content';
        contentArea.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
        `;
        
        const label = document.createElement('div');
        label.className = 'hotspot-label';
        label.textContent = `${hotspotIndex + 1}`;
        label.style.cssText = `
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 0.3rem 0.6rem;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: bold;
            line-height: 1;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        `;
        
        contentArea.appendChild(label);
        hotspotContainer.appendChild(contentArea);
        
        // Create resize handles
        this.createResizeHandles(hotspotContainer);
        
        // Add interaction events
        this.addHotspotInteraction(hotspotContainer);
        
        imageContainer.appendChild(hotspotContainer);
        
        console.log(`✅ Created editable hotspot ${hotspotIndex + 1} for workplace ${workplaceIndex + 1}`);
    }
    
    createResizeHandles(hotspotContainer) {
        const handles = ['nw', 'ne', 'sw', 'se'];
        
        handles.forEach(handle => {
            const handleElement = document.createElement('div');
            handleElement.className = `resize-handle resize-${handle}`;
            handleElement.dataset.handle = handle;
            
            let position = '';
            switch (handle) {
                case 'nw': position = 'top: -6px; left: -6px; cursor: nw-resize;'; break;
                case 'ne': position = 'top: -6px; right: -6px; cursor: ne-resize;'; break;
                case 'sw': position = 'bottom: -6px; left: -6px; cursor: sw-resize;'; break;
                case 'se': position = 'bottom: -6px; right: -6px; cursor: se-resize;'; break;
            }
            
            handleElement.style.cssText = `
                position: absolute;
                width: 12px;
                height: 12px;
                background: #e74c3c;
                border: 2px solid white;
                border-radius: 50%;
                ${position}
                z-index: 200;
                opacity: 0;
                transition: opacity 0.2s ease;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            `;
            
            hotspotContainer.appendChild(handleElement);
        });
    }
    
    addHotspotInteraction(hotspotContainer) {
        // Show/hide handles on hover
        hotspotContainer.addEventListener('mouseenter', () => {
            if (!this.isDragging && !this.isResizing) {
                hotspotContainer.style.backgroundColor = 'rgba(46, 204, 113, 0.8)';
                hotspotContainer.style.transform = 'scale(1.02)';
                hotspotContainer.style.zIndex = '150';
                
                const handles = hotspotContainer.querySelectorAll('.resize-handle');
                handles.forEach(handle => handle.style.opacity = '1');
            }
        });
        
        hotspotContainer.addEventListener('mouseleave', () => {
            if (!this.isDragging && !this.isResizing) {
                hotspotContainer.style.backgroundColor = 'rgba(46, 204, 113, 0.6)';
                hotspotContainer.style.transform = 'scale(1)';
                hotspotContainer.style.zIndex = '100';
                
                const handles = hotspotContainer.querySelectorAll('.resize-handle');
                handles.forEach(handle => handle.style.opacity = '0');
            }
        });
        
        // Drag functionality
        hotspotContainer.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('resize-handle')) {
                this.startResize(hotspotContainer, e.target, e);
            } else {
                this.startDrag(hotspotContainer, e);
            }
        });
    }
    
    startDrag(element, e) {
        e.preventDefault();
        this.isDragging = true;
        this.activeElement = element;
        
        const rect = element.getBoundingClientRect();
        const imageContainer = element.closest('.image-editor-container');
        const img = imageContainer.querySelector('img');
        const imgRect = img.getBoundingClientRect();
        
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        
        element.style.backgroundColor = 'rgba(231, 76, 60, 0.8)';
        element.style.border = '3px solid #c0392b';
        element.style.zIndex = '300';
        
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        
        console.log('🎯 Started dragging hotspot');
    }
    
    startResize(element, handle, e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.isResizing = true;
        this.activeElement = element;
        this.activeHandle = handle.dataset.handle;
        
        const rect = element.getBoundingClientRect();
        this.startPos.x = e.clientX;
        this.startPos.y = e.clientY;
        this.startSize.width = rect.width;
        this.startSize.height = rect.height;
        
        element.style.backgroundColor = 'rgba(52, 152, 219, 0.8)';
        element.style.border = '3px solid #2980b9';
        element.style.zIndex = '300';
        
        document.body.style.cursor = handle.style.cursor;
        document.body.style.userSelect = 'none';
        
        console.log(`🔧 Started resizing hotspot (${this.activeHandle})`);
    }
    
    setupGlobalEventHandlers() {
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.handleDrag(e);
            } else if (this.isResizing) {
                this.handleResize(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.endDrag();
            } else if (this.isResizing) {
                this.endResize();
            }
        });
    }
    
    handleDrag(e) {
        if (!this.activeElement) return;
        
        const imageContainer = this.activeElement.closest('.image-editor-container');
        const img = imageContainer.querySelector('img');
        const imgRect = img.getBoundingClientRect();
        
        const relativeX = e.clientX - imgRect.left - this.dragOffset.x;
        const relativeY = e.clientY - imgRect.top - this.dragOffset.y;
        
        const percentX = Math.max(0, Math.min(95, (relativeX / img.clientWidth) * 100));
        const percentY = Math.max(0, Math.min(95, (relativeY / img.clientHeight) * 100));
        
        this.activeElement.style.left = percentX + '%';
        this.activeElement.style.top = percentY + '%';
        
        this.updateHotspotData(this.activeElement, { x: percentX, y: percentY });
    }
    
    handleResize(e) {
        if (!this.activeElement) return;
        
        const imageContainer = this.activeElement.closest('.image-editor-container');
        const img = imageContainer.querySelector('img');
        const imgRect = img.getBoundingClientRect();
        
        const deltaX = e.clientX - this.startPos.x;
        const deltaY = e.clientY - this.startPos.y;
        
        const deltaXPercent = (deltaX / img.clientWidth) * 100;
        const deltaYPercent = (deltaY / img.clientHeight) * 100;
        
        let newWidth = (this.startSize.width / img.clientWidth) * 100;
        let newHeight = (this.startSize.height / img.clientHeight) * 100;
        let newX = parseFloat(this.activeElement.style.left);
        let newY = parseFloat(this.activeElement.style.top);
        
        switch (this.activeHandle) {
            case 'se': // Southeast
                newWidth += deltaXPercent;
                newHeight += deltaYPercent;
                break;
            case 'sw': // Southwest
                newWidth -= deltaXPercent;
                newHeight += deltaYPercent;
                newX += deltaXPercent;
                break;
            case 'ne': // Northeast
                newWidth += deltaXPercent;
                newHeight -= deltaYPercent;
                newY += deltaYPercent;
                break;
            case 'nw': // Northwest
                newWidth -= deltaXPercent;
                newHeight -= deltaYPercent;
                newX += deltaXPercent;
                newY += deltaYPercent;
                break;
        }
        
        // Ensure minimum size
        newWidth = Math.max(3, Math.min(50, newWidth));
        newHeight = Math.max(2, Math.min(50, newHeight));
        
        // Ensure within bounds
        newX = Math.max(0, Math.min(95 - newWidth, newX));
        newY = Math.max(0, Math.min(95 - newHeight, newY));
        
        this.activeElement.style.left = newX + '%';
        this.activeElement.style.top = newY + '%';
        this.activeElement.style.width = newWidth + '%';
        this.activeElement.style.height = newHeight + '%';
        
        this.updateHotspotData(this.activeElement, {
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
        });
    }
    
    endDrag() {
        if (this.activeElement) {
            this.activeElement.style.backgroundColor = 'rgba(46, 204, 113, 0.6)';
            this.activeElement.style.border = '3px solid #27ae60';
            this.activeElement.style.zIndex = '100';
            
            const handles = this.activeElement.querySelectorAll('.resize-handle');
            handles.forEach(handle => handle.style.opacity = '0');
        }
        
        this.isDragging = false;
        this.activeElement = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        console.log('✅ Drag completed');
    }
    
    endResize() {
        if (this.activeElement) {
            this.activeElement.style.backgroundColor = 'rgba(46, 204, 113, 0.6)';
            this.activeElement.style.border = '3px solid #27ae60';
            this.activeElement.style.zIndex = '100';
            
            const handles = this.activeElement.querySelectorAll('.resize-handle');
            handles.forEach(handle => handle.style.opacity = '0');
        }
        
        this.isResizing = false;
        this.activeElement = null;
        this.activeHandle = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        console.log('✅ Resize completed');
    }
    
    updateHotspotData(element, updates) {
        const workplaceIndex = parseInt(element.dataset.workplace);
        const hotspotIndex = parseInt(element.dataset.hotspot);
        const imagePath = this.workplaceImages[workplaceIndex];
        
        if (this.currentHotspots[imagePath] && this.currentHotspots[imagePath][hotspotIndex]) {
            const hotspot = this.currentHotspots[imagePath][hotspotIndex];
            
            if (updates.x !== undefined) hotspot.x = Math.round(updates.x * 10) / 10;
            if (updates.y !== undefined) hotspot.y = Math.round(updates.y * 10) / 10;
            if (updates.width !== undefined) hotspot.width = Math.round(updates.width * 10) / 10;
            if (updates.height !== undefined) hotspot.height = Math.round(updates.height * 10) / 10;
            
            this.updateSingleCoordinate(workplaceIndex, hotspotIndex);
        }
    }
    
    updateSingleCoordinate(workplaceIndex, hotspotIndex) {
        const coordElement = document.getElementById(`coord-item-${workplaceIndex}-${hotspotIndex}`);
        if (coordElement) {
            const imagePath = this.workplaceImages[workplaceIndex];
            const hotspot = this.currentHotspots[imagePath][hotspotIndex];
            
            coordElement.querySelector('.coord-x').textContent = hotspot.x;
            coordElement.querySelector('.coord-y').textContent = hotspot.y;
            coordElement.querySelector('.coord-w').textContent = hotspot.width;
            coordElement.querySelector('.coord-h').textContent = hotspot.height;
            
            // Flash effect
            coordElement.style.backgroundColor = '#fff3cd';
            setTimeout(() => {
                coordElement.style.backgroundColor = 'white';
            }, 300);
        }
    }
    
    updateCoordinatesDisplay(workplaceIndex, imagePath) {
        const coordsList = document.getElementById(`coords-list-${workplaceIndex}`);
        if (!coordsList) return;
        
        const hotspots = this.currentHotspots[imagePath];
        if (!hotspots) return;
        
        coordsList.innerHTML = '';
        
        hotspots.forEach((hotspot, index) => {
            const coordItem = document.createElement('div');
            coordItem.className = 'coord-item';
            coordItem.id = `coord-item-${workplaceIndex}-${index}`;
            coordItem.style.cssText = `
                background: white;
                border: 2px solid #e9ecef;
                border-radius: 12px;
                padding: 1.2rem;
                margin-bottom: 1rem;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            `;
            
            coordItem.innerHTML = `
                <div style="
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 1rem;
                    font-size: 1.1rem;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 0.5rem;
                ">
                    ${index + 1}. ${hotspot.name}
                </div>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.8rem;
                    font-size: 0.95rem;
                ">
                    <div style="background: #e3f2fd; padding: 0.6rem; border-radius: 8px; text-align: center;">
                        <strong>X:</strong> <span class="coord-x">${hotspot.x}</span>%
                    </div>
                    <div style="background: #e8f5e8; padding: 0.6rem; border-radius: 8px; text-align: center;">
                        <strong>Y:</strong> <span class="coord-y">${hotspot.y}</span>%
                    </div>
                    <div style="background: #fff3cd; padding: 0.6rem; border-radius: 8px; text-align: center;">
                        <strong>W:</strong> <span class="coord-w">${hotspot.width}</span>%
                    </div>
                    <div style="background: #f8d7da; padding: 0.6rem; border-radius: 8px; text-align: center;">
                        <strong>H:</strong> <span class="coord-h">${hotspot.height}</span>%
                    </div>
                </div>
            `;
            
            coordsList.appendChild(coordItem);
        });
    }
    
    generateAndDownloadCode() {
        console.log('💾 Generating new game.js file...');
        
        const gameJsContent = `// Fallrisk-Identifieraren Game Logic
class FallRiskGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.foundRisks = 0;
        this.totalRisks = 5;
        this.gameRunning = false;
        this.gamePaused = false;
        this.timer = null;
        this.currentImage = null;
        this.foundHotspots = new Set();
        
        // Available workplace images
        this.workplaceImages = [
            'media/Workplace1.png',
            'media/Workplace2.png', 
            'media/Workplace3.png'
        ];
        
        // Hotspot definitions for each workplace (percentage coordinates)
        // 🎯 Updated coordinates from Hotspot Editor
        this.hotspots = ${JSON.stringify(this.currentHotspots, null, 12)};
        
        this.initializeGame();
    }
    
    initializeGame() {
        // Get DOM elements
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.foundRisksElement = document.getElementById('foundRisks');
        this.feedbackElement = document.getElementById('feedback');
        this.workplaceImageElement = document.getElementById('workplaceImage');
        this.loadingTextElement = document.getElementById('loadingText');
        this.gameOverModal = document.getElementById('gameOverModal');
        
        // Bind event listeners
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        // Image click handler
        this.workplaceImageElement.addEventListener('click', (e) => this.handleImageClick(e));
        
        this.updateDisplay();
    }
    
    startGame() {
        if (this.gameRunning && !this.gamePaused) return;
        
        if (!this.gameRunning) {
            // Start new game
            this.selectRandomImage();
            this.gameRunning = true;
            this.gamePaused = false;
            this.startTimer();
            this.updateFeedback('Leta efter fallrisker i bilden! Klicka på dem när du hittar dem.');
        } else if (this.gamePaused) {
            // Resume game
            this.gamePaused = false;
            this.startTimer();
            this.updateFeedback('Spelet återupptaget! Leta efter fallrisker.');
        }
        
        this.updateDisplay();
    }
    
    pauseGame() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.gamePaused = true;
        this.stopTimer();
        this.updateFeedback('Spelet är pausat. Klicka på "Starta" för att fortsätta.');
    }
    
    resetGame() {
        this.stopTimer();
        this.score = 0;
        this.timeLeft = 60;
        this.foundRisks = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.foundHotspots.clear();
        this.hideGameOver();
        this.hideImage();
        this.updateDisplay();
        this.updateFeedback('Klicka på "Starta" för att börja ett nytt spel!');
        this.clearHotspotMarkers();
    }
    
    selectRandomImage() {
        const randomIndex = Math.floor(Math.random() * this.workplaceImages.length);
        this.currentImage = this.workplaceImages[randomIndex];
        this.showImage(this.currentImage);
    }
    
    showImage(imagePath) {
        this.loadingTextElement.style.display = 'none';
        this.workplaceImageElement.src = imagePath;
        this.workplaceImageElement.style.display = 'block';
        this.workplaceImageElement.style.width = '100%';
        this.workplaceImageElement.style.height = 'auto';
        this.workplaceImageElement.style.cursor = 'crosshair';
    }
    
    hideImage() {
        this.workplaceImageElement.style.display = 'none';
        this.loadingTextElement.style.display = 'block';
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame('Tiden är slut!');
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    handleImageClick(event) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const rect = this.workplaceImageElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        
        const hotspots = this.hotspots[this.currentImage];
        let hitHotspot = false;
        
        for (let i = 0; i < hotspots.length; i++) {
            const hotspot = hotspots[i];
            const hotspotId = \`\${this.currentImage}-\${i}\`;
            
            if (this.foundHotspots.has(hotspotId)) continue;
            
            if (x >= hotspot.x && x <= hotspot.x + hotspot.width &&
                y >= hotspot.y && y <= hotspot.y + hotspot.height) {
                
                this.foundHotspots.add(hotspotId);
                this.foundRisks++;
                this.score += 100;
                hitHotspot = true;
                
                this.markHotspot(hotspot, event.clientX - rect.left, event.clientY - rect.top);
                this.updateFeedback(\`Bra! Du hittade: \${hotspot.name} (+100 poäng)\`);
                
                if (this.foundRisks >= this.totalRisks) {
                    setTimeout(() => this.endGame('Grattis! Du hittade alla fallrisker!'), 1000);
                }
                break;
            }
        }
        
        if (!hitHotspot) {
            this.score = Math.max(0, this.score - 10);
            this.updateFeedback('Ingen fallrisk här. Fortsätt leta! (-10 poäng)');
        }
        
        this.updateDisplay();
    }
    
    markHotspot(hotspot, clickX, clickY) {
        const marker = document.createElement('div');
        marker.className = 'hotspot-marker';
        marker.style.position = 'absolute';
        marker.style.left = (clickX - 15) + 'px';
        marker.style.top = (clickY - 15) + 'px';
        marker.style.width = '30px';
        marker.style.height = '30px';
        marker.style.borderRadius = '50%';
        marker.style.backgroundColor = 'rgba(0, 255, 0, 0.7)';
        marker.style.border = '3px solid #00ff00';
        marker.style.pointerEvents = 'none';
        marker.style.zIndex = '1000';
        marker.style.animation = 'pulse 0.5s ease-out';
        
        this.workplaceImageElement.parentElement.style.position = 'relative';
        this.workplaceImageElement.parentElement.appendChild(marker);
    }
    
    clearHotspotMarkers() {
        const markers = document.querySelectorAll('.hotspot-marker');
        markers.forEach(marker => marker.remove());
    }
    
    endGame(message) {
        this.stopTimer();
        this.gameRunning = false;
        this.showGameOver(message);
    }
    
    showGameOver(message) {
        document.getElementById('gameOverTitle').textContent = 'Spelet är slut!';
        document.getElementById('gameOverScore').textContent = \`Din slutpoäng: \${this.score}\`;
        document.getElementById('gameOverMessage').textContent = message;
        this.gameOverModal.style.display = 'flex';
    }
    
    hideGameOver() {
        this.gameOverModal.style.display = 'none';
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.timerElement.textContent = this.timeLeft;
        this.foundRisksElement.textContent = this.foundRisks;
    }
    
    updateFeedback(message) {
        this.feedbackElement.innerHTML = \`<p>\${message}</p>\`;
    }
}

// Make FallRiskGame available globally
window.FallRiskGame = FallRiskGame;

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.fallRiskGame = new FallRiskGame();
});`;
        
        // Create and download the file
        const blob = new Blob([gameJsContent], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'game.js';
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        console.log('✅ Game.js file generated and download started!');
        
        // Show success message
        const saveBtn = document.getElementById('saveCodeBtn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✅ Fil nedladdad!';
        saveBtn.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
        }, 3000);
    }
}

// Initialize the editor
console.log('🎯 Advanced Hotspot Editor loaded');
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM ready - creating Advanced Hotspot Editor...');
    window.advancedHotspotEditor = new AdvancedHotspotEditor();
});