//npm i pg

const { Pool } = require('pg');

const pool = new Pool();
//db info can be set in here itself as an object
//and also as an environment variable as we've done it
//Pool() will automatically look for env variables
//need not set manually like process.env.PGUSER etc.
module.exports = {
    query: (text, params) => pool.query(text, params),
};