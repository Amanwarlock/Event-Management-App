module.exports = {
    apps : [{
      name        : "Backend",
      script      : "app.js",
      cwd: /home/ubuntu/hub/work/DigitalCheckIn/backend,
      max_restarts: 2,
      watch       : true,
      env: {
        "NODE_ENV": "development",
      },
      env_production : {
         "NODE_ENV": "production"
      }
    },{
      name       : "api-app",
      script     : "./api.js",
      instances  : 4,
      exec_mode  : "cluster"
    }]
  }