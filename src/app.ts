import yargs from 'yargs';

import {ConsoleGUI} from './consoleGui';
import {Game} from './game';

const args: any = yargs
                      .option('difficulty', {
                        alias: 'd',
                        description: 'How fast the pieces move down.',
                        type: 'number'
                      })
                      .help()
                      .alias('help', 'h')
                      .default('difficulty', 0)
                      .argv;

new Game(new ConsoleGUI(), args.difficulty).start();