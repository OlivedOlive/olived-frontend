"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { glassModelFor } from "@/lib/studio/bottle-models";
import { FACES, LABEL_SIZE } from "@/lib/studio/label-artwork";
import type { PackagePart, PanelFace } from "@/lib/studio/types";

type Properties = {
  format: string;
  volume: number;
  part: PackagePart;
  artwork: Partial<Record<PanelFace, HTMLCanvasElement>>;
  offset: number;
  labelHeight: number;
  yaw: number;
  pitch: number;
  zoom: number;
  referenceModel?: boolean;
  useOriginalArtwork?: boolean;
  onRotate?: (yaw: number, pitch: number) => void;
};

type Renderer = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  model: THREE.Group;
  shadow: ReturnType<typeof contactShadow>;
};
const BAND_ORDER: PanelFace[] = ["front", "right", "back", "left"];
const BOX_ORDER: PanelFace[] = ["right", "left", "top", "bottom", "front", "back"];

function disposeModel(model: THREE.Group) {
  const materials = new Set<THREE.MeshStandardMaterial>();
  model.traverse((item) => {
    if (!(item instanceof THREE.Mesh)) return;
    item.geometry.dispose();
    for (const material of [item.material].flat() as THREE.MeshStandardMaterial[]) materials.add(material);
  });
  for (const material of materials) {
    material.map?.dispose();
    const original = material.userData.originalArtwork as THREE.Texture | undefined;
    if (original && original !== material.map) original.dispose();
    material.dispose();
  }
  model.clear();
}

function profileSurface(rings: number[][], depth: number, exponent: number) {
  const segments = 96;
  const vertices: number[] = [];
  const uv: number[] = [];
  const indices: number[] = [];
  const bottom = rings[0][1];
  const span = rings[rings.length - 1][1] - bottom;
  const perimeter = [0];
  const section = Array.from({ length: segments + 1 }, (_, n) => {
    const angle = n / segments * Math.PI * 2 - Math.PI / 4;
    const x = Math.sin(angle);
    const z = Math.cos(angle);
    return [Math.sign(x) * Math.pow(Math.abs(x), exponent), Math.sign(z) * Math.pow(Math.abs(z), exponent) * depth];
  });
  section.slice(1).forEach(([x, z], n) => {
    perimeter.push(perimeter[n] + Math.hypot(x - section[n][0], z - section[n][1]));
  });
  rings.forEach(([radius, y, roundness = 0], row) => {
    for (let n = 0; n <= segments; n++) {
      const angle = n / segments * Math.PI * 2 - Math.PI / 4;
      const x = THREE.MathUtils.lerp(section[n][0], Math.sin(angle), roundness);
      const z = THREE.MathUtils.lerp(section[n][1], Math.cos(angle), roundness);
      vertices.push(x * radius, y, z * radius);
      uv.push(perimeter[n] / perimeter[segments], (y - bottom) / span);
      if (row && n) {
        const end = row * (segments + 1) + n;
        const previous = end - segments - 1;
        indices.push(previous - 1, previous, end, previous - 1, end, end - 1);
      }
    }
  });
  const mesh = new THREE.BufferGeometry();
  mesh.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  mesh.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  mesh.setIndex(indices);
  mesh.computeVertexNormals();
  const normals = mesh.getAttribute("normal");
  rings.forEach((_, row) => {
    const first = row * (segments + 1);
    const last = first + segments;
    const seam = new THREE.Vector3().fromBufferAttribute(normals, first)
      .add(new THREE.Vector3().fromBufferAttribute(normals, last)).normalize();
    normals.setXYZ(first, seam.x, seam.y, seam.z);
    normals.setXYZ(last, seam.x, seam.y, seam.z);
  });
  return mesh;
}

/** Scene units per metre: the supplier models are in metres, the camera is framed for about 3 units. */
const UNITS_PER_METRE = 10;
/** The label sits this far off the glass, so it never flickers into the surface. */
const LABEL_GAP = .0004;

type GlassBody =
  | { shape: "round"; radius: number; bottom: number; top: number; height: number }
  | { shape: "square"; half: number; corner: number; bottom: number; top: number; height: number };

