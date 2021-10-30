import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";

import {BaseScreen} from '../base-components/BaseScreen';

export function LogoutScreen() {
    const history = useHistory();

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
        <BaseScreen
            titleText={"Log Out"}
            needAuthenticated={true}
            setUser={() => {}}>

            <div className="Centered MaxWidth">
                { failed &&
                    <p className="ErrorMessage">{errorMessage}</p>
                }

                <button onClick={onFinish}>
                    Log Out
                </button>
            </div>

        </BaseScreen>
    );
}
