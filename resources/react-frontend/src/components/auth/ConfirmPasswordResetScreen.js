import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Auth} from 'aws-amplify';

import {TextInput} from '../forms/TextInput';
import {LoadingFormButton} from '../forms/FormButton';
import {PasswordRequirements} from './PasswordRequirements';
import {BaseScreen} from '../base-components/BaseScreen';

export function ConfirmPasswordResetScreen(props) {

    const history = useHistory();

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [username, setUsername] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState("");

    const handleChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "username") {
            setUsername(value);
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

        setLoading(true);
        Auth.forgotPasswordSubmit(username, code, newPassword)
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
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <BaseScreen
            titleText={"Confirm Password Reset"}
            needUnauthenticated={true}>

            <div className={"Centered MaxWidth"}>
                <p>
                    Use the emailed code change your password
                </p>

                <PasswordRequirements/>

                { failed &&
                    <p className="ErrorMessage">{errorMessage}</p>
                }

                <form
                    className={"AuthForm"}
                    onChange={handleChange}>

                    <TextInput
                        name={"username"}
                        placeHolder={"Username"}
                        value={username}/>
                    <br/>

                    <TextInput
                        name={"code"}
                        placeHolder={"Code"}
                        value={code}/>
                    <br/>

                    <TextInput
                        name={"newPassword"}
                        placeHolder={"New Password"}
                        value={newPassword}
                        type={"password"}/>
                    <br/>

                    <TextInput
                        name={"confirmPassword"}
                        placeHolder={"Confirm New Password"}
                        value={confirmPassword}
                        type={"password"}/>
                    <br/>

                    <LoadingFormButton
                        loading={loading}
                        onClick={onFinish}
                        value={"Reset Passord"}/>
                </form>
            </div>

        </BaseScreen>
    );
}
