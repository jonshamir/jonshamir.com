import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  AddEquation,
  Color,
  CustomBlending,
  DynamicDrawUsage,
  HalfFloatType,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearFilter,
  MaxEquation,
  Mesh,
  OneFactor,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  Vector2,
  Vector3,
  WebGLRenderTarget
} from "three";

import type {
  ColorControls,
  OutlineControls,
  ShadingControls,
  VenationControls
} from "./fernControls";
import {
  attributeFragment,
  compositeFragment,
  compositeVertex,
  shapeFragment,
  splatVertex
} from "./fernShaders";
import { type FrondGeometry, MAX_PRIMITIVES } from "./generator/generateFrond";

const MARGINS: Record<string, number> = { entire: 0, crenate: 1, serrate: 2 };
const ATTRIBUTES = ["iA", "iB", "iC", "iD"] as const;
const DEG = Math.PI / 180;

type FernRendererProps = {
  frond: FrondGeometry;
  outline: OutlineControls;
  venation: VenationControls;
  shading: ShadingControls;
  colors: ColorControls;
};

function createResources() {
  const plane = new PlaneGeometry(2, 2);
  const geometry = new InstancedBufferGeometry();
  geometry.index = plane.index;
  geometry.setAttribute("position", plane.getAttribute("position"));
  for (const name of ATTRIBUTES) {
    const attribute = new InstancedBufferAttribute(
      new Float32Array(MAX_PRIMITIVES * 4),
      4
    );
    attribute.setUsage(DynamicDrawUsage);
    geometry.setAttribute(name, attribute);
  }
  geometry.instanceCount = 0;

  const splatUniforms = {
    uPad: { value: 0 },
    uPixel: { value: 0.001 },
    uK: { value: 0.001 },
    uMargin: { value: 0 },
    uToothDepth: { value: 0 },
    uCutoff: { value: 0 },
    uInner: { value: 0 },
    uLight: { value: new Vector3(0, 0, 1) },
    uFold: { value: 0 },
    uVeinType: { value: 1 },
    uVeinAngle: { value: 0.8 },
    uForkAt: { value: 0.4 }
  };

  const shapeMaterial = new ShaderMaterial({
    vertexShader: splatVertex,
    fragmentShader: shapeFragment,
    uniforms: splatUniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: CustomBlending,
    blendEquation: AddEquation,
    blendSrc: OneFactor,
    blendDst: OneFactor,
    blendEquationAlpha: AddEquation,
    blendSrcAlpha: OneFactor,
    blendDstAlpha: OneFactor
  });

  const attributeMaterial = new ShaderMaterial({
    vertexShader: splatVertex,
    fragmentShader: attributeFragment,
    uniforms: splatUniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: CustomBlending,
    blendEquation: MaxEquation,
    blendEquationAlpha: MaxEquation
  });

  const shapeScene = new Scene();
  const shapeMesh = new Mesh(geometry, shapeMaterial);
  shapeMesh.frustumCulled = false;
  shapeScene.add(shapeMesh);

  const attributeScene = new Scene();
  const attributeMesh = new Mesh(geometry, attributeMaterial);
  attributeMesh.frustumCulled = false;
  attributeScene.add(attributeMesh);

  const compositeUniforms = {
    uShape: { value: null as WebGLRenderTarget["texture"] | null },
    uAttr: { value: null as WebGLRenderTarget["texture"] | null },
    uK: splatUniforms.uK,
    uPixel: splatUniforms.uPixel,
    uOutline: { value: 1 },
    uBands: { value: 3 },
    uAmbient: { value: 0.25 },
    uShadow: { value: 0.25 },
    uShadowOffset: { value: new Vector2() },
    uLeafLight: { value: new Color() },
    uLeafDark: { value: new Color() },
    uAxis: { value: new Color() },
    uVein: { value: new Color() },
    uOutlineColor: { value: new Color() },
    uShadowColor: { value: new Color() }
  };

  const compositeMaterial = new ShaderMaterial({
    vertexShader: compositeVertex,
    fragmentShader: compositeFragment,
    uniforms: compositeUniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false
  });
  const compositeScene = new Scene();
  const compositeMesh = new Mesh(plane, compositeMaterial);
  compositeMesh.frustumCulled = false;
  compositeScene.add(compositeMesh);

  return {
    geometry,
    plane,
    splatUniforms,
    compositeUniforms,
    shapeMaterial,
    attributeMaterial,
    compositeMaterial,
    shapeScene,
    attributeScene,
    compositeScene,
    compositeCamera: new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  };
}

