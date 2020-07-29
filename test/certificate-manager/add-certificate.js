const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface")
const {info} = require("../set-before-test.js")

var localDB = null

describe("Test add certificate", function(){
    this.timeout(200000)

    before(async function(){
        //salva database locale
        localDB = await new Promise(function(resolve, reject){
            agileService.getCertificate(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    })

    beforeEach(async function(){
        //cambia database locale
        await new Promise(function(resolve, reject){
            agileService.setCertificate(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await utils.start()
    }) 

    afterEach(async function(){
        await new Promise(function(resolve, reject){
            agileService.setCertificate(localDB, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await global.app.stop()
    })

    if(info.os == 'w'){
        it("should return false if it tries to add a certificate more times", async () => {
            //Il certificato deve essere valido e nella cartella agile-test/files
            var first, second = null
            first = await utils.certificateManager.addCertificate("DigiCertGlobalRootCA")
            await utils.sleep(500)
            second = await utils.certificateManager.addCertificate("DigiCertGlobalRootCA")
            expect(!(first && second == false)).to.be.false
        })
    }

    if(info.os == 'w'){
        it("should return true if a notification appears when it tries to add a certificate more times", async () => {
            //Il certificato deve essere valido e nella cartella agile-test/files
            await utils.certificateManager.addCertificate("DigiCertGlobalRootCA")
            await utils.sleep(500)
            await utils.certificateManager.addCertificate("DigiCertGlobalRootCA")
            await utils.sleep(1500)
            expect(await utils.checkNotification("warning")).to.be.true
        })
    }
})