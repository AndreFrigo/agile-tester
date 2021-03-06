const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface")
const values = require("../test-values.js")

var localDB = null

describe("Test remote assistance settings", function(){

    this.timeout(100000)

    before(async function(){
        //salva database locale
        localDB = await new Promise(function(resolve, reject){
            agileService.getRemoteAssistanceConfig(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    })

    beforeEach(async function(){
        await new Promise(function(resolve, reject){
            agileService.setRemoteAssistanceConfig(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        }) 
        await utils.start()
    }) 

    afterEach(async function(){
        await new Promise(function(resolve, reject){
            agileService.setRemoteAssistanceConfig(localDB, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await global.app.stop()
    })

    it("should return true if remote assistance is enabled", async () => {
        const raAgile = await utils.remoteAssistance.enableRemoteAssistance()
        await utils.sleep(500)
        const radb = await db.getRemoteAssistance()
        expect(raAgile && radb.enabled).to.be.true
    })

    it("should return true if show notification icon is checked", async () => {
        const isEnable = await utils.remoteAssistance.showNotificationIcon()
        await utils.sleep(500)
        const radb = await db.getRemoteAssistance()
        expect(isEnable && radb.appearance.show_icon).to.be.true
    })

    it("should return true if require user authentication is checked", async () => {
        const isEnable = await utils.remoteAssistance.userAuthentication()
        await utils.sleep(500)
        const radb = await db.getRemoteAssistance()
        expect(isEnable && radb.acceptance.allow_reject).to.be.true
    })

    const rightValues = values.remoteAssistance.enable.rightValues
    rightValues.forEach(elem => {
        it("should return true if auto-accept and enable remote assistance is checked and his lable is correct", async () => {
            expect(await utils.remoteAssistance.setAutoAccept(elem)).to.be.true
        })
    })

    const wrongValues = values.remoteAssistance.enable.wrongValues
    wrongValues.forEach(elem => {
        it("should return false if auto-accept or enable remote assistance are not checked, or if the lable is not correct", async () => {
            expect(await utils.remoteAssistance.setAutoAccept(elem)).to.be.false
        })
    })
    


})