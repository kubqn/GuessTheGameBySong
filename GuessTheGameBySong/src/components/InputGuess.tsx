import './css/inputguess.css'
import { useState, ChangeEvent } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { RoundInformation } from '../store/reducer'
import { motion } from 'framer-motion'

interface InputGuessProps {
  suggestions: string[]
  inputValue: string
  onCorrectGuess: () => void
  onIncorrectGuess: () => void
  setInputValue: (value: string) => void
}
const InputGuess = ({
  suggestions,
  inputValue,
  onCorrectGuess,
  onIncorrectGuess,
  setInputValue,
}: InputGuessProps) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

  const index = useSelector((state: RootState) => state.app.index)

  const roundInformation = useSelector(
    (state: RootState) => state.app.roundInformation as RoundInformation[]
  )

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (value.trim() === '!*')
    {
        setFilteredSuggestions(suggestions)
        setShowSuggestions(true)
    }
    else if (value.trim().length > 2) {
      const filtered = suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase().trim())
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setShowSuggestions(false)
  }

  const handleSubmit = (value: string) => {
    if (roundInformation[index]?.answer === value.trim()) {
      onCorrectGuess()
      setInputValue('')
    } else if (
      roundInformation[index]?.answer !== value.trim() &&
      value.trim() !== ''
    ) {
      onIncorrectGuess()
      setInputValue('')
    }
  }

  return (
    <div className='flex-container'>
      <div>
        <input
          className='guess-input'
          type='text'
          value={inputValue}
          onChange={handleChange}
          placeholder='Type to search...'
        />
        {showSuggestions && inputValue && (
          <motion.ul
            className='guess-ul'
            initial='hidden'
            animate='visible'
            variants={{ visible: { opacity: 1 }, hidden: { opacity: 0 } }}
            transition={{ duration: 0.5 }}
          >
            {filteredSuggestions.map((suggestion, index) => (
              <li
                className='guess-li'
                key={index}
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
          onClick={() => handleSubmit(inputValue)}
        >
          Submit
        </button>
      </div>
    </div>
  )
}

export default InputGuess
