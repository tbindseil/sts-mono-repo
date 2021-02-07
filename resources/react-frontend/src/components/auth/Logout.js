// navigate here from Profile (or from Login, Register, or Confirm when those pages are navigated too with a logged in user)
// this page allows for logging out with the click of a button
//
// in addition, if this page is navigated too without a logged in user, we inform the user that they aren't logged in, then allow for them to login via a link to the AnonymousUser page

import React from 'react';

import {Header} from '../Header';

export function Logout() {
    return (
        <>
            <Header/>
            <h1>Logout</h1>
        </>

    );
}
