// import React from 'react';
// import {render} from 'react-dom';

// import  {BrowserRouter as Router} from 'react-router-dom'
// import App from './components/App';
// require('@babel/register')({
//     presets: ['@babel/preset-react']
// });

// var React = require('react');
// var ReactDOMServer = require('react-dom/server');
// var Router = require('react-router-dom').BrowserRouter
// var ReactDOM = require('react-dom');
import React from 'react';
import {render} from 'react-dom';
import {hydrate} from 'react-dom';
import  {BrowserRouter as Router} from 'react-router-dom'
import App from './components/App';
render(
	<Router>
		<App data = {window.__DATA__}/>
	</Router>,
	document.getElementById('root')
);

