import MusicPlayer from '../components/MusicPlayer'
import Hearts from '../components/Hearts'
import SongSelector from '../components/SongSelector'
import InputGuess from '../components/InputGuess'
import {
  activateAbility,
  clearError,
  loadGameCatalog,
  nextRound,
  resetState,
  resumeGame,
  skipSong,
  startGame,
  submitGuess,
} from '../store/actions'
import { motion } from 'framer-motion'
import ResultMessage from '../components/ResultMessage'
import { useState, useEffect } from 'react'
import GameMode from '../components/GameMode'
import GameOver from '../components/GameOver'
import PowerUps from '../components/PowerUps'
import { Ability } from '../api'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  selectError,
  selectGameEnded,
  selectGameId,
  selectIsBusy,
  selectIsInfinite,
  selectRound,
  selectRoundCompleted,
} from '../store/selectors'
import { GamePhase } from '../store/types'
import { readStored, removeStored, StorageKey, writeStored } from '../storage'

const ROUND_ENTRY_ANIMATION = {
  initial: { opacity: 0, scale: 0.3 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 1 },
}

const Game = () => {
  const dispatch = useAppDispatch()

  const gameId = useAppSelector(selectGameId)
  const round = useAppSelector(selectRound)
  const isInfinite = useAppSelector(selectIsInfinite)
  const roundCompleted = useAppSelector(selectRoundCompleted)
  const gameEnded = useAppSelector(selectGameEnded)
  const isBusy = useAppSelector(selectIsBusy)
  const error = useAppSelector(selectError)

  const [inputValue, setInputValue] = useState('')
  const [bootstrapped, setBootstrapped] = useState(false)
  const [confirmingModeChange, setConfirmingModeChange] = useState(false)

  useEffect(() => {
    dispatch(loadGameCatalog())
  }, [dispatch])

  //the server keeps games in memory, so a page reload can pick up where it left off
  useEffect(() => {
    const storedGameId = readStored(StorageKey.GameId)
    if (!storedGameId) {
      setBootstrapped(true)
      return
    }
    dispatch(resumeGame(storedGameId)).finally(() => setBootstrapped(true))
  }, [dispatch])

  useEffect(() => {
    if (gameId) {
      writeStored(StorageKey.GameId, gameId)
    } else {
      removeStored(StorageKey.GameId)
    }
  }, [gameId])

  const phase = !bootstrapped
    ? GamePhase.Bootstrapping
    : gameId
    ? GamePhase.Playing
    : GamePhase.ChoosingMode

  const handleGuess = (value: string) => {
    const guess = value.trim()
    if (!guess) {
      return
    }
    dispatch(submitGuess(guess)).finally(() => setInputValue(''))
  }

  const handleSkip = () => {
    dispatch(skipSong())
  }

  const handleNextRound = () => {
    setInputValue('')
    dispatch(nextRound())
  }

  //endless mode only ends once the library runs out, so the player needs a way back to the picker
  const handleChangeMode = () => {
    setInputValue('')
    setConfirmingModeChange(false)
    dispatch(resetState())
  }

  const handleAbility = (ability: Ability) => {
    const result = dispatch(activateAbility(ability))
    if (ability === Ability.SkipRound) {
      //the server only marks the round as done, the client still has to advance it
      result
        .unwrap()
        .then(() => dispatch(nextRound()))
        .catch(() => undefined)
    }
  }

  if (phase === GamePhase.Bootstrapping) {
    return (
      <div className='intro-box'>
        <div className='game-box'>
          <h1>Loading...</h1>
        </div>
      </div>
    )
  }

  if (phase === GamePhase.ChoosingMode) {
    return (
      <GameMode
        onChooseMode={(infinite) => {
          dispatch(clearError())
          dispatch(startGame(infinite))
        }}
        isStarting={isBusy}
        error={error}
      />
    )
  }

  return (
    <div className='intro-box'>
      <motion.div className='game-box' {...ROUND_ENTRY_ANIMATION} key={round}>
        <h1>Round {round}</h1>
        <div className='song-selector'>
          <SongSelector onSkip={handleSkip} />
          {!isInfinite && <Hearts />}
        </div>
        <MusicPlayer />
        {error && <p className='server-error'>{error}</p>}
        {!roundCompleted && !gameEnded && (
          <InputGuess
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSubmitGuess={handleGuess}
          />
        )}
        <ResultMessage handleNextRound={handleNextRound} />
        {gameEnded && <GameOver />}
        {!isInfinite && <PowerUps onUseAbility={handleAbility} />}
        {/*both states share one grid cell, so the frame keeps the size of the bigger one*/}
        {!gameEnded && (
          <div className='change-mode-slot'>
            <button
              className={`button-common change-mode-button${
                confirmingModeChange ? ' is-hidden' : ''
              }`}
              onClick={() => setConfirmingModeChange(true)}
            >
              Change mode
            </button>
            <div
              className={`change-mode${confirmingModeChange ? '' : ' is-hidden'}`}
            >
              <p>Give up this run and pick another mode?</p>
              <button className='button-common' onClick={handleChangeMode}>
                Yes
              </button>
              <button
                className='button-common'
                onClick={() => setConfirmingModeChange(false)}
              >
                No
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Game
