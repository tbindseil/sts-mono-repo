import React, {useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';

import {useHistory} from 'react-router-dom';

// TODO move below to base-components
import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {checkAuthenticated, checkUnauthenticated} from "../auth/CheckAuthenticated";
import {ErrorRegistry} from './ErrorRegistry';
import {apiFactory} from '../fetch-enhancements/fetch-call-builders';

export function BaseScreen(props) {
    return (
        <div className="TopLevelContainer">
            <Header/>

            <MediaQuery minWidth={765}>
                <BaseBody
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}
                    titleText={props.titleText}
                    setUser={props.setUser}
                    needAuthenticated={props.needAuthenticated}
                    needUnauthenticated={props.needUnauthenticated}>
                    {props.children}
                </BaseBody>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <BaseBody
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}
                    titleText={props.titleText}
                    setUser={props.setUser}
                    needAuthenticated={props.needAuthenticated}
                    needUnauthenticated={props.needUnauthenticated}>
                    {props.children}
                </BaseBody>
            </MediaQuery>

            <Bottom/>
        </div>
    );
};

function BaseBody(props) {
    const history = useHistory();

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // TODO do i need to detach upon component destruction?
    ErrorRegistry.getInstance().set_setFailed(setFailed);
    ErrorRegistry.getInstance().set_setErrorMessage(setErrorMessage);

    apiFactory.configure(setFailed, setErrorMessage);

    useEffect(() => {
        if (props.needAuthenticated) {
            checkAuthenticated(() => history.push("/anonymous-user"), props.setUser);
        }
        if (props.needUnauthenticated) {
            checkUnauthenticated(() => history.push("/profile"));
        }
    }, [
        history, props.setUser, props.needUnauthenticated, props.needAuthenticated
    ]);

    return (
        <>
            <header className={props.pageBorderClass}>

                <Title
                    titleText={props.titleText}
                    underlineClass={props.underlineClass}/>


                    {props.children}


                    { failed &&
                        <p className="ErrorMessage">{errorMessage}</p>
                    }

            </header>
        </>
    );
}
