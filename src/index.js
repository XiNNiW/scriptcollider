let oscUtility = require('./open-sound-control/osc-utility.js');
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

SuperColliderServer = require("./super-collider/super-collider-server");
SuperColliderSynthFactory = require('./super-collider/super-collider-synth-factory');
scServer = SuperColliderServer.instance();

console.log(JSON.stringify(scServer.connectionProperties));
//console.log(scServer.childProcess);


setTimeout(()=>{

  scServer.commandMessanger.server.on("message", (buffer) => {
    let message1 = oscUtility.decode(buffer, { strict: true, strip: true });
    console.log("recieveing message from supercollider");

    if (!message1.error) {
      console.log(JSON.stringify(message1));
    }else{
      console.log(message1.error);
    }
  });

  //scServer.loadSynthDef("synthdefs/snare909");
  let factory = SuperColliderSynthFactory.instance();
  // let snare909;
  // factory.create('synthdefs/snare909',{id:0},0).then((synth)=>{
  //   snare909 = synth;
  //   console.log("playing now");
  //   snare909.play(0,1);
  // });
  // let snare909 = factory.create('snare909',"synthdefs/",{id:0},0);
  // setTimeout(()=>{
  //   snare909.play(0,1,{});
  // },1000);
  factory.create('snare909','synthdefs/',{id:0},0).then(
    (snare909)=>{
      snare909.play(0,1);
      setTimeout(()=>{
        snare909.play(0,0.5);
      },500);
    }
  ).catch(
    (err)=>{
      console.log("promise was rejected: "+err.stack)
    }
  );

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
