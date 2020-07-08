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
    SYSTEM_SETTINGS: null,
    NETWORK_SETTINGS: null,
    THINMAN_SETTINGS: null,
    REMOTE_ASSISTANCE: null,
    WRITE_FILTER: null,
    RESOURCES: null,
    STARTUP: null,
    CERTIFICATE_MANAGER: null,
    USB_REDIRECTION: null,
    DEVICE_LOCK: null,
    AGILE_AUTHENTICATION: null,
    MODE: null
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
        global.SYSTEM_SETTINGS = '#menu-link-1'
        global.NETWORK_SETTINGS = '#menu-link-2'
        global.THINMAN_SETTINGS = '#menu-link-3'
        global.REMOTE_ASSISTANCE = '#menu-link-4'
        global.WRITE_FILTER = '#menu-link-5'
        global.RESOURCES = '#menu-link-6'
        global.STARTUP = '#menu-link-7'
        global.CERTIFICATE_MANAGER = '#menu-link-8'
        global.USB_REDIRECTION = '#menu-link-10'
        global.DEVICE_LOCK = '#menu-link-11'
        global.AGILE_AUTHENTICATION = '#menu-link-12'
        global.MODE = '#menu-link-13'
    }
    done();
})


module.exports = {global}