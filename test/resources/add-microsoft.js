const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const { info } = require("../set-before-test.js");
const agileService = require("agile-os-interface")

var localDB = null

describe("Test add microsoft resource", function(){

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
        db.conn.select(1)
        db.conn.set("connections", "[{\"name\":\"test\",\"type\":\"RDP\",\"autostart\":false,\"onExitAction\":\"\",\"passthrough\":false,\"local\":false,\"server\":false,\"options\":{\"allow_unauthorized\":false,\"file\":\"//long_string==\",\"filename\":\"microsoft_test.rdp\"},\"id\":\"24a97819-b4ef-4d19-a137-7c6287fe75c5\"}]")
        await new Promise(function(resolve, reject){
            agileService.setConnections([
                {
                  name: 'test',
                  type: 'RDP',
                  autostart: false,
                  onExitAction: '',
                  passthrough: false,
                  local: false,
                  server: false,
                  options: {
                    allow_unauthorized: false,
                    file: '//long_string==',
                    filename: 'microsoft_test.rdp'
                  },
                  id: '24a97819-b4ef-4d19-a137-7c6287fe75c5'
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

    it("should return true if the resource is in the database", async () => {
        var found = false
        const resource = await db.getResourceFromName("test");
        if(resource && resource.options.filename == "microsoft_test.rdp"){
            found = true
        }
        expect(found).to.be.true
    })


    if(info.os == "w"){
        it("should return false if it tries to add a resource with the same name", async () => {
            //deve esserci il file microsoft_test.rdp
            expect(await utils.resources.addMicrosoft("test", "microsoft_test")).to.be.false
        })
    }


    it("should return true if the resource is in the Agile list", async() => {
        expect(await utils.resources.isInAgileList(2, "test")).to.be.true
    })

})