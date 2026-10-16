import type { Vec3 } from '../config/applications'
export const colors = { metal: '#8b9597', dark: '#343e42', orange: '#f1843d', rubber: '#20282b' }
export function Block({ position, size, color = colors.metal, rotation = [0,0,0] }: { position: Vec3; size: Vec3; color?: string; rotation?: Vec3 }) {
 return <mesh position={position} rotation={rotation} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} metalness={0.55} roughness={0.36}/></mesh>
}
export function Cylinder({ position, radius, height, color = colors.metal, rotation = [0,0,0] }: { position: Vec3; radius: number; height: number; color?: string; rotation?: Vec3 }) {
 return <mesh position={position} rotation={rotation} castShadow receiveShadow><cylinderGeometry args={[radius,radius,height,48]}/><meshStandardMaterial color={color} metalness={0.6} roughness={0.33}/></mesh>
}
