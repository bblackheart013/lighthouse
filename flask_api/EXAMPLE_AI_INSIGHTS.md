# Example: AI-Powered Air Quality Insights

## Sample API Call

### Request
```bash
curl "http://localhost:5000/ai-insights?lat=40.7128&lon=-74.0060&city=New%20York"
```

### Response (Example)

```json
{
  "success": true,
  "insights": {
    "summary": "As an expert air quality analyst and health advisor, here's a personalized breakdown of New York City's current air quality and what it means for you: Today, the air quality in New York City is at a Moderate level (AQI 85). This means the air is generally acceptable for most people, but there are slightly elevated levels of tiny particles (PM2.5) and traffic-related pollutants (NO2) that could be a concern for a small number of people who are unusually sensitive to air pollution. Think of it like a slightly hazy day where the air isn't perfectly crisp – it's not alarming, but it's also not ideal. The main culprit today is likely the accumulation of vehicle emissions and urban activity in the atmosphere.",

    "health_recommendations": [
      "For the General Public: You can typically continue your normal outdoor activities. Most healthy individuals are unlikely to experience adverse effects from the current air quality.",
      "For Sensitive Groups: If you have asthma, other respiratory conditions, heart disease, or are a child or older adult, you might feel some mild symptoms like coughing or shortness of breath. It's wise to reduce prolonged or strenuous outdoor activities today.",
      "Mask Usage: For the general public, masks are not necessary at this AQI level. However, if you are in a sensitive group and plan to spend a longer period outdoors, especially near heavy traffic, consider wearing a high-quality mask like an N95 or KN95.",
      "Outdoor Activities: Enjoy gentle outdoor activities, but be mindful of your body. Avoid very intense or prolonged exercise, particularly during peak traffic hours, if you belong to a sensitive group."
    ],

    "contextual_insights": [
      "Weather's Role: The current partly cloudy, 72°F weather with moderate humidity isn't actively clearing the air (like strong winds would) nor drastically worsening it. This comfortable, relatively still weather can allow pollutants from daily city life to linger and build up.",
      "Time of Day: Air quality often worsens during peak traffic times (morning and evening commutes) as vehicle emissions are at their highest. Today's reading could reflect lingering effects from a morning commute.",
      "Urban Trend: Moderate air quality is a common occurrence in large, busy cities like NYC due to continuous sources of pollution."
    ],

    "actionable_tips": [
      "Proactive Planning: If you need to be outdoors for an extended period, try to choose routes that avoid heavy traffic. Consider exercising in green spaces or parks further away from major roadways.",
      "Stay Hydrated: Drinking plenty of water can help your body manage air pollution exposure by supporting your respiratory system.",
      "Check Again: Always check the air quality forecast before making plans for extensive outdoor activities, especially if you or your loved ones are in a sensitive group."
    ],

    "full_response": "[Complete AI response text...]"
  },

  "ai_model": "Google Gemini 2.5 Flash",

  "location": {
    "lat": 40.7128,
    "lon": -74.006,
    "name": "New York City, NY"
  },

  "context": {
    "aqi": 85,
    "breath_score": 78,
    "category": "Moderate"
  },

  "timestamp": "2025-10-04T15:30:00Z"
}
```

## Key Features Demonstrated

1. **Simple Explanation**: The AI explains AQI 85 using an analogy ("like a slightly hazy day")

2. **Personalized Advice**: Different recommendations for general public vs. sensitive groups

3. **Mask Guidance**: Specific mask type recommendations (N95/KN95) for those who need them

4. **Weather Context**: Explains how current weather (72°F, partly cloudy) affects air quality

5. **Actionable Tips**: Concrete steps like avoiding traffic routes and staying hydrated

## Use Cases

### 1. Morning Commute Planning
```bash
curl "http://localhost:5000/ai-insights?lat=34.05&lon=-118.24&city=Los%20Angeles"
```
Get advice on whether to bike to work or take public transit.

### 2. Outdoor Exercise Decision
```bash
curl "http://localhost:5000/ai-insights?lat=41.88&lon=-87.63&city=Chicago"
```
Determine if it's safe for your morning run.

### 3. Travel Planning
```bash
curl "http://localhost:5000/ai-insights?lat=37.77&lon=-122.42&city=San%20Francisco"
```
Check air quality before visiting a new city.

### 4. Health Management
For users with respiratory conditions to get personalized daily guidance.

## Integration Example

### In a Mobile App
```javascript
// Fetch AI insights for user's location
fetch(`/ai-insights?lat=${userLat}&lon=${userLon}`)
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      displaySummary(data.insights.summary);
      showHealthRecommendations(data.insights.health_recommendations);
      showActionableTips(data.insights.actionable_tips);
    }
  });
```

### In a Dashboard
```python
import requests

response = requests.get(
    "http://localhost:5000/ai-insights",
    params={"lat": 40.7, "lon": -74.0, "city": "New York"}
)

insights = response.json()
if insights['success']:
    print("Summary:", insights['insights']['summary'])
    print("\nRecommendations:")
    for rec in insights['insights']['health_recommendations']:
        print(f"  - {rec}")
```

## Comparison: Traditional vs AI-Powered

### Traditional Response
```json
{
  "aqi": 85,
  "category": "Moderate",
  "advice": "Active children and adults, and people with respiratory disease should limit prolonged outdoor exertion."
}
```

### AI-Powered Response
```json
{
  "insights": {
    "summary": "Think of it like a slightly hazy day where the air isn't perfectly crisp – it's not alarming, but it's also not ideal. The main culprit today is likely the accumulation of vehicle emissions and urban activity in the atmosphere.",
    "health_recommendations": [
      "Detailed, personalized advice for different groups",
      "Specific mask types and when to use them",
      "Activity-specific guidance"
    ],
    "actionable_tips": [
      "Concrete steps you can take right now",
      "Preventive measures for the future"
    ]
  }
}
```

## Benefits

1. **Accessibility**: Anyone can understand the insights, not just air quality experts
2. **Actionable**: Specific steps people can take immediately
3. **Personalized**: Considers location, weather, and individual circumstances
4. **Educational**: Explains why air quality is at current levels
5. **Empowering**: Gives people control over their health decisions

---

**Generated by**: Google Gemini 2.5 Flash AI
**Endpoint**: `/ai-insights`
**ClearSkies API Version**: 3.0.0
