const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface")

var localDB = null

describe("Check if a wifi saved is available", function(){

    this.timeout(100000)

    before(async function(){
        localDB = await new Promise(function(resolve, reject){
            agileService.getNetworkConfig(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    }) 

    beforeEach(async function(){
        //cambia database locale
        await new Promise(function(resolve, reject){
            agileService.setNetworkConfig({
                hostname: null,
                interfaces: [],
                wifi: [
                  {
                    ssid: 'prova_wifi',
                    authentication: 'WPA2-PSK',
                    encryption: 'AES',
                    hidden: false,
                    psk: 'cHJhaW0tYWVzLTEyOC1jYmM6wRyVyCSItEALI2T4eKVZv1Wf5tKVgxW/ALd0sseL5F3vS/UV85EkrpLv0Prels4J'
                  }
                ],
                hosts: null
              }, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await utils.start()
    })

    afterEach(async function(){
        //db.conn.set("config_network", localDB)
        await global.app.stop()
    })

    //Controlla che la nuova wifi sia stata inserita nel db
    it("should return not null if the wifi saved is in the database", async () => {
        expect(await db.getWifi("prova_wifi")).to.not.be.null
    })

    //Controlla che la nuova wifi sia nella lista di agile 
    it("should return true if the wifi is in the list", async () => {
        expect(await utils.networkSettings.isInAgileList("prova_wifi")).to.be.true
    })

})