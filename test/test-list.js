//contiene la lista dei test richiamabili da test.js 

const testList={
    setEnglishLanguage: "./system_settings/set-english-language",
    checkLanguage: "./general/check-language",
    appIsRunning: "./general/app-is-running",
    onlyOneWindow: "./general/only-one-window",
    addThinmanAddress: "./thinman_settings/add-thinman-address",
    deleteThinmanAddress: "./thinman_settings/delete-thinman-address",
    addUsbRedirection: "./usb_redirection/add-usb-redirection"
};

module.exports = {testList};