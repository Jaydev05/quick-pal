// PM2 process configuration for Hostinger VPS (or any Node server).
// Usage:  pm2 start ecosystem.config.cjs
// The app must be built first:  bun run build   (or npm run build)
module.exports = {
  apps: [
    {
      name: "jaydev-associates",
      script: ".output/server/index.mjs",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NITRO_PORT: 3000,
      },
      max_restarts: 10,
      restart_delay: 3000,
      time: true,
    },
  ],
};