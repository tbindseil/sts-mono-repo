

//
// so I think that the pieces of the 'BaseScreen' will have to come from
// props
//
// why?
//
// otherwise nothing can go in there
//
// or,
// the <BaseComponent> element can have children
// like <BaseComponent> element wraps everything
//
// but then, what does that accomplish?
// and really, should it be called OutlineComponent
//
// maybe I could have several standard pieces
// and a standard arangment
// here, i think the standard arangement is equivalent
// to base component
//
// so what are some standard pieces?
// from a quick look through the app:
//
// All (or almost) pages:
// * nav bar aka header
// * section title
// * paragraph headers
// * body
// * * middle part
// * * side borders
// * footer
//
// Not as frequent
// * tables (requests sent/received/request avail)
// * 2 column input forms (login, register, confirm, edit profile, create availability)
// * 2 column info forms (show profile, show avail)
// * calendar (my calendar/calendar)
//
// the prior of those two sets of components is basescreen
//
// i also think basescreen handles small vs large screens








import React, {useCallback, useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';

import moment from 'moment';
import {useHistory} from 'react-router-dom';
import {cloneDeep} from 'lodash';

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {FormTableRow} from '../forms/TextInput'
import {checkAuthenticated} from "../auth/CheckAuthenticated";
import {makePutUser, makeGetUser, makeGetAvailabilityRequests, makeUpdateRequestStatus} from '../fetch-enhancements/fetch-call-builders';
import {makeStandardErrorHandler} from "../fetch-enhancements/error-handling";

export function BaseScreen(props) {
    return (
        <div className="TopLevelContainer">
            <Header/>

            <MediaQuery minWidth={765}>
                <ProfileBody
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}>
                    {props.children}
                </ProfileBody>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <ProfileBody
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}>
                    {props.children}
                </ProfileBody>
            </MediaQuery>

            <Bottom/>
        </div>
    );
};

function ProfileBody(props) {
    const history = useHistory();

    // TODO are errors handled by basescreen? that is something that could reduce
    // code for passing error handlers to api call factories
    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // TODO flag for authenticated vs not
    const [user, setUser] = useState(undefined);
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

    return (
        <>
            <header className={props.pageBorderClass}>

                <Title
                    titleText={"Profile"}
                    underlineClass={props.underlineClass}/>

                <div className="Centered MaxWidth ImaginaryClass">

                    {props.children}


                    { failed &&
                        <p className="ErrorMessage">{errorMessage}</p>
                    }

                </div>

            </header>
        </>
    );
}