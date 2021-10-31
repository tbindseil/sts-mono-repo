import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";
import {CognitoIdentityProvider} from '@aws-sdk/client-cognito-identity-provider';

import {apiFactory} from '../fetch-enhancements/fetch-call-builders';
import {BaseScreen} from '../base-components/BaseScreen';
import {ErrorRegistry} from '../base-components/ErrorRegistry';

export function DeleteScreen() {
    const [user, setUser] = useState(undefined)

    const [confirming, setConfirming] = useState(false);

    const onFinish = async (values) => {
        setConfirming(true);
    };

    const onClickYes = () => {
        try {
            const cognitoIdentityProvider = new CognitoIdentityProvider({region: 'us-west-2'});

            var params = {
                AccessToken: user.signInUserSession.accessToken.jwtToken
            };
            cognitoIdentityProvider.deleteUser(params, function(err, data)  {
                if (err) {
                    ErrorRegistry.getInstance().setFailed(true);
                    var message = "Error Deleting User";
                    if (err.message) {
                        message += ": " + err.message;
                    }
                    ErrorRegistry.getInstance().setErrorMessage(message);
                    return;
                }

                const call = apiFactory.makeDeleteUser({
                    user: user,
                    successHandler: () => {}
                });
                call();

                Auth.signOut({ global: true });
                setUser(null);
            });
        } catch (err) {
            ErrorRegistry.getInstance().setFailed(true);
            var message = "Error Deleting User";
            if (err.message) {
                message += ": " + err.message;
            }
            ErrorRegistry.getInstance().setErrorMessage(message);
            return;
        }
    };

    const onClickNo = () => {
        setConfirming(false);
    };

    return (
        <BaseScreen
            titleText={"DeleteAccount"}
            needAuthenticated={true}
            setUser={setUser}>

            <div className="Centered MaxWidth">

                <button onClick={onFinish}>
                    Delete Account
                </button>
            </div>

            { confirming &&
                <div className="Centered MaxWidth">
                    <p>Are you sure you'd like to delete your account and all the associated data?</p>
                    <button onClick={onClickYes}>Yes</button>
                    <button onClick={onClickNo}>No</button>
                </div>
            }

        </BaseScreen>
    );
}
