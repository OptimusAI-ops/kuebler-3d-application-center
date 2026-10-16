import test from 'node:test'
import assert from 'node:assert/strict'
import { encoderMeasurement, cablePayout } from '../src/state/simulation.ts'
import { applications, getApplication } from '../src/config/applications.ts'
test('encoder counts follow rotation in either direction with wrap-safe angles',()=>{
 assert.deepEqual(encoderMeasurement(2*Math.PI,1024),{degrees:0,netQuadratureCount:4096})
 assert.deepEqual(encoderMeasurement(-Math.PI/2,1024),{degrees:270,netQuadratureCount:-1024})
 assert.equal(encoderMeasurement(Math.PI/4,100).netQuadratureCount,50)
 assert.throws(()=>encoderMeasurement(0,0),RangeError)
})
test('draw-wire payout derives from its actual endpoint geometry',()=>{
 assert.equal(cablePayout([0,0,0],[3,4,0]),5)
 assert.equal(cablePayout([2,3,4],[2,3,4]),0)
 assert.throws(()=>cablePayout([0,0],[0,0,0]),RangeError)
})
test('one combined crane application retains both legacy route aliases',()=>{
 assert.equal(getApplication('boom-angle'),getApplication('crane'))
 assert.equal(getApplication('boom-extension'),getApplication('crane'))
 assert.equal(applications.filter(a=>a.machine==='crane').length,1)
 assert.equal(applications.length,3)
 assert.equal(new Set(applications.map(a=>a.machine)).size,3)
})
