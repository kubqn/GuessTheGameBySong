import { createAction, createAsyncThunk } from '@reduxjs/toolkit'
import {
  abilityCatalogRequest,
  abilityRequest,
  gameCatalogRequest,
  gameStateRequest,
  guessRequest,
  nextRoundRequest,
  skipSongRequest,
  startGameRequest,
  type Ability,
  type AbilityCatalog,
  type GameState,
} from '../api'
import type { RootState } from './store'
import type { WrongGuess } from './reducer'

export const GAME_THUNK_PREFIX = 'game/'

const FALLBACK_ERROR_MESSAGE = 'Request failed'
const NO_ACTIVE_GAME_MESSAGE = 'No active game'

export const setActiveIndex = createAction<number>('SET_ACTIVE_INDEX')
export const setIsPlaying = createAction<boolean>('SET_IS_PLAYING')
export const clearError = createAction('CLEAR_ERROR')
export const resetState = createAction('RESET_STATE')
export const restorePlayedGames = createAction<string[]>('RESTORE_PLAYED_GAMES')
export const restoreWrongGuesses = createAction<WrongGuess[]>(
  'RESTORE_WRONG_GUESSES'
)

const toMessage = (error: unknown) =>
  error instanceof Error ? error.message : FALLBACK_ERROR_MESSAGE

const gameThunk = <Arg = void>(
  type: string,
  run: (gameId: string, arg: Arg) => Promise<GameState>
) =>
  createAsyncThunk<
    GameState,
    Arg,
    { state: RootState; rejectValue: string }
  >(`${GAME_THUNK_PREFIX}${type}`, async (arg, { getState, rejectWithValue }) => {
    const gameId = getState().app.gameId
    if (!gameId) {
      return rejectWithValue(NO_ACTIVE_GAME_MESSAGE)
    }
    try {
      return await run(gameId, arg)
    } catch (error) {
      return rejectWithValue(toMessage(error))
    }
  })

export const startGame = createAsyncThunk<
  GameState,
  boolean,
  { rejectValue: string }
>(`${GAME_THUNK_PREFIX}start`, async (infinite, { rejectWithValue }) => {
  try {
    return await startGameRequest(infinite)
  } catch (error) {
    return rejectWithValue(toMessage(error))
  }
})

export const resumeGame = createAsyncThunk<
  GameState,
  string,
  { rejectValue: string }
>(`${GAME_THUNK_PREFIX}resume`, async (gameId, { rejectWithValue }) => {
  try {
    return await gameStateRequest(gameId)
  } catch (error) {
    return rejectWithValue(toMessage(error))
  }
})

export const submitGuess = gameThunk<string>('guess', (gameId, guess) =>
  guessRequest(gameId, guess)
)

export const skipSong = gameThunk('skip', (gameId) => skipSongRequest(gameId))

export const nextRound = gameThunk('next', (gameId) => nextRoundRequest(gameId))

export const activateAbility = gameThunk<Ability>('ability', (gameId, ability) =>
  abilityRequest(gameId, ability)
)

export const loadGameCatalog = createAsyncThunk<
  string[],
  void,
  { rejectValue: string }
>('catalog/load', async (_, { rejectWithValue }) => {
  try {
    return await gameCatalogRequest()
  } catch (error) {
    return rejectWithValue(toMessage(error))
  }
})

export const loadAbilityCatalog = createAsyncThunk<
  AbilityCatalog,
  void,
  { rejectValue: string }
>('catalog/abilities', async (_, { rejectWithValue }) => {
  try {
    return await abilityCatalogRequest()
  } catch (error) {
    return rejectWithValue(toMessage(error))
  }
})
