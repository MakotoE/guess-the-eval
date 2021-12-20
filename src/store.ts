import {configureStore, createAsyncThunk, createSlice, current, PayloadAction} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {EvaluationAndBestMove, Stockfish} from './stockfish';
import {Answer, QuestionResult} from './calculatePoints';
import {questions} from './questions';

export const calculateEval = createAsyncThunk<EvaluationAndBestMove, string, {extra: Stockfish}>(
	'stockfish/calculateEval',
	async (fen, thunkAPI) => {
		thunkAPI.dispatch(setDepth(0));
		const cb = (depth: number) => {
			thunkAPI.dispatch(setDepth(depth));
		};
		return JSON.parse(JSON.stringify(await thunkAPI.extra.getEval(fen, cb))) as EvaluationAndBestMove;
	},
);

const gameSlice = createSlice({
	name: 'game',
	initialState: {
		// evaluation is the calculated evaluation in centipawns. evaluation is null when Stockfish is not done
		// calculating.
		evaluation: null as EvaluationAndBestMove | null,
		// Current depth of calculation
		currentDepth: 0,
		currentQuestion: 0,
		points: 0,
		lastResult: null as QuestionResult | null,
	},
	reducers: {
		setDepth(state, {payload}: PayloadAction<number>) {
			state.currentDepth = payload;
		},
		submitAnswer(state, {payload}: PayloadAction<Answer>) {
			if (state.evaluation === null) {
				throw new Error('evaluation is null');
			}
			state.lastResult = new QuestionResult(questions[state.currentQuestion], current(state.evaluation), payload);
			state.points += state.lastResult.totalPoints();
			state.currentQuestion += 1;
		},
	},
	extraReducers: builder => {
		builder.addCase(calculateEval.fulfilled, (state, action) => {
			state.evaluation = action.payload;
		});
	},
});

export const {setDepth, submitAnswer} = gameSlice.actions;

export const store = configureStore({
	reducer: {
		game: gameSlice.reducer,
	},
	middleware: getDefaultMiddleware => getDefaultMiddleware({
		thunk: {
			extraArgument: new Stockfish(),
		},
	}),
	devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
