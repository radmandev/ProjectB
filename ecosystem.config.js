/**
 * PM2 Ecosystem Configuration for Hostinger Deployment
 * This file configures PM2 process manager for production deployment
 */

module.exports = {
  apps: [{
    name: 'sendpulse-bitrix24',
    script: 'src/index.js',
    instances: 1, // or 'max' for cluster mode
    exec_mode: 'fork', // or 'cluster' for multiple instances
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000
  }]
};
