import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Row} from 'antd';
import {Auth} from "aws-amplify";

import {Header} from '../Header';
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

            <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
                Initiate Password Reset
            </Row>

            { failed &&
                <p style={authStyles.errorMsg} >{errorMessage}</p>
            }

            <Row>

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

            </Row>
        </div>
    );

}
