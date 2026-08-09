import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { RequestStatus } from './types'

export const selectGameId = (state: RootState) => state.app.gameId
export const selectRound = (state: RootState) => state.app.round
export const selectPoints = (state: RootState) => state.app.points
export const selectBonusPoints = (state: RootState) => state.app.bonusPoints
export const selectLives = (state: RootState) => state.app.lives
export const selectMaxLives = (state: RootState) => state.app.maxLives
export const selectShieldLeft = (state: RootState) => state.app.shieldLeft
export const selectAllUnlocked = (state: RootState) => state.app.allUnlocked
export const selectCurrentSong = (state: RootState) => state.app.currentSong
export const selectTotalSongs = (state: RootState) => state.app.totalSongs
export const selectActiveIndex = (state: RootState) => state.app.activeIndex
export const selectRoundCompleted = (state: RootState) =>
  state.app.roundCompleted
export const selectGameEnded = (state: RootState) => state.app.gameEnded
export const selectIsCorrect = (state: RootState) => state.app.isCorrect
export const selectCorrectAnswer = (state: RootState) => state.app.correctAnswer
export const selectResponseText = (state: RootState) => state.app.responseText
export const selectIsInfinite = (state: RootState) => state.app.isInfinite
export const selectIsPlaying = (state: RootState) => state.app.isPlaying
export const selectError = (state: RootState) => state.app.error
export const selectGameCatalog = (state: RootState) => state.catalog.games
export const selectAbilityCatalog = (state: RootState) =>
  state.catalog.abilities
export const selectAbilityCooldowns = (state: RootState) =>
  state.app.abilityCooldowns
export const selectPlayedGames = (state: RootState) => state.app.playedGames
export const selectWrongGuesses = (state: RootState) => state.app.wrongGuesses
export const selectAnimationType = (state: RootState) => state.animation
export const selectSettings = (state: RootState) => state.settings

export const selectIsBusy = (state: RootState) =>
  state.app.status === RequestStatus.Loading

export const selectServableSongIndexes = createSelector(
  [
    selectTotalSongs,
    selectCurrentSong,
    selectAllUnlocked,
    selectRoundCompleted,
  ],
  (totalSongs, currentSong, allUnlocked, roundCompleted) =>
    Array.from({ length: totalSongs }, (_, index) => index).filter(
      (index) => allUnlocked || roundCompleted || index <= currentSong
    )
)
