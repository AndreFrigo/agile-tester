var Application = require('spectron').Application
const {db} = require ("./db.js");
const {info} = require("./set-before-test.js")

//da impostare prima di eseguire
//path per la cartella Praim/Agile

const global={
    //app di agile
    app: null
}

before(function(done) {
    //inizializzazione applicazione
    global.app = new Application({
        path: info.path,
    });
    //connessione al database
    db.dbConnection();
    done();
})


module.exports = {global}