const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const { info } = require("../set-before-test.js");
const agileService = require("agile-os-interface")

var localDB = null

describe("add microsoft resource parameters test", function(){

    this.timeout(150000)

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
        {name: "microsoft", info: "microsoft_resource"}
    ]

    rightValues.forEach(elem => {
        if(info.os == "w"){
            it("should return true if the resource has been added", async () => {
                expect(await utils.resources.addMicrosoft(elem.name, elem.info)).to.be.true
            })
    
            it("should return true if the resource has been added and is now in the Agile list", async () => {
                var add = null
                var check = null
                add = await utils.resources.addMicrosoft(elem.name, elem.info)
                await utils.sleep(500)
                check = await utils.resources.isInAgileList(2, elem.name)
                expect(add && check).to.be.true
            })
    
            if(info.os == "w"){
                it("should return true if the resource has been added and success notification appeared", async () => {
                    var add = null
                    var notification = null
                    add = await utils.resources.addMicrosoft(elem.name, elem.info)
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
                    add = await utils.resources.addMicrosoft(elem.name, elem.info)
                    await utils.sleep(500)
                    notification = await utils.checkNotification("success")
                    await utils.sleep(500)
                    check = await utils.resources.isInAgileList(2, elem.name)
                    expect(add && notification && check).to.be.true
                })
            }
        }
    })

    const wrongValues = [
        {name: "test", info: "wrong_info"}
    ]

    wrongValues.forEach(elem => {
        if(info.os == "w"){
            it("should return false if some data are not correct", async () => {
                expect(await utils.resources.addMicrosoft(elem.name, elem.info)).to.be.false
            })
        }
    })

})