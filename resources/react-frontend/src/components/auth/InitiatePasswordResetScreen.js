import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";

import {TextInput} from '../forms/TextInput';
import {FormButton} from '../forms/FormButton';
import {BaseScreen} from '../base-components/BaseScreen';

export function InitiatePasswordResetScreen() {
    const history = useHistory();

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [username, setUsername] = useState("");

    const handleChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "username") {
            setUsername(value);
        }
    }

    const onFinish = () => {
        Auth.forgotPassword(username)
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
        <BaseScreen
            titleText={"Initiate Password Reset"}
            needUnauthenticated={true}>

            <div className="Centered MaxWidth">
                <p>
                    Enter the username for which to reset the password, and expect a code to be sent to the parent email address associated with the account.
                </p>

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

                    <FormButton
                        onClick={onFinish}
                        value={"Initiate Password Reset"}/>
                </form>
            </div>

        </BaseScreen>

    );
}
