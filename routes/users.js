const
  router = require('express').Router(),
  db = require('../db'),
  bodyParser = require('body-parser')

let usersJSON = ''

router
  .use(bodyParser.urlencoded({extended: false}))

  .use(function (err, req, res, next) {
    next(err)
  })

  .get('/:type?', function (req, res) {
    let type = req.params.type || 'users'
    db.getUsers(type)
    .then(function (users) {
      let usersJSON = JSON.stringify(users).split('},').join('},\n')
      res.render('users', {users, type, usersJSON})
    })
  })

  .post('/', function (req, res) {
    let name = req.body.name, type = req.body.type
    db.createUser(name, type)
    .then(function (result) {
      (type === 'user')
        ? res.redirect('/users')
        : res.redirect('/users/' + type + 's')
    })
  })

  .put('/:id', function (req, res) {
    db.getUser(req.params.id)
    .then(function (user) {
      if (user.type === 'user') db.updateUser(user.name, 'team leader')
      if (user.type === 'team leader') db.updateUser(user.name, 'manager')
    })
    .then(() => res.redirect('back'))
  })

  .delete('/:id', function (req, res) {
    db.deleteUser(req.params.id)
    .then((result) => res.redirect('back'))
  })

module.exports = router
