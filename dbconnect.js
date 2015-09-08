var knex = require('knex')(
  {
    client: 'pg',
    connection:
    {
      host: 'localhost',
      user: 'postgres',
      password: '1234',
      database: 'backbone',
      charset: 'utf8'
    },
    migrations: {
      tableName: 'migrations'
    }
  }
);


module.exports = require('bookshelf')(knex);