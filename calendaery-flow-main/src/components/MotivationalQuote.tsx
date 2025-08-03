import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const quotes = [
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Productivity is never an accident. It is always the result of a commitment to excellence.", author: "Paul J. Meyer" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "It is not enough to be busy... The question is: what are we busy about?", author: "Henry David Thoreau" },
  { text: "Time management is life management.", author: "Robin Sharma" },
  { text: "You don't have to be great to get started, but you have to get started to be great.", author: "Les Brown" }
];

const MotivationalQuote = () => {
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  const refreshQuote = async () => {
    setIsRefreshing(true);
    
    // Add a small delay for better UX
    setTimeout(() => {
      let newQuote;
      do {
        newQuote = getRandomQuote();
      } while (newQuote.text === currentQuote.text && quotes.length > 1);
      
      setCurrentQuote(newQuote);
      setIsRefreshing(false);
    }, 300);
  };

  // Set initial random quote on mount
  useEffect(() => {
    setCurrentQuote(getRandomQuote());
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass rounded-2xl p-6 w-full max-w-2xl mx-auto mb-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Quote className="h-6 w-6 text-primary mt-1" />
        </div>
        
        <div className="flex-1 min-w-0">
          <motion.blockquote
            key={currentQuote.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-lg font-medium text-foreground leading-relaxed mb-3"
          >
            "{currentQuote.text}"
          </motion.blockquote>
          
          <motion.cite
            key={currentQuote.author}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-sm text-muted-foreground font-medium"
          >
            — {currentQuote.author}
          </motion.cite>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshQuote}
          disabled={isRefreshing}
          className="glass-hover rounded-full p-2 h-auto flex-shrink-0"
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <RefreshCw className="h-4 w-4" />
          </motion.div>
        </Button>
      </div>
    </motion.div>
  );
};

export default MotivationalQuote;