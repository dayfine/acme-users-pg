const
  app = require('express')(),
  nunjucks = require('nunjucks'),
  routes = require('./routes/users'),
  db = require('./db'),
  port = process.env.PORT || 3000,
  morgan = require('morgan')

app.engine('html', nunjucks.render)
app.set('view engine', 'html')
nunjucks.configure('views', {noCache: true})

app.use(morgan('dev'))
app.use(require('method-override')('_method'))
app.use('/users', routes)

app.get('/', function (req, res) {
  db.getUsers().then(function (users) {
    let usersJSON = JSON.stringify(users).split('},').join('},\n')
    res.render('index', {usersJSON})
  })
})

app.use(function (err, req, res, next) {
  res.status(500)
  res.render('error', { error: err })
})

app.listen(port, function () {
  console.log(`listening on port ${port}`)
  db.sync()
  .then(() => db.seed())
  .then(() => db.getUsers())
  .then((users) => console.log(users))
  .then(() => db.getUserTypes())
  .then((types) => console.log(types))
  .catch(err => console.log(err))
})
