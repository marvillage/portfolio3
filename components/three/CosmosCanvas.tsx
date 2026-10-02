"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Black-and-white cosmos behind the page:
//  • a spiral galaxy of soft white dust, centred behind the content and tilted
//    like a classic deep-field photograph, with a bright core; slow spin that
//    speeds up a little with scroll
//  • a real Earth: grayscale NASA-derived map with relief and ocean highlights,
//    white fresnel atmosphere and a slow cloud layer, rising from the lower right
// Everything is procedural except four small textures in /public/textures.

type Progress = { p: number; v: number };

const PAPER = "#f3f1ea";
const EARTH_RADIUS = 1.25;

/* ---------- shared soft sprite ---------- */

function useSoftSprite() {
  return useMemo(() => {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.3, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/** Heat sprite: a hot near-white core cooling to a soft warm halo. */
function useHeatSprite() {
  return useMemo(() => {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(255,252,240,1)");
      g.addColorStop(0.12, "rgba(255,246,214,0.95)");
      g.addColorStop(0.3, "rgba(236,222,186,0.55)");
      g.addColorStop(0.6, "rgba(200,190,160,0.16)");
      g.addColorStop(1, "rgba(180,170,150,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/* ---------- galaxy ---------- */

function Galaxy({ progress, count }: { progress: React.MutableRefObject<Progress>; count: number }) {
  const outer = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const sprite = useSoftSprite();

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const radius = 4.6;
    const branches = 3;
    const spinRate = 1.05;
    const randomness = 0.42;
    const power = 2.6;
    let seed = 20261002;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = 0.05 + Math.pow(rnd(), 0.7) * radius; // denser toward the core
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const spinAngle = r * spinRate;
      const sgn = () => (rnd() < 0.5 ? 1 : -1);
      const rx = Math.pow(rnd(), power) * sgn() * randomness * r;
      const ry = Math.pow(rnd(), power) * sgn() * randomness * r * 0.28;
      const rz = Math.pow(rnd(), power) * sgn() * randomness * r;
      pos[i3] = Math.cos(branchAngle + spinAngle) * r + rx;
      pos[i3 + 1] = ry;
      pos[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz;
      const t = r / radius; // 0 at the core, 1 at the rim
      const b = 0.9 - t * 0.78 + (rnd() - 0.5) * 0.2;
      const v = Math.max(0.06, Math.min(0.95, b));
      col[i3] = v;
      col[i3 + 1] = v;
      col[i3 + 2] = v;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((_, dt) => {
    const s = spin.current;
    const o = outer.current;
    if (!s || !o) return;
    const { p, v } = progress.current;
    s.rotation.y += dt * 0.022 + v * 0.0001;
    o.position.y = 0.3 + p * 0.6; // gentle parallax as the page scrolls
  });

  return (
    <group ref={outer} position={[0.2, 0.3, -3.2]} rotation={[-1.12, 0.05, 0.32]}>
      <group ref={spin}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.045}
            sizeAttenuation
            vertexColors
            transparent
            opacity={0.5}
            map={sprite}
            alphaMap={sprite}
            alphaTest={0.02}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
        {/* bright core, two soft layers */}
        <sprite scale={[2.4, 2.4, 1]}>
          <spriteMaterial
            map={sprite}
            color={PAPER}
            transparent
            opacity={0.32}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
        <sprite scale={[0.9, 0.9, 1]}>
          <spriteMaterial
            map={sprite}
            color={PAPER}
            transparent
            opacity={0.6}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      </group>
    </group>
  );
}

/* ---------- shared earth state ---------- */

// Written by the Earth each frame, read by the comet so every flight ends on the globe.
const earthState = {
  pos: new THREE.Vector3(0, -1.2, 0),
  spin: null as THREE.Group | null,
  shake: 0,
  ready: false,
};

/* ---------- comet ---------- */

// The inked comet drawing (public/art/comet.png, head on the right) flies in
// from off-screen, turned to follow its path, and crashes into the Earth. On
// impact the inked burst (public/art/impact.png) pops at the point of contact,
// a shockwave ring and glowing scar ride the globe's surface as it turns,
// ejecta is thrown up and pulled back, smoke rises, and the Earth jolts.
const COMET_ASPECT = 2.976; // comet.png width / height
const HEAD_X = 0.841; // head centre, fraction of image width from the left
const HEAD_Y = 0.447; // head centre, fraction of image height from the top
const COMET_WIDTH = 1.45; // world units for a full-size comet
const BURST_ASPECT = 1.45; // impact.png width / height
const DEBRIS = 160;
const SMOKE = 6;

type CometState = {
  phase: "idle" | "fly" | "impact";
  wait: number;
  t: number;
  q: number; // seconds since impact
  dur: number;
  size: number;
  arc: number;
  flip: boolean; // flying right-to-left: mirror the drawing so it stays upright
  from: THREE.Vector3;
  normal: THREE.Vector3; // impact direction from the Earth's centre, world space
  lastPos: THREE.Vector3;
};

const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

function Comet() {
  const [cometMap, burstMap] = useLoader(THREE.TextureLoader, ["/art/comet.png", "/art/impact.png"]);
  cometMap.colorSpace = THREE.SRGBColorSpace;
  burstMap.colorSpace = THREE.SRGBColorSpace;
  cometMap.anisotropy = 8;

  const body = useRef<THREE.Group>(null);
  const plane = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Sprite>(null);
  const burst = useRef<THREE.Mesh>(null);
  const flash = useRef<THREE.Sprite>(null);
  const debris = useRef<THREE.Points>(null);
  const smoke = useRef<THREE.Group>(null);
  const sprite = useSoftSprite();
  const heat = useHeatSprite();
  const { viewport } = useThree();
  const state = useRef<CometState>({
    phase: "idle",
    wait: 2.5,
    t: 0,
    q: 0,
    dur: 9,
    size: 1,
    arc: 0.8,
    flip: false,
    from: new THREE.Vector3(),
    normal: new THREE.Vector3(0, 0, 1),
    lastPos: new THREE.Vector3(),
  });
  const scratch = useMemo(
    () => ({ pos: new THREE.Vector3(), dir: new THREE.Vector3(), target: new THREE.Vector3(), tmp: new THREE.Vector3() }),
    []
  );

  const cometMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: cometMap, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, opacity: 0 }),
    [cometMap]
  );
  const burstMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: burstMap, transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide, toneMapped: false, opacity: 0 }),
    [burstMap]
  );

  /* ----- impact pieces ----- */

  const debrisGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(DEBRIS * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(DEBRIS * 3), 3));
    return g;
  }, []);
  const debrisVel = useMemo(() => new Float32Array(DEBRIS * 3), []);
  const debrisMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.035,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        map: sprite,
        alphaMap: sprite,
        alphaTest: 0.01,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [sprite]
  );
  const smokeDirs = useMemo(
    () => Array.from({ length: SMOKE }, (_, i) => new THREE.Vector3(Math.cos(i * 1.9) * 0.5, Math.sin(i * 1.9) * 0.5, 0)),
    []
  );

  // scar group lives on the Earth's spin group so the mark turns with the globe
  const scar = useMemo(() => {
    const g = new THREE.Group();
    g.visible = false;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.78, 1, 72),
      new THREE.MeshBasicMaterial({ color: "#fff3cf", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    );
    ring.name = "ring";
    const hot = new THREE.Sprite(new THREE.SpriteMaterial({ map: heat, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    hot.name = "hot";
    const soot = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprite, color: "#101012", transparent: true, opacity: 0, depthWrite: false }));
    soot.name = "soot";
    soot.scale.setScalar(0.55);
    g.add(ring, hot, soot);
    return g;
  }, [heat, sprite]);

  useEffect(
    () => () => {
      cometMat.dispose();
      burstMat.dispose();
      debrisGeo.dispose();
      debrisMat.dispose();
      scar.removeFromParent();
    },
    [cometMat, burstMat, debrisGeo, debrisMat, scar]
  );

  const launch = () => {
    const s = state.current;
    const meteor = Math.random() < 0.3;
    const portrait = viewport.width < viewport.height;
    // impact on the visible near side, upper part of the disc
    s.normal
      .set(portrait ? (Math.random() - 0.5) * 0.4 : -0.28 + (Math.random() - 0.5) * 0.3, 0.82 + (Math.random() - 0.5) * 0.12, 0.5)
      .normalize();
    const z = earthState.pos.z + s.normal.z * EARTH_RADIUS;
    const k = (3.4 - z) / 3.4;
    const w = (viewport.width / 2) * k;
    const h = (viewport.height / 2) * k;
    const leftToRight = portrait ? Math.random() < 0.5 : Math.random() < 0.8;
    s.flip = !leftToRight;
    s.from.set(leftToRight ? -w - 1 : w + 1, h * (0.55 + Math.random() * 0.5), z);
    s.arc = 0.5 + Math.random() * 0.9;
    s.size = meteor ? 0.45 : 1;
    s.dur = meteor ? 3.6 + Math.random() * 1.2 : 8 + Math.random() * 3; // slow: comets 8–11 s, meteors ~4 s
    s.t = 0;
    s.lastPos.copy(s.from);
    s.phase = "fly";
    // anchor the drawing so its head sits on the group origin; mirror when flying leftward
    if (plane.current) {
      const W = COMET_WIDTH;
      const H = W / COMET_ASPECT;
      plane.current.scale.set(1, s.flip ? -1 : 1, 1);
      plane.current.position.set(-(HEAD_X - 0.5) * W, (s.flip ? 1 : -1) * (0.5 - HEAD_Y) * H, 0);
    }
  };

  const setVisible = (fly: boolean, impact: boolean) => {
    if (body.current) body.current.visible = fly;
    if (burst.current) burst.current.visible = impact;
    if (flash.current) flash.current.visible = impact;
    if (debris.current) debris.current.visible = impact;
    if (smoke.current) smoke.current.visible = impact;
  };

  const impact = (pos: THREE.Vector3, dir: THREE.Vector3) => {
    const s = state.current;
    s.phase = "impact";
    s.q = 0;
    earthState.shake = 1;
    const dp = debrisGeo.attributes.position as THREE.BufferAttribute;
    const dc = debrisGeo.attributes.color as THREE.BufferAttribute;
    for (let i = 0; i < DEBRIS; i++) {
      const n = s.normal;
      const sp = 0.9 * s.size;
      const vx = n.x * (0.5 + Math.random() * 1.1) + (Math.random() - 0.5) * sp * 1.4 - dir.x * 0.35;
      const vy = n.y * (0.5 + Math.random() * 1.1) + (Math.random() - 0.5) * sp * 1.4 - dir.y * 0.35;
      const vz = n.z * (0.3 + Math.random() * 0.6) + (Math.random() - 0.5) * sp * 0.6;
      debrisVel[i * 3] = vx * s.size;
      debrisVel[i * 3 + 1] = vy * s.size;
      debrisVel[i * 3 + 2] = vz * s.size;
      dp.setXYZ(i, pos.x, pos.y, pos.z);
      const b = 0.7 + Math.random() * 0.3;
      dc.setXYZ(i, b, b * 0.97, b * 0.88);
    }
    dp.needsUpdate = true;
    dc.needsUpdate = true;
    if (burst.current) {
      burst.current.position.copy(pos).addScaledVector(s.normal, 0.25);
      burst.current.rotation.z = (Math.random() - 0.5) * 0.6;
      burst.current.scale.setScalar(0.3 * s.size);
    }
    if (flash.current) {
      flash.current.position.copy(pos).addScaledVector(s.normal, 0.05);
      flash.current.scale.setScalar(0.3 * s.size);
    }
    if (smoke.current) {
      smoke.current.children.forEach((c, i) => {
        c.position.copy(pos);
        c.scale.setScalar(0.25 * s.size);
        smokeDirs[i].set((Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.9, 0).addScaledVector(s.normal, 0.9).normalize();
      });
    }
    const sg = earthState.spin;
    if (sg) {
      if (scar.parent !== sg) sg.add(scar);
      const local = sg.worldToLocal(pos.clone());
      const ln = local.clone().normalize();
      scar.position.copy(ln).multiplyScalar(1.012);
      scar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), ln);
      scar.visible = true;
      (scar.getObjectByName("ring") as THREE.Mesh).scale.setScalar(0.02);
      (scar.getObjectByName("hot") as THREE.Sprite).scale.setScalar(0.75 * s.size);
    }
    setVisible(false, true);
  };

  useFrame((frame, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = state.current;
    const g = body.current;
    if (!g) return;
    const { pos, dir, target, tmp } = scratch;
    const now = frame.clock.elapsedTime;

    /* ----- idle ----- */
    if (s.phase === "idle") {
      s.wait -= dt;
      setVisible(false, false);
      if (s.wait <= 0 && earthState.ready) launch();
      return;
    }

    /* ----- impact ----- */
    if (s.phase === "impact") {
      s.q += dt;
      const q = s.q;
      // inked burst: pops, swells, fades
      if (burst.current) {
        const grow = 1 - Math.pow(1 - Math.min(1, q / 0.55), 3);
        burst.current.scale.setScalar((0.3 + grow * 0.95) * s.size);
        burstMat.opacity = q < 0.3 ? 1 : Math.max(0, 1 - (q - 0.3) / 0.6);
      }
      if (flash.current) {
        flash.current.scale.setScalar((0.2 + q * 1.8) * s.size);
        (flash.current.material as THREE.SpriteMaterial).opacity = Math.max(0, 1 - q / 0.4);
      }
      // ejecta with gravity back toward the Earth
      const dp = debrisGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < DEBRIS; i++) {
        tmp.set(dp.getX(i), dp.getY(i), dp.getZ(i));
        const toC = earthState.pos.clone().sub(tmp);
        const d2 = Math.max(0.4, toC.lengthSq());
        toC.normalize().multiplyScalar((7.5 / d2) * dt);
        debrisVel[i * 3] += toC.x;
        debrisVel[i * 3 + 1] += toC.y;
        debrisVel[i * 3 + 2] += toC.z;
        dp.setXYZ(i, tmp.x + debrisVel[i * 3] * dt, tmp.y + debrisVel[i * 3 + 1] * dt, tmp.z + debrisVel[i * 3 + 2] * dt);
      }
      dp.needsUpdate = true;
      debrisMat.opacity = Math.max(0, 1 - q / 3.0);
      // smoke rises and spreads
      if (smoke.current) {
        smoke.current.children.forEach((c, i) => {
          c.position.addScaledVector(smokeDirs[i], dt * 0.35 * s.size);
          c.scale.addScalar(dt * 0.7 * s.size);
          ((c as THREE.Sprite).material as THREE.SpriteMaterial).opacity = Math.max(0, 1 - q / 3.2) * 0.7;
        });
      }
      // surface scar: shockwave ring, hot glow, lingering soot
      const ring = scar.getObjectByName("ring") as THREE.Mesh;
      const hot = scar.getObjectByName("hot") as THREE.Sprite;
      const soot = scar.getObjectByName("soot") as THREE.Sprite;
      ring.scale.setScalar(0.03 + smooth(q / 1.6) * 0.95 * s.size);
      (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - q / 1.7);
      (hot.material as THREE.SpriteMaterial).opacity = Math.max(0, 1 - q / 2.6) * 0.95;
      (soot.material as THREE.SpriteMaterial).opacity = Math.min(1, q * 1.5) * Math.max(0, 1 - q / 7) * 0.85;
      if (q > 7) {
        scar.visible = false;
        s.phase = "idle";
        s.wait = 3 + Math.random() * 5;
      } else if (q > 3.2) {
        setVisible(false, false);
      }
      return;
    }

    /* ----- flight ----- */
    s.t += dt / s.dur;
    const p = Math.min(1, s.t);
    const e = p * p * 0.2 + p * 0.8; // gentle acceleration into the fall
    target.copy(earthState.pos).addScaledVector(s.normal, EARTH_RADIUS);
    pos.lerpVectors(s.from, target, e);
    pos.y += Math.sin(Math.PI * e) * s.arc;
    dir.subVectors(pos, s.lastPos);
    if (dir.lengthSq() > 1e-8) dir.normalize();
    else dir.subVectors(target, s.from).normalize();
    s.lastPos.copy(pos);
    if (p >= 1) {
      impact(pos, dir);
      return;
    }
    setVisible(true, false);

    const env = smooth(p / 0.1);
    g.position.copy(pos);
    g.rotation.z = Math.atan2(dir.y, dir.x) + Math.sin(now * 2.6) * 0.012; // follows the path, with a faint wobble
    g.scale.setScalar(s.size);
    cometMat.opacity = env;
    if (halo.current) (halo.current.material as THREE.SpriteMaterial).opacity = 0.3 * env * (0.9 + 0.1 * Math.sin(now * 7));
  });

  return (
    <>
      {/* the drawing, anchored at its head */}
      <group ref={body} visible={false}>
        <mesh ref={plane} material={cometMat} renderOrder={5}>
          <planeGeometry args={[COMET_WIDTH, COMET_WIDTH / COMET_ASPECT]} />
        </mesh>
        <sprite ref={halo} scale={[0.9, 0.9, 1]} renderOrder={4}>
          <spriteMaterial map={heat} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>

      {/* impact */}
      <mesh ref={burst} material={burstMat} visible={false} frustumCulled={false} renderOrder={10}>
        <planeGeometry args={[1, 1 / BURST_ASPECT]} />
      </mesh>
      <sprite ref={flash} visible={false} frustumCulled={false} renderOrder={9}>
        <spriteMaterial map={heat} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <points ref={debris} geometry={debrisGeo} material={debrisMat} visible={false} frustumCulled={false} />
      <group ref={smoke} visible={false}>
        {smokeDirs.map((_, i) => (
          <sprite key={i} frustumCulled={false}>
            <spriteMaterial map={sprite} color="#9a978f" transparent opacity={0} depthWrite={false} />
          </sprite>
        ))}
      </group>
    </>
  );
}