/** Each model file is downloaded once; every preview parses its own copy, so disposing one never breaks another. */
const glassFiles = new Map<string, Promise<ArrayBuffer>>();

async function loadGlass(url: string) {
  let file = glassFiles.get(url);
  if (!file) {
    file = fetch(url).then((response) => {
      if (!response.ok) throw new Error(`${url} answered ${response.status}`);
      return response.arrayBuffer();
    });
    glassFiles.set(url, file);
    file.catch(() => glassFiles.delete(url));
  }
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const { scene } = await new GLTFLoader().parseAsync((await file).slice(0), "");
  return scene;
}

/**
 * Measures the glass body of a supplier model: round or square, its size, and the straight part of
 * the wall where a label can sit. Read from the mesh itself, so a corrected model needs no code change.
 */
function measureGlass(scene: THREE.Group): GlassBody {
  scene.updateMatrixWorld(true);
  let body: THREE.Mesh | null = null;
  let most = 0;
  scene.traverse((item) => {
    if (!(item instanceof THREE.Mesh)) return;
    const name = [item.material].flat().map((material) => material.name).join(" ");
    const count = item.geometry.getAttribute("position").count;
    if (/glass/i.test(name) && count > most) {
      body = item;
      most = count;
    }
  });
  const points: THREE.Vector3[] = [];
  const height = new THREE.Box3().setFromObject(scene).max.y;
  const mesh = body as THREE.Mesh | null;
  if (mesh) {
    const position = mesh.geometry.getAttribute("position");
    for (let index = 0; index < position.count; index++) {
      points.push(new THREE.Vector3().fromBufferAttribute(position, index).applyMatrix4(mesh.matrixWorld));
    }
  }
  const extent = (point: THREE.Vector3) => Math.max(Math.abs(point.x), Math.abs(point.z));
  const half = Math.max(...points.map(extent));
  // The straight wall: everything within 0.6 mm of the widest point, less 4 mm of margin at each end.
  const wall = points.filter((point) => extent(point) > half - .0006);
  const bottom = Math.min(...wall.map((point) => point.y)) + .004;
  const top = Math.max(...wall.map((point) => point.y)) - .004;
  const radius = Math.max(...points.filter((point) => point.y >= bottom && point.y <= top).map((point) => Math.hypot(point.x, point.z)));
  // A round body reaches the same distance in every direction; a square one reaches further at its corners.
  if (radius < half * 1.12) return { shape: "round", radius: half, bottom, top, height };
  const corner = THREE.MathUtils.clamp((half * Math.SQRT2 - radius) / (Math.SQRT2 - 1), .001, half);
  return { shape: "square", half, corner, bottom, top, height };
}

/** The outline of the label around the body, starting at the front-left corner and running front, right, back, left. */
function glassOutline(body: GlassBody, gap: number) {
  const points: [number, number][] = [];
  if (body.shape === "round") {
    const radius = body.radius + gap;
    for (let n = 0; n <= 128; n++) {
      const angle = n / 128 * Math.PI * 2 - Math.PI / 4;
      points.push([Math.sin(angle) * radius, Math.cos(angle) * radius]);
    }
    return points;
  }
  const half = body.half + gap;
  const corner = body.corner + gap;
  const flat = half - corner;
  const arc = (x: number, z: number, from: number, to: number) => {
    for (let n = 0; n <= 12; n++) {
      const angle = from + (to - from) * n / 12;
      points.push([x + Math.sin(angle) * corner, z + Math.cos(angle) * corner]);
    }
  };
  const side = (x0: number, z0: number, x1: number, z1: number) => {
    for (let n = 1; n < 16; n++) points.push([x0 + (x1 - x0) * n / 16, z0 + (z1 - z0) * n / 16]);
  };
  const q = Math.PI / 2;
  arc(-flat, flat, -q / 2, 0);
  side(-flat, half, flat, half);
  arc(flat, flat, 0, q);
  side(half, flat, half, -flat);
  arc(flat, -flat, q, 2 * q);
  side(flat, -half, -flat, -half);
  arc(-flat, -flat, 2 * q, 3 * q);
  side(-half, -flat, -half, flat);
  arc(-flat, flat, 3 * q, 3.5 * q);
  return points;
}

