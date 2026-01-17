# 🔥 Fuel Moisture Calculator

[![npm version](https://img.shields.io/npm/v/fuel-moisture-calculator.svg)](https://www.npmjs.com/package/fuel-moisture-calculator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/jamesdcochran-oss/fuel-moisture-calculator/workflows/tests/badge.svg)](https://github.com/jamesdcochran-oss/fuel-moisture-calculator/actions)

A robust, production-ready JavaScript library for calculating fire weather fuel moisture content. Based on established scientific models (Nelson 2000), this library helps predict fuel moisture across different timelag classes for fire behavior analysis and wildfire risk assessment.

## ✨ Key Features

- **🌍 Universal Compatibility**: Works seamlessly in browser, Node.js, Deno, and Bun
- **📦 Zero Dependencies**: Pure JavaScript with no external requirements
- **🛡️ Production Ready**: Validated, tested, documented, and hardened
- **🚀 CDN Ready**: Can be served via jsDelivr or unpkg
- **📚 NPM Ready**: Published and ready to install
- **🔄 Automated Testing**: Comprehensive test suite with CI/CD
- **🛠️ Defensive Programming**: Robust input validation throughout
- **📖 Well Documented**: Complete API documentation and examples

## 📥 Installation

### NPM / Node.js

```bash
npm install fuel-moisture-calculator
```

### Deno

```javascript
import FuelMoistureCalculator from 'https://cdn.jsdelivr.net/npm/fuel-moisture-calculator@1.0.0/fuel-moisture-calculator.js';
```

### Bun

```bash
bun add fuel-moisture-calculator
```

### Browser (CDN)

```html
<script src="https://cdn.jsdelivr.net/npm/fuel-moisture-calculator@1.0.0/fuel-moisture-calculator.js"></script>
```

or

```html
<script src="https://unpkg.com/fuel-moisture-calculator@1.0.0/fuel-moisture-calculator.js"></script>
```

### Download

Download the standalone `fuel-moisture-calculator.js` file and include it in your project.

## 🚀 Quick Start

### Node.js

```javascript
const FuelMoistureCalculator = require('fuel-moisture-calculator');

// Calculate fine fuel (1-hour) moisture
const moisture = FuelMoistureCalculator.calculateFineFuelMoisture(75, 50);
console.log(`Fuel moisture: ${moisture.toFixed(2)}%`);

// Calculate all timelag classes at once
const allMoistures = FuelMoistureCalculator.calculateAllFuelMoistures({
    temperature: 75,      // °F
    relativeHumidity: 50, // %
    shading: 0.5         // 0-1 (optional)
});

console.log(allMoistures);
// {
//   oneHour: 8.9,
//   tenHour: 9.2,
//   hundredHour: 10.1,
//   thousandHour: 11.5
// }
```

### Browser

```html
<script src="https://cdn.jsdelivr.net/npm/fuel-moisture-calculator@1.0.0/fuel-moisture-calculator.js"></script>
<script>
    const moisture = FuelMoistureCalculator.calculateFineFuelMoisture(75, 50);
    console.log(`Fuel moisture: ${moisture.toFixed(2)}%`);
</script>
```

### Deno

```javascript
import FuelMoistureCalculator from 'https://cdn.jsdelivr.net/npm/fuel-moisture-calculator@1.0.0/fuel-moisture-calculator.js';

const moisture = FuelMoistureCalculator.calculateFineFuelMoisture(75, 50);
console.log(`Fuel moisture: ${moisture.toFixed(2)}%`);
```

## 📖 API Reference

### calculateFineFuelMoisture(temperature, relativeHumidity)

Calculate fine fuel moisture content (1-hour timelag fuels < 0.25" diameter).

**Parameters:**
- `temperature` (number): Air temperature in degrees Fahrenheit (-50 to 150)
- `relativeHumidity` (number): Relative humidity as percentage (0-100)

**Returns:** (number) Fuel moisture content as percentage

**Example:**
```javascript
const moisture = FuelMoistureCalculator.calculateFineFuelMoisture(75, 50);
// Returns: ~8.9
```

### calculate10HourFuelMoisture(temperature, relativeHumidity, shading)

Calculate 10-hour fuel moisture content (0.25-1" diameter).

**Parameters:**
- `temperature` (number): Air temperature in degrees Fahrenheit
- `relativeHumidity` (number): Relative humidity as percentage
- `shading` (number, optional): Shading factor 0-1 (0=full sun, 1=full shade). Default: 0

**Returns:** (number) Fuel moisture content as percentage

**Example:**
```javascript
const moisture = FuelMoistureCalculator.calculate10HourFuelMoisture(75, 50, 0.5);
// Returns: ~9.2
```

### calculate100HourFuelMoisture(temperature, relativeHumidity, previousMoisture)

Calculate 100-hour fuel moisture content (1-3" diameter).

**Parameters:**
- `temperature` (number): Air temperature in degrees Fahrenheit
- `relativeHumidity` (number): Relative humidity as percentage
- `previousMoisture` (number, optional): Previous moisture content for lag calculation (0-100)

**Returns:** (number) Fuel moisture content as percentage

**Example:**
```javascript
const moisture = FuelMoistureCalculator.calculate100HourFuelMoisture(75, 50, 12);
// Returns: ~10.1 (weighted toward previous value)
```

### calculate1000HourFuelMoisture(temperature, relativeHumidity, previousMoisture)

Calculate 1000-hour fuel moisture content (3-8" diameter).

**Parameters:**
- `temperature` (number): Air temperature in degrees Fahrenheit
- `relativeHumidity` (number): Relative humidity as percentage
- `previousMoisture` (number, optional): Previous moisture content for lag calculation (0-100)

**Returns:** (number) Fuel moisture content as percentage

**Example:**
```javascript
const moisture = FuelMoistureCalculator.calculate1000HourFuelMoisture(75, 50, 15);
// Returns: ~11.5 (strongly weighted toward previous value)
```

### calculateAllFuelMoistures(conditions, previous)

Calculate all fuel moisture timelag classes at once.

**Parameters:**
- `conditions` (object): Weather conditions
  - `temperature` (number): Air temperature in °F
  - `relativeHumidity` (number): Relative humidity %
  - `shading` (number, optional): Shading factor 0-1
- `previous` (object, optional): Previous moisture values
  - `hundredHour` (number, optional): Previous 100-hour moisture
  - `thousandHour` (number, optional): Previous 1000-hour moisture

**Returns:** (object) Moisture content for all timelag classes
- `oneHour` (number): 1-hour fuel moisture %
- `tenHour` (number): 10-hour fuel moisture %
- `hundredHour` (number): 100-hour fuel moisture %
- `thousandHour` (number): 1000-hour fuel moisture %

**Example:**
```javascript
const moistures = FuelMoistureCalculator.calculateAllFuelMoistures(
    { temperature: 75, relativeHumidity: 50, shading: 0.5 },
    { hundredHour: 12, thousandHour: 15 }
);
```

### celsiusToFahrenheit(celsius)

Convert temperature from Celsius to Fahrenheit.

**Parameters:**
- `celsius` (number): Temperature in Celsius

**Returns:** (number) Temperature in Fahrenheit

### fahrenheitToCelsius(fahrenheit)

Convert temperature from Fahrenheit to Celsius.

**Parameters:**
- `fahrenheit` (number): Temperature in Fahrenheit

**Returns:** (number) Temperature in Celsius

## 🔬 Scientific Background

This library implements Nelson's fuel moisture model (2000), which calculates equilibrium moisture content (EMC) for dead fuels based on temperature and relative humidity. The model uses different equations for different humidity ranges and applies temperature correction factors.

**Fuel Timelag Classes:**

- **1-Hour Fuels**: Fine fuels < 0.25" diameter (grass, needles, small twigs)
- **10-Hour Fuels**: 0.25-1" diameter (small branches)
- **100-Hour Fuels**: 1-3" diameter (medium branches)
- **1000-Hour Fuels**: 3-8" diameter (logs, large branches)

The timelag represents the time required for the fuel to lose or gain approximately 63% of the difference between its current moisture content and the equilibrium moisture content.

## 🧪 Testing

Run the test suite:

```bash
# Node.js
npm test

# Deno
deno run --allow-read test/test.js

# Bun
bun test/test.js
```

## 📚 Examples

Check the `examples/` directory for complete working examples:

- `browser-example.html` - Interactive web interface
- `node-example.js` - Node.js usage examples
- `deno-example.js` - Deno usage examples
- `bun-example.js` - Bun usage examples

## 🛡️ Error Handling

The library performs comprehensive input validation:

```javascript
try {
    const moisture = FuelMoistureCalculator.calculateFineFuelMoisture('invalid', 50);
} catch (error) {
    console.error(error.message);
    // "temperature must be a finite number, got string: invalid"
}

try {
    const moisture = FuelMoistureCalculator.calculateFineFuelMoisture(75, 150);
} catch (error) {
    console.error(error.message);
    // "relativeHumidity must be between 0 and 100, got 150"
}
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👤 Author

James D. Cochran

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/jamesdcochran-oss/fuel-moisture-calculator/issues).

## 📦 Package Size

- **Minified**: ~4KB
- **Gzipped**: ~1.5KB
- **Zero dependencies**

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/fuel-moisture-calculator)
- [GitHub Repository](https://github.com/jamesdcochran-oss/fuel-moisture-calculator)
- [Issue Tracker](https://github.com/jamesdcochran-oss/fuel-moisture-calculator/issues)

## ⭐ References

Nelson, R.M., Jr. 2000. Prediction of diurnal change in 10-h fuel stick moisture content. Canadian Journal of Forest Research 30: 1071-1087.
