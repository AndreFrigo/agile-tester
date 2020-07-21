const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface")
const values = require("../test-values.js")

var localDB = null

describe("Check startup parameters", function () {

    this.timeout(100000)

    before(async function(){
        //salva database locale
        localDB = await new Promise(function(resolve, reject){
            agileService.getAutorun(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    })

    beforeEach(async function(){
        //cambia database locale
        await new Promise(function(resolve, reject){
            agileService.setAutorun(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await utils.start()
    }) 

    afterEach(async function(){
        await new Promise(function(resolve, reject){
            agileService.setAutorun(localDB, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await global.app.stop()
    })



    const wrongValues = values.startup.add.wrongValues

    wrongValues.forEach(elem => {
        it("should return false if some parameters were wrong", async () => {
            expect(await utils.startup.addStartup(elem.name, elem.command)).to.be.false
        })
    })

    //c'è il problema che anche pulendo il db, gli startup vengono presi dal sistema e quindi in rightValues non va messo test_startup perchè altrimenti l'altro test fallirebbe
    const rightValues = values.startup.add.rightValues

    rightValues.forEach(elem => {
        it("should return true if the startup was added successfully", async () => {
            expect(await utils.startup.addStartup(elem.name, elem.command)).to.be.true
        })
        

        it("should return true if the startup was added and the notification appeared", async () => {
            const res = await utils.startup.addStartup(elem.name, elem.command)
            await utils.sleep(500)
            const notification = await utils.checkNotification("success", 5)
            expect(res && notification).to.be.true
        })
    })

})