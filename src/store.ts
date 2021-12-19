import {configureStore, createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {EvaluationAndBestMove, Stockfish} from './stockfish';

export const calculateEval = createAsyncThunk<EvaluationAndBestMove, string, {extra: Stockfish}>(
	'stockfish/calculateEval',
	async (fen, thunkAPI) => {
		thunkAPI.dispatch(setDepth(0));
		const cb = (depth: number) => {
			thunkAPI.dispatch(setDepth(depth));
		};
		return thunkAPI.extra.getEval(fen, cb);
	},
);

const stockfishSlice = createSlice({
	name: 'stockfish',
	initialState: {
		// evaluation is the calculated evaluation in centipawns. evaluation is null when Stockfish is not done
		// calculating.
		evaluation: null as EvaluationAndBestMove | null,
		// Current depth of calculation
		currentDepth: 0,
	},
	reducers: {
		setDepth(state, {payload}: PayloadAction<number>) {
			state.currentDepth = payload;
		},
	},
	extraReducers: builder => {
		builder.addCase(calculateEval.fulfilled, (state, action) => {
			state.evaluation = action.payload;
		});
	},
});

const {setDepth} = stockfishSlice.actions;

const gameSlice = createSlice({
	name: 'game',
	initialState: {
		currentQuestion: 0,
		points: 0,
	},
	reducers: {
		incrementQuestion(state) {
			state.currentQuestion += 1;
		},
		addPoints(state, {payload}: PayloadAction<number>) {
			state.points += payload;
		},
	},
});

const {addPoints} = gameSlice.actions;

export const store = configureStore({
	reducer: {
		stockfish: stockfishSlice.reducer,
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
