
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
