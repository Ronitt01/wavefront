"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  latLonToVec3,
  type Bounds,
  type ScenarioField,
} from "@/lib/manifest";
import {
  crossingT,
  getExperienceProgress,
  lerp,
  smoothstep,
} from "@/lib/experience";

const vertex = /* glsl */ `
  varying vec3 vObjNormal;
  varying vec3 vWorldNormal;
  void main() {
    vObjNormal = normalize(normal);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uDay, uNight, uField;
  uniform float uCurrentMin, uMaxMin, uRingWidth, uFieldLatMax, uFieldLatMin;
  uniform vec3 uSunDir, uIso, uCamDir;
  varying vec3 vObjNormal, vWorldNormal;
  vec3 srgb2lin(vec3 c){ return pow(c, vec3(2.2)); }

  void main() {
    vec3 n = normalize(vObjNormal);
    float lat = degrees(asin(clamp(n.y, -1.0, 1.0)));
    float lon = degrees(atan(n.z, n.x));
    float u = (lon + 180.0) / 360.0;
    float v = (lat + 90.0) / 180.0;

    vec3 day = srgb2lin(texture2D(uDay, vec2(u, v)).rgb);
    vec3 night = srgb2lin(texture2D(uNight, vec2(u, v)).rgb);
    float ndl = dot(normalize(vWorldNormal), normalize(uSunDir));
    float dayAmt = smoothstep(-0.12, 0.30, ndl);
    vec3 col = mix(night * 2.2, day, dayAmt);
    float term = 1.0 - abs(ndl);
    col += vec3(1.0, 0.6, 0.22) * pow(smoothstep(0.9, 1.0, term), 2.0) * 0.55;

    if (lat <= uFieldLatMax && lat >= uFieldLatMin) {
      float fv = (uFieldLatMax - lat) / (uFieldLatMax - uFieldLatMin);
      float m = texture2D(uField, vec2(u, fv)).r;
      if (m > 0.0) {
        float behind = step(m, uCurrentMin);
        float fade = clamp(1.0 - (uCurrentMin - m) / (uMaxMin * 0.6), 0.12, 1.0);
        col += uIso * behind * 0.10 * fade;
        float d = abs(m - uCurrentMin);
        float ring = smoothstep(uRingWidth, 0.0, d);
        col += uIso * ring * 2.6;
      }
    }

    float fres = pow(1.0 - max(dot(n, normalize(uCamDir)), 0.0), 3.0);
    col += vec3(0.25, 0.5, 0.9) * fres * 0.6;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Quaternion that turns the globe so (lat,lon) faces the +Z camera. */
function quatFacing(lat: number, lon: number, extraPitch = 0): THREE.Quaternion {
  const yaw = (lon * Math.PI) / 180 - Math.PI / 2;
  const pitch = (lat * Math.PI) / 180 + extraPitch;
  const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
  return qx.multiply(qy); // yaw first, then pitch
}

function Marker({ lat, lon, color, size }: { lat: number; lon: number; color: string; size: number }) {
  const pos = useMemo(() => latLonToVec3(lat, lon, 1.012), [lat, lon]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      const pulse = 1 + Math.sin(s.clock.elapsedTime * 3) * 0.25;
      ref.current.scale.setScalar(pulse);
    }
  });
  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

export function Globe({
  entry,
  fieldTexture,
  dayMap,
  nightMap,
  bounds,
  sunDir,
}: {
  entry: ScenarioField;
  fieldTexture: THREE.DataTexture;
  dayMap: THREE.Texture;
  nightMap: THREE.Texture;
  bounds: Bounds;
  sunDir: THREE.Vector3;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);

  const qEpi = useMemo(
    () => quatFacing(entry.epicenter.lat, entry.epicenter.lon, 0.18),
    [entry],
  );
  const qCoast = useMemo(
    () => quatFacing(entry.coast.lat, entry.coast.lon, 0.18),
    [entry],
  );

  const uniforms = useMemo(
    () => ({
      uDay: { value: dayMap },
      uNight: { value: nightMap },
      uField: { value: fieldTexture },
      uCurrentMin: { value: 0 },
      uMaxMin: { value: entry.maxMinutes },
      uRingWidth: { value: Math.max(3.5, entry.coast.arrivalMinutes * 0.04) },
      uFieldLatMax: { value: bounds.latMax },
      uFieldLatMin: { value: bounds.latMin },
      uSunDir: { value: sunDir.clone() },
      uIso: { value: new THREE.Color(0.24, 0.91, 1.0) },
      uCamDir: { value: new THREE.Vector3(0, 0, 1) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entry, fieldTexture, dayMap, nightMap],
  );

  useFrame(() => {
    const p = getExperienceProgress();
    const e = smoothstep(0, 1, crossingT(p));

    if (groupRef.current) {
      groupRef.current.quaternion.slerpQuaternions(qEpi, qCoast, e);
    }
    if (matRef.current) {
      matRef.current.uniforms.uCurrentMin.value = e * entry.coast.arrivalMinutes;
      matRef.current.uniforms.uCamDir.value.copy(camera.position).normalize();
    }
    // gentle cinematic push-in toward landfall
    camera.position.set(0, lerp(0.32, 0.16, e), lerp(3.15, 2.5, e));
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1, 160, 160]} />
        <shaderMaterial ref={matRef} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
      </mesh>
      <Marker lat={entry.epicenter.lat} lon={entry.epicenter.lon} color="#ff5a3c" size={0.012} />
      <Marker lat={entry.coast.lat} lon={entry.coast.lon} color="#3ee9ff" size={0.011} />
    </group>
  );
}
