import { CarouselControls } from '../carousel/Controls'
import type { CarouselInspectAction } from '../carousel/Controls'
import type { CarouselBinding } from '../carousel/useCarousel'
import { CraneControls } from '../crane/Controls'
import type { CraneBinding } from '../crane/useCrane'
import { ConveyorControls } from '../conveyor/Controls'
import type { ConveyorBinding } from '../conveyor/Controls'
import { Grid2X2, Box, Wrench } from 'lucide-react'
export function MachineControls({ grid, setGrid, conveyor, crane, carousel, onCarouselInspect }: { grid: boolean; setGrid: (value: boolean)=>void; conveyor?:ConveyorBinding;crane?:CraneBinding;carousel?:CarouselBinding;onCarouselInspect?:(action:CarouselInspectAction)=>void }) {
 return <div className={`machine-controls ${conveyor||crane||carousel?'operating-controls':''}`}>{carousel?<CarouselControls {...carousel} onInspect={onCarouselInspect!}/>:crane?<CraneControls {...crane}/>:conveyor?<ConveyorControls {...conveyor}/>:<div className="machine-stage"><Wrench size={16}/><span>Machine operation<small>Available after engineering implementation</small></span></div>}<div className="inspection-controls"><span><Box size={13}/> {conveyor?'SIMULATION / SI UNITS':'CONCEPT BLOCKOUT'}</span><button aria-pressed={grid} onClick={()=>setGrid(!grid)} title="Toggle the reference floor grid"><Grid2X2 size={16}/> Grid</button></div></div>
}
