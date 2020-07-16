const WINDOWS_AGILE_PATH = "C:\\Program Files (x86)\\Praim\\Agile\\AgileConfigurator\\AgileConfigurator.exe"
const LINUX_AGILE_PATH = "/usr/lib/agile-configurator/AgileConfigurator"
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "admin"
const OS = "w"

const info={
    //l: linux, w: windows
    os: OS,

    //info sull'admin (per linux)
    adminUsername: ADMIN_USERNAME,
    adminPassword: ADMIN_PASSWORD,

    //pass per l'accesso al database
    dbPass: null,

    //path per l'app di Agile
    path: null,

    //ids
    ABOUT: null,
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

before(async function(){
    //path per l'app di Agile
    if(info.os == "w"){
        info.path = WINDOWS_AGILE_PATH
    }else if(info.os == "l"){
        info.path = LINUX_AGILE_PATH
    }

    //Aggiorno info.dbPass
    await new Promise(function(resolve, reject){
        //path file contenente la password per redis
        var filePath = null
        if(info.os == "w"){
            filePath = "C:\\Program Files (x86)\\Praim\\Agile\\AgileService\\AgileBroker.conf"
        }else if(info.os == "l"){
            filePath = "/etc/praim-agile/broker.conf"
        }
    
        try{
            // read stream 
            var reader = require('readline').createInterface({
                input: require('fs').createReadStream(filePath)
            })
            // iterazione su ogni riga
            reader.on('line', function (line) {
                if(line.slice(0, 11) == "requirepass"){
                    info.dbPass = line.slice(12)
                    resolve()
                }
            })
        }catch{
            console.log("Errore nel cercare la password di redis in " + filePath)
            reject()
        }
    })
    
    //id per windows e linux
    if(info.os == 'w' || info.os == 'l'){
        info.ABOUT = "#menu-link-0"
        info.SYSTEM_SETTINGS = '#menu-link-1'
        info.NETWORK_SETTINGS = '#menu-link-2'
        info.THINMAN_SETTINGS = '#menu-link-3'
        info.REMOTE_ASSISTANCE = '#menu-link-4'
        info.WRITE_FILTER = '#menu-link-5'
        info.RESOURCES = '#menu-link-6'
        info.STARTUP = '#menu-link-7'
        info.CERTIFICATE_MANAGER = '#menu-link-8'
        info.USB_REDIRECTION = '#menu-link-10'
        info.DEVICE_LOCK = '#menu-link-11'
        info.AGILE_AUTHENTICATION = '#menu-link-12'
        info.MODE = '#menu-link-13'
    }
})

module.exports = {info}