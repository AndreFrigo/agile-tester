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
    adminPassword: "admin",

    //ids
    SYSTEM_SETTINGS,
    NETWORK_SETTINGS,
    THINMAN_SETTINGS,
    REMOTE_ASSISTANCE,
    WRITE_FILTER,
    RESOURCES,
    STARTUP,
    CERTIFICATE_MANAGER,
    USB_REDIRECTION,
    DEVICE_LOCK,
    AGILE_AUTHENTICATION,
    MODE
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

    if(global.env == 'w' || global.env == 'l'){
        SYSTEM_SETTINGS = '#menu-link-1'
        NETWORK_SETTINGS = '#menu-link-2'
        THINMAN_SETTINGS = '#menu-link-3'
        REMOTE_ASSISTANCE = '#menu-link-4'
        WRITE_FILTER = '#menu-link-5'
        RESOURCES = '#menu-link-6'
        STARTUP = '#menu-link-7'
        CERTIFICATE_MANAGER = '#menu-link-8'
        USB_REDIRECTION = '#menu-link-10'
        DEVICE_LOCK = '#menu-link-11'
        AGILE_AUTHENTICATION = '#menu-link-12'
        MODE = '#menu-link-13'
    }
    done();
})


module.exports = {global}