// EMC Equation Constants (Nelson's equation for fine dead fuels)
// These coefficients are based on empirical research for fuel moisture equilibrium
const EMC_LOW_RH_COEFFICIENTS = {
    INTERCEPT: 0.03229,
    RH_FACTOR: 0.281073,
    TEMP_RH_FACTOR: 0.000578
};

const EMC_MEDIUM_RH_COEFFICIENTS = {
    INTERCEPT: 2.22749,
    RH_FACTOR: 0.160107,
    TEMP_FACTOR: 0.014784
};

const EMC_HIGH_RH_COEFFICIENTS = {
    INTERCEPT: 21.0606,
    RH_SQUARED_FACTOR: 0.005565,
    TEMP_RH_FACTOR: 0.00035,
    RH_FACTOR: 0.483199
};

// EMC bounds - typical range for fine dead fuels is 0-30%
// Values outside this range are typically measurement errors or extreme conditions
const EMC_MIN_PERCENT = 0;
const EMC_MAX_PERCENT = 30;

// Critical moisture threshold for fire danger (based on NFDRS standards)
const CRITICAL_MOISTURE_THRESHOLD = 6;

/**
 * Computes moisture content based on temperature and relative humidity.
 * @param {Object} input - The input object containing temperature and humidity.
 * @param {number} input.temperature - The temperature in Fahrenheit.
 * @param {number} input.humidity - The relative humidity in percentage.
 * @returns {number} - The calculated moisture content.
 * @throws {Error} - If input is invalid.
 * @note BREAKING CHANGE (v2.0.0): Returns number instead of string for better arithmetic operations
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
    return parseFloat((input.humidity - input.temperature * 0.1).toFixed(2));
};

/**
 * Computes Equilibrium Moisture Content (EMC) based on temperature and relative humidity.
 * Uses Nelson's EMC equation for fine dead fuels.
 * @param {number} temp - Temperature in Fahrenheit
 * @param {number} rh - Relative humidity in percentage (0-100)
 * @returns {number} - EMC in percentage
 */
const computeEMC = (temp, rh) => {
    if (typeof temp !== 'number' || typeof rh !== 'number') {
        throw new Error('Invalid input: temperature and humidity must be numbers');
    }
    
    // Nelson's EMC equation for fine dead fuels
    // Separate equations for humidity ranges based on empirical research
    let emc;
    
    if (rh < 10) {
        // Low humidity: linear approximation
        emc = EMC_LOW_RH_COEFFICIENTS.INTERCEPT + 
              EMC_LOW_RH_COEFFICIENTS.RH_FACTOR * rh - 
              EMC_LOW_RH_COEFFICIENTS.TEMP_RH_FACTOR * rh * temp;
    } else if (rh < 50) {
        // Medium humidity: moderate temperature sensitivity
        emc = EMC_MEDIUM_RH_COEFFICIENTS.INTERCEPT + 
              EMC_MEDIUM_RH_COEFFICIENTS.RH_FACTOR * rh - 
              EMC_MEDIUM_RH_COEFFICIENTS.TEMP_FACTOR * temp;
    } else {
        // High humidity: quadratic relationship with RH
        emc = EMC_HIGH_RH_COEFFICIENTS.INTERCEPT + 
              EMC_HIGH_RH_COEFFICIENTS.RH_SQUARED_FACTOR * rh * rh - 
              EMC_HIGH_RH_COEFFICIENTS.TEMP_RH_FACTOR * rh * temp - 
              EMC_HIGH_RH_COEFFICIENTS.RH_FACTOR * rh;
    }
    
    // Ensure EMC is within reasonable bounds for fine dead fuels
    return Math.max(EMC_MIN_PERCENT, Math.min(EMC_MAX_PERCENT, parseFloat(emc.toFixed(2))));
};

/**
 * Updates fuel moisture content using time-lag model.
 * Uses exponential approach to equilibrium moisture content.
 * @param {number} currentMoisture - Current fuel moisture percentage
 * @param {number} emc - Equilibrium moisture content percentage
 * @param {number} hours - Time period in hours
 * @param {number} timeLag - Time lag constant in hours (1, 10, or 100)
 * @returns {number} - New moisture content percentage
 */
const stepMoisture = (currentMoisture, emc, hours, timeLag) => {
    if (typeof currentMoisture !== 'number' || typeof emc !== 'number' || 
        typeof hours !== 'number' || typeof timeLag !== 'number') {
        throw new Error('Invalid input: all parameters must be numbers');
    }
    
    if (timeLag <= 0) {
        throw new Error('Time lag must be greater than 0');
    }
    
    // Exponential approach: M(t) = EMC + (M0 - EMC) * exp(-t/τ)
    // where τ is the time lag constant
    const newMoisture = emc + (currentMoisture - emc) * Math.exp(-hours / timeLag);
    
    return parseFloat(newMoisture.toFixed(2));
};