/** A label band around the glass between two heights, with the artwork mapped by arc length. */
function labelBand(outline: [number, number][], lower: number, upper: number) {
  const lengths = [0];
  outline.slice(1).forEach(([x, z], n) => lengths.push(lengths[n] + Math.hypot(x - outline[n][0], z - outline[n][1])));
  const total = lengths[lengths.length - 1];
  const vertices: number[] = [];
  const uv: number[] = [];
  const indices: number[] = [];
  outline.forEach(([x, z], n) => {
    vertices.push(x, lower, z, x, upper, z);
    uv.push(lengths[n] / total, 0, lengths[n] / total, 1);
    if (n) {
      const a = (n - 1) * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return { geometry, perimeter: total };
}

/**
 * Lays the four label faces side by side (front, right, back, left), each sized to its share of the
 * band so the artwork keeps its proportions, with a light print shading.
 */
function paintWrap(artwork: Properties["artwork"], labelHeight: number, faceWidth: (face: PanelFace) => number) {
  const wrap = document.createElement("canvas");
  wrap.width = LABEL_SIZE * BAND_ORDER.length;
  wrap.height = LABEL_SIZE;
  const ctx = wrap.getContext("2d");
  BAND_ORDER.forEach((face, index) => {
    const panel = artwork[face];
    if (!panel || !ctx) return;
    const pixel = panel.getContext("2d")?.getImageData(0, 0, 1, 1).data;
    if (pixel) {
      ctx.fillStyle = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      ctx.fillRect(LABEL_SIZE * index, 0, LABEL_SIZE, LABEL_SIZE);
    }
    const minimum = face === "front" ? .94 : .63;
    const width = Math.min(LABEL_SIZE, Math.max(LABEL_SIZE * minimum, Math.round(panel.width * labelHeight / faceWidth(face))));
    ctx.drawImage(panel, LABEL_SIZE * index + (LABEL_SIZE - width) / 2, 0, width, LABEL_SIZE);
    const left = LABEL_SIZE * index;
    const shading = ctx.createLinearGradient(left, 0, left + LABEL_SIZE, 0);
    shading.addColorStop(0, "rgba(25,20,12,.14)");
    shading.addColorStop(.17, "rgba(255,249,230,.09)");
    shading.addColorStop(.34, "rgba(255,249,230,0)");
    shading.addColorStop(.72, "rgba(25,20,12,0)");
    shading.addColorStop(1, "rgba(25,20,12,.14)");
    ctx.fillStyle = shading;
    ctx.fillRect(left, 0, LABEL_SIZE, LABEL_SIZE);
  });
  return wrap;
}

function contactShadow() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 9, 64, 64, 64);
    gradient.addColorStop(0, "rgba(33,39,24,0.42)");
    gradient.addColorStop(.52, "rgba(33,39,24,0.15)");
    gradient.addColorStop(1, "rgba(33,39,24,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.9), new THREE.MeshBasicMaterial({
    map: createTexture(canvas), transparent: true, depthWrite: false,
  }));
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

