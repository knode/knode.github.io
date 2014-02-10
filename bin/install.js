module.exports = main

var compile = require('./compile.js')

var meetups = require('knode-meetups')
  , JSONStream = require('JSONStream')
  , concat = require('concat-stream')
  , mkdirp = require('mkdirp')
  , path = require('path')
  , cpr = require('cpr')
  , fs = require('fs')

var base_dir = path.join(__dirname, '..', 'output')

var targets = {
    'javascripts': path.join(__dirname, '..', 'javascripts')
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

      !--pending && oncopied()
    }

    function oncopied() {
      meetups()
        .pipe(JSONStream.stringify())
        .pipe(fs.createWriteStream(
          path.join(__dirname, 'meetups.json'))
        ).on('finish', function() {
          compile(ready)
        })
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
