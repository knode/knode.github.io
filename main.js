var fs = require('fs');
var handlebars = require('handlebars');
var _ = require('underscore');

var speakers = [
    {
        name: "Justin Abrahms"
        , location: "Portland, OR"
        , twitter: "@justinabrahms"
        , github: "justinabrahms"
        , preferred_audience_size: "any"
        , travel_availability: "if comped"
    }
    , {
        name: "Christopher Swenson"
        , location: "Portland, OR"
        , twitter: "@caswenson"
        , github: "caswenson"
        , preferred_audience_size: "large"
        , travel_availability: "local"
    }
    , {
        name: "Jason Denizac"
        , location: "San Fancisco, CA"
        , twitter: "@_jden"
        , github: "jden"
        , preferred_audience_size: "small"
        , travel_availability: "any"
   }
];

function get_speakers() { 
    return {
        speakers: speakers
    };
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
    var outputFile = template.replace('hbs', 'html');
    var ctx = template_contextfn[template]();
    fs.readFile('templates/' + template, 'utf8', function (err, txt) {
      if (err) {
        throw err;
      }
      var output = handlebars.compile(txt)(ctx);
      fs.writeFile('output/' + outputFile, output, function (err) {
        if (err) {
          throw err;
        }
        console.log("Wrote", template, 'to', outputFile);
      });
    });
  });
}

compile();
