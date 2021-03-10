import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Row} from 'antd';
import {Auth} from 'aws-amplify';

import {Header} from '../Header';
import {TextInput} from '../forms/TextInput';
import {FormButton} from '../forms/FormButton';
import {authStyles} from './styles';
import {checkUnauthenticated} from "./CheckAuthenticated";
import {PasswordRequirements} from './PasswordRequirements';

export function RegisterScreen() {
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
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "email") {
            setEmail(value);
        } else if (name === "password") {
            setPassword(value);
        } else if (name === "confirmPassword") {
            setConfirmPassword(value);
        }
    }

    const onFinish = () => {
        if (password !== confirmPassword) {
            setFailed(true);
            setErrorMessage("password entries do not match");
            return;
        }

        Auth.signUp(email, password)
            .then(data => {
                history.push("/confirm");
            }).catch(err => {
                setFailed(true);
                var message = "Error Registering";
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
                Register
            </Row>

            <Row>
                <PasswordRequirements/>
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

                    <TextInput
                        name={"password"}
                        label={"Password"}
                        value={password}
                        type={"password"}/>
                    <br/>
                    <br/>

                    <TextInput
                        name={"confirmPassword"}
                        label={'Confirm Password'}
                        value={confirmPassword}
                        type={"password"}/>
                    <br/>
                    <br/>

                    <FormButton
                        onClick={onFinish}
                        value={"Register"}/>
                </form>

                <a href="/login">Already registered?</a>
                <br/>
                <a href="/confirm">Looking to confirm registration?</a>

            </Row>
        </div>
    );

}
