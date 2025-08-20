import { useState, useEffect } from 'react';

export interface Quote {
  text: string;
  author: string;
  category?: string;
}

interface QuotableApiResponse {
  content: string;
  author: string;
  tags: string[];
}

// Fallback quotes in case API fails
const FALLBACK_QUOTES: Quote[] = [
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "motivation"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "success"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    category: "innovation"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "work"
  },
  {
    text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    author: "Steve Jobs",
    category: "work"
  },
  {
    text: "Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution.",
    author: "Aristotle",
    category: "excellence"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "dreams"
  },
  {
    text: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill",
    category: "success"
  }
];

const QUOTE_STORAGE_KEY = 'daily_quote';
const QUOTE_DATE_KEY = 'quote_date';

export const useQuotes = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we need a new quote (daily refresh)
  const needsNewQuote = () => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem(QUOTE_DATE_KEY);
    return storedDate !== today;
  };

  // Get stored quote
  const getStoredQuote = (): Quote | null => {
    try {
      const stored = localStorage.getItem(QUOTE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  // Store quote with date
  const storeQuote = (quoteData: Quote) => {
    const today = new Date().toDateString();
    localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(quoteData));
    localStorage.setItem(QUOTE_DATE_KEY, today);
  };

  // Fetch quote from API
  const fetchQuoteFromAPI = async (): Promise<Quote> => {
    try {
      // Using Quotable API - free and doesn't require API key
      // Add cache-busting and bypass HTTP caches to ensure a fresh quote on manual refresh
      const cacheBuster = Date.now();
      const url = `https://api.quotable.io/random?minLength=20&maxLength=150&tags=motivational|inspirational|success|wisdom&_=${cacheBuster}`;
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: QuotableApiResponse = await response.json();
      
      return {
        text: data.content,
        author: data.author,
        category: data.tags[0] || 'general'
      };
    } catch (error) {
      console.warn('Failed to fetch quote from API, using fallback:', error);
      // Return random fallback quote
      const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
      return FALLBACK_QUOTES[randomIndex];
    }
  };

  // Try to get a quote different from the provided texts, retrying a few times to improve freshness
  const fetchUniqueQuote = async (avoidTexts: string[] = [], maxAttempts = 3): Promise<Quote> => {
    let attempt = 0;
    let last: Quote = await fetchQuoteFromAPI();
    while (attempt < maxAttempts && avoidTexts.includes(last.text)) {
      attempt++;
      last = await fetchQuoteFromAPI();
    }
    return last;
  };

  // Main function to get daily quote
  const fetchDailyQuote = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if we already have today's quote
      if (!needsNewQuote()) {
        const stored = getStoredQuote();
        if (stored) {
          setQuote(stored);
          setLoading(false);
          return;
        }
      }

      // Fetch new quote, try to avoid repeating the previously stored one
      const previous = getStoredQuote();
      const newQuote = await fetchUniqueQuote(previous ? [previous.text] : []);
      setQuote(newQuote);
      storeQuote(newQuote);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quote';
      setError(errorMessage);
      
      // Use fallback quote on error
      const fallbackQuote = FALLBACK_QUOTES[0];
      setQuote(fallbackQuote);
      storeQuote(fallbackQuote);
    } finally {
      setLoading(false);
    }
  };

  // Refresh quote manually
  const refreshQuote = async () => {
    // Clear stored data to force new fetch
    localStorage.removeItem(QUOTE_STORAGE_KEY);
    localStorage.removeItem(QUOTE_DATE_KEY);

    // Try to avoid immediately repeating the on-screen quote during manual refreshes
    const currentText = quote?.text ? [quote.text] : [];
    setLoading(true);
    const newQuote = await fetchUniqueQuote(currentText);
    setQuote(newQuote);
    storeQuote(newQuote);
    setLoading(false);
  };

  useEffect(() => {
    fetchDailyQuote();
  }, []);

  return {
    quote,
    loading,
    error,
    refreshQuote,
  };
};
