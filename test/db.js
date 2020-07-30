const redis = require('redis')
const {info} = require ("./set-before-test.js")

const db={
    conn: null,
    /**
     * Connection to the database
     */
    dbConnection(){
        db.conn = redis.createClient(1681);
        db.conn.auth(info.dbPass);
    },
    /**
     * Check Agile language in database
     * @return  {integer} 1 for Italian, 2 for English, 3 for Spanish, 0 otherwise
     */
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
    /**
     * Search for a thinman in the database
     * @param  {string} address This is the hostname/address of the thinman to search
     * @return {object | null} The thinman found, null if no thinman has been found
     */
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
    /**
     * Get the length of the list of thinman address
     * @return {integer} The number of thinman address
     */
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
    /**
     * Get an usb redirection rule 
     * @param  {string} vid This is the vid of the element
     * @param  {string} pid This is the pid of the element
     * @return {object | null} The rule found, null if there is no rule
     */
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
    /**
     * Get the length of the list of usb redirection rules
     * @return {integer} The number of usb redirection rules
     */
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
    /**
     * Get a resource 
     * @param  {string} name This is the name of the resource to find
     * @return {object | null} The resource found, null if there is no resource
     */
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
    /**
     * Get the length of the list of resources
     * @return {integer} The number of resources
     */ 
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
    /**
     * Get a device lock rule 
     * @param  {string} vid This is the vid of the element
     * @param  {string} pid This is the pid of the element
     * @return {object | null} The rule found, null if there is no rule
     */
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
    /**
     * Get the length of the list of device lock rules
     * @return {integer} The number of device lock rules
     */ 
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
    /**
     * Get a wifi 
     * @param  {string} ssid This is the ssid of the wifi to find
     * @return {object | null} The wifi found, null if there is no wifi
     */
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
    /**
     * Get the length of the list of wifi
     * @return {integer} The number of wifi
     */ 
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
    /**
     * Get a startup 
     * @param  {string} name This is the name of the startup to find
     * @return {object | null} The startup found, null if there is no startup
     */
    getStartup: async function(name){
        //select 0 perchè le funzioni getAutorun e setAutorun lavorano su quello
        db.conn.select(0)
        const list = await new Promise(function(resolve, reject){
            db.conn.get("info_autorun", function(err,res){
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
    /**
     * Get the length of the list of startups
     * @return {integer} The number of startups
     */
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
    /**
     * Get remote assistance object 
     * @return {object} The remote assistance object
     */
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
    /**
     * Get the system output volume 
     * @return {integer} The system output volume
     */
    getOutputVolume: async function(){
        db.conn.select(0)
        const vol = await new Promise(function(resolve, reject){
            db.conn.get("info_audio", function(err,res){
                if(err) reject(err); 
                resolve(JSON.parse(res).out.volume);
            })
        })
        return vol
    },
    /**
     * Get authentication object 
     * @return {object} The authentication object
     */
    getAuthentication: async function(){
        db.conn.select(1)
        const auth = await new Promise(function(resolve, reject){
            db.conn.get("config_auth", function(err,res){
                if(err) reject(err); 
                resolve(JSON.parse(res));
            })
        })
        return auth
    }
}

module.exports = {db};