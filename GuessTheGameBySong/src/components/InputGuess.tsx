import './css/inputguess.css'
import { useState, ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { useAppSelector } from '../store/hooks'
import { selectGameCatalog, selectIsBusy } from '../store/selectors'

interface InputGuessProps {
  inputValue: string
  setInputValue: (value: string) => void
  onSubmitGuess: (value: string) => void
}

const SHOW_ALL_QUERY = '!*'
const MIN_QUERY_LENGTH = 3
const SUGGESTIONS_FADE_SECONDS = 0.5

const InputGuess = ({
  inputValue,
  setInputValue,
  onSubmitGuess,
}: InputGuessProps) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestions = useAppSelector(selectGameCatalog)
  const isBusy = useAppSelector(selectIsBusy)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    const query = value.trim().toLowerCase()

    if (query === SHOW_ALL_QUERY) {
      setFilteredSuggestions(suggestions)
      setShowSuggestions(true)
    } else if (query.length >= MIN_QUERY_LENGTH) {
      setFilteredSuggestions(
        suggestions.filter((suggestion) =>
          suggestion.toLowerCase().includes(query)
        )
      )
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setShowSuggestions(false)
  }

  const handleSubmit = () => {
    setShowSuggestions(false)
    onSubmitGuess(inputValue)
  }

  return (
    <div className='flex-container'>
      <div>
        <input
          className='guess-input'
          type='text'
          value={inputValue}
          onChange={handleChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder='Type to search...'
        />
        {showSuggestions && inputValue && (
          <motion.ul
            className='guess-ul'
            initial='hidden'
            animate='visible'
            variants={{ visible: { opacity: 1 }, hidden: { opacity: 0 } }}
            transition={{ duration: SUGGESTIONS_FADE_SECONDS }}
          >
            {filteredSuggestions.map((suggestion) => (
              <li
                className='guess-li'
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </motion.ul>
        )}
        <button
          className='button-common'
          style={{ display: 'block' }}
          disabled={isBusy}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  )
}

export default InputGuess
