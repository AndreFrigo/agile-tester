const {utils} = require("../utils.js");
const { expect } = require("chai");
const { Application } = require("spectron");
const {info} = require("../set-before-test");
const agileService = require("agile-os-interface")
var robot = null
var localDB = null

describe("Test agile mode", function(){
    const preview = new Application({
        path: "C:\\Program Files (x86)\\Praim\\Agile\\Agile\\Agile.exe",
        args: ["windowed"]
    });

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
        //Aggiunge una risorsa direttamente nel database
        await new Promise(function(resolve, reject){
            agileService.setConnections([
                {
                  name: 'test',
                  type: 'URL',
                  autostart: false,
                  onExitAction: '',
                  passthrough: false,
                  local: true,
                  server: false,
                  options: {
                    url: 'https://milannews.it',
                    kiosk: false,
                    fullscreen: false,
                    browser: 'iexplore'
                  },
                  id: 'afe39343-6643-49a5-a684-572ead42d3ee'
                }
              ]
              , (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        //Avvia app
        await preview.start()

        if(info.os == "w"){
            robot = require("robotjs")
            // minimizza il terminale vuoto
            await robot.keyToggle("space", "down", ["alt"])
            await robot.keyTap("n")
            await utils.sleep(500)
            await robot.keyToggle("space", "up", ["alt"])
        }
    }) 

    afterEach(async function(){
        await new Promise(function(resolve, reject){
            agileService.setConnections(localDB, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })

        await preview.stop()
    })

    it("Should return true if a resource added is available", async () => {
        //Controlla che ci sia una risorsa con il nome corretto disponibile
        expect(await utils.agileMode.checkResource("test", preview)).to.be.true
    })

    
})