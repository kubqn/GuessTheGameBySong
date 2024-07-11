import { createReducer } from '@reduxjs/toolkit'
import {
  setIsCorrectAnswer,
  setLife,
  setAttemptNumber,
  setActiveIndex,
  setIndex,
  setRoundInformation,
  setPoints,
  setRound,
  resetState,
  setIsPlaying,
  setPowerUps,
} from './actions'
import shuffleArray from '../components/others/shuffle'
import rounds from '../components/others/rounds'

interface AppState {
  isCorrectAnswer: boolean
  life: number
  attemptNumber: number
  activeIndex: number
  index: number
  roundInformation: object | null
  points: number
  round: number
  isPlaying: boolean
  powerUps: object
}

export interface RoundInformation {
  songList: string[]
  answer: string
}

export interface PowerUpsInterface {
  points: number
  shield: {
    isActive: boolean
    left: number
  }
  unlockedButtons: boolean
}

const initialState: AppState = {
  isCorrectAnswer: false,
  life: 5,
  attemptNumber: 1,
  activeIndex: 0,
  index: 0,
  roundInformation: [
    {
      songList: undefined,
      answer: undefined,
    },
  ],
  points: 0,
  round: 1,
  isPlaying: false,
  powerUps: {
    points: 0,
    shield: {
      isActive: false,
      left: 0,
    },
    unlockedButtons: false,
  },
}

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setIsCorrectAnswer, (state, action) => {
      state.isCorrectAnswer = action.payload
    })
    .addCase(setLife, (state, action) => {
      state.life = action.payload
    })
    .addCase(setAttemptNumber, (state, action) => {
      state.attemptNumber = action.payload
    })
    .addCase(setActiveIndex, (state, action) => {
      state.activeIndex = action.payload
    })
    .addCase(setIndex, (state, action) => {
      state.index = action.payload
    })
    .addCase(setRoundInformation, (state, action) => {
      state.roundInformation = action.payload
    })
    .addCase(setPoints, (state, action) => {
      state.points = action.payload
    })
    .addCase(setRound, (state, action) => {
      state.round = action.payload
    })
    .addCase(resetState, () => {
      return {
        ...initialState,
        roundInformation: shuffleArray(rounds),
      }
    })
    .addCase(setIsPlaying, (state, action) => {
      state.isPlaying = action.payload
    })
    .addCase(setPowerUps, (state, action) => {
      state.powerUps = action.payload
    })
})

export default reducer
