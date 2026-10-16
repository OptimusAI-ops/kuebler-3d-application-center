import { Block, Cylinder, colors } from './Primitives'
/** Stationary blockout. Rotor/stator motion and electrical paths arrive with engineering requirements. */
export function CarouselPlaceholder() {
 return <group><Block position={[0,.25,0]} size={[2.8,.5,2.8]} color={colors.dark}/><Cylinder position={[0,.65,0]} radius={.65} height={.7}/><Cylinder position={[0,1.05,0]} radius={2.1} height={.23}/><Cylinder position={[0,1.18,0]} radius={.45} height={.08} color={colors.dark}/>{Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return <group key={i}><Cylinder position={[Math.cos(a)*1.55,1.38,Math.sin(a)*1.55]} radius={.22} height={.45} color="#627879"/><Cylinder position={[Math.cos(a)*1.55,1.62,Math.sin(a)*1.55]} radius={.24} height={.04}/></group>})}</group>
}
