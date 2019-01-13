import React from 'react';
import StandardHeader from './standard_header.js'

export default class LoginPage extends React.Component
{
	constructor(props)
	{
		super(props)
	}


	render()
	{
		return(
			<div>
				<StandardHeader />

				<section className = "hero" style = {{position:'absolute', left:'10%', top:'20%'}}>
					<div className =  "hero-content" >
						<h2>Login</h2>
						<form method="POST" id="testForm" >
						  <label style={{color:'black'}}>Username:</label>
						  <input type="text" name="username"/><br/>
						  <label style={{color:'black'}}>Password:</label>
						  <input type="text" name="password"/>
							<p>
							  <button type="submit" id="submitButton" className="btn btn-lg btn-primary" >Login</button>
							  <a href = "/register" id="submitButton" className="btn btn-lg btn-primary" >Register</a>
							</p>
							<p>
							</p>
						</form>
					</div>
				</section>

			</div>
		);
	}
}