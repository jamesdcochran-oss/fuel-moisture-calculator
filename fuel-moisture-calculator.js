/**
 * Computes moisture content based on temperature and relative humidity.
 * @param {Object} input - The input object containing temperature and humidity.
 * @param {number} input.temperature - The temperature in Fahrenheit.
 * @param {number} input.humidity - The relative humidity in percentage.
 * @returns {number} - The calculated moisture content.
 * @throws {Error} - If input is invalid.
 */
const calculateMoisture = (input) => {
    if (!input || typeof input.temperature !== 'number' || typeof input.humidity !== 'number') {
        throw new Error('Invalid input for calculateMoisture');
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
    // Separate equations for humidity ranges
    let emc;
    
    if (rh < 10) {
        emc = 0.03229 + 0.281073 * rh - 0.000578 * rh * temp;
    } else if (rh < 50) {
        emc = 2.22749 + 0.160107 * rh - 0.014784 * temp;
    } else {
        emc = 21.0606 + 0.005565 * rh * rh - 0.00035 * rh * temp - 0.483199 * rh;
    }
    
    // Ensure EMC is within reasonable bounds (0-30%)
    return Math.max(0, Math.min(30, parseFloat(emc.toFixed(2))));
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
        
        // Check for critical drying (≤6%)
        if (moisture1Hr <= 6 && firstCritical1HrDay === null) {
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

// Ensure other utility functions are tested as well.
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