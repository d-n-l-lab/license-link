## GET - look for already existing customer

`Request:`

curl --location 'https://inasoftsystemsgmbh.dev.sentinelcloud.com/ems/api/v5/customers?id=2d5c4d3c-b738-46ee-8020-2bacfee90f34' \
--header 'Authorization: ••••••' \
--data ''


`Response:`

{
    "customers": {
        "count": 1,
        "customer": [
            {
                "id": "2d5c4d3c-b738-46ee-8020-2bacfee90f34",
                "creationDate": "2025-09-17 11:37",
                "lastModifiedDate": "",
                "name": "TestCustomer5",
                "description": "",
                "identifier": "d5cd1b9b-0c77-49df-9c0a-80ab3859469a",
                "externalId": "",
                "refId": "",
                "crmId": "",
                "timeZoneId": "UTC",
                "state": "ENABLE",
                "marketGroup": {
                    "id": "14a7a6a8-c544-4f7d-ad32-0674872afd3a",
                    "name": "MEZTZ"
                }
            }
        ]
    }
}



## POST - Create a customer - https://inasoftsystemsgmbh.dev.sentinelcloud.com/ems/api/v5/customers

`Request:`

{
  "customer": {
    "name": "TestCustomer5",
    "state": "ENABLE",
    "marketGroup": {
      "id": "14a7a6a8-c544-4f7d-ad32-0674872afd3a",
      "name": "MEZTZ"
    }
  }
}


`Response:`

{
    "customer": {
        "id": "2d5c4d3c-b738-46ee-8020-2bacfee90f34",   `---> that's the original number`
        "creationDate": "2025-09-17 11:37",
        "lastModifiedDate": "",
        "name": "TestCustomer5",
        "description": "",
        "identifier": "d5cd1b9b-0c77-49df-9c0a-80ab3859469a",
        "externalId": "",
        "refId": "",
        "crmId": "",
        "timeZoneId": "UTC",
        "state": "ENABLE",
        "marketGroup": {
            "id": "14a7a6a8-c544-4f7d-ad32-0674872afd3a",
            "name": "MEZTZ"
        },
        "contacts": null,
        "customAttributes": null,
        "fingerprints": null
    }
}

## POST - add an entitlement / license - 

`Request: (everywhere you see a comment we need to transfer a value from memberstack - a lot of times these values need to be converted from text to hexadecimal)`

