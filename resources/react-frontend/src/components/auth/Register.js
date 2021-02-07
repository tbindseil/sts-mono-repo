// navigate here from AnonymousUser (or from Login)
// this page allows for registration via email/password/confirm password
// Also, this page links to confirmation page where recently registered users can enter their registration code
//
// in addition, if this page is navigated too with a logged in user, we inform the user that they are already logged in, then allow for them to logout via a link to the logout page

import React from 'react';

import {Header} from '../Header';

export function Register() {
    return (
        <>
            <Header/>
            <h1>Register</h1>
        </>

    );
}
