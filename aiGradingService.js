/**
 * AI Grading Service
 * Compares student submissions with faculty sample solutions
 * and provides automated grading
 */

class AIGradingService {
  /**
   * Calculate similarity between two texts using a simple approach
   * In a production environment, this would use more sophisticated NLP techniques
   * @param {string} studentText - Student's submission
   * @param {string} sampleSolution - Faculty's sample solution
   * @param {string} gradingCriteria - Optional grading criteria
   * @returns {object} Grading result with score and feedback
   */
  static gradeSubmission(studentText, sampleSolution, gradingCriteria = '') {
    // Normalize texts by removing extra whitespace and converting to lowercase
    const normalizedStudent = this.normalizeText(studentText);
    const normalizedSample = this.normalizeText(sampleSolution);
    
    // Calculate basic similarity score
    const similarityScore = this.calculateSimilarity(normalizedStudent, normalizedSample);
    
    // Adjust score based on key concepts from grading criteria
    let finalScore = similarityScore;
    let feedback = '';
    
    if (gradingCriteria) {
      const conceptMatch = this.checkConcepts(normalizedStudent, gradingCriteria);
      // Adjust score based on concept matching
      finalScore = Math.round((similarityScore * 0.7) + (conceptMatch * 0.3));
      
      feedback = this.generateFeedback(similarityScore, conceptMatch);
    } else {
      feedback = this.generateBasicFeedback(similarityScore);
    }
    
    // Ensure score is within 0-100 range
    finalScore = Math.max(0, Math.min(100, finalScore));
    
    return {
      score: finalScore,
      feedback: feedback,
      similarity: similarityScore
    };
  }
  
  /**
   * Normalize text for comparison
   * @param {string} text - Text to normalize
   * @returns {string} Normalized text
   */
  static normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
      .trim();
  }
  
  /**
   * Calculate similarity between two texts using Jaccard similarity
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {number} Similarity score (0-100)
   */
  static calculateSimilarity(text1, text2) {
    // Convert texts to sets of words
    const words1 = new Set(text1.split(' '));
    const words2 = new Set(text2.split(' '));
    
    // Calculate intersection and union
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    // Calculate Jaccard similarity
    if (union.size === 0) return 0;
    
    const jaccardSimilarity = intersection.size / union.size;
    return Math.round(jaccardSimilarity * 100);
  }
  
  /**
   * Check if student text contains key concepts from grading criteria
   * @param {string} studentText - Student's submission
   * @param {string} criteria - Grading criteria with key concepts
   * @returns {number} Concept match score (0-100)
   */
  static checkConcepts(studentText, criteria) {
    const criteriaWords = this.normalizeText(criteria).split(' ');
    const studentWords = studentText.split(' ');
    
    let matchedConcepts = 0;
    const totalConcepts = criteriaWords.length;
    
    for (const concept of criteriaWords) {
      if (studentWords.includes(concept)) {
        matchedConcepts++;
      }
    }
    
    if (totalConcepts === 0) return 100;
    
    return Math.round((matchedConcepts / totalConcepts) * 100);
  }
  
  /**
   * Generate feedback based on similarity and concept scores
   * @param {number} similarity - Text similarity score
   * @param {number} conceptMatch - Concept matching score
   * @returns {string} Feedback message
   */
  static generateFeedback(similarity, conceptMatch) {
    let feedback = `AI Analysis Results:\n`;
    feedback += `• Text Similarity: ${similarity}%\n`;
    feedback += `• Concept Coverage: ${conceptMatch}%\n\n`;
    
    if (similarity >= 80 && conceptMatch >= 80) {
      feedback += "Excellent work! Your response closely matches the expected solution and covers all key concepts.";
    } else if (similarity >= 60 && conceptMatch >= 60) {
      feedback += "Good effort! Your response is on the right track but could be more comprehensive.";
    } else if (similarity >= 40 || conceptMatch >= 40) {
      feedback += "Fair attempt. Consider reviewing the material and expanding on key concepts.";
    } else {
      feedback += "Needs improvement. Please review the course material and try to address all aspects of the question.";
    }
    
    return feedback;
  }
  
  /**
   * Generate basic feedback based on similarity score only
   * @param {number} similarity - Text similarity score
   * @returns {string} Feedback message
   */
  static generateBasicFeedback(similarity) {
    let feedback = `AI Analysis Results:\n`;
    feedback += `• Text Similarity: ${similarity}%\n\n`;
    
    if (similarity >= 80) {
      feedback += "Excellent work! Your response closely matches the expected solution.";
    } else if (similarity >= 60) {
      feedback += "Good effort! Your response is on the right track.";
    } else if (similarity >= 40) {
      feedback += "Fair attempt. Consider reviewing the material for a more comprehensive answer.";
    } else {
      feedback += "Needs improvement. Please review the course material.";
    }
    
    return feedback;
  }
}

module.exports = AIGradingService;