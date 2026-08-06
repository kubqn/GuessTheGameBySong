import {
  createReducer,
  type PayloadAction,
  type UnknownAction,
} from '@reduxjs/toolkit'
import {
  clearError,
  GAME_THUNK_PREFIX,
  loadGameCatalog,
  resetState,
  restorePlayedGames,
  restoreWrongGuesses,
  setActiveIndex,
  setIsPlaying,
  startGame,
  submitGuess,
} from './actions'
import type { GameState } from '../api'
import { RequestStatus } from './types'

const DEFAULT_MAX_LIVES = 5
const DEFAULT_TOTAL_SONGS = 3
const FIRST_ROUND = 1
const FIRST_SONG_INDEX = 0

export interface AppState {
  gameId: string | null
  round: number
  points: number
  bonusPoints: number
  lives: number
  maxLives: number
  shieldLeft: number
  allUnlocked: boolean
  currentSong: number
  totalSongs: number
  activeIndex: number
  roundCompleted: boolean
  gameEnded: boolean
  isCorrect: boolean | null
  correctAnswer: string | null
  responseText: string
  isInfinite: boolean
  isPlaying: boolean
  status: RequestStatus
  error: string | null
  gameCatalog: string[]
  playedGames: string[]
  wrongGuesses: WrongGuess[]
}

export interface WrongGuess {
  text: string
  correctFranchise: boolean
}

const initialState: AppState = {
  gameId: null,
  round: FIRST_ROUND,
  points: 0,
  bonusPoints: 0,
  lives: DEFAULT_MAX_LIVES,
  maxLives: DEFAULT_MAX_LIVES,
  shieldLeft: 0,
  allUnlocked: false,
  currentSong: FIRST_SONG_INDEX,
  totalSongs: DEFAULT_TOTAL_SONGS,
  activeIndex: FIRST_SONG_INDEX,
  roundCompleted: false,
  gameEnded: false,
  isCorrect: null,
  correctAnswer: null,
  responseText: '',
  isInfinite: false,
  isPlaying: false,
  status: RequestStatus.Idle,
  error: null,
  gameCatalog: [],
  playedGames: [],
  wrongGuesses: [],
}

const applyGameState = (state: AppState, payload: GameState) => {
  const roundChanged = payload.current_round !== state.round
  const songUnlocked = payload.current_song > state.currentSong

  state.gameId = payload.game_id
  state.round = payload.current_round
  state.points = payload.current_points
  state.bonusPoints = payload.current_bonus_points
  state.lives = payload.lives_left
  state.maxLives = payload.max_lives
  state.shieldLeft = payload.shield_left
  state.allUnlocked = payload.all_unlocked
  state.currentSong = payload.current_song
  state.totalSongs = payload.total_songs
  state.roundCompleted = payload.round_completed
  state.gameEnded = payload.game_ended
  state.isCorrect = payload.is_correct
  state.correctAnswer = payload.correct_answer
  state.responseText = payload.response_text
  state.isInfinite = payload.is_infinite

  if (payload.correct_answer && !state.playedGames.includes(payload.correct_answer)) {
    state.playedGames.push(payload.correct_answer)
  }

  if (roundChanged) {
    state.wrongGuesses = []
  }

  if (roundChanged || (songUnlocked && !payload.all_unlocked)) {
    state.activeIndex = payload.current_song
    state.isPlaying = false
  }
  if (payload.game_ended) {
    state.isPlaying = false
  }
}

const THUNK_PENDING = '/pending'
const THUNK_FULFILLED = '/fulfilled'
const THUNK_REJECTED = '/rejected'

const isGameAction = (action: UnknownAction, lifecycle: string) =>
  action.type.startsWith(GAME_THUNK_PREFIX) && action.type.endsWith(lifecycle)

const isGamePending = (action: UnknownAction) =>
  isGameAction(action, THUNK_PENDING)

const isGameFulfilled = (
  action: UnknownAction
): action is PayloadAction<GameState> =>
  isGameAction(action, THUNK_FULFILLED)

const isGameRejected = (
  action: UnknownAction
): action is PayloadAction<string | undefined> =>
  isGameAction(action, THUNK_REJECTED)

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setActiveIndex, (state, action) => {
      state.activeIndex = action.payload
      state.isPlaying = false
    })
    .addCase(setIsPlaying, (state, action) => {
      state.isPlaying = action.payload
    })
    .addCase(clearError, (state) => {
      state.error = null
    })
    .addCase(resetState, (state) => ({
      ...initialState,
      gameCatalog: state.gameCatalog,
    }))
    .addCase(loadGameCatalog.fulfilled, (state, action) => {
      state.gameCatalog = action.payload
    })
    .addCase(restorePlayedGames, (state, action) => {
      state.playedGames = action.payload
    })
    .addCase(restoreWrongGuesses, (state, action) => {
      state.wrongGuesses = action.payload
    })
    .addCase(startGame.fulfilled, (state) => {
      state.playedGames = []
      state.wrongGuesses = []
    })
    .addCase(submitGuess.fulfilled, (state, action) => {
      if (action.payload.is_correct !== false) {
        return
      }
      const text = action.meta.arg.trim()
      const alreadyListed = state.wrongGuesses.some(
        (guess) => guess.text.toLowerCase() === text.toLowerCase()
      )
      if (!alreadyListed) {
        state.wrongGuesses.push({
          text,
          correctFranchise: action.payload.correct_franchise ?? false,
        })
      }
    })
    .addMatcher(isGamePending, (state) => {
      state.status = RequestStatus.Loading
      state.error = null
    })
    .addMatcher(isGameFulfilled, (state, action) => {
      state.status = RequestStatus.Ready
      state.error = null
      applyGameState(state, action.payload)
    })
    .addMatcher(isGameRejected, (state, action) => {
      state.status = RequestStatus.Error
      state.error = action.payload ?? 'Request failed'
    })
})

export default reducer
