const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

//input lan indica la lingua corrente 
const chooseEnglish = async function(lan){

    //va nelle impostazioni di sistema
    const menu = global.app.client.$('#menu-link-1');
    var click = null;
    try{
        click = await menu.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await utils.sleep(1000)


    //va nella sezione lingua
    const language = global.app.client.$("#language-tab.tab > a");
    click = null;
    try{
        click = await language.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await utils.sleep(1000)


    //apre la scelta della lingua
    const button = global.app.client.$("#language > span > div > div > div > input.select-dropdown");
    click = null;
    try{
        click = await button.click();
    }catch{
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
    return ret
}


//Imposta la lingua di agile in english
describe("Choose english as language", function(){

    this.timeout(30000)

    before(async function(){
        //salva database locale
        db.conn.select(1)
        localDB = await new Promise(function (resolve, reject){
            db.conn.get("config_locale", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
    })

    describe("Test from spanish", async () => {

        before(async function(){    
            //Setta spagnolo
            db.conn.select(1)
            db.conn.set("config_locale", "{\"current_keyboard_locale\":\"it-IT\",\"current_locale_agile\":\"es-ES\"}")
            await utils.start()
        }) 

        after(async function(){
            db.conn.set("config_locale", localDB)
            await global.app.stop()
        })

        it("should return true if the language changed to english", async () => {
            await chooseEnglish(3)
            var ret = false
            await utils.sleep(1500)
            const lan = await db.dbLanguage()
            ret = (lan == 2)
            expect(ret).to.be.true
        })

        it("should return true if agile and database language are the same", async () => {
            var language = null
            language = await db.dbLanguage()
            await utils.sleep(500)
            //controllo lingua di agile dall'interfaccia
            var l = null;
            try{
                const lang = global.app.client.$('#menu-link-1');
                l = await lang.getText();
            }catch{
            }
            var ret = false
            if(l == "Impostazioni di Sistema") ret = (language == 1)
            else if(l == "System Settings") ret = (language == 2)
            else if(l == "Ajustes del Sistema") ret = (language == 3)
            expect(ret).to.be.true
        })

    })

    
    describe("Test from italian", async () => {

        before(async function(){    
            //Setta italiano
            db.conn.select(1)
            db.conn.set("config_locale", "{\"current_keyboard_locale\":\"it-IT\",\"current_locale_agile\":\"it-IT\"}")
            await utils.start()
        }) 

        after(async function(){
            db.conn.set("config_locale", localDB)
            await global.app.stop()
        })

        it("should return true if the language changed to english", async () => {
            await chooseEnglish(1)
            var ret = false
            await utils.sleep(1500)
            const lan = await db.dbLanguage()
            ret = (lan == 2)
            expect(ret).to.be.true
        })

        it("should return true if agile and database language are the same", async () => {
            var language = null
            language = await db.dbLanguage()
            await utils.sleep(500)
            //controllo lingua di agile dall'interfaccia
            var l = null;
            try{
                const lang = global.app.client.$('#menu-link-1');
                l = await lang.getText();
            }catch{
            }
            var ret = false
            if(l == "Impostazioni di Sistema") ret = (language == 1)
            else if(l == "System Settings") ret = (language == 2)
            else if(l == "Ajustes del Sistema") ret = (language == 3)
            expect(ret).to.be.true
        })

    })


    describe("Test from english", async () => {

        before(async function(){    
            //Setta inglese
            db.conn.select(1)
            db.conn.set("config_locale", "{\"current_keyboard_locale\":\"it-IT\",\"current_locale_agile\":\"en-GB\"}")
            await utils.start()
        }) 

        after(async function(){
            db.conn.set("config_locale", localDB)
            await global.app.stop()
        })

        it("should return true if the language changed to english", async () => {
            await chooseEnglish(2)
            var ret = false
            await utils.sleep(1500)
            const lan = await db.dbLanguage()
            ret = (lan == 2)
            expect(ret).to.be.true
        })

        it("should return true if agile and database language are the same", async () => {
            var language = null
            language = await db.dbLanguage()
            await utils.sleep(500)
            //controllo lingua di agile dall'interfaccia
            var l = null;
            try{
                const lang = global.app.client.$('#menu-link-1');
                l = await lang.getText();
            }catch{
            }
            var ret = false
            if(l == "Impostazioni di Sistema") ret = (language == 1)
            else if(l == "System Settings") ret = (language == 2)
            else if(l == "Ajustes del Sistema") ret = (language == 3)
            expect(ret).to.be.true
        })

    })

})