/**
 * Simulates drying trends for multiple fuel classes over time.
 * @param {Object} dryingInputs - Input parameters for drying simulation
 * @param {number[]} dryingInputs.tempSeries - Array of temperatures in Fahrenheit
 * @param {number[]} dryingInputs.rhSeries - Array of relative humidity percentages
 * @param {Object} dryingInputs.initialState - Initial moisture states
 * @param {number} dryingInputs.initialState.m1 - Initial 1-hour fuel moisture
 * @param {number} dryingInputs.initialState.m10 - Initial 10-hour fuel moisture
 * @param {number} dryingInputs.initialState.m100 - Initial 100-hour fuel moisture
 * @param {number} dryingInputs.timeStep - Time step in hours (default: 1.0)
 * @returns {Object[]} - Array of moisture trends for each time step
 */
const simulateDrying = (dryingInputs) => {
    if (!dryingInputs || !dryingInputs.tempSeries || !dryingInputs.rhSeries || !dryingInputs.initialState) {
        throw new Error('Invalid input: dryingInputs must contain tempSeries, rhSeries, and initialState');
    }
    
    const { tempSeries, rhSeries, initialState, timeStep = 1.0 } = dryingInputs;
    
    if (tempSeries.length !== rhSeries.length) {
        throw new Error('Temperature and humidity series must have the same length');
    }
    
    const results = [];
    let m1 = initialState.m1 || 0;
    let m10 = initialState.m10 || 0;
    let m100 = initialState.m100 || 0;
    
    for (let i = 0; i < tempSeries.length; i++) {
        const temp = tempSeries[i];
        const rh = rhSeries[i];
        const emc = computeEMC(temp, rh);
        
        // Update each fuel class
        m1 = stepMoisture(m1, emc, timeStep, 1);
        m10 = stepMoisture(m10, emc, timeStep, 10);
        m100 = stepMoisture(m100, emc, timeStep, 100);
        
        results.push({
            step: i + 1,
            temp,
            rh,
            emc,
            m1,
            m10,
            m100
        });
    }
    
    return results;
};

/**
 * Runs a multi-day forecast model for fuel moisture.
 * @param {number} initial1hr - Initial 1-hour fuel moisture percentage
 * @param {number} initial10hr - Initial 10-hour fuel moisture percentage
 * @param {Array} forecast - Array of forecast periods
 * @param {number} forecast[].temp - Temperature in Fahrenheit
 * @param {number} forecast[].rh - Relative humidity percentage
 * @param {number} forecast[].hours - Duration of period in hours
 * @param {string} [forecast[].label] - Optional label for the period
 * @returns {Object} - Forecast results with daily moisture values
 */
const runModel = (initial1hr, initial10hr, forecast) => {
    if (typeof initial1hr !== 'number' || typeof initial10hr !== 'number') {
        throw new Error('Invalid input: initial moisture values must be numbers');
    }
    
    if (!Array.isArray(forecast) || forecast.length === 0) {
        throw new Error('Invalid input: forecast must be a non-empty array');
    }
    
    const dailyResults = [];
    let moisture1Hr = initial1hr;
    let moisture10Hr = initial10hr;
    let firstCritical1HrDay = null;
    
    for (let i = 0; i < forecast.length; i++) {
        const period = forecast[i];
        const { temp, rh, hours, label, wind } = period;
        
        if (typeof temp !== 'number' || typeof rh !== 'number' || typeof hours !== 'number') {
            throw new Error(`Invalid forecast data at index ${i}`);
        }
        
        const emc = computeEMC(temp, rh);
        
        // Update moisture for each fuel class
        moisture1Hr = stepMoisture(moisture1Hr, emc, hours, 1);
        moisture10Hr = stepMoisture(moisture10Hr, emc, hours, 10);
        
        // Check for critical drying (based on NFDRS standards)
        if (moisture1Hr <= CRITICAL_MOISTURE_THRESHOLD && firstCritical1HrDay === null) {
            firstCritical1HrDay = label || `Period ${i + 1}`;
        }
        
        const result = {
            day: label || `Period ${i + 1}`,
            temp,
            rh,
            moisture1Hr,
            moisture10Hr
        };
        
        // Include wind if provided
        if (wind !== undefined) {
            result.wind = wind;
        }
        
        dailyResults.push(result);
    }
    
    return {
        initial1hr,
        initial10hr,
        dailyResults,
        summary: {
            firstCritical1HrDay,
            finalMoisture1Hr: moisture1Hr,
            finalMoisture10Hr: moisture10Hr
        }
    };
};

/**
 * Converts Celsius to Fahrenheit.
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} - Temperature in Fahrenheit
 */
const celsiusToFahrenheit = (celsius) => {
    if (typeof celsius !== 'number') {
        throw new Error('Invalid input: temperature must be a number');
    }
    return (celsius * 9/5) + 32;
};

/**
 * Converts Fahrenheit to Celsius.
 * @param {number} fahrenheit - Temperature in Fahrenheit
 * @returns {number} - Temperature in Celsius
 */
const fahrenheitToCelsius = (fahrenheit) => {
    if (typeof fahrenheit !== 'number') {
        throw new Error('Invalid input: temperature must be a number');
    }
    return (fahrenheit - 32) * 5/9;
};

const someOtherFunction = () => {
  return true;
};

// Export all functions for the test suite
module.exports = { 
    calculateMoisture, 
    computeEMC,
    stepMoisture,
    simulateDrying,
    runModel,
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    someOtherFunction 
};
