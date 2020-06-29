const {db} = require ("./db.js");
const {global} = require ("./global.js");

const utils={
    //funzione di wait
    sleep : time => new Promise(r => setTimeout(r, time)),

    //return not null se la risorsa è stata creata con successo, null altrimenti
    addResource : async function (resourceName, resourceUrl) {

        //va in risorse
        const menu = global.app.client.$("#menu-link-6");
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //clicca su add resource
        const addResource = global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a");
        click = null;
        try{
            click = await addResource.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //seleziona local browser
        const localBrowser = global.app.client.$("#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(4) > label");
        click = null;
        try{
            click = await localBrowser.click();
        }catch{
        }


        await utils.sleep(1000)


        //inserisce il nome 
        const text = global.app.client.$("#add-connection-name");
        try{
            text.click();
            await text.setValue(resourceName);
        }catch{
        }


        await utils.sleep(1000)


        //inserisce l'url
        const url = global.app.client.$("#add-connection-server");
        try{
            url.click();
            await url.setValue(resourceUrl);
        }catch{
        }


        await utils.sleep(1000)


        //preme ok per confermare
        const ok = global.app.client.$("#add-connection-modal.form > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(1)");
        var ret = null;
        try{
            ret = await ok.click();
        }catch{
            ret = null
        }
        return ret
    },


    //ritorna not null se c'è una wifi disponibile con l'ssid dato, altrimenti null
    checkSsid : async function (ssid) {
        //Va nella sezione impostazioni di rete
        const menu = global.app.client.$('#menu-link-2');
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //Va nella sezione wifi
        const wifi = global.app.client.$("#ab > a");
        click = null;
        try{
            click = await wifi.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //Clicca su aggiungi rete wifi
        const add = global.app.client.$("#wifiTab > div > div > div.header-inputs > a");
        click = null;
        try{
            click = await add.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //apre la lista delle reti disponibili
        const button = global.app.client.$("#wifi");
        var click = null;
        try{
            click = await button.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        var ret = null
        try{
            ret = await global.app.client.$("span.network-ssid=" + ssid).click();
        }catch{
            ret = null
        }
        
        await utils.sleep(1000)

        return ret
    },


    //ritorna not null se ha confermato la wifi, null se la password non è corretta o la rete non è presente nell'elenco
    saveWifi: async function (ssid, psw){
        await utils.checkSsid(ssid)

        //inserisce la password
        const password = global.app.client.$("#add-connection-modal > div > div.modal-content > div > div > div.row:nth-child(4) > div > div > input");
        try{
            password.click();
            var x = await password.setValue(psw);
            while(!x){
                
            }
        }catch{
        }


        await utils.sleep(1000)


        //conferma premendo ok
        const ok = global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)");
        var click = null;
        try{
            click = await ok.click();
        }catch{
            click = null
        }
        return click
    },


    //ritorna not null se ha creato la regola, altrimenti null
    addRule: async function (vid, pid){

        const menu = global.app.client.$('#menu-link-11');
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1500);
        

        click = null;                    
        const addRule = global.app.client.$("#main-div > div.main-content > main > section > div.fixed-header > div > div > a");
        try{
            click = await addRule.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)
        

        var v = global.app.client.$("#vid");
        try{
            v.click();
            var x = await v.setValue(vid);
            while(!x){
                
            }
        }catch{
        }


        await utils.sleep(1000)


        v = global.app.client.$("#pid");
        try{
            v.click();
            var x = await v.setValue(pid);
            while(!x){
                
            }
        }catch{
        }


        await utils.sleep(1000)


        const ok = global.app.client.$("#add-usb-rule-modal > div > div.modal-footer > div > a:nth-child(1)")
        click = null;
        try{
            click = await ok.click()
        }catch{
            click = null;
        }
        return click 
    },


    //ritorna null se non ha potuto confermare, altrimenti not null
    addAddress: async function(address, port, timeout){

        //va in thinman settings
        const menu = global.app.client.$('#menu-link-3');
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();
    
    
        await utils.sleep(1000)
    
    
        //preme su add address
        const add = global.app.client.$('h5 > a');
        var click = null;
        try{
            click = await add.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();
    
    
        await utils.sleep(1000)
    
    
        //inserisce l'hostname
        const hostname = global.app.client.$("#new-address");
        try{
            hostname.click();
            var x = await hostname.setValue(address);
            while(!x){
                
            }
        }catch{
        }
    
    
        await utils.sleep(1000)
    
    
        //inserisce la porta
        const p = global.app.client.$("#new-port");
        
        try{
            p.click();
            
            if(port == ""){
                //cancellazione manuale, con clearElement non funziona in questo caso
                var r = false
                r = await new Promise(function (resolve, reject){
                    p.getValue().then(function(result){
                        for(i=0;i<result.length;i++){	
                            global.app.client.keys("Backspace");	
                        }
                        resolve(true)
                    })
                }) 
                while(!r){
    
                }
            }else{
                x = false
                x = await p.setValue(port)
                while(!x){
    
                }
            }
        }catch{
    
        }
    
    
        await utils.sleep(1000)
    
    
        //inserisce il timeout
        const t = global.app.client.$("#new-timeout");
    
        try{
            t.click();
            //TODO: condizione particolare, sarebbe da evitare 
            if(timeout == "" || isNaN(timeout)){
                //cancellazione manuale, con clearElement non funziona in questo caso
                var r = false
                r = await new Promise(function (resolve, reject){
                    t.getValue().then(function(result){
                        for(i=0;i<result.length;i++){	
                            global.app.client.keys("Backspace");	
                        }
                        resolve(true)
                    })
                }) 
                while(!r){
    
                }
            }else{
                x = false
                x = await t.setValue(timeout)
                while(!x){
    
                }
            }
        }catch{
            
        }
    
    
        await utils.sleep(1000)
    
    
        const confirm = global.app.client.$("#main-div > div.main-content > main > section > div > div > div.modal-footer > div.buttons > a:nth-child(1)");
        var ret = null;
        try{
            ret = await confirm.click();
        }catch{
            ret = null
        }
        return ret
    },


    //return not null se ha premuto sul bottone elimina
    deleteAddress: async function(address){

        //va in thinman settings
        const menu = global.app.client.$('#menu-link-3');
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //numero di address agile 
        const length = await db.getThinManListLength();
        var thinman = "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul"
        var child = null;
        //selector per il bottone da premere
        var elimina = null;
        //aggiorno lingua
        global.language = await db.dbLanguage()
        //string per html che dipende dalla lingua in uso
        var indirizzo = null;
        if(global.language == 1) indirizzo = "Indirizzo"
        else if(global.language == 2) indirizzo = "Address"
        else if(global.language == 3) indirizzo = "Dirección"
        
        for(i=1;i<=length;i++){
            //cerco l'address che voglio eliminare
            child = thinman + " > li:nth-child("+i+") > div > div"
            //guardo se gli address corrispondono
            var x = null;
            try{
                x = await global.app.client.$(child + " > div.address-info > div").getHTML();
            }catch{
            }
            if(x == "<div><b>"+indirizzo+":</b> "+ address +"</div>"){
                //salvo elemento da eliminare per eliminarlo in seguito
                elimina = "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul > li:nth-child("+i+") > div > div > div.address-item-delete > i";
            }
        } 
        //bottone da premere per eliminare l'elemento
        var elim = null;
        try{
            elim = await global.app.client.$(elimina).click();
        }catch{
            elim = null
        }
        return elim
    },


    //return true se non c'è un address con l'hostname dato, altrimenti false
    checkDelete: async function(address){

        //va in thinman settings
        const menu = global.app.client.$('#menu-link-3');
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //numero di address agile 
        const length = await db.getThinManListLength();

        var thinman = "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul"
        var child = null;
        //indica se ho trovato un'address con quell'hostname
        var found = null;
        //aggiorno lingua
        global.language = await db.dbLanguage()
        //string per html che dipende dalla lingua in uso
        var indirizzo = null;
        if(global.language == 1) indirizzo = "Indirizzo"
        else if(global.language == 2) indirizzo = "Address"
        else if(global.language == 3) indirizzo = "Dirección"

        for(i=1;i<=length;i++){
            //cerco l'address
            child = thinman + " > li:nth-child("+i+") > div > div"
            //guardo se gli address corrispondono
            var x = null;
            try{
                x = await global.app.client.$(child + " > div.address-info > div").getHTML();
            }catch{
            }
            if(x == "<div><b>"+indirizzo+":</b> "+ address +"</div>"){
                //aggiorno found
                found = true;
            }
        } 
        return !found
    },


    //return not null se ha confermato la creazione della regola
    addUsbRule: async function(description, vid, pid){

        //Apre menù USB Redirection
        const menu = global.app.client.$('#menu-link-10');
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //clicca add redirection rule
        const button = global.app.client.$('#citrix > div > div > div > a');
        click = null;
        try{
            click = await button.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //inserisce descrizione 
        const d = global.app.client.$("#description");
        try{
            d.click();
            var x = await d.setValue(description);
            while(!x){
                
            }
        }catch{
        }


        await utils.sleep(1000)


        //inserisce il vid
        const v = global.app.client.$("#vid");
        try{
            v.click();
            var x = await v.setValue(vid);
            while(!x){
                
            }
        }catch{
        }


        await utils.sleep(1000)


        //inserisce il pid
        const p = global.app.client.$("#pid");
        try{
            p.click();
            x = await p.setValue(pid);
            while(!x){
                
            }
        }catch{
        }


        await utils.sleep(1000)


        //conferma
        const ok = global.app.client.$("#add-usb-rule-modal > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(1)");
        var click = null;
        try{
            click = await ok.click();
        }catch{
            click = null
        }

        if(click == null){
            //preme su annulla
            try{
                global.app.client.$("#add-usb-rule-modal > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(2)").click()
            }catch{
            }
        }

        return click
    },
    

    //ritorna not null se ha creato la startup, altrimenti null
    addStartup: async function(name, command){

        //va in startup
        const menu = global.app.client.$('#menu-link-7');
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //preme su Add startup
        const button = global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a")
        click = null
        try{
            click = await button.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //inserisce nome 
        const n = global.app.client.$("#name");
        try{
            n.click();
            var x = await n.setValue(name);
            while(!x){
                
            }
        }catch{
        }


        await utils.sleep(1000)


        //inserisce comando 
        const c = global.app.client.$("#command");
        try{
            c.click();
            var x = await c.setValue(command);
            while(!x){
                
            }
        }catch{
        }


        await utils.sleep(1000)


        //conferma
        const ok = global.app.client.$("#add-connection-modal.form > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(1)");
        var ret = null;
        try{
            ret = await ok.click();
        }catch{
            ret = null
        }

        return ret
    }


}

module.exports = {utils}