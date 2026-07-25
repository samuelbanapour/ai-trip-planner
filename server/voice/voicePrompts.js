// Voice-optimized prompt templates for spoken responses.
// Uses CommonJS because it's consumed by server-side modules.

const voicePrompts = {
  itinerary: (trip, dayNumber) => ({
    system: `You are a travel assistant speaking to someone via voice. Respond with 2-4 natural spoken sentences. Be specific about times, places, and activities. No bullet points, no JSON, no markdown. Use conversational language.`,
    user: dayNumber
      ? `What's on the itinerary for day ${dayNumber} of my ${trip.duration}-day trip to ${trip.destination}? The trip is from ${trip.startDate} to ${trip.endDate}.`
      : `Give me a quick overview of my ${trip.duration}-day trip to ${trip.destination}. What are the highlights?`
  }),

  budget: (trip) => ({
    system: `You are a travel budget assistant speaking to someone via voice. Give a spoken budget summary in 2-3 sentences. Mention the total estimated cost, the biggest expense category, and one money-saving tip. Be conversational.`,
    user: `Summarize the budget for my ${trip.duration}-day trip to ${trip.destination}. Budget level: ${trip.budgetRange}. ${trip.totalBudget ? 'Total budget: $' + trip.totalBudget : 'Flexible budget.'} ${trip.travelers ? trip.travelers + ' travelers.' : ''}`
  }),

  packing: (trip) => ({
    system: `You are a packing assistant speaking to someone via voice. List the top 5 packing essentials in 2-3 spoken sentences. Be concise and practical. Mention why each item matters for this specific destination.`,
    user: `What are the most important things to pack for a ${trip.duration}-day trip to ${trip.destination}? Travel style: ${trip.travelStyle}. Activities: ${(trip.interests || []).join(', ')}.`
  }),

  recommendations: (trip, category) => ({
    system: `You are a local travel expert speaking to someone via voice. Give 3-4 local recommendations as spoken sentences. Be specific with real place names when possible. Include one restaurant, one attraction, and one local tip. Keep it conversational.`,
    user: category
      ? `What ${category} do you recommend for my trip to ${trip.destination}? Budget level: ${trip.budgetRange}.`
      : `Give me your top recommendations for my trip to ${trip.destination}. Interests: ${(trip.interests || []).join(', ')}. Budget: ${trip.budgetRange}.`
  }),

  tripQuestion: (trip, question) => ({
    system: `You are a travel assistant speaking to someone via voice. Answer their travel question concisely in 2-3 spoken sentences. Be helpful and specific. If you don't know the answer, suggest checking official sources.`,
    user: `About my trip to ${trip.destination} (${trip.startDate} to ${trip.endDate}): ${question}`
  }),

  weather: (trip) => ({
    system: `You are a weather assistant speaking to someone via voice. Describe the expected weather in 1-2 spoken sentences. Mention temperature range and whether rain is expected. Be brief.`,
    user: `What's the weather expected to be like in ${trip.destination} during my trip from ${trip.startDate} to ${trip.endDate}?`
  }),

  welcome: () => ({
    system: `You are a friendly travel assistant. Greet the user warmly and briefly describe what you can help with. Keep it to 2 sentences.`,
    user: `Welcome the user to AI Trip Planner Voice and tell them what they can ask about.`
  }),
};

module.exports = voicePrompts;
