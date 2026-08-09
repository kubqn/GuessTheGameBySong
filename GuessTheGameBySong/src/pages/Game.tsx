import MusicPlayer from '../components/MusicPlayer'
import Hearts from '../components/Hearts'
import SongSelector from '../components/SongSelector'
import InputGuess from '../components/InputGuess'
import {
  activateAbility,
  clearError,
  nextRound,
  resetState,
  restorePlayedGames,
  restoreWrongGuesses,
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
import WrongGuesses from '../components/WrongGuesses'
import GameMenu from '../components/GameMenu'
import { Ability } from '../api'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { watchPrefetchProgress } from '../components/others/audioPrefetch'
import {
  selectAllUnlocked,
  selectError,
  selectGameCatalog,
  selectGameEnded,
  selectGameId,
  selectIsBusy,
  selectIsInfinite,
  selectPlayedGames,
  selectRound,
  selectRoundCompleted,
  selectSettings,
  selectWrongGuesses,
} from '../store/selectors'
import { GamePhase, PageAnimation } from '../store/types'
import { setAnimationType } from '../store/store'
import { useNavigate } from 'react-router-dom'
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
  const playedGames = useAppSelector(selectPlayedGames)
  const wrongGuesses = useAppSelector(selectWrongGuesses)
  const totalGames = useAppSelector(selectGameCatalog).length
  const allUnlocked = useAppSelector(selectAllUnlocked)
  const { showRoundCount } = useAppSelector(selectSettings)

  const [inputValue, setInputValue] = useState('')
  const [bootstrapped, setBootstrapped] = useState(false)
  const [clipsLoading, setClipsLoading] = useState(0)

  useEffect(() => {
    watchPrefetchProgress(setClipsLoading)
    return () => watchPrefetchProgress(null)
  }, [])

  const navigate = useNavigate()

  useEffect(() => {
    const storedGameId = readStored(StorageKey.GameId)
    if (!storedGameId) {
      setBootstrapped(true)
      return
    }

    const stored = readStored(StorageKey.PlayedGames)
    if (stored) {
      try {
        const { gameId: storedFor, games } = JSON.parse(stored)
        if (storedFor === storedGameId && Array.isArray(games)) {
          dispatch(restorePlayedGames(games))
        }
      } catch {
        removeStored(StorageKey.PlayedGames)
      }
    }
    dispatch(resumeGame(storedGameId))
      .unwrap()
      .then(({ current_round }) => {
        const storedGuesses = readStored(StorageKey.WrongGuesses)
        if (!storedGuesses) {
          return
        }
        const { gameId: storedFor, round, guesses } = JSON.parse(storedGuesses)
        if (
          storedFor === storedGameId &&
          round === current_round &&
          Array.isArray(guesses)
        ) {
          dispatch(restoreWrongGuesses(guesses))
        }
      })
      .catch(() => removeStored(StorageKey.WrongGuesses))
      .finally(() => setBootstrapped(true))
  }, [dispatch])

  useEffect(() => {
    if (gameId) {
      writeStored(
        StorageKey.PlayedGames,
        JSON.stringify({ gameId, games: playedGames })
      )
    } else {
      removeStored(StorageKey.PlayedGames)
    }
  }, [gameId, playedGames])

  useEffect(() => {
    if (gameId) {
      writeStored(
        StorageKey.WrongGuesses,
        JSON.stringify({ gameId, round, guesses: wrongGuesses })
      )
    } else {
      removeStored(StorageKey.WrongGuesses)
    }
  }, [gameId, round, wrongGuesses])

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

  const handleChangeMode = () => {
    setInputValue('')
    dispatch(resetState())
  }

  const handleReturnHome = (abandonRun: boolean) => {
    if (abandonRun) {
      setInputValue('')
      dispatch(resetState())
    }
    dispatch(setAnimationType(PageAnimation.Left))
    navigate('/')
  }

  const handleAbility = (ability: Ability) => {
    dispatch(activateAbility(ability))
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
        {/*the server never repeats a game, so the library size is the run's ceiling*/}
        <h1>
          Round {round}
          {showRoundCount && totalGames > 0 && ` of ${totalGames}`}
        </h1>
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
        <WrongGuesses />
        <ResultMessage handleNextRound={handleNextRound} />
        {gameEnded && <GameOver />}
        {!isInfinite && (
          <PowerUps
            onUseAbility={handleAbility}
            fullSongsLoading={
              (allUnlocked || roundCompleted) && clipsLoading > 0
            }
          />
        )}
        {!gameEnded && (
          <GameMenu
            onChangeMode={handleChangeMode}
            onReturnHome={handleReturnHome}
          />
        )}
      </motion.div>
    </div>
  )
}

export default Game
