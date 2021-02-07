// navigate here from AnonymousUser
// this page allows for login via email/password
// in addition, if this page is navigated to with a logged in user, we inform the user that they are already logged in, then allow for them to logout via a link to the logout page
//
// TODO forgot password
//
// this page also links to register for those who don't have an account yet

import React from 'react';

import {Header} from '../Header';

export function Login() {
    return (
        <>
            <Header/>
            <h1>Login</h1>
        </>

    );
}
