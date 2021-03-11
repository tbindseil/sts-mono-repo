import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Auth} from 'aws-amplify';

import {Header} from '../header/Header';
import {TextInput} from '../forms/TextInput';
import {FormButton} from '../forms/FormButton';
import {authStyles} from './styles';
import {checkUnauthenticated} from "./CheckAuthenticated";

export function ConfirmScreen() {
    const history = useHistory();

    useEffect(() => {
        checkUnauthenticated(() => history.push("/profile"));
    }, [
        history
    ]);

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");

    const handleChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "email") {
            setEmail(value);
        } else if (name === "code") {
            setCode(value);
        }
    }

    const onFinish = () => {
        Auth.confirmSignUp(email, code, {
            forceAliasCreation: true
        }).then(data => {
            history.push("/login");
        }).catch(err => {
            setFailed(true);
            var message = "Error Confirming";
            if (err.message) {
                message += ": " + err.message;
            }
            setErrorMessage(message);
            // TODO some weird wait
        });
    };

    const resendCode = () => {
        Auth.resendSignUp(email).then(() => {
            // do nothing
        }).catch(err => {
            setFailed(true);
            var message = "Error Resending Code";
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
                Use the emailed code to confirm your email
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

                <TextInput
                    name={"code"}
                    label={"Code"}
                    value={code}/>
                <br/>
                <br/>

                <FormButton
                    onClick={onFinish}
                    value={"Confirm Email"}/>
                <FormButton
                    onClick={resendCode} 
                    value={"Send New Code"}/>
            </form>

            <a href="/login">Already Confirmed?</a>
            <br/>
            <a href="/register">Not registered yet?</a>

        </div>
    );

}
