import React, {useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import {Auth} from 'aws-amplify';

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {TextInput} from '../forms/TextInput';
import {FormButton} from '../forms/FormButton';
import {authStyles} from './styles';
import {checkUnauthenticated} from "./CheckAuthenticated";
import {PasswordRequirements} from './PasswordRequirements';

export function ConfirmPasswordResetScreen() {
    return (
        <div className="TopLevelContainer">

            <Header/>

            <MediaQuery minWidth={765}>
                <ConfirmPasswordResetBody
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <ConfirmPasswordResetBody
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>

        </div>
    );
}

function ConfirmPasswordResetBody(props) {
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
        <>
            <header className={props.pageBorderClass}>

                <Title
                    titleText={"Confirm Password Reset"}
                    underlineClass={props.underlineClass}/>

                <div className={"Centered MaxWidth"}>
                    <p>
                        Use the emailed code change your password
                    </p>

                    <PasswordRequirements/>

                    { failed &&
                        <p style={authStyles.errorMsg} >{errorMessage}</p>
                    }

                    <form
                        className={"AuthForm"}
                        onChange={handleChange}>

                        <TextInput
                            name={"email"}
                            placeHolder={"Email"}
                            value={email}/>
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

                        <FormButton
                            onClick={onFinish}
                            value={"Reset Passord"}/>
                    </form>
                </div>

            </header>
        </>
    );
}

