
/**
 * Factory method to create the sts website standard error handler
 * @param setFailed - control client's boolean failed state
 * @param setErrorMessage - control client's error message state
 * @param errorMessagePrefix - special message
 * @return sts website standard error handler
 */
export const makeStandardErrorHandler = (setFailed, setErrorMessage, errorMessagePrefix = "") => {
    return (error) => {
        setFailed(true);
        var message = errorMessagePrefix;
        if (error.message) {
            message += ": " + error.message;
        }
        setErrorMessage(message);
    };
};

// could I maybe have this happen automagically?
// one way would involve cases and fallthroughs
// ie
// if (makeStandardErrorAndCatchHandlers != null) {
//      set vals
// } else {
//      vals are expected to be provided
// }
export const makeStandardErrorAndCatchHandlers = (setFailed, setErrorMessage, errorMessagePrefix = "") => {
    const cancelRequestErrorHandler = makeStandardErrorHandler(setFailed, setErrorMessage, errorMessagePrefix);
    const cancelRequestCatchHandler = makeStandardErrorHandler(setFailed, setErrorMessage, `in catch: ${errorMessagePrefix}`);

    return [cancelRequestErrorHandler, cancelRequestCatchHandler];
}
