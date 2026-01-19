# Fuel Moisture Calculator

A robust JavaScript library for calculating fuel moisture content using EMC and time-lag models for fire weather forecasting. This package helps determine moisture levels in fuel components, essential for wildfire risk assessment and fire behavior prediction.

## Features

- **Equilibrium Moisture Content (EMC)** calculation based on temperature and humidity
- **Time-lag drying/wetting model** for fuel moisture changes over time
- **Multi-day forecast processing** for 1-hour and 10-hour fuel classes
- **🆕 Drying Trend Prediction** - Predict fuel moisture trends over extended periods
- **Temperature conversion utilities** (Celsius ↔ Fahrenheit)
- **Zero external dependencies** - lightweight and portable
- **Universal module support** - Works in Node.js, Deno, Bun, and browsers
- **Comprehensive validation** - Defensive programming throughout
- **Performance optimized** - Efficient calculations for large datasets

## Table of Contents
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [Core Functions](#core-functions)
  - [Drying Trend Prediction](#drying-trend-prediction)
  - [Multi-Day Forecast](#multi-day-forecast)
  - [Temperature Conversion](#temperature-conversion)
- [Examples](#examples)
- [Contributing](#contributing)

## Installation

To install the package, use npm:

```bash
npm install fuel-moisture-calculator
```

## Quick Start

After installing, require the package in your JavaScript file:

```javascript
const FuelMoistureCalculator = require('fuel-moisture-calculator');

// Calculate equilibrium moisture content
const emc = FuelMoistureCalculator.computeEMC(75, 50);
console.log(`EMC: ${emc}%`); // EMC: 11.9%

// Calculate moisture change over time
const newMoisture = FuelMoistureCalculator.stepMoisture(12, 8, 12, 10);
console.log(`New moisture: ${newMoisture}%`); // New moisture: 9.2%
```

## API Reference

### Core Functions

#### `computeEMC(tempF, rh)`

Computes Equilibrium Moisture Content (EMC) based on temperature and relative humidity.

**Parameters:**
- `tempF` (number): Temperature in Fahrenheit
- `rh` (number): Relative humidity (0-100%)

**Returns:** (number) Equilibrium moisture content as a percentage (1 decimal place)

**Example:**
```javascript
const emc = computeEMC(75, 50);
console.log(emc); // 11.9
```

#### `stepMoisture(initial, emc, hours, timeLag)`

Calculate new fuel moisture using exponential time-lag model.

**Parameters:**
- `initial` (number): Current fuel moisture (%)
- `emc` (number): Equilibrium moisture content (%)
- `hours` (number): Time period in hours
- `timeLag` (number): Fuel time lag constant in hours (1, 10, 100, etc.)

**Returns:** (number) New fuel moisture content (%) with 1 decimal place

**Example:**
```javascript
const newMoisture = stepMoisture(12, 8, 12, 10);
console.log(newMoisture); // 9.2
```

### Drying Trend Prediction

#### `predictDryingTrend(params, options)`

🆕 **NEW FEATURE** - Predicts drying trends over an extended period based on weather simulations and historical data. Uses an exponential decay model to forecast fuel moisture changes and identifies critical drying periods.

**Parameters:**

`params` (Object):
- `currentMoisture` (number): Starting fuel moisture as a percentage (0-100)
- `historicalWeather` (Array<Object>): Past weather data
  - `temp` (number): Temperature in Fahrenheit
  - `rh` (number): Relative humidity (%)
  - `wind` (number, optional): Wind speed in mph
  - `timestamp` (string, optional): Label for the period
- `predictedWeather` (Array<Object>): Forecasted weather data (same structure as historicalWeather)
- `timeLag` (number): Time lag class in hours (1, 10, 100, etc.)

`options` (Object, optional):
- `resolution` (string): 'hourly' or 'daily' (default: 'daily')
- `interpolateMissing` (boolean): Interpolate missing historical data (default: true)
- `criticalThreshold` (number): Critical moisture threshold % (default: 6)

**Returns:** (Object)
- `metadata`: Configuration and input summary
- `trend`: Array of all periods with moisture values
- `summary`: Key metrics including critical time detection

**Example:**
```javascript
const result = predictDryingTrend({
    currentMoisture: 15,
    historicalWeather: [
        { temp: 70, rh: 60 },
        { temp: 75, rh: 55 }
    ],
    predictedWeather: [
        { temp: 80, rh: 50 },
        { temp: 85, rh: 45 },
        { temp: 90, rh: 40 }
    ],
    timeLag: 10
});

console.log(result.summary.criticalTime); // "Forecast Day 3"
console.log(result.summary.endingMoisture); // 7.5
```

**Key Features:**
- ✅ Analyzes historical trends to establish baseline
- ✅ Forecasts future moisture levels based on weather predictions
- ✅ Detects critical drying periods (when moisture drops below threshold)
- ✅ Supports optional wind speed data for enhanced accuracy
- ✅ Automatically interpolates missing historical data
- ✅ Optimized for large datasets (100+ periods)
- ✅ Works with any fuel time lag class (1-hr, 10-hr, 100-hr, etc.)

### Multi-Day Forecast

#### `runModel(initial1hr, initial10hr, forecastEntries)`

Run a multi-day forecast model for fuel moisture, tracking both 1-hour and 10-hour fuel classes.

**Parameters:**
- `initial1hr` (number): Initial 1-hour fuel moisture (%)
- `initial10hr` (number): Initial 10-hour fuel moisture (%)
- `forecastEntries` (Array<Object>): Array of forecast periods
  - `temp` (number): Temperature in Fahrenheit
  - `rh` (number): Relative humidity (%)
  - `hours` (number): Duration in hours
  - `label` (string, optional): Label for the period
  - `wind` (number, optional): Wind speed (preserved in output)

**Returns:** (Object) Results with daily moisture values and summary

**Example:**
```javascript
const forecast = [
    { temp: 75, rh: 50, hours: 12 },
    { temp: 80, rh: 40, hours: 12 }
];

const results = runModel(10, 12, forecast);
console.log(results.summary.firstCritical1HrDay); // When 1-hr fuel drops below 6%
```

### Temperature Conversion

#### `celsiusToFahrenheit(celsius)`
Converts temperature from Celsius to Fahrenheit.

#### `fahrenheitToCelsius(fahrenheit)`
Converts temperature from Fahrenheit to Celsius.

## Examples

### Example 1: Basic EMC Calculation

```javascript
const calculator = require('fuel-moisture-calculator');

const temperature = 80; // °F
const humidity = 40; // %
const emc = calculator.computeEMC(temperature, humidity);
console.log(`EMC: ${emc}%`);
```

### Example 2: Time-Lag Drying Model

```javascript
const initial = 12; // Current moisture %
const emc = 8; // Equilibrium moisture %
const hours = 12; // Time period
const timeLag = 10; // 10-hour fuel

const newMoisture = calculator.stepMoisture(initial, emc, hours, timeLag);
console.log(`Moisture after ${hours} hours: ${newMoisture}%`);
```

### Example 3: Multi-Day Forecast

```javascript
const forecast = [
  { temp: 75, rh: 50, hours: 24, label: 'Monday' },
  { temp: 80, rh: 40, hours: 24, label: 'Tuesday' },
  { temp: 85, rh: 30, hours: 24, label: 'Wednesday' }
];

const results = calculator.runModel(10, 12, forecast);

results.dailyResults.forEach(day => {
  console.log(`${day.day}: 1-hr=${day.moisture1Hr}%, 10-hr=${day.moisture10Hr}%`);
});

if (results.summary.firstCritical1HrDay) {
  console.log(`⚠️ Critical drying on: ${results.summary.firstCritical1HrDay}`);
}
```

### Example 4: Drying Trend Prediction with Wind

🆕 **NEW**

```javascript
const historicalWeather = [
    { temp: 70, rh: 60, wind: 5 },
    { temp: 75, rh: 55, wind: 8 },
    { temp: 80, rh: 50, wind: 10 }
];

const predictedWeather = [
    { temp: 85, rh: 45, wind: 15 },
    { temp: 90, rh: 40, wind: 20 },
    { temp: 95, rh: 35, wind: 25 }
];

const result = calculator.predictDryingTrend({
    currentMoisture: 15,
    historicalWeather: historicalWeather,
    predictedWeather: predictedWeather,
    timeLag: 10
});

console.log('Drying Trend Summary:');
console.log(`Starting: ${result.summary.startingMoisture}%`);
console.log(`Ending: ${result.summary.endingMoisture}%`);
console.log(`Change: ${result.summary.moistureChange}%`);

if (result.summary.criticalTime) {
    console.log(`⚠️ Critical drying at: ${result.summary.criticalTime}`);
}

// View detailed trend data
result.trend.forEach(period => {
    console.log(`${period.period}: ${period.moisture}% (${period.type})`);
});
```

### Example 5: Handling Missing Data

🆕 **NEW**

```javascript
// Historical data with gaps
const historicalWithGaps = [
    { temp: 70, rh: 60 },
    { temp: null, rh: null },  // Missing data - will be interpolated
    { temp: 80, rh: 50 }
];

const forecast = [
    { temp: 85, rh: 45 },
    { temp: 90, rh: 40 }
];

const result = calculator.predictDryingTrend({
    currentMoisture: 14,
    historicalWeather: historicalWithGaps,
    predictedWeather: forecast,
    timeLag: 10
}, { 
    interpolateMissing: true  // Enable interpolation
});

// Missing data is automatically filled in
console.log(result.trend.map(p => p.temp)); // [70, 75, 80, 85, 90]
```

For more examples, see the [examples](./examples) directory.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and development process.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
