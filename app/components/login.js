import React from 'react';
import StandardHeader from './standard_header.js'
import {isMobile} from 'react-device-detect';

export default class LoginPage extends React.Component
{
	constructor(props)
	{
		super(props)
		this.usernameRef = React.createRef();
		this.passwordRef = React.createRef();
		this.login_message = "";
		this.props.mixpanel.track("Login Page")
	}

	componentDidMount()
	{
		this.props.mixpanel.track("Login Page")
	}

	submitLogin()
	{
		this.props.mixpanel.track("Log In Submitted")
		var that = this;
	    fetch("/login", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({username: this.usernameRef.current.value, 
	        	   password: this.passwordRef.current.value}),
	    }).then(function(response) { return response.json();})
	    .then(function (data) {    	
	    	that.login_message = data.login_message
	    	if (data.login_message == "Login Successful")
	    	{
	    		window.location.href = "/"
	    	}
	    	else
	    	{
	    		that.forceUpdate();
	    	}
	 	})	
	}

	render()
	{
		var top_padding = '100px'
		var login_size = '3em'
		var input_size = '1.6em'
		var button_size = '1.6em'
		var label_width = '124px'

		if (isMobile)
		{
			top_padding = '20%'
			login_size = '4em'
			input_size = '2.8em'
			button_size = '2.8em'
			label_width = ''
		}
		return(
			<div style = {{display:'flex', paddingTop:top_padding}}>
				<div className = "hero" style = {{margin:'0px auto'}}>
					<div className =  "hero-content" >
						<div style = {{fontSize:login_size}}>Login</div>
						  <label style={{color:'black', fontSize:input_size, minWidth:label_width}}>Username:</label>
						  <input style = {{position:'relative', left:'20px'}} ref = {this.usernameRef} type="text" name="username"/><br/>
						  <label style={{color:'black', fontSize:input_size, minWidth:label_width}}>Password:</label>
						  <input style = {{position:'relative', left:'20px'}} ref = {this.passwordRef} type = 'password' name="password"/>
							<p>
							  <button style = {{fontSize:button_size}} onClick= {this.submitLogin.bind(this)} type="submit" id="submitButton" className="btn btn-lg btn-primary" >Login</button>
							  <a style = {{position:'relative', left:'8px', fontSize:button_size}} href = "/register" id="submitButton" className="btn btn-lg btn-primary" >Register</a>
							</p>
							<p style = {{fontSize:input_size}}>
								{this.login_message}
							</p>
					</div>
				</div>

			</div>
		);
	}
}