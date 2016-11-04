//
// let exec = require('child_process').exec;
// //let spawn = require('child_process').spawn;
// let fs = require('fs');
//
// let getInstallationPaths = function(){
//   let macOsSupercolliderInstallationPaths = {
//     locations:{
//       scsynth:[
//         "/Applications/SuperCollider/scsynth",
//         "/Applications/SuperCollider.app/Contents/Resources/scsynth",
//         "/Applications/SuperCollider/SuperCollider.app/Contents/Resources/scsynth",
//         "/Applications/SuperCollider/SuperCollider.app/Contents/MacOS/scsynth"
//       ],
//       ugens:[
//         "~/Library/Application Support/SuperCollider/Extensions/SC3plugins",
//         "/Library/Application Support/SuperCollider/Extensions/SC3plugins",
//         "/Applications/SuperCollider/plugins",
//         "/Applications/SuperCollider.app/Contents/Resources/plugins",
//         "/Applications/SuperCollider/SuperCollider.app/Contents/Resources/plugins",
//       ],
//       sclang:["SuperCollider.app/Contents/MacOS/sclang"],
//       supernova:["SuperCollider.app/Contents/Resources/supernova"]
//     }
//   };
//   return macOsSupercolliderInstallationPaths;
// };
//
//
//
// let launchSupercolliderCommandString = getInstallationPaths().locations.scsynth[3] + " " + "-u 1729";
// console.log(launchSupercolliderCommandString);
// console.log(exec(launchSupercolliderCommandString));

SuperColliderServer = require("./super-collider-server");
scServer = SuperColliderServer.create();

console.log(JSON.stringify(scServer.connectionProperties));
//console.log(scServer.childProcess);


setTimeout(()=>{
  console.log("quitting");
  scServer.quit();},2500);
