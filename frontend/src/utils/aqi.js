/**
 * AQI (Air Quality Index) Utilities
 *
 * The visual DNA of Lighthouse - transforming numbers into colors,
 * categories into meaning, data into understanding.
 *
 * Based on EPA Air Quality Index standards.
 * Every color tells a story about the air we breathe.
 */

// AQI Level Definitions - EPA Standard
export const AQI_LEVELS = {
  GOOD: {
    min: 0,
    max: 50,
    color: '#38ef7d',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    label: 'Good',
    description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
  },
  MODERATE: {
    min: 51,
    max: 100,
    color: '#fddb3a',
    gradient: 'linear-gradient(135deg, #f7b733 0%, #fddb3a 100%)',
    label: 'Moderate',
    description: 'Air quality is acceptable. However, there may be a risk for some people.',
  },
  UNHEALTHY_SENSITIVE: {
    min: 101,
    max: 150,
    color: '#ff7b54',
    gradient: 'linear-gradient(135deg, #ff6a00 0%, #ff7b54 100%)',
    label: 'Unhealthy for Sensitive Groups',
    description: 'Members of sensitive groups may experience health effects.',
  },
  UNHEALTHY: {
    min: 151,
    max: 200,
    color: '#d63447',
    gradient: 'linear-gradient(135deg, #c71b26 0%, #d63447 100%)',
    label: 'Unhealthy',
    description: 'Some members of the general public may experience health effects.',
  },
  VERY_UNHEALTHY: {
    min: 201,
    max: 300,
    color: '#8b2e3f',
    gradient: 'linear-gradient(135deg, #6a1b30 0%, #8b2e3f 100%)',
    label: 'Very Unhealthy',
    description: 'Health alert: The risk of health effects is increased for everyone.',
  },
  HAZARDOUS: {
    min: 301,
    max: 500,
    color: '#4a0e0e',
    gradient: 'linear-gradient(135deg, #2a0505 0%, #4a0e0e 100%)',
    label: 'Hazardous',
    description: 'Health warning of emergency conditions: everyone is more likely to be affected.',
  },
};

/**
 * Get AQI level object based on AQI value
 * Like a prism separating light into its spectrum
 *
 * @param {number} aqi - Air Quality Index value (0-500+)
 * @returns {Object} AQI level object with color, label, description
 */
export const getAQILevel = (aqi) => {
  if (aqi <= 50) return AQI_LEVELS.GOOD;
  if (aqi <= 100) return AQI_LEVELS.MODERATE;
  if (aqi <= 150) return AQI_LEVELS.UNHEALTHY_SENSITIVE;
  if (aqi <= 200) return AQI_LEVELS.UNHEALTHY;
  if (aqi <= 300) return AQI_LEVELS.VERY_UNHEALTHY;
  return AQI_LEVELS.HAZARDOUS;
};

/**
 * Get color for a given AQI value
 * The heart of our visual language
 *
 * @param {number} aqi - Air Quality Index value
 * @returns {string} Hex color code
 */
export const getAQIColor = (aqi) => {
  return getAQILevel(aqi).color;
};

/**
 * Get gradient for a given AQI value
 * Smooth, cinematic color transitions
 *
 * @param {number} aqi - Air Quality Index value
 * @returns {string} CSS gradient string
 */
export const getAQIGradient = (aqi) => {
  return getAQILevel(aqi).gradient;
};

/**
 * Get label for a given AQI value
 * Transform numbers into words people understand
 *
 * @param {number} aqi - Air Quality Index value
 * @returns {string} Human-readable category label
 */
export const getAQILabel = (aqi) => {
  return getAQILevel(aqi).label;
};

/**
 * Get description for a given AQI value
 * The story behind the number
 *
 * @param {number} aqi - Air Quality Index value
 * @returns {string} Health impact description
 */
export const getAQIDescription = (aqi) => {
  return getAQILevel(aqi).description;
};

/**
 * Get severity level for alerts (minimal, low, moderate, high, severe)
 * Used for alert indicators and priority ranking
 *
 * @param {number} aqi - Air Quality Index value
 * @returns {string} Severity level
 */
export const getAQISeverity = (aqi) => {
  if (aqi <= 50) return 'minimal';
  if (aqi <= 100) return 'low';
  if (aqi <= 150) return 'moderate';
  if (aqi <= 200) return 'high';
  return 'severe';
};

/**
 * Get emoji indicator for AQI level
 * A touch of humanity in the data
 *
 * @param {number} aqi - Air Quality Index value
 * @returns {string} Emoji
 */
export const getAQIEmoji = (aqi) => {
  if (aqi <= 50) return '😊';
  if (aqi <= 100) return '😐';
  if (aqi <= 150) return '😷';
  if (aqi <= 200) return '😨';
  if (aqi <= 300) return '☠️';
  return '💀';
};

/**
 * Format AQI value for display
 * Rounds to nearest integer, handles edge cases
 *
 * @param {number} aqi - Air Quality Index value
 * @returns {number} Formatted AQI
 */
export const formatAQI = (aqi) => {
  if (aqi === null || aqi === undefined || isNaN(aqi)) return 0;
  return Math.round(aqi);
};

/**
 * Get health recommendation based on AQI
 * What should people actually DO with this information?
 *
 * @param {number} aqi - Air Quality Index value
 * @returns {string} Actionable health recommendation
 */
export const getHealthRecommendation = (aqi) => {
  if (aqi <= 50) {
    return 'Enjoy outdoor activities!';
  } else if (aqi <= 100) {
    return 'Unusually sensitive people should consider reducing prolonged outdoor exertion.';
  } else if (aqi <= 150) {
    return 'Sensitive groups should reduce prolonged outdoor exertion.';
  } else if (aqi <= 200) {
    return 'Everyone should reduce prolonged outdoor exertion.';
  } else if (aqi <= 300) {
    return 'Everyone should avoid prolonged outdoor exertion. Sensitive groups should remain indoors.';
  } else {
    return 'Everyone should avoid all outdoor exertion. Stay indoors with air filtration.';
  }
};

/**
 * Calculate percentage through AQI range
 * For progress bars and visual indicators
 *
 * @param {number} aqi - Air Quality Index value
 * @param {number} max - Maximum AQI to display (default 300)
 * @returns {number} Percentage (0-100)
 */
export const getAQIPercentage = (aqi, max = 300) => {
  return Math.min(100, Math.max(0, (aqi / max) * 100));
};

/**
 * Determine if AQI is trending up or down
 * Based on comparison with historical data
 *
 * @param {number} current - Current AQI
 * @param {number} previous - Previous AQI
 * @returns {string} 'improving', 'deteriorating', or 'stable'
 */
export const getAQITrend = (current, previous) => {
  const diff = current - previous;
  if (diff < -5) return 'improving';
  if (diff > 5) return 'deteriorating';
  return 'stable';
};

/**
 * Get trend icon
 *
 * @param {string} trend - 'improving', 'deteriorating', or 'stable'
 * @returns {string} Arrow icon
 */
export const getTrendIcon = (trend) => {
  if (trend === 'improving') return '↓';
  if (trend === 'deteriorating') return '↑';
  return '→';
};

// Alias for compatibility with components
export const getAQICategory = getAQILabel;

export default {
  AQI_LEVELS,
  getAQILevel,
  getAQIColor,
  getAQIGradient,
  getAQILabel,
  getAQICategory,
  getAQIDescription,
  getAQISeverity,
  getAQIEmoji,
  formatAQI,
  getHealthRecommendation,
  getAQIPercentage,
  getAQITrend,
  getTrendIcon,
};
