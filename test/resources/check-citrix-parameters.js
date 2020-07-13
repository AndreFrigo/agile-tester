const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const { info } = require("../set-before-test.js");
const agileService = require("agile-os-interface")


var localDB = null

describe("add a citrix resource test", function(){

    this.timeout(30000)

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

    const rightValues = [
        {name: "name", server: "xxx.it", domain:""}
    ]
    rightValues.forEach(elem => {
        it("should return true if the resource has been added", async () => {
            expect(await utils.resources.addCitrix(elem.name, elem.server, elem.domain)).to.be.true
        })

        it("should return true if the resource has been added and is now in the Agile list", async () => {
            var add = null
            var check = null
            add = await utils.resources.addCitrix(elem.name, elem.server, elem.domain)
            await utils.sleep(500)
            check = await utils.resources.isInAgileList(1, elem.name)
            expect(add && check).to.be.true
        })

        if(info.os == "w"){
            it("should return true if the resource has been added and success notification appeared", async () => {
                var add = null
                var notification = null
                add = await utils.resources.addCitrix(elem.name, elem.server, elem.domain)
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
                add = await utils.resources.addCitrix(elem.name, elem.server, elem.domain)
                await utils.sleep(500)
                notification = await utils.checkNotification("success")
                await utils.sleep(500)
                check = await utils.resources.isInAgileList(1, elem.name)
                expect(add && notification && check).to.be.true
            })
        }
    })

    const wrongValues = [
        {name: "", server: "xxx.it", domain:"aa"},
        {name: "name", server: "xxx", domain:"aaa"},
        {name: "name", server: "", domain:""}
    ]
    wrongValues.forEach(elem => {
        it("should return false if some data are not correct", async () => {
            expect(await utils.resources.addCitrix(elem.name, elem.server, elem.domain)).to.be.false
        })
    })

    const realValues = [
        {name: "rv", server: "https://xendesk715.sup.praim.com", domain:""}
    ]
    realValues.forEach(elem => {
        it("should return true if the resource has been added and is now in the Agile list", async () => {
            var add = null
            var check = null
            add = await utils.resources.addCitrix(elem.name, elem.server, elem.domain)
            await utils.sleep(500)
            check = await utils.resources.isInAgileList(1, elem.name)
            expect(add && check).to.be.true
        })

        it("should return true if the resource has been added and the test connection success", async () => {
            var add = null
            var test = null
            add = await utils.resources.addCitrix(elem.name, elem.server, elem.domain)
            await utils.sleep(2500)
            test = await utils.resources.test(1, elem.name)
            await utils.sleep(500)
            expect(add && test).to.be.true
        })
    })

})