// Fallrisk-Identifieraren Game Logic
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
        this.hotspots = {
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
        
        // Get the container's bounding rect (same as in markHotspot)
        const img = this.workplaceImageElement;
        const container = img.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Calculate the actual displayed image size (accounting for object-fit: contain)
        const imgAspectRatio = img.naturalWidth / img.naturalHeight;
        const containerAspectRatio = containerRect.width / containerRect.height;
        
        let displayedWidth, displayedHeight, offsetX, offsetY;
        
        if (imgAspectRatio > containerAspectRatio) {
            // Image is wider than container - limited by width
            displayedWidth = containerRect.width;
            displayedHeight = containerRect.width / imgAspectRatio;
            offsetX = 0;
            offsetY = (containerRect.height - displayedHeight) / 2;
        } else {
            // Image is taller than container - limited by height
            displayedWidth = containerRect.height * imgAspectRatio;
            displayedHeight = containerRect.height;
            offsetX = (containerRect.width - displayedWidth) / 2;
            offsetY = 0;
        }
        
        // Calculate click position relative to the actual displayed image
        const clickX = event.clientX - containerRect.left - offsetX;
        const clickY = event.clientY - containerRect.top - offsetY;
        
        // Convert to percentage coordinates relative to the actual image
        const x = (clickX / displayedWidth) * 100;
        const y = (clickY / displayedHeight) * 100;
        
        // Ensure click is within the image bounds
        if (x < 0 || x > 100 || y < 0 || y > 100) {
            return; // Click is outside the actual image area
        }
        
        const hotspots = this.hotspots[this.currentImage];
        let hitHotspot = false;
        
        for (let i = 0; i < hotspots.length; i++) {
            const hotspot = hotspots[i];
            const hotspotId = `${this.currentImage}-${i}`;
            
            if (this.foundHotspots.has(hotspotId)) continue;
            
            if (x >= hotspot.x && x <= hotspot.x + hotspot.width &&
                y >= hotspot.y && y <= hotspot.y + hotspot.height) {
                
                this.foundHotspots.add(hotspotId);
                this.foundRisks++;
                this.score += 100;
                hitHotspot = true;
                
                this.markHotspot(hotspot, containerRect);
                this.updateFeedback(`Bra! Du hittade: ${hotspot.name} (+100 poäng)`);
                
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
    
    markHotspot(hotspot, imageRect) {
        // Get the actual image dimensions and position within its container
        const img = this.workplaceImageElement;
        const container = img.parentElement;
        
        // Calculate the actual displayed image size (accounting for object-fit: contain)
        const imgAspectRatio = img.naturalWidth / img.naturalHeight;
        const containerAspectRatio = imageRect.width / imageRect.height;
        
        let displayedWidth, displayedHeight, offsetX, offsetY;
        
        if (imgAspectRatio > containerAspectRatio) {
            // Image is wider than container - limited by width
            displayedWidth = imageRect.width;
            displayedHeight = imageRect.width / imgAspectRatio;
            offsetX = 0;
            offsetY = (imageRect.height - displayedHeight) / 2;
        } else {
            // Image is taller than container - limited by height
            displayedWidth = imageRect.height * imgAspectRatio;
            displayedHeight = imageRect.height;
            offsetX = (imageRect.width - displayedWidth) / 2;
            offsetY = 0;
        }
        
        // Calculate the exact position and size of the hotspot rectangle (matching facit.html)
        const hotspotX = offsetX + (hotspot.x / 100) * displayedWidth;
        const hotspotY = offsetY + (hotspot.y / 100) * displayedHeight;
        const hotspotWidth = (hotspot.width / 100) * displayedWidth;
        const hotspotHeight = (hotspot.height / 100) * displayedHeight;
        
        // Create rectangular marker that matches the exact hotspot dimensions
        const marker = document.createElement('div');
        marker.className = 'hotspot-marker';
        marker.style.position = 'absolute';
        marker.style.left = hotspotX + 'px';
        marker.style.top = hotspotY + 'px';
        marker.style.width = hotspotWidth + 'px';
        marker.style.height = hotspotHeight + 'px';
        marker.style.backgroundColor = 'rgba(0, 255, 0, 0.6)';
        marker.style.border = '3px solid #00ff00';
        marker.style.borderRadius = '8px';
        marker.style.pointerEvents = 'none';
        marker.style.zIndex = '1000';
        marker.style.animation = 'pulse 0.5s ease-out';
        
        // Add a label to show which hotspot this is
        const label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.top = '50%';
        label.style.left = '50%';
        label.style.transform = 'translate(-50%, -50%)';
        label.style.background = 'rgba(0, 0, 0, 0.8)';
        label.style.color = 'white';
        label.style.padding = '2px 6px';
        label.style.borderRadius = '4px';
        label.style.fontSize = '12px';
        label.style.fontWeight = 'bold';
        label.style.pointerEvents = 'none';
        label.textContent = '✓';
        
        marker.appendChild(label);
        
        container.style.position = 'relative';
        container.appendChild(marker);
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
        document.getElementById('gameOverScore').textContent = `Din slutpoäng: ${this.score}`;
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
        this.feedbackElement.innerHTML = `<p>${message}</p>`;
    }
}

// Make FallRiskGame available globally
window.FallRiskGame = FallRiskGame;

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.fallRiskGame = new FallRiskGame();
});