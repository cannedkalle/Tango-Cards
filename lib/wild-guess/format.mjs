/* Pure presentation helpers for Balls in the Ballpark, shared by the server game and the browser game. No Node.js or database use, so this module is safe to import in the browser. */

const SCALE_NAMES = ['one', 'tens', 'hundreds', 'thousands', 'tens of thousands', 'hundreds of thousands', 'millions', 'tens of millions', 'hundreds of millions', 'billions', 'tens of billions', 'hundreds of billions', 'trillions', 'tens of trillions', 'hundreds of trillions', 'quadrillions', 'tens of quadrillions', 'hundreds of quadrillions', 'quintillions', 'tens of quintillions', 'hundreds of quintillions', 'sextillions', 'tens of sextillions', 'hundreds of sextillions', 'septillions', 'tens of septillions', 'hundreds of septillions', 'octillions', 'tens of octillions', 'hundreds of octillions', 'nonillions'];

export function scaleName(magnitude) {
  return SCALE_NAMES[magnitude] || `10 to the power of ${magnitude}`;
}

const DURATION_SCALES = new Map([
  [3, 'minutes'],
  [4, 'hours'],
  [5, 'days'],
  [6, 'weeks'],
  [7, 'months'],
  [8, 'years'],
  [9, 'decades'],
  [10, 'centuries'],
  [11, 'thousands of years'],
  [12, 'tens of thousands of years'],
  [13, 'hundreds of thousands of years'],
  [14, 'millions of years'],
  [15, 'tens of millions of years'],
  [16, 'hundreds of millions of years'],
  [17, 'billions of years'],
]);

const FREQUENCY_SCALES = new Map([
  [-8, 'hundred-millionths per second'],
  [-7, 'ten-millionths per second'],
  [-6, 'millionths per second'],
  [-5, 'hundred-thousandths per second'],
  [-4, 'ten-thousandths per second'],
  [-3, 'thousandths per second'],
  [-2, 'hundredths per second'],
  [-1, 'tenths per second'],
  [0, 'a few per second'],
]);

const LENGTH_SCALES = new Map([
  [0, 'a few meters'],
  [1, 'tens of meters'],
  [2, 'hundreds of meters'],
  [3, 'kilometers'],
  [4, 'tens of kilometers'],
  [5, 'hundreds of kilometers'],
  [6, 'thousands of kilometers'],
  [7, 'tens of thousands of kilometers'],
  [8, 'hundreds of thousands of kilometers'],
  [9, 'millions of kilometers'],
  [10, 'tens of millions of kilometers'],
  [11, 'hundreds of millions of kilometers'],
  [12, 'billions of kilometers'],
]);

const AREA_SCALES = new Map([
  [0, 'a few square meters'],
  [1, 'tens of square meters'],
  [2, 'hundreds of square meters'],
  [3, 'thousands of square meters'],
  [4, 'tens of thousands of square meters'],
  [5, 'hundreds of thousands of square meters'],
  [6, 'a few square kilometers'],
  [7, 'tens of square kilometers'],
  [8, 'hundreds of square kilometers'],
  [9, 'thousands of square kilometers'],
  [10, 'tens of thousands of square kilometers'],
  [11, 'hundreds of thousands of square kilometers'],
  [12, 'millions of square kilometers'],
  [13, 'tens of millions of square kilometers'],
  [14, 'hundreds of millions of square kilometers'],
]);

const VOLUME_SCALES = new Map([
  [0, 'thousands of liters'],
  [1, 'tens of thousands of liters'],
  [3, 'millions of liters'],
  [6, 'billions of liters'],
  [8, 'hundreds of millions of cubic meters'],
  [9, 'about a cubic kilometer'],
  [11, 'hundreds of cubic kilometers'],
  [13, 'tens of thousands of cubic kilometers'],
  [18, 'billions of cubic kilometers'],
  [19, 'tens of billions of cubic kilometers'],
  [21, 'trillions of cubic kilometers'],
  [27, 'quadrillions of cubic kilometers'],
]);

const SPEED_SCALES = new Map([
  [-10, 'millimeters per year'],
  [-9, 'centimeters per year'],
  [-8, 'tens of centimeters per year'],
  [-7, 'meters per year'],
  [-6, 'centimeters per day'],
  [-5, 'tens of centimeters per day'],
  [-4, 'tens of meters per day'],
  [-3, 'hundreds of meters per day'],
  [-2, 'kilometers per day'],
  [-1, 'tens of kilometers per day'],
  [0, 'meters per second'],
  [1, 'tens of meters per second'],
]);

