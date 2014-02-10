module.exports = main

var compile = require('./compile.js')

var mkdirp = require('mkdirp')
  , path = require('path')
  , cpr = require('cpr')

var base_dir = path.join(__dirname, '..', 'output')

var targets = {
    'stylesheets': path.join(__dirname, '..', 'stylesheets')
  , 'javascripts': path.join(__dirname, '..', 'javascripts')
  , 'images': path.join(__dirname, '..', 'images')
  , 'style': path.join(__dirname, '..', 'node_modules', 'knode-style')
}

function main(ready) {
  mkdirp(path.join(__dirname, '..', 'output'), onmkdirp)

  function onmkdirp(err) {
    if(err) {
      throw err
    }

    var target_keys = Object.keys(targets)
      , pending = target_keys.length

    target_keys.forEach(function(target) {
      var source = targets[target]

      cpr(source, subdir(target), oncpr)
    })

    function oncpr(err) {
      if(err) {
        return onerror(err)
      }

      !--pending && compile(ready)
    }

    function onerror(err) {
      var cb = ready

      ready = Function()
      cb(err)
    }
  }
}

function subdir(dir) {
  return path.join(base_dir, dir)
}

if(require.main === module) {
  main(function(err) {
    if(err) {
      console.error(err.stack || err)
    }

    process.exit(err ? 1 : 0)
  })
}
