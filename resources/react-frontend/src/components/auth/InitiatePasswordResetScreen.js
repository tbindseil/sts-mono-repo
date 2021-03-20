import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";

import {Header} from '../header/Header';
import {TextInput} from '../forms/TextInput';
import {FormButton} from '../forms/FormButton';
import {authStyles} from './styles';
import {checkUnauthenticated} from "./CheckAuthenticated";

export function InitiatePasswordResetScreen() {
    const history = useHistory();

    useEffect(() => {
        checkUnauthenticated(() => history.push("/profile"));
    }, [
        history
    ]);

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [email, setEmail] = useState("");

    const handleChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "email") {
            setEmail(value);
        }
    }


    const onFinish = () => {
        Auth.forgotPassword(email)
            .then(data => {
                history.push("/confirm-password-reset");
            })
            .catch(err => {
                setFailed(true);
                var message = "Error Initiating Password Reset";
                if (err.message) {
                    message += ": " + err.message;
                }
                setErrorMessage(message);
            });
    };

    return (
        <div>

            <Header/>

            <p>
                Initiate Password Reset
            </p>

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

                <FormButton
                    onClick={onFinish}
                    value={"Initiate Password Reset"}/>
            </form>

        </div>
    );

}
