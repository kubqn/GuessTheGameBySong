import { createSelector } from 'reselect'
import { RootState } from './store'

export const selectSongData = createSelector(
  (state: RootState) => state.app.attemptNumber,
  (state: RootState) => state.app.activeIndex,
  (state: RootState) => state.app.life,
  (attemptNumber, activeIndex, life) => ({
    attemptNumber,
    activeIndex,
    life,
  })
)
