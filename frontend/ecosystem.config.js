module.exports = {
  apps: [{
    name: 'goauction-frontend',
    script: 'serve',
    args: ['-s', 'build', '-l', '3000'],
    env: {
      NODE_ENV: 'production'
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
