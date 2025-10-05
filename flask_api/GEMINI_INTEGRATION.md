# Google Gemini AI Integration for Lighthouse API

## Overview

This integration adds intelligent air quality insights powered by Google Gemini AI to the Lighthouse API. The AI analyzes air quality data and provides personalized health recommendations in simple, easy-to-understand language.

## Features

- **Simple Explanations**: Translates technical AQI data into plain language anyone can understand
- **Personalized Health Recommendations**: Specific advice for general public and sensitive groups
- **Contextual Insights**: Explains how weather and time of day affect air quality
- **Actionable Tips**: Practical steps people can take immediately
- **Fallback System**: Provides basic recommendations if AI service is unavailable

## Files Created/Modified

### New Files:
1. **`gemini_service.py`**: Core Gemini AI integration service
2. **`test_gemini.py`**: Test script to verify Gemini integration
3. **`list_models.py`**: Utility to list available Gemini models

### Modified Files:
1. **`app.py`**: Added `/ai-insights` endpoint and imports

## API Endpoint

### `/ai-insights`

Generate AI-powered air quality insights.

**Method**: GET

**Parameters**:
- `lat` (float, optional): Latitude
- `lon` (float, optional): Longitude
- `aqi` (int, optional): Air Quality Index (will be fetched if not provided)
- `city` (string, optional): City name for context

**Example Requests**:
```bash
# Using coordinates (AQI will be fetched automatically)
curl "http://localhost:5000/ai-insights?lat=40.7&lon=-74.0"

# With city name for better context
curl "http://localhost:5000/ai-insights?lat=40.7&lon=-74.0&city=New%20York"

# With specific AQI value
curl "http://localhost:5000/ai-insights?lat=40.7&lon=-74.0&aqi=85"
```

**Response Structure**:
```json
{
  "success": true,
  "insights": {
    "summary": "Plain language explanation of air quality...",
    "health_recommendations": [
      "Specific health advice...",
      "Mask recommendations...",
      "Activity suggestions..."
    ],
    "contextual_insights": [
      "Weather impact on air quality...",
      "Time of day considerations..."
    ],
    "actionable_tips": [
      "Immediate steps to take...",
      "Preventive measures..."
    ],
    "full_response": "Complete AI response text"
  },
  "ai_model": "Google Gemini 2.5 Flash",
  "location": {
    "lat": 40.7,
    "lon": -74.0,
    "name": "New York City, NY"
  },
  "context": {
    "aqi": 85,
    "breath_score": 78,
    "category": "Moderate"
  },
  "timestamp": "2025-10-04T12:00:00Z"
}
```

## Configuration

The API key is configured in `gemini_service.py`:

```python
GEMINI_API_KEY = "AIzaSyBaSA-1bFG_4rxW3eh3O9Mteq6w6Xz4sqs"
```

**Model Used**: `gemini-2.5-flash` (stable, fast, and reliable)

## Testing

Run the test script to verify the integration:

```bash
python3 test_gemini.py
```

This will:
1. Test Gemini API connectivity
2. Generate sample insights for New York City
3. Display formatted results

## How It Works

1. **Data Collection**: Endpoint gathers AQI, pollutants, weather, and location data
2. **Prompt Engineering**: Builds a comprehensive context-rich prompt for Gemini
3. **AI Generation**: Sends prompt to Gemini API for intelligent analysis
4. **Response Parsing**: Extracts and structures the AI response into sections
5. **Fallback**: If AI fails, provides rule-based recommendations

## Integration with Existing Endpoints

The AI insights work seamlessly with existing Lighthouse data:

- **AQI Data**: From TEMPO satellite predictions
- **Pollutants**: From OpenAQ ground sensors
- **Weather**: From Open-Meteo weather service
- **Breath Score**: From breath score calculator
- **Location**: From geocoding service

## Error Handling

The service includes robust error handling:

- API failures trigger fallback recommendations
- Invalid coordinates return helpful error messages
- Missing data gracefully degrades to basic insights

## Benefits

1. **User-Friendly**: Converts technical data into everyday language
2. **Actionable**: Provides specific steps people can take
3. **Personalized**: Tailored to location, conditions, and user context
4. **Reliable**: Fallback system ensures insights are always available
5. **Comprehensive**: Considers AQI, weather, pollutants, and wildfires

## Future Enhancements

Potential improvements:
- Multi-language support
- User preference profiles (age, health conditions)
- Personalized activity recommendations
- Historical trend analysis
- Push notification integration
- Voice-based insights for accessibility

## API Key Management

**Important**: In production, move the API key to environment variables:

```python
import os
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
```

And set it in your environment:
```bash
export GEMINI_API_KEY="your-api-key-here"
```

## Dependencies

- `google-generativeai` (v0.8.5 or higher)

Install with:
```bash
pip install google-generativeai
```

## License

This integration is part of the Lighthouse API project.

---

**Built with**: Google Gemini 2.5 Flash
**Version**: 1.0.0
**Last Updated**: 2025-10-04
