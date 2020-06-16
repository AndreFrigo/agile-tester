//contiene la lista dei test e permette di attivarli/disattivarli

const testList={
    //Controlla se l'applicazione è attiva
    appIsRunning: false,
    
    //Controlla che sia aperta una singola finestra dell'applicazione
    onlyOneWindow: false,

    //Cambia lingua in inglese
    englishLanguage: false,

    //Avvia anteprima modalità Agile
    previewAgile: false,

    //Aggiunge un address all'elenco dei ThinMan
    addThinManAddress: true,

    //Elimina un address dall'elenco dei ThinMan (info in agileAddress)
    deleteThinManAddress: true,

    //Aggiunge una redirection rule per usb
    addUsbRedirection: false
};

module.exports = {testList};