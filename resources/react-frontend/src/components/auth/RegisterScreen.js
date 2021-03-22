import React, {useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import {Auth} from 'aws-amplify';

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {TextInput} from '../forms/TextInput';
import {Title} from '../layout/Title';
import {FormButton} from '../forms/FormButton';
import {authStyles} from './styles';
import {checkUnauthenticated} from "./CheckAuthenticated";
import {PasswordRequirements} from './PasswordRequirements';

export function RegisterScreen() {
    return (
        <div className="TopLevelContainer">

            <Header/>

            <MediaQuery minWidth={765}>
                <RegisterBody
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <RegisterBody
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>

        </div>
    );
}

function RegisterBody(props) {
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
        <>
            <header className={props.pageBorderClass}>

                <Title
                    titleText={"Register"}
                    underlineClass={props.underlineClass}/>

                <div className="Centered MaxWidth">
                    <PasswordRequirements/>

                    { failed &&
                        <p style={authStyles.errorMsg}>{errorMessage}</p>
                    }
                </div>

                <form
                    className="Centered MaxWidth AuthForm"
                    onChange={handleChange}>

                    <TextInput
                        name={"email"}
                        placeHolder={"Email"}
                        value={email}/>
                    <br/>

                    <TextInput
                        name={"password"}
                        value={password}
                        placeHolder={"Password"}
                        type={"password"}/>
                    <br/>

                    <TextInput
                        name={"confirmPassword"}
                        value={confirmPassword}
                        placeHolder={'Confirm Password'}
                        type={"password"}/>
                    <br/>

                    <FormButton
                        onClick={onFinish}
                        value={"Register"}/>
                </form>
                <br/>

                <div className="Centered MaxWidth">
                    <p>Already registered? <a href="/login">Log in here</a></p>
                    <p>Looking to confirm registration? <a href="/confirm">Go here</a></p>
                </div>

            </header>
        </>
    );
}
