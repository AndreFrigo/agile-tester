const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface");
const {db} = require("../db.js");
const values = require("../test-values.js")

var localDB = null

describe("Check authentication settings", function(){

    this.timeout(100000)

    before(async function(){
        //salva database locale
        localDB = await new Promise(function(resolve, reject){
            agileService.getAuthentication(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    })

    beforeEach(async function(){
        //cambia database locale
        await new Promise(function(resolve, reject){
            agileService.setAuthentication(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await utils.start()
    }) 

    afterEach(async function(){
        await new Promise(function(resolve, reject){
            agileService.setAuthentication(localDB, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await global.app.stop()
    })

    const wrongValues = values.agileAuthentication.wifi.add.wrongValues
    wrongValues.forEach(elem => {
        it("should return false for wrong settings", async () => {
            expect(await utils.agileAuthentication.addWifiAuthentication(elem.ssid, elem.password)).to.be.false
        })
    })

    const rightValues = values.agileAuthentication.wifi.add.rightValues
    rightValues.forEach(elem => {
        it("should return true for right settings", async () => {
            expect(await utils.agileAuthentication.addWifiAuthentication(elem.ssid, elem.password)).to.be.true
        })

        it("should return true if wifi authentication has been added and is now in the database", async () => {
            var add = null
            var checkDb = null
            add = await utils.agileAuthentication.addWifiAuthentication(elem.ssid, elem.password)
            await utils.sleep(500)
            try{
                const dbinfo = await db.getAuthentication()
                if(dbinfo.type == "wifi" && dbinfo.value.ssid == elem.ssid){
                    checkDb = true
                }else{
                    checkDb = false
                }
            }catch{
            }
            expect(add && checkDb).to.be.true
        })
    })
})