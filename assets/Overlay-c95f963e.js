import{j as o,F as d,a as h}from"./jsx-runtime-670450c2.js";import{r}from"./index-f1f749bf.js";import{r as p}from"./index-96c5f47c.js";import{u as v}from"./globalStore-3225bb68.js";const O=({anchor:l})=>{let{overlay:e,toggleOverlay:c}=v(),m=l===!0?l.current:document.body;const[f,i]=r.useState(!1),[n,s]=r.useState(null),[a,u]=r.useState(!1);return r.useEffect(()=>{if((e==null?void 0:e.show)===void 0||(e==null?void 0:e.show)===!1)return;document.body.style.overflow="hidden",i(!0),s("animate-in");const t=setTimeout(()=>{s("show")},750);return()=>clearTimeout(t)},[e==null?void 0:e.show]),r.useEffect(()=>{if((e==null?void 0:e.show)===void 0||(e==null?void 0:e.show)===!0)return;s("animate-out");const t=setTimeout(()=>{s(null),i(!1),document.body.style.overflow=null},400);return()=>clearTimeout(t)},[e==null?void 0:e.show]),r.useEffect(()=>{if(a===!1)return;const t=setTimeout(()=>{u(!1)},400);return()=>clearTimeout(t)},[a]),p.createPortal(o(d,{children:f&&h("div",{className:`cove cove-overlay${n?" "+n:""}${a?" overlay-error":""}`,children:[o("div",{className:"cove-overlay__bg",style:{cursor:e!=null&&e.disableBgClose?"default":null},onClick:t=>e!=null&&e.disableBgClose?u(!0):e?c(!1):t.preventDefault(),role:"alert"}),o("div",{className:"cove-overlay__wrapper",children:o("div",{className:"cove-overlay__container",children:e==null?void 0:e.object})})]})}),m)};export{O};
//# sourceMappingURL=Overlay-c95f963e.js.map