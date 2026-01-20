/**
 * Fuel Moisture Calculator
 * 
 * A comprehensive library for calculating fuel moisture content using EMC and time-lag models
 * for fire weather forecasting. Supports browser, Node.js, Deno, and Bun environments.
 * 
 * @module fuel-moisture-calculator
 */

'use strict';

/**
 * Computes Equilibrium Moisture Content (EMC) based on temperature and relative humidity.
 * Uses empirical approximation formulas from fire weather forecasting standards.
 * 
 * @param {number} tempF - Temperature in Fahrenheit
 * @param {number} rh - Relative humidity in percentage (0-100)
 * @returns {number} EMC value as percentage with one decimal place
 * @throws {TypeError} If inputs are not finite numbers
 */
function computeEMC(tempF, rh) {
  const T = Number(tempF);
  const RH_raw = Number(rh);
  
  if (!isFinite(T) || !isFinite(RH_raw)) {
    throw new TypeError('Temperature and humidity must be finite numbers');
  }
  
  const RH = Math.max(0, Math.min(100, RH_raw));
  // Empirical EMC approximation based on NFDRS formulas
  // Separate calculations for different humidity ranges
  let emc;
  
  if (RH < 10) {
    emc = 0.03 + 0.2626 * RH - 0.00104 * RH * T;
  } else if (RH <= 50) {
    emc = 2.22 + 0.160 * RH - 0.01 * T;
  } else {
    emc = 21.06 - 0.4944 * (100 - RH) + 0.005565 * (100 - RH) * (100 - RH) - 0.00035 * (100 - RH) * T;
  }
  
  // Ensure EMC is non-negative and return with one decimal place
  return Math.max(0, parseFloat(emc.toFixed(1)));
}

/**
 * Calculates new fuel moisture after a time period using exponential time-lag model.
 * Models the drying or wetting behavior of different fuel classes.
 * 
 * @param {number} initial - Initial moisture content (%)
 * @param {number} emc - Equilibrium moisture content target (%)
 * @param {number} hours - Time period in hours
 * @param {number} timeLag - Fuel time-lag class in hours (1, 10, 100, or 1000)
 * @returns {number} New moisture content as percentage with one decimal place
 * @throws {TypeError} If inputs are not finite numbers or timeLag is invalid
 */
function stepMoisture(initial, emc, hours, timeLag) {
  const M0 = Number(initial);
  const EMC = Number(emc);
  const t = Number(hours);
  const tau = Number(timeLag);
  
  if (!isFinite(M0) || !isFinite(EMC) || !isFinite(t) || !isFinite(tau)) {
    throw new TypeError('All parameters must be finite numbers');
  }
  
  if (tau <= 0) {
    throw new TypeError('Time-lag must be greater than zero');
  }
  
  // Exponential approach to equilibrium
  // M(t) = EMC + (M0 - EMC) * exp(-t/tau)
  const moisture = EMC + (M0 - EMC) * Math.exp(-t / tau);
  
  return parseFloat(moisture.toFixed(1));
}

/**
 * Runs multi-day forecast model for 1-hour and 10-hour fuel moisture.
 * Processes daily weather data and tracks moisture evolution over time.
 * 
 * @param {number} initial1hr - Starting 1-hour fuel moisture (%)
 * @param {number} initial10hr - Starting 10-hour fuel moisture (%)
 * @param {Array<Object>} forecastEntries - Array of forecast periods
 * @param {number} forecastEntries[].temp - Temperature in Fahrenheit
 * @param {number} forecastEntries[].rh - Relative humidity (%)
 * @param {number} forecastEntries[].hours - Duration of period in hours
 * @param {string} [forecastEntries[].label] - Optional label for the period
 * @returns {Object} Forecast results with daily values and summary
 */
