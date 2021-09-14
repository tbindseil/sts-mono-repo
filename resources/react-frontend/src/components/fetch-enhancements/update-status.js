
// builder?? with subclass that each have hard coded url??
// generic builder and wrappers that know specific details (url, http method)
//
// holy shit i think its happening
//
//
// error handlers take callbacks to modify components

export const updateRequestStatus = (availId, newStatus, user, successCallback, errorCallback, catchCallback) => {
    const availabilityRequestLambdaUrl = 'https://04c0w1j888.execute-api.us-west-2.amazonaws.com/prod/';
    // This is sort of a mistake, the id doesn't need to be appended to the url except I accidentaly made it like that in the cdk
    const url = availabilityRequestLambdaUrl + "/" + availId;

    const tokenString = 'Bearer ' + user.signInUserSession.idToken.jwtToken;
    fetch(url, {
        method: 'PUT',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': tokenString
        },
        body: JSON.stringify({
            forAvailability: availId,
            fromUser: user.username,
            status: newStatus
        })
    })
        .then(res => res.json())
        .then(
            (result) => successCallback(result),
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            // TODO wtf does that even mean??
            (error) => errorCallback()
        )
        .catch(err => catchCallback());
};
