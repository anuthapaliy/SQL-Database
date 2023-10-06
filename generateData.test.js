const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();
let db;

beforeAll(() => {
    console.log(`Connecting to db ${process.env.DB_URL}`)
    db = new Pool({
        connectionString: process.env.DB_URL + "?sslmode=disable"
    });
});

afterAll(() => {
    console.log(`Closing connection to db ${process.env.DB_URL}`)
    db.end()
});

test('should have 100 volunteers in DB', async () => {
  let result = await db.query({text: "SELECT count(*) from volunteer"})
  expect(parseInt(result.rows[0].count)).toBe(100);
});