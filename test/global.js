var Application = require('spectron').Application
const {db} = require ("./db.js");

//da impostare prima di eseguire
//path per la cartella Praim/Agile
const AGILE_PATH = "C:\\Program Files (x86)\\Praim\\Agile"

const global={
    //app di agile
    app: null
}

before(function(done) {
    //inizializzazione applicazione
    global.app = new Application({
        path: AGILE_PATH + '\\AgileConfigurator\\AgileConfigurator.exe',
    });
    //connessione al database
    db.dbConnection();
    done();
})


module.exports = {global}