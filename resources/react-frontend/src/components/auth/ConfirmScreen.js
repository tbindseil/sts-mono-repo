import React, {useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import {Auth} from 'aws-amplify';

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {TextInput} from '../forms/TextInput';
import {FormButton} from '../forms/FormButton';
import {checkUnauthenticated} from "./CheckAuthenticated";

export function ConfirmScreen() {
    return (
        <div className="TopLevelContainer">
            <Header/>

            <MediaQuery minWidth={765}>
                <ConfirmBody
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <ConfirmBody
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>
        </div>
    );
}

function ConfirmBody(props) {
    const history = useHistory();

    useEffect(() => {
        checkUnauthenticated(() => history.push("/profile"));
    }, [
        history
    ]);

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [username, setUsername] = useState("");
    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(false);

    const handleChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "username") {
            setUsername(value);
        } else if (name === "code") {
            setCode(value);
        }
    }

    const onFinish = () => {
        setLoading(true);
        Auth.confirmSignUp(username, code, {
            forceAliasCreation: true
        }).then(data => {
            history.push("/login");
        }).catch(err => {
            setFailed(true);
            var message = "Error Confirming";
            if (err.message) {
                message += ": " + err.message;
            }
            setErrorMessage(message);
        }).finally(() => {
            setLoading(false);
        });
    };

    const resendCode = () => {
        Auth.resendSignUp(username).then(() => {
            // do nothing
        }).catch(err => {
            setFailed(true);
            var message = "Error Resending Code";
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
                    titleText={"Confirm Registration"}
                    underlineClass={props.underlineClass}/>

                <div className="Centered MaxWidth">
                    <p>
                        Use the emailed code to confirm your email.
                        <br/>
                        Note that the code will only be emailed to the parent's email address.
                    </p>

                    { failed &&
                        <p className="ErrorMessage">{errorMessage}</p>
                    }
                </div>

                <form
                    className="Centered MaxWidth AuthForm"
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

                    <FormButton
                        onClick={loading ? () => {console.log("NO OP");} : onFinish}
                        value={loading ? "Loading..." : "Confirm User"}/>
                    <FormButton
                        onClick={resendCode}
                        value={"Send New Code"}/>
                </form>
                <br/>

                <div className="Centered MaxWidth">
                    <p>Already confirmed? <a href="/login">Login here</a></p>
                    <p>Not registered yet? <a href="/register">Register here</a></p>
                </div>

            </header>

        </>
    );
}