function createTarget(width: number, height: number, half: boolean) {
  return new WebGLRenderTarget(width, height, {
    type: half ? HalfFloatType : UnsignedByteType,
    format: RGBAFormat,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
    stencilBuffer: false
  });
}

export function FernRenderer({
  frond,
  outline,
  venation,
  shading,
  colors
}: FernRendererProps) {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const r = useMemo(createResources, []);

  const scale = dpr * shading.resolution;
  const targets = useMemo(() => {
    const width = Math.max(1, Math.round(size.width * scale));
    const height = Math.max(1, Math.round(size.height * scale));
    return {
      shape: createTarget(width, height, true),
      attr: createTarget(width, height, false),
      width,
      height
    };
  }, [size.width, size.height, scale]);

  useEffect(() => {
    r.compositeUniforms.uShape.value = targets.shape.texture;
    r.compositeUniforms.uAttr.value = targets.attr.texture;
    return () => {
      targets.shape.dispose();
      targets.attr.dispose();
    };
  }, [targets, r]);

  useEffect(() => {
    const sources = [frond.a, frond.b, frond.c, frond.d];
    ATTRIBUTES.forEach((name, i) => {
      const attribute = r.geometry.getAttribute(
        name
      ) as InstancedBufferAttribute;
      (attribute.array as Float32Array).set(
        sources[i].subarray(0, frond.count * 4)
      );
      attribute.clearUpdateRanges();
      attribute.addUpdateRange(0, frond.count * 4);
      attribute.needsUpdate = true;
    });
    r.geometry.instanceCount = frond.count;
  }, [frond, r]);

  useEffect(() => {
    const u = r.splatUniforms;
    u.uMargin.value = MARGINS[outline.margin] ?? 0;
    u.uToothDepth.value = outline.toothDepth;
  }, [outline.margin, outline.toothDepth, r]);

  useEffect(() => {
    const u = r.splatUniforms;
    u.uVeinType.value = venation.type === "forked" ? 1 : 0;
    u.uVeinAngle.value = venation.angle * DEG;
    u.uForkAt.value = venation.forkAt;
  }, [venation, r]);

  useEffect(() => {
    const yaw = shading.lightYaw * DEG;
    const pitch = shading.lightPitch * DEG;
    r.splatUniforms.uLight.value.set(
      Math.cos(pitch) * Math.cos(yaw),
      Math.cos(pitch) * Math.sin(yaw),
      Math.sin(pitch)
    );
    r.splatUniforms.uFold.value = shading.fold;

    const c = r.compositeUniforms;
    c.uOutline.value = shading.outline;
    c.uBands.value = shading.bands;
    c.uAmbient.value = shading.ambient;
    c.uShadow.value = shading.shadow;
  }, [shading, r]);

  useEffect(() => {
    const c = r.compositeUniforms;
    c.uLeafLight.value.set(colors.leafLight);
    c.uLeafDark.value.set(colors.leafDark);
    c.uAxis.value.set(colors.axis);
    c.uVein.value.set(colors.vein);
    c.uOutlineColor.value.set(colors.outline);
    c.uShadowColor.value.set(colors.shadow);
  }, [colors, r]);

  useEffect(
    () => () => {
      r.geometry.dispose();
      r.plane.dispose();
      r.shapeMaterial.dispose();
      r.attributeMaterial.dispose();
      r.compositeMaterial.dispose();
    },
    [r]
  );

  const clearColor = useMemo(() => new Color(), []);

  useFrame((state) => {
    const camera = state.camera as OrthographicCamera;
    const pixel = 1 / (camera.zoom * scale);

    const inner = (shading.outline + 2) * pixel;
    const k = Math.max(shading.softness, inner / 6, 0.35 * pixel);
    const pad = Math.max(8 * k, 4 * pixel);

    const u = r.splatUniforms;
    u.uPixel.value = pixel;
    u.uK.value = k;
    u.uInner.value = inner;
    u.uCutoff.value = pad;
    u.uPad.value = pad;

    const offset = shading.shadowOffset * scale;
    r.compositeUniforms.uShadowOffset.value.set(
      offset / targets.width,
      -offset / targets.height
    );

    gl.getClearColor(clearColor);
    const clearAlpha = gl.getClearAlpha();
    gl.setClearColor(0x000000, 0);

    gl.setRenderTarget(targets.shape);
    gl.clear();
    gl.render(r.shapeScene, camera);

    gl.setRenderTarget(targets.attr);
    gl.clear();
    gl.render(r.attributeScene, camera);

    gl.setRenderTarget(null);
    gl.clear();
    gl.render(r.compositeScene, r.compositeCamera);

    gl.setClearColor(clearColor, clearAlpha);
  }, 1);

  return null;
}
