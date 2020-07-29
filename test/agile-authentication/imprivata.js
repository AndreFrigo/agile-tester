const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface");
const {db} = require("../db.js");
var localDB = null

describe("Test imprivata authentication settings", function(){

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

    const rightValues = [
        "right-value.it"
    ]
    rightValues.forEach(elem => {
        it("should return true if authentication has been added", async () => {
            expect(await utils.agileAuthentication.addImprivata(elem)).to.be.true
        })

        it("should return true if the authentication has been added and is now in the database", async () => {
            var add = null
            var checkDb = null
            add = await utils.agileAuthentication.addImprivata(elem)
            await utils.sleep(500)
            try{
                const dbinfo = await db.getAuthentication()
                if(dbinfo.type == "imprivata" && dbinfo.value.address == elem && dbinfo.value.ignoreSSL == true){
                    checkDb = true
                }else{
                    checkDb = false
                }
            }catch{
            }
            expect(add && checkDb).to.be.true
        })
    })

    const wrongValues = [
        "",
        "wrong_value",
        "aa.it.i"
    ]
    wrongValues.forEach(elem => {
        it("should return false if some parameters were wrong", async () => {
            expect(await utils.agileAuthentication.addImprivata(elem)).to.be.false
        })
    })

    const realValues = [
        "https://onesign.dev.praim.com",
        "https://onesign6.dev.praim.com"
    ]
    realValues.forEach(elem => {
        it("should return true if authentication has been added and test is success", async () => {
            const add = await utils.agileAuthentication.addImprivata(elem)

            await utils.sleep(500)

            //preme su test
            try{
                await global.app.client.$("#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div:nth-child(4) > div:nth-child(1) > a").click()
            }catch{
            }

            await utils.sleep(1500)
            var not = null
            not = await utils.checkNotification("success", 15)

            expect(add && not).to.be.true
        })
    })

})