module.exports = main

var portfinder = require('portfinder')
  , ecstatic = require('ecstatic')
  , watchr = require('watchr')
  , open = require('opener')
  , path = require('path')
  , http = require('http')
  , fs = require('fs')

var compile = require('./compile.js')
  , install = require('./install.js')

var dir = path.join(__dirname, '..', 'output')

function main(ready) {
  fs.exists(dir, function(exists) {
    exists ? setup(null) : install(setup)
  })

  function setup(err) {
    if(err) {
      return ready(err)
    }

    var server = ecstatic({root: dir, defaultExt: true})
      , compiling = false
      , timeout

    watchr.watch({
        path: path.join(__dirname, '..')
      , listener: recompile
      , ignoreHiddenFiles: true
    })

    compile(function(err) {
      if(err) {
        return ready(err)
      }

      ready(null, http.createServer(server))
    })

    function recompile() {
      if(compiling) {
        return
      }

      clearTimeout(timeout)

      timeout = setTimeout(function iter() {
        compiling = true
        compile(function() {
          compiling = false
        })
      }, 500)
    }
  }
}

if(require.main === module) {
  main(function(err, server) {
    if(err) {
      console.error(err.stack || err)

      return process.exit(1)
    }

    portfinder.getPort(function(err, port) {
      if(err) {
        console.error(err.stack || err)

        return process.exit(1)
      }

      server.listen(port)
      open('http://127.0.0.1:' + port + '/')
    })
  })
}
