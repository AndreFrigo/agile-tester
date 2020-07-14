const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const { info } = require("../set-before-test.js");
const agileService = require("agile-os-interface")


var localDB = null



describe("Check resource parameters", function(){

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

    
    const wrongValues = [
        {name:"" ,url:"" },
        {name:"prova" ,url:"" },
        {name:"" ,url:"google.com" },
        {name:"prova" ,url:"prova" },
        {name:"123" ,url:"123" },
        {name:"!!!" ,url:"google.com.i" },
        {name:"aaa" ,url:"aaa" },
        {name:"aaa" ,url:"google" }
    ]
    wrongValues.forEach(elem => {
        it("should return false if name or url are wrong", async () => {
            expect(await utils.resources.addLocalBrowser(elem.name, elem.url)).to.be.false
        })
    })

    const rightValues = [
        {name:"name1" ,url:"https://www.google.com" },
        {name:"name2" ,url:"google.com" }
    ]
    rightValues.forEach(elem => {

        it("should return true if the resource has been added", async () => {
            expect(await utils.resources.addLocalBrowser(elem.name, elem.url)).to.be.true
        })

        if(info.os == "w"){
            it("should return true if the resource has been added and the success notification appeared", async () => {
                const res = await utils.resources.addLocalBrowser(elem.name, elem.url)
                await utils.sleep(1000)
                const notification = await utils.checkNotification("success")
                expect(res && notification).to.be.true
            })
        }

        it("should return true if the resource has been added and then deleted", async () => {
            var add = null
            var del = null
            add = await utils.resources.addLocalBrowser(elem.name, elem.url)
            await utils.sleep(1000)
            del = await utils.resources.deleteResource(elem.name)
            await utils.sleep(500)
            expect(add && del).to.be.true
        })

        if(info.os == "w"){
            it("should return true if the resource has been added, deleted and both the success notification appeared", async () => {
                var add = null
                var del = null
                var notAdd = null
                var notDel = null
                add = await utils.resources.addLocalBrowser(elem.name, elem.url)
                await utils.sleep(1000)
                notAdd = await utils.checkNotification("success")
                await utils.sleep(1000)
                del = await utils.resources.deleteResource(elem.name)
                await utils.sleep(1000)
                notDel = await utils.checkNotification("success")
                await utils.sleep(500)
                expect(add && notAdd && del && notDel).to.be.true
            })
        }
    })

})
