import { createAction } from '@reduxjs/toolkit'

export const setIsCorrectAnswer = createAction<boolean>('SET_IS_CORRECT_ANSWER')
export const setLife = createAction<number>('SET_LIFE')
export const setAttemptNumber = createAction<number>('SET_ATTEMPT_NUMBER')
export const setActiveIndex = createAction<number>('SET_ACTIVE_INDEX')
export const setIndex = createAction<number>('SET_INDEX')
export const setRoundInformation = createAction<Array<object> | null>(
  'SET_ROUND_INFORMATION'
)
export const setPoints = createAction<number>('SET_POINTS')
export const setRound = createAction<number>('SET_ROUND')
export const resetState = createAction('resetState')
export const setIsPlaying = createAction<boolean>('SET_IS_PLAYING')
export const setPowerUps = createAction<object>('SET_POWER_UPS')
