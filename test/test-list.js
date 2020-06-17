//contiene la lista dei test e permette di attivarli/disattivarli

const testList={
    // //Controlla se l'applicazione è attiva
    // appIsRunning: false,
    
    // //Controlla che sia aperta una singola finestra dell'applicazione
    // onlyOneWindow: false,

    // //Cambia lingua in inglese
    // englishLanguage: false,

    // //Avvia anteprima modalità Agile
    // previewAgile: false,

    // //Aggiunge un address all'elenco dei ThinMan
    // addThinManAddress: true,

    // //Elimina un address dall'elenco dei ThinMan (info in agileAddress)
    // deleteThinManAddress: true,

    // //Aggiunge una redirection rule per usb
    // addUsbRedirection: false,

    setEnglishLanguage: "./system_settings/set-english-language",
    checkLanguage: "./general/check-language",
    appIsRunning: "./general/app-is-running",
    onlyOneWindow: "./general/only-one-window",
    addThinmanAddress: "./thinman_settings/add-thinman-address",
    deleteThinmanAddress: "./thinman_settings/delete-thinman-address",
    addUsbRedirection: "./usb_redirection/add-usb-redirection"
};

module.exports = {testList};