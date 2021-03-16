import React, {useEffect} from 'react';
import {useHistory} from 'react-router-dom';

import './Auth.css';
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

            <h2 className="Centered">Welcome to Students Teaching Students</h2>

            <div className="FillScreen">

                <br/>
                <p className="Centered MaxWidth">In order to post availability as a tutor or request a posted tutoring session, you must have an account</p>
                <br/>

                <p className="Centered MaxWidth">An account requires an email and password. Upon requesting an account with those two things,
                    an email will be sent to the provided email address with a confirmation code. Provide that
                    code with the email address, and the email/password combination will become active.</p>
                <br/>

                <p className="Centered MaxWidth">If you forget your password, there is a password reset functionality that utilizes a code sent to the
                    registered email address. Use the code sent via email to set a new password</p>
                <br/>

                <p className="Centered MaxWidth">Start by navigating to the <a href="register">Registration Page</a>. After filling out that form, you
                    should be redirected to where you need to go. But, in case you get turned around, use the following links to access any part of the process.</p>
                <br/>

                <ul className="Centered MaxWidth">
                    <a className="HelperLink" href="/login">Login</a>
                    <a className="HelperLink" href="/register">Register</a>
                    <a className="HelperLink" href="/confirm">Confirm</a>
                    <a className="HelperLink" href="/initiate-password-reset">Initiate Password Reset</a>
                    <a className="HelperLink" href="/confirm-password-reset">Confirm Password Reset</a>
                </ul>
            </div>

        {/*
            <p>In order to utilize the functionality of this site, you must be authenticated</p>
            <p>Please <a href="/login">Login</a> if you are a returning user</p>
            <p>Please <a href="/register">Register</a> if you are a new user</p>
            <p>Please <a href="/confirm">Confirm</a> if you are a recently registered user</p>
            <p>Please <a href="/initiate-password-reset">Initiate Password Reset</a> if you have forgotten your passord</p>
            <p>Please <a href="/confirm-password-reset">Confirm Password Reset</a> if you have recently initated a passord reset</p>
            */
        }
        </>
    );
}
