import type { DemoStep } from '../state/demoTypes'
export const extensionDemoSteps:readonly DemoStep[]=[
 {title:'One crane, two measurements',body:'The inclinometer measures elevation. The draw-wire encoder measures telescopic displacement, independently.',view:'overview',duration:4},
 {title:'Separate nested boom sections',body:'The intermediate and final sections slide inside the base boom. Each keeps structural overlap throughout the 8 m demonstration travel.',view:'side',duration:4},
 {title:'Extend by three metres',body:'Watch the moving sections translate. The cable anchor advances with the final section, pulling wire from the fixed housing.',view:'side',duration:7},
 {title:'Follow the measuring cable',body:'The straight wire stays outside the boom wall. Its exit and anchor are real mounting points, attached at both ends.',view:'side',duration:4,selected:true},
 {title:'Find the draw-wire encoder',body:'A D125-inspired housing is bolted to the fixed boom section. This installation is a conceptual application, without an asserted order code.',view:'overview',duration:4,selected:true},
 {title:'Inspect its mounting',body:'The housing turns with the boom. A standoff bracket on the inner stage keeps the cable parallel to the telescopic motion.',view:'sensor',duration:4,selected:true},
 {title:'From cable to rotation',body:'The transparent teaching cutaway shows a constant-radius drum, return spring and coupled rotary encoder. It is simplified, not manufacturer internals.',view:'sensor',duration:6,selected:true},
 {title:'Extend farther',body:'The drum turns as more cable pays out. Rotation follows actual cable length divided by the illustrative 45 mm drum radius.',view:'sensor',duration:6,selected:true},
 {title:'Read the measured displacement',body:'Extension = current cable payout − retracted reference payout. Cable length and overall boom length are different quantities.',view:'side',duration:4,selected:true},
 {title:'Retract to the reference',body:'The return spring concept keeps the wire tensioned as the boom retracts. The drum reverses and measured extension returns to zero.',view:'side',duration:11,selected:true},
 {title:'Return to the machine',body:'The crane, its hydraulics and both sensors remain part of one shared mechanical model.',view:'overview',duration:4},
 {title:'Both sensors, together',body:'Elevation and extension now move together. Raising the boom changes the angle; telescoping changes cable displacement.',view:'overview',duration:7},
]
export const extensionDemoBoundaries=extensionDemoSteps.reduce<number[]>((a,s)=>[...a,(a.at(-1)??0)+(s.duration??4)],[0])
export const EXTENSION_DEMO_DURATION=extensionDemoBoundaries.at(-1)!
