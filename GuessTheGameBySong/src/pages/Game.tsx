import MusicPlayer from '../components/MusicPlayer'
import Hearts from '../components/Hearts'
import SongSelector from '../components/SongSelector'
import InputGuess from '../components/InputGuess'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { PowerUpsInterface, RoundInformation } from '../store/reducer'
import {
  setActiveIndex,
  setAttemptNumber,
  setIsCorrectAnswer,
  setLife,
  setPoints,
  setRound,
  setRoundInformation,
  setIsPlaying,
  setIndex,
  setPowerUps,
} from '../store/actions'
import { motion } from 'framer-motion'
import ResultMessage from '../components/ResultMessage'
import { useState, useEffect } from 'react'
import GameMode from '../components/GameMode'
import GameOver from '../components/GameOver'
import PowerUps from '../components/PowerUps'
import shuffleArray from '../components/others/shuffle'
import rounds from '../components/others/rounds'

const Game = () => {
  const points = useSelector((state: RootState) => state.app.points)
  const round = useSelector((state: RootState) => state.app.round)
  const index = useSelector((state: RootState) => state.app.index)
  const activeIndex = useSelector((state: RootState) => state.app.activeIndex)
  const life = useSelector((state: RootState) => state.app.life)

  const roundInformation = useSelector(
    (state: RootState) => state.app.roundInformation as RoundInformation[]
  )
  const attemptNumber = useSelector(
    (state: RootState) => state.app.attemptNumber
  )
  const isCorrectAnswer = useSelector(
    (state: RootState) => state.app.isCorrectAnswer
  )
  const powerUps = useSelector(
    (state: RootState) => state.app.powerUps as PowerUpsInterface
  )

  const [inputValue, setInputValue] = useState('')
  const [isEndless, setIsEndless] = useState(false)
  const [isGameModeChosen, setIsGameModeChosen] = useState(false)

  const dispatch = useDispatch()

  useEffect(() => {
    console.log(roundInformation)
    console.log(suggestions)
    if (roundInformation[index + 1] === undefined) {
      dispatch(setRoundInformation(shuffleArray(rounds)))
      dispatch(setIndex(0))
    }
  }, [index])

  const suggestions = rounds.map((games) => {
    return games.answer
  })

  const handleCorrectGuess = () => {
    if (attemptNumber === 1) {
      dispatch(setPowerUps({ ...powerUps, points: powerUps.points + 1 }))
    }
    dispatch(setPoints(points + 1))
    dispatch(setIsCorrectAnswer(true))
    setInputValue('')
  }

  const handleIncorrectGuess = () => {
    if (powerUps.shield.isActive) {
      setInputValue('')
      dispatch(
        setPowerUps({
          ...powerUps,
          shield: {
            isActive: powerUps.shield.left - 1 > 0,
            left: powerUps.shield.left - 1,
          },
        })
      )
    } else {
      if (!isEndless) {
        dispatch(setLife(life - 1))
      }
      dispatch(setActiveIndex(activeIndex + 1))
      dispatch(setAttemptNumber(attemptNumber + 1))
      setInputValue('')
    }
  }

  const handleSkip = () => {
    if (attemptNumber === 4) {
      dispatch(setAttemptNumber(1))
      dispatch(setActiveIndex(1))
    } else {
      if (!isEndless) {
        dispatch(setLife(life - 1))
      }
      dispatch(setAttemptNumber(attemptNumber + 1))
      dispatch(setActiveIndex(attemptNumber))
      dispatch(setIsPlaying(false))
    }
  }

  const handleNextRound = () => {
    dispatch(setAttemptNumber(1))
    dispatch(setActiveIndex(0))
    dispatch(setRound(round + 1))
    dispatch(setIsCorrectAnswer(false))
    dispatch(setIsPlaying(false))
    dispatch(setIndex(index + 1))
    setInputValue('')

    dispatch(
      setPowerUps({
        ...powerUps,
        shield: {
          isActive: false,
          left: 0,
        },
        unlockedButtons: false,
      })
    )
  }

  if (!isGameModeChosen) {
    return (
      <>
        <GameMode
          setIsEndless={setIsEndless}
          setIsGameModeChosen={setIsGameModeChosen}
        />
      </>
    )
  }
  return (
    <div className='intro-box'>
      <motion.div
        className='game-box'
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        key={round}
      >
        <h1>Round {round}</h1>
        <div className='song-selector'>
          <SongSelector onSkip={handleSkip} />
          {!isEndless && <Hearts />}
        </div>
        <MusicPlayer />
        {attemptNumber < 4 && life > 0 && !isCorrectAnswer && (
          <InputGuess
            suggestions={suggestions}
            onCorrectGuess={handleCorrectGuess}
            onIncorrectGuess={handleIncorrectGuess}
            inputValue={inputValue}
            setInputValue={setInputValue}
          />
        )}
        <ResultMessage
          answer={
            roundInformation !== null ? roundInformation[index].answer : ''
          }
          handleNextRound={handleNextRound}
        />
        {life === 0 && <GameOver />}
        {!isEndless && <PowerUps handleNextRound={handleNextRound} />}
      </motion.div>
    </div>
  )
}

export default Game
