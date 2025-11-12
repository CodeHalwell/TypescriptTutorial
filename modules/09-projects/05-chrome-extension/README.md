# Project 5: Chrome Extension - Productivity Tracker

Build a Chrome extension using TypeScript, React, and Chrome APIs to track browsing time and productivity.

## Overview

Create a feature-rich Chrome extension with:
- Time tracking for websites
- Productivity analytics dashboard
- Focus mode with website blocking
- Daily goals and notifications
- Data export functionality
- Chrome storage sync

**Duration:** 2-3 weeks
**Difficulty:** ⭐⭐⭐ (Intermediate)

---

## Features

1. **Time Tracking**: Track time spent on each website
2. **Categories**: Categorize websites (Productive, Neutral, Distracting)
3. **Dashboard**: Visual analytics with charts
4. **Focus Mode**: Block distracting websites
5. **Goals**: Set daily productivity goals
6. **Notifications**: Remind users to take breaks
7. **Export**: Export data as CSV/JSON

---

## Project Structure

```
chrome-extension/
├── manifest.json
├── src/
│   ├── background/
│   │   └── service-worker.ts
│   ├── content/
│   │   └── content-script.ts
│   ├── popup/
│   │   ├── Popup.tsx
│   │   ├── components/
│   │   └── styles/
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── components/
│   │   └── charts/
│   ├── options/
│   │   └── Options.tsx
│   └── utils/
│       ├── storage.ts
│       ├── time-tracker.ts
│       └── types.ts
├── public/
│   ├── icons/
│   └── popup.html
└── webpack.config.js
```

---

## Setup

### Install Dependencies

```bash
npm init -y
npm install react react-dom
npm install @types/react @types/react-dom
npm install @types/chrome
npm install webpack webpack-cli ts-loader
npm install copy-webpack-plugin html-webpack-plugin
npm install chart.js react-chartjs-2
npm install date-fns zustand
```

### Manifest V3

```json
// manifest.json
{
  "manifest_version": 3,
  "name": "Productivity Tracker",
  "version": "1.0.0",
  "description": "Track your browsing time and boost productivity",
  "permissions": [
    "storage",
    "tabs",
    "alarms",
    "notifications"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content-script.js"]
    }
  ],
  "options_page": "options.html",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

---

## Background Service Worker

```typescript
// src/background/service-worker.ts
import { TimeTracker } from '../utils/time-tracker';
import { Storage } from '../utils/storage';

const tracker = new TimeTracker();

// Track active tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    await tracker.startTracking(tab.url);
  }
});

// Track tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active && tab.url) {
    await tracker.startTracking(tab.url);
  }
});

// Stop tracking when window loses focus
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await tracker.stopTracking();
  }
});

// Check focus mode every minute
chrome.alarms.create('checkFocusMode', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkFocusMode') {
    const settings = await Storage.getSettings();

    if (settings.focusMode) {
      const tabs = await chrome.tabs.query({ active: true });

      for (const tab of tabs) {
        if (tab.url && isBlockedSite(tab.url, settings.blockedSites)) {
          // Redirect to blocked page
          chrome.tabs.update(tab.id!, {
            url: 'blocked.html'
          });
        }
      }
    }
  }
});

function isBlockedSite(url: string, blockedSites: string[]): boolean {
  const hostname = new URL(url).hostname;
  return blockedSites.some(site => hostname.includes(site));
}

// Send daily notification
chrome.alarms.create('dailyGoalReminder', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'dailyGoalReminder') {
    const stats = await Storage.getTodayStats();
    const settings = await Storage.getSettings();

    if (stats.productiveTime < settings.dailyGoal) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Productivity Reminder',
        message: `You've been productive for ${formatTime(stats.productiveTime)}. Keep going!`
      });
    }
  }
});

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
```

---

## Time Tracker Utility

```typescript
// src/utils/time-tracker.ts
import { Storage } from './storage';

export class TimeTracker {
  private currentSite: string | null = null;
  private startTime: number | null = null;

  async startTracking(url: string): Promise<void> {
    // Save previous tracking session
    if (this.currentSite && this.startTime) {
      await this.saveSession();
    }

    // Start new session
    const hostname = new URL(url).hostname;
    this.currentSite = hostname;
    this.startTime = Date.now();
  }

