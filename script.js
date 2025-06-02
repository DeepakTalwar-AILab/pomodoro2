// Pomodoro Timer Logic
class PomodoroTimer {
    constructor() {
        // Timer states
        this.isRunning = false;
        this.isPaused = false;
        this.currentSession = 1;
        this.totalSessions = 4;
        this.isWorkSession = true;
        
        // Load settings from localStorage or use defaults
        this.settings = this.loadSettings();
        this.workDuration = this.settings.focusDuration;
        this.shortBreakDuration = this.settings.shortBreakDuration;
        this.longBreakDuration = this.settings.longBreakDuration;
        
        // Current timer state
        this.timeRemaining = this.workDuration;
        this.totalTime = this.workDuration;
        this.timerInterval = null;
        
        // Stats tracking
        this.stats = this.loadStats();
        
        // DOM elements
        this.timeDisplay = document.getElementById('timeDisplay');
        this.sessionType = document.getElementById('sessionType');
        this.controlBtn = document.getElementById('controlBtn');
        this.btnIcon = document.getElementById('btnIcon');
        this.resetBtn = document.getElementById('resetBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.progressCircle = document.getElementById('progressCircle');
        this.phoneContainer = document.querySelector('.phone-container');
        this.dots = document.querySelectorAll('.dot');
        
        // Modal elements
        this.statsModal = document.getElementById('statsModal');
        this.settingsModal = document.getElementById('settingsModal');
        this.journalModal = document.getElementById('journalModal');
        
        // Navigation elements
        this.timerTab = document.getElementById('timerTab');
        this.statsTab = document.getElementById('statsTab');
        this.journalTab = document.getElementById('journalTab');
        this.settingsTab = document.getElementById('settingsTab');
        this.headerSettings = document.getElementById('headerSettings');
        
        // Journal elements
        this.journalText = document.getElementById('journalText');
        this.currentDate = document.getElementById('currentDate');
        this.prevDateBtn = document.getElementById('prevDate');
        this.nextDateBtn = document.getElementById('nextDate');
        this.wordCountEl = document.getElementById('wordCount');
        this.sessionsCountEl = document.getElementById('sessionsCount');
        this.autoSaveIndicator = document.getElementById('autoSaveIndicator');
        
        // Journal data
        this.currentJournalDate = new Date();
        this.journalEntries = this.loadJournalEntries();
        this.autoSaveTimer = null;
        
        // Circle properties for SVG animation
        this.radius = 120;
        this.circumference = 2 * Math.PI * this.radius;
        
        // Initialize
        this.setupCircle();
        this.updateDisplay();
        this.updateCircularProgress();
        this.updateSessionDots();
        this.updateStatsDisplay();
        this.loadSettingsToForm();
        this.initializeJournal();
        this.attachEventListeners();
    }
    
    loadSettings() {
        const defaultSettings = {
            focusDuration: 25 * 60,
            shortBreakDuration: 5 * 60,
            longBreakDuration: 15 * 60,
            soundEnabled: true,
            autoStartBreaks: false
        };
        
        const saved = localStorage.getItem('pomodoroSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }
    
    saveSettings() {
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
    }
    
    loadStats() {
        const defaultStats = {
            sessionsToday: 0,
            totalSessions: 0,
            focusTime: 0,
            streak: 0,
            lastSessionDate: null
        };
        
        const saved = localStorage.getItem('pomodoroStats');
        const stats = saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
        
        // Reset daily stats if it's a new day
        const today = new Date().toDateString();
        if (stats.lastSessionDate !== today) {
            stats.sessionsToday = 0;
            stats.lastSessionDate = today;
        }
        
        return stats;
    }
    
    saveStats() {
        localStorage.setItem('pomodoroStats', JSON.stringify(this.stats));
    }
    
    setupCircle() {
        this.progressCircle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.progressCircle.style.strokeDashoffset = this.circumference;
    }
    
    attachEventListeners() {
        // Timer controls
        this.controlBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.skipBtn.addEventListener('click', () => this.skip());
        
        // Navigation
        this.timerTab.addEventListener('click', () => this.showTimer());
        this.statsTab.addEventListener('click', () => this.showStats());
        this.journalTab.addEventListener('click', () => this.showJournal());
        this.settingsTab.addEventListener('click', () => this.showSettings());
        this.headerSettings.addEventListener('click', () => this.showSettings());
        
        // Modal controls
        document.getElementById('closeStats').addEventListener('click', () => this.hideStats());
        document.getElementById('closeSettings').addEventListener('click', () => this.hideSettings());
        document.getElementById('closeJournal').addEventListener('click', () => this.hideJournal());
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettingsFromForm());
        
        // Journal controls
        this.prevDateBtn.addEventListener('click', () => this.navigateDate(-1));
        this.nextDateBtn.addEventListener('click', () => this.navigateDate(1));
        this.journalText.addEventListener('input', () => this.scheduleAutoSave());
        document.getElementById('clearEntry').addEventListener('click', () => this.clearJournalEntry());
        document.getElementById('exportJournal').addEventListener('click', () => this.exportJournal());
        
        // Journal prompts
        document.querySelectorAll('.prompt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.insertPrompt(e.target.dataset.prompt));
        });
        
        // Close modals when clicking outside
        this.statsModal.addEventListener('click', (e) => {
            if (e.target === this.statsModal) this.hideStats();
        });
        
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.hideSettings();
        });
        
