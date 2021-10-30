import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";

import {TextInput} from '../forms/TextInput';
import {FormButton} from '../forms/FormButton';
import {PasswordRequirements} from './PasswordRequirements';
import {BaseScreen} from '../base-components/BaseScreen';

export function ChangePasswordScreen() {
    const history = useHistory();

    const [user, setUser] = useState(undefined)

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
        <BaseScreen
            titleText={"Change Password"}
            needAuthenticated={true}
            setUser={setUser}>

            <div className={"Centered MaxWidth"}>

                <PasswordRequirements/>

                { failed &&
                    <p className="ErrorMessage">{errorMessage}</p>
                }

                <form
                    className={"AuthForm"}
                    onChange={handleChange}>

                    <TextInput
                        name={"oldPassword"}
                        placeHolder={"Old Password"}
                        value={oldPassword}
                        type={"password"}/>
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

                    <FormButton
                        onClick={onFinish}
                        value={"Change Password"}/>
                </form>
            </div>

        </BaseScreen>
    );
}