{
  "entitlement": {
    "externalId": "",
    "createdBy": "S4AWeb",
    "lastModifiedBy": "S4AWeb",
    "identifier": "",
    "entitlementAsWhole": false,
    "startDate": "2025-05-27",               `Current date in ISO format`
    "expiry": {
      "neverExpires": true,
      "endDate": "",
      "expiryInDays": ""
    },
    "customer": {
      "id": "37ec7d2a-9f9c-4f93-bacf-6e79e16255e9"    `Id of the customer`
    },
    "userRegistration": "NONE",
    "activationAllowed": true,
    "allowActivationBy": "ALL_USERS",
    "revocationAllowed": true,
    "state": "ENABLE",
    "sendNotification": false,
    "isTest": false,
    "totalRegisteredQuantity": 1,
    "productKeys": {
      "totalRegisteredQuantity": 1,
      "productKey": [
        {
          "startDate": "2025-05-27",         `Current date in ISO format`
          "expiry": {
            "neverExpires": true,
            "endDate": "",
            "expiryInDays": ""
          },
          "totalQuantity": 1,
          "availableQuantity": 1,
          "splittedQuantity": 1,
          "activationMethod": "FIXED",
          "fixedQuantity": 1,
          "extnLDK": {
            "lockingType": "HL_or_SL_AdminMode",
            "isNotLockedToDevice": false,
            "upgradeToDriverless": true,
            "vclock": true,
            "prdMemoryReferences": {
              "memoryFile": [
                {
                  "fileName": "Links",
                  "text": "31",           `Hexadecimal for number of links from`
                  "fileId": 1,
                  "fileType": "READ_ONLY",
                  "fileSize": "",
                  "segmentName": "",
                  "size": "",
                  "offset": "0",
                  "applyMemory": "OVERWRITE"
                },
                {
                  "fileName": "Vendor",
                  "text": "496E61736F66742053797374656D7320476D6248",            `Hexacdecimal of Vendor (always never changes)`
                  "fileId": 3,
                  "fileType": "READ_ONLY",
                  "fileSize": "",
                  "segmentName": "",
                  "size": "",
                  "offset": "0",
                  "applyMemory": "OVERWRITE"
                },
                {
                  "fileName": "Customer",
                  "text": "54657374437573746F6D657231",                           `Hexdecimal of Customer`
                  "fileId": 4,
                  "fileType": "READ_ONLY",
                  "fileSize": "256",
                  "segmentName": "",
                  "size": "256",
                  "offset": "0",
                  "applyMemory": "OVERWRITE"
                },
                {
                  "fileName": "LicenseDate",
                  "text": "3435383034",                                     `ParamMemoryLicenseDate from Excel`
                  "fileId": 5,
                  "fileType": "READ_ONLY",
                  "fileSize": "",
                  "segmentName": "",
                  "size": "",
                  "offset": "0",
                  "applyMemory": "OVERWRITE"
                },
                {
                  "fileName": "LicenseType",
                  "text": "4C69676874",                                   `Hexadecimal for License Type`
                  "fileId": 6,
                  "fileType": "READ_ONLY",
                  "fileSize": "",
                  "segmentName": "",
                  "size": "",
                  "offset": "0",
                  "applyMemory": "OVERWRITE"
                }
              ]
            }
          },
          "state": "ENABLE",
          "item": {
            "itemProduct": {
              "product": {
                "id": "d2a32891-7616-45e0-9cd7-9c158aed7c30"                            `Param of License`
              },
              "itemProductFeatures": {
                "itemProductFeature": [
                  {
                    "feature": {
                      "id": "1935b23b-f8db-4c8d-b69b-7fabba5b42e2"                          `Param of Feature`
                    },
                    "itemFeatureState": "INCLUDED",
                    "SAOT": false
                  }
                ]
              }
            }
          }
        }
      ]
    }
  }
}

`Respoonse:`

