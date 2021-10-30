// https://www.dofactory.com/javascript/design-patterns/singleton
export var ErrorRegistry = (function () {
    var instance;

    var _setFailed = () => {};
    var _setErrorMessage = () => {};

    function createInstance() {
        var object = {
            set_setFailed: function (func) {
                _setFailed = func;
            },
            set_setErrorMessage: function (func) {
                _setErrorMessage = func;
            },
            setFailed: function (failed) {
                _setFailed(failed);
            },
            setErrorMessage: function (msg) {
                _setErrorMessage(msg);
            }
        };
        return object;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();
