var Application = require('spectron').Application
const {db} = require ("./db.js");

//da impostare prima di eseguire
//path per la cartella Praim/Agile
const AGILE_PATH = "C:\\Program Files (x86)\\Praim\\Agile"

const global={
    //app di agile
    app: null,
    //l: linux, w: windows
    env: 'l'
}

before(function(done) {
    //path
    var p = null
    if(global.env == 'w'){
        p = AGILE_PATH + '\\AgileConfigurator\\AgileConfigurator.exe'
    }else if(global.env == 'l'){
        p = "/usr/lib/agile-configurator/AgileConfigurator"
    }
    //inizializzazione applicazione
    global.app = new Application({
        path: p,
    });
    //connessione al database
    db.dbConnection();
    done();
})


module.exports = {global}