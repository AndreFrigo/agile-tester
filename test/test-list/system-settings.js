const {db} = require ("../db.js");
const {global} = require ("../global.js");
const { expect } = require("chai");

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


    await global.sleep(1000)


    //va nella sezione lingua
    const language = global.app.client.$("#language-tab.tab > a");
    click = null;
    try{
        click = await language.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    //apre la scelta della lingua
    const button = global.app.client.$("#language > span > div > div > div > input.select-dropdown");
    click = null;
    try{
        click = await button.click();
    }catch{
    }


    await global.sleep(1000)


    //setta la lingua inglese 
    var ret = null
    if(lan == 1){
        try{
            ret = await global.app.client.click("span=Inglese")
            //aggiorna la lingua corrente
            global.language = 2;
        }catch{
            ret = null
        }
    }else if(lan == 2){
        try{
            ret = await global.app.client.click("span=English")
            //aggiorna la lingua corrente
            global.language = 2;
        }catch{
            ret = null
        }
    }else if (lan == 3){
        try{
            ret = await global.app.client.click("span=Inglés")
            //aggiorna la lingua corrente
            global.language = 2;
        }catch{
            ret = null
        }
    }
    return ret
}


function setEnglishLanguage(){
    //Imposta la lingua di agile in english
    describe("Choose english as language", function(){

        this.timeout(30000)

        describe("Test from spanish", async () => {

            before(async function(){    
                //Setta spagnolo
                db.conn.select(1)
                db.conn.set("config_locale", "{\"current_keyboard_locale\":\"it-IT\",\"current_locale_agile\":\"es-ES\"}")
                await global.app.start()
            }) 

            after(async function(){
                await global.app.stop()
            })

            it("should return true if the language changed to english", async () => {
                await chooseEnglish(3)
                var ret = false
                await global.sleep(1500)
                const lan = await db.dbLanguage()
                ret = (lan == 2)
                expect(ret).to.be.true
            })

            it("should return true if agile and database language are the same", async () => {
                //controllo lingua di agile dall'interfaccia
                var l = null;
                try{
                    const lang = global.app.client.$('#menu-link-1');
                    l = await lang.getText();
                }catch{
                }
                var ret = false
                if(l == "Impostazioni di Sistema") ret = (global.language == 1)
                else if(l == "System Settings") ret = (global.language == 2)
                else if(l == "Ajustes del Sistema") ret = (global.language == 3)
                expect(ret).to.be.true
            })

        })

        
        describe("Test from italian", async () => {

            before(async function(){    
                //Setta italiano
                db.conn.select(1)
                db.conn.set("config_locale", "{\"current_keyboard_locale\":\"it-IT\",\"current_locale_agile\":\"it-IT\"}")
                await global.app.start()
            }) 

            after(async function(){
                await global.app.stop()
            })

            it("should return true if the language changed to english", async () => {
                await chooseEnglish(1)
                var ret = false
                await global.sleep(1500)
                const lan = await db.dbLanguage()
                ret = (lan == 2)
                expect(ret).to.be.true
            })

            it("should return true if agile and database language are the same", async () => {
                //controllo lingua di agile dall'interfaccia
                var l = null;
                try{
                    const lang = global.app.client.$('#menu-link-1');
                    l = await lang.getText();
                }catch{
                }
                var ret = false
                if(l == "Impostazioni di Sistema") ret = (global.language == 1)
                else if(l == "System Settings") ret = (global.language == 2)
                else if(l == "Ajustes del Sistema") ret = (global.language == 3)
                expect(ret).to.be.true
            })

        })


        describe("Test from english", async () => {

            before(async function(){    
                //Setta inglese
                db.conn.select(1)
                db.conn.set("config_locale", "{\"current_keyboard_locale\":\"it-IT\",\"current_locale_agile\":\"en-GB\"}")
                await global.app.start()
            }) 

            after(async function(){
                await global.app.stop()
            })

            it("should return true if the language changed to english", async () => {
                await chooseEnglish(2)
                var ret = false
                await global.sleep(1500)
                const lan = await db.dbLanguage()
                ret = (lan == 2)
                expect(ret).to.be.true
            })

            it("should return true if agile and database language are the same", async () => {
                //controllo lingua di agile dall'interfaccia
                var l = null;
                try{
                    const lang = global.app.client.$('#menu-link-1');
                    l = await lang.getText();
                }catch{
                }
                var ret = false
                if(l == "Impostazioni di Sistema") ret = (global.language == 1)
                else if(l == "System Settings") ret = (global.language == 2)
                else if(l == "Ajustes del Sistema") ret = (global.language == 3)
                expect(ret).to.be.true
            })

        })

    })
}

module.exports = {
    setEnglishLanguage: setEnglishLanguage
}