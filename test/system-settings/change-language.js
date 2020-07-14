const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const { info } = require("../set-before-test.js");
const agileService = require("agile-os-interface")
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
            change = await chooseEnglish(3)
            var ret = false
            await utils.sleep(1500)
            const lan = await db.dbLanguage()
            ret = (lan == 2)
            expect(change && ret).to.be.true
        })
        
        it("should return true if the language changed to english and Agile language is correct", async () => {
            var change = null
            change = await chooseEnglish(3)
            var ret = false
            await utils.sleep(1500)
            var lan = null
            try{
                lan = await global.app.client.$(info.SYSTEM_SETTINGS).getText()
            }catch{
                lan = null
            }
            ret = (lan == "System Settings")
            expect(change && ret).to.be.true
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
            change = await chooseEnglish(1)
            var ret = false
            await utils.sleep(1500)
            const lan = await db.dbLanguage()
            ret = (lan == 2)
            expect(change && ret).to.be.true
        })
        
        it("should return true if the language changed to english and Agile language is correct", async () => {
            var change = null
            change = await chooseEnglish(1)
            var ret = false
            await utils.sleep(1500)
            var lan = null
            try{
                lan = await global.app.client.$(info.SYSTEM_SETTINGS).getText()
            }catch{
                lan = null
            }
            ret = (lan == "System Settings")
            expect(change && ret).to.be.true
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
            change = await chooseEnglish(2)
            var ret = false
            await utils.sleep(1500)
            const lan = await db.dbLanguage()
            ret = (lan == 2)
            expect(change && ret).to.be.true
        })

        it("should return true if the language changed to english and Agile language is correct", async () => {
            var change = null
            change = await chooseEnglish(2)
            var ret = false
            await utils.sleep(1500)
            var lan = null
            try{
                lan = await global.app.client.$(info.SYSTEM_SETTINGS).getText()
            }catch{
                lan = null
            }
            ret = (lan == "System Settings")
            expect(change && ret).to.be.true
        })
        
    })
    
})

//input lan indica la lingua corrente 
//return true se la lingua è stata cambiata, altrimenti false, null se ci sono stati errori
const chooseEnglish = async function(lan){
    var done = true
    //string contenente "Lingua di Agile" nelle diverse lingue 
    var agileLanguage = null

    //va nelle impostazioni di sistema
    const menu = global.app.client.$(info.SYSTEM_SETTINGS)
    try{
        await menu.click();
    }catch{
        done = false
    }
    global.app.client.waitUntilWindowLoaded();


    await utils.sleep(1000)


    //va nella sezione lingua
    const language = global.app.client.$("#language-tab.tab > a");
    try{
        await language.click();
    }catch{
        done = false
    }
    global.app.client.waitUntilWindowLoaded();


    await utils.sleep(1000)


    //apre la scelta della lingua
    var button = null
    var cont = true
    //testo da confrontare
    switch(await db.dbLanguage()){
        case 1:{
            agileLanguage = "Lingua di Agile"
            break
        }
        case 2:{
            agileLanguage = "Agile language"
            break
        }
        case 3:{
            agileLanguage = "Idioma de Agile"
            break
        }
        default:{
            agileLanguage = "error"
            break
        }
    }
    //c'è un header prima dei div, quindi l'indice parte da 2 al posto che da 1
    var index = 2
    var text = null
    while(cont){
        try{
            text = await global.app.client.$("#language > span > div:nth-child(" + index + ") > span").getText()
        }catch{
            cont = false
        }
        if(text == agileLanguage){
            button = "#language > span > div:nth-child(" + index + ") > div > div > input.select-dropdown"
        }
        index ++
    }
    
    try{
        await global.app.client.click(button);
    }catch{
        done = false
    }


    await utils.sleep(1000)


    //setta la lingua inglese 
    var ret = null
    if(lan == 1){
        try{
            ret = await global.app.client.click("span=Inglese")
        }catch{
            ret = null
        }
    }else if(lan == 2){
        try{
            ret = await global.app.client.click("span=English")
        }catch{
            ret = null
        }
    }else if (lan == 3){
        try{
            ret = await global.app.client.click("span=Inglés")
        }catch{
            ret = null
        }
    }
    
    if(done){
        return ret != null
    }else{
        return null
    }
}