import React from 'react';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";

import {BaseScreen} from '../base-components/BaseScreen';
import {ErrorRegistry} from '../base-components/ErrorRegistry';

export function LogoutScreen() {
    const history = useHistory();

    const onFinish = values => {
        Auth.signOut({ global: true })
            .then(() => {
                history.push("/");
            })
            .catch(err => {
                ErrorRegistry.getInstance().setFailed(true);
                var message = "Error Logging Out";
                if (err.message) {
                    message += ": " + err.message;
                }
                ErrorRegistry.getInstance().setErrorMessage(message);
            });
    };

    return (
        <BaseScreen
            titleText={"Log Out"}
            needAuthenticated={true}
            setUser={() => {}}>

            <div className="Centered MaxWidth">
                <button onClick={onFinish}>
                    Log Out
                </button>
            </div>

        </BaseScreen>
    );
}
