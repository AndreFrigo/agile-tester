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
    addThinManAddress: false,

    //Elimina un address dall'elenco dei ThinMan (info in agileAddress)
    deleteThinManAddress: true
};

module.exports = {testList};