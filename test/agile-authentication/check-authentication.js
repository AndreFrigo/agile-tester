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
        //cambia database locale
        db.conn.select(1)
        db.conn.set("config_auth", "null")
        await utils.start()
    }) 

    afterEach(async function(){
        db.conn.select(1)
        db.conn.set("config_auth", localDB)
        await global.app.stop()
    })

    const wrongSsid = ["aa", "bb", "1232"]
    wrongSsid.forEach(elem => {
        it("should return false for wrong ssid", async () => {
            expect(await utils.agileAuthentication.setAutoAccept(elem)).to.be.false
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