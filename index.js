/* global ngapp, xelib, registerPatcher, patcherUrl */
// patcher for Mortal enemies

registerPatcher({
    info: info,
    gameModes: [xelib.gmSSE, xelib.gmTES5],
    settings: {
        label: "Mortal Enemiez Patcher",
        hide: false,
		templateUrl: `${patcherUrl}/partials/settings.html`,
        defaultSettings: {
            patchFileName: 'mortal_enemiez_patch.esp',
			attackCommitment: "0"
        }
    },
    requiredFiles: [],
    getFilesToPatch: function(filenames) {
        
		return filenames;
    },
    execute: (patchFile, helpers, settings, locals) => ({
        initialize: function() {
            
			
			helpers.logMessage('Mod: Mortal Enemiez Patcher');
			helpers.logMessage('Version: 0.0.2');
			helpers.logMessage('Author: holaholacocacola');
			
			let attackConfig = require(patcherPath + '\\data\\attacks.json');
			let moveTypeConfig = require(patcherPath + '\\data\\move_types.json');
			
			locals.races = attackConfig["classifications"];
			locals.raceAttackData = attackConfig["attackData"];
			locals.raceCache = {}; // lets cache matches to not look up twice
			locals.commitmentData = null;
			//load commitmentData if applicable
			
			if (settings.attackCommitment != "0") {
				//helpers.logMessage("Loading commitment Data")
				locals.commitmentData = require(patcherPath + '\\data\\move_types.json');
				/* Load rival remix settings.
				Rival remix adds a +15 offset to Rotate in place walk, run, while moving for the attacking movetypes
				*/
				
				if (settings.attackCommitment == "2") {
					let attacksToModify = ["NPC_Attacking_MT", "NPC_PowerAttacking_MT", "NPC_Attacking2H_MT"];
					
					for ( moveType of attacksToModify) {
						locals.commitmentData[moveType]["Rotate in Place Walk"] += 15.00000;
						locals.commitmentData[moveType]["Rotate in Place Run"] += 15.00000 ;
						locals.commitmentData[moveType]["Rotate while Moving Run"] += 15.00000 ;
					}
					// This one adds 25 instead of 15. Oversight????
					locals.commitmentData["NPC_PowerAttacking_MT"]["Rotate while Moving Run"] = 45.00000;
				}
			}
        },
        process: [{
			// update move type
            load: {
                signature: 'MOVT',
                filter: function(record) {
					
					if (locals.commitmentData == null) { // I know the look on your face right now. Just know I write this with maximum shame :).
						return false;
					}
					let recordId = xelib.GetValue(record, 'EDID');
					
					return recordId in locals.commitmentData;
                }
            },
            patch: function (record) {
                
                let recordId = xelib.GetValue(record, 'EDID');
                helpers.logMessage(recordId + ': updating movt');
				for (moveType in locals.commitmentData[recordId]) {
					helpers.logMessage(moveType);
					xelib.SetFloatValue(record, `SPED\\${moveType}`, locals.commitmentData[recordId][moveType]);
				}
            }
        },
		{
			/*
				Try and match races by editor id, or full name
			*/
            load: {
                signature: 'RACE',
                filter: function(record) {
					let recordId = xelib.GetValue(record, 'EDID');
					//helpers.logMessage("record id is: " + recordId);
                    // First try and do a race match for vanilla. If that fails, try and do a match based on raceName likeness
					
					if (recordId in locals.races) {
						helpers.logMessage( recordId + " has vanilla entry");
						locals.raceCache[recordId] = recordId;
						return true;
					}
					
					if (xelib.HasElement(record, 'FULL')) {
						let raceName = xelib.FullName(record);
						let hasMatch = false;
						for (var key in locals.races) {
							let validSubRaces = locals.races[key];
							if (validSubRaces.includes(raceName)) {
								locals.raceCache[recordId] = key;
								return true;
							}
						}				
					}
					
				    return false;
                }
            },
            patch: function (record) {
                
                let recordId = xelib.GetValue(record, 'EDID');
				helpers.logMessage("Processing attack data for " + recordId);
				let raceAttackData = locals.raceAttackData[locals.raceCache[recordId]];
				xelib.SetFloatValue(record, 'DATA\\Angular Acceleration Rate', raceAttackData["Angular Acceleration"]);
				xelib.SetFloatValue(record, 'DATA\\Unarmed Reach', raceAttackData["Unarmed Reach"]);
				xelib.SetFloatValue(record, 'DATA\\Aim Angle Tolerance', raceAttackData["Angle Tolerance"]);
				
				if (!xelib.HasElement(record, "Attacks") || Object.keys(raceAttackData["Attacks"]).length == 0) {
					helpers.logMessage(recordId + " has no attack data");
					return;
				}
				let attacks = xelib.GetElements(record, 'Attacks');
				attacks.forEach(attack => {
					
					let attackName = xelib.GetValue(attack, 'ATKE');
					helpers.logMessage("Attack name is: " + attackName);
					if ( attackName in raceAttackData["Attacks"]) {
					//	helpers.logMessage("Matched attack: " + attackName);
						xelib.SetFloatValue(attack, 'ATKD\\Strike Angle', raceAttackData["Attacks"][attackName]["Strike Angle"]);
						if ("Attack Angle" in raceAttackData["Attacks"][attackName]) {
							xelib.SetFloatValue(attack, 'ATKD\\Attack Angle', raceAttackData["Attacks"][attackName]["Attack Angle"]);
						}
					}
				});     
            }
        }],
        finalize: function() {
			//what more do you want??
        }
    })
});