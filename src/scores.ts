import {Client} from 'pg';

export class Scores {
  private client: Client;

  constructor() {
    this.client = new Client({database: 'postgres'});
  }

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
      const client = new Client({database: 'tetris'});
      await client.connect();
      return client;
    } catch (e: any) {
      if (e.code === '3D000') {
        return await Scores.createDatabase();
      } else {
        throw e;
      }
    }
  }

  private static async createDatabase(): Promise<Client> {
    const defaultClient = new Client({database: 'postgres'});
    await defaultClient.connect();
    await defaultClient.query('CREATE DATABASE tetris');
    await defaultClient.end();

    const tetrisClient = new Client({database: 'tetris'});
    await tetrisClient.connect();
    await tetrisClient.query(
        'CREATE TABLE scores (name varchar, score integer)');

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