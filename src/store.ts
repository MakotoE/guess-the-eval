import {
	AnyAction,
	configureStore,
	createAsyncThunk,
	createSlice,
	current, isRejected,
	Middleware,
	MiddlewareAPI,
	PayloadAction,
} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {EvaluationAndBestMove, Stockfish} from './stockfish';
import {Answer, PointsSolver, QuestionResult} from './PointsSolver';
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
		error: null as string | null,
	},
	reducers: {
		setError(state, {payload}: PayloadAction<string>) {
			console.error(payload);
			state.error = payload;
		},
		setDepth(state, {payload}: PayloadAction<number>) {
			state.currentDepth = payload;
		},
		submitAnswer(state, {payload}: PayloadAction<Answer>) {
			if (state.evaluation === null) {
				throw new Error('evaluation is null');
			}
			state.lastResult = {
				question: questions[state.currentQuestion],
				answer: payload,
				stockfishEval: current(state.evaluation),
			}
			state.points += new PointsSolver(state.lastResult).totalPoints();
		},
		nextQuestion(state) {
			state.lastResult = null;
			++state.currentQuestion;
		},
	},
	extraReducers: builder => {
		builder.addCase(calculateEval.fulfilled, (state, action) => {
			state.evaluation = action.payload;
		});
	},
});

export const {setError, setDepth, submitAnswer, nextQuestion} = gameSlice.actions;

const errorHandler: Middleware = (api: MiddlewareAPI<typeof store.dispatch, RootState>) =>
	(next) => (action: AnyAction) => {
		if (isRejected(action)) {
			api.dispatch(setError(`error: ${JSON.stringify(action.payload)}`));
		}
		return next(action);
	};

export const store = configureStore({
	reducer: {
		game: gameSlice.reducer,
	},
	middleware: getDefaultMiddleware => getDefaultMiddleware({
		thunk: {
			extraArgument: new Stockfish(),
		},
	}).concat(errorHandler),
	devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
