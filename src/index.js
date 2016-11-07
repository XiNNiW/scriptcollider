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
SuperColliderSynthFactory = require('./super-collider-synth-factory');
scServer = SuperColliderServer.instance();

console.log(JSON.stringify(scServer.connectionProperties));
//console.log(scServer.childProcess);


setTimeout(()=>{
  //scServer.loadSynthDef("synthdefs/snare909");
  let factory = SuperColliderSynthFactory.instance();
  let snare909;
  factory.create('snare909','synthdefs',{id:0},0).then(()=>{
    snare909.play(0,1);
  });
  //scServer.quit();
},2500);



// beforeSong(()=>{
//   //initialize instruments for song..
//   //initialize mixer... plug in instruments
// });
//
// section("intro",()=>{
//   // main patterns
//   beforePlay(()=>{
//     //initialize instruments..
//     // mixer
//   });
//   liveLoop("percussion",()=>{
//     //some patterns
//   });
//   liveLoop("resampling",()=>{
//     //more patterns
//   });
//   liveLoop("melody",()=>{
//     //a melody
//   });
// }, {bars:64,beats:48.5,ticks:24});
//
// section("transition in",()=>{
//   beforePlay(()=>{
//     //initialize instruments..
//     // mixer
//   });
//   liveLoop("percussion",()=>{
//     //some patterns
//   });
//   liveLoop("resampling",()=>{
//     //more patterns
//   });
//   liveLoop("melody",()=>{
//     //a melody
//   });
// },{bars:64,beats:48.5,ticks:24});
