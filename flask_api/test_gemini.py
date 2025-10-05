"""
Test script for Gemini AI integration

Quick test to verify Gemini API connectivity and service functionality.
"""

from gemini_service import GeminiInsightsGenerator

def test_gemini_service():
    """Test the Gemini service with sample data."""

    print("Testing Gemini AI Service Integration...")
    print("=" * 60)

    # Test data
    test_lat = 40.7128
    test_lon = -74.0060
    test_aqi = 85
    test_location = "New York City, NY"

    test_pollutants = {
        'NO2': {'value': 45.2, 'unit': 'ppb'},
        'PM2.5': {'value': 28.5, 'unit': 'μg/m³'}
    }

    test_weather = {
        'temperature': 72,
        'humidity': 65,
        'condition': 'Partly Cloudy'
    }

    print(f"\nTest Parameters:")
    print(f"  Location: {test_location}")
    print(f"  Coordinates: ({test_lat}, {test_lon})")
    print(f"  AQI: {test_aqi}")
    print(f"  Breath Score: 78")
    print("\nGenerating AI insights...\n")

    # Call the Gemini service
    result = GeminiInsightsGenerator.get_insights(
        lat=test_lat,
        lon=test_lon,
        aqi=test_aqi,
        pollutants=test_pollutants,
        location_name=test_location,
        weather=test_weather,
        breath_score=78
    )

    print("=" * 60)
    print("RESULTS:")
    print("=" * 60)

    if result.get('success'):
        print("\n✓ AI Insights Generated Successfully!\n")

        insights = result.get('insights', {})

        # Display summary
        if insights.get('summary'):
            print("SUMMARY:")
            print("-" * 60)
            print(insights['summary'])
            print()

        # Display health recommendations
        if insights.get('health_recommendations'):
            print("HEALTH RECOMMENDATIONS:")
            print("-" * 60)
            for i, rec in enumerate(insights['health_recommendations'], 1):
                print(f"{i}. {rec}")
            print()

        # Display contextual insights
        if insights.get('contextual_insights'):
            print("CONTEXTUAL INSIGHTS:")
            print("-" * 60)
            for i, insight in enumerate(insights['contextual_insights'], 1):
                print(f"{i}. {insight}")
            print()

        # Display actionable tips
        if insights.get('actionable_tips'):
            print("ACTIONABLE TIPS:")
            print("-" * 60)
            for i, tip in enumerate(insights['actionable_tips'], 1):
                print(f"{i}. {tip}")
            print()

        # Display metadata
        print("METADATA:")
        print("-" * 60)
        print(f"AI Model: {result.get('ai_model')}")
        print(f"Location: {result.get('location', {}).get('name')}")
        print(f"AQI: {result.get('context', {}).get('aqi')}")
        print(f"Category: {result.get('context', {}).get('category')}")

    else:
        print("\n✗ AI Insights Generation Failed")
        print(f"Error: {result.get('error')}")
        print(f"Message: {result.get('message')}")

        if result.get('fallback_insights'):
            print("\nUsing Fallback Insights:")
            fallback = result['fallback_insights']
            print(f"Summary: {fallback.get('summary')}")

    print("\n" + "=" * 60)
    print("Test Complete!")
    print("=" * 60)

if __name__ == "__main__":
    test_gemini_service()
