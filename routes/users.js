const
  router = require('express').Router(),
  db = require('../db'),
  bodyParser = require('body-parser')

let usersJSON = ''

router
  .use(bodyParser.urlencoded({extended: false}))

  .get('/:type?', function (req, res, next) {
    let type = req.params.type || 'users'
    db.getUsers(type)
    .then(function (users) {
      let usersJSON = JSON.stringify(users).split('},').join('},\n')
      res.render('users', {users, type, usersJSON})
    })
    .catch(err => next(err))
  })

  .post('/', function (req, res, next) {
    let name = req.body.name, type = req.body.type
    db.createUser(name, type)
    .then(function (result) {
      (type === 'user')
        ? res.redirect('/users')
        : res.redirect('/users/' + type + 's')
    })
    .catch(err => next(err))
  })

  .put('/:id', function (req, res, next) {
    db.getUser(req.params.id)
    .then(function (user) {
      if (user.type === 'user') db.updateUser(user.name, 'team leader')
      if (user.type === 'team leader') db.updateUser(user.name, 'manager')
    })
    .then(() => res.redirect('back'))
    .catch(err => next(err))
  })

  .delete('/:id', function (req, res, next) {
    db.deleteUser(req.params.id)
    .then((result) => res.redirect('back'))
    .catch(err => next(err))
  })

  .use(function (err, req, res, next) {
    next(err)
  })

module.exports = router
