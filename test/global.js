var Application = require('spectron').Application
const {db} = require ("./db.js");

//da impostare prima di eseguire
//path per la cartella Praim/Agile
const WINDOWS_AGILE_PATH = "C:\\Program Files (x86)\\Praim\\Agile\\AgileConfigurator\\AgileConfigurator.exe"
const LINUX_AGILE_PATH = "/usr/lib/agile-configurator/AgileConfigurator"
const global={
    //app di agile
    app: null,
    //l: linux, w: windows
    env: 'l',
    //info sull'admin (per linux)
    adminUsername: "admin",
    adminPassword: "admin"
}

before(function(done) {
    //path
    var p = null
    if(global.env == 'w'){
        p = WINDOWS_AGILE_PATH
    }else if(global.env == 'l'){
        p = LINUX_AGILE_PATH
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