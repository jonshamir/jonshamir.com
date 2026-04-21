"use client";
import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("./CampfireCanvas"), { ssr: false });
export default Canvas;
