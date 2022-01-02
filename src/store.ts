import {
  configureStore,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { Answer, PointsSolver, QuestionAnswer } from './PointsSolver';
import { questions } from './questions';

/* eslint-disable no-param-reassign,@typescript-eslint/no-use-before-define */

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    currentQuestion: 0,
    points: 0,
    answers: [] as Answer[],
    error: null as string | null,
  },
  reducers: {
    setError(state, { payload }: PayloadAction<string>) {
      // eslint-disable-next-line no-console
      console.error(payload);
      state.error = payload;
    },
    submitAnswer(state, { payload }: PayloadAction<Answer>) {
      state.answers.push(payload);
      const result: QuestionAnswer = {
        question: questions[state.currentQuestion],
        answer: payload,
      };
      state.points += new PointsSolver(result).totalPoints();
    },
    nextQuestion(state) {
      state.currentQuestion += 1;
    },
  },
});

export const {
  setError, submitAnswer, nextQuestion,
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
