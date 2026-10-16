import { ConveyorReadouts } from '../conveyor/Readouts'
import type { ConveyorSnapshot } from '../conveyor/controller'
import { Activity, Info } from 'lucide-react'
import type { ApplicationConfig } from '../config/applications'
export function SensorReadouts({ app, conveyor }: { app: ApplicationConfig; conveyor?:ConveyorSnapshot }) {
 if(conveyor) return <ConveyorReadouts snapshot={conveyor}/>
 return <section className="readout"><div className="panel-label"><Activity size={14}/> {app.machine==='carousel'?'TRANSMISSION':'SENSOR READOUT'}</div><div className="readout-value"><span>—</span><small>{app.unit}</small><b>AWAITING SIMULATION</b></div><div className="readout-caption">{app.measurement}</div><p><Info size={13}/> Live data will be connected to the engineered machine state. No simulated readings in this foundation.</p></section>
}
