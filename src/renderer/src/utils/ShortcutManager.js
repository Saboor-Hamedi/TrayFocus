// shortcuts.js

class ShortcutManager {
  constructor() {
    this.shortcuts = new Map();
    this.isListening = false;
    this.handler = null;
    this.priorityQueue = [];
    this.globalModifiers = {
      ctrl: false,
      shift: false,
      alt: false,
      meta: false
    };
  }

  // Register a shortcut with priority (higher = runs first)
  register(key, callback, options = {}) {
    const {
      ctrl = false,
      shift = false,
      alt = false,
      meta = false,
      preventDefault = true,
      enabled = true,
      priority = 0,
      description = '',
      once = false,
      throttle = 0,
      debounce = 0
    } = options;

    const id = this.generateId({ key, ctrl, shift, alt, meta });
    
    const shortcut = {
      id,
      key: key.toLowerCase(),
      ctrl,
      shift,
      alt,
      meta,
      callback,
      preventDefault,
      enabled,
      priority,
      description,
      once,
      throttle,
      debounce,
      lastCalled: 0,
      timeoutId: null,
      called: false
    };

    // Store with priority
    this.shortcuts.set(id, shortcut);
    this.updatePriorityQueue();

    // Return cleanup function
    return () => {
      this.unregister(id);
    };
  }

  // Unregister a shortcut by ID
  unregister(id) {
    const removed = this.shortcuts.delete(id);
    if (removed) {
      this.updatePriorityQueue();
    }
    return removed;
  }

  // Generate unique ID for shortcut
  generateId({ key, ctrl, shift, alt, meta }) {
    const parts = [];
    if (ctrl) parts.push('ctrl');
    if (shift) parts.push('shift');
    if (alt) parts.push('alt');
    if (meta) parts.push('meta');
    parts.push(key.toLowerCase());
    return parts.join('+');
  }

  // Update priority queue for efficient handling
  updatePriorityQueue() {
    this.priorityQueue = Array.from(this.shortcuts.values())
      .filter(s => s.enabled)
      .sort((a, b) => b.priority - a.priority);
  }

