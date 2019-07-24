import React from 'react';

export default class PrivacyPolicy extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		return (
			<div style = {{paddingLeft:'20px'}}>
				<h1>Privacy Policy</h1>
				This is a privacy policy pertaining to usage of unheard.fm (the Site/the Platform). The purpose of this policy is to describe our data collection practices and answer questions about how we store and use data.

				This privacy policy applies to all visitors to the Site who are over the age of 13 (for those visiting from the EU/EEA, over the age of 16). You should not create an account if you do not meet this age requirement. 

				Below is a comprehensive list of the data that is collected when you use our Site, as well as notes about the purpose and storage of that data.

				<h3>Email</h3> 
				Purpose: In order to register an account, we ask that you provide an email address.
				Usage: Your email is strictly used for login and account recovery purposes. We may use this email to periodically contact you about news or updates relevant to the site. If you would like to opt-out, you can directly contact us. Your email is not shared with other users or external partners.

				<h3>Last logged-in user</h3>
				Purpose: To simplify the login experience, we use a browser cookie to store the most recently logged-in user on a given browser.
				Usage: If you have logged in to the site before, a return visit will automatically log you in again.

				<h3>Network interactions (follows, votes, bumps, etc.)</h3>
				Purpose: Various forms of user engagement are tracked through Google Analytics and Mixpanel. 
				Usage: These usage metrics are used to help us better refine our product offerings and are not shared with any external parties. 

				If you have an Unheard account, you can view, export, or delete your personal information by reaching out to unheardfm@gmail.com.

				We reserve the right to periodically modify or update this policy. All users will be notified upon a significant change. For any additional questions or feedback, please feel free to reach out to us at unheardfm@gmail.com. 
			</div>
			)
		}
}