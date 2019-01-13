import React from 'react';
import StandardHeader from './standard_header.js'

export default class RegisterPage extends React.Component
{
	constructor(props)
	{
		super(props)
	}

	render()
	{
		return (
			<div>
				<StandardHeader />
				<section className = "hero" style = {{position:'absolute', left:'10%', top:'20%'}}>
				<div className=  "hero-content" >
					<h2>Register</h2>
				<form method="POST" id="testForm" >
				  <label style={{color:'black'}}>Enter Username:</label>
				  <input type="text" name="username"/><br/>
				  <label style={{color:'black'}}>Enter Password:</label>
				  <input type="text" name="password"/><br/>
				    <label style={{color:'black'}}>Confirm Password:</label>
				  <input type="text" name="password_confirm"/>
				  <p>
				  <button href = "/" type="submit" id="submitButton" className="btn btn-lg btn-primary" >Register</button>
				  </p>
				</form>
				</div>
				</section>

			</div>
		);
	}
}