  // Enable/disable a shortcut
  setEnabled(id, enabled) {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      shortcut.enabled = enabled;
      this.updatePriorityQueue();
      return true;
    }
    return false;
  }

  // Toggle a shortcut
  toggle(id) {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      shortcut.enabled = !shortcut.enabled;
      this.updatePriorityQueue();
      return shortcut.enabled;
    }
    return false;
  }

  // Get shortcut by ID
  get(id) {
    return this.shortcuts.get(id) || null;
  }

  // Get all shortcuts
  getAll() {
    return Array.from(this.shortcuts.values());
  }

  // Get shortcuts by key
  getByKey(key) {
    const results = [];
    for (const [id, shortcut] of this.shortcuts) {
      if (shortcut.key === key.toLowerCase()) {
        results.push(shortcut);
      }
    }
    return results;
  }

  // Clear all shortcuts
  clear() {
    this.shortcuts.clear();
    this.priorityQueue = [];
    this.stopListening();
  }

  // Check if a shortcut exists
  exists(key, options = {}) {
    const { ctrl = false, shift = false, alt = false, meta = false } = options;
    const id = this.generateId({ key, ctrl, shift, alt, meta });
    return this.shortcuts.has(id);
  }

  // Throttle helper
  throttle(callback, limit) {
    let inThrottle = false;
    return function(...args) {
      if (!inThrottle) {
        callback.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Debounce helper
  debounce(callback, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback.apply(this, args), delay);
    };
  }

  // Handle keydown events
  handleKeyDown(event) {
    // Skip if in input/textarea/select
    const target = event.target;
    if (target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' ||
        target.isContentEditable) {
      return;
    }

    // Check against priority queue
    for (const shortcut of this.priorityQueue) {
      if (!shortcut.enabled) continue;

      const ctrlMatch = event.ctrlKey === shortcut.ctrl;
      const shiftMatch = event.shiftKey === shortcut.shift;
      const altMatch = event.altKey === shortcut.alt;
      const metaMatch = event.metaKey === shortcut.meta;
      const keyMatch = event.key.toLowerCase() === shortcut.key;

      if (ctrlMatch && shiftMatch && altMatch && metaMatch && keyMatch) {
        // Handle once
        if (shortcut.once && shortcut.called) {
          continue;
        }

        // Handle throttle
        const now = Date.now();
        if (shortcut.throttle > 0) {
          if (now - shortcut.lastCalled < shortcut.throttle) {
            continue;
          }
          shortcut.lastCalled = now;
        }

        // Handle debounce
        if (shortcut.debounce > 0) {
          if (shortcut.timeoutId) {
            clearTimeout(shortcut.timeoutId);
          }
          shortcut.timeoutId = setTimeout(() => {
            shortcut.callback(event);
            if (shortcut.once) shortcut.called = true;
            shortcut.timeoutId = null;
          }, shortcut.debounce);
          if (shortcut.preventDefault) {
            event.preventDefault();
          }
          return;
        }

        // Execute callback
        try {
          shortcut.callback(event);
          if (shortcut.once) shortcut.called = true;
        } catch (error) {
          console.error(`Shortcut error (${shortcut.id}):`, error);
        }

        if (shortcut.preventDefault) {
          event.preventDefault();
        }
        return; // Stop after first match (priority handles this)
      }
    }
  }

  // Start listening for keyboard events
  startListening() {
    if (this.isListening) return this;

    this.isListening = true;
    this.handler = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.handler);
    return this;
  }

  // Stop listening
  stopListening() {
    if (!this.isListening) return this;

    this.isListening = false;
    if (this.handler) {
      document.removeEventListener('keydown', this.handler);
      this.handler = null;
    }
    return this;
  }

  // Pause all shortcuts
  pause() {
    for (const shortcut of this.shortcuts.values()) {
      shortcut.enabled = false;
    }
    this.updatePriorityQueue();
    return this;
  }

  // Resume all shortcuts
  resume() {
    for (const shortcut of this.shortcuts.values()) {
      shortcut.enabled = true;
    }
    this.updatePriorityQueue();
    return this;
  }

  // Get shortcut statistics
  stats() {
    const total = this.shortcuts.size;
    const enabled = Array.from(this.shortcuts.values()).filter(s => s.enabled).length;
    const disabled = total - enabled;
    const byModifier = {
      ctrl: 0,
      shift: 0,
      alt: 0,
      meta: 0,
      none: 0
    };

    for (const shortcut of this.shortcuts.values()) {
      if (shortcut.ctrl) byModifier.ctrl++;
      if (shortcut.shift) byModifier.shift++;
      if (shortcut.alt) byModifier.alt++;
      if (shortcut.meta) byModifier.meta++;
      if (!shortcut.ctrl && !shortcut.shift && !shortcut.alt && !shortcut.meta) {
        byModifier.none++;
      }
    }

    return {
      total,
      enabled,
      disabled,
      byModifier,
      isListening: this.isListening,
      priorityCount: this.priorityQueue.length
    };
  }

  // Export shortcuts to JSON
  toJSON() {
    const data = [];
    for (const [id, shortcut] of this.shortcuts) {
      data.push({
        id: shortcut.id,
        key: shortcut.key,
        ctrl: shortcut.ctrl,
        shift: shortcut.shift,
        alt: shortcut.alt,
        meta: shortcut.meta,
        description: shortcut.description,
        enabled: shortcut.enabled,
        priority: shortcut.priority
      });
    }
    return data;
  }

  // Import shortcuts from JSON
  fromJSON(json, callbackMap = {}) {
    this.clear();
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    
    for (const item of data) {
      const callback = callbackMap[item.id] || (() => {});
      this.register(item.key, callback, {
        ctrl: item.ctrl,
        shift: item.shift,
        alt: item.alt,
        meta: item.meta,
        description: item.description,
        enabled: item.enabled,
        priority: item.priority
      });
    }
    return this;
  }
}

// Create singleton instance
const shortcutManager = new ShortcutManager();

// Export convenience methods
export const register = (key, callback, options) => 
  shortcutManager.register(key, callback, options);

export const unregister = (id) => 
  shortcutManager.unregister(id);

export const get = (id) => 
  shortcutManager.get(id);

export const getAll = () => 
  shortcutManager.getAll();

export const clear = () => 
  shortcutManager.clear();

export const exists = (key, options) => 
  shortcutManager.exists(key, options);

export const setEnabled = (id, enabled) => 
  shortcutManager.setEnabled(id, enabled);

export const toggle = (id) => 
  shortcutManager.toggle(id);

export const startListening = () => 
  shortcutManager.startListening();

export const stopListening = () => 
  shortcutManager.stopListening();

export const stats = () => 
  shortcutManager.stats();

export const pause = () => 
  shortcutManager.pause();

export const resume = () => 
  shortcutManager.resume();

export const toJSON = () => 
  shortcutManager.toJSON();

export const fromJSON = (json, callbacks) => 
  shortcutManager.fromJSON(json, callbacks);

export default shortcutManager;