function runModel(initial1hr, initial10hr, forecastEntries) {
  const M1 = Number(initial1hr);
  const M10 = Number(initial10hr);
  
  if (!isFinite(M1) || !isFinite(M10)) {
    throw new TypeError('Initial moisture values must be finite numbers');
  }
  
  if (!Array.isArray(forecastEntries) || forecastEntries.length === 0) {
    throw new TypeError('Forecast entries must be a non-empty array');
  }
  
  let current1hr = M1;
  let current10hr = M10;
  const dailyResults = [];
  let firstCritical1HrDay = null;
  
  forecastEntries.forEach((entry, index) => {
    const temp = Number(entry.temp);
    const rh = Number(entry.rh);
    const hours = Number(entry.hours);
    
    if (!isFinite(temp) || !isFinite(rh) || !isFinite(hours)) {
      throw new TypeError(`Forecast entry ${index} has invalid values`);
    }
    
    // Compute EMC for this period
    const emc = computeEMC(temp, rh);
    
    // Step moisture forward
    current1hr = stepMoisture(current1hr, emc, hours, 1);
    current10hr = stepMoisture(current10hr, emc, hours, 10);
    
    // Check for critical drying (≤6%)
    if (firstCritical1HrDay === null && current1hr <= 6) {
      firstCritical1HrDay = entry.label || `Day ${index + 1}`;
    }
    
    dailyResults.push({
      day: entry.label || `Day ${index + 1}`,
      temp: temp,
      rh: rh,
      emc: emc,
      moisture1Hr: current1hr,
      moisture10Hr: current10hr,
      wind: entry.wind || null
    });
  });
  
  return {
    initial1hr: M1,
    initial10hr: M10,
    dailyResults: dailyResults,
    summary: {
      firstCritical1HrDay: firstCritical1HrDay,
      final1Hr: current1hr,
      final10Hr: current10hr
    }
  };
}

/**
 * Simulates drying process for multiple fuel classes over a time period.
 * Returns detailed moisture evolution for 1-hour, 10-hour, and 100-hour fuels.
 * 
 * @param {Object} params - Simulation parameters
 * @param {number} params.initial1hr - Starting 1-hour fuel moisture (%)
 * @param {number} params.initial10hr - Starting 10-hour fuel moisture (%)
 * @param {number} params.initial100hr - Starting 100-hour fuel moisture (%)
 * @param {number} params.tempF - Temperature in Fahrenheit
 * @param {number} params.rh - Relative humidity (%)
 * @param {number} params.durationHours - Total simulation duration in hours
 * @param {number} [params.stepHours=1] - Time step for output (default: 1 hour)
 * @returns {Object} Simulation results with time series data
 */
function simulateDrying(params) {
  const {
    initial1hr,
    initial10hr,
    initial100hr,
    tempF,
    rh,
    durationHours,
    stepHours = 1
  } = params;
  
  // Validate inputs
  const M1 = Number(initial1hr);
  const M10 = Number(initial10hr);
  const M100 = Number(initial100hr);
  const T = Number(tempF);
  const RH = Number(rh);
  const duration = Number(durationHours);
  const step = Number(stepHours);
  
  if (!isFinite(M1) || !isFinite(M10) || !isFinite(M100) ||
      !isFinite(T) || !isFinite(RH) || !isFinite(duration) || !isFinite(step)) {
    throw new TypeError('All parameters must be finite numbers');
  }
  
  if (duration <= 0 || step <= 0) {
    throw new TypeError('Duration and step must be positive');
  }
  
  // Compute target EMC
  const emc = computeEMC(T, RH);
  
  // Generate time series
  const timeSeries = [];
  const numSteps = Math.ceil(duration / step);
  
  for (let i = 0; i <= numSteps; i++) {
    const t = i * step;
    if (t > duration) break;
    
    timeSeries.push({
      hour: t,
      moisture1hr: stepMoisture(M1, emc, t, 1),
      moisture10hr: stepMoisture(M10, emc, t, 10),
      moisture100hr: stepMoisture(M100, emc, t, 100),
      emc: emc
    });
  }
  
  return {
    emc: emc,
    timeSeries: timeSeries,
    initial: { moisture1hr: M1, moisture10hr: M10, moisture100hr: M100 },
    final: {
      moisture1hr: timeSeries[timeSeries.length - 1].moisture1hr,
      moisture10hr: timeSeries[timeSeries.length - 1].moisture10hr,
      moisture100hr: timeSeries[timeSeries.length - 1].moisture100hr
    }
  };
}

/**
 * Analyzes drying patterns and identifies critical periods.
 * Provides insights on drying rates, critical thresholds, and recovery times.
 * 
 * @param {Array<Object>} moistureData - Time series moisture data
 * @param {number} moistureData[].hour - Hour of measurement
 * @param {number} moistureData[].moisture1hr - 1-hour fuel moisture
 * @param {number} moistureData[].moisture10hr - 10-hour fuel moisture
 * @param {number} [criticalThreshold=6] - Critical moisture threshold (%)
 * @returns {Object} Analysis results with patterns and critical periods
 */
