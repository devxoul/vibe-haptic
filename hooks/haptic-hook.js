#!/usr/bin/env node

// src/claude/hook.ts
import { appendFileSync } from "node:fs";
import { homedir as homedir2 } from "node:os";

// src/haptic.ts
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// src/config.ts
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
var DEFAULT_CONFIG = {
  patterns: {},
  events: {
    stop: "vibe",
    prompt: "alert"
  }
};
function getConfigPath(agent, scope) {
  const home = homedir();
  if (scope === "global") {
    return agent === "claude" ? `${home}/.claude/vibe-haptic.json` : `${home}/.config/opencode/vibe-haptic.json`;
  }
  return agent === "claude" ? ".claude/vibe-haptic.json" : ".opencode/vibe-haptic.json";
}
function mergeConfig(base, override) {
  return {
    patterns: { ...base.patterns, ...override.patterns },
    events: { ...base.events, ...override.events }
  };
}
function loadConfig(agent = "claude") {
  let config = { ...DEFAULT_CONFIG };
  const globalPath = getConfigPath(agent, "global");
  if (existsSync(globalPath)) {
    try {
      const globalData = JSON.parse(readFileSync(globalPath, "utf-8"));
      config = mergeConfig(config, globalData);
    } catch {}
  }
  const localPath = getConfigPath(agent, "local");
  if (existsSync(localPath)) {
    try {
      const localData = JSON.parse(readFileSync(localPath, "utf-8"));
      config = mergeConfig(config, localData);
    } catch {}
  }
  return config;
}

// src/patterns.ts
var DEFAULT_INTENSITY = 1;
var DEFAULT_PATTERNS = {
  vibe: { beat: "6/0.8 3/1.0   6/1.0" },
  alert: { beat: "6/0.5 6/1.0 6/0.5" },
  dopamine: { beat: "6666666 5/1.0 4/1.0 3/1.0", intensity: 0.1 },
  noise: { beat: "6543654365436543" }
};
function resolvePattern(nameOrBeat, patterns) {
  const isInlineBeat = /^[3-6/.\s]+$/.test(nameOrBeat);
  if (isInlineBeat) {
    return { beat: nameOrBeat };
  }
  const userPattern = patterns?.[nameOrBeat];
  if (userPattern) {
    if (typeof userPattern === "string") {
      return { beat: userPattern };
    }
    return {
      beat: userPattern.beat,
      intensity: userPattern.intensity
    };
  }
  const defaultPattern = DEFAULT_PATTERNS[nameOrBeat];
  if (defaultPattern) {
    return {
      beat: defaultPattern.beat,
      intensity: defaultPattern.intensity
    };
  }
  return null;
}

// src/haptic.ts
var PAUSE_DELAY_MS = 100;
function parseBeat(beat, defaultIntensity) {
  const tokens = [];
  let i = 0;
  while (i < beat.length) {
    const char = beat[i];
    if (char === " ") {
      let pauseCount = 0;
      while (i < beat.length && beat[i] === " ") {
        pauseCount++;
        i++;
      }
      tokens.push({ type: "pause", pauseCount });
    } else if (char >= "3" && char <= "6") {
      const actuation = Number(char);
      i++;
      if (i < beat.length && beat[i] === "/") {
        i++;
        let intensityStr = "";
        while (i < beat.length && beat[i] !== " ") {
          intensityStr += beat[i];
          i++;
        }
        const intensity = intensityStr ? Math.min(2, Math.max(0, parseFloat(intensityStr))) : defaultIntensity;
        tokens.push({ type: "tap", actuation, intensity });
      } else {
        tokens.push({ type: "tap", actuation, intensity: defaultIntensity });
      }
    } else {
      i++;
    }
  }
  return tokens;
}

class HapticEngine {
  config;
  nativeModule = null;
  constructor(config, options) {
    this.config = config;
    if (options?.nativeModule !== undefined) {
      this.nativeModule = options.nativeModule;
    } else {
      this.loadNativeModule();
    }
  }
  loadNativeModule() {
    if (process.platform !== "darwin") {
      return;
    }
    try {
      const currentDir = dirname(fileURLToPath(import.meta.url));
      const nativePath = join(currentDir, "..", "native", "vibe-haptic-native.node");
      const require2 = createRequire(import.meta.url);
      this.nativeModule = require2(nativePath);
    } catch {}
  }
  playBeat(pattern) {
    return new Promise((resolve) => {
      if (!this.nativeModule) {
        resolve();
        return;
      }
      const { beat, intensity } = pattern;
      const tokens = parseBeat(beat, intensity ?? DEFAULT_INTENSITY);
      const module = this.nativeModule;
      let i = 0;
      const playNext = () => {
        if (i >= tokens.length) {
          resolve();
          return;
        }
        const token = tokens[i];
        i++;
        if (token.type === "pause") {
          setTimeout(playNext, (token.pauseCount ?? 1) * PAUSE_DELAY_MS);
        } else {
          module.actuate(token.actuation, token.intensity);
          playNext();
        }
      };
      playNext();
    });
  }
  trigger(patternName) {
    const pattern = resolvePattern(patternName, this.config.patterns);
    if (pattern) {
      return this.playBeat(pattern);
    }
    return Promise.resolve();
  }
  triggerForEvent(event) {
    const patternName = this.config.events?.[event];
    if (patternName) {
      return this.trigger(patternName);
    }
    return Promise.resolve();
  }
}
function createHapticEngine(agent) {
  return new HapticEngine(loadConfig(agent));
}

// src/claude/hook.ts
var DEBUG = process.env.VIBE_HAPTIC_DEBUG === "1";
function debug(message, data) {
  if (!DEBUG)
    return;
  const logPath = `${homedir2()}/.vibe-haptic-debug.log`;
  const timestamp = new Date().toISOString();
  const logLine = data ? `[${timestamp}] ${message}: ${JSON.stringify(data, null, 2)}
` : `[${timestamp}] ${message}
`;
  appendFileSync(logPath, logLine);
}
async function handleHookEvent(input) {
  debug("handleHookEvent called", input);
  const engine = createHapticEngine("claude");
  if (input.hook_event_name === "Stop") {
    debug("Triggering stop event");
    await engine.triggerForEvent("stop");
  } else if (input.hook_event_name === "Notification") {
    debug("Triggering prompt event for notification", { notification_type: input.notification_type });
    await engine.triggerForEvent("prompt");
  } else {
    debug("Unknown hook event", { hook_event_name: input.hook_event_name });
  }
}
async function readStdin() {
  if (typeof Bun !== "undefined") {
    return Bun.stdin.text();
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.on("data", (chunk) => chunks.push(chunk));
    process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    process.stdin.on("error", reject);
  });
}
async function main() {
  try {
    const input = await readStdin();
    const hookInput = JSON.parse(input);
    await handleHookEvent(hookInput);
    process.exit(0);
  } catch {
    process.exit(0);
  }
}

// src/bin/haptic-hook.ts
main();
