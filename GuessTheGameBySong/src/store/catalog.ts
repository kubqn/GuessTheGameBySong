import { createSlice } from '@reduxjs/toolkit'
import type { AbilityCatalog } from '../api'
import { loadAbilityCatalog, loadGameCatalog } from './actions'

export interface CatalogState {
  games: string[]
  abilities: AbilityCatalog
}

const initialState: CatalogState = {
  games: [],
  abilities: {},
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadGameCatalog.fulfilled, (state, action) => {
        state.games = action.payload
      })
      .addCase(loadAbilityCatalog.fulfilled, (state, action) => {
        state.abilities = action.payload
      })
  },
})

export default catalogSlice.reducer
