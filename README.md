# Minimalistic Pomodoro Timer

A simple, clean Pomodoro timer to help you stay focused and productive.

## Features

- 25-minute work sessions
- 5-minute short breaks
- 15-minute long breaks (after 4 sessions)
- Audio notifications
- Session counter
- Start/pause/reset functionality
- **📝 Daily Journal** - Reflect on your productivity and track insights
- **📊 Statistics tracking** - Monitor your progress and streaks
- **⚙️ Customizable settings** - Adjust timer durations and preferences
- **📱 Mobile-optimized design** - Beautiful phone-like interface
- **💾 Local data persistence** - All your data stays private on your device

## Tech Stack

- **HTML5** - Structure
- **CSS3** - Styling and animations
- **Vanilla JavaScript** - Timer logic and interactions
- **Web Audio API** - Sound notifications
- **LocalStorage** - Data persistence for journal entries and stats

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies or frameworks required

## How to Run

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start your first Pomodoro session!

## Usage

### Timer
1. Click **Start** to begin a 25-minute work session
2. Work until the timer ends and you hear the notification
3. Take a 5-minute break
4. Repeat the cycle
5. After 4 work sessions, take a longer 15-minute break

### Journal Feature
- Click the **📝 Journal** tab to open your daily reflection space
- Use **prompt buttons** for inspiration (Accomplishments, Learnings, Feelings, Tomorrow's Focus)
- Navigate between dates using **◀ ▶** arrows
- **Auto-save** functionality saves your entries as you type
- **Export** your entire journal as a Markdown file
- Track **word count** and **completed sessions** for each day

### Statistics
- View your daily and total session counts
- Track total focus time and current streak
- Monitor your productivity patterns

### Settings
- Customize focus duration (25-60 minutes)
- Adjust short break length (5-15 minutes)
- Set long break duration (15-30 minutes)
- Toggle sound notifications
- Enable auto-start breaks

## File Structure

```
pomodoro-timer/
├── index.html          # Main application
├── style.css           # Styling and animations
├── script.js           # Timer logic and journal functionality
├── sounds/
│   └── README.txt      # Audio files documentation
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Features Overview

### 🍅 **Pomodoro Timer**
- Clean, mobile-first interface with circular progress indicator
- Session dots showing progress through 4-session cycles
- Visual and audio notifications when sessions complete

### 📝 **Daily Journal**
- Date-based entries with navigation
- Quick prompt buttons for reflection
- Real-time word count and session tracking
- Auto-save functionality (saves after 1 second of inactivity)
- Export all entries as Markdown file

### 📊 **Statistics**
- Sessions completed today and total
- Total focus time accumulated
- Current productivity streak
- All data persists locally in your browser

### ⚙️ **Customization**
- Flexible timer durations
- Sound notification toggle
- Auto-start break sessions
- All settings saved automatically

## Privacy & Data

All your data (journal entries, statistics, and settings) is stored locally in your browser using LocalStorage. Nothing is sent to external servers, ensuring your personal reflections and productivity data remain completely private.

## License

MIT License - feel free to use and modify as needed. 