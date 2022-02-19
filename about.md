# About Guess the Eval

Guess the Eval is designed and developed by Makoto Emura. Guess the Eval is licensed under the GNU General Public License. See [LICENSE](LICENSE) for details.  Guess the Eval uses third party libraries which are listed [here](thirdPartyLicenses.md).

You're currently in the GitHub repo containing the source code for [Guess the Eval](https://github.com/MakotoE/guess-the-eval). If you have feedback or suggestions for this project, please make an issue on this repo. Thanks!

Mobile devices are not supported currently. The board is really wonky on my iPhone screen, and I don't know why.

## Positions database

Thanks [The Week in Chess](https://theweekinchess.com/), for the PGNs. From the first 30 games of the World Rapid 2021 database, I choose two random positions each.

All evaluations were calculated with Stockfish 14.1, to a depth of 25 with NNUE.

Selecting positions for the positions database is difficult. There may be very one-sided positions. Also, the points scoring algorithm may need tweaking. You can check the source code to see how they are currently implemented. (See [`evaluator`](https://github.com/MakotoE/guess-the-eval/blob/main/evaluator/src/main.rs) and [`PointsSolver.ts`](https://github.com/MakotoE/guess-the-eval/blob/main/src/PointsSolver.ts))
