const redis = require('redis')

const db={
    conn: null,
    //connessione al database
    dbConnection(){
        db.conn = redis.createClient(1681);
        db.conn.auth("75FBCFC18643144DE9EC8F0DC8C099F2B7B105C3192DE68196231BA90669A9D8581D75FC5C1D14C1302D16A8567BBD3D19596A34A2B66F1A8ED2571B38CA7574BC8F05A96AC52FF6811375F1A3E3BF262A7C7E7A4C5572222D5CA3D923C24502B5A4D8AB59B1E3681084A9BF996D73B2560997FA29DDB65194F46DF43C0C1E43D21C9373E04587D212ECB3D954BEA5B99FE50C176E99FDEF13B6FD402B4FBEF0763F8735E34EC8611E5396C2E2345E6B730285FEF9BBB21B4379DBBF33AA4FF3D100EC13ABE330D2383B553BE543C1A75C7CBAF38BD3AFFDB31E4974621F92B2F7B3DD7350C5B36960C732D9CB2DF1D3CA614319523D08309889");
    },
    //controlla lingua nel database, output: int (1,2,3), 0 for error
    dbLanguage: async function(){
        db.conn.select(1);
        //creo una promise con dentro il get dal db
        const r = await new Promise(function (resolve, reject){
            db.conn.get("config_locale", function(err, res){
                if(err) reject(err); 
                var lan = JSON.parse(res).current_locale_agile;
                if(lan == "it-IT") resolve(1);
                else if(lan == "en-GB") resolve(2);
                else if(lan == "es-ES") resolve(3);
                else resolve(0);
            });
        }) 
        return r;
    },
    //input: 
        //address: hostname dell'elemento da cercare
    //output: 
        //elem: elemento da cercare, null se nessun elemento è stato trovato
    getThinManFromHostname: async function(address){
        var elem = null;
        db.conn.select(1);
        const addressList = await new Promise(function(resolve, reject){
            db.conn.get("thinman", function(err,res){
                if(err) reject(err); 
                resolve(JSON.parse(res).address);
            })
        })
        addressList.forEach(element => {
            if(element.address == address){
                elem = element;
            }
        });
        return elem;
    },
    //output: list of address length
    getThinManListLength: async function(){
        db.conn.select(1);
        //numero di address agile 
        const length = await new Promise(function(resolve, reject){
            db.conn.get("thinman", function(err,res){
                if(err) reject(err); 
                resolve(JSON.parse(res).address.length);
            });
        })
        return length;
    },
    //input: 
        //vid: vid dell'elemento da cercare
        //pid: pid dell'elemento da cercare
    //output: 
        //elem: elemento da cercare, null se nessun elemento è stato trovato
    getUSBFromVidPid: async function(vid,pid){
        var elem = null;
        db.conn.select(1);
        //lista di usb redirection
        const list = await new Promise(function(resolve, reject){
            db.conn.get("config_citrix", function(err,res){
                if(err) reject(err); 
                resolve(JSON.parse(res).usb_redirection.rules);
            })
        })
        list.forEach(element => {
            if(element.pid == pid && element.vid == vid){
                elem = element;
            }
        });
        return elem;
    },
    //output: length of the list of address 
    getUSBRedirectionListLength: async function(){
        db.conn.select(1);
        //numero di rules 
        const length = await new Promise(function(resolve, reject){
            db.conn.get("config_citrix", function(err,res){
                if(err) reject(err); 
                resolve(JSON.parse(res).usb_redirection.rules.length);
            });
        })
        return length;
    },
    //input: 
        //name: nome dell'elemento da cercare
    //output: 
        //elem: elemento da cercare, null se nessun elemento è stato trovato
    getResourceFromName: async function(name){
        var elem = null;
        db.conn.select(1);
        //lista di connections
        const list = await new Promise(function(resolve, reject){
            db.conn.get("connections", function(err,res){
                if(err) reject(err); 
                resolve(JSON.parse(res));
            })
        })
        list.forEach(element => {
            if(element.name == name){
                elem = element;
            }
        })
        return elem;
    },
    //output: length of the list of resources 
    getResourceListLength: async function(){
        db.conn.select(1);
        const length = await new Promise(function(resolve, reject){
            db.conn.get("connections", function(err,res){
                if(err) reject(err); 
                resolve(JSON.parse(res).length);
            });
        })
        return length;
    },
    //input: 
        //vid: vid dell'elemento da cercare
        //pid: pid dell'elemento da cercare
    //output: 
        //elem: elemento da cercare, null se nessun elemento è stato trovato
    getDeviceLock: async function(vid,pid){
        var elem = null;
        db.conn.select(1);
        //lista di device 
        const list = await new Promise(function(resolve, reject){
            db.conn.get("config_usb_lock", function(err,res){
                if(err) reject(err); 
                resolve(JSON.parse(res).lock_specific);
            })
        })
        list.forEach(element => {
            if(element.vid == vid && element.pid == pid){
                elem = element;
            }
        })
        return elem;
    },
    //output: length of the list of device locked  
    getDeviceLockListLength: async function(){
        db.conn.select(1);
        const length = await new Promise(function(resolve, reject){
            db.conn.get("config_usb_lock", function(err,res){
                if(err) reject(err); 
                resolve(JSON.parse(res).lock_specific.length);
            });
        })
        return length;
    },
    //input: 
        //ssid: ssid della WiFi da cercare 
    //output: 
        //elem: elemento da cercare, null se nessun elemento è stato trovato
    getWifi: async function(ssid){
        var elem = null;
        db.conn.select(1);
        //lista di connections
        const list = await new Promise(function(resolve, reject){
            db.conn.get("config_network", function(err,res){
                if(err) reject(err); 
                resolve(JSON.parse(res).wifi);
            })
        })
        list.forEach(element => {
            if(element.ssid == ssid){
                elem = element;
            }
        })
        return elem;
    },
    //output: length of the list of device locked  
    getWifiListLength: async function(){
        db.conn.select(1);
        const length = await new Promise(function(resolve, reject){
            db.conn.get("config_network", function(err,res){
                if(err) reject(err); 
                resolve(JSON.parse(res).wifi.length);
            });
        })
        return length;
    },
    //input: 
        //name: nome della startup da cercare
    //output: 
        //elem: elemento da cercare, null se nessun elemento è stato trovato 
    getStartup: async function(name){
        db.conn.select(1)
        const list = await new Promise(function(resolve, reject){
            db.conn.get("config_autorun", function(err,res){
                if(err) reject(err); 
                resolve(JSON.parse(res));
            })
        })
        var elem = null
        list.forEach(element => {
            if(element.name == name){
                elem = element
            }
        })
        return elem
    },
    //output: length of the list of startup
    getStartupListLength: async function(){
        db.conn.select(1);
        const length = await new Promise(function(resolve, reject){
            db.conn.get("config_autorun", function(err,res){
                if(err) reject(err)
                resolve(JSON.parse(res).length)
            });
        })
        return length
    },
    getRemoteAssistance: async function(){
        db.conn.select(1)
        const remoteAssistance = await new Promise(function(resolve, reject){
            db.conn.get("remote_assistance", function(err,res){
                if(err) reject(err); 
                resolve(JSON.parse(res));
            })
        })
        return remoteAssistance
    },
    getOutputVolume: async function(){
        db.conn.select(0)
        const vol = await new Promise(function(resolve, reject){
            db.conn.get("info_audio", function(err,res){
                if(err) reject(err); 
                resolve(JSON.parse(res).out.volume);
            })
        })
        return vol
    }
}

module.exports = {db};