// Personalization Configuration
// Update this file with your personalized content

export interface Milestone {
  date: string;
  name: string;
  emoji: string;
}

export interface Question {
  question: string;
  emojis: string[];
  answers: Record<string, string>;
}

export interface PersonalizationConfig {
  herName: string;
  yourName: string;
  relationshipStartDate: string;
  valentinesDate: string;
  nextDate?: string;
  milestones: Milestone[];
  insideJokes: string[];
  heroMessage: string;
  closingMessage: string;
  questions: Question[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const personalization: PersonalizationConfig = {
  // Names - UPDATE THESE
  herName: "Sri Lekha",
  yourName: "John",
  
  // Dates - UPDATE THESE
  relationshipStartDate: "2023-06-15", // Format: YYYY-MM-DD
  valentinesDate: "2025-02-14",
  nextDate: "2025-02-14", // Optional: Next planned date
  
  // Important Milestones
  milestones: [
    { date: "2023-07-20", name: "First Trip Together", emoji: "✈️" },
    { date: "2024-02-14", name: "First Valentine's", emoji: "💕" },
    { date: "2024-06-15", name: "One Year Together", emoji: "🎉" },
  ],
  
  // Inside Jokes - ADD YOUR OWN
  insideJokes: [
    "The pizza incident of 2023",
    "That time at the beach when...",
    "Remember when we...",
  ],
  
  // Custom Messages
  heroMessage: "For the most amazing person in my life",
  closingMessage: "Can't wait to make more memories together",
  
  // Questions with Personalized Answers
  questions: [
    {
      question: "What's the funniest thing I've done?",
      emojis: ["😂", "😅", "🤣", "😆", "🤭", "💕"],
      answers: {
        "😂": "That time you tried to cook and almost set off the fire alarm! Still the best meal though 😊",
        "😅": "When you got lost in the mall and called me from three stores away",
        "🤣": "The way you dance when your favorite song comes on - pure joy!",
        "😆": "That time you tried to speak another language and made up words",
        "🤭": "When you thought the dog was a statue and tried to pet it",
        "💕": "Every single day with you is funny and amazing in the best way",
      },
    },
    {
      question: "What's your favorite memory of us?",
      emojis: ["💕", "✨", "🌅", "🎉", "🌟", "❤️"],
      answers: {
        "💕": "Our first date - I knew right then you were special",
        "✨": "That sunset we watched together - time stood still",
        "🌅": "Waking up next to you every morning - my favorite way to start the day",
        "🎉": "Celebrating our first anniversary - so many more to come!",
        "🌟": "Every little moment we share - they all add up to something beautiful",
        "❤️": "All of them. Every single memory with you is my favorite",
      },
    },
    {
      question: "What's one thing you want to do together in 2025?",
      emojis: ["✈️", "🏖️", "🎨", "🎬", "🍕", "💑"],
      answers: {
        "✈️": "Travel somewhere new together - maybe that place you've always wanted to visit!",
        "🏖️": "A beach vacation - just us, sand, and endless sunsets",
        "🎨": "Take a cooking class together - let's master that recipe!",
        "🎬": "Start a new hobby together - something we can both enjoy",
        "🍕": "Try every pizza place in town - our own pizza tour!",
        "💑": "Just spend more time together, doing anything and everything",
      },
    },
  ],
  
  // Colors (Romantic Pastels - Option A)
  colors: {
    primary: "#F4A6C1", // Soft Rose
    secondary: "#E8979D", // Blush Pink
    accent: "#D4A574", // Rose Gold
  },
};

// Helper function to calculate days together
export function getDaysTogether(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Helper function to get next milestone
export function getNextMilestone(milestones: Milestone[]): Milestone | null {
  const now = new Date();
  const upcoming = milestones
    .map(m => ({ ...m, dateObj: new Date(m.date) }))
    .filter(m => m.dateObj > now)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  
  return upcoming.length > 0 ? upcoming[0] : null;
}

