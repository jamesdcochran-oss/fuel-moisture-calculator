/**
 * Example: Drying Trend Prediction Feature
 * Run with: node examples/drying-trend-example.js
 * 
 * Demonstrates the predictDryingTrend function which analyzes historical
 * weather data and forecasts future fuel moisture levels.
 */

const FuelMoistureCalculator = require('../fuel-moisture-calculator.js');

console.log('=== Fuel Moisture Drying Trend Prediction ===\n');

// Example 1: Basic 7-day historical + 7-day forecast
console.log('Example 1: 10-hour Fuel with 7-day Historical and Forecast Data\n');

const historicalWeather = [
    { temp: 65, rh: 70, timestamp: '7 days ago' },
    { temp: 68, rh: 65, timestamp: '6 days ago' },
    { temp: 70, rh: 60, timestamp: '5 days ago' },
    { temp: 72, rh: 58, timestamp: '4 days ago' },
    { temp: 75, rh: 55, timestamp: '3 days ago' },
    { temp: 77, rh: 50, timestamp: '2 days ago' },
    { temp: 80, rh: 45, timestamp: '1 day ago' }
];

const predictedWeather = [
    { temp: 82, rh: 40, timestamp: 'Today' },
    { temp: 85, rh: 35, timestamp: 'Tomorrow' },
    { temp: 88, rh: 30, timestamp: 'Day 3' },
    { temp: 90, rh: 28, timestamp: 'Day 4' },
    { temp: 92, rh: 25, timestamp: 'Day 5' },
    { temp: 90, rh: 27, timestamp: 'Day 6' },
    { temp: 88, rh: 30, timestamp: 'Day 7' }
];

const result1 = FuelMoistureCalculator.predictDryingTrend({
    currentMoisture: 15,
    historicalWeather: historicalWeather,
    predictedWeather: predictedWeather,
    timeLag: 10
});

console.log('Metadata:');
console.log(`  Initial Moisture: ${result1.metadata.initialMoisture}%`);
console.log(`  Time Lag: ${result1.metadata.timeLag} hours`);
console.log(`  Resolution: ${result1.metadata.resolution}`);
console.log(`  Critical Threshold: ${result1.metadata.criticalThreshold}%\n`);

console.log('Summary:');
console.log(`  Starting Moisture: ${result1.summary.startingMoisture}%`);
console.log(`  Ending Moisture: ${result1.summary.endingMoisture}%`);
console.log(`  Total Change: ${result1.summary.moistureChange}%`);
console.log(`  Critical Time: ${result1.summary.criticalTime || 'Not reached'}`);
console.log(`  Below Critical: ${result1.summary.belowCritical ? 'Yes ⚠️' : 'No'}`);
console.log(`  Min Moisture: ${result1.summary.minMoisture}%`);
console.log(`  Max Moisture: ${result1.summary.maxMoisture}%\n`);

console.log('Forecast Trend (last 5 periods):');
result1.trend.slice(-5).forEach(period => {
    const indicator = period.type === 'forecast' ? '→' : '←';
    console.log(`  ${indicator} ${period.period}: ${period.temp}°F, ${period.rh}% RH → ${period.moisture}% moisture`);
});

// Example 2: With wind speed data
console.log('\n\nExample 2: 1-hour Fuel with Wind Speed Data\n');

const historicalWithWind = [
    { temp: 70, rh: 60, wind: 5 },
    { temp: 72, rh: 58, wind: 8 },
    { temp: 75, rh: 55, wind: 10 }
];

const forecastWithWind = [
    { temp: 78, rh: 50, wind: 12 },
    { temp: 80, rh: 45, wind: 15 },
    { temp: 85, rh: 40, wind: 20 },
    { temp: 88, rh: 35, wind: 25 }
];

const result2 = FuelMoistureCalculator.predictDryingTrend({
    currentMoisture: 12,
    historicalWeather: historicalWithWind,
    predictedWeather: forecastWithWind,
    timeLag: 1
});

console.log('Wind Effect on 1-hour Fuel:');
result2.trend.forEach((period, idx) => {
    if (period.wind) {
        console.log(`  Period ${idx + 1}: Wind ${period.wind} mph → Moisture ${period.moisture}%`);
    }
});

if (result2.summary.criticalTime) {
    console.log(`\n  ⚠️  Critical moisture (≤6%) reached at: ${result2.summary.criticalTime}`);
}

// Example 3: Interpolation of missing data
console.log('\n\nExample 3: Handling Missing Historical Data with Interpolation\n');

const historicalWithGaps = [
    { temp: 70, rh: 60 },
    { temp: null, rh: null },  // Missing data
    { temp: 80, rh: 50 },
    { temp: null, rh: null },  // Missing data
    { temp: 85, rh: 45 }
];

const forecast3 = [
    { temp: 88, rh: 40 },
    { temp: 90, rh: 35 }
];

const result3 = FuelMoistureCalculator.predictDryingTrend({
    currentMoisture: 14,
    historicalWeather: historicalWithGaps,
    predictedWeather: forecast3,
    timeLag: 10
}, { interpolateMissing: true });

console.log('Interpolated Historical Data:');
result3.trend.filter(p => p.type === 'historical').forEach((period, idx) => {
    console.log(`  Day ${idx + 1}: ${period.temp}°F, ${period.rh}% RH → ${period.moisture}% moisture`);
});

// Example 4: 100-hour fuel (slow drying)
console.log('\n\nExample 4: 100-hour Fuel (Slow Drying Over Extended Period)\n');

const forecast4 = Array.from({ length: 14 }, (_, i) => ({
    temp: 85 + i,
    rh: Math.max(20, 50 - i * 2),
    timestamp: `Day ${i + 1}`
}));

const result4 = FuelMoistureCalculator.predictDryingTrend({
    currentMoisture: 20,
    historicalWeather: [{ temp: 70, rh: 60 }],
    predictedWeather: forecast4,
    timeLag: 100
});

console.log('14-Day Forecast for 100-hour Fuel:');
console.log(`  Initial: ${result4.summary.startingMoisture}%`);
console.log(`  Final: ${result4.summary.endingMoisture}%`);
console.log(`  Change: ${result4.summary.moistureChange}%`);
console.log(`  Critical time: ${result4.summary.criticalTime || 'Not reached in forecast period'}\n`);

console.log('=== Examples Complete ===');
