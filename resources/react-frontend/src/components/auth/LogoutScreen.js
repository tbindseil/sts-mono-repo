import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";

import {Header} from '../Header';
import {authStyles} from './styles';
import {checkAuthenticated} from "./CheckAuthenticated";

export function LogoutScreen() {
    const history = useHistory();

    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), () => {});
    }, [
        history
    ]);

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const onFinish = values => {
        Auth.signOut({ global: true })
            .then(() => {
                history.push("/");
            })
            .catch(err => {
                setFailed(true);
                var message = "Error Logging Out";
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
                Logout
            </p>

            { failed &&
                <p style={authStyles.errorMsg} >{errorMessage}</p>
            }

            <button onClick={onFinish}>
                Log out?
            </button>

        </div>
    );
}
