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
        it("should return null if there is not a wifi with the given ssid in the list", async () => {
            const isNull = await utils.checkSsid(elem.ssid)
            //preme su annulla
            try{
                await global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(2)").click();
            }catch{
            }
            expect(isNull).to.be.null
        })
    })

    const wrongPsw = [
        {ssid:"PRAIM_WIFI_N", psw:1234},
        {ssid:"PRAIM_WIFI_N", psw:"asdfghj"},
        {ssid:"PRAIM_WIFI_N", psw:""}
    ]
    wrongPsw.forEach(elem => {
        it("should return null if the password is wrong or there is not a wifi with the given ssid in the list", async () => {
            expect(await utils.saveWifi(elem.ssid, elem.psw)).to.be.null
        })
    })

    const rightValues = [
        {ssid:"PRAIM_WIFI_N", psw:"asd123!!"}
    ]
    rightValues.forEach(elem => {

        it("should return not null if the wifi has been added correctly", async () => {
            expect(await utils.saveWifi(elem.ssid, elem.psw)).to.be.not.null
        })

        it("should return true if the wifi has been added correctly and success notification appeared", async () => {
            var notification = null
            const res = await utils.saveWifi(elem.ssid, elem.psw)
            try{
                //titolo del pop-up
                notification = await global.app.client.$("#main-div > div:nth-child(3) > span > div.notification > div.header > p.title").getText();
            }catch{
                notification = null
            }
            //aggiorna lingua
            global.language = await db.dbLanguage()
            var succ = null
            switch(global.language){
                case 1: {
                    succ = "Successo"
                    break
                }
                case 2: {
                    succ = "Success"
                    break
                }
                case 3: {
                    succ = "Exito"
                    break
                }
            }
            expect(res != null && notification == succ).to.be.true
        })
    })

})

