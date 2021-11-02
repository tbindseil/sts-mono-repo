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

import {BaseScreen} from './BaseScreen';
import {ErrorRegistry} from './ErrorRegistry';


import {ScreenSizeConfigurable} from './ScreenSizeConfigurable';

export function TestScreen(props) {
    return (
        <BaseScreen titleText="Profile">
            <ScreenSizeConfigurable smallScreenClassName={"Blue"} bigScreenClassName={"Red"}>
                <p>Test</p>
            </ScreenSizeConfigurable>

            <button onClick={() => { ErrorRegistry.getInstance().setFailed(true); ErrorRegistry.getInstance().setErrorMessage("errrrr") }}>
                BUTTON
            </button>
        </BaseScreen>
    );
}
