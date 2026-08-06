import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'
import reducer from './reducer'
import settingsReducer from './settings'
import { PageAnimation } from './types'

const animationSlice = createSlice({
  name: 'animation',
  initialState: PageAnimation.Right as PageAnimation,
  reducers: {
    setAnimationType: (_state, action: PayloadAction<PageAnimation>) =>
      action.payload,
  },
})

const store = configureStore({
  reducer: {
    app: reducer,
    animation: animationSlice.reducer,
    settings: settingsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const { setAnimationType } = animationSlice.actions

export default store
