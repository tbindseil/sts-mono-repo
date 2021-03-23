import React, {useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import {Auth} from "aws-amplify";

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {checkAuthenticated} from "./CheckAuthenticated";

export function LogoutScreen() {
    return (
        <div className="TopLevelContainer">

            <Header/>

            <MediaQuery minWidth={765}>
                <LogoutBody
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <LogoutBody
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>
        </div>
    );
}

function LogoutBody(props) {
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
        <>
            <header className={props.pageBorderClass}>

                <Title
                    titleText={"Log Out"}
                    underlineClass={props.underlineClass}/>

                <div className="Centered MaxWidth">
                    { failed &&
                        <p className="ErrorMessage">{errorMessage}</p>
                    }

                    <button onClick={onFinish}>
                        Log Out
                    </button>
                </div>

            </header>
        </>
    );
}
