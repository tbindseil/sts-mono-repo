import React, {useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {TextInput} from '../forms/TextInput';
import {FormButton} from '../forms/FormButton';
import {checkUnauthenticated} from "./CheckAuthenticated";

export function InitiatePasswordResetScreen() {
    return (
        <div className="TopLevelContainer">

            <Header/>

            <MediaQuery minWidth={765}>
                <InitiatePasswordResetBody
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <InitiatePasswordResetBody
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>

        </div>
    );
}

function InitiatePasswordResetBody(props) {
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
        <>
            <header className={props.pageBorderClass}>

            <Title
                titleText={"Initiate Password Reset"}
                underlineClass={props.underlineClass}/>

            <div className="Centered MaxWidth">
                { failed &&
                    <p className="ErrorMessage">{errorMessage}</p>
                }

                <form
                    className={"AuthForm"}
                    onChange={handleChange}>

                    <TextInput
                        name={"email"}
                        placeHolder={"Email"}
                        value={email}/>
                    <br/>

                    <FormButton
                        onClick={onFinish}
                        value={"Initiate Password Reset"}/>
                </form>
            </div>

            </header>
        </>
    );
}
