const {db} = require ("../db.js");
const {global} = require ("../global.js");
var assert = require('assert');

function setEnglishLanguage(){
    //Imposta la lingua di agile in english
    describe("Choose english as language", function(){

        //Va nella sezione impostazioni
        it('Navigates to settings', async () => {
            const menu = global.app.client.$('#menu-link-1');
            var click = null;
            try{
                click = await menu.click();
            }catch{
                assert.ok(false, "Impossible to find the system settings link")
            }
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click, "error while opening the settings menù");
        });
        
        
        //Dalla sezione impostazioni va a quella della lingua
        it('Navigates to language', async () => {
            const menu = global.app.client.$("#language-tab.tab > a");
            var click = null;
            try{
                click = await menu.click();
            }catch{
                assert.ok(false, "Impossible to find the WiFi tab")
            }
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click, "error while opening the language tab");
        });

        //Controllo che la lingua selezionata sia quella attuale 
        it('Control that displayed current language is correct', async () => {
            const lan = global.app.client.$('#language > span > div > div > div > input.select-dropdown');
            try{
                var l = await lan.getValue();
            }catch{
                assert.ok(false, "Impossible to find the lable language")
            }            
            if(l == "Italiano") assert.equal(global.language, 1)
            else if(l == "English") assert.equal(global.language, 2)
            else if(l == "Español") assert.equal(global.language, 3)
            else assert.ok(false, "error while checking language")
        })

        //Dalla sezione lingua, apre la scelta della lingua
        it('Open language list', async () => {
            const button = global.app.client.$("#language > span > div > div > div > input.select-dropdown");
            var click = null;
            try{
                click = await button.click();
            }catch{
                assert.ok(false, "Impossible to find the button")
            }
            assert.ok(click, "error while clicking the button");
        });

        //Sceglie la lingua inglese
        it('Select english as language', async () => {
            var choice = ""
            switch(global.language){
                case 1 : {
                    choice+="span=Inglese";
                    break;
                }
                case 2 : {
                    choice+="span=English";
                    break;
                }
                case 3 : {
                    choice+="span=Inglés";
                    break;
                }
                default : {
                    console.log("Undefined language! " + global.language);
                    break;
                }
            }
            try{
                await global.app.client.click(choice).then(function(){
                    //aggiorna la lingua corrente
                    global.language = 2;
                });
            }catch{
                assert.ok(false, "Impossible to select the language")
            }
            //controlla che la lingua corrente sia inglese
            assert.equal(global.language,2, "error, the current language is not english");
        });

        it('Check if db language is english', async () => {
            var lan = await db.dbLanguage();
            assert(lan, "en-GB", "error, the db language is not english");
        });

        //Controllo che la lingua selezionata sia english
        it('Control that displayed current language is english', async () => {
            const lan = global.app.client.$('#language > span > div > div > div > input.select-dropdown');
            try{
                var l = await lan.getValue();
            }catch{
                assert.ok(false, "Impossible to find the lable language")
            } 
            if(l == "Italiano") assert.equal(global.language, 1)
            else if(l == "English") assert.equal(global.language, 2)
            else if(l == "Español") assert.equal(global.language, 3)
            else assert.ok(false, "error while checking language")
        })
    })
}

module.exports = {
    setEnglishLanguage: setEnglishLanguage
}