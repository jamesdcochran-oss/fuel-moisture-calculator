# Five Forks Fire Weather Dashboard

A comprehensive fire weather monitoring and analysis dashboard integrating fire behavior calculations, fuel moisture modeling, and real-time weather data visualization.

## Overview

The Five Forks Fire Weather Dashboard is a single-page web application that provides:

- **Fire Behavior Analysis**: Calculate rate of spread, fireline intensity, and flame length
- **Fuel Moisture Modeling**: Track fuel moisture changes across different timelag classes
- **Weather Forecasting**: Display NOAA weather forecasts for regional counties
- **Fire Mapping**: Visualize NASA FIRMS hotspots and county boundaries

## Files

- `five-forks-fire-weather-dashboard.html` - Complete dashboard application
- `browser-example.html` - Simple fuel moisture calculator example
- `node-example.js` - Node.js usage example
- `deno-example.js` - Deno usage example
- `bun-example.js` - Bun usage example

## Usage

### Running the Dashboard

1. **Local File System** (with local server):
   ```bash
   # From the examples directory
   python3 -m http.server 8000
   # Then open http://localhost:8000/five-forks-fire-weather-dashboard.html
   ```

2. **Direct Browser Opening**:
   Simply open `five-forks-fire-weather-dashboard.html` in a modern web browser.

## Features

### 🔥 Fire Behavior Calculator

Calculate fire behavior metrics using simplified Rothermel equations:

- **Rate of Spread (R.O.S.)**: Speed of fire advancement in chains/hour and feet/hour
- **Fireline Intensity**: Energy release rate in BTU/ft/sec
- **Flame Length**: Expected flame height in feet using Byram's equation
- **Weighted Fuel Moisture**: Combined moisture across fuel classes

**Supported Fuel Models:**
1. Short Grass (1 ft)
2. Timber Grass (1 ft)
3. Tall Grass (2.5 ft)
4. Chaparral (6 ft)
5. Brush (2 ft)
6. Dormant Brush (2.5 ft)
7. Southern Rough

**Inputs:**
- Fuel model selection
- Wind speed (mph)
- Slope percentage
- 1-hour, 10-hour, and 100-hour fuel moisture

**Critical Thresholds:**
- 1-hour fuel moisture ≤ 6%: Critical fire conditions
- Flame length > 8 feet: Direct attack may not be possible

### 💧 Fuel Moisture Calculator

Uses the `FuelMoistureCalculator` library to model fuel moisture dynamics:

- **EMC Calculation**: Equilibrium Moisture Content from temperature and humidity
- **Time-Lag Modeling**: Exponential drying/wetting for different fuel classes
- **1-Hour Fuels**: Fast response (< 0.25" diameter)
- **10-Hour Fuels**: Moderate response (0.25-1" diameter)
- **100-Hour Fuels**: Slow response (1-3" diameter)

**Automatic Integration**: Calculated fuel moisture values automatically update the Fire Behavior Calculator inputs.

### 🌤️ NOAA Weather Forecast

Interactive weather forecast display for regional counties:

**Monitored Counties:**
- Greensville County, VA
- Brunswick County, VA
- Mecklenburg County, VA
- Southampton County, VA

**Forecast Data:**
- High/Low temperatures
- Relative humidity
- Wind speed
- Weather conditions
- Calculated EMC for each day

**Critical Alerts**: Automatically identifies days with critical fire weather conditions (EMC ≤ 5%).

### 🗺️ Interactive Fire Map

Visual representation of fire activity and geographic features:

**Map Elements:**
- **NASA FIRMS Hotspots**: Fire detection data with confidence and temperature
- **County Boundaries**: Greensville County visualization
- **Weather Stations**: Five Forks station marker
- **Interactive Popups**: Click markers for detailed information

**Data Sources** (production-ready structure):
- NASA FIRMS API: `https://firms.modaps.eosdis.nasa.gov/api/`
- NOAA Weather API: County-based forecasts
- OpenStreetMap tiles: Base map imagery

## Technical Details

### Fire Behavior Calculations

The dashboard implements simplified versions of:

1. **Rothermel's Rate of Spread Model**:
   - Moisture damping coefficient
   - Wind factor (power law relationship)
   - Slope factor
   - Fuel-specific parameters (load, SAVR, depth)

2. **Fireline Intensity** (Byram):
   ```
   I = h × w × r / 60
   ```
   Where: h = heat content, w = fuel load, r = rate of spread

3. **Flame Length** (Byram):
   ```
   L = 0.45 × I^0.46
   ```

### Fuel Moisture Integration

Leverages the existing `FuelMoistureCalculator` library:

- EMC calculation using empirical approximation
- Exponential time-lag model: `M(t) = EMC + (M₀ - EMC) × e^(-t/τ)`
- Automatic linking between calculators for seamless workflow

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Customization

### Adding Counties

Edit the `fetchWeatherForecast()` function to add more counties:

```javascript
const forecasts = {
    'YourCounty': [
        { day: 'Monday', temp: 85, low: 62, rh: 25, wind: 10, conditions: 'Sunny' },
        // ... more days
    ]
};
```

### Modifying Fuel Models

Add custom fuel models in the `FireBehavior` class:

```javascript
this.fuelModels = {
    8: { load: 1.5, savr: 2000, depth: 0.2, heat: 8000, name: "Custom Model" }
};
```

### Connecting Real APIs

Replace simulated data with actual API calls:

```javascript
// Example NOAA API integration
async function fetchWeatherForecast(county) {
    const response = await fetch(`https://api.weather.gov/...`);
    const data = await response.json();
    // Process and display data
}
```

## License

This dashboard is part of the `fuel-moisture-calculator` package, licensed under MIT.

## Author

James D. Cochran

## Acknowledgments

- Fuel moisture calculations based on empirical fire weather models
- Fire behavior equations from Rothermel and Byram
- NASA FIRMS for fire hotspot data
- NOAA for weather forecast data
