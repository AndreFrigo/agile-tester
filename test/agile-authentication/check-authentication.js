const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("Check authentication settings", function(){

    this.timeout(30000)

    before(async function(){
        //salva database locale
        db.conn.select(1)
        localDB = await new Promise(function (resolve, reject){
            db.conn.get("config_auth", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
    })

    beforeEach(async function(){
        await global.app.start()
        //cambia database locale
        db.conn.select(1)
        db.conn.set("config_auth", "null")
    }) 

    afterEach(async function(){
        db.conn.select(1)
        db.conn.set("config_auth", localDB)
        await global.app.stop()
    })

    const wrongSsid = ["aa", "bb", "1232"]
    wrongSsid.forEach(elem => {
        it("should return null for wrong ssid", async () => {
            expect(await utils.checkWifiAuthenticationSsid(elem)).to.be.null
        })
    })

    const wrongPassword = [
        {ssid: "PRAIM_WIFI_N", password: ""},
        {ssid: "PRAIM_WIFI_N", password: "1234567"}
    ]
    wrongPassword.forEach(elem => {
        it("should return false for wrong settings", async () => {
            expect(await utils.addWifiAuthentication(elem.ssid, elem.password)).to.be.false
        })
    })

    const rightValues = [
        {ssid: "PRAIM_WIFI_N", password: "asdfghjkksbd"}
    ]
    rightValues.forEach(elem => {
        it("should return true for right settings", async () => {
            expect(await utils.addWifiAuthentication(elem.ssid, elem.password)).to.be.true
        })
    })
})