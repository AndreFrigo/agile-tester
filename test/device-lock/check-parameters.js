const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface")
const values = require("../test-values.js")

var localDB = null


//Aggiunge una nuova regola per il blocco di un device
describe("Test device lock parameters", function(){

    this.timeout(100000)

    before(async function(){
        //salva database locale
        localDB = await new Promise(function(resolve, reject){
            agileService.getUsbLock(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    })

    beforeEach(async function(){
        //cambia database locale
        await new Promise(function(resolve, reject){
            agileService.setUsbLock(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await utils.start()
    }) 

    afterEach(async function(){
        await new Promise(function(resolve, reject){
            agileService.setUsbLock(localDB, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await global.app.stop()
    })
    

    //pid e vid con cui provare il test should return false if the rule can't be confirmed
    const wrongValues = values.deviceLock.addRule.wrongValues
    // wrongValues.forEach(elem => {
    //     it("should return false if the rule can't be confirmed", async () => {
    //         expect(await utils.deviceLock.addRule(elem.vid, elem.pid)).to.be.false
    //     })
    // })

    const rightValues = values.deviceLock.addRule.rightValues
    rightValues.forEach(elem => {                
        it("should return true if the rule has been confirmed", async () => {
            expect( await utils.deviceLock.addRule(elem.vid, elem.pid)).to.be.true
        })

        it("should return true if the rule has been confirmed and is now in the agile list", async () => {
            var add = null
            var check = null
            add = await utils.deviceLock.addRule(elem.vid, elem.pid)
            await utils.sleep(500)
            check = await utils.deviceLock.isInAgileList(elem.vid, elem.pid)
            await utils.sleep(500)
            expect(add && check).to.be.true
        })

        it("should return true if the rule has been confirmed and then deleted", async () => {
            var add = null
            var del = null
            add = await utils.deviceLock.addRule(elem.vid, elem.pid)
            await utils.sleep(500)
            del = await utils.deviceLock.deleteRule(elem.vid, elem.pid)
            await utils.sleep(500)
            expect(add && del).to.be.true
        })

        it("should return true if the rule has been confirmed and is then in the agile list, then deleted and removed from the list", async () => {
            var add = null
            var checkAdd = null
            var del = null
            var checkDel = null
            add = await utils.deviceLock.addRule(elem.vid, elem.pid)
            await utils.sleep(500)
            checkAdd = await utils.deviceLock.isInAgileList(elem.vid, elem.pid)
            await utils.sleep(500)
            del = await utils.deviceLock.deleteRule(elem.vid, elem.pid)
            await utils.sleep(500)
            checkDel = await utils.deviceLock.isInAgileList(elem.vid, elem.pid)
            await utils.sleep(500)
            expect(add && checkAdd && del && checkDel == false).to.be.true
        })
    })

})
