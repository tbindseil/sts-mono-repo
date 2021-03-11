import React, {useEffect} from 'react';
import {useHistory} from 'react-router-dom';

import {Header} from '../header/Header';
import {checkUnauthenticated} from "./CheckAuthenticated";

export function AnonymousUserScreen() {
    const history = useHistory();

    useEffect(() => {
        checkUnauthenticated(() => history.push("/profile"));
    }, [
        history
    ]);

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
