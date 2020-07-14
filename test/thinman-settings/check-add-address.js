const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface")

var localDB = null

describe("Check add address", function(){

    this.timeout(100000)

    before(async function(){
        //salva database locale
        localDB = await new Promise(function(resolve, reject){
            agileService.getThinmanConfig(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    }) 

    beforeEach(async function(){
        //cambia database locale
        await new Promise(function(resolve, reject){
            agileService.setThinmanConfig({
                enabled: true,
                dhcp_opt: 163,
                address: [ { address: 'prova_thinman', port: 443, timeout: 15 } ],
                automatic_port: true,
                listening_port: 443,
                fallback: 'use_device',
                passthrough: false
              }
              , (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        
        await utils.start()
    })

    afterEach(async function(){
        await new Promise(function(resolve, reject){
            agileService.setThinmanConfig(localDB, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await global.app.stop()
    })

    it("should return true if the address is in the database", async () => {
        var found = false
        const elem = await db.getThinManFromHostname("prova_thinman")
        if(elem.address == "prova_thinman" && elem.port == 443 && elem.timeout == 15){
            found = true
        }
        expect(found).to.be.true
    })

    it("should return false if it tries to add an address with the same hostname", async () => {
        expect(await utils.thinmanSettings.addAddress("prova_thinman", 443, 15)).to.be.false
    })

    it("should return true if the thinman address is in the list", async () => {
        expect(await utils.thinmanSettings.isInAgileList("prova_thinman")).to.be.true
    })


})