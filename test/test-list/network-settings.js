const {db} = require ("../db.js");
const {global} = require ("../global.js");
var assert = require('assert');

//FUNZIONA SOLO CON WIFI CHE RICHIEDONO SSID E PASSWORD
function addWifiNetwork(ssid, psw){
    describe("Add WiFi Network", function(){

        //Va nella sezione impostazioni di rete
        it("Navigates to Network Settings", async () => {
            const menu = global.app.client.$('#menu-link-2');
            var click = null;
            try{
                click = await menu.click();
            }catch{
                assert.ok(false, "Impossible to find the network settings link")
            }
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click, "error while opening the network settings menù");
        })

        //Va nella sezione WiFi
        it("Navigates to WiFi", async () => {
            const menu = global.app.client.$("#ab > a");
            var click = null;
            try{
                click = await menu.click();
            }catch{
                assert.ok(false, "Impossible to find the WiFi tab")
            }
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click, "error while opening the WiFi tab");
        })

        //Clicca su aggiungi rete wifi
        it("Click on Add WiFi Network", async () => {
            const button = global.app.client.$("#wifiTab > div > div > div.header-inputs > a");
            var click = null;
            try{
                click = await button.click();
            }catch{
                assert.ok(false, "Impossible to find the Add WiFi button")
            }
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click, "Error while clicking the Add WiFi Network link");
        })

        //Apri la lista delle wifi disponibili
        it("Opens available WiFi list", async () => {
            const button = global.app.client.$("#wifi");
            var click = null;
            try{
                click = await button.click();
            }catch{
                assert.ok(false, "Impossible to find the WiFi list")
            }
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click, "Error while opening available WiFi list");
        })

        //Cerca e clicca quella corrispondente 
        it("Click on the WiFi to add", async () => {
            try{
                const click = await global.app.client.$("span.network-ssid=" + ssid).click();
                assert.ok(click, "Error while selecting the WiFi with the given ssid")
            }catch{
                assert.ok(false, "There is no wifi with the given ssid")
            }
        })

        //Inserisce la password
        it("Insert password", async () => {
            const password = global.app.client.$("#add-connection-modal > div > div.modal-content > div > div > div.row:nth-child(4) > div > div > input");
            try{
                password.click();
                var x = await password.setValue(psw);
                while(!x){
                    
                }
            }catch{
                assert.ok(false, "Impossible to find password field")
            }
            password.getValue().then(function(v){
                assert.equal(v, psw, "error while inserting the password");
            })
        })

        //Preme ok per confermare 
        it("Add the new WiFi clicking ok", async () => {
            const ok = global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)");
            var click = null;
            try{
                click = await ok.click();
            }catch{
                assert.ok(false, "Impossible to find ok button")
            }
            assert.ok(click, "Error while clicking ok")
        })

        //Controlla che la nuova wifi sia stata inserita nel db
        it("Check if the new WiFi is in the db", async () => {
            const wifi = await db.getWifi(ssid);
            assert.ok(wifi, "Error, the new WiFi is not in the db")
        })

        //Controlla che la nuova wifi sia nella lista di agile 
        it("Check if the new WiFi is in the list of agile", async () => {
            const length = await db.getWifiListLength();
            const base = "#wifiTab > div > div > div.section-wrapper.scrollable > div"
            var found = false; 
            var name = null;
            for(i = 1; i<= length; i++){
                try{
                    name = await global.app.client.$(base + " > div:nth-child(" + i + ") > div > div.block-item-properties-wrapper > div").getText();
                }catch{
                    assert.ok(false, "Impossible to find the list elements")
                }
                if(name.slice(14) == ssid){
                    found = true;
                }
            }
            assert.ok(found, "Error, the new WiFi is not in the list of agile")
        })

    })
}

module.exports = {
    addWifiNetwork: addWifiNetwork
}