import React, {useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {TextInput} from '../forms/TextInput';
import {FormButton} from '../forms/FormButton';
import {checkUnauthenticated} from "./CheckAuthenticated";

export function LoginScreen() {
    return (
        <div className="TopLevelContainer">
            <Header/>

            <MediaQuery minWidth={765}>
                <LoginBody
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <LoginBody
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>
        </div>
    );
}

function LoginBody(props) {
    const history = useHistory();

    useEffect(() => {
        checkUnauthenticated(() => history.push("/profile"));
    }, [
        history
    ]);

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "email") {
            setEmail(value);
        } else if (name === "password") {
            setPassword(value);
        }
    }


    const onFinish = () => {
        Auth.signIn(email, password)
            .then(user => {
                history.push("/profile");
            })
            .catch(err => {
                setFailed(true);
                var message = "Error Logging In";
                if (err.message) {
                    message += ": " + err.message;
                }
                setErrorMessage(message);
            });
    };

    return (
        <>
            <header className={props.pageBorderClass}>
                <Title
                    titleText={"Log In"}
                    underlineClass={props.underlineClass}/>

                <div className="Centered MaxWidth">
                    { failed &&
                        <p className="ErrorMessage">{errorMessage}</p>
                    }
                </div>

                <form
                    className="Centered MaxWidth AuthForm"
                    onChange={handleChange}>

                    <TextInput
                        name={"email"}
                        placeHolder={"Email"}
                        value={email}/>
                    <br/>

                    <TextInput
                        name={"password"}
                        placeHolder={"Password"}
                        value={password}
                        type={"password"}/>
                    <br/>

                    <FormButton
                        onClick={onFinish}
                        value={"Log in"}/>
                </form>
                <br/>

                <div className="Centered MaxWidth">
                    <p>Forgot password? <a href="/initiate-password-reset">Reset it here</a></p>
                    <p>Don't have an account? <a href="/register">Register here</a></p>
                </div>

            </header>
        </>
    );
}
