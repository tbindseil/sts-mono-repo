import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";

import {Header} from '../Header';
import {TextInput} from '../forms/TextInput';
import {FormButton} from '../forms/FormButton';
import {authStyles} from './styles';
import {checkAuthenticated} from "./CheckAuthenticated";
import {PasswordRequirements} from './PasswordRequirements';

export function ChangePasswordScreen() {
    const history = useHistory();

    const [user, setUser] = useState(undefined)
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "oldPassword") {
            setOldPassword(value);
        } else if (name === "newPassword") {
            setNewPassword(value);
        } else if (name === "confirmPassword") {
            setConfirmPassword(value);
        }
    }

    const onFinish = async () => {
        if (newPassword !== confirmPassword) {
            setErrorMessage("password entries do not match");
            setFailed(true);
            return;
        }

        Auth.changePassword(user, oldPassword, newPassword)
            .then(data => history.push("/profile"))
            .catch(err => {
                setFailed(true);
                var message = "Error Changing Password";
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
                Change Password
            </p>

            <PasswordRequirements/>

            { failed &&
                <p style={authStyles.errorMsg} >{errorMessage}</p>
            }

            <form
                onChange={handleChange}>

                <TextInput
                    name={"oldPassword"}
                    label={"Old Password"}
                    value={oldPassword}
                    type={"password"}/>
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
                    value={"Change Password"}/>
            </form>

        </div>
    );

}
