require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const RedisStore = require('connect-redis')(session);
const handlebarsHelpers = require('./utils/handlebars-helpers');
const redisClient = require('./configs/redisConnect');
const passport = require('./configs/passport');
const port = process.env.PORT;

const app = express();

app.engine(
  'hbs',
  exphbs.engine({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: handlebarsHelpers,
  })
);
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(express.json());
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

try {
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // if true only transmit cookie over https
        httpOnly: false, // if true prevent client side JS from reading the cookie
        maxAge: 1000 * 60 * 30, // session max age in miliseconds
      },
    })
  );
} catch (error) {
  console.log(error);
}

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if (req.user) {
    res.locals.localUser = JSON.parse(req.user);
  }
  res.locals.success_messages = req.flash('success_messages');
  res.locals.error_messages = req.flash('error_messages');
  res.locals.error = req.flash('error');
  next();
});

require('./server/routes/index_route')(app);

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
