import type { Vec3 } from '../config/applications'
/** Slack direct wire: keep its sampled length constant as a limited rotation takes up the bow. */
function points(twist:number,bow:number,reference=0):Vec3[]{return Array.from({length:129},(_,i)=>{const u=i/128,a=reference+twist*u,r=.075+bow*Math.sin(Math.PI*u);return [r*Math.cos(a),2.03-u*.31,-r*Math.sin(a)]})}
export function pathLength(p:Vec3[]){return p.slice(1).reduce((sum,v,i)=>sum+Math.hypot(...v.map((n,j)=>n-p[i][j])),0)}
export const DIRECT_CABLE_LENGTH=pathLength(points(0,.075))
export function directCablePoints(twist:number,reference=0):Vec3[]{let lo=0,hi=.075;for(let i=0;i<20;i++){const mid=(lo+hi)/2;if(pathLength(points(twist,mid))<DIRECT_CABLE_LENGTH)lo=mid;else hi=mid}return points(twist,(lo+hi)/2,reference)}
