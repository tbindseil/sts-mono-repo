import React from 'react';

import {Header} from '../Header';

// TODO component did mount
// if logged in, go to profile

export function AnonymousUser() {
    return (
        <>
            <Header/>
            <h2>Hey anonymous friend!</h2>
            <p>In order to utilize the functionality of this site, you must be authenticated</p>
            <p>Please <a href="/login">Login</a> if you are a returning user</p>
            <p>Please <a href="/register">Register</a> if you are a new user</p>
            <p>Please <a href="/confirm">Confirm</a> if you are a recently registered user</p>
            <p>Please <a href="/initiate-password-reset">Initiate Password Reset</a> if you have forgotten your passord</p>
            <p>Please <a href="/confirm-password-reset">Confirm Password Reset</a> if you have recently initated a passord reset</p>
        </>
    );
}
