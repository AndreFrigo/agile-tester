const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface")

var localDB = null

describe("Test startup availability", function(){

    this.timeout(100000)

    before(async function(){
        //salva database locale
        db.conn.select(1)
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
            agileService.setAutorun([
                {
                  name: 'test_startup',
                  command: 'test_startup_cmd',
                  status: true,
                  statusagilemode: false
                }
              ]
              , (err,res) => {
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

    it("should return true if the startup is in the database", async () => {
        var found = false
        const startup = await db.getStartup("test_startup")
        if(startup && startup.command == "test_startup_cmd"){
            found = true
        }
        expect(found).to.be.true
    })

    it("should return false if it tries to add a startup with the same name", async () => {
        expect(await utils.startup.addStartup("test_startup", "anything")).to.be.false
    })

    it("should return true if the startup is in the Agile list", async() => {
        expect(await utils.startup.isInAgileList("test_startup", "test_startup_cmd")).to.be.true
    })
})