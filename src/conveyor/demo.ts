import type { DemoStep } from '../state/demoTypes'
export const conveyorDemoSteps: DemoStep[] = [
 { title: 'Three feedback points. One customer challenge.', body: 'The motor encoder reads the drive, the shaft encoder reads the roller, and the measuring wheel reads the belt itself. Each answers a different question.', view:'overview', duration:6 },
 { title: 'Start at 30 RPM', body: 'The drive accelerates at 30 RPM/s. Both equal-radius rollers, the belt, and the packages follow the same motion state. Effective roller radius: 0.160 m.', view:'overview', duration:6 },
 { title: 'Increase to 90 RPM', body: 'Belt speed follows v = 2π × radius × RPM / 60. More shaft rotation per second produces a higher pulse frequency.', view:'overview', duration:6 },
 { title: 'Measure at the point that matters', body: 'Locate the selected Kübler encoder. Motor feedback supports the drive loop; shaft feedback follows the roller; a measuring wheel follows actual surface travel.', view:'overview', duration:6, selected:true },
 { title: 'A stationary housing. A rotating measurement.', body: 'The housing is fixed to its mounting bracket. Its shaft turns with the measured motion. At the belt, spring preload keeps the measuring wheel in contact with the surface.', view:'sensor', duration:6, selected:true },
 { title: 'Read rotation as pulses', body: 'Switch between Measurements, Graphic and Raw data beside the machine. The differential interface shows A, inverted A, B and inverted B. Counts follow the selected encoder.', view:'sensor', duration:6, selected:true },
 { title: 'Reverse through zero', body: 'The drive first decelerates to zero, then accelerates in reverse. Watch the shaft, signed counts, and belt change direction together.', view:'sensor', duration:6, selected:true },
 { title: 'Direction comes from phase order', body: 'A and B are shifted by a quarter cycle. Complementary outputs invert each channel. Compare the schematic waveform with the sampled logic states using the display tabs.', view:'sensor', duration:6, selected:true },
 { title: 'Return to the complete machine', body: 'The conveyor decelerates to rest. Relative position remains tracked until reset; an incremental encoder does not retain absolute position through power loss.', view:'overview', duration:6 },
]
export const CONVEYOR_DEMO_DURATION = conveyorDemoSteps.reduce((sum, step) => sum + step.duration!, 0)