const rateRange = (label) => {
  const values = (label?.match(/\d[\d,]*(?:\.\d+)?/g) || []).map((value) => Number(value.replaceAll(',', '')));
  if (!values.length) return null;
  return { low: Math.min(...values), high: Math.max(...values) };
};

const intervalPhrase = (seconds) => {
  if (seconds < 2) return 'second';
  if (seconds < 30) return 'few seconds';
  if (seconds < 120) return 'minute or two';
  if (seconds < 3600) return 'few minutes';
  if (seconds < 10800) return 'few hours';
  if (seconds < 86400) return 'several hours';
  if (seconds < 172800) return 'day or two';
  if (seconds < 604800) return 'few days';
  if (seconds < 1209600) return 'week or two';
  if (seconds < 2592000) return 'few weeks';
  if (seconds < 7776000) return 'few months';
  if (seconds < 63072000) return 'several months';
  return 'few years';
};

const readableIntervalRange = (fastestSeconds, slowestSeconds) => {
  const max = slowestSeconds;
  const [divisor, unit] = max < 120 ? [1, 'second']
    : max < 7200 ? [60, 'minute']
      : max < 172800 ? [3600, 'hour']
        : max < 1209600 ? [86400, 'day']
          : max < 5184000 ? [604800, 'week']
            : max < 63072000 ? [2592000, 'month']
              : [31536000, 'year'];
  const rounded = (value) => {
    const converted = value / divisor;
    return converted < 10 ? Number(converted.toFixed(1)) : Math.round(converted);
  };
  const low = rounded(fastestSeconds);
  const high = rounded(slowestSeconds);
  if (low === high) return `about ${low} ${unit}${low === 1 ? '' : 's'}`;
  return `about ${low} to ${high} ${unit}s`;
};

export function formatScale(option, category) {
  if (category === 'frequency') {
    const rate = rateRange(option.scaleLabel);
    if (rate && rate.high < 1) return `one every ${intervalPhrase(1 / Math.sqrt(rate.low * rate.high))}`;
    return FREQUENCY_SCALES.get(option.magnitude) || `${scaleName(option.magnitude)} per second`;
  }
  if (category === 'length') return LENGTH_SCALES.get(option.magnitude) || `${scaleName(option.magnitude)} of meters`;
  if (category === 'area') return AREA_SCALES.get(option.magnitude) || `${scaleName(option.magnitude)} of square meters`;
  if (category === 'volume') return VOLUME_SCALES.get(option.magnitude) || `${scaleName(option.magnitude)} of cubic meters`;
  if (category === 'speed') return SPEED_SCALES.get(option.magnitude) || option.scaleLabel;
  if (option.scaleLabel) return option.scaleLabel;
  if (category === 'weight') return `${scaleName(option.magnitude)} of kilograms`;
  if (category === 'duration') return DURATION_SCALES.get(option.magnitude) || `${scaleName(option.magnitude)} of seconds`;
  return scaleName(option.magnitude);
}

export function formatRange(option, category) {
  if (category === 'frequency') {
    const rate = rateRange(option.scaleLabel);
    if (rate && rate.high < 1) return `It takes ${readableIntervalRange(1 / rate.high, 1 / rate.low)} for one to happen.`;
    return `A useful estimate is ${option.scaleLabel}.`;
  }
  if (['length', 'area', 'volume', 'speed'].includes(category) && option.scaleLabel) return `A useful estimate is ${option.scaleLabel}.`;
  if (option.magnitude >= 15 && category === 'weight') return `That is roughly a 1 followed by ${option.magnitude} zeros, measured in kilograms.`;
  if (option.magnitude >= 15 && category === 'count') return `That is roughly a 1 followed by ${option.magnitude} zeros.`;
  const low = formatScale({ magnitude: option.lowMagnitude }, category);
  const high = formatScale({ magnitude: option.highMagnitude }, category);
  if (low === high) return `A reasonable range stays around ${low}.`;
  return `Estimates range from ${low} to ${high}.`;
}

export function winningSide(comparison) {
  return comparison.left.magnitude > comparison.right.magnitude ? 0 : 1;
}
