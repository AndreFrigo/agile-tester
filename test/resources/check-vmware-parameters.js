const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface")
const { info } = require("../set-before-test.js")
const values = require("../test-values.js")

var localDB = null

describe("Test VMware parameters", function(){

    this.timeout(100000)

    before(async function(){
        //salva database locale
        localDB = await new Promise(function(resolve, reject){
            agileService.getConnections(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    })

    beforeEach(async function(){
        //cambia database locale
        await new Promise(function(resolve, reject){
            agileService.setConnections(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await utils.start()
    }) 

    afterEach(async function(){
        await new Promise(function(resolve, reject){
            agileService.setConnections(localDB, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await global.app.stop()
    })

    const rightValues = values.resources.vmware.add.rightValues
    rightValues.forEach(elem => {
        it("should return true if the resource has been added", async () => {
            expect(await utils.resources.addVMware(elem.name, elem.info)).to.be.true
        })

        it("should return true if the resource has been added and is now in the Agile list", async () => {
            var add = null
            var check = null
            add = await utils.resources.addVMware(elem.name, elem.info)
            await utils.sleep(500)
            check = await utils.resources.isInAgileList(3, elem.name)
            expect(add && check).to.be.true
        })

        if(info.os == "w"){
            it("should return true if the resource has been added and success notification appeared", async () => {
                var add = null
                var notification = null
                add = await utils.resources.addVMware(elem.name, elem.info)
                await utils.sleep(500)
                notification = await utils.checkNotification("success")
                expect(add && notification).to.be.true
            })
        }

        if(info.os == "w"){
            it("should return true if the resource has been added and is now in the Agile list, and success notification appeared", async () => {
                var add = null
                var notification = null
                var check = null
                add = await utils.resources.addVMware(elem.name, elem.info)
                await utils.sleep(500)
                notification = await utils.checkNotification("success")
                await utils.sleep(500)
                check = await utils.resources.isInAgileList(3, elem.name)
                expect(add && notification && check).to.be.true
            })
        }
    })

    const wrongValues = values.resources.vmware.add.wrongValues
    wrongValues.forEach(elem => {
        it("should return false if some data are wrong", async () => {
            expect(await utils.resources.addVMware(elem.name, elem.info)).to.be.false
        })
    })

    const realValues = values.resources.vmware.test.rightValues
    realValues.forEach(elem => {
        it("should return true if the resource has been added and is now in the Agile list", async () => {
            var add = null
            var check = null
            add = await utils.resources.addVMware(elem.name, elem.info)
            await utils.sleep(500)
            check = await utils.resources.isInAgileList(3, elem.name)
            expect(add && check).to.be.true
        })

        it("should return true if the resource has been added and the test connection success", async () => {
            var add = null
            var test = null
            add = await utils.resources.addVMware(elem.name, elem.info)
            await utils.sleep(2500)
            test = await utils.resources.test(3, elem.name)
            await utils.sleep(500)
            expect(add && test).to.be.true
        })
    })
})