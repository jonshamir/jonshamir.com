"use client";

import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("./TopoCanvas"), { ssr: false });

export default Canvas;
