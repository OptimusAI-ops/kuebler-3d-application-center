import type { CameraView } from '../components/CameraControls'
/** Shared presentation contract; each machine supplies its own steps and clock. */
export interface DemoStep { title:string;body:string;view:CameraView;duration?:number;selected?:boolean }
