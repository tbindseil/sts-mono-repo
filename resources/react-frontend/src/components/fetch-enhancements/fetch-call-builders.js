import {makeStandardErrorHandler} from "../fetch-enhancements/error-handling";

// TODO maybe import from cdk output eventually?
const AVAILABILITY_REQUEST_URL = 'https://04c0w1j888.execute-api.us-west-2.amazonaws.com/prod/';

const makeBasicFetchCall = (props) => {
    // default error handling
    if (!props.errorCallback) {
        props.errorCallback = makeStandardErrorHandler(props.setFailed, props.setErrorMessage, props.errorMessagePrefix);
    }
    if (!props.catchCallback) {
        props.catchCallback = makeStandardErrorHandler(props.setFailed, props.setErrorMessage, `In catch: ${props.errorMessagePrefix}`);
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
            .then(result => result.json)
            .then(
                result => props.successCallback(result),
                error => props.errorCallback(error)
            )
            .catch(error => props.catchCallback(error));
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
}

export const makePostRequestStatusCall = (user,
                                          availId,
                                          username,
                                          successCallback,
                                          setFailed,
                                          setErrorMessage,
                                          errorMessagePrefix) => {

    const body = JSON.stringify({
        forAvailability: availId,
        fromUser: username
    });

    return makeAuthenticatedFetchCall({
        url: AVAILABILITY_REQUEST_URL,
        user: user,
        method: 'POST',
        body: body,
        successCallback: successCallback,
        setFailed: setFailed,
        setErrorMessage: setErrorMessage,
        errorMessagePrefix: errorMessagePrefix
    });
};

export const makeUpdateRequestStatus = (user,
                                        availId,
                                        newStatus,
                                        successCallback,
                                        setFailed,
                                        setErrorMessage,
                                        errorMessagePrefix) => {

    const url = AVAILABILITY_REQUEST_URL + "/" + availId;

    return makeAuthenticatedFetchCall({
        url: url,
        user: user,
        method: 'PUT',
        body: JSON.stringify({
            forAvailability: availId,
            fromUser: user.username,
            status: newStatus
        }),
        successCallback: successCallback,
        setFailed: setFailed,
        setErrorMessage: setErrorMessage,
        errorMessagePrefix: errorMessagePrefix
    });
}
