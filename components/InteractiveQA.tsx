'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { personalization } from '@/lib/personalization'
import { useState } from 'react'

export default function InteractiveQA() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showAnswer, setShowAnswer] = useState(false)

  const questions = personalization.questions
  const currentQuestion = questions[currentQuestionIndex]
  const hasAnswered = selectedAnswers[currentQuestionIndex] !== undefined

  const handleEmojiClick = (emoji: string) => {
    if (!hasAnswered) {
      setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: emoji })
      setShowAnswer(true)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowAnswer(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowAnswer(selectedAnswers[currentQuestionIndex - 1] !== undefined)
    }
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const isComplete = currentQuestionIndex === questions.length - 1 && hasAnswered

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal mb-4">
          Fun Questions
        </h2>
        <p className="text-lg text-soft-gray font-inter">
          Let's see what you think! 😊
        </p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        whileInView={{ opacity: 1, width: '100%' }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <div className="w-full bg-soft-rose/20 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-soft-rose to-blush-pink rounded-full"
          />
        </div>
        <p className="text-center text-soft-gray font-inter text-sm mt-2">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </motion.div>

      {/* Question Card */}
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass rounded-3xl p-8 md:p-12 mb-8 shadow-lg"
      >
        <h3 className="text-2xl md:text-3xl font-playfair font-semibold text-charcoal mb-8 text-center">
          {currentQuestion.question}
        </h3>

        {/* Emoji Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {currentQuestion.emojis.map((emoji, index) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === emoji
            return (
              <motion.button
                key={emoji}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEmojiClick(emoji)}
                disabled={hasAnswered}
                aria-label={`Select ${emoji} reaction`}
                aria-pressed={isSelected}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full text-3xl md:text-4xl flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-soft-rose focus:ring-offset-2 ${
                  isSelected
                    ? 'bg-soft-rose text-white shadow-lg scale-110'
                    : hasAnswered
                    ? 'bg-soft-rose/20 text-soft-gray opacity-50 cursor-not-allowed'
                    : 'bg-white border-2 border-soft-rose/30 hover:border-soft-rose hover:bg-soft-rose/10 cursor-pointer'
                }`}
              >
                <span aria-hidden="true">{emoji}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Answer Reveal */}
        <AnimatePresence>
          {showAnswer && selectedAnswers[currentQuestionIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-soft-rose to-blush-pink rounded-2xl p-6 text-white"
            >
              <p className="text-lg md:text-xl font-inter text-center">
                {currentQuestion.answers[selectedAnswers[currentQuestionIndex]]}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          aria-label="Go to previous question"
          className={`px-6 py-3 rounded-full font-inter font-medium transition-all focus:outline-none focus:ring-2 focus:ring-soft-rose focus:ring-offset-2 ${
            currentQuestionIndex === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-soft-rose text-white hover:bg-blush-pink shadow-md'
          }`}
        >
          ← Previous
        </motion.button>

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center flex-1 mx-4"
          >
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-soft-gray font-inter">All questions answered!</p>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
          aria-label="Go to next question"
          className={`px-6 py-3 rounded-full font-inter font-medium transition-all focus:outline-none focus:ring-2 focus:ring-soft-rose focus:ring-offset-2 ${
            currentQuestionIndex === questions.length - 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-soft-rose text-white hover:bg-blush-pink shadow-md'
          }`}
        >
          Next →
        </motion.button>
      </div>
    </div>
  )
}

