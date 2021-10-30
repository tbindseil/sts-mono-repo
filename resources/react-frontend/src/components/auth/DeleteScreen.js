import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";
import {CognitoIdentityProvider} from '@aws-sdk/client-cognito-identity-provider';

import {makeDeleteUser} from '../fetch-enhancements/fetch-call-builders';
import {BaseScreen} from '../base-components/BaseScreen';

export function DeleteScreen() {
    const history = useHistory();

    const [user, setUser] = useState(undefined)

    const [failed, setFailed] = useState(false);
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
                    // TODO yikes..
                    setFailed(true);
                }

                const call = makeDeleteUser({
                    user: user,
                    successHandler: () => {},
                    setFailed: setFailed,
                    setErrorMessage: () => {history.push("/")}
                });
                call();

                Auth.signOut({ global: true });
                setUser(null);
            });
        } catch (err) {
            setFailed(true);
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
                { failed &&
                    <p className="ErrorMessage">Error deleting account</p>
                }

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
