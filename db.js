const
  pg = require('pg'),
  client = new pg.Client(process.env.DATABASE_URL)

client.connect(function (err) {
  if (err) console.log(err.message)
})

function query (sql, params) {
  return new Promise(function (resolve, reject) {
    client.query(sql, params, function (err, result) {
      (err) ? reject(err)
            : resolve(result)
    })
  })
}

function sync () {
  let initDb = `
    DROP TABLE IF EXISTS users CASCADE;
    DROP TYPE IF EXISTS user_type;

    CREATE TYPE user_type AS ENUM ('user', 'team leader', 'manager');
    CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      name CHARACTER VARYING(255) UNIQUE,
      type user_type
    );`
  return query(initDb)
}

function seed () {
  return Promise.all([
    createUser('Gon Freecss', 'user'),
    createUser('Killua Zoldyck', 'user'),
    createUser('Kurapika', 'user'),
    createUser('Leorio Paradinight', 'team leader'),
    createUser('Hisoka Morow', 'user'),
    createUser('Chrollo Lucilfer', 'manager'),
    createUser('Chimera Ants', 'user'),
    createUser('Meruem', 'manager'),
    createUser('Isaac Netero', 'manager'),
    createUser('Ging Freecss', 'user'),
    createUser('Pariston Hill', 'user'),
    createUser('Morel Mackernasey', 'team leader'),
    createUser('Knov', 'team leader'),
    createUser('Silva Zoldyck', 'user')
  ])
  .then(function (result) {
    console.log(result)
  })
}

function getUsers (byType) {
  let
    condition = byType ? ' WHERE type = ($1)' : '',
    arg = byType ? [byType] : null

  return query('SELECT * FROM users' + condition, arg)
    .then(result => result.rows)
    .catch(err => console.log(err.message))
}

function getUser (id) {
  return query('SELECT * FROM users WHERE id=($1)', [id])
    .then(result => result.rows)
}

function createUser (name, type) {
  type = type || 'user'
  return query('INSERT INTO users (name, type) VALUES ($1, $2) RETURNING id', [name, type ])
    .then(result => result.rows[0].id)
}

function updateUser (name, type) {
  return query('UPDATE users SET type = ($1) WHERE name = ($2) RETURNING id', [type, name])
    .then(result => result.rows[0].id)
}

function deleteUser (id) {
  return query('DELETE FROM users WHERE id = ($1)', [id])
    .then(result => result.rows)
}

module.exports = {sync, seed, getUsers, getUser, createUser, updateUser, deleteUser}
