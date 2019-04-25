import { range } from 'd3-array';
import deltae from 'deltae';
import { hcl } from 'd3-color';
import toString from '../domain/ColorToString';

function GeneratePalette (state) {
  var startHue = parseFloat(state.startHue);
  var minDelta = parseFloat(state.minDelta);
  var maxL = parseFloat(state.maxL);
  var minL = parseFloat(state.minL);
  var minC = parseFloat(state.minC);
  var maxC = parseFloat(state.maxC);
  var lcPrecision = parseFloat(state.lcPrecision);
  var hPrecision = parseFloat(state.hPrecision);

  function hueColor(h) {
    var results = [];
    range(minL, maxL, lcPrecision).forEach(function (l) {
      range(maxC, minC, -lcPrecision).forEach(function (c) {
        var color = hcl(h, c, l);
        if (color.displayable()) {
          results.push(color);
        }
      });
    });
    results.sort(function (a, b) {
      return -(a.c - b.c + (a.l - b.l) / 1000);
    });
    return results[0];
  }

  var prevColor;
  var hue = startHue;
  var colors = [];

  while (hue < 360 + startHue) {
    var delta;
    var color;
    if (prevColor) {
      hue += hPrecision;
      color = hueColor(hue);
      if (!color) {
        console.warn('color for hue', hue, 'not found, stopping');
        return;
      }
      deltae.delta(toString(color), toString(prevColor), function (d) {
        delta = d;
      });
      if (delta < minDelta) {
        continue
      }
    } else {
      color = hueColor((hue));
      if (!color) {
        console.warn('color for hue', hue, 'not found, stopping');
        return;
      }
    }

    colors.push(color);
    prevColor = color;
  }


  deltae.delta(toString(colors[0]), toString((colors[colors.length - 1])), function (d) {
    if (d < minDelta) colors.pop()
  });

  window.location.hash = colors.map(toString).join('/');
}

export default GeneratePalette;
