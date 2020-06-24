const {db} = require ("../db.js");
const {global} = require ("../global.js");
var assert = require('assert');
const { expect } = require("chai");

//ritorna click, se è nullo allora la rete non è presente nell'elenco
const checkSsid = async function (ssid) {
    //Va nella sezione impostazioni di rete
    const menu = global.app.client.$('#menu-link-2');
    var click = null;
    try{
        click = await menu.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    //Va nella sezione wifi
    const wifi = global.app.client.$("#ab > a");
    click = null;
    try{
        click = await wifi.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    //Clicca su aggiungi rete wifi
    const add = global.app.client.$("#wifiTab > div > div > div.header-inputs > a");
    click = null;
    try{
        click = await add.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    //apre la lista delle reti disponibili
    const button = global.app.client.$("#wifi");
    var click = null;
    try{
        click = await button.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    var ret = null
    try{
        ret = await global.app.client.$("span.network-ssid=" + ssid).click();
    }catch{
        ret = null
    }
    
    await global.sleep(1000)

    return ret
}

//ritorna click, se è nullo allora la password non è corretta o la rete non è presente nell'elenco
const checkPsw = async function (ssid, psw){
    await checkSsid(ssid)

    //inserisce la password
    const password = global.app.client.$("#add-connection-modal > div > div.modal-content > div > div > div.row:nth-child(4) > div > div > input");
    try{
        password.click();
        var x = await password.setValue(psw);
        while(!x){
            
        }
    }catch{
    }


    await global.sleep(1000)


    //conferma premendo ok
    const ok = global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)");
    var click = null;
    try{
        click = await ok.click();
    }catch{
        click = null
    }
    if(click == null){
        //preme su annulla
        try{
            await global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(2)").click();
        }catch{
        }
    }

    return click

}
//FUNZIONA SOLO CON WIFI CHE RICHIEDONO SSID E PASSWORD
function addWifiNetwork(){
    describe("Add WiFi Network", function(){
        this.timeout(30000)
        const wrongSsid = [
            {ssid:"", psw:1234},
            {ssid:"allagriglia", psw:1234},
            {ssid:"bsn", psw:1234},
            {ssid:123345, psw:1234}
        ]
        wrongSsid.forEach(elem => {
            it("should return null if there is not a wifi with the given ssid in the list", async () => {
                const isNull = await checkSsid(elem.ssid)
                //preme su annulla
                try{
                    await global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(2)").click();
                }catch{
                }
                expect(isNull).to.be.null
            })
        })

        const wrongPsw = [
            {ssid:"PRAIM_WIFI_N", psw:1234},
            {ssid:"PRAIM_WIFI_N", psw:"asdfghj"},
            {ssid:"PRAIM_WIFI_N", psw:""}
        ]
        wrongPsw.forEach(elem => {
            it("should return null if the password is wrong or there is not a wifi with the given ssid in the list", async () => {
                expect(await checkPsw(elem.ssid, elem.psw)).to.be.null
            })
        })

        const rightValues = [
            {ssid:"PRAIM_WIFI_N", psw:"asd123!!"}
        ]
        rightValues.forEach(elem => {
            it("should return not null if the wifi has been added correctly", async () => {
                expect(await checkPsw(elem.ssid, elem.psw)).to.be.not.null
            })
        })

        // //Controlla che la nuova wifi sia stata inserita nel db
        // it("Check if the new WiFi is in the db", async () => {
        //     const wifi = await db.getWifi(ssid);
        //     assert.ok(wifi, "Error, the new WiFi is not in the db")
        // })

        // //Controlla che la nuova wifi sia nella lista di agile 
        // it("Check if the new WiFi is in the list of agile", async () => {
        //     const length = await db.getWifiListLength();
        //     const base = "#wifiTab > div > div > div.section-wrapper.scrollable > div"
        //     var found = false; 
        //     var name = null;
        //     for(i = 1; i<= length; i++){
        //         try{
        //             name = await global.app.client.$(base + " > div:nth-child(" + i + ") > div > div.block-item-properties-wrapper > div").getText();
        //         }catch{
        //             assert.ok(false, "Impossible to find the list elements")
        //         }
        //         if(name.slice(14) == ssid){
        //             found = true;
        //         }
        //     }
        //     assert.ok(found, "Error, the new WiFi is not in the list of agile")
        // })

    })
}

module.exports = {
    addWifiNetwork: addWifiNetwork
}