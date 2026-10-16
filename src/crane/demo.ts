import type { DemoStep } from '../state/demoTypes'
export const craneDemoSteps:readonly DemoStep[]=[
 {title:'A crane, in working position',body:'Four deployed outriggers support a level chassis. The boom pivots on the upper structure; the hoist remains vertical.',view:'overview',duration:5},
 {title:'Elevation starts at horizontal',body:'0° means horizontal. This demonstration uses 0–75° of boom elevation, independent of telescopic extension.',view:'side',duration:5},
 {title:'Watch the boom rise',body:'The lifting cylinders extend between their mounting pins, raising the boom from 10° toward 50°.',view:'side',duration:8},
 {title:'The sensor moves with the steel',body:'The IN88 is bolted to the base boom. Its housing turns through the same angle as the boom.',view:'overview',duration:4,selected:true},
 {title:'Inspect the installation',body:'A rigid bracket, mounting bolts and an M12 cable keep the inclinometer mechanically attached to the boom.',view:'sensor',duration:5,selected:true},
 {title:'Orientation relative to gravity',body:'The horizontal line stays level as the boom moves. The live angle and the geometry share one authoritative state.',view:'sensor',duration:6,selected:true},
 {title:'Lower the boom',body:'The cylinder rods retract as elevation decreases. The camera follows the sensor while the hook remains beneath the tip.',view:'sensor',duration:8,selected:true},
 {title:'One input to machine control',body:'Boom elevation contributes to geometry and load-moment management, alongside extension, load and additional certified systems.',view:'overview',duration:5},
]
export const craneDemoBoundaries=craneDemoSteps.reduce<number[]>((a,s)=>[...a,(a.at(-1)??0)+(s.duration??5)],[0])
export const CRANE_DEMO_DURATION=craneDemoBoundaries.at(-1)!
