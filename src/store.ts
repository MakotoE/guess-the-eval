import {
  AnyAction,
  configureStore,
  createSlice,
  isRejected,
  Middleware,
  MiddlewareAPI,
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

const errorHandler: Middleware
  // eslint-disable-next-line operator-linebreak
  = (api: MiddlewareAPI<typeof store.dispatch, RootState>) => (next) => (action: AnyAction) => {
    if (isRejected(action)) {
      api.dispatch(setError(`error: ${JSON.stringify(action.payload)}`));
    }
    return next(action);
  };

export const store = configureStore({
  reducer: {
    game: gameSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(errorHandler),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