/* ---------- earth ---------- */

const atmosphereMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vN; varying vec3 vP;
      void main() {
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vP = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vN; varying vec3 vP;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(-vP))), 3.0);
        gl_FragColor = vec4(vec3(0.95, 0.94, 0.90), f * 0.8);
      }`,
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

function Earth({ progress }: { progress: React.MutableRefObject<Progress> }) {
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const clouds = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  const [map, normalMap, specularMap, cloudMap, lightsMap] = useLoader(THREE.TextureLoader, [
    "/textures/earth-bw.jpg",
    "/textures/earth-normal.jpg",
    "/textures/earth-specular.jpg",
    "/textures/earth-clouds.png",
    "/textures/earth-lights.jpg",
  ]);
  map.colorSpace = THREE.SRGBColorSpace;
  cloudMap.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  const atmos = useMemo(atmosphereMaterial, []);
  useEffect(() => () => atmos.dispose(), [atmos]);

  useFrame((state, dt) => {
    const t = tilt.current;
    const s = spin.current;
    if (!t || !s) return;
    const { p, v } = progress.current;
    s.rotation.y += dt * 0.045 + v * 0.0002;
    if (clouds.current) clouds.current.rotation.y += dt * 0.012;
    // a horizon rising from the lower right; on phones it sits centred at the bottom
    const portrait = viewport.width < viewport.height;
    const halfW = viewport.width / 2;
    t.position.x = portrait ? 0.15 : halfW * 0.56;
    t.position.y = THREE.MathUtils.lerp(portrait ? -2.15 : -1.85, portrait ? -1.6 : -1.05, p);
    // publish for the comet, then apply the impact jolt
    earthState.pos.copy(t.position);
    earthState.spin = s;
    earthState.ready = true;
    if (earthState.shake > 0.001) {
      const e = state.clock.elapsedTime;
      t.position.x += Math.sin(e * 70) * 0.035 * earthState.shake;
      t.position.y += Math.cos(e * 55) * 0.03 * earthState.shake;
      earthState.shake *= Math.exp(-dt * 4);
    }
    progress.current.v *= 0.88;
  });

  return (
    <group ref={tilt} rotation={[0.1, 0, 0.41]} scale={EARTH_RADIUS}>
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[1, 96, 64]} />
          <meshPhongMaterial
            map={map}
            normalMap={normalMap}
            normalScale={new THREE.Vector2(0.55, 0.55)}
            specularMap={specularMap}
            specular={new THREE.Color("#8a8a86")}
            shininess={16}
            color="#d6d4cd"
            emissiveMap={lightsMap}
            emissive={new THREE.Color("#ffffff")}
            emissiveIntensity={0.55}
          />
        </mesh>
        <mesh ref={clouds}>
          <sphereGeometry args={[1.012, 64, 48]} />
          <meshPhongMaterial map={cloudMap} transparent opacity={0.55} depthWrite={false} />
        </mesh>
      </group>
      <mesh material={atmos}>
        <sphereGeometry args={[1.07, 48, 36]} />
      </mesh>
    </group>
  );
}

/* ---------- static fallback ---------- */

export function CosmosSketch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id="earth-shade" cx="35%" cy="32%" r="78%">
          <stop offset="0" stopColor="#c9c6bc" />
          <stop offset="0.55" stopColor="#5a5955" />
          <stop offset="1" stopColor="#0a0a0c" />
        </radialGradient>
        <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f3f1ea" stopOpacity="0.7" />
          <stop offset="1" stopColor="#f3f1ea" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g fill="none" stroke={PAPER} opacity="0.3">
        <ellipse cx="160" cy="80" rx="150" ry="46" strokeWidth="0.8" />
        <ellipse cx="160" cy="80" rx="100" ry="30" strokeWidth="0.8" />
        <ellipse cx="160" cy="80" rx="50" ry="15" strokeWidth="1" />
      </g>
      <ellipse cx="160" cy="80" rx="40" ry="18" fill="url(#core-glow)" />
      <circle cx="235" cy="215" r="80" fill="url(#earth-shade)" stroke={PAPER} strokeWidth="1.2" />
    </svg>
  );
}

/* ---------- canvas shell ---------- */

type Mode = "pending" | "webgl" | "static";

export default function CosmosCanvas() {
  const [mode, setMode] = useState<Mode>("pending");
  const [active, setActive] = useState(true);
  const [count, setCount] = useState(16000);
  const progress = useRef<Progress>({ p: 0, v: 0 });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const lowPower = cores <= 2 || memory < 2;
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
    setCount(cores <= 4 || window.innerWidth < 768 ? 9000 : 16000);
    setMode(!reduced && !lowPower && webgl ? "webgl" : "static");

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current.p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      progress.current.v += y - lastY;
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const onVis = () => setActive(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  if (mode === "pending") return null;

  if (mode === "static") {
    return (
      <CosmosSketch className="absolute left-1/2 top-[14vh] w-[120vw] max-w-[1200px] -translate-x-1/2 opacity-80" />
    );
  }

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3.4], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
          toneMapping: THREE.NoToneMapping,
        }}
        style={{ pointerEvents: "none" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.22} />
        <hemisphereLight args={[0x9a9a96, 0x000000, 0.35]} />
        <directionalLight position={[-3.5, 1.8, 4]} intensity={2.6} />
        <Galaxy progress={progress} count={count} />
        <Suspense fallback={null}>
          <Comet />
          <Earth progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
