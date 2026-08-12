const DEFAULT_API_URL = 'http://localhost:2137'
const NETWORK_ERROR_STATUS = 0
const REQUEST_TIMEOUT_MS = 15000

export const API_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL

export interface GameState {
  game_id: string
  response_text: string
  is_correct: boolean | null
  current_bonus_points: number
  current_points: number
  current_round: number
  current_song: number
  total_songs: number
  lives_left: number
  max_lives: number
  shield_left: number
  all_unlocked: boolean
  round_completed: boolean
  is_infinite: boolean
  game_ended: boolean
  correct_answer: string | null
  correct_franchise: boolean | null
  ability_cooldowns: Record<string, number> | null
  clip_times: number[] | null
}

export enum Ability {
  Shield = 'shield',
  Unlock = 'unlock',
  SkipRound = 'skip_round',
  ExtraLife = 'extra_life',
}

export interface AbilityInfo {
  cost: number
  cooldown: number
  description: string
  pretty_name: string
}

export type AbilityCatalog = Partial<Record<Ability, AbilityInfo>>

export enum GameAction {
  Start = 'start',
  Guess = 'guess',
  Next = 'next',
  Ability = 'ability',
  Skip = 'skip',
}

export interface GameActionPayload {
  action: GameAction
  game_id?: string
  guessed_game?: string
  ability_used?: Ability
  infinite?: boolean
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const isTimeout = (error: unknown) =>
  error instanceof DOMException && error.name === 'TimeoutError'

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (error) {
    throw new ApiError(
      isTimeout(error)
        ? 'The game server took too long'
        : 'Cannot reach the game server',
      NETWORK_ERROR_STATUS
    )
  }

  const body = await response.text()
  let data: unknown
  try {
    data = body ? JSON.parse(body) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    const message =
      (data as { error?: string } | null)?.error ??
      `Request failed (${response.status})`
    throw new ApiError(message, response.status)
  }
  return data as T
}

export const sendGameAction = (payload: GameActionPayload) =>
  request<GameState>('/play', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

export const startGameRequest = (infinite: boolean) =>
  sendGameAction({ action: GameAction.Start, infinite })

export const guessRequest = (gameId: string, guessedGame: string) =>
  sendGameAction({
    action: GameAction.Guess,
    game_id: gameId,
    guessed_game: guessedGame,
  })

export const skipSongRequest = (gameId: string) =>
  sendGameAction({ action: GameAction.Skip, game_id: gameId })

export const nextRoundRequest = (gameId: string) =>
  sendGameAction({ action: GameAction.Next, game_id: gameId })

export const abilityRequest = (gameId: string, ability: Ability) =>
  sendGameAction({
    action: GameAction.Ability,
    game_id: gameId,
    ability_used: ability,
  })

export const gameStateRequest = (gameId: string) =>
  request<GameState>(`/game_state/${gameId}`)

export const abilityCatalogRequest = () =>
  request<AbilityCatalog>('/abilities_data')

export const gameCatalogRequest = () =>
  request<{ games: string[] }>('/autofill').then((data) => data.games)

export const audioUrl = (
  gameId: string,
  songNumber: number,
  round: number,
  full = false
) =>
  `${API_URL}/${full ? 'get_full_audio' : 'get_audio'}/${gameId}/${songNumber}?round=${round}`