function createTexture(source: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(source);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createModel(model: THREE.Group, { format, volume, part, artwork, offset, labelHeight }: Pick<Properties, "format" | "volume" | "part" | "artwork" | "offset" | "labelHeight">) {
  disposeModel(model);
  if (part !== "unit") {
    const dimensions: [number, number, number] = part === "case" ? [2.5, 1.35, 1.55] : [1.22, 2.55, 1.12];
    const materials = BOX_ORDER.map((face) =>
      new THREE.MeshStandardMaterial({ color: artwork[face] ? "#ffffff" : "#aa7950", map: artwork[face] ? createTexture(artwork[face]) : null, roughness: .88 }));
    model.add(new THREE.Mesh(new THREE.BoxGeometry(...dimensions), materials));
    return;
  }

  const tin = format === "Tin";
  const pet = format === "PET";
  const dorica = format.startsWith("Dorica");
  const square = tin ? .22 : dorica ? 1 : pet ? .62 : .6;
  const depth = tin ? .58 : pet ? .82 : .96;
  const size = volume <= 250 ? .74 : volume <= 500 ? .9 : volume <= 750 ? 1 : volume <= 1000 ? 1.1 : volume <= 3000 ? 1.3 : 1.47;
  const bodyRadius = (tin ? .84 : pet ? .72 : dorica ? .40 : .43) * Math.sqrt(size);
  const bodyHeight = (tin ? 1.9 : pet ? 1.8 : dorica ? 2.56 : 2.44) * size;
  const neckHeight = tin ? .11 : pet ? .28 : .55;
  const capHeight = tin ? .14 : pet ? .2 : .30;
  const base = -(bodyHeight + neckHeight + capHeight) / 2;
  const top = base + bodyHeight;
  const neckRadius = bodyRadius * (pet ? .42 : .44);
  const bodyRings = [
    [0, base + .038], [bodyRadius * .79, base], [bodyRadius * .94, base + .025],
    [bodyRadius * .99, base + .065], [bodyRadius, base + .14],
    ...(pet ? [.15, .24, .33].flatMap((ratio) => {
      const y = base + bodyHeight * ratio;
      return [[bodyRadius, y - .02], [bodyRadius * .94, y], [bodyRadius, y + .02]];
    }) : []),
    ...(tin
      ? [[bodyRadius, top - .06], [bodyRadius * .97, top], [bodyRadius * .94, top + neckHeight], [0, top + neckHeight]]
      : [
        [bodyRadius, top - .39], [bodyRadius * .99, top - .29, .12], [bodyRadius * .94, top - .20, .28],
        [bodyRadius * .82, top - .11, .55], [bodyRadius * .66, top - .04, .77],
        [neckRadius * 1.17, top + .03, 1], [neckRadius * 1.03, top + .11, 1],
        [neckRadius, top + neckHeight - .06, 1], [neckRadius * 1.08, top + neckHeight, 1], [0, top + neckHeight, 1],
      ]),
  ];
  const surface = tin
    ? new THREE.MeshStandardMaterial({ color: "#c4c2ae", metalness: .82, roughness: .29 })
    : new THREE.MeshPhysicalMaterial({
      color: pet ? "#fff5cb" : "#3f4823", transmission: pet ? .53 : .66,
      thickness: pet ? .045 : .17, ior: pet ? 1.46 : 1.52, roughness: pet ? .24 : .13,
      attenuationColor: pet ? "#e3c55b" : "#394219", attenuationDistance: .65,
      clearcoat: 1, clearcoatRoughness: .10,
    });
  model.add(new THREE.Mesh(profileSurface(bodyRings, depth, square), surface));
  if (!tin) {
    const fillTop = top - .12;
    const oilRings = bodyRings.filter(([, y]) => y < fillTop).map(([radius, y, rounding]) => [radius * .94, y + .055, rounding ?? 0]);
    oilRings.push([bodyRadius * .77, fillTop, .52], [0, fillTop - .008, 1]);
    model.add(new THREE.Mesh(profileSurface(oilRings, depth, square), new THREE.MeshPhysicalMaterial({
      color: pet ? "#b38a13" : "#735015", roughness: .41, clearcoat: .27, ior: 1.47,
    })));
  }

  const capRadius = neckRadius * 1.11;
  const capBase = top + neckHeight - .06;
  const closure = new THREE.MeshPhysicalMaterial({ color: "#102c1f", metalness: tin ? .42 : .32, roughness: .32, clearcoat: .65 });
  const capRings = [
    [0, capBase], [capRadius * .97, capBase], [capRadius, capBase + .018],
    [capRadius * .90, capBase + capHeight * .16], [capRadius, capBase + capHeight * .22],
    [capRadius, capBase + capHeight * .90], [capRadius * .91, capBase + capHeight], [0, capBase + capHeight],
  ];
  const cap = new THREE.Mesh(profileSurface(capRings, 1, 1), closure);
  cap.position.x = tin ? -.35 : 0;
  model.add(cap);
  const knurl = new THREE.InstancedMesh(new THREE.BoxGeometry(.012, capHeight * .48, .009), closure, 64);
  const rib = new THREE.Object3D();
  for (let index = 0; index < knurl.count; index++) {
    const angle = index / knurl.count * Math.PI * 2;
    rib.position.set(cap.position.x + Math.sin(angle) * capRadius, capBase + capHeight * .61, Math.cos(angle) * capRadius);
    rib.rotation.y = angle;
    rib.updateMatrix();
    knurl.setMatrixAt(index, rib.matrix);
  }
  model.add(knurl);
  if (tin && volume >= 3000) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(.22, .027, 8, 28, Math.PI),
      new THREE.MeshStandardMaterial({ color: "#666c54", metalness: .5, roughness: .45 }));
    handle.scale.y = .67;
    handle.position.set(.28, top + neckHeight, 0);
    model.add(handle);
  }

  const labelZone = bodyHeight - (tin ? .18 : .48);
  const upper = top - (tin ? .08 : .40) - labelZone * offset / 100;
  const lower = Math.max(base + .11, upper - labelZone * labelHeight / 100);
  const wrap = paintWrap(artwork, upper - lower, (face) =>
    bodyRadius * (dorica ? Math.PI / 2 : 2) * (face === "front" || face === "back" ? 1 : depth));
  model.add(new THREE.Mesh(profileSurface([[bodyRadius + .008, lower], [bodyRadius + .008, upper]], depth, square), new THREE.MeshBasicMaterial({
    map: createTexture(wrap),
    color: "#ffffff",
    toneMapped: false,
    side: THREE.DoubleSide,
  })));
}