{
    "entitlement": {
        "externalId": "",
        "createdBy": "s4aweb",
        "creationDate": "2025-05-27 14:24",
        "lastModifiedBy": "s4aweb",
        "lastModifiedDate": "2025-05-27 14:24",
        "entitlementAsWhole": false,
        "eId": "454ddc8d-a1f6-4f6c-9bb4-a1d72053ed12",
        "id": "8268d7c1-bbad-4bc7-9375-5d1bad335da8",
        "startDate": "2025-05-27",
        "expiry": {
            "neverExpires": true
        },
        "customer": {
            "id": "37ec7d2a-9f9c-4f93-bacf-6e79e16255e9",
            "name": "TestCustomer1",
            "identifier": "1fbfbb36-b6d0-495f-997b-8617fa51f0ef",
            "externalId": ""
        },
        "contact": null,
        "entitlementPartners": null,
        "entitlementFingerprints": null,
        "userRegistration": "NONE",
        "refId1": "",
        "refId2": "",
        "activationAllowed": true,
        "allowActivationBy": "ALL_USERS",
        "revocationAllowed": true,
        "state": "ENABLE",
        "sendNotification": false,
        "ccEmail": "",
        "isTest": false,
        "marketGroup": {
            "id": "14a7a6a8-c544-4f7d-ad32-0674872afd3a",
            "name": "MEZTZ"
        },
        "customAttributes": {
            "customAttribute": [
                {
                    "name": "Order Number",
                    "value": ""
                }
            ]
        },
        "productKeys": {
            "productKey": [
                {
                    "pkId": "49d31b79-195d-4700-aa1e-c5c32ec4ff4e", `result of license key that needs to be returned to customer`
                    "creationDate": "2025-05-27 14:24",
                    "lastModifiedDate": "2025-05-27 14:24",
                    "externalId": "",
                    "startDate": "2025-05-27",
                    "expiry": {
                        "neverExpires": true
                    },
                    "id": "38a1f230-e501-438e-ac0c-10678dcefced",
                    "enforcement": {
                        "id": "b46573e9-dbff-11ee-8625-42010a2a0026",
                        "name": "Sentinel LDK",
                        "version": "10.0"
                    },
                    "totalQuantity": 1,
                    "availableQuantity": 1,
                    "splittedQuantity": 0,
                    "activationMethod": "FIXED",
                    "fixedQuantity": 1,
                    "extnLDK": {
                        "rehostState": "DISABLE",
                        "lockingType": "HL_or_SL_AdminMode",
                        "isNotLockedToDevice": "false",
                        "prdMemoryReferences": {
                            "memoryFile": [
                                {
                                    "id": "294e2692-f69c-4dd9-a9ed-7e17501a754a",
                                    "fileName": "Links",
                                    "text": "3230",
                                    "fileId": "1",
                                    "fileType": "READ_ONLY",
                                    "fileSize": "",
                                    "segmentName": "",
                                    "size": "",
                                    "offset": "0x000000",
                                    "applyMemory": "OVERWRITE",
                                    "allowTextOverwrite": "true"
                                },
                                {
                                    "id": "e41b7b4e-c265-42f3-bdfb-7c1b171a93da",
                                    "fileName": "Application",
                                    "text": "53514c346175746f6d6174696f6e",
                                    "fileId": "2",
                                    "fileType": "READ_ONLY",
                                    "fileSize": "",
                                    "segmentName": "",
                                    "size": "",
                                    "offset": "0x000000",
                                    "applyMemory": "OVERWRITE",
                                    "allowTextOverwrite": "false"
                                },
                                {
                                    "id": "70d8d413-3d04-4018-9642-cf7b905ef2f0",
                                    "fileName": "Vendor",
                                    "text": "496E61736F66742053797374656D7320476D6248",
                                    "fileId": "3",
                                    "fileType": "READ_ONLY",
                                    "fileSize": "",
                                    "segmentName": "",
                                    "size": "",
                                    "offset": "0x000000",
                                    "applyMemory": "OVERWRITE",
                                    "allowTextOverwrite": "true"
                                },
                                {
                                    "id": "b19af832-ab3a-49d4-ac46-6e306e07fd19",
                                    "fileName": "Customer",
                                    "text": "54657374437573746F6D657231",
                                    "fileId": "4",
                                    "fileType": "READ_ONLY",
                                    "fileSize": "256",
                                    "segmentName": "",
                                    "size": "256",
                                    "offset": "0x000000",
                                    "applyMemory": "OVERWRITE",
                                    "allowTextOverwrite": "true"
                                },
                                {
                                    "id": "38829fbb-e8da-4bdb-a695-6e70378e80c4",
                                    "fileName": "LicenseDate",
                                    "text": "3435383034",
                                    "fileId": "5",
                                    "fileType": "READ_ONLY",
                                    "fileSize": "",
                                    "segmentName": "",
                                    "size": "",
                                    "offset": "0x000000",
                                    "applyMemory": "OVERWRITE",
                                    "allowTextOverwrite": "true"
                                },
                                {
                                    "id": "6449b39e-6a6a-4f44-aaa3-1cef30f65bd7",
                                    "fileName": "LicenseType",
                                    "text": "4C69676874",
                                    "fileId": "6",
                                    "fileType": "READ_ONLY",
                                    "fileSize": "",
                                    "segmentName": "",
                                    "size": "",
                                    "offset": "0x000000",
                                    "applyMemory": "OVERWRITE",
                                    "allowTextOverwrite": "true"
                                },
                                {
                                    "id": "8ae203b7-71f3-49bd-8d81-a0b0eb25ca99",
                                    "fileName": "InstDate",
                                    "text": "",
                                    "fileId": "20",
                                    "fileType": "READ_WRITE",
                                    "fileSize": "20",
                                    "segmentName": "",
                                    "size": "20",
                                    "offset": "0x000000",
                                    "applyMemory": "ADD",
                                    "allowTextOverwrite": "false"
                                },
                                {
                                    "id": "ef9b1b91-167a-423d-82bb-8b514261b3b5",
                                    "fileName": "InstHost",
                                    "text": "",
                                    "fileId": "21",
                                    "fileType": "READ_WRITE",
                                    "fileSize": "128",
                                    "segmentName": "",
                                    "size": "128",
                                    "offset": "0x000000",
                                    "applyMemory": "ADD",
                                    "allowTextOverwrite": "false"
                                }
                            ]
                        },
                        "vendor": "MEZTZ"
                    },
                    "state": "ENABLE",
                    "item": {
                        "itemProduct": {
                            "product": {
                                "externalId": "",
                                "id": "d2a32891-7616-45e0-9cd7-9c158aed7c30",
                                "identifier": "29",
                                "productType": "DEFAULT",
                                "nameVersion": {
                                    "name": "SQL4automation V5 Light",
                                    "version": "1"
                                }
                            },
                            "itemProductFeatures": {
                                "itemProductFeature": [
                                    {
                                        "feature": {
                                            "externalId": "",
                                            "id": "1935b23b-f8db-4c8d-b69b-7fabba5b42e2",
                                            "identifier": 31,
                                            "nameVersion": {
                                                "name": "SQL4automation V5",
                                                "version": ""
                                            }
                                        },
                                        "itemFeatureLicenseModel": {
                                            "licenseModel": {
                                                "id": "b46659d5-dbff-11ee-8625-42010a2a0026",
                                                "name": "Perpetual"
                                            },
                                            "attributes": {
                                                "attribute": [
                                                    {
                                                        "name": "APPLY_LICENSE",
                                                        "value": "1",
                                                        "displayText": "Overwrite"
                                                    },
                                                    {
                                                        "name": "CONCURRENT_INSTANCES",
                                                        "value": ""
                                                    },
                                                    {
                                                        "name": "LIC_TYPE",
                                                        "value": "Perpetual",
                                                        "encodeToBase64": false
                                                    },
                                                    {
                                                        "name": "ALLOW_DETACHING",
                                                        "value": "FALSE"
                                                    },
                                                    {
                                                        "name": "COUNT_EACH",
                                                        "value": "0",
                                                        "displayText": "Station"
                                                    },
                                                    {
                                                        "name": "REMOTE_DESKTOP",
                                                        "value": "FALSE"
                                                    },
                                                    {
                                                        "name": "NETWORK",
                                                        "value": "FALSE"
                                                    },
                                                    {
                                                        "name": "ENABLE_CONCURRENCY",
                                                        "value": "FALSE"
                                                    },
                                                    {
                                                        "name": "VIRTUAL_MACHINE",
                                                        "value": "TRUE"
                                                    }
                                                ]
                                            }
                                        },
                                        "itemFeatureState": "INCLUDED",
                                        "SAOT": "false"
                                    }
                                ]
                            }
                        }
                    },
                    "commonLicenseAttributes": null,
                    "activationAttributes": null,
                    "customAttributes": null,
                    "productKeyFingerprints": null
                }
            ]
        },
        "entitlementAttributes": null
    }
}


## License & Feature Params

Light: d2a32891-7616-45e0-9cd7-9c158aed7c30 Feature: 1935b23b-f8db-4c8d-b69b-7fabba5b42e2 Links: 1
Standard: 42037d6e-ad53-466d-82f8-d67acef2b57e Feature: 1935b23b-f8db-4c8d-b69b-7fabba5b42e2 Links: 10
Ultimate: 386b2a16-e8d9-4d74-86ee-9e68f4e725ad Feature: 279a9cb0-aec7-48a5-8923-1697a4b126f1 Links: 10