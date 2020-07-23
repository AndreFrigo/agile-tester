const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface")
const ids = require("../selectors.js")
var localDB = null


//Imposta la lingua di agile in english
describe("Choose english as language", function(){
    
    this.timeout(100000)
    
    before(async function(){
        //salva database locale
        localDB = await new Promise(function(resolve, reject){
            agileService.getCurrentLocaleAgile(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    })
    
    describe("Test from spanish", async () => {

        beforeEach(async function(){   
            //Setta spagnolo
            await new Promise(function(resolve, reject){
                agileService.setCurrentLocaleAgile("es-ES", (err,res) => {
                    if (err) reject(err)
                    resolve(res)
                })
            })
            await utils.start()
        }) 
        
        afterEach(async function(){
            await new Promise(function(resolve, reject){
                agileService.setCurrentLocaleAgile(localDB, (err,res) => {
                    if (err) reject(err)
                    resolve(res)
                })
            })
            await global.app.stop()
        })
        
        it("should return true if the language changed to english and db language is correct", async () => {
            var change = null
            change = await utils.systemSettings.chooseEnglish()
            var ret = false
            await utils.sleep(1500)
            const lan = await db.dbLanguage()
            ret = (lan == 2)
            expect(change && ret).to.be.true
        })
        
        it("should return true if the language changed to english and Agile language is correct", async () => {
            var change = null
            change = await utils.systemSettings.chooseEnglish(true)
            expect(change).to.be.true
        })
        
    })
    
    
    describe("Test from italian", async () => {

        beforeEach(async function(){    
            //Setta italiano
            await new Promise(function(resolve, reject){
                agileService.setCurrentLocaleAgile("it-IT", (err,res) => {
                    if (err) reject(err)
                    resolve(res)
                })
            })
            await utils.start()
        }) 

        afterEach(async function(){
            await new Promise(function(resolve, reject){
                agileService.setCurrentLocaleAgile(localDB, (err,res) => {
                    if (err) reject(err)
                    resolve(res)
                })
            })
            await global.app.stop()
        })

        it("should return true if the language changed to english", async () => {
            var change = null
            change = await utils.systemSettings.chooseEnglish()
            var ret = false
            await utils.sleep(1500)
            const lan = await db.dbLanguage()
            ret = (lan == 2)
            expect(change && ret).to.be.true
        })
        
        it("should return true if the language changed to english and Agile language is correct", async () => {
            var change = null
            change = await utils.systemSettings.chooseEnglish(true)
            expect(change).to.be.true
        })

    })
    

    describe("Test from english", async () => {

        beforeEach(async function(){    
            //Setta inglese
            await new Promise(function(resolve, reject){
                agileService.setCurrentLocaleAgile("en-GB", (err,res) => {
                    if (err) reject(err)
                    resolve(res)
                })
            })
            await utils.start()
        }) 
        
        afterEach(async function(){
            await new Promise(function(resolve, reject){
                agileService.setCurrentLocaleAgile(localDB, (err,res) => {
                    if (err) reject(err)
                    resolve(res)
                })
            })
            await global.app.stop()
        })

        it("should return true if the language changed to english", async () => {
            var change = null
            change = await utils.systemSettings.chooseEnglish()
            var ret = false
            await utils.sleep(1500)
            const lan = await db.dbLanguage()
            ret = (lan == 2)
            expect(change && ret).to.be.true
        })

        it("should return true if the language changed to english and Agile language is correct", async () => {
            var change = null
            change = await utils.systemSettings.chooseEnglish(true)
            expect(change).to.be.true
        })
        
    })
    
})