        this.journalModal.addEventListener('click', (e) => {
            if (e.target === this.journalModal) this.hideJournal();
        });
    }
    
    showTimer() {
        this.setActiveTab('timer');
        this.hideStats();
        this.hideSettings();
    }
    
    showStats() {
        this.setActiveTab('stats');
        this.hideSettings();
        this.updateStatsDisplay();
        this.statsModal.classList.add('active');
    }
    
    showSettings() {
        this.setActiveTab('settings');
        this.hideStats();
        this.loadSettingsToForm();
        this.settingsModal.classList.add('active');
    }
    
    hideStats() {
        this.statsModal.classList.remove('active');
        this.setActiveTab('timer');
    }
    
    hideSettings() {
        this.settingsModal.classList.remove('active');
        this.setActiveTab('timer');
    }
    
    hideJournal() {
        this.journalModal.classList.remove('active');
        this.setActiveTab('timer');
    }
    
    setActiveTab(tab) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        if (tab === 'timer') this.timerTab.classList.add('active');
        else if (tab === 'stats') this.statsTab.classList.add('active');
        else if (tab === 'journal') this.journalTab.classList.add('active');
        else if (tab === 'settings') this.settingsTab.classList.add('active');
    }
    
    loadSettingsToForm() {
        document.getElementById('focusDuration').value = this.settings.focusDuration;
        document.getElementById('shortBreakDuration').value = this.settings.shortBreakDuration;
        document.getElementById('longBreakDuration').value = this.settings.longBreakDuration;
        document.getElementById('soundEnabled').checked = this.settings.soundEnabled;
        document.getElementById('autoStartBreaks').checked = this.settings.autoStartBreaks;
    }
    
    saveSettingsFromForm() {
        this.settings.focusDuration = parseInt(document.getElementById('focusDuration').value);
        this.settings.shortBreakDuration = parseInt(document.getElementById('shortBreakDuration').value);
        this.settings.longBreakDuration = parseInt(document.getElementById('longBreakDuration').value);
        this.settings.soundEnabled = document.getElementById('soundEnabled').checked;
        this.settings.autoStartBreaks = document.getElementById('autoStartBreaks').checked;
        
        // Update timer durations
        this.workDuration = this.settings.focusDuration;
        this.shortBreakDuration = this.settings.shortBreakDuration;
        this.longBreakDuration = this.settings.longBreakDuration;
        
        // Reset current timer if not running
        if (!this.isRunning && this.isWorkSession) {
            this.timeRemaining = this.workDuration;
            this.totalTime = this.workDuration;
            this.updateDisplay();
            this.updateCircularProgress();
        }
        
        this.saveSettings();
        this.hideSettings();
        
        // Show confirmation
        this.showNotification('Settings saved! 🎉');
    }
    
    updateStatsDisplay() {
        document.getElementById('sessionsToday').textContent = this.stats.sessionsToday;
        document.getElementById('totalSessions').textContent = this.stats.totalSessions;
        
        const hours = Math.floor(this.stats.focusTime / 3600);
        const minutes = Math.floor((this.stats.focusTime % 3600) / 60);
        document.getElementById('focusTime').textContent = `${hours}h ${minutes}m`;
        
        document.getElementById('streak').textContent = this.stats.streak;
    }
    
    showNotification(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 24px;
            font-size: 14px;
            z-index: 2000;
            animation: fadeInOut 3s ease;
        `;
        toast.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
            document.head.removeChild(style);
        }, 3000);
    }
    
    toggleTimer() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }
    
    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.btnIcon.textContent = '⏸';
        this.btnIcon.classList.add('pause');
        this.phoneContainer.classList.add('timer-running');
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            this.updateCircularProgress();
            
            if (this.timeRemaining <= 0) {
                this.completeSession();
            }
        }, 1000);
    }
    
    pause() {
        this.isRunning = false;
        this.isPaused = true;
        clearInterval(this.timerInterval);
        
        this.btnIcon.textContent = '▶';
        this.btnIcon.classList.remove('pause');
        this.phoneContainer.classList.remove('timer-running');
    }
    
    reset() {
        clearInterval(this.timerInterval);
        
        this.isRunning = false;
        this.isPaused = false;
        this.currentSession = 1;
        this.isWorkSession = true;
        
        this.timeRemaining = this.workDuration;
        this.totalTime = this.workDuration;
        
        this.btnIcon.textContent = '▶';
        this.btnIcon.classList.remove('pause');
        this.phoneContainer.classList.remove('timer-running');
        this.updateSessionType();
        
        this.updateDisplay();
        this.updateCircularProgress();
        this.updateSessionDots();
    }
    
    skip() {
        this.completeSession();
    }
    
    completeSession() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.isPaused = false;
        this.phoneContainer.classList.remove('timer-running');
        this.btnIcon.textContent = '▶';
        this.btnIcon.classList.remove('pause');
        
        // Update stats for completed work sessions
        if (this.isWorkSession) {
            this.stats.sessionsToday++;
            this.stats.totalSessions++;
            this.stats.focusTime += this.workDuration;
            this.stats.lastSessionDate = new Date().toDateString();
            
            // Update streak (simple logic: if you completed a session today)
            this.stats.streak = this.stats.sessionsToday;
            
            this.saveStats();
            
            // Update journal session count
            this.incrementJournalSessions();
        }
        
        // Play notification sound
        if (this.settings.soundEnabled) {
            this.playNotification();
        }
        
        // Add animation
        this.phoneContainer.classList.add('session-change');
        setTimeout(() => {
            this.phoneContainer.classList.remove('session-change');
        }, 600);
        
        if (this.isWorkSession) {
            if (this.currentSession === this.totalSessions) {
                this.startLongBreak();
            } else {
                this.startShortBreak();
            }
        } else {
            if (this.currentSession === this.totalSessions) {
                this.reset();
                this.showCompletionMessage();
            } else {
                this.currentSession++;
                this.startWorkSession();
            }
        }
        
        // Auto-start breaks if enabled
        if (!this.isWorkSession && this.settings.autoStartBreaks) {
            setTimeout(() => this.start(), 2000);
        }
    }
    
    startWorkSession() {
        this.isWorkSession = true;
        this.timeRemaining = this.workDuration;
        this.totalTime = this.workDuration;
        this.updateSessionType();
        this.updateDisplay();
        this.updateCircularProgress();
        this.updateSessionDots();
    }
    
    startShortBreak() {
        this.isWorkSession = false;
        this.timeRemaining = this.shortBreakDuration;
        this.totalTime = this.shortBreakDuration;
        this.updateSessionType();
        this.updateDisplay();
        this.updateCircularProgress();
    }
    
    startLongBreak() {
        this.isWorkSession = false;
        this.timeRemaining = this.longBreakDuration;
        this.totalTime = this.longBreakDuration;
        this.updateSessionType();
        this.updateDisplay();
        this.updateCircularProgress();
    }
    
    updateSessionType() {
        this.phoneContainer.classList.remove('focus-time', 'short-break', 'long-break');
        
        if (this.isWorkSession) {
            this.phoneContainer.classList.add('focus-time');
        } else {
            if (this.currentSession === this.totalSessions) {
                this.phoneContainer.classList.add('long-break');
            } else {
                this.phoneContainer.classList.add('short-break');
            }
        }
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.isWorkSession) {
            this.sessionType.textContent = 'Focus Time';
        } else {
            if (this.currentSession === this.totalSessions) {
                this.sessionType.textContent = 'Long Break';
            } else {
                this.sessionType.textContent = 'Short Break';
            }
        }
        
        document.title = `${this.timeDisplay.textContent} - ${this.sessionType.textContent}`;
    }
    
    updateCircularProgress() {
        const progressPercentage = (this.totalTime - this.timeRemaining) / this.totalTime;
        const offset = this.circumference - (progressPercentage * this.circumference);
        this.progressCircle.style.strokeDashoffset = offset;
    }
    
    updateSessionDots() {
        this.dots.forEach((dot, index) => {
            if (index < this.currentSession) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    playNotification() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createBeepSound(audioContext);
        } catch (error) {
            this.showBrowserNotification();
        }
    }
    
    createBeepSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    showBrowserNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('Pomodoro Timer', {
                body: this.isWorkSession ? 'Break time!' : 'Time to work!',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
            });
            
            setTimeout(() => notification.close(), 3000);
        }
    }
    
    showCompletionMessage() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🎉 Pomodoro Complete!', {
                body: 'You completed all 4 sessions! Take a well-deserved break.',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎉</text></svg>'
            });
        } else {
            this.showNotification('🎉 Congratulations! You completed all 4 Pomodoro sessions!');
        }
    }
    
    // Journal Methods
    loadJournalEntries() {
        const saved = localStorage.getItem('pomodoroJournal');
        return saved ? JSON.parse(saved) : {};
    }
    
    saveJournalEntries() {
        localStorage.setItem('pomodoroJournal', JSON.stringify(this.journalEntries));
    }
    
    initializeJournal() {
        this.updateCurrentDateDisplay();
        this.loadJournalEntry();
        this.updateJournalStats();
    }
    
    showJournal() {
        this.setActiveTab('journal');
        this.hideStats();
        this.hideSettings();
        this.loadJournalEntry();
        this.updateJournalStats();
        this.journalModal.classList.add('active');
        this.journalText.focus();
    }
    
    getDateKey(date = this.currentJournalDate) {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    loadJournalEntry() {
        const dateKey = this.getDateKey();
        const entry = this.journalEntries[dateKey] || { text: '', sessions: 0 };
        this.journalText.value = entry.text;
        this.updateWordCount();
    }
    
    saveJournalEntry() {
        const dateKey = this.getDateKey();
        const text = this.journalText.value;
        
        if (!this.journalEntries[dateKey]) {
            this.journalEntries[dateKey] = { text: '', sessions: 0 };
        }
        
        this.journalEntries[dateKey].text = text;
        this.saveJournalEntries();
        this.showAutoSaveIndicator();
    }
    
    scheduleAutoSave() {
        clearTimeout(this.autoSaveTimer);
        this.updateWordCount();
        
        this.autoSaveTimer = setTimeout(() => {
            this.saveJournalEntry();
        }, 1000); // Auto-save after 1 second of inactivity
    }
    
    showAutoSaveIndicator() {
        this.autoSaveIndicator.classList.add('show');
        setTimeout(() => {
            this.autoSaveIndicator.classList.remove('show');
        }, 2000);
    }
    
    updateWordCount() {
        const text = this.journalText.value.trim();
        const wordCount = text ? text.split(/\s+/).length : 0;
        this.wordCountEl.textContent = wordCount;
    }
    
    updateJournalStats() {
        const dateKey = this.getDateKey();
        const entry = this.journalEntries[dateKey] || { text: '', sessions: 0 };
        this.sessionsCountEl.textContent = entry.sessions;
    }
    
    updateCurrentDateDisplay() {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        this.currentDate.textContent = this.currentJournalDate.toLocaleDateString(undefined, options);
    }
    
    navigateDate(direction) {
        const newDate = new Date(this.currentJournalDate);
        newDate.setDate(newDate.getDate() + direction);
        
        // Don't allow future dates
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (newDate > today) return;
        
        this.currentJournalDate = newDate;
        this.updateCurrentDateDisplay();
        this.loadJournalEntry();
        this.updateJournalStats();
    }
    
    insertPrompt(prompt) {
        const currentText = this.journalText.value;
        const newText = currentText ? `${currentText}\n\n${prompt}\n` : `${prompt}\n`;
        this.journalText.value = newText;
        this.journalText.focus();
        
        // Move cursor to end
        this.journalText.setSelectionRange(newText.length, newText.length);
        this.updateWordCount();
        this.scheduleAutoSave();
    }
    
    clearJournalEntry() {
        if (confirm('Are you sure you want to clear this journal entry?')) {
            this.journalText.value = '';
            this.updateWordCount();
            this.scheduleAutoSave();
            this.journalText.focus();
        }
    }
    
    exportJournal() {
        const entries = Object.entries(this.journalEntries)
            .filter(([_, entry]) => entry.text.trim())
            .sort(([a], [b]) => b.localeCompare(a)) // Sort by date descending
            .map(([date, entry]) => {
                const formattedDate = new Date(date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                return `# ${formattedDate}\nSessions: ${entry.sessions}\n\n${entry.text}\n\n---\n\n`;
            })
            .join('');
        
        if (!entries) {
            alert('No journal entries to export!');
            return;
        }
        
        const blob = new Blob([`# My Pomodoro Journal\n\n${entries}`], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pomodoro-journal-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Journal exported! 📝');
    }
    
    // Update session count in journal when completing a session
    incrementJournalSessions() {
        const dateKey = this.getDateKey();
        if (!this.journalEntries[dateKey]) {
            this.journalEntries[dateKey] = { text: '', sessions: 0 };
        }
        this.journalEntries[dateKey].sessions++;
        this.saveJournalEntries();
        this.updateJournalStats();
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}); 