//wrongValues: parameters that should make the test fail
//rightValues: parameters that should make the test success

module.exports = {
    about: {
       
    },
    systemSettings:{
        setOutputVolume:{
            //output sound level to set (0-100)
            rightValues: [
                20,
                50,
                100
            ]
        }
    },
    networkSettings:{
        addWifi:{
            //ssid: ssid of the wifi to add
            //psw: password of the wifi to add
            wrongValues: [
                {ssid:"", psw:123455555},
                {ssid:"allagriglia", psw:123455555},
                {ssid:"bsn", psw:123455555},
                {ssid:123345, psw:123455555},
                {ssid:"PRAIM_WIFI_N", psw:1234},
                {ssid:"PRAIM_WIFI_N", psw:"asdfghj"},
                {ssid:"PRAIM_WIFI_N", psw:""}
            ],
            rightValues: [
                {ssid:"PRAIM_WIFI_N", psw:"asd123!!"}
            ]
        }
    },
    thinmanSettings:{
        //address: hostname or address of the thinman to add
        //port: port of the thinman to add (default: 443)
        //timeout: timeout (default: 15)
        addAddress:{
            wrongValues: [
                {address:"", port:123, timeout:123},
                {address:"prova", port:"", timeout:123},
                {address:"aaaaaa", port:123, timeout:""},
                {address:"sss", port:"aaa", timeout:123},
                {address:"ddd", port:"1.5", timeout:1000},
                {address:"fff", port:335, timeout:"abc"},
                {address:"1234", port:"1a1", timeout:123}
            ],
            rightValues:[
                {address:"test", port:123, timeout:123},
                {address:"sdf", port:123, timeout:3e2}
            ]
        },
        testAddress:{
            rightValues: [
                {address:"10.1.138.224", port:443, timeout:15},
                {address:"av-praim.com", port:4443, timeout:15}
            ]
        }
    },
    remoteAssistance:{
        enable:{
            //time to wait before auto-accept
            wrongValues: [
                0, 
                "abc", 
                1234567, 
                "", 
                -7, 
                2e7
            ],
            rightValues: [
                23, 
                3e2
            ]
        }
    },
    writeFilter:{

    },
    resources:{
        citrix:{
            //name: name of the resource
            //server: server of the resource
            //domain: domain of the resource
            add:{
                wrongValues: [
                    {name: "", server: "xxx.it", domain:"aa"},
                    {name: "name", server: "xxx", domain:"aaa"},
                    {name: "name", server: "", domain:""}
                ],
                rightValues: [
                    {name: "name", server: "xxx.it", domain:""}
                ]
            },
            test:{
                rightValues: [
                    {name: "rv", server: "https://xendesk715.sup.praim.com", domain:""}
                ]
            }
        },
        localApplication:{
            //name: name of the resource
            //info: name of the local application (in files/ )
            add:{
                wrongValues: [
                    {name: "any", info: "wrong"}
                ],
                rightValues: [
                    {name: "local_app", info: "app"}
                ]
            }
        },
        localBrowser:{
            //name: name of the resource
            //url: url to set to the resource
            add:{
                wrongValues: [
                    {name:"" ,url:"" },
                    {name:"prova" ,url:"" },
                    {name:"" ,url:"google.com" },
                    {name:"prova" ,url:"prova" },
                    {name:"123" ,url:"123" },
                    {name:"!!!" ,url:"google.com.i" },
                    {name:"aaa" ,url:"aaa" },
                    {name:"aaa" ,url:"google" }
                ],
                rightValues: [
                    {name:"name1" ,url:"https://www.google.com" },
                    {name:"name2" ,url:"google.com" }
                ]
            }
        },
        microsoft:{
            //name: name of the resource
            //info: name of the microsoft resource file (in files/ )
            add:{
                wrongValues: [
                    {name: "test", info: "wrong_info"}
                ],
                rightValues: [
                    {name: "microsoft", info: "microsoft_resource"}
                ]
            }
        },
        vmware:{
            //name: name of the resource
            //info: connection server
            add:{
                wrongValues: [
                    {name: "", info: "test.com"},
                    {name: "test", info: "test"},
                    {name: "test", info: ""}
                ],
                rightValues: [
                    {name: "test", info: "test.com"}
                ]
            },
            test:{
                rightValues: [
                    {name: "rv", info: "https://hview75.sup.praim.com"}
                ]
            }
        }
        
    },
    startup:{
        //name: name to assign to the startup
        //command: command of the startup
        add:{
            wrongValues: [
                {name: "", command: ""},
                {name: "aaaa", command: ""},
                {name: "", command: "aaaa"}
            ],
            rightValues: [
                {name: "startup_name", command: "command_startup"}
            ]
        }
    },
    certificateManager:{
        //name of the certificate (in files/ )
        add:{
            wrongValues: [
                "wrongName", 
                "", 
                "app_test"
            ],
            rightValues: [
                "DigiCertGlobalRootCA", 
                "DigiCertSHA2SecureServerCA"
            ]
        }
    },
    usbRedirection:{
        //description: description of the rule
        //vid: vid of the device
        //pid: pid of the device
        add:{
            wrongValues: [
                {description:"", vid:"", pid:""},
                {description:"aaaa", vid:"abc", pid:"1234"},
                {description:"qqqq", vid:"12", pid:"1234"},
                {description:"aaaaa", vid:"", pid:"1234"},
                {description:"eeee", vid:"12345", pid:"1234"},
                {description:"tt", vid:"8576", pid:"1"},
                {description:"gg", vid:"5654", pid:""},
                {description:"95744", vid:"3333", pid:"12345"},
                {description:"dhdhd", vid:"123p", pid:"2222"},
                {description:"www", vid:"1234", pid:"gggg"},
                {description:"dd", vid:"1p31", pid:"1111"}
            ],
            rightValues: [
                {description:"test", vid:"1234", pid:"5678"}
            ]
        }
    },
    deviceLock:{
        addRule:{
            //vid: vid of the device
            //pid: pid of the device
            wrongValues: [
                {vid:0, pid:0},
                {vid:1234, pid:0}, 
                {vid:1234, pid:123}, 
                {vid:1234, pid:12345}, 
                {vid:123, pid:1234}, 
                {vid:123, pid:12}, 
                {vid:12, pid:1234}, 
                {vid:"12a12", pid:1234}, 
                {vid:"", pid:1234},
                {vid:"123", pid:1234},
                {vid:"", pid:"abcd"},
                {vid:1234, pid:"qwer"},
                {vid:"aaaaaaa", pid:1234},
                {vid:"aaaa", pid:12374}
            ],
            rightValues: [
                {vid:1234, pid:1234},
                {vid:8705, pid:2640},
                {vid:"aaaa", pid:1234}
            ]
        }
    },
    agileAuthentication:{
        imprivata:{
            //url of the imprivata
            add:{
                wrongValues: [
                    "",
                    "wrong_value",
                    "aa.it.i"
                ],
                rightValues: [
                    "right-value.it"
                ]
            },
            test:{
                rightValues: [
                    "https://onesign.dev.praim.com",
                    "https://onesign6.dev.praim.com"
                ]
            }
        },
        wifi:{
            //ssid: ssid of the wifi to use
            //password: password of the wifi to use
            add:{
                wrongValues: [
                    {ssid: "aa", password: "aaaaaaaaaa"},
                    {ssid: "bb", password: "aaaaaaaaaa"},
                    {ssid: "1232", password: "aaaaaaaaaa"},
                    {ssid: "PRAIM_WIFI_N", password: ""},
                    {ssid: "PRAIM_WIFI_N", password: "1234567"}
                ],
                rightValues: [
                    {ssid: "PRAIM_WIFI_N", password: "asdfghjkksbd"}
                ]
            }
        }
    },
    mode:{

    }
}