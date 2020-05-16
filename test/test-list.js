//contiene la lista dei test e permette di attivarli/disattivarli

const testList={
    //Controlla se l'applicazione è attiva
    appIsRunning: false,
    
    //Controlla che sia aperta una singola finestra dell'applicazione
    onlyOneWindow: false,

    //Cambia lingua in inglese
    englishLanguage: true
};

module.exports = {testList};