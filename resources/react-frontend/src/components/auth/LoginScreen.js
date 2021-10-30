import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";

import {TextInput} from '../forms/TextInput';
import {LoadingFormButton} from '../forms/FormButton';
import {BaseScreen} from '../base-components/BaseScreen';

export function LoginScreen() {
    const history = useHistory();

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const handleChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "username") {
            setUsername(value);
        } else if (name === "password") {
            setPassword(value);
        }
    }

    const onFinish = () => {
        setLoading(true);
        Auth.signIn(username, password)
            .then(user => {
                history.push("/profile");
            })
            .catch(err => {
                setFailed(true);
                var message = "Error Logging In";
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
            titleText={"Log In"}
            needUnauthenticated={true}>

            <div className="Centered MaxWidth">
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
                    name={"password"}
                    placeHolder={"Password"}
                    value={password}
                    type={"password"}/>
                <br/>

                <LoadingFormButton
                    loading={loading}
                    onClick={onFinish}
                    value={"Log in"}/>
            </form>
            <br/>

            <div className="Centered MaxWidth">
                <p>Forgot password? <a href="/initiate-password-reset">Reset it here</a></p>
                <p>Don't have an account? <a href="/register">Register here</a></p>
            </div>

        </BaseScreen>
    );
}
