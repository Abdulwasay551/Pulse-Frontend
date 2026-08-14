import type { CapacitorConfig } from "@capacitor/cli";

// Pulse is a genuinely dynamic Next.js app (server-rendered marketing
// pages, a client-rendered dashboard talking to a separate Django API,
// httpOnly-cookie JWT auth) — not a static site — so `next export`
// bundled into the app isn't a realistic option without rearchitecting
// the whole data-fetching model. Instead, `server.url` points the
// native shell at the already-deployed web app: the APK/IPA renders
// the exact same UI and behavior as the browser, and a normal Vercel
// deploy updates it for everyone immediately — no new native build
// needed for ordinary app changes. A new build is only needed for
// native-level changes (icon, splash screen, permissions, plugins).
const config: CapacitorConfig = {
  appId: "com.Pulse.app",
  appName: "Pulse",
  webDir: "capacitor-www",
  server: {
    url: "https://Pulse-frontend.vercel.app",
    cleartext: false,
  },
};

export default config;
