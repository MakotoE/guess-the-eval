import { BestMoves } from './stockfish';

export interface Question {
  fen: string,
  players: { white: string, black: string },
  tournament: string,
  url: string,
  bestMoves: BestMoves,
}

// TODO re-calculate
export const questions: Question[] = [
  {
    fen: '3rb1k1/1Bp2pp1/4p3/2P1P2p/r5nP/1N4P1/P4P2/R3R1K1 b - - 0 27',
    players: {
      white: 'Ian Nepomniachtchi',
      black: 'Magnus Carlsen',
    },
    tournament: 'World Chess Championship 2021',
    url: 'https://lichess.org/study/RoBvWqfx/qq4glFqA#53',
    bestMoves: [
      {
        move: 'c6',
        evaluation: -2.4,
      },
      {
        move: 'Rd3',
        evaluation: -0.46,
      },
      {
        move: 'Ra7',
        evaluation: 0,
      },
    ],
  },
  {
    fen: 'r1k4r/p2nb1p1/2b4p/1p1n1p2/2PP4/3Q1NB1/1P3PPP/R5K1 b - - 0 19',
    players: {
      white: 'Deep Blue',
      black: 'Garry Kasparov',
    },
    tournament: 'IBM Man-Machine 1997',
    url: 'https://lichess.org/study/PSiqUImS/H0yrYCp7#37',
    bestMoves: [
      {
        move: 'bxc4',
        evaluation: 2.98,
      },
      {
        move: 'N5f6',
        evaluation: 4.62,
      },
      {
        move: 'N5b6',
        evaluation: 5.46,
      },
    ],
  },
  {
    fen: '5q1k/ppp2Nbp/2np2p1/3B1b2/2PP4/4r1P1/PP1Q3P/R5K1 b - - 3 18',
    players: {
      white: 'Roman Toran Albero',
      black: 'Mikhail Tal',
    },
    tournament: 'European Team Chess Championship 1961',
    url: 'https://www.chessgames.com/perl/chessgame?gid=1139541',
    bestMoves: [
      {
        move: 'Kg8',
        evaluation: -0.6,
      },
      {
        move: 'Qxf7',
        evaluation: 0,
      },
    ],
  },
  {
    fen: 'r3r1k1/pp3pbp/1qp1b1p1/2B5/2BP4/Q1n2N2/P4PPP/3R1K1R w - - 4 18',
    players: {
      white: 'Donald Byrne',
      black: 'Robert Bobby James Fischer',
    },
    tournament: 'Rosenwald Memorial Tournament',
    url: 'https://www.chessgames.com/perl/chessgame?gid=1008361',
    bestMoves: [
      {
        move: 'Qxc3',
        evaluation: -1.97,
      },
      {
        move: 'Bd3',
        evaluation: -2.92,
      },
      {
        move: 'Be2',
        evaluation: -3.23,
      },
    ],
  },
  {
    fen: 'rnbq1bnr/ppppkppp/8/4p3/4P3/8/PPPPKPPP/RNBQ1BNR w - - 2 3',
    players: {
      white: 'Magnus Carlsen',
      black: 'Hikaru Nakamura',
    },
    tournament: 'Magnus Carlsen Invitational 2021',
    url: 'https://www.chessgames.com/perl/chessgame?gid=2029671',
    bestMoves: [
      {
        move: 'Nc3',
        evaluation: 0.51,
      },
      {
        move: 'd4',
        evaluation: 0.47,
      },
      {
        move: 'Ke1',
        evaluation: 0.45,
      },
    ],
  },
];
