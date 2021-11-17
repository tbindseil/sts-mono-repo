import moment from 'moment';

import {makeStandardErrorHandler} from "../fetch-enhancements/error-handling";

// TODO maybe import from cdk output eventually?
const USER_LAMBDA_URL = 'https://oercmchy3l.execute-api.us-west-2.amazonaws.com/prod/';
const AVAILABILITY_LAMBDA_URL = 'https://k2ajudwpt0.execute-api.us-west-2.amazonaws.com/prod/'
const AVAILABILITY_REQUEST_URL = 'https://04c0w1j888.execute-api.us-west-2.amazonaws.com/prod/';
const AVAILABILITY_SERIES_URL = 'https://t9u6av4bm0.execute-api.us-west-2.amazonaws.com/prod/';


export const apiFactory = {

    setFailed: undefined,
    setErrorMessage: undefined,

    configure: (newSetFailed, newSetErrorMessage) => {
        apiFactory.setFailed = newSetFailed;
        apiFactory.setErrorMessage = newSetErrorMessage;
    },

    makeBasicFetchCall: (props) => {
        // default error handling
        if (!props.errorHandler) {
            props.errorHandler = makeStandardErrorHandler(apiFactory.setFailed, apiFactory.setErrorMessage, props.errorMessagePrefix);
        }
        if (!props.catchHandler) {
            props.catchHandler = makeStandardErrorHandler(apiFactory.setFailed, apiFactory.setErrorMessage, `In catch: ${props.errorMessagePrefix}`);
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
                .then(result => { console.log("result is:"); console.log(result); return result; })
                .then(result => result.json())
                // .then((result) => result.json ? result.json() : result)
                .then(result_json => { console.log("result_json is:"); console.log(result_json); return result_json; })
                .then(
                    result => props.successHandler(result),
                    error => props.errorHandler(error)
                )
                .catch(error => props.catchHandler(error))
                .finally(() => props.finallyHandler ? props.finallyHandler() : () => {});
        };

        return fetchCall;
    },

    makeAuthenticatedFetchCall: (props) => {
        const tokenString = 'Bearer ' + props.user.signInUserSession.idToken.jwtToken;
        props.headers ?
            props.headers['Authorization'] = tokenString
            :
            props.headers = {'Authorization': tokenString};

        return apiFactory.makeBasicFetchCall(props);
    },

    makePostRequestStatusCall: (props) => {
        const body = JSON.stringify({
            forAvailability: props.availId,
            fromUser: props.username
        });

        return apiFactory.makeAuthenticatedFetchCall({
            url: AVAILABILITY_REQUEST_URL,
            user: props.user,
            method: 'POST',
            body: body,
            errorMessagePrefix: 'Error posting request',
            ...props
        });
    },

    makeUpdateRequestStatus: (props) => {
        const url = AVAILABILITY_REQUEST_URL + "/" + props.forAvailability;

        return apiFactory.makeAuthenticatedFetchCall({
            url: url,
            user: props.user,
            method: 'PUT',
            body: JSON.stringify({
                forAvailability: props.forAvailability,
                fromUser: props.fromUser,
                status: props.newStatus
            }),
            errorMessagePrefix: "Error updating request",
            ...props
        });
    },

    // TODO so far I haven't ensured I can send error message or failed either
    makeGetUser: (props) => {
        return apiFactory.makeBasicFetchCall({
            url: USER_LAMBDA_URL + props.username,
            method: 'GET',
            errorMessagePrefix: "Error getting user",
            ...props
        });
    },

    makePutUser: (props) => {
        return apiFactory.makeAuthenticatedFetchCall({
            url: USER_LAMBDA_URL + props.user.username,
            method: 'PUT',
            errorMessagePrefix: 'Error updating user',
            ...props
        });
    },

    makePostUser: (props) => {
        return apiFactory.makeBasicFetchCall({
            url: USER_LAMBDA_URL,
            method: 'POST',
            errorMessagePrefix: 'Error creating user',
            ...props
        });
    },

    makeDeleteUser: (props) => {
        return apiFactory.makeBasicFetchCall({ // TODO this needs to be authenticated
            url: USER_LAMBDA_URL + props.user.username,
            method: 'DELETE',
            errorMessagePrefix: 'Error deleting user',
            ...props
        });
    },

    makeGetAvailabilityRequests: (props) => {
        const url = new URL(AVAILABILITY_REQUEST_URL);
        const getAvailRequestsReceivedInput = {
            forUser: props.forUser,
            forAvailability: props.forAvailability,
            fromUser: props.fromUser
        };
        url.searchParams.append('getAvailRequestInput', JSON.stringify(getAvailRequestsReceivedInput));

        return apiFactory.makeAuthenticatedFetchCall({
            url: url,
            user: props.user,
            method: 'GET',
            errorMessagePrefix: "Error getting availability status",
            ...props
        });
    },

    makePostAvailability: (props) => {
        const availStart = moment(props.day).set('hour', props.startTime.hours()).set('minute', props.startTime.minutes()).toDate();
        const availEndMoment = moment(props.day).set('hour', props.endTime.hours()).set('minute', props.endTime.minutes());

        // gotta deal with 12AM...
        if (props.endTime.hours() === 0 && props.endTime.minutes() === 0) {
            availEndMoment.add('day', 1);
        }

        const availEnd = availEndMoment.toDate();

        const availability = {
            subjects: props.selectedSubjects.map(subject => subject.name).join(','),
            startTime: availStart,
            endTime: availEnd,
            tutor: props.user.username
        };

        return apiFactory.makeAuthenticatedFetchCall({
            url: AVAILABILITY_LAMBDA_URL,
            method: 'POST',
            body: JSON.stringify(availability),
            errorMessagePrefix: 'Error creating availability',
            ...props
        });
    },

    makeGetAvailabilities: (props) => {
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

        return apiFactory.makeAuthenticatedFetchCall({
            url: url,
            user: props.user,
            method: 'GET',
            errorMessagePrefix: "Error getting availabilities",
            ...props
        });
    },

    makeDeleteAvailability: (props) => {
        return apiFactory.makeAuthenticatedFetchCall({
            url: AVAILABILITY_LAMBDA_URL + props.availabilityId,
            user: props.user,
            method: 'DELETE',
            errorMessagePrefix: 'Error deleting availability',
            ...props
        });
    },

    makeGetAvailabilityStatus: (props) => {
        return apiFactory.makeAuthenticatedFetchCall({
            url: `${AVAILABILITY_LAMBDA_URL}status/${props.availId}`,
            user: props.user,
            method: 'GET',
            errorMessagePrefix: "Error getting availability status",
            ...props
        });
    },

    makePostAvailabilitySeries: (props) => {
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        const availStart = moment(today).set('hour', props.startTime.hours()).set('minute', props.startTime.minutes()).toDate();
        const availEndMoment = moment(today).set('hour', props.endTime.hours()).set('minute', props.endTime.minutes());

        // gotta deal with 12AM...
        if (props.endTime.hours() === 0 && props.endTime.minutes() === 0) {
            availEndMoment.add('day', 1);
        }

        const availEnd = availEndMoment.toDate();
        const availabilitySeriesRequest = {
            sunday: props.sunday,
            monday: props.monday,
            tuesday: props.tuesday,
            wednesday: props.wednesday,
            thursday: props.thursday,
            friday: props.friday,
            saturday: props.saturday,
            numWeeks: props.numWeeks,
            subjects: props.subjects.map(subject => subject.name).join(','),
            startTime: availStart,
            endTime: availEnd,
        };

        return apiFactory.makeAuthenticatedFetchCall({
            url: `${AVAILABILITY_SERIES_URL}/`,
            user: props.user,
            method: 'POST',
            body: JSON.stringify(availabilitySeriesRequest),
            errorMessagePrefix: "Error getting availability series",
            ...props
        });
    },

    makeDeleteAvailabilitySeries: (props) => {
        return apiFactory.makeBasicFetchCall({
            url: AVAILABILITY_SERIES_URL + props.availabilitySeriesId,
            method: 'DELETE',
            errorMessagePrefix: 'Error deleting availability series',
            ...props
        });
    },
};
