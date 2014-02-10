module.exports = compile

var handlebars = require('handlebars')
  , marked = require('marked')
  , path = require('path')
  , fs = require('fs')

var cities = [
    {
      city: "Portland, OR",
      speakers: [
        {
            image: "https://pbs.twimg.com/profile_images/2838109127/2c54fb23975e845704a4b5232504798f.jpeg?s=200"
            , name: "Justin Abrahms"
            , location: "Portland, OR"
            , twitter: "@justinabrahms"
            , github: "justinabrahms"
            , preferred_audience_size: "any"
            , travel_availability: "if comp'd"
            , about_me: "I'm Justin. I've been programming for many years. I'm\nself-taught. I dig talking because it provides me an excuse to dig\ndeeper into a topic, as well as a method of share my findings with\nothers.\n\nAs for formats, I'm happy with a tour of code, if there's a\nparticular repo of mine that catches your eye, standard speaker +\nslides or round table discussion things.\n\nFor topics, I'm into a bunch of stuff, including:\n\n- static analysis\n- writing testable code\n- playing with irc bots\n- application structure and architecture\n- technical paper discussion\n- computer science (and education thereof)\n- tooling as a general concept\n"
        }]
    },
    {
      city: "San Francisco, CA",
      speakers: [
      {
            image: "https://0.gravatar.com/avatar/44c00253ab6c0e681820c82e9a2264d1?r=x&s=200"
            , name: "Forrest Norvell"
            , location: "San Francisco, CA"
            , twitter: "@othiym23"
            , github: "othiym23"
            , preferred_audience_size: "whatever"
            , travel_availability: "if comp'd"
            , about_me: "I'm a Node engineer for New Relic who has contributed significantly to their\ninstrumentation for Node.js. I've been using Node professionally since 2011,\nco-ran one of the session tracks at NodeConf 2013, and have contributed some\n small pieces to Node core. My most significant public project aside from\n [node-newrelic](https://github.com/newrelic/node-newrelic) is probably\n [continuation-local storage](https://github.com/othiym23/node-continuation-local-storage),\nof which I am the primary maintainer. No server-side JavaScript is too gross\n for me to be interested in.\n \nNode is a great platform but it can be scary to get started with, and it can\ncontinue to be scary to plumb its depths. I'm comfortable with Node's (and\n    JavaScript's) many idiosyncracies and awkward design tradeoffs and really enjoy\nhelping other people get more comfortable as well. Having done all of free-form\ntalks with questions, formal presentations, and hands-on workshops, I enjoy all\nthree, although I do better when there are frequent opportunities for\nquestions.\n "
      }]
    } 
]

function get_speakers() { 
    return speaker_profile({cities: cities})

    function speaker_profile(city_map) {
      city_map.cities.forEach(function(city) {
          city.speakers.forEach(function(speaker) {
              speaker.about_me = marked(speaker.about_me)
          })
      })
      return city_map
    }
}

function get_meetups() {
  var meetups = require('./meetups.json')

  return {'meetups': meetups}
}

/**
 * A mapping of template name (which lives in the templates/ directory) to
 * functions which return a context the template is rendered with.
 */
var template_contextfn = {
    'speakers.hbs': get_speakers
  , 'meetups.hbs': get_meetups
  , 'index.hbs': Function()
}

function compile(ready) {
  // fail early if we don't have `meetups.json` available,
  // but not so early that `bin/install.js` explodes by
  // requiring this file.
  try {
    require('./meetups.json')
  } catch(err) {
    return ready(new Error(
        'Error: could not find meetups.json.\n' +
        'Please execute \x1b[32m`npm run update`\x1b[0m' +
        ' and rerun this command.'
    ))
  }

  var keys = Object.keys(template_contextfn)
    , pending = keys.length

  add_helpers(onhelpers)

  function onhelpers(err) {
    if(err) {
      return ready(err)
    }

    keys.forEach(function(template) {
      var outputFile = template.replace('hbs', 'html')
        , ctxFn = template_contextfn[template] 
        , ctx = template_contextfn[template]()

      fs.readFile(path.join(
          __dirname
        , '..'
        , 'templates'
        , template
      ), 'utf8', onread)
      
      function onread(err, txt) {
        if(err) {
          return ready(err)
        }
        console.log('TEMPLATE: ', template)
        var output = handlebars.compile(txt)(ctx)

        fs.writeFile('output/' + outputFile, output, function(err) {
          if(err) {
            return ready(err)
          }
          console.log('Wrote %s to %s', template, outputFile)

          !--pending && ready(null)
        })
      }
    })
  }
}

function add_helpers(ready) {
  var helpers = [
      'base'
    , 'wrap'
  ]

  var pending = helpers.length

  helpers.forEach(function(helper) {
    var dir = path.join(__dirname, '..', 'helpers', helper) + '.hbs'

    fs.readFile(dir, 'utf8', function(err, txt) {
      if(err) {
        return ready(err)
      }

      wrapperify(helper, txt)
      !--pending && ready(null)
    })
  })
}

function wrapperify(name, txt) {
  var tpl = handlebars.compile(txt)

  handlebars.registerHelper(name, function(options) {
    var content = options.fn(this)
      , ctx = {}

    options.hash = options.hash || {}

    for(var key in options.hash) {
      this[key] = options.hash[key]
    }

    this.content = new handlebars.SafeString(content)

    console.log(name, this.content)

    return tpl(this)
  })
}

if(require.main === module) {
  compile(function(err) {
    if(err) {
      console.error(err.stack || err)
    }

    process.exit(err ? 1 : 0)
  })
}
