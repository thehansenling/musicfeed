var express = require('express');
var path = require('path');
var mysql = require('mysql')
var cookieParser = require('cookie-parser');
var http = require('http');
var Spotify = require('node-spotify-api');
var uuidv3 = require('uuid/v3');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
// var {AboutPage} = require("../views/pages/about.jsx")
// var {StandardHeader} = require("../views/pages/standard_header.jsx")

import React from 'react';
const app = express();

const publicPath = express.static(path.join(__dirname, '../'));
const indexPath = path.join(__dirname, '../public/index.html');
import  {BrowserRouter as Router} from 'react-router-dom'

import App from '../components/App.js';
import { StaticRouter } from 'react-router-dom';
app.use(publicPath);

var router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	var html = ReactDOMServer.renderToString(<StaticRouter><App/></StaticRouter>)
	console.log("AHH")
	console.log(html);
	res.send(html);
})

router.get('/about', (req, res) => {
	var html = ReactDOMServer.renderToString(<StaticRouter><App/></StaticRouter>)
	console.log("AHH")
	console.log(html);
	res.send(html);
})


// app.get('/', (req, res) => {
// 	var html = ReactDOMServer.renderToString(<StaticRouter><App/></StaticRouter>)
// 	console.log("AHH")
// 	console.log(html);
// 	res.send(html);
// })
//module.exports = app;