const
  router = require('express').Router(),
  db = require('../db'),
  bodyParser = require('body-parser')

let usersJSON = ''

router
  .use(function usersData (req, res, next) {
    db.getUsers()
    .then(function (users) {
      usersJSON = JSON.stringify(users).split('},').join('},\n')
      next()
    })
    .catch(err => console.log(err))
  })

  .use(bodyParser.urlencoded({extended: false}))

  .get('/:type?', function (req, res) {
    let type = req.params.type
    // if type === undefined, getUsers will return all users
    db.getUsers(type)
    .then(users => res.render('users', {users, type, usersJSON}))
  })

  .post('/', function (req, res) {
    let [name, type] = [req.body.name, req.body.type]
    db.createUser(name, type)
      .then(() => res.redirct('/' + type ? type : ''))
  })

  .put('/:id', function (req, res) {
    res.render('users')
  })

  .delete('/:id', function (req, res) {
    res.render('users')
  })

module.exports = router
