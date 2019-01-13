require('@babel/register')({
    presets: ['@babel/preset-react']
});

var app = require('./app');
const port = process.env.PORT || 8080;
app.listen(port);
console.log('Listening at http://localhost:' + port);