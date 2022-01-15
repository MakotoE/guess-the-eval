import {
  configureStore,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { Answer, PointsSolver } from './PointsSolver';
import { questions } from './questions';

/* eslint-disable no-param-reassign,@typescript-eslint/no-use-before-define */

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    answers: [] as Answer[],
    error: null as string | null,
  },
  reducers: {
    setError(state, { payload }: PayloadAction<string>) {
      // eslint-disable-next-line no-console
      console.error(payload);
      state.error = payload;
    },
    addAnswer(state, { payload }: PayloadAction<Answer>) {
      state.answers.push(payload);
    },
  },
});

export function calculatePointsFromAnswers(answers: Answer[]): number {
  return answers.map((answer, index) => (
    new PointsSolver({ question: questions[index], answer }).totalPoints()
  )).reduce((sum, n) => sum + n, 0);
}

export const {
  setError, addAnswer,
} = gameSlice.actions;

export const store = configureStore({
  reducer: {
    game: gameSlice.reducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
