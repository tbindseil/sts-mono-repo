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

export function ConfirmPasswordResetScreen() {
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
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "email") {
            setEmail(value);
        } else if (name === "code") {
            setCode(value);
        } else if (name === "newPassword") {
            setNewPassword(value);
        } else if (name === "confirmPassword") {
            setConfirmPassword(value);
        }
    }


    const onFinish = () => {
        if (newPassword !== confirmPassword) {
            setErrorMessage("password entries do not match");
            setFailed(true);
            return;
        }

        Auth.forgotPasswordSubmit(email, code, newPassword)
            .then(data => {
                history.push("/login");
            })
            .catch(err => {
                setFailed(true);
                var message = "Error Confirming Password Reset";
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
                Use the emailed code change your password
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
                        name={"code"}
                        label={"Code"}
                        value={code}/>
                    <br/>
                    <br/>

                    <TextInput
                        name={"newPassword"}
                        label={"New Password"}
                        value={newPassword}
                        type={"password"}/>
                    <br/>
                    <br/>

                    <TextInput
                        name={"confirmPassword"}
                        label={"Confirm New Password"}
                        value={confirmPassword}
                        type={"password"}/>
                    <br/>
                    <br/>

                    <FormButton
                        onClick={onFinish}
                        value={"Reset Passord"}/>
                </form>

            </Row>
        </div>
    );

}
