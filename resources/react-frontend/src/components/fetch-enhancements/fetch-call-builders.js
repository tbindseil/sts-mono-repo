import moment from 'moment';

import {makeStandardErrorHandler} from "../fetch-enhancements/error-handling";

// TODO maybe import from cdk output eventually?
const AVAILABILITY_LAMBDA_URL = 'https://k2ajudwpt0.execute-api.us-west-2.amazonaws.com/prod'
const AVAILABILITY_REQUEST_URL = 'https://04c0w1j888.execute-api.us-west-2.amazonaws.com/prod/';

const makeBasicFetchCall = (props) => {
    // default error handling
    if (!props.errorHandler) {
        props.errorHandler = makeStandardErrorHandler(props.setFailed, props.setErrorMessage, props.errorMessagePrefix);
    }
    if (!props.catchHandler) {
        props.catchHandler = makeStandardErrorHandler(props.setFailed, props.setErrorMessage, `In catch: ${props.errorMessagePrefix}`);
    }

    props.headers ?
        props.headers['Content-Type'] = 'application/json'
    :
        props.headers = {'Content-Type': 'application/json'};

    const fetchCall = () => { // Ahhh how to do any args?
        fetch(props.url, {
            method: props.method,
            mode: 'cors',
            headers: props.headers,
            body: props.body
        })
            .then(result => result.json())
            .then(
                result => props.successHandler(result),
                error => props.errorHandler(error)
            )
            .catch(error => props.catchHandler(error));
    };

    return fetchCall;
};

const makeAuthenticatedFetchCall = (props) => {
    const tokenString = 'Bearer ' + props.user.signInUserSession.idToken.jwtToken;
    props.headers ?
        props.headers['Authorization'] = tokenString
    :
        props.headers = {'Authorization': tokenString};

    return makeBasicFetchCall(props);
};

export const makePostRequestStatusCall = (props) => {

    const body = JSON.stringify({
        forAvailability: props.availId,
        fromUser: props.username
    });

    return makeAuthenticatedFetchCall({
        url: AVAILABILITY_REQUEST_URL,
        user: props.user,
        method: 'POST',
        body: body,
        successHandler: props.successHandler,
        setFailed: props.setFailed,
        setErrorMessage: props.setErrorMessage,
        errorMessagePrefix: 'Error posting request'
    });
};

export const makeUpdateRequestStatus = (props) => {

    const url = AVAILABILITY_REQUEST_URL + "/" + props.availId;

    return makeAuthenticatedFetchCall({
        url: url,
        user: props.user,
        method: 'PUT',
        body: JSON.stringify({
            forAvailability: props.availId,
            fromUser: props.user.username,
            status: props.newStatus
        }),
        successHandler: props.successHandler,
        setFailed: props.setFailed,
        setErrorMessage: props.setErrorMessage,
        errorMessagePrefix: "Error updating request"
    });
};

export const makeGetAvailabilities = (props) => {
    const url = new URL(AVAILABILITY_LAMBDA_URL);

    // startTime and endTime are 12:00:00 am of sunday morning and 11:59:59 of saturday night for week of selectedDate
    const requestStartTime = moment(props.startTime).toDate();
    const requestEndTime = moment(props.startTime).add('minute', 30).toDate();
    const getAvailInput = {
        username: "*",
        subject: props.subject,
        startTime: requestStartTime,
        endTime: requestEndTime
    };
    url.searchParams.append('getAvailInput', JSON.stringify(getAvailInput));

    return makeAuthenticatedFetchCall({
        url: url,
        user: props.user,
        method: 'GET',
        successHandler: props.successHandler,
        setFailed: props.setFailed,
        setErrorMessage: props.setErrorMessage,
        errorMessagePrefix: "Error getting availabilities"
    });
};

export const makeGetAvailabilityStatus = (props) => {
    return makeAuthenticatedFetchCall({
        url: `${AVAILABILITY_LAMBDA_URL}/status/${props.availId}`,
        user: props.user,
        method: 'GET',
        successHandler: props.successHandler,
        setFailed: props.setFailed,
        setErrorMessage: props.setErrorMessage,
        errorMessagePrefix: "Error getting availability status"
    });
};

// TODO on checkauthenticated, set/unset user in factory (this is the factory)
export const makeGetAvailabilityRequests = (props) => {
    const url = new URL(AVAILABILITY_REQUEST_URL);
    const getAvailRequestsReceivedInput = {
        forUser: props.forUser,
        forAvailability: props.forAvailability,
        fromUser: props.fromUser
    };
    url.searchParams.append('getAvailRequestInput', JSON.stringify(getAvailRequestsReceivedInput));

    return makeAuthenticatedFetchCall({
        url: url,
        user: props.user,
        method: 'GET',
        successHandler: props.successHandler,
        setFailed: props.setFailed,
        setErrorMessage: props.setErrorMessage,
        errorMessagePrefix: "Error getting availability status"
    });
};
