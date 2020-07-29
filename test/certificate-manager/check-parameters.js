const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface")
const {info} = require("../set-before-test.js")
const values = require("../test-values.js")

var localDB = null

describe("Test certificate parameters", function(){

    this.timeout(150000)

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

    const wrongValues = values.certificateManager.add.wrongValues
    wrongValues.forEach(elem => {
        if(info.os == 'w'){
            it("should return false for non valid certificate", async () => {
                expect(await utils.certificateManager.addCertificate(elem)).to.be.false
            })
        }
    })

    const rightValues = values.certificateManager.add.rightValues
    rightValues.forEach(elem => {
        if(info.os == 'w'){
            it("should return true if the certificate has been added", async () => {
                expect(await utils.certificateManager.addCertificate(elem)).to.be.true
            })
        }
    })
})