  async stopTracking(): Promise<void> {
    if (this.currentSite && this.startTime) {
      await this.saveSession();
      this.currentSite = null;
      this.startTime = null;
    }
  }

  private async saveSession(): Promise<void> {
    if (!this.currentSite || !this.startTime) return;

    const duration = Math.floor((Date.now() - this.startTime) / 1000); // seconds
    const category = await Storage.getSiteCategory(this.currentSite);

    await Storage.addTimeEntry({
      site: this.currentSite,
      category,
      duration,
      timestamp: this.startTime,
    });
  }
}
```

---

## Storage Utility

```typescript
// src/utils/storage.ts
export interface TimeEntry {
  site: string;
  category: 'productive' | 'neutral' | 'distracting';
  duration: number; // seconds
  timestamp: number;
}

export interface Settings {
  focusMode: boolean;
  blockedSites: string[];
  dailyGoal: number; // minutes
  categories: Record<string, 'productive' | 'neutral' | 'distracting'>;
}

export class Storage {
  static async getTimeEntries(date?: Date): Promise<TimeEntry[]> {
    const result = await chrome.storage.local.get('timeEntries');
    let entries: TimeEntry[] = result.timeEntries || [];

    if (date) {
      const startOfDay = new Date(date).setHours(0, 0, 0, 0);
      const endOfDay = new Date(date).setHours(23, 59, 59, 999);

      entries = entries.filter(
        entry => entry.timestamp >= startOfDay && entry.timestamp <= endOfDay
      );
    }

    return entries;
  }

  static async addTimeEntry(entry: TimeEntry): Promise<void> {
    const entries = await this.getTimeEntries();
    entries.push(entry);

    await chrome.storage.local.set({ timeEntries: entries });
  }

  static async getSettings(): Promise<Settings> {
    const result = await chrome.storage.sync.get('settings');
    return result.settings || {
      focusMode: false,
      blockedSites: [],
      dailyGoal: 240, // 4 hours
      categories: {},
    };
  }

  static async saveSettings(settings: Settings): Promise<void> {
    await chrome.storage.sync.set({ settings });
  }

  static async getSiteCategory(site: string): Promise<'productive' | 'neutral' | 'distracting'> {
    const settings = await this.getSettings();
    return settings.categories[site] || 'neutral';
  }

  static async getTodayStats() {
    const entries = await this.getTimeEntries(new Date());

    const stats = entries.reduce(
      (acc, entry) => {
        const minutes = entry.duration / 60;

        if (entry.category === 'productive') {
          acc.productiveTime += minutes;
        } else if (entry.category === 'distracting') {
          acc.distractingTime += minutes;
        }

        acc.totalTime += minutes;
        return acc;
      },
      { productiveTime: 0, distractingTime: 0, totalTime: 0 }
    );

    return stats;
  }
}
```

---

## Popup Component

```typescript
// src/popup/Popup.tsx
import React, { useEffect, useState } from 'react';
import { Storage } from '../utils/storage';
import './popup.css';

