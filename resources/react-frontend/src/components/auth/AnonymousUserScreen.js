import React, {useEffect} from 'react';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import './Auth.css';
import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {checkUnauthenticated} from "./CheckAuthenticated";

export function AnonymousUserScreen() {
    const history = useHistory();

    useEffect(() => {
        checkUnauthenticated(() => history.push("/profile"));
    }, [
        history
    ]);

    return (
        <div className="TopLevelContainer">
            <Header/>

            <MediaQuery minWidth={765}>
                <AnonymousUserBody
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <AnonymousUserBody
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>
        </div>
    );
}

function AnonymousUserBody(props) {
    return (
        <>
            <header className={props.pageBorderClass}>

                <Title
                    titleText={"Welcome to Students Teaching Students"}
                    underlineClass={props.underlineClass}/>

                <h4 className="PageHeader">
                    How Do I Get Started?
                </h4>
                <p className="Centered MaxWidth">
                    Start by navigating to the <a href="register">Registration Page</a>. After filling out that form, you
                    should be redirected to where you need to go. But, in case you get turned around, use the following links to access any part of the process.
                </p>
                <br/>

                <h4 className="PageHeader">
                    Sign Up Process
                </h4>
                <p className="Centered MaxWidth">
                    In order to post availability as a tutor or request a posted tutoring session, you must have an account.
                    An account requires a username and password, as well as a parent's email. Upon requesting an account with those three things,
                    an email will be sent to the provided parent's email address with a confirmation code. Provide that
                    code with the username on the <a href="/confirm">Confirmation Page</a>, and the username/password combination will become active.
                </p>
                <br/>
                <p className="Centered MaxWidth">
                    In addition to creating an account, a parent must give permission for anyone under the age of 18.
                </p>
                <br/>

                <h2 className="PageHeader">
                    COPY PASTE WAIVER HERE
                </h2>


                <h4 className="PageHeader">
                    Forgotten Password?
                </h4>
                <p className="Centered MaxWidth">
                    If you forget your password, there is a password reset functionality that utilizes a code sent to the
                    registered parent's email address. Use the code sent via email to set a new password.
                </p>
                <br/>

                <div className="HelperContainer">
                    <ul className="Centered HelperList">
                        <li className="HelperLink">
                            <a href="/register">Register</a>
                        </li>
                        <p className="HelperSeparator">|</p>

                        <li className="HelperLink">
                            <a href="/confirm">Confirm</a>
                        </li>
                        <p className="HelperSeparator">|</p>

                        <li className="HelperLink">
                            <a href="/login">Login</a>
                        </li>
                        <p className="HelperSeparator">|</p>

                        <li className="HelperLink">
                            <a href="/initiate-password-reset">Initiate Password Reset</a>
                        </li>
                        <p className="HelperSeparator">|</p>

                        <li className="HelperLink">
                            <a href="/confirm-password-reset">Confirm Password Reset</a>
                        </li>
                    </ul>
                </div>

            </header>
        </>
    );
}
