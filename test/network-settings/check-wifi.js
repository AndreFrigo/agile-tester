const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const {info} = require("../set-before-test.js")
const { expect } = require("chai");
var localDB = null

describe("Check if a wifi saved is available", function(){

    this.timeout(30000)

    before(async function(){
        //salva database locale
        db.conn.select(1)
        localDB = await new Promise(function (resolve, reject){
            db.conn.get("config_network", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
        //cambia database locale
        db.conn.set("config_network", "{\"hostname\":null,\"interfaces\":[],\"wifi\":[{\"ssid\":\"prova_wifi\",\"authentication\":\"WPA2-PSK\",\"encryption\":\"AES\",\"hidden\":false,\"psk\":\"cHJhaW0tYWVzLTEyOC1jYmM6wRyVyCSItEALI2T4eKVZv1Wf5tKVgxW/ALd0sseL5F3vS/UV85EkrpLv0Prels4J\"}],\"hosts\":null}")
        await utils.start()
    }) 

    after(async function(){
        db.conn.set("config_network", localDB)
        await global.app.stop()
    })

    //Controlla che la nuova wifi sia stata inserita nel db
    it("should return not null if the wifi saved is in the database", async () => {
        expect(await db.getWifi("prova_wifi")).to.not.be.null
    })

    //Controlla che la nuova wifi sia nella lista di agile 
    it("should return true if the wifi is in the list", async () => {

        //Va nella sezione impostazioni di rete
        const menu = global.app.client.$(info.NETWORK_SETTINGS);
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //Va nella sezione wifi
        const wifi = global.app.client.$("#ab > a");
        click = null;
        try{
            click = await wifi.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1500)


        const length = await db.getWifiListLength();
        const base = "#wifiTab > div > div > div.section-wrapper.scrollable > div"
        var found = false; 
        var name = null;
        for(i = 1; i<= length; i++){
            try{
                name = await global.app.client.$(base + " > div:nth-child(" + i + ") > div > div.block-item-properties-wrapper > div").getText();
                if(name.slice(14) == "prova_wifi"){
                    found = true;
                }
            }catch{
            }
        }
        expect(found).to.be.true
    })

})