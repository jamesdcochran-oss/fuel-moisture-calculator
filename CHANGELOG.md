# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-19

### Added
- **🆕 Drying Trend Prediction Feature** - Major new capability for forecasting fuel moisture
  - `predictDryingTrend()` function for extended period moisture forecasting
  - Analyzes historical weather data (7+ days) to establish baseline trends
  - Predicts future moisture based on weather forecasts
  - Detects critical drying periods when moisture drops below 6% (configurable)
  - Returns comprehensive JSON structure with hourly/daily moisture values
  - Optimized for large datasets (100+ periods)
- **Wind Speed Support** - Optional wind data dynamically affects drying rates
  - Wind reduces effective time lag (faster drying in higher winds)
  - Simplified model: up to 20% faster drying at 30 mph winds
  - Integrated into `predictDryingTrend()` function
- **Interpolation for Missing Data** - `interpolateWeatherData()` function
  - Linear interpolation for missing temperature values
  - Linear interpolation for missing humidity values
  - Handles multiple consecutive missing values
  - Handles missing data at array boundaries
  - Enabled by default in `predictDryingTrend()` (can be disabled)
- Comprehensive test suite for new features (29 passing tests)
- New example file: `examples/drying-trend-example.js`
- Performance optimization for large datasets
- Additional validation and error handling

### Changed
- Fixed `calculateMoisture()` to return number instead of string
- Improved `computeEMC()` input validation to check for Infinity before clamping
- Added Jest as dev dependency for testing
- Added coverage directory to .gitignore

### Technical Details
- Uses exponential decay model: M(t) = Me + (M0 - Me) * e^(-t/tau)
- Supports all fuel time lag classes (1-hour, 10-hour, 100-hour, etc.)
- Configurable output resolution (hourly or daily)
- Configurable critical moisture threshold
- Maintains backward compatibility with all existing functions

## [1.0.0] - 2026-01-17

### Added
- Initial release of fuel-moisture-calculator
- Core fuel moisture calculation functions:
  - `computeEMC(tempF, rh)` - Equilibrium moisture content calculation
  - `stepMoisture(initial, emc, hours, timeLag)` - Time-lag drying/wetting model
  - `runModel(initial1hr, initial10hr, forecastEntries)` - Multi-day forecast processing
- Temperature conversion utilities:
  - `celsiusToFahrenheit(celsius)`
  - `fahrenheitToCelsius(fahrenheit)`
- Universal module support (UMD pattern)
  - Browser compatibility
  - Node.js/CommonJS support
  - Deno support
  - Bun support
- Comprehensive input validation
  - Type checking (TypeError for invalid values)
  - Automatic conversion of string inputs to numbers
  - Relative humidity clamping to 0-100 range
- Defensive programming throughout
- Zero external dependencies
- Complete test suite (51 tests)
- GitHub Actions CI/CD workflow
- Examples for all platforms:
  - Browser example (HTML/JavaScript)
  - Node.js example
  - Deno example
  - Bun example
- Comprehensive documentation
  - README with full API reference
  - CONTRIBUTING guide with coding standards
  - Code examples
  - Scientific background
- MIT License
- Optional browser DOM wiring for interactive UIs

### Features
- Based on empirical EMC approximation used in fire weather tools
- Handles 1-hour and 10-hour fuel timelag classes
- Exponential time-lag model for moisture adjustment
- Critical drying detection (≤6% moisture threshold)
- Temperature range: All valid finite numbers
- Humidity range: 0-100% (automatically clamped)
- Results with one decimal place precision
- Production-ready and thoroughly tested

[1.1.0]: https://github.com/jamesdcochran-oss/fuel-moisture-calculator/releases/tag/v1.1.0
[1.0.0]: https://github.com/jamesdcochran-oss/fuel-moisture-calculator/releases/tag/v1.0.0
