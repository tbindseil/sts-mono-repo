import moment from 'moment';

import {makeStandardErrorHandler} from "../fetch-enhancements/error-handling";

// TODO maybe import from cdk output eventually?
const USER_LAMBDA_URL = 'https://oercmchy3l.execute-api.us-west-2.amazonaws.com/prod/';
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
        return fetch(props.url, {
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

// TODO so far I haven't ensured I can send error message or failed either
export const makeGetUser = (props) => {
    return makeBasicFetchCall({
        url: USER_LAMBDA_URL + props.username,
        method: 'GET',
        successHandler: props.successHandler,
        setFailed: props.setFailed,
        errorHandler: props.errorHandler,
        catchHandler: props.catchHandler
    });
};

export const makePutUser = (props) => {
    return makeAuthenticatedFetchCall({
        url: USER_LAMBDA_URL + props.user.username,
        method: 'PUT',
        ...props
    });
};

export const makePostUser = (props) => {
    return makeBasicFetchCall({
        url: USER_LAMBDA_URL,
        method: 'POST',
        ...props
    });
};

export const makeDeleteUser = (props) => {
    return makeBasicFetchCall({ // TODO this needs to be authenticated
        url: USER_LAMBDA_URL + props.user.username,
        method: 'DELETE',
        ...props
    });
};

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

export const makePostAvailability = (props) => {
    const availStart = moment(props.day).set('hour', props.startTime.hours()).set('minute', props.startTime.minutes()).toDate();
    const availEndMoment = moment(props.day).set('hour', props.endTime.hours()).set('minute', props.endTime.minutes());

    // gotta deal with 12AM...
    if (props.endTime.hours() === 0 && props.endTime.minutes() === 0) {
        availEndMoment.add('day', 1);
    }

    const availEnd = availEndMoment.toDate();

    const availability = { // Continue here, why am i getting failures herer?
        subjects: props.selectedSubjects.map(subject => subject.name).join(','),
        startTime: availStart,
        endTime: availEnd,
        tutor: props.user.username
    };

    return makeAuthenticatedFetchCall({
        url: AVAILABILITY_LAMBDA_URL,
        method: 'POST',
        body: JSON.stringify(availability),
        ...props
    });
};

export const makeGetAvailabilities = (props) => {
    const url = new URL(AVAILABILITY_LAMBDA_URL);

    const requestStartTime = moment(props.startTime).toDate();
    const requestEndTime = moment(props.endTime).toDate();
    const getAvailInput = {
        username: props.username,
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