export function Popup() {
  const [stats, setStats] = useState({
    productiveTime: 0,
    distractingTime: 0,
    totalTime: 0,
  });

  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const todayStats = await Storage.getTodayStats();
    setStats(todayStats);

    const settings = await Storage.getSettings();
    setFocusMode(settings.focusMode);
  }

  async function toggleFocusMode() {
    const settings = await Storage.getSettings();
    settings.focusMode = !settings.focusMode;
    await Storage.saveSettings(settings);
    setFocusMode(settings.focusMode);
  }

  function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  }

  return (
    <div className="popup">
      <h1>Productivity Tracker</h1>

      <div className="stats">
        <div className="stat">
          <div className="stat-label">Productive Time</div>
          <div className="stat-value productive">
            {formatTime(stats.productiveTime)}
          </div>
        </div>

        <div className="stat">
          <div className="stat-label">Distracting Time</div>
          <div className="stat-value distracting">
            {formatTime(stats.distractingTime)}
          </div>
        </div>

        <div className="stat">
          <div className="stat-label">Total Time</div>
          <div className="stat-value">{formatTime(stats.totalTime)}</div>
        </div>
      </div>

      <div className="controls">
        <button
          className={`focus-btn ${focusMode ? 'active' : ''}`}
          onClick={toggleFocusMode}
        >
          {focusMode ? '🔒 Focus Mode ON' : '🔓 Focus Mode OFF'}
        </button>

        <button
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          ⚙️ Settings
        </button>

        <button
          onClick={() => window.open('dashboard.html', '_blank')}
        >
          📊 Dashboard
        </button>
      </div>
    </div>
  );
}
```

---

## Dashboard Component

```typescript
// src/dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Storage, TimeEntry } from '../utils/storage';
import { format, subDays } from 'date-fns';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function Dashboard() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    loadEntries();
  }, [timeRange]);

  async function loadEntries() {
    let entries: TimeEntry[] = [];

    if (timeRange === 'today') {
      entries = await Storage.getTimeEntries(new Date());
    } else {
      const days = timeRange === 'week' ? 7 : 30;
      const allEntries = await Storage.getTimeEntries();

      const cutoff = subDays(new Date(), days).getTime();
      entries = allEntries.filter(e => e.timestamp >= cutoff);
    }

    setEntries(entries);
  }

  // Aggregate time by category
  const categoryData = entries.reduce(
    (acc, entry) => {
      const minutes = entry.duration / 60;
      acc[entry.category] += minutes;
      return acc;
    },
    { productive: 0, neutral: 0, distracting: 0 }
  );

  const pieData = {
    labels: ['Productive', 'Neutral', 'Distracting'],
    datasets: [
      {
        data: [categoryData.productive, categoryData.neutral, categoryData.distracting],
        backgroundColor: ['#10b981', '#6b7280', '#ef4444'],
      },
    ],
  };

  // Aggregate time by site
  const siteData = entries.reduce((acc, entry) => {
    const minutes = entry.duration / 60;
    acc[entry.site] = (acc[entry.site] || 0) + minutes;
    return acc;
  }, {} as Record<string, number>);

  const topSites = Object.entries(siteData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const barData = {
    labels: topSites.map(([site]) => site),
    datasets: [
      {
        label: 'Time (minutes)',
        data: topSites.map(([, time]) => time),
        backgroundColor: '#3b82f6',
      },
    ],
  };

  return (
    <div className="dashboard">
      <h1>Productivity Dashboard</h1>

      <div className="time-range-selector">
        <button
          className={timeRange === 'today' ? 'active' : ''}
          onClick={() => setTimeRange('today')}
        >
          Today
        </button>
        <button
          className={timeRange === 'week' ? 'active' : ''}
          onClick={() => setTimeRange('week')}
        >
          Week
        </button>
        <button
          className={timeRange === 'month' ? 'active' : ''}
          onClick={() => setTimeRange('month')}
        >
          Month
        </button>
      </div>

      <div className="charts">
        <div className="chart">
          <h2>Time by Category</h2>
          <Pie data={pieData} />
        </div>

        <div className="chart">
          <h2>Top 10 Sites</h2>
          <Bar data={barData} options={{ indexAxis: 'y' }} />
        </div>
      </div>
    </div>
  );
}
```

---

## Build Configuration

```javascript
// webpack.config.js
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background/service-worker.ts',
    'content-script': './src/content/content-script.ts',
    popup: './src/popup/index.tsx',
    dashboard: './src/dashboard/index.tsx',
    options: './src/options/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'public/icons', to: 'icons' },
      ],
    }),
    new HtmlWebpackPlugin({
      template: './public/popup.html',
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      template: './public/dashboard.html',
      filename: 'dashboard.html',
      chunks: ['dashboard'],
    }),
    new HtmlWebpackPlugin({
      template: './public/options.html',
      filename: 'options.html',
      chunks: ['options'],
    }),
  ],
};
```

---

## Build and Load

```bash
# Build extension
npm run build

# Load in Chrome
# 1. Open chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the "dist" folder
```

---

## Next Steps

1. Add data visualization with more charts
2. Implement CSV/JSON export
3. Add goal streaks and achievements
4. Create Pomodoro timer integration
5. Publish to Chrome Web Store

**Estimated Time:** 2-3 weeks

---

## Resources

- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
