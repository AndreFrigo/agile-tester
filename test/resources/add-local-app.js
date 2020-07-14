const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const { info } = require("../set-before-test.js");
const agileService = require("agile-os-interface")

var localDB = null

describe("add local application tests", function(){

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
            agileService.setConnections([
                {
                  name: 'app_test',
                  type: 'APP',
                  autostart: false,
                  onExitAction: '',
                  passthrough: false,
                  local: true,
                  server: false,
                  options: {
                    path: 'C:\\percorso\\app_test.exe',
                    filename: 'app_test.exe',
                    args: '',
                    domain: '',
                    hideDomain: false,
                    exclude: [Object]
                  },
                  id: '18a4df02-ddad-40af-8e1d-3fa31852d9f6'
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
            agileService.setConnections(localDB, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await global.app.stop()
    })

    it("should return true if the application is in the Agile list", async() => {
        expect(await utils.resources.isInAgileList(5, "app_test")).to.be.true
    })

    it("should return true if the application is in the database", async () => {
        var found = false
        const resource = await db.getResourceFromName("app_test");
        if(resource && resource.options.filename == "app_test.exe"){
            found = true
        }
        expect(found).to.be.true
    })

    if(info.os != "l"){
        it("should return false if it tries to add an application with the same name", async () => {
            expect(await utils.resources.addLocalApplication("app_test", "app_test")).to.be.false
        })
    }
})