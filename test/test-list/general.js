const {db} = require ("../db.js");
const {global} = require ("../global.js");
var assert = require('assert');

function appIsRunning(){
    //Controlla se l'applicazione è attiva
    describe("App is running", function(){
        it('App is running', async () => {
            var running = global.app.isRunning();
            assert.equal(running, true);
        });
    })
}

function onlyOneWindow(){
    //Controlla che sia aperta una singola finestra dell'applicazione
    describe("Shows only one window", function(){
        it('Shows only one window', async () => {
            global.app.client.waitUntilWindowLoaded();
            const count = await global.app.client.getWindowCount();
            assert.equal(count, 1,"there are more windows");
        });
    })
}


function checkLanguage(){
    //Controlla la lingua del sistema
    describe("Checking language", function(){
        it('Checking language', async () => {
            //connessione al database
            db.dbConnection();

            //aggiorno la lingua in base a quella del db
            global.language = await db.dbLanguage();

            //controllo lingua di agile dall'interfaccia
            var l = null;
            try{
                const lang = global.app.client.$('#menu-link-1');
                l = await lang.getText();
            }catch{
                assert.ok(false, "Impossible to find the text for checking language")
            }
            if(l == "Impostazioni di Sistema") assert.equal(global.language, 1)
            else if(l == "System Settings") assert.equal(global.language, 2)
            else if(l == "Ajustes del Sistema") assert.equal(global.language, 3)
            else assert.ok(false, "error while checking the language")
        });
    })
}

module.exports = {
    appIsRunning: appIsRunning,
    onlyOneWindow: onlyOneWindow,
    checkLanguage: checkLanguage
}
