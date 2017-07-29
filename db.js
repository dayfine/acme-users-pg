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
  .then(result => console.log(result))
  .catch(err => next(err))
}

function getUserTypes () {
  let getTypes = `
    SELECT e.enumlabel AS type
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    ;`
  return query(getTypes)
    .then(result => result.rows)
    .catch(err => next(err))
}

function getUsers (byType) {
  let
    condition = byType ? ' WHERE type = ($1)' : '',
    arg = byType ? [byType.slice(0, -1)] : null

  return query('SELECT * FROM users' + condition, arg)
    .then(result => result.rows)
    .catch(err => next(err))
}

function getUser (id) {
  return query('SELECT * FROM users WHERE id = ($1)', [id])
    .then(result => result.rows[0])
    .catch(err => next(err))
}

function createUser (name, type) {
  return query('INSERT INTO users (name, type) VALUES ($1, $2) RETURNING id', [name, type])
    .then(result => result.rows[0].id)
    .catch(err => next(err))
}

function updateUser (name, type) {
  console.log('updated called with ' + arguments.toString())
  return query('UPDATE users SET type = ($2) WHERE name = ($1) RETURNING id', [name, type])
    .then(result => result.rows[0].id)
    .catch(err => next(err))
}

function deleteUser (id) {
  return query('DELETE FROM users WHERE id = ($1)', [id])
    .then(result => result.rows)
    .catch(err => next(err))
}

module.exports = {sync, seed, getUsers, getUser, createUser, updateUser, deleteUser, getUserTypes}
