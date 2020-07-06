const {db} = require ("./db.js");
const {global} = require ("./global.js");
const robot = require("robotjs")

const utils={
    //funzione di wait
    sleep : time => new Promise(r => setTimeout(r, time)),

    //funzione per avviare l'applicazione
    start: async function(){
        return global.app.start().then( async () => {
            //minimizza il terminale vuoto
            await robot.keyToggle("space", "down", ["alt"])
            await robot.keyTap("n")
            await utils.sleep(500)
            await robot.keyToggle("space", "up", ["alt"])

            // //setta l'applicazione come finestra principale 
            // await global.app.browserWindow.setAlwaysOnTop(true);
            // await global.app.browserWindow.focus();
        })
    },

    //return true se è apparso un pop up di successo, altrimenti false 
    checkSuccessNotification: async function(){
        var notification = null
        try{
            //titolo del pop-up
            notification = await global.app.client.$("#main-div > div:nth-child(3) > span > div.notification > div.header > p.title").getText();
        }catch{
            notification = null
        }
        //aggiorna lingua
        global.language = await db.dbLanguage()
        var succ = null
        switch(global.language){
            case 1: {
                succ = "Successo"
                break
            }
            case 2: {
                succ = "Success"
                break
            }
            case 3: {
                succ = "Exito"
                break
            }
        }
        return notification == succ
    },

    resources:{
        //return true se la risorsa è stata creata con successo, false se non è stata creata e null se qualche passo intermedio non è andato a buon fine
        addLocalBrowser : async function (resourceName, resourceUrl) {

            var done = true
            //va in risorse
            const menu = global.app.client.$("#menu-link-6");
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //clicca su add resource
            const addResource = global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a");
            
            try{
                await addResource.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //seleziona local browser
            const localBrowser = global.app.client.$("#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(4) > label");
            try{
                await localBrowser.click();
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //inserisce il nome 
            const text = global.app.client.$("#add-connection-name");
            try{
                text.click();
                await text.setValue(resourceName);
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //inserisce l'url
            const url = global.app.client.$("#add-connection-server");
            try{
                url.click();
                await url.setValue(resourceUrl);
            }catch{
                done = false
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
            if(done){
                return ret != null
            }else{
                return null
            }
        },


        //return true se la risorsa è stata eliminata, false altrimenti, null se ci sono stati problemi 
        deleteResource: async function(name){
            var done = true
            //va in risorse
            const menu = global.app.client.$("#menu-link-6");
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(500)


            var del = null
            const length = await db.getResourceListLength();
            var n = null;
            var index = -1
            for(i = 0; i < length; i++){
                const base = "#connection"+i+" > div > div.connection-item-properties > div";
                try{
                    n = await global.app.client.$(base + " > div").getText();
                }catch{
                    done = false
                } 
                if(n == "agile_local " + name || n == "agile_remote " + name){
                    index = i
                }
            }


            await utils.sleep(500)


            try{
                await global.app.client.$("#connection"+index+" > div > div.block-item-delete > i").click()
            }catch{
                done = false
            }

            await utils.sleep(500)


            try{
                del = await global.app.client.$("#connection"+index+" > div.connection-modal > div.connection-footer > a:nth-child(2)").click()
            }catch{
                done = false
            }
            if(done){
                return del != null
            }else{
                return null
            }
        },

        //ritorna true se l'elemento cercato è nella lista, altrimenti false, null se ci sono errori
        //param type: citrix => 1, Microsoft => 2, VMware => 3, Local Browser => 4, Local Application => 5
        isInAgileList: async function(type, name, info){
            var done = true
            //va in risorse
            const menu = global.app.client.$("#menu-link-6");
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            const length = await db.getResourceListLength();
            var found = false;
            var n = null;
            var u = null;
            
            for(i = 0; i < length; i++){
                const base = "#connection"+i+" > div > div.connection-item-properties > div";
                //prendo le informazioni dell'elemento
                try{
                    n = await global.app.client.$(base + " > div").getText();
                    u = await global.app.client.$(base + " > p > span").getText();
                }catch{
                    done = false
                } 
                //controllo se elemento trovato e cercato corrispondono 
                switch(type){
                    case 1:{
                        if(n == "agile_remote " + name && u == "subdirectory_arrow_right" + info){
                            found = true 
                        }
                        break
                    }
                    case 2:{
                        //TODO
                        break
                    }
                    case 3:{
                        //TODO
                        break
                    }
                    //Local Browser
                    case 4:{
                        if(n == "agile_local " + name && u == "subdirectory_arrow_right" + info){
                            found = true 
                        }
                        break
                    }
                    //Local Application 
                    case 5:{
                        if(n == "agile_local " + name && u == "insert_drive_file" + info + ".exe"){
                            found = true
                        }
                        break
                    }
                    default:{
                        done = false
                        break
                    }
                }
            }

            if(done){
                return found
            }else{
                return null
            }
        },

        //param resourceName: nome da assegnare alla risorsa, resourceInfo: nome della risorsa da aggiungere
        //ritorna true se la creazione è stata confermata, false altrimenti, null se ci sono stati errori
        addLocalApplication: async function(resourceName, resourceInfo){
            var done = true
            //va in risorse
            const menu = global.app.client.$("#menu-link-6");
            var click = null;
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //clicca su add resource
            const addResource = global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a");
            try{
                await addResource.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //seleziona local app
            const localApp = global.app.client.$("#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(5) > label");
            try{
                await localApp.click();
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //clicca in file
            const file = global.app.client.$("#add-connection-modal > div > div.modal-content > div > div > div.row:nth-child(4) > div > div > div > div.waves-effect.btn > span")
            try{
                await file.click()
            }catch{
                done = false
            }

            await utils.sleep(1000)


            //inserisce il nome del file nel file picker (deve trovarsi nella stessa directory dell'app aperta)
            //attenzione, se non c'è nessun file corretto le azioni successive ritorneranno errore e quindi la funzione ritornerà null
            try{
                await robot.typeString(resourceInfo)
    
                await utils.sleep(500)
    
                //preme invio per confermare
                robot.keyTap("enter")
            }catch{
                done = false
            }

            await utils.sleep(1000)


            //inserisce il nome 
            try{
                await global.app.client.$("#add-connection-name").setValue(resourceName)
            }catch{
                done = false
            }


            await utils.sleep(500)


            //preme su ok per confermare
            try{
                click = await global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)").click()
            }catch(err){
                click = null
            }

            if(done){
                if(click != null){
                    return true
                }else{
                    return false
                }
            }else{
                return null
            }

        },
        //return true se ha aggiunto la risorsa, altrimenti false, null se ci sono errori
        addCitrix: async function(name, server, domain){
            var done = true
            //va in risorse
            const menu = global.app.client.$("#menu-link-6");
            var click = null;
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //clicca su add resource
            const addResource = global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a");
            try{
                await addResource.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //seleziona citrix
            const citrix = global.app.client.$("#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(1) > label");
            try{
                await citrix.click();
            }catch{
                done = false
            }


            await utils.sleep(500)


            //inserisce il nome 
            try{
                await global.app.client.$("#add-connection-name").setValue(name)
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //inserisce il server 
            try{
                await global.app.client.$("#add-connection-server").setValue(server)
            }catch{
                done = false
            }

            await utils.sleep(1000)

            
            //inserisce il domain 
            try{
                await global.app.client.$("#add-connection-domain").setValue(domain)
            }catch{
                done = false
            }

            await utils.sleep(1000)


            //preme su ok per confermare
            try{
                click = await global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)").click()
            }catch{
                click = null
            }

            if(done){
                if(click != null){
                    return true
                }else{
                    return false
                }
            }else{
                return null
            }            

        }

    },
    
    networkSettings:{
        //ritorna true se c'è una wifi disponibile con l'ssid dato, altrimenti false, null se qualcosa non ha funzionato
        checkSsid : async function (ssid) {
            var done = true
            //Va nella sezione impostazioni di rete
            const menu = global.app.client.$('#menu-link-2');
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //Va nella sezione wifi
            const wifi = global.app.client.$("#ab > a");
            try{
                await wifi.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //Clicca su aggiungi rete wifi
            const add = global.app.client.$("#wifiTab > div > div > div.header-inputs > a");
            try{
                await add.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //apre la lista delle reti disponibili
            const button = global.app.client.$("#wifi");
            try{
                await button.click();
            }catch{
                done = false
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

            if(done){
                return ret != null
            }else{
                return null
            }
        },


        //ritorna true se ha confermato la wifi, false se la password non è corretta o la rete non è presente nell'elenco, null se qualcosa non ha funzionato
        saveWifi: async function (ssid, psw){
            var done = true
            await utils.networkSettings.checkSsid(ssid)

            //inserisce la password
            const password = global.app.client.$("#add-connection-modal > div > div.modal-content > div > div > div.row:nth-child(4) > div > div > input");
            try{
                password.click();
                await password.setValue(psw);
            }catch{
                done = false
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
            if(done){
                return click != null
            }else{
                return null
            }
        }
    },

    deviceLock:{
        //ritorna true se ha creato la regola, altrimenti false, null se qualcosa non ha funzionato
        addRule: async function (vid, pid){
            var done = true
            const menu = global.app.client.$('#menu-link-11');
            var click = null;
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1500);
            

            const addRule = global.app.client.$("#main-div > div.main-content > main > section > div.fixed-header > div > div > a");
            try{
                await addRule.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)
            

            var v = global.app.client.$("#vid");
            try{
                v.click();
                await v.setValue(vid);
            }catch{
                done = false
            }


            await utils.sleep(1000)


            v = global.app.client.$("#pid");
            try{
                v.click();
                await v.setValue(pid);
            }catch{
                done = false
            }


            await utils.sleep(1000)


            const ok = global.app.client.$("#add-usb-rule-modal > div > div.modal-footer > div > a:nth-child(1)")
            try{
                click = await ok.click()
            }catch{
                click = null;
            }
            if(done){
                return click != null
            }else{
                return null
            }
        },
        //ritorna true se ha eliminato con successo, altrimenti false, null se ci sono errori
        deleteRule: async function(vid, pid){
            var done = true
            //va in impostazioi
            const menu = global.app.client.$('#menu-link-11');
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();
            

            await utils.sleep(500)


            const length = await db.getDeviceLockListLength()

            await utils.sleep(500)
            var click = null
            var base = null
            var vidPid = null
            var index = null
            for(i=1; i<=length;i++){
                base = "#main-div > div.main-content > main > section > div.section-wrapper > div.usbredir-list > div > div:nth-child("+i+") > div"
                try{
                    vidPid = await global.app.client.$(base + " > div.usbredir-item-properties > div > div").getText()
                }catch{
                    done = false
                }
                if(vid != null && pid != null && vidPid == "Vid: "+vid+", Pid: "+pid){
                    index = i
                }else if((vid == null || vid == "") && pid != null && vidPid == "Pid: "+pid){
                    index = i
                }else if(vid != null && (pid == null || pid == "") && vidPid == "Vid: "+vid){
                    index = i
                }
                
            }
            if(index != null){
                try{
                    click = await global.app.client.$("#main-div > div.main-content > main > section > div.section-wrapper > div.usbredir-list > div > div:nth-child("+index+") > div > div.usbredir-item-delete > i").click()
                }catch(err){
                    done = false
                }
            }
            
            if(done){
                return click != null
            }else{
                return null
            }

        },

        //ritorna true se l'elemento è nella lista, false altrimenti, null in caso di errori
        isInAgileList: async function(vid, pid){
            var done = true
            //apre device lock menu
            const menu = global.app.client.$('#menu-link-11');
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1500);


            const length = await db.getDeviceLockListLength();
            const base = "#main-div > div.main-content > main > section > div.section-wrapper.with-header.scrollable > div > div"
            var found = false;
            var vidPid = null;
            for(i = 1; i <= length; i++){
                try{
                    vidPid = await global.app.client.$(base + " > div:nth-child("+i+") > div > div.usbredir-item-properties > div > div").getText();
                }catch{
                    done = false
                }
                if(vid != null && pid != null && vidPid == "Vid: "+vid+", Pid: "+pid){
                    found = true
                }else if((vid == null || vid == "") && pid != null && vidPid == "Pid: "+pid){
                    found = true
                }else if(vid != null && (pid == null || pid == "") && vidPid == "Vid: "+vid){
                    found = true
                } 
            }
            if(done){
                return found
            }else{
                return null
            }

        }
    },

    thinmanSettings: {
        //ritorna false se non ha potuto confermare, altrimenti true, null se qualcosa non ha funzionato
        addAddress: async function(address, port, timeout){
            var done = true
            //va in thinman settings
            const menu = global.app.client.$('#menu-link-3');
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();
        
        
            await utils.sleep(1000)
        
        
            //preme su add address
            const add = global.app.client.$('h5 > a');
            try{
                await add.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();
        
        
            await utils.sleep(1000)
        
        
            //inserisce l'hostname
            const hostname = global.app.client.$("#new-address");
            try{
                hostname.click();
                await hostname.setValue(address);
            }catch{
                done = false
            }
        
        
            await utils.sleep(1000)
        
        
            //inserisce la porta
            const p = global.app.client.$("#new-port");
            
            try{
                p.click();
                
                if(port == ""){
                    //cancellazione manuale, con clearElement non funziona in questo caso
                    await new Promise(function (resolve, reject){
                        p.getValue().then(function(result){
                            for(i=0;i<result.length;i++){	
                                global.app.client.keys("Backspace");	
                            }
                            resolve(true)
                        })
                    }) 
                }else{
                    await p.setValue(port)
                }
            }catch{
                done = false
            }
        
        
            await utils.sleep(1000)
        
        
            //inserisce il timeout
            const t = global.app.client.$("#new-timeout");
        
            try{
                t.click()
                const val = timeout.toString()
                await new Promise(function (resolve, reject){
                    t.getValue().then(function(result){
                        //cancella il valore predefinito
                        for(i=0;i<result.length;i++){	
                            global.app.client.keys("Backspace");	
                        }
                        //inserisce manualmente il valore da settare
                        for(i=0;i<val.length;i++){
                            global.app.client.keys(val[i])
                        }
                        resolve(true)
                    })
                })                    
            }catch{
                done = false
            }

        
            await utils.sleep(1000)
        
        
            const confirm = global.app.client.$("#main-div > div.main-content > main > section > div > div > div.modal-footer > div.buttons > a:nth-child(1)");
            var ret = null;
            try{
                ret = await confirm.click();
            }catch{
                ret = null
            }
            if(done){
                return ret != null
            }else{
                return null
            }
        },


        //return true se ha premuto sul bottone elimina, altrimenti false, null se qualcosa non ha funzionato
        deleteAddress: async function(address){
            var done = true
            //va in thinman settings
            const menu = global.app.client.$('#menu-link-3');
            try{
                await menu.click();
            }catch{
                done = false
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
                    done = false
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
            if(done){
                return elim != null
            }else{
                return null
            }
        },


        //return true se non l'address con l'hostname dato è nella lista, altrimenti false, null se qualcosa non ha funzionato
        isInAgileList: async function(address){
            var done = true
            //va in thinman settings
            const menu = global.app.client.$('#menu-link-3');
            try{
                await menu.click();
            }catch{
                done = false
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
                    done = false
                }
                if(x == "<div><b>"+indirizzo+":</b> "+ address +"</div>"){
                    //aggiorno found
                    found = true;
                }
            }
            if(done){
                return found
            }else{
                return null
            }
            
        }
    },

    usbRedirection: {
        //return true se ha confermato la creazione della regola, false altrimenti, null se qualcosa non ha funzionato 
        addRule: async function(description, vid, pid){
            var done = true
            //Apre menù USB Redirection
            const menu = global.app.client.$('#menu-link-10');
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //clicca add redirection rule
            const button = global.app.client.$('#citrix > div > div > div > a');
            try{
                await button.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //inserisce descrizione 
            const d = global.app.client.$("#description");
            try{
                d.click();
                await d.setValue(description);
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //inserisce il vid
            if(vid != null){
                const v = global.app.client.$("#vid");
                try{
                    v.click();
                    await v.setValue(vid);
                }catch{
                    done = false
                }
            }
            

            await utils.sleep(1000)


            //inserisce il pid

            if(pid != null){
                const p = global.app.client.$("#pid");
                try{
                    p.click();
                    await p.setValue(pid);
                }catch{
                    done = false
                }
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
            if(done){
                return click != null
            }else{
                return null
            }
        },

        //return true se ha eliminato la regola, false altrimenti, null se ci sono stati errori 
        deleteRule: async function(vid, pid){
            var done = true
            //Apre menù USB Redirection
            const menu = global.app.client.$('#menu-link-10');
            var click = null;
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            const length = await db.getUSBRedirectionListLength()
            var base = null
            var vidPid = null
            var index = null
            for(i=1; i<=length;i++){
                base = "#citrix > div > div.usbredir-list > div > div:nth-child("+i+") > div"
                try{
                    vidPid = await global.app.client.$(base + " > div.usbredir-item-properties > div > p").getText()
                }catch{
                    done = false
                }
                if(vid != null && pid != null && vidPid == "Vid: "+vid+", Pid: "+pid){
                    index = i
                }else if((vid == null || vid == "") && pid != null && vidPid == "Pid: "+pid){
                    index = i
                }else if(vid != null && (pid == null || pid == "") && vidPid == "Vid: "+vid){
                    index = i
                }
                
            }
            if(index != null){
                try{
                    click = await global.app.client.$("#citrix > div > div.usbredir-list > div > div:nth-child("+index+") > div > div.usbredir-item-delete > i").click()
                }catch(err){
                    done = false
                }
            }
            
            if(done){
                return click != null
            }else{
                return null
            }

        },

        //return true se ha trovato la rule nella lista di agile, altrimenti false, null se ci sono errori
        findRule: async function(vid, pid){
            var done = true
            //apre menu usb redirection
            const menu = global.app.client.$('#menu-link-10');
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(500)


            //numero di address agile 
            const length = await db.getUSBRedirectionListLength();

            //indica se ho trovato un'address con quell'hostname
            var found = false;
            var vidPid = null;

            for(i = 1; i <= length; i++){
                try{
                    vidPid = await global.app.client.$("#citrix > div > div.usbredir-list > div > div:nth-child("+i+") > div > div.usbredir-item-properties > div > p > span").getText();
                }catch{
                    done = false
                }
                if(vid != null && pid != null && vidPid == "Vid: "+vid+", Pid: "+pid){
                    found = true
                }else if((vid == null || vid == "") && pid != null && vidPid == "Pid: "+pid){
                    found = true
                }else if(vid != null && (pid == null || pid == "") && vidPid == "Vid: "+vid){
                    found = true
                }
            }

            if(done){
                return found
            }else{
                return null
            }
        }
    },

    startup: {
        //ritorna true se ha creato la startup, altrimenti false, null se qualcosa non ha funzionato
        addStartup: async function(name, command){
            var done = true
            //va in startup
            const menu = global.app.client.$('#menu-link-7');
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //preme su Add startup
            const button = global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a")
            try{
                await button.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //inserisce nome 
            const n = global.app.client.$("#name");
            try{
                n.click();
                await n.setValue(name);
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //inserisce comando 
            const c = global.app.client.$("#command");
            try{
                c.click();
                await c.setValue(command);
            }catch{
                done = false
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

            if(done){
                return ret != null
            }else{
                return null
            }
        }
    },
    
    remoteAssistance: {
        //ritorna true se remote assistance è enabled, altrimenti false. ritorna null se qualcosa non ha funzionato 
        enableRemoteAssistance: async function(){
            var done = true
            //va nella sezione remote assistance
            const menu = global.app.client.$('#menu-link-4');
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)

            var checkbox = null
            try{
                checkbox = global.app.client.$("#enable-remote-assistance")
            }catch{
                done = false
            }
            var val = null
            var isEnable = false
            try{
                val = await checkbox.getValue()
            }catch{
                done = false
            }
            // await utils.sleep(200)
            if(val == "false"){
                const label = global.app.client.$("#main-div > div.main-content > main > section > div > div.row > div > label")
                try{
                    await label.click()
                    isEnable = true
                }catch{
                    done = false
                }
            }else if(val == "true"){
                isEnable = true
            }
            
            if(done){
                return isEnable
            }else{
                return null
            }
        },


        //input: valore da inserire
        //output: true se enable remote assistance e require user authorization sono spuntate e auto-accept after ... seconds ha il valore corretto, altrimenti false, null se qualcosa non ha funzionato
        setAutoAccept: async function(v){
            var done = true
            await utils.remoteAssistance.enableRemoteAssistance()
            await utils.sleep(500)
            var checkbox = global.app.client.$("#allow-reject")
            var val = null
            try{
                val = await checkbox.getValue()
            }catch{
                done = false
            }
            if(val == "false"){
                const label = global.app.client.$("#main-div > div.main-content > main > section > div > div.row:nth-child(2) > div > div.row:nth-child(2) > div > div > label")
                try{
                    await label.click()
                }catch{
                    done = false
                }
            }
            await utils.sleep(500)
            var isEnable = false
            val = null
            checkbox = global.app.client.$("#check-auto-accept")
            try{
                val = await checkbox.getValue()
            }catch{
                done = false
            }
            if(val == "false"){
                const label = global.app.client.$("#main-div > div.main-content > main > section > div > div.row:nth-child(2) > div > div.row:nth-child(2) > div > div.col > div > label")
                try{
                    await label.click()
                    isEnable = true
                }catch{
                    done = false
                }
            }else if (val == "true"){
                isEnable = true
            }
            await utils.sleep(500)
            const time = global.app.client.$("#auto-accept")
            if(isEnable){
                try{
                    time.click()
                    const val = v.toString()
                    await new Promise(function (resolve, reject){
                        time.getValue().then(function(result){
                            //cancella il valore predefinito
                            for(i=0;i<result.length;i++){	
                                global.app.client.keys("Backspace");	
                            }
                            //inserisce manualmente il valore da settare
                            for(i=0;i<val.length;i++){
                                global.app.client.keys(val[i])
                            }
                            resolve(true)
                        })
                    })                    
                }catch{
                    done = false
                }
            }


            await utils.sleep(1000)
            
            
            //preme sul menù per confermare 
            const menu = global.app.client.$('#menu-link-4');
            try{
                await menu.click();
            }catch{
                done = false
            }

            await utils.sleep(500)

            const radb = await db.getRemoteAssistance()
            if(done){
                return (radb.enabled && radb.acceptance.allow_reject && radb.acceptance.auto_accept == v)
            }else{
                return null
            }
            
        }
    },
    
    agileAuthentication: {
        //input: 
            //ssid: ssid della wifi da scegliere
        //output: 
            //true se l'ssid è corretto, altrimenti false, null se qualcosa non ha funzionato
        checkWifiAuthenticationSsid: async function(ssid){
            var done = true
            //va nella sezione agile authentication
            const menu = global.app.client.$('#menu-link-12');
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            const dropdown = global.app.client.$("#main-div > div.main-content > main > section > div > div > div.input-field > div > input")
            var dataActivates = null
            try{
                dropdown.click()
                dataActivates = await dropdown.getAttribute("data-activates")
            }catch{
                done = false
            }


            await utils.sleep(500)


            const wifi = global.app.client.$("#"+dataActivates+" > li:nth-child(2)")
            try{
                wifi.click()
            }catch{
                done = false
            }

            await utils.sleep(500)


            try{
                global.app.client.$("#wifi").click()
            }catch{
                done = false
            }


            await utils.sleep(500)


            var ret = null
            try{
                ret = await global.app.client.$("span.network-ssid=" + ssid).click();
            }catch{
                ret = null
            }
            if(done){
                return ret != null
            }else{
                return null
            }
        },

        //input: 
            //ssid: ssid della wifi da scegliere
            //password: password della wifi da scegliere
        //output: 
            //true se tutto è andato a buon fine, altrimenti false
        addWifiAuthentication: async function(ssid, password){
            var done = true
            var classe = null

            await this.checkWifiAuthenticationSsid(ssid)

            await utils.sleep(500)

            const auth = global.app.client.$("#main-div > div > main > section > div > ul > li > div.collapsible-body > div.row:nth-child(2) > div > div > input")
            var dataActivates = null
            try{
                auth.click()
                dataActivates = await auth.getAttribute("data-activates")
            }catch{
                done = false
            }


            await utils.sleep(500)


            try{
                global.app.client.$("#"+dataActivates+" > li:nth-child(4)").click()
            }catch{
                done = false
            }


            await utils.sleep(500)


            const base = "#main-div > div > main > section > div > ul > li > div.collapsible-body > div.row:nth-child(4) > div > div"
            const psw = global.app.client.$(base+" > input")

            try{
                psw.click()
                await psw.setValue(password)
            }catch{
                done = false
            }


            await utils.sleep(500)


            //clicca altrove per confermare 
            try{
                global.app.client.$('#menu-link-12').click()
            }catch{
                done = false
            }


            await utils.sleep(500)


            try{
                classe = await global.app.client.$(base).getAttribute("class")
            }catch{
                done = false
            }

            if(done){
                return classe == "password-element"
            }else{
                return null
            }   
        }
    }
    
}

module.exports = {utils}