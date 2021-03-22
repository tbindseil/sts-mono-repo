import React, {useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {TextInput} from '../forms/TextInput';
import {FormButton} from '../forms/FormButton';
import {authStyles} from './styles';
import {checkAuthenticated} from "./CheckAuthenticated";
import {PasswordRequirements} from './PasswordRequirements';

export function ChangePasswordScreen() {
    return (
        <div className="TopLevelContainer">

            <Header/>

            <MediaQuery minWidth={765}>
                <ChangePasswordBody
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <ChangePasswordBody
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>

        </div>
    );
}

function ChangePasswordBody(props) {
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
        <>
            <header className={props.pageBorderClass}>
                <Title
                    titleText={"Change Password"}
                    underlineClass={props.underlineClass}/>

                <div className={"Centered MaxWidth"}>

                    <PasswordRequirements/>

                    { failed &&
                        <p style={authStyles.errorMsg} >{errorMessage}</p>
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

            </header>
        </>
    );
}
