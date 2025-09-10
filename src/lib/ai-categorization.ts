import { AICategorizationResult } from '@/types';
import { AI_CATEGORIZATION_KEYWORDS } from './constants';

export class AICategorizationService {
  private static extractAmountFromText(text: string): number | null {
    // Common patterns for amounts
    const patterns = [
      /\$?(\d+(?:\.\d{2})?)/g,  // $100 or 100.50
      /(\d+(?:\.\d{2})?)(?:\s*dollars?|\s*USD|\s*$)/g,  // 100 dollars, 100 USD
      /(?:spent|paid|cost|bought).*?(\d+(?:\.\d{2})?)/gi,  // spent 50, paid 25.50
      /(\d+(?:\.\d{2})?)/g  // any number
    ];

    for (const pattern of patterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        // Return the first valid number found
        const amount = parseFloat(matches[0][1]);
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }
    return null;
  }

  private static categorizeByKeywords(text: string): { category: string; confidence: number } | null {
    const lowerText = text.toLowerCase();
    let bestMatch = { category: '', confidence: 0 };

    for (const [category, keywords] of Object.entries(AI_CATEGORIZATION_KEYWORDS)) {
      let matchCount = 0;
      let totalKeywords = keywords.length;

      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          matchCount++;
        }
      }

      const confidence = (matchCount / totalKeywords) * 100;
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { category, confidence };
      }
    }

    return bestMatch.confidence > 10 ? bestMatch : null;
  }

  private static analyzeExpensePattern(text: string): { type: 'income' | 'expense'; confidence: number } {
    const lowerText = text.toLowerCase();
    
    // Income indicators
    const incomeKeywords = ['received', 'earned', 'salary', 'paycheck', 'bonus', 'refund', 'cashback', 'dividend', 'interest', 'profit', 'income', 'payment received', 'freelance payment'];
    const expenseKeywords = ['bought', 'purchased', 'paid', 'spent', 'cost', 'bill', 'fee', 'charge', 'subscription', 'order', 'shopping'];

    let incomeScore = 0;
    let expenseScore = 0;

    incomeKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) incomeScore++;
    });

    expenseKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) expenseScore++;
    });

    if (incomeScore > expenseScore) {
      return { type: 'income', confidence: (incomeScore / (incomeScore + expenseScore)) * 100 };
    } else {
      return { type: 'expense', confidence: expenseScore > 0 ? (expenseScore / (incomeScore + expenseScore)) * 100 : 70 };
    }
  }

  public static categorizeTransaction(input: string): {
    amount: number | null;
    category: string;
    type: 'income' | 'expense';
    description: string;
    confidence: number;
    reasoning: string;
  } {
    const originalInput = input;
    
    // Extract amount
    const amount = this.extractAmountFromText(input);
    
    // Remove amount from text for better categorization
    let cleanText = input.replace(/\$?(\d+(?:\.\d{2})?)/g, '').trim();
    if (!cleanText) cleanText = originalInput;

    // Determine if it's income or expense
    const typeAnalysis = this.analyzeExpensePattern(cleanText);
    
    // Categorize based on keywords
    const categoryMatch = this.categorizeByKeywords(cleanText);
    
    let category = 'Miscellaneous';
    let confidence = 30; // Base confidence for miscellaneous
    let reasoning = 'Defaulted to miscellaneous category';

    if (categoryMatch) {
      category = categoryMatch.category;
      confidence = Math.min(categoryMatch.confidence + typeAnalysis.confidence / 2, 95);
      reasoning = `Matched keywords for ${category} with ${categoryMatch.confidence.toFixed(1)}% keyword confidence`;
    } else {
      // Fallback categorization based on common patterns
      const fallbackCategories = {
        'Food & Dining': ['ate', 'food', 'meal', 'hungry', 'restaurant'],
        'Transportation': ['drive', 'car', 'transport', 'travel', 'gas'],
        'Shopping': ['buy', 'purchase', 'store', 'shop'],
        'Entertainment': ['fun', 'movie', 'game', 'entertainment'],
        'Bills & Utilities': ['bill', 'utility', 'electric', 'water', 'internet']
      };

      for (const [cat, keywords] of Object.entries(fallbackCategories)) {
        if (keywords.some(keyword => cleanText.toLowerCase().includes(keyword))) {
          category = cat;
          confidence = 60;
          reasoning = `Matched fallback patterns for ${cat}`;
          break;
        }
      }
    }

    // Generate a clean description
    let description = cleanText;
    if (amount) {
      description = cleanText || `${typeAnalysis.type} of $${amount}`;
    }
    
    // Capitalize first letter
    description = description.charAt(0).toUpperCase() + description.slice(1);
    
    return {
      amount,
      category,
      type: typeAnalysis.type,
      description: description || originalInput,
      confidence,
      reasoning
    };
  }

  public static generateSmartSuggestions(input: string): string[] {
    const lowerInput = input.toLowerCase();
    const suggestions: string[] = [];

    // Common expense patterns
    if (lowerInput.includes('grocery') || lowerInput.includes('food')) {
      suggestions.push('Bought groceries $50');
      suggestions.push('Lunch at restaurant $25');
      suggestions.push('Food delivery $18');
    }

    if (lowerInput.includes('gas') || lowerInput.includes('fuel')) {
      suggestions.push('Gas for car $45');
      suggestions.push('Fuel expense $38');
    }

    if (lowerInput.includes('coffee') || lowerInput.includes('starbucks')) {
      suggestions.push('Coffee at Starbucks $6');
      suggestions.push('Morning coffee $4.50');
    }

    // Income patterns
    if (lowerInput.includes('salary') || lowerInput.includes('paycheck')) {
      suggestions.push('Monthly salary $5000');
      suggestions.push('Bi-weekly paycheck $2500');
    }

    if (lowerInput.includes('freelance')) {
      suggestions.push('Freelance project payment $1200');
      suggestions.push('Consulting fee $800');
    }

    return suggestions.slice(0, 5); // Return max 5 suggestions
  }
}

// Convenience function for quick categorization
export function categorizeExpenseText(input: string): AICategorizationResult {
  const result = AICategorizationService.categorizeTransaction(input);
  return {
    category: result.category,
    confidence: result.confidence,
    reasoning: result.reasoning
  };
}
