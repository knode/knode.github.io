var fs = require('fs')
  , handlebars = require('handlebars')
  , _ = require('underscore')
  , marked = require('marked');

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
];

function get_speakers() { 
    return speaker_profile({cities: cities})

    function speaker_profile(city_map) {
      _.each(city_map.cities, function(city) {
          _.each(city.speakers, function(speaker) {
            speaker.about_me = marked(speaker.about_me)
          })
      })
      return city_map
    }
};

/**
 * A mapping of template name (which lives in the templates/ directory) to
 * functions which return a context the template is rendered with.
 */
var template_contextfn = {
  'speakers.hbs': get_speakers,
  'index.hbs': function () {}
};

function compile () { 
  _.each(template_contextfn, function (ctxFn, template) {
    var outputFile = template.replace('hbs', 'html')
    , ctx = template_contextfn[template]()

    fs.readFile('templates/' + template, 'utf8', function (err, txt) {
      if (err) {
        throw err
      }
      var output = handlebars.compile(txt)(ctx)

      fs.writeFile('output/' + outputFile, output, function (err) {
        if (err) {
          throw err
        }
        console.log("Wrote", template, 'to', outputFile);
      })
    })
  })
};

compile();
