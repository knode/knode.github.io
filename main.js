var fs = require('fs')
  , handlebars = require('handlebars')
  , _ = require('underscore')
  , marked = require('marked');

var cities = [
    {
      city: "Portland, OR",
      speakers: [
        {
            name: "Justin Abrahms"
            , location: "Portland, OR"
            , twitter: "@justinabrahms"
            , github: "justinabrahms"
            , preferred_audience_size: "any"
            , travel_availability: "if comped"
            , about_me: "I'm Justin. I've been programming for many years. I'm\nself-taught. I dig talking because it provides me an excuse to dig\ndeeper into a topic, as well as a method of share my findings with\nothers.\n\nAs for formats, I'm happy with a tour of code, if there's a\nparticular repo of mine that catches your eye, standard speaker +\nslides or round table discussion things.\n\nFor topics, I'm into a bunch of stuff, including:\n\n- static analysis\n- writing testable code\n- playing with irc bots\n- application structure and architecture\n- technical paper discussion\n- computer science (and education thereof)\n- tooling as a general concept\n"
        }, {
            name: "Christopher Swenson"
            , location: "Portland, OR"
            , twitter: "@caswenson"
            , github: "caswenson"
            , preferred_audience_size: "large"
            , travel_availability: "local"
            , about_me: "Nothing to see here. Move along."
        }
      ]
    }
    , {
      city: "San Francisco, CA"
      , speakers: [{
        name: "Jason Denizac"
        , location: "San Fancisco, CA"
        , twitter: "@_jden"
        , github: "jden"
        , preferred_audience_size: "small"
        , travel_availability: "any"
        , about_me: "Nothing to see here. Move along."
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
