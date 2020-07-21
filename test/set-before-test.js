const WINDOWS_AGILE_PATH = "C:\\Program Files (x86)\\Praim\\Agile\\AgileConfigurator\\AgileConfigurator.exe"
const LINUX_AGILE_PATH = "/usr/lib/agile-configurator/AgileConfigurator"
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "admin"
//default os
const OS = "w"


const getCurrentOS = function(){
    //Sistema operativo corrente
    var osType = null
    try{
        osType = require("os").type()
    }catch{
        osType = null
    }
    if(osType == "Windows_NT"){
        return "w"
    }else if(osType == "Linux"){
        return "l"
    }else{
        return OS
    }
}

const getAgilePath = function(os){
    //path per l'app di Agile
    if(os == "w"){
        return WINDOWS_AGILE_PATH
    }else if(os == "l"){
        return LINUX_AGILE_PATH
    }
}

const currentOS = getCurrentOS()  

const info={
    //l: linux, w: windows
    os: currentOS,

    //info sull'admin (per linux)
    adminUsername: ADMIN_USERNAME,
    adminPassword: ADMIN_PASSWORD,

    //path per l'app di Agile
    path: getAgilePath(currentOS),

    //password per connessione al database
    dbPass: null
}

before(async function(){
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