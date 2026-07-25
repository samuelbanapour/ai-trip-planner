// AI prompt templates for each feature. Used by both backend routes and client-side.

export const PROMPTS = {
  itinerary: (trip) => ({
    system: `You are an expert travel planner. Generate a detailed day-by-day itinerary.

Rules:
- Return valid JSON only, no markdown fencing
- Be specific with real place names, addresses when possible
- Include realistic time estimates
- Suggest 3-5 activities per day with time blocks (morning, afternoon, evening)
- Include travel time between locations
- Estimate costs in ${trip.currency || 'USD'}
- Consider the group size (${trip.travelers || 1} travelers)
- Be practical — don't overschedule
- Include meal suggestions at appropriate times`,
    user: `Plan a ${trip.duration}-day trip to ${trip.destination}.
Travel dates: ${trip.startDate} to ${trip.endDate}
Budget: ${trip.budgetRange} (${trip.totalBudget ? '$' + trip.totalBudget : 'flexible'})
Travel style: ${trip.travelStyle}
Interests: ${(trip.interests || []).join(', ')}
${trip.dietaryRestrictions ? 'Dietary restrictions: ' + trip.dietaryRestrictions : ''}
${trip.accessibility ? 'Accessibility needs: ' + trip.accessibility : ''}

Return a JSON object with this structure:
{
  "destination": "${trip.destination}",
  "totalDays": ${trip.duration},
  "days": [
    {
      "day": 1,
      "date": "${trip.startDate}",
      "theme": "Arrival & Exploration",
      "activities": [
        {
          "time": "09:00",
          "endTime": "11:00",
          "title": "Activity name",
          "description": "Brief description",
          "location": "Place name",
          "category": "sightseeing|food|transport|shopping|nature|culture|nightlife",
          "cost": 0,
          "tips": "Optional tip"
        }
      ]
    }
  ],
  "summary": "Brief trip summary"
}`,
  }),

  budget: (trip, itinerary) => ({
    system: `You are a travel budget expert. Create a detailed budget breakdown.

Rules:
- Return valid JSON only, no markdown fencing
- Use realistic prices for the destination
- All amounts in ${trip.currency || 'USD'}
- Include daily and category breakdowns
- Provide money-saving tips`,
    user: `Create a budget for a ${trip.duration}-day trip to ${trip.destination}.
Travel style: ${trip.budgetRange}
Group size: ${trip.travelers || 1} travelers
${itinerary ? 'Itinerary overview: ' + JSON.stringify(itinerary).slice(0, 2000) : ''}

Return a JSON object:
{
  "totalEstimate": 0,
  "currency": "${trip.currency || 'USD'}",
  "categories": [
    {
      "name": "Accommodation",
      "total": 0,
      "daily": 0,
      "items": [
        { "description": "Hotel/hostel name", "cost": 0, "perNight": true }
      ]
    }
  ],
  "dailyBreakdown": [
    { "day": 1, "total": 0, "items": [] }
  ],
  "tips": ["Save money tip 1", "Save money tip 2"]
}`,
  }),

  packing: (trip) => ({
    system: `You are a packing expert. Generate a comprehensive packing list.

Rules:
- Return valid JSON only, no markdown fencing
- Organize by category
- Consider destination climate, activities, and trip duration
- Include essentials and nice-to-haves
- Mark items as "essential" or "optional"`,
    user: `Create a packing list for a ${trip.duration}-day trip to ${trip.destination}.
Travel style: ${trip.travelStyle}
Activities planned: ${(trip.interests || []).join(', ')}
Group size: ${trip.travelers || 1} travelers
${trip.dietaryRestrictions ? 'Dietary: ' + trip.dietaryRestrictions : ''}
${trip.accessibility ? 'Accessibility: ' + trip.accessibility : ''}

Return a JSON object:
{
  "categories": [
    {
      "name": "Clothing",
      "icon": "👕",
      "items": [
        { "name": "Item name", "essential": true, "quantity": 2, "notes": "Optional note" }
      ]
    }
  ],
  "weatherNotes": "Climate summary for the destination"
}`,
  }),

  recommendations: (trip) => ({
    system: `You are a local travel expert. Provide authentic recommendations.

Rules:
- Return valid JSON only, no markdown fencing
- Recommend real places when possible
- Include variety (budget to mid-range)
- Add local tips and cultural notes
- Consider the group's interests and dietary needs`,
    user: `Recommend places for a trip to ${trip.destination}.
Interests: ${(trip.interests || []).join(', ')}
Budget level: ${trip.budgetRange}
Group size: ${trip.travelers || 1} travelers
${trip.dietaryRestrictions ? 'Dietary restrictions: ' + trip.dietaryRestrictions : ''}

Return a JSON object:
{
  "restaurants": [
    {
      "name": "Restaurant name",
      "cuisine": "Type of food",
      "priceRange": "$ | $$ | $$$",
      "highlight": "What makes it special",
      "tip": "Local tip"
    }
  ],
  "attractions": [
    {
      "name": "Attraction name",
      "type": "museum|park|landmark|market|experience",
      "description": "Brief description",
      "estimatedCost": 0,
      "timeNeeded": "2 hours",
      "tip": "Best time to visit or local tip"
    }
  ],
  "localTips": [
    "Cultural etiquette tip",
    "Transportation advice",
    "Safety note"
  ]
}`,
  }),
};

export default PROMPTS;