function analyzeDryingPattern(moistureData, criticalThreshold = 6) {
  if (!Array.isArray(moistureData) || moistureData.length === 0) {
    throw new TypeError('Moisture data must be a non-empty array');
  }
  
  const threshold = Number(criticalThreshold);
  if (!isFinite(threshold)) {
    throw new TypeError('Critical threshold must be a finite number');
  }
  
  const analysis = {
    criticalPeriods: [],
    dryingRates: {
      fuel1hr: { avg: 0, max: 0, min: 0 },
      fuel10hr: { avg: 0, max: 0, min: 0 }
    },
    thresholdCrossings: {
      fuel1hr: null,
      fuel10hr: null
    }
  };
  
  // Calculate drying rates
  const rates1hr = [];
  const rates10hr = [];
  
  for (let i = 1; i < moistureData.length; i++) {
    const dt = moistureData[i].hour - moistureData[i - 1].hour;
    if (dt > 0) {
      const rate1hr = (moistureData[i].moisture1hr - moistureData[i - 1].moisture1hr) / dt;
      const rate10hr = (moistureData[i].moisture10hr - moistureData[i - 1].moisture10hr) / dt;
      rates1hr.push(rate1hr);
      rates10hr.push(rate10hr);
    }
  }
  
  // Compute rate statistics
  if (rates1hr.length > 0) {
    analysis.dryingRates.fuel1hr.avg = parseFloat((rates1hr.reduce((a, b) => a + b, 0) / rates1hr.length).toFixed(3));
    analysis.dryingRates.fuel1hr.max = parseFloat(Math.max(...rates1hr).toFixed(3));
    analysis.dryingRates.fuel1hr.min = parseFloat(Math.min(...rates1hr).toFixed(3));
  }
  
  if (rates10hr.length > 0) {
    analysis.dryingRates.fuel10hr.avg = parseFloat((rates10hr.reduce((a, b) => a + b, 0) / rates10hr.length).toFixed(3));
    analysis.dryingRates.fuel10hr.max = parseFloat(Math.max(...rates10hr).toFixed(3));
    analysis.dryingRates.fuel10hr.min = parseFloat(Math.min(...rates10hr).toFixed(3));
  }
  
  // Find threshold crossings
  for (let i = 0; i < moistureData.length; i++) {
    if (analysis.thresholdCrossings.fuel1hr === null && moistureData[i].moisture1hr <= threshold) {
      analysis.thresholdCrossings.fuel1hr = moistureData[i].hour;
    }
    if (analysis.thresholdCrossings.fuel10hr === null && moistureData[i].moisture10hr <= threshold) {
      analysis.thresholdCrossings.fuel10hr = moistureData[i].hour;
    }
  }
  
  // Identify critical periods
  let inCriticalPeriod = false;
  let periodStart = null;
  
  for (let i = 0; i < moistureData.length; i++) {
    const isCritical = moistureData[i].moisture1hr <= threshold;
    
    if (isCritical && !inCriticalPeriod) {
      inCriticalPeriod = true;
      periodStart = moistureData[i].hour;
    } else if (!isCritical && inCriticalPeriod) {
      analysis.criticalPeriods.push({
        start: periodStart,
        end: moistureData[i - 1].hour,
        duration: moistureData[i - 1].hour - periodStart
      });
      inCriticalPeriod = false;
    }
  }
  
  // Close any open critical period
  if (inCriticalPeriod) {
    analysis.criticalPeriods.push({
      start: periodStart,
      end: moistureData[moistureData.length - 1].hour,
      duration: moistureData[moistureData.length - 1].hour - periodStart
    });
  }
  
  return analysis;
}

/**
 * Converts temperature from Celsius to Fahrenheit.
 * 
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 * @throws {TypeError} If input is not a finite number
 */
function celsiusToFahrenheit(celsius) {
  const C = Number(celsius);
  if (!isFinite(C)) {
    throw new TypeError('Celsius must be a finite number');
  }
  return (C * 9 / 5) + 32;
}

/**
 * Converts temperature from Fahrenheit to Celsius.
 * 
 * @param {number} fahrenheit - Temperature in Fahrenheit
 * @returns {number} Temperature in Celsius
 * @throws {TypeError} If input is not a finite number
 */
function fahrenheitToCelsius(fahrenheit) {
  const F = Number(fahrenheit);
  if (!isFinite(F)) {
    throw new TypeError('Fahrenheit must be a finite number');
  }
  return (F - 32) * 5 / 9;
}

// Legacy function for backward compatibility
const calculateMoisture = (input) => {
  if (!input || typeof input.temperature !== 'number' || typeof input.humidity !== 'number') {
    throw new Error('Invalid input for calculateMoisture');
  }
  return (input.humidity - input.temperature * 0.1).toFixed(2);
};

const someOtherFunction = () => {
  return true;
};

// Universal Module Definition (UMD) pattern for cross-platform support
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node.js/CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else {
    // Browser globals
    root.FuelMoistureCalculator = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return {
    computeEMC,
    stepMoisture,
    runModel,
    simulateDrying,
    analyzeDryingPattern,
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    calculateMoisture,
    someOtherFunction
  };
}));
