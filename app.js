require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const port = process.env.PORT;

const app = express();

app.engine('hbs', exphbs.engine({ defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', 'hbs');

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
