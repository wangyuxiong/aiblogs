module.exports = {
  apps: [
    {
      name: 'digital-nomad-blog',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/digital-nomad-blog',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      restart_delay: 3000,
      min_uptime: '10s',
      max_restarts: 5,
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
}
