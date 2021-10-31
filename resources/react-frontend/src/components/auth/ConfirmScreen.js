import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Auth} from 'aws-amplify';

import {TextInput} from '../forms/TextInput';
import {LoadingFormButton} from '../forms/FormButton';
import {BaseScreen} from '../base-components/BaseScreen';
import {ErrorRegistry} from '../base-components/ErrorRegistry';

export function ConfirmScreen(props) {
    const history = useHistory();

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
            ErrorRegistry.getInstance().setFailed(true);
            var message = "Error Confirming";
            if (err.message) {
                message += ": " + err.message;
            }
            ErrorRegistry.getInstance().setErrorMessage(message);
        }).finally(() => {
            setLoading(false);
        });
    };

    const resendCode = () => {
        setLoading(true);
        Auth.resendSignUp(username).then(() => {
            // do nothing
        }).catch(err => {
            ErrorRegistry.getInstance().setFailed(true);
            var message = "Error Resending Code";
            if (err.message) {
                message += ": " + err.message;
            }
            ErrorRegistry.getInstance().setErrorMessage(message);
        }).finally(() => {
            setLoading(false);
        });
    };

    return (
        <BaseScreen
            titleText={"Confirm Registration"}
            needUnauthenticated={true}>

            <div className="Centered MaxWidth">
                <p>
                    Use the emailed code to confirm your email.
                    <br/>
                    Note that the code will only be emailed to the parent's email address.
                </p>
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

                <LoadingFormButton
                    loading={loading}
                    onClick={onFinish}
                    value={"Confirm User"}/>
                <LoadingFormButton
                    loading={loading}
                    onClick={resendCode}
                    value={"Send New Code"}/>
            </form>
            <br/>

            <div className="Centered MaxWidth">
                <p>Already confirmed? <a href="/login">Login here</a></p>
                <p>Not registered yet? <a href="/register">Register here</a></p>
            </div>

        </BaseScreen>
    );
}
