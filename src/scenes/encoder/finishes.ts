import * as THREE from 'three';

// Procedural microstructure stays sharp when zooming, with no downloaded textures.
// Screen-space filtering fades machining lines before they can shimmer on phones.
export function finish(material: THREE.MeshStandardMaterial, kind: 'turned' | 'brushed' | 'molded') {
  material.userData.finish = kind;
  material.onBeforeCompile = shader => {
    shader.vertexShader = 'varying vec3 vFinishPosition;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvFinishPosition = position;');
    shader.fragmentShader = 'varying vec3 vFinishPosition;\n' + shader.fragmentShader;
    const coordinate = kind === 'turned' ? 'length(vFinishPosition.xy) * 76.0' : kind === 'brushed' ? 'vFinishPosition.z * 105.0' : 'dot(vFinishPosition, vec3(83.1, 57.7, 91.3))';
    shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
      float finishPhase = ${coordinate};
      float finishFilter = 1.0 / (1.0 + fwidth(finishPhase) * 2.0);
      float finishGrain = sin(finishPhase) * finishFilter;
      float finishFine = sin(dot(vFinishPosition, vec3(37.1, 61.7, 43.3))) * 0.012;
      roughnessFactor = clamp(roughnessFactor + finishGrain * 0.065 + finishFine, 0.12, 1.0);
      diffuseColor.rgb *= 0.985 + finishGrain * 0.015;
    `);
  };
  material.customProgramCacheKey = () => 'k58i-finish-' + kind;
  return material;
}
