import React from 'react';

export default class Contact extends React.Component {

	constructor(props)
	{
		super(props);
		console.log("Contact RENDERED");
	}

	render ()
	{
		return (<div> Contact Page! </div>);
	}
}