const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const values = require("../test-values.js")

var localDB = null



//FUNZIONA SOLO CON WIFI CHE RICHIEDONO SSID E PASSWORD
describe("Test WiFi parameters", function(){

    this.timeout(100000)

    before(async function(){
        //salva database locale
        db.conn.select(1)
        localDB = await new Promise(function (resolve, reject){
            db.conn.get("config_network", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
    })

    beforeEach(async function(){
        //cambia database locale
        db.conn.select(1)
        db.conn.set("config_network", "{\"hostname\":null,\"interfaces\":[],\"wifi\":[],\"hosts\":null}")
        await utils.start()
    }) 

    afterEach(async function(){
        db.conn.set("config_network", localDB)
        await global.app.stop()
    })

    const wrongValues = values.networkSettings.addWifi.wrongValues
    wrongValues.forEach(elem => {
        it("should return false if the password is wrong or there is not a wifi with the given ssid in the list", async () => {
            expect(await utils.networkSettings.saveWifi(elem.ssid, elem.psw)).to.be.false
        })
    })

    const rightValues = values.networkSettings.addWifi.rightValues
    rightValues.forEach(elem => {

        it("should return true if the wifi has been added correctly", async () => {
            expect(await utils.networkSettings.saveWifi(elem.ssid, elem.psw)).to.be.true
        })

        it("should return true if the wifi has been added correctly", async () => {
            await utils.networkSettings.saveWifi(elem.ssid, elem.psw)

            await utils.sleep(1000)

            expect(await utils.networkSettings.isInAgileList(elem.ssid)).to.be.true
        })

        it("should return true if the wifi has been added correctly and success notification appeared", async () => {
            const res = await utils.networkSettings.saveWifi(elem.ssid, elem.psw)
            await utils.sleep(1000)
            const notification = await utils.checkNotification("success")
            expect(res != null && notification).to.be.true
        })
    })

})

