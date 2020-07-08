const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null


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
            var change = null
            change = await chooseEnglish(3)
            var ret = false
            await utils.sleep(1500)
            const lan = await db.dbLanguage()
            ret = (lan == 2)
            expect(ret).to.be.true
        })
        
        it("should return true if agile and database language are the same", async () => {
            expect(await isSameLanguage()).to.be.true
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
            var change = null
            change = await chooseEnglish(1)
            var ret = false
            await utils.sleep(1500)
            const lan = await db.dbLanguage()
            ret = (lan == 2)
            expect(change && ret).to.be.true
        })
        
        it("should return true if agile and database language are the same", async () => {
            expect(await isSameLanguage()).to.be.true
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
            var change = null
            change = await chooseEnglish(2)
            var ret = false
            await utils.sleep(1500)
            const lan = await db.dbLanguage()
            ret = (lan == 2)
            expect(change && ret).to.be.true
        })

        it("should return true if agile and database language are the same", async () => {
            expect(await isSameLanguage()).to.be.true
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
    var menu = null
    // switch(await db.dbLanguage()){
    //     case 1:{
    //         menu = global.app.client.$('=Impostazioni di Sistema')
    //         agileLanguage = "Lingua di Agile"
    //         break
    //     }
    //     case 2:{
    //         menu = global.app.client.$('=System Settings')
    //         agileLanguage = "Agile language"
    //         break
    //     }
    //     case 3:{
    //         menu = global.app.client.$('=Ajustes del Sistema')
    //         agileLanguage = "Idioma de Agile"
    //         break
    //     }
    //     default:{
    //         menu = global.app.client.$('error')
    //         break
    //     }
    // }
    menu = global.app.client.$(global.SYSTEM_SETTINGS)
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
//return true se lingua database ed agile corrispondono, false altrimenti, null se ci sono stati errori
const isSameLanguage = async function(){
    var done = true
    var language = await db.dbLanguage()

    //se la lingua nel database è corretta allora premerà sul bottone, altrimenti il bottone non sarà identificabile
    // switch(language){
    //     case 1:{
    //         menu = global.app.client.$('=Impostazioni di Sistema')
    //         break
    //     }
    //     case 2:{
    //         menu = global.app.client.$('=System Settings')
    //         break
    //     }
    //     case 3:{
    //         menu = global.app.client.$('=Ajustes del Sistema')
    //         break
    //     }
    //     default:{
    //         menu = global.app.client.$('error')
    //         break
    //     }
    // }

    
    // try{
    //     await menu.click()
    // }catch{
    //     done = false
    // }

    // if(done){
    //     return true
    // }else{
    //     return false
    // }

    var l = null;
    try{
        const lang = global.app.client.$(global.SYSTEM_SETTINGS);
        l = await lang.getText();
    }catch{
        done = false
    }
    var ret = false
    if(l == "Impostazioni di Sistema") ret = (language == 1)
    else if(l == "System Settings") ret = (language == 2)
    else if(l == "Ajustes del Sistema") ret = (language == 3)

    if(done){
        return ret
    }else{
        return null
    }
}
