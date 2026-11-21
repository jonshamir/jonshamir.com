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
  Mesh,
  OneFactor,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  type Texture,
  Vector4,
  WebGLRenderTarget
} from "three";

import type { OutlineControls, RenderControls } from "./fernControls";
import {
  compositeFragment,
  compositeVertex,
  shapeFragment,
  splatVertex
} from "./fernShaders";
import { type FrondGeometry, MAX_PRIMITIVES } from "./generator/generateFrond";

const MARGINS: Record<string, number> = { entire: 0, crenate: 1, serrate: 2 };
const ATTRIBUTES = ["iA", "iB", "iC"] as const;

type FernRendererProps = {
  frond: FrondGeometry;
  outline: OutlineControls;
  render: RenderControls;
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

  const shapeUniforms = {
    uPad: { value: 0 },
    uK: { value: 0.001 },
    uCutoff: { value: 0 },
    uInner: { value: 0 },
    uMargin: { value: 0 },
    uTeeth: { value: 8 },
    uToothDepth: { value: 0 },
    uEnvelope: { value: new Vector4() }
  };

  const shapeMaterial = new ShaderMaterial({
    vertexShader: splatVertex,
    fragmentShader: shapeFragment,
    uniforms: shapeUniforms,
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

  const shapeScene = new Scene();
  const shapeMesh = new Mesh(geometry, shapeMaterial);
  shapeMesh.frustumCulled = false;
  shapeScene.add(shapeMesh);

  const compositeUniforms = {
    uShape: { value: null as Texture | null },
    uK: shapeUniforms.uK,
    uPixel: { value: 0.001 },
    uColor: { value: new Color() }
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
    shapeUniforms,
    compositeUniforms,
    shapeMaterial,
    compositeMaterial,
    shapeScene,
    compositeScene,
    compositeCamera: new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  };
}

export function FernRenderer({ frond, outline, render }: FernRendererProps) {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const r = useMemo(createResources, []);

  const scale = dpr * render.resolution;
  const target = useMemo(
    () =>
      new WebGLRenderTarget(
        Math.max(1, Math.round(size.width * scale)),
        Math.max(1, Math.round(size.height * scale)),
        {
          type: HalfFloatType,
          format: RGBAFormat,
          minFilter: LinearFilter,
          magFilter: LinearFilter,
          depthBuffer: false,
          stencilBuffer: false
        }
      ),
    [size.width, size.height, scale]
  );

  useEffect(() => {
    r.compositeUniforms.uShape.value = target.texture;
    return () => target.dispose();
  }, [target, r]);

  useEffect(() => {
    const sources = [frond.a, frond.b, frond.c];
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
    const u = r.shapeUniforms;
    u.uMargin.value = MARGINS[outline.margin] ?? 0;
    u.uTeeth.value = outline.teeth;
    u.uToothDepth.value = outline.toothDepth;
    u.uEnvelope.value.set(
      outline.tMax,
      outline.base,
      outline.baseExp,
      outline.apexExp
    );
  }, [outline, r]);

  useEffect(() => {
    r.compositeUniforms.uColor.value.set(render.color);
  }, [render.color, r]);

  useEffect(
    () => () => {
      r.geometry.dispose();
      r.plane.dispose();
      r.shapeMaterial.dispose();
      r.compositeMaterial.dispose();
    },
    [r]
  );

  const clearColor = useMemo(() => new Color(), []);

  useFrame((state) => {
    const camera = state.camera as OrthographicCamera;
    const pixel = 1 / (camera.zoom * scale);

    const inner = 2 * pixel;
    const k = Math.max(render.softness, inner / 6, 0.35 * pixel);
    const pad = Math.max(8 * k, 4 * pixel);

    const u = r.shapeUniforms;
    u.uK.value = k;
    u.uInner.value = inner;
    u.uCutoff.value = pad;
    u.uPad.value = pad;
    r.compositeUniforms.uPixel.value = pixel;

    gl.getClearColor(clearColor);
    const clearAlpha = gl.getClearAlpha();
    gl.setClearColor(0x000000, 0);

    gl.setRenderTarget(target);
    gl.clear();
    gl.render(r.shapeScene, camera);

    gl.setRenderTarget(null);
    gl.clear();
    gl.render(r.compositeScene, r.compositeCamera);

    gl.setClearColor(clearColor, clearAlpha);
  }, 1);

  return null;
}
