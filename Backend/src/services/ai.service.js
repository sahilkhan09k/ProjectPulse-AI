/**
 * AI Recovery Service
 * Generates recovery recommendations using GROQ API
 */

/**
 * Get recovery recommendations from AI
 * @param {Object} metrics - Project health metrics
 * @param {number} metrics.reliabilityScore - Current reliability score (0-100)
 * @param {number} metrics.blockerCount - Number of blocked tasks
 * @param {number} metrics.stagnationCount - Number of stale tasks
 * @param {number} metrics.overloadMembers - Number of overloaded team members
 * @param {number} metrics.daysRemaining - Days until deadline
 * @returns {Promise<Object>} - AI recommendations
 */
const getRecoveryRecommendations = async (metrics) => {
  const prompt = `You are a project management AI assistant. Analyze this project health data and provide recovery recommendations.

Project Metrics:
- Reliability Score: ${metrics.reliabilityScore}/100
- Blocked Tasks: ${metrics.blockerCount}
- Stale Tasks (>48h): ${metrics.stagnationCount}
- Overloaded Team Members: ${metrics.overloadMembers}
- Days Until Deadline: ${metrics.daysRemaining}

Provide:
1. A brief summary (2-3 sentences) of the primary risks
2. 3-5 specific, actionable recommendations to improve the reliability score

Format your response as JSON:
{
  "summary": "...",
  "actionItems": ["...", "...", "..."]
}`;

  try {
    // Check if GROQ API key is configured
    if (!process.env.GROQ_API_KEY) {
      console.warn('GROQ_API_KEY not configured, using fallback recommendations');
      return getFallbackRecommendations(metrics);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`GROQ API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Try to parse JSON from response
    // Sometimes the model wraps JSON in markdown code blocks
    let jsonContent = content;
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonContent);

    return {
      summary: parsed.summary || 'AI analysis completed',
      actionItems: parsed.actionItems || []
    };
  } catch (error) {
    console.error('AI service error:', error.message);
    
    // Return fallback recommendations on any error
    return getFallbackRecommendations(metrics);
  }
};

/**
 * Get fallback recommendations when AI service is unavailable
 * @param {Object} metrics - Project health metrics
 * @returns {Object} - Fallback recommendations
 */
const getFallbackRecommendations = (metrics) => {
  const actionItems = [];

  // Generate context-aware recommendations based on metrics
  if (metrics.blockerCount > 0) {
    actionItems.push('Prioritize unblocking tasks - assign dedicated resources to resolve dependencies');
  }

  if (metrics.overloadMembers > 0) {
    actionItems.push('Redistribute workload - reassign tasks from overloaded team members');
  }

  if (metrics.stagnationCount > 0) {
    actionItems.push('Review stale tasks - update status or reassign tasks that haven\'t been touched in 48+ hours');
  }

  if (metrics.daysRemaining < 7) {
    actionItems.push('Increase standup frequency to daily for better visibility given tight deadline');
  }

  if (metrics.reliabilityScore < 50) {
    actionItems.push('Consider descoping non-critical features to focus on core deliverables');
  }

  // Always include these general recommendations
  actionItems.push('Schedule technical debt sprint to address underlying issues');
  actionItems.push('Conduct retrospective to identify process improvements');

  // Limit to 5 items
  const limitedItems = actionItems.slice(0, 5);

  let summary = 'Project health is degraded. ';
  if (metrics.reliabilityScore < 50) {
    summary += 'Critical action required to address blockers, team overload, and deadline pressure.';
  } else if (metrics.reliabilityScore < 65) {
    summary += 'Immediate action required to improve reliability score and prevent further degradation.';
  } else {
    summary += 'Proactive measures recommended to maintain project health.';
  }

  return {
    summary,
    actionItems: limitedItems
  };
};

module.exports = {
  getRecoveryRecommendations,
  getFallbackRecommendations
};
