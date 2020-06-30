const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null



//FUNZIONA SOLO CON WIFI CHE RICHIEDONO SSID E PASSWORD
describe("Check WiFi parameters", function(){

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
    })

    beforeEach(async function(){
        await global.app.start()
        //cambia database locale
        db.conn.select(1)
        db.conn.set("config_network", "{\"hostname\":null,\"interfaces\":[],\"wifi\":[],\"hosts\":null}")
    }) 

    afterEach(async function(){
        db.conn.set("config_network", localDB)
        await global.app.stop()
    })


    const wrongSsid = [
        {ssid:"", psw:123455555},
        {ssid:"allagriglia", psw:123455555},
        {ssid:"bsn", psw:123455555},
        {ssid:123345, psw:123455555}
    ]
    wrongSsid.forEach(elem => {
        it("should return false if there is not a wifi with the given ssid in the list", async () => {
            expect(await utils.networkSettings.checkSsid(elem.ssid)).to.be.false
        })
    })

    const wrongPsw = [
        {ssid:"PRAIM_WIFI_N", psw:1234},
        {ssid:"PRAIM_WIFI_N", psw:"asdfghj"},
        {ssid:"PRAIM_WIFI_N", psw:""}
    ]
    wrongPsw.forEach(elem => {
        it("should return false if the password is wrong or there is not a wifi with the given ssid in the list", async () => {
            expect(await utils.networkSettings.saveWifi(elem.ssid, elem.psw)).to.be.false
        })
    })

    const rightValues = [
        {ssid:"PRAIM_WIFI_N", psw:"asd123!!"}
    ]
    rightValues.forEach(elem => {

        it("should return true if the wifi has been added correctly", async () => {
            expect(await utils.networkSettings.saveWifi(elem.ssid, elem.psw)).to.be.true
        })

        it("should return true if the wifi has been added correctly and success notification appeared", async () => {
            const res = await utils.networkSettings.saveWifi(elem.ssid, elem.psw)
            await utils.sleep(1000)
            const notification = await utils.checkSuccessNotification()
            expect(res != null && notification).to.be.true
        })
    })

})

