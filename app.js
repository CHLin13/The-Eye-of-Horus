require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const handlebarsHelpers = require('./utils/handlebars-helpers');
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

require('./server/routes/index_route')(app);

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
