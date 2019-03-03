const { Pool } = require('pg')

const pool = new Pool({
  user: 'users',
  host: 'localhost',
  database: 'test',
  password: '123456',
  port: 5432,
});

const query = (text, params, callback) => {
  return pool.query(text, params, callback)
}
const asd = function(){
  return new Promise(res => {
    setTimeout(function () {
      // console.log(this.query)
      res(query)
    }, 10);
  })
}

module.exports = {
  asd,
  query,
};
