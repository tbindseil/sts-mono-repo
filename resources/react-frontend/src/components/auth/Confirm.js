// navigate here from AnonymousUser (or from Register)
// this page allows for registration confirmation via email/confirmation code
// upon successful confirmation, notify them that they must login and provide a link to logging
//
// in addition, if this page is navigated too with a logged in user, we inform the user that they are already logged in, then allow for them to logout via a link to the logout page

import React from 'react';

import {Header} from '../Header';

export function Confirm() {
    return (
        <>
            <Header/>
            <h1>Confirm</h1>
        </>

    );
}
