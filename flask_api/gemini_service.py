"""
Google Gemini AI Integration Service

Provides intelligent air quality insights using Google's Gemini AI API.
Generates personalized health recommendations, contextual explanations,
and actionable insights for air quality data.
"""

import google.generativeai as genai
from typing import Dict, Optional, Any
import logging

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyBaSA-1bFG_4rxW3eh3O9Mteq6w6Xz4sqs"
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model (using gemini-2.5-flash for better availability)
model = genai.GenerativeModel('gemini-2.5-flash')

logger = logging.getLogger(__name__)


class GeminiService:
    """
    Google Gemini AI Service for Air Quality Insights

    Generates intelligent, context-aware air quality recommendations
    and explanations using Google's Gemini AI.
    """

    @staticmethod
    def generate_air_quality_insights(
        lat: float,
        lon: float,
        aqi: int,
        pollutants: Optional[Dict[str, Any]] = None,
        location_name: Optional[str] = None,
        weather: Optional[Dict[str, Any]] = None,
        breath_score: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Generate comprehensive AI-powered air quality insights.

        Args:
            lat: Latitude
            lon: Longitude
            aqi: Air Quality Index value
            pollutants: Dictionary of pollutant measurements
            location_name: Human-readable location name
            weather: Current weather conditions
            breath_score: Breath quality score (0-100)

        Returns:
            Dictionary containing AI-generated insights
        """
        try:
            # Build context-rich prompt
            prompt = GeminiService._build_prompt(
                lat, lon, aqi, pollutants, location_name, weather, breath_score
            )

            # Generate AI insights
            response = model.generate_content(prompt)

            # Parse and structure the response
            insights = GeminiService._parse_response(response.text)

            return {
                'success': True,
                'insights': insights,
                'ai_model': 'Google Gemini 2.5 Flash',
                'location': {
                    'lat': round(lat, 4),
                    'lon': round(lon, 4),
                    'name': location_name or f"{lat:.2f}°, {lon:.2f}°"
                },
                'context': {
                    'aqi': aqi,
                    'breath_score': breath_score,
                    'category': GeminiService._get_aqi_category(aqi)
                }
            }

        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to generate AI insights',
                'message': str(e),
                'fallback_insights': GeminiService._get_fallback_insights(aqi)
            }

    @staticmethod
    def _build_prompt(
        lat: float,
        lon: float,
        aqi: int,
        pollutants: Optional[Dict],
        location_name: Optional[str],
        weather: Optional[Dict],
        breath_score: Optional[int]
    ) -> str:
        """Build a comprehensive prompt for Gemini AI."""

        location = location_name or f"location at {lat:.2f}°, {lon:.2f}°"

        # Build pollutants summary
        pollutant_info = ""
        if pollutants:
            pollutant_list = []
            for pollutant, data in pollutants.items():
                if isinstance(data, dict) and 'value' in data:
                    pollutant_list.append(f"{pollutant}: {data['value']} {data.get('unit', '')}")
            if pollutant_list:
                pollutant_info = f"\n\nDetected Pollutants:\n" + "\n".join(pollutant_list)

        # Build weather context
        weather_info = ""
        if weather:
            temp = weather.get('temperature', 'unknown')
            humidity = weather.get('humidity', 'unknown')
            condition = weather.get('condition', 'unknown')
            weather_info = f"\n\nCurrent Weather:\n- Temperature: {temp}°F\n- Humidity: {humidity}%\n- Condition: {condition}"

        # Build breath score context
        breath_info = ""
        if breath_score is not None:
            breath_info = f"\n\nBreath Quality Score: {breath_score}/100"

        prompt = f"""You are an expert air quality analyst and health advisor. Analyze the following air quality data and provide personalized, actionable insights.

Location: {location}
Current Air Quality Index (AQI): {aqi}
AQI Category: {GeminiService._get_aqi_category(aqi)}{pollutant_info}{weather_info}{breath_info}

Please provide:

1. SIMPLE EXPLANATION (2-3 sentences):
   - Explain what the current AQI means in simple, non-technical terms
   - What's causing the air quality to be at this level?
   - Use an analogy if helpful to make it relatable

2. HEALTH RECOMMENDATIONS (3-5 bullet points):
   - Specific actions for the general public
   - Special precautions for sensitive groups (children, elderly, people with respiratory conditions)
   - Should people wear masks? What type?
   - Outdoor activity recommendations

3. CONTEXTUAL INSIGHTS (2-3 points):
   - How does the weather affect air quality today?
   - Time of day considerations (if relevant)
   - Any patterns or trends to be aware of

4. ACTIONABLE TIPS (3-4 specific actions):
   - Immediate steps people can take right now
   - Preventive measures
   - When to check air quality again

Keep your response clear, empathetic, and action-oriented. Write for a general audience without using technical jargon. Focus on practical advice that people can use immediately.

Format your response with clear section headers and bullet points for easy reading."""

        return prompt

    @staticmethod
    def _parse_response(ai_text: str) -> Dict[str, Any]:
        """Parse AI response into structured format."""

        # Try to extract sections from the response
        sections = {
            'summary': '',
            'health_recommendations': [],
            'contextual_insights': [],
            'actionable_tips': [],
            'full_response': ai_text
        }

        lines = ai_text.split('\n')
        current_section = 'summary'

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Detect section headers
            line_lower = line.lower()
            if 'simple explanation' in line_lower or 'explanation' in line_lower:
                current_section = 'summary'
                continue
            elif 'health recommendation' in line_lower or 'health advice' in line_lower:
                current_section = 'health_recommendations'
                continue
            elif 'contextual insight' in line_lower or 'context' in line_lower:
                current_section = 'contextual_insights'
                continue
            elif 'actionable tip' in line_lower or 'action' in line_lower:
                current_section = 'actionable_tips'
                continue

            # Add content to appropriate section
            if current_section == 'summary':
                if not line.startswith('#') and not line.startswith('**'):
                    sections['summary'] += line + ' '
            elif line.startswith('-') or line.startswith('•') or line.startswith('*'):
                # Bullet point
                clean_line = line.lstrip('-•* ').strip()
                if clean_line and not clean_line.startswith('**'):
                    sections[current_section].append(clean_line)
            elif line[0].isdigit() and '.' in line[:3]:
                # Numbered list
                clean_line = line.split('.', 1)[1].strip()
                if clean_line:
                    sections[current_section].append(clean_line)

        # Clean up summary
        sections['summary'] = sections['summary'].strip()
        if not sections['summary']:
            # Fallback: use first few lines
            sections['summary'] = ' '.join(lines[:3])

        return sections

    @staticmethod
    def _get_aqi_category(aqi: int) -> str:
        """Get AQI category from AQI value."""
        if aqi <= 50:
            return "Good"
        elif aqi <= 100:
            return "Moderate"
        elif aqi <= 150:
            return "Unhealthy for Sensitive Groups"
        elif aqi <= 200:
            return "Unhealthy"
        elif aqi <= 300:
            return "Very Unhealthy"
        else:
            return "Hazardous"

    @staticmethod
    def _get_fallback_insights(aqi: int) -> Dict[str, Any]:
        """Provide fallback insights when AI service fails."""

        category = GeminiService._get_aqi_category(aqi)

        fallback = {
            'summary': f"The air quality is currently {category} with an AQI of {aqi}.",
            'health_recommendations': [],
            'actionable_tips': []
        }

        if aqi <= 50:
            fallback['summary'] += " Air quality is satisfactory, and air pollution poses little or no risk."
            fallback['health_recommendations'] = [
                "Enjoy outdoor activities",
                "No health precautions needed for the general public"
            ]
            fallback['actionable_tips'] = [
                "Great day for outdoor exercise",
                "Open windows for fresh air"
            ]
        elif aqi <= 100:
            fallback['summary'] += " Air quality is acceptable for most people, though sensitive individuals may experience minor effects."
            fallback['health_recommendations'] = [
                "Unusually sensitive people should consider reducing prolonged outdoor exertion",
                "General public can enjoy normal outdoor activities"
            ]
            fallback['actionable_tips'] = [
                "Monitor symptoms if you're sensitive to air pollution",
                "Consider indoor activities if you have respiratory conditions"
            ]
        elif aqi <= 150:
            fallback['summary'] += " Members of sensitive groups may experience health effects, but the general public is less likely to be affected."
            fallback['health_recommendations'] = [
                "Children, elderly, and people with respiratory conditions should limit prolonged outdoor exertion",
                "General public should reduce prolonged or heavy outdoor activities",
                "Consider wearing a mask if you're in a sensitive group"
            ]
            fallback['actionable_tips'] = [
                "Close windows to prevent outdoor air from entering",
                "Use air purifiers indoors if available",
                "Reschedule outdoor activities to times with better air quality"
            ]
        elif aqi <= 200:
            fallback['summary'] += " Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects."
            fallback['health_recommendations'] = [
                "Everyone should avoid prolonged outdoor exertion",
                "Sensitive groups should avoid all outdoor activities",
                "Wear N95 masks when going outside",
                "Stay indoors as much as possible"
            ]
            fallback['actionable_tips'] = [
                "Keep windows and doors closed",
                "Run air purifiers on high settings",
                "Limit outdoor exposure to essential activities only",
                "Check AQI regularly for improvements"
            ]
        else:
            fallback['summary'] += " Health alert: everyone may experience serious health effects. This is an emergency condition."
            fallback['health_recommendations'] = [
                "Everyone should avoid all outdoor activities",
                "Stay indoors with windows closed",
                "Use air purifiers and N95 masks",
                "Seek medical attention if experiencing symptoms"
            ]
            fallback['actionable_tips'] = [
                "Remain indoors with air filtration systems running",
                "Seal windows and doors to prevent outdoor air entry",
                "Wear N95 masks if you must go outside",
                "Monitor health closely and contact healthcare providers if needed"
            ]

        return fallback


class GeminiInsightsGenerator:
    """
    Simplified interface for generating quick insights.
    Used by the API endpoint for fast responses.
    """

    @staticmethod
    def get_insights(
        lat: float,
        lon: float,
        aqi: int,
        pollutants: Optional[Dict] = None,
        location_name: Optional[str] = None,
        weather: Optional[Dict] = None,
        breath_score: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Generate AI insights - main entry point.

        This is a convenience wrapper around GeminiService.
        """
        return GeminiService.generate_air_quality_insights(
            lat=lat,
            lon=lon,
            aqi=aqi,
            pollutants=pollutants,
            location_name=location_name,
            weather=weather,
            breath_score=breath_score
        )
