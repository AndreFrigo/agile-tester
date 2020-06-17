const {db} = require ("../db.js");
const {global} = require ("../global.js");
var assert = require('assert');


//Controlla la lingua del sistema
describe("Checking language", function(){
    it('Checking language', async () => {
        //connessione al database
        db.dbConnection();

        //aggiorno la lingua in base a quella del db
        global.language = await db.dbLanguage();

        //controllo lingua di agile dall'interfaccia
        const lang = global.app.client.$('#menu-link-1');
        await lang.getText().then(function(l){
            if(l == "Impostazioni di Sistema") assert.equal(global.language, 1)
            else if(l == "System Settings") assert.equal(global.language, 2)
            else if(l == "Ajustes del Sistema") assert.equal(global.language, 3)
            else assert.ok(false, "error while checking the language")
        })
    });
})
