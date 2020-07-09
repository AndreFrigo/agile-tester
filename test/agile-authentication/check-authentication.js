const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface")
var localDB = null

describe("Check authentication settings", function(){

    this.timeout(30000)

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

    const wrongSsid = ["aa", "bb", "1232"]
    wrongSsid.forEach(elem => {
        it("should return false for wrong ssid", async () => {
            expect(await utils.agileAuthentication.checkWifiAuthenticationSsid(elem)).to.be.false
        })
    })

    const wrongPassword = [
        {ssid: "PRAIM_WIFI_N", password: ""},
        {ssid: "PRAIM_WIFI_N", password: "1234567"}
    ]
    wrongPassword.forEach(elem => {
        it("should return false for wrong settings", async () => {
            expect(await utils.agileAuthentication.addWifiAuthentication(elem.ssid, elem.password)).to.be.false
        })
    })

    const rightValues = [
        {ssid: "PRAIM_WIFI_N", password: "asdfghjkksbd"}
    ]
    rightValues.forEach(elem => {
        it("should return true for right settings", async () => {
            expect(await utils.agileAuthentication.addWifiAuthentication(elem.ssid, elem.password)).to.be.true
        })
    })
})