import React, {useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";
import {CognitoIdentityProvider} from '@aws-sdk/client-cognito-identity-provider';

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {checkAuthenticated} from "./CheckAuthenticated";

export function DeleteScreen() {
    return (
        <div className="TopLevelContainer">

            <Header/>

            <MediaQuery minWidth={765}>
                <DeleteBody
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <DeleteBody
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>

        </div>
    );
}

function DeleteBody(props) {
    const baseUrl = 'https://oercmchy3l.execute-api.us-west-2.amazonaws.com/prod/';

    const history = useHistory();

    const [user, setUser] = useState(undefined)
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

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
                    setFailed(true);
                }

                const url = baseUrl + user.username;
                fetch(url, {// TJTAG
                    method: 'DELETE',
                    mode: 'cors',
                })
                    .then(history.push("/"))
                    .catch((err) => {
                        setFailed(true);
                    });

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
        <>
            <header className={props.pageBorderClass}>

                <Title
                    titleText={"Delete Account"}
                    underlineClass={props.underlineClass}/>

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

            </header>
        </>
    );
}