export function BottleScene(props: Properties) {
  const host = useRef<HTMLDivElement>(null);
  const instance = useRef<Renderer | null>(null);
  const drag = useRef<{ id: number; x: number; y: number; yaw: number; pitch: number } | null>(null);
  const [available, setAvailable] = useState(true);
  const [referenceFailed, setReferenceFailed] = useState(false);
  const referenceMaterial = useRef<THREE.MeshStandardMaterial | null>(null);
  const referenceLabel = useRef<THREE.Mesh | null>(null);
  const referenceBottle = useRef<THREE.Group | null>(null);
  const [referenceReady, setReferenceReady] = useState(false);
  const { artwork, format, volume, part, offset, labelHeight, yaw, pitch, zoom, referenceModel, useOriginalArtwork } = props;
  // Marasca and Dorica glass use the supplier-size models; PET, tin and the boxes stay procedural.
  const glass = part === "unit" && !referenceModel ? glassModelFor(format) : null;
  const glassUrl = glass?.url;
  const glassVolume = glass?.volume ?? 0;
  const [glassFailed, setGlassFailed] = useState<string | null>(null);
  const [glassReady, setGlassReady] = useState<string | null>(null);
  const glassScene = useRef<{ scene: THREE.Group; body: GlassBody; band: THREE.Group | null } | null>(null);
  const usingGlass = Boolean(glassUrl) && glassFailed !== glassUrl;

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      queueMicrotask(() => setAvailable(false));
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f1eee5");
    const softboxes = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(softboxes, .07, .1, 100, { size: 128 });
    scene.environment = environment.texture;
    scene.environmentIntensity = .86;
    softboxes.dispose();
    pmrem.dispose();
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 30);
    camera.position.set(0, .34, 6.25);
    camera.lookAt(0, -.02, 0);
    scene.add(new THREE.HemisphereLight("#fff8e9", "#5b6245", .62));
    const key = new THREE.DirectionalLight("#fff7e2", 1.15);
    key.position.set(-3, 5, 4);
    scene.add(key);
    const model = new THREE.Group();
    const shadow = contactShadow();
    scene.add(model, shadow);
    instance.current = { scene, camera, renderer, model, shadow };
    container.append(renderer.domElement);
    const resize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth || 320, clientHeight || 390);
      camera.aspect = (clientWidth || 320) / (clientHeight || 390);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    return () => {
      observer.disconnect();
      disposeModel(model);
      shadow.geometry.dispose();
      shadow.material.map?.dispose();
      shadow.material.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      instance.current = null;
    };
  }, []);

  useEffect(() => {
    const view = instance.current;
    if (!view || !referenceModel) return;
    let cancelled = false;
    void import("three/addons/loaders/GLTFLoader.js").then(async ({ GLTFLoader }) => {
      if (cancelled) return;
      const { scene } = await new GLTFLoader().loadAsync("/studio/models/orzeta-sun-1l-web.glb");
      if (cancelled) {
        disposeModel(scene);
        return;
      }
      disposeModel(view.model);
      referenceBottle.current = scene;
      view.model.add(scene);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial &&
          object.material.name === "ORZETA Sun original-reference printed wrap") {
          object.material.userData.originalArtwork = object.material.map;
          referenceMaterial.current = object.material;
          referenceLabel.current = object;
        }
      });
      setReferenceReady(true);
    }).catch(() => { if (!cancelled) setReferenceFailed(true); });
    return () => { cancelled = true; };
  }, [referenceModel]);

  useEffect(() => {
    const view = instance.current;
    const bottle = referenceBottle.current;
    if (!referenceReady || !view || !bottle) return;
    // Scale the photo-based 1 L mesh by volume until supplier CAD is available for each size.
    const scale = Math.cbrt(volume / 1000);
    bottle.scale.setScalar(10 * scale);
    bottle.position.y = -1.5 * scale;
    view.shadow.position.y = bottle.position.y - .018;
    view.shadow.scale.set(.72 * scale, .72 * scale, 1);
    view.renderer.render(view.scene, view.camera);
  }, [referenceReady, volume]);

  useEffect(() => {
    const view = instance.current;
    const label = referenceLabel.current;
    if (!referenceReady || !view || !label) return;
    if (useOriginalArtwork) {
      label.scale.y = 1;
      label.position.y = 0;
    } else {
      const top = Math.min(.194, .192 - (offset - 7) * .0018);
      const height = Math.max(.012, Math.min(top - .012, .162 * labelHeight / 84));
      label.scale.y = height / .162;
      label.position.y = top - .192 * label.scale.y;
    }
    view.renderer.render(view.scene, view.camera);
  }, [referenceReady, useOriginalArtwork, offset, labelHeight]);

  useEffect(() => {
    const referenceWrap = referenceMaterial.current;
    if (!referenceReady || !referenceWrap || useOriginalArtwork || !FACES.every((side) => artwork[side])) return;
    const atlas = document.createElement("canvas");
    atlas.width = 2048;
    atlas.height = LABEL_SIZE;
    const ctx = atlas.getContext("2d");
    if (!ctx) return;
    // The Blender atlas is authored front, right, back, left. The GLB image is top-down.
    BAND_ORDER.forEach((face, index) => {
      const panel = artwork[face];
      if (panel) ctx.drawImage(panel, index * 512, 0, 512, LABEL_SIZE);
    });
    const original = referenceWrap.map;
    const previousColor = referenceWrap.color.clone();
    const texture = createTexture(atlas);
    texture.flipY = false;
    texture.needsUpdate = true;
    referenceWrap.map = texture;
    referenceWrap.color.set("#ffffff");
    referenceWrap.needsUpdate = true;
    const view = instance.current;
    if (view) view.renderer.render(view.scene, view.camera);
    return () => {
      referenceWrap.map = original;
      referenceWrap.color.copy(previousColor);
      texture.dispose();
      if (instance.current) instance.current.renderer.render(instance.current.scene, instance.current.camera);
    };
  }, [artwork, referenceReady, useOriginalArtwork]);

  useEffect(() => {
    const view = instance.current;
    if (!view || (referenceModel && !referenceFailed) || usingGlass || !FACES.every((side) => artwork[side])) return;
    createModel(view.model, { format, volume, part, artwork, offset, labelHeight });
    const bounds = new THREE.Box3().setFromObject(view.model);
    view.shadow.position.y = bounds.min.y - .018;
    const size = bounds.getSize(new THREE.Vector3());
    view.shadow.scale.set(Math.max(.65, size.x * .77), Math.max(.65, size.z * .82), 1);
    view.renderer.render(view.scene, view.camera);
  }, [artwork, format, volume, part, offset, labelHeight, referenceModel, referenceFailed, usingGlass]);

  // Load the supplier model for this format.
  useEffect(() => {
    const view = instance.current;
    if (!view || !glassUrl || !usingGlass) return;
    let cancelled = false;
    void loadGlass(glassUrl).then((scene) => {
      if (cancelled) {
        disposeModel(scene);
        return;
      }
      disposeModel(view.model);
      glassScene.current = { scene, body: measureGlass(scene), band: null };
      view.model.add(scene);
      setGlassReady(glassUrl);
    }).catch(() => { if (!cancelled) setGlassFailed(glassUrl); });
    return () => {
      cancelled = true;
      const loaded = glassScene.current;
      if (loaded) {
        view.model.remove(loaded.scene);
        disposeModel(loaded.scene);
        glassScene.current = null;
      }
      setGlassReady(null);
    };
  }, [glassUrl, usingGlass]);

  // Size it for the selected volume, standing on the shadow.
  useEffect(() => {
    const view = instance.current;
    const loaded = glassScene.current;
    if (!view || !loaded || glassReady !== glassUrl) return;
    const scale = Math.cbrt(volume / glassVolume) * UNITS_PER_METRE;
    loaded.scene.scale.setScalar(scale);
    loaded.scene.position.y = -loaded.body.height * scale / 2;
    view.shadow.position.y = loaded.scene.position.y - .018;
    const width = (loaded.body.shape === "round" ? loaded.body.radius : loaded.body.half) * 2 * scale;
    view.shadow.scale.set(Math.max(.65, width * .9), Math.max(.65, width * .9), 1);
    view.renderer.render(view.scene, view.camera);
  }, [glassReady, glassUrl, glassVolume, volume]);

  // Wrap the client's label on the real body, inside the straight part of the wall.
  useEffect(() => {
    const view = instance.current;
    const loaded = glassScene.current;
    if (!view || !loaded || glassReady !== glassUrl || !FACES.every((side) => artwork[side])) return;
    const { body } = loaded;
    const zone = body.top - body.bottom;
    const upper = body.top - zone * offset / 100;
    const lower = Math.max(body.bottom, upper - zone * labelHeight / 100);
    const { geometry, perimeter } = labelBand(glassOutline(body, LABEL_GAP), lower, upper);
    const texture = createTexture(paintWrap(artwork, upper - lower, () => perimeter / BAND_ORDER.length));
    const band = new THREE.Group();
    band.add(
      new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })),
      // The inside of the label, seen through the glass: plain paper, not mirrored artwork.
      new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: "#efe9dc", roughness: .9, side: THREE.BackSide })),
    );
    if (loaded.band) {
      loaded.scene.remove(loaded.band);
      disposeModel(loaded.band);
    }
    loaded.band = band;
    loaded.scene.add(band);
    view.renderer.render(view.scene, view.camera);
  }, [artwork, glassReady, glassUrl, offset, labelHeight]);

  useEffect(() => {
    const view = instance.current;
    if (!view) return;
    view.model.rotation.set(THREE.MathUtils.degToRad(pitch), THREE.MathUtils.degToRad(yaw), 0);
    view.camera.zoom = zoom / 100;
    view.camera.updateProjectionMatrix();
    view.renderer.render(view.scene, view.camera);
  }, [yaw, pitch, zoom]);

  return (
    <div className="studio-model-canvas" ref={host} role="img" aria-label={`Rotatable ${part === "unit" ? format : part} preview`}
      onPointerDown={(event) => {
        if (!props.onRotate || !event.isPrimary || event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw, pitch };
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        if (start?.id !== event.pointerId) return;
        const angle = THREE.MathUtils.euclideanModulo(start.yaw + (event.clientX - start.x) * .6 + 180, 360) - 180;
        props.onRotate?.(Math.round(angle), Math.round(THREE.MathUtils.clamp(start.pitch + (event.clientY - start.y) * .45, -90, 90)));
      }}
      onLostPointerCapture={() => { drag.current = null; }}>
      {!available && <p className="p-6 text-sm text-mid">3D is unavailable in this browser. Use the flat label or product reference.</p>}
      {available && referenceModel && referenceFailed && <p className="p-3 text-xs text-mid">Reference model unavailable. Showing editable artwork.</p>}
    </div>
  );
}
