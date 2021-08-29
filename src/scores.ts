import {Client} from 'pg';

const DATABASE_DEFAULT: string = 'postgres';
const DATABSE_TETRIS: string = 'tetris';
const ERROR_CODE_NO_DATABSE: string = '3D000';

export class Scores {
  async add(name: string, score: number) {
    const client = await Scores.getClient();
    await client.query(
        'INSERT INTO scores(name, score) VALUES ($1, $2)', [name, score]);
    await client.end();
  }

  async getTop(): Promise<ScoreEntry[]> {
    const client = await Scores.getClient();

    const result =
        await client.query('SELECT * FROM scores ORDER BY score DESC LIMIT 10');

    await client.end();

    return result.rows.map(row => {
      return new ScoreEntry(row['name'], row['score']);
    })
  }

  private static async getClient(): Promise<Client> {
    try {
      const client = new Client({database: DATABSE_TETRIS});
      await client.connect();
      return client;
    } catch (e: any) {
      if (e.code === ERROR_CODE_NO_DATABSE) {
        return await Scores.createDatabase();
      } else {
        throw e;
      }
    }
  }

  private static async createDatabase(): Promise<Client> {
    const defaultClient = new Client({database: DATABASE_DEFAULT});
    await defaultClient.connect();
    await defaultClient.query('CREATE DATABASE ' + DATABSE_TETRIS);
    await defaultClient.end();

    const tetrisClient = new Client({database: DATABSE_TETRIS});
    await tetrisClient.connect();
    await tetrisClient.query(
        'CREATE TABLE scores (id SERIAL PRIMARY KEY, name VARCHAR NOT NULL, score INTEGER NOT NULL)');

    return tetrisClient;
  }
}

export class ScoreEntry {
  name: string;
  value: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }
};