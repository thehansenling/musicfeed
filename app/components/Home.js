import React from 'react';

export default class Home extends React.Component {

	constructor(props)
	{
		super(props);
		console.log("HOME RENDERED");
	}

	render ()
	{
		return (<div> Home Page! </div>);
	}
}