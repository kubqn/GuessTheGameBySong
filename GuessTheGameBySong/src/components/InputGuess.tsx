import './css/inputguess.css'
import { useEffect, useRef, useState, ChangeEvent, KeyboardEvent, RefObject } from 'react'
import { motion } from 'framer-motion'
import { useAppSelector } from '../store/hooks'
import {
  selectGameCatalog,
  selectIsBusy,
  selectPlayedGames,
  selectSettings,
} from '../store/selectors'
import { KeyAction } from '../store/keybindings'

interface InputGuessProps {
  inputValue: string
  setInputValue: (value: string) => void
  onSubmitGuess: (value: string) => void
  inputRef: RefObject<HTMLInputElement>
}

const SHOW_ALL_QUERY = '!*'
const MIN_QUERY_LENGTH = 3
const SUGGESTIONS_FADE_SECONDS = 0.5
const NOTHING_HIGHLIGHTED = -1

const InputGuess = ({
  inputValue,
  setInputValue,
  onSubmitGuess,
  inputRef,
}: InputGuessProps) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlighted, setHighlighted] = useState(NOTHING_HIGHLIGHTED)

  const listRef = useRef<HTMLUListElement | null>(null)

  const suggestions = useAppSelector(selectGameCatalog)
  const isBusy = useAppSelector(selectIsBusy)
  const playedGames = useAppSelector(selectPlayedGames)
  const { strikePlayedGames, keyboardControls, keyBindings } =
    useAppSelector(selectSettings)

  const isSpent = (suggestion: string) =>
    strikePlayedGames && playedGames.includes(suggestion)

  useEffect(() => {
    if (highlighted === NOTHING_HIGHLIGHTED) {
      return
    }
    const item = listRef.current?.children[highlighted]
    item?.scrollIntoView({ block: 'nearest' })
  }, [highlighted])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setHighlighted(NOTHING_HIGHLIGHTED)

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
    setHighlighted(NOTHING_HIGHLIGHTED)
  }

  const handleSubmit = () => {
    if (isBusy) {
      return
    }
    setShowSuggestions(false)
    setHighlighted(NOTHING_HIGHLIGHTED)
    onSubmitGuess(inputValue)
  }

  const listOpen = showSuggestions && Boolean(inputValue)
  const openList = listOpen && filteredSuggestions.length > 0

  const moveHighlight = (step: number) => {
    const count = filteredSuggestions.length
    setHighlighted((current) => {
      if (current === NOTHING_HIGHLIGHTED) {
        return step > 0 ? 0 : count - 1
      }
      return (current + step + count) % count
    })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (openList && event.key === 'ArrowDown') {
      event.preventDefault()
      moveHighlight(1)
      return
    }
    if (openList && event.key === 'ArrowUp') {
      event.preventDefault()
      moveHighlight(-1)
      return
    }
    if (event.key === 'Enter') {
      if (openList && highlighted !== NOTHING_HIGHLIGHTED) {
        event.preventDefault()
        handleSuggestionClick(filteredSuggestions[highlighted])
        return
      }
      handleSubmit()
      return
    }
    if (keyboardControls && event.code === keyBindings[KeyAction.ReleaseFocus]) {
      event.preventDefault()
      if (openList) {
        setShowSuggestions(false)
        setHighlighted(NOTHING_HIGHLIGHTED)
        return
      }
      inputRef.current?.blur()
    }
  }

  return (
    <div className='flex-container'>
      <div>
        <div className='guess-field'>
          <input
            className='guess-input'
            type='text'
            ref={inputRef}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder='Type to search...'
            role='combobox'
            aria-expanded={openList}
            aria-controls='guess-suggestions'
            aria-autocomplete='list'
            aria-activedescendant={
              highlighted === NOTHING_HIGHLIGHTED
                ? undefined
                : `guess-suggestion-${highlighted}`
            }
          />
          {openList && (
            <motion.ul
              className='guess-ul'
              id='guess-suggestions'
              role='listbox'
              ref={listRef}
              initial='hidden'
              animate='visible'
              variants={{ visible: { opacity: 1 }, hidden: { opacity: 0 } }}
              transition={{ duration: SUGGESTIONS_FADE_SECONDS }}
            >
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  className={`guess-li${isSpent(suggestion) ? ' is-spent' : ''}${
                    index === highlighted ? ' is-highlighted' : ''
                  }`}
                  key={suggestion}
                  id={`guess-suggestion-${index}`}
                  role='option'
                  aria-selected={index === highlighted}
                  onMouseEnter={() => setHighlighted(index)}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </motion.ul>
          )}
        </div>
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
