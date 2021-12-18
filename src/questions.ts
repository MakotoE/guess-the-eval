export interface Question {
	fen: string,
	players: {white: string, black: string},
	tournament: string,
}

export const questions: Question[] = [
	{
		fen: '3rb1k1/1Bp2pp1/4p3/2P1P2p/r5nP/1N4P1/P4P2/R3R1K1 b - - 0 27',
		players: {white: 'Ian Nepomniachtchi', black: 'Magnus Carlsen'},
		tournament: 'World Chess Championship 2021',
	},
];
