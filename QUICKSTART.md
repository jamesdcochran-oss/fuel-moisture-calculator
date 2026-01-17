# Quick Start Guide

## Installation & Usage

### 1. NPM (Node.js)
```bash
npm install fuel-moisture-calculator
```

```javascript
const FuelMoistureCalculator = require('fuel-moisture-calculator');

const moisture = FuelMoistureCalculator.calculateFineFuelMoisture(75, 50);
console.log(moisture); // 1.23
```

### 2. Browser (CDN)
```html
<script src="https://cdn.jsdelivr.net/npm/fuel-moisture-calculator@1.0.0/fuel-moisture-calculator.js"></script>
<script>
    const moisture = FuelMoistureCalculator.calculateFineFuelMoisture(75, 50);
    console.log(moisture);
</script>
```

### 3. Deno
```javascript
import FuelMoistureCalculator from 'https://cdn.jsdelivr.net/npm/fuel-moisture-calculator@1.0.0/fuel-moisture-calculator.js';

const moisture = FuelMoistureCalculator.calculateFineFuelMoisture(75, 50);
console.log(moisture);
```

### 4. Bun
```bash
bun add fuel-moisture-calculator
```

```javascript
const FuelMoistureCalculator = require('fuel-moisture-calculator');

const moisture = FuelMoistureCalculator.calculateFineFuelMoisture(75, 50);
console.log(moisture);
```

## Basic Examples

### Calculate Single Fuel Class
```javascript
// Calculate 1-hour fuel moisture
const oneHour = FuelMoistureCalculator.calculateFineFuelMoisture(75, 50);

// Calculate 10-hour fuel moisture (with shading)
const tenHour = FuelMoistureCalculator.calculate10HourFuelMoisture(75, 50, 0.5);

// Calculate 100-hour fuel moisture (with lag)
const hundredHour = FuelMoistureCalculator.calculate100HourFuelMoisture(75, 50, 12);

// Calculate 1000-hour fuel moisture (with lag)
const thousandHour = FuelMoistureCalculator.calculate1000HourFuelMoisture(75, 50, 15);
```

### Calculate All Fuel Classes
```javascript
const allMoistures = FuelMoistureCalculator.calculateAllFuelMoistures({
    temperature: 75,
    relativeHumidity: 50,
    shading: 0.5
});

console.log(allMoistures);
// {
//   oneHour: 1.23,
//   tenHour: 1.27,
//   hundredHour: 1.38,
//   thousandHour: 1.57
// }
```

### Temperature Conversion
```javascript
const fahrenheit = FuelMoistureCalculator.celsiusToFahrenheit(25); // 77
const celsius = FuelMoistureCalculator.fahrenheitToCelsius(77); // 25
```

## Features

✅ **Zero Dependencies** - Pure JavaScript, no external libraries  
✅ **Universal Compatibility** - Browser, Node.js, Deno, Bun  
✅ **Small Size** - Only ~12KB uncompressed  
✅ **Full Test Coverage** - 49 comprehensive tests  
✅ **Defensive Programming** - Validates all inputs  
✅ **Well Documented** - Complete API documentation  
✅ **Production Ready** - Battle-tested algorithms

## Testing

Run tests in different environments:

```bash
# Node.js
npm test

# Deno
deno run --allow-read test/test.js

# Bun
bun test/test.js
```

## Examples

Check the `examples/` folder for complete working examples:
- `browser-example.html` - Interactive web interface
- `node-example.js` - Node.js usage examples
- `deno-example.js` - Deno usage examples  
- `bun-example.js` - Bun usage examples

## More Information

See [README.md](README.md) for full documentation.
