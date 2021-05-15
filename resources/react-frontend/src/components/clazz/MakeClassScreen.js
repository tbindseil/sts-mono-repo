import React, {useCallback, useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';

import {useHistory} from 'react-router-dom';
import {cloneDeep} from 'lodash';

// import './Profile.css';
import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {FormTableRow} from '../forms/TextInput'
import {checkAuthenticated} from "../auth/CheckAuthenticated";

export function MakeClassScreen() {
    return (
        <div className="TopLevelContainer">
            <Header/>

            <MediaQuery minWidth={765}>
                <MakeClassBody
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <MakeClassBody
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>
        </div>
    );
};

function MakeClassBody(props) {
    return (
        <p>
            MakeClassBody
        </p>
    );
}
