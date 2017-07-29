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
    let pre = JSON.stringify(users).split('},').join('},\n')
    res.render('index', {usersJSON: pre})
  })
})

app.use(function (err, req, res, next) {
  res.render('error', { error: err })
})

app.listen(port, function () {
  console.log(`listening on port ${port}`)
  db.sync()
  .then(() => db.seed())
  .then(() => db.getUsers())
  .then((users) => console.log(users))
  .catch(err => console.log(err))
})
