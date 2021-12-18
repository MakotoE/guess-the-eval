import {configureStore, createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {Stockfish} from './stockfish';

export const calculateEval = createAsyncThunk<number, string, {extra: Stockfish}>(
	'stockfish/calculateEval',
	async (fen, thunkAPI) => {
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
		evaluation: null as number | null,
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

const pointsSlice = createSlice({
	name: 'points',
	initialState: {
		points: 0,
	},
	reducers: {
		addPoints(state, {payload}: PayloadAction<number>) {
			state.points += payload;
		},
	},
});

const {addPoints} = pointsSlice.actions;

export const store = configureStore({
	reducer: {
		stockfish: stockfishSlice.reducer,
		answers: pointsSlice.reducer,
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
