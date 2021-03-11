import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";

import {Header} from '../header/Header';
import {TextInput} from '../forms/TextInput';
import {FormButton} from '../forms/FormButton';
import {authStyles} from './styles';
import {checkUnauthenticated} from "./CheckAuthenticated";

export function LoginScreen() {
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
            <Header/>

            <h1>Login</h1>

            { failed &&
                <p style={authStyles.errorMsg} >{errorMessage}</p>
            }

            <form
                onChange={handleChange}>

                <TextInput
                    name={"email"}
                    label={"Email"}
                    value={email}/>
                <br/>
                <br/>

                <TextInput
                    name={"password"}
                    label={"Password"}
                    value={password}
                    type={"password"}/>
                <br/>
                <br/>

                <FormButton
                    onClick={onFinish}
                    value={"Log in"}/>
            </form>

            <a href="/initiate-password-reset">Forgot Password?</a>
            <br/>
            <a href="/register">Don't have an account?</a>

        </>

    );
}
