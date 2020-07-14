const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface")

var localDB = null

describe("test add citrix resource", function(){

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
            agileService.setConnections([
                {
                  name: 'test',
                  type: 'CITRIX',
                  autostart: false,
                  onExitAction: '',
                  passthrough: false,
                  local: false,
                  server: true,
                  options: {
                    url: 'https://prova.it',
                    allow_unauthorized: false,
                    hide_topbar: false,
                    force_fullscreen: false,
                    onAgileLogoutAction: '',
                    domain: 'dom',
                    hideDomain: false,
                    exclude: [Object]
                  },
                  id: '4eea220f-7e5d-40a5-98d5-87568f20480d'
                }
              ], (err,res) => {
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
        if(resource && resource.options.url == "https://prova.it"){
            found = true
        }
        expect(found).to.be.true
    })


    it("should return false if it tries to add a resource with the same name", async () => {
        expect(await utils.resources.addCitrix("test", "https://prova.it", "dom")).to.be.false
    })


    it("should return true if the resource is in the Agile list", async() => {
        expect(await utils.resources.isInAgileList(1, "test")).to.be.true
    })

})