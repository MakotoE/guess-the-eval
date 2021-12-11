import {configureStore, createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {Stockfish} from "./stockfish";

export const calculateEval = createAsyncThunk<number, string, {extra: Stockfish}>(
	'stockfish/calculateEval',
	async (fen, thunkAPI) => {
		return thunkAPI.extra.getEval(fen);
	},
);

const stockfishSlice = createSlice({
	name: 'stockfish',
	initialState: {
		// evaluation is the calculated evaluation in centipawns. evaluation is null when Stockfish is not done
		// calculating.
		evaluation: null as number | null,
	},
	reducers: {},
	extraReducers: builder => {
		builder.addCase(calculateEval.fulfilled, (state, action) => {
			state.evaluation = action.payload;
		});
	},
});

export const store = configureStore({
	reducer: {
		stockfish: stockfishSlice.reducer,
	},
	middleware: getDefaultMiddleware => getDefaultMiddleware({
		thunk: {
			extraArgument: new Stockfish(),
		}
	}),
	devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
