const { Pool } = require('pg')

const pool = new Pool({
  user: 'users',
  host: 'localhost',
  database: 'test',
  password: '123456',
  port: 5432,
});


module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  }
};
