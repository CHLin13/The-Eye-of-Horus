require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const handlebarsHelpers = require('./utils/handlebars-helpers')
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
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

require('./server/routes/index_route')(app);

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
