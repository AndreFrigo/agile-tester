const os = require("os")

const WINDOWS_AGILE_PATH = "C:\\Program Files (x86)\\Praim\\Agile\\AgileConfigurator\\AgileConfigurator.exe"
const LINUX_AGILE_PATH = "/usr/lib/agile-configurator/AgileConfigurator"
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "admin"
//default os
const OS = "w"

const info={
    //l: linux, w: windows
    os: null,

    //info sull'admin (per linux)
    adminUsername: ADMIN_USERNAME,
    adminPassword: ADMIN_PASSWORD,

    //pass per l'accesso al database
    dbPass: null,

    //path per l'app di Agile
    path: null
}

before(async function(){
    //Sistema operativo corrente
    var osType = null
    try{
        osType = os.type()
    }catch{
        osType = null
    }
    if(osType == "Windows_NT"){
        info.os = "w"
    }else if(osType == "Linux"){
        info.os = "l"
    }else{
        info.os = OS
    }

    //path per l'app di Agile
    if(info.os == "w"){
        info.path = WINDOWS_AGILE_PATH
    }else if(info.os == "l"){
        info.path = LINUX_AGILE_PATH
    }

    //password per accesso a database redis
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
    
})

module.exports = {info}