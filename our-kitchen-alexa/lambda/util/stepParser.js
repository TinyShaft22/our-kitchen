/**
 * Step Parser Utility
 * Parses markdown recipe instructions into discrete steps for cooking mode
 */

/**
 * Parse recipe instructions into discrete steps
 * @param {string} instructions - Markdown formatted recipe instructions
 * @param {Array} ingredients - Array of ingredient objects with {name}
 * @returns {Array} Array of step objects {number, title, content, isIngredients}
 */
function parseInstructionsToSteps(instructions, ingredients) {
  const steps = [];

  // Step 0: Ingredients
  const ingredientList = (ingredients || [])
    .map(i => `- ${i.name}`)
    .join('\n');

  steps.push({
    number: 0,
    title: 'Ingredients',
    content: ingredientList || 'No ingredients listed',
    isIngredients: true
  });

  // Handle empty/null instructions
  if (!instructions || instructions.trim().length === 0) {
    return steps;
  }

  // Clean up the instructions
  let cleanedInstructions = instructions
    // Remove markdown headers (## lines)
    .replace(/^#{1,6}\s+.*$/gm, '')
    .trim();

  // Very short instructions - single step
  if (cleanedInstructions.length < 20) {
    steps.push({
      number: 1,
      title: 'Step 1',
      content: cleanedInstructions,
      isIngredients: false
    });
    return steps;
  }

  let parsedSteps = [];

  // Strategy A: Numbered list format (1. or 1) patterns)
  const numberedPattern = /^\d+[\.\)]\s*/gm;
  if (numberedPattern.test(cleanedInstructions)) {
    // Split by numbered patterns
    // First split captures the number markers, then we pair content with numbers
    const parts = cleanedInstructions.split(/(?=^\d+[\.\)]\s*)/m);

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      // Remove the number prefix (e.g., "1. " or "2) ")
      const content = trimmed.replace(/^\d+[\.\)]\s*/, '').trim();
      if (content) {
        parsedSteps.push(content);
      }
    }
  }

  // Strategy B: Paragraph format (double newlines)
  if (parsedSteps.length === 0) {
    const paragraphs = cleanedInstructions.split(/\n\s*\n/);
    parsedSteps = paragraphs
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }

  // Strategy C: Fallback - single step
  if (parsedSteps.length === 0) {
    parsedSteps = [cleanedInstructions];
  }

  // Convert to step objects
  parsedSteps.forEach((content, index) => {
    steps.push({
      number: index + 1,
      title: `Step ${index + 1}`,
      content: content,
      isIngredients: false
    });
  });

  return steps;
}

module.exports = { parseInstructionsToSteps };
