# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.0.0]: https://github.com/jamesdcochran-oss/fuel-moisture-calculator/releases/tag/v1.0.0
