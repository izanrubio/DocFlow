let _toast = null;

export const setToastBridge = (t) => { _toast = t; };

export const toastBridge = {
    success: (...args) => _toast?.success(...args),
    error:   (...args) => _toast?.error(...args),
    warning: (...args) => _toast?.warning(...args),
    info:    (...args) => _toast?.info(...args),
};
