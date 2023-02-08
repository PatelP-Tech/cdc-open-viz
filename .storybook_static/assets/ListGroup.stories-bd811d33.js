import{M as N,C as G,S as q,A as I}from"./index-676c21af.js";import{a as p,F as w,j as t}from"./jsx-runtime-670450c2.js";import{r as g}from"./index-f1f749bf.js";import{p as n}from"./index-4d501b15.js";import{u as M}from"./configStore-d2c2b356.js";import{I as O}from"./Icon-11079a09.js";import{I as X}from"./InputSelect-9a6c7749.js";import{L as k}from"./Label-ecfa30b4.js";import{T as C}from"./Tooltip-ed90ab02.js";import{u as L}from"./index-9ec211f2.js";import"./preload-helper-41c905a7.js";import"./chunk-GWAJ4KRU-d69fdc61.js";import"./index-c4724429.js";import"./index-d475d2ea.js";import"./memoizerific-a8c4a000.js";import"./index-a253c635.js";import"./chunk-XHUUYXNA-19dd1a76.js";import"./chunk-FD4M6EBV-8d27da22.js";import"./chunk-NNAAFZ4U-67fa674f.js";import"./chunk-3EFM6HRY-4c51b38f.js";import"./_getTag-6acf5a83.js";import"./_commonjsHelpers-042e6b4d.js";import"./_baseIsEqual-0821e666.js";import"./index-8796c665.js";import"./index-356e4a49.js";import"./middleware-8046ed8c.js";/* empty css              */import"./index-286867b9.js";const W=250,D=150,S=e=>e.charAt(0).toUpperCase()+e.slice(1),F=e=>e===Object(e),H=(e,s)=>Object.keys(s).map(r=>r===e?s[e]:null)[0],E=({textValueKey:e,listData:s,canClear:i,options:r,optionsSection:m,optionsSubsection:u,removeAction:d,index:v})=>{const{updateConfigField:h}=M(),[l,_]=g.useState(0);g.useEffect(()=>{const o=document.createElement("span");o.style.opacity="0",o.style.visibility="hidden",o.style.position="absolute",o.appendChild(document.createTextNode(e)),document.body.appendChild(o),_(o.offsetWidth),document.body.removeChild(o)},[]);const b=()=>r?l>D:l>W,f=o=>{let a=[...s];a[v][u]=o.target.value,h([m,u],{...a})};return p("li",{className:`cove-list-group__item${r?" cove-list-group__item--has-option":""}${b()?" cove-list-group__item--truncate":""}`,children:[t("div",{className:"cove-list-group__item-value",children:b()?p(C,{float:!0,children:[t(C.Target,{children:t("div",{className:"cove-list-group__item-value__text",children:S(e)})}),t(C.Content,{children:S(e)})]}):t("div",{className:"cove-list-group__item-value__text",children:S(e)})}),p("div",{className:"cove-list-group__item-children",children:[r&&t(X,{className:"mr-1",options:r[0],style:{width:"100px"},onChange:o=>f(o)}),d&&(i||s.length>1)&&t("div",{className:"cove-list-group__item-remove",children:t(O,{display:"close",size:16,onClick:()=>d(e)})})]})]})},c=({label:e,tooltip:s,items:i,textValueKey:r,canClear:m=!0,options:u,optionsSection:d,optionsSubsection:v,removeAction:h})=>{const[l,_]=g.useState(i);return g.useEffect(()=>{_(i)},[i]),p(w,{children:[e&&t(k,{tooltip:s||null,children:e}),t("ul",{className:"cove-list-group",children:i&&(f=>{let o=[];return f&&f.map((a,x)=>{if(F(a)){let j=H(r,a);return o.push(t(E,{textValueKey:j,listData:l,canClear:m,options:u,optionsSection:d,optionsSubsection:v,removeAction:h,index:x},x))}return o.push(t(E,{textValueKey:a,listData:l,canClear:m,removeAction:h},x))}),o})(i)})]})};c.propTypes={label:n.string,canClear:n.bool,textValueKey:n.string,options:n.array,optionsSection:n.string,optionsSubsection:n.string,removeAction:n.func,items:n.array,tooltip:n.oneOfType([n.string,n.object])};c.__docgenInfo={description:"",methods:[],displayName:"ListGroup",props:{canClear:{defaultValue:{value:"true",computed:!1},type:{name:"bool"},required:!1,description:"Allow all items from the list to be removed. Set `false` to force at least 1 to remain"},label:{type:{name:"string"},required:!1,description:"Supply a label for the ListGroup"},textValueKey:{type:{name:"string"},required:!1,description:"Supply the key name containing the value to be used when populating the text value"},options:{type:{name:"array"},required:!1,description:"Array list of values for additional dropdown selections on each list item"},optionsSection:{type:{name:"string"},required:!1,description:"First config key value to target when updating the option of the dropdown"},optionsSubsection:{type:{name:"string"},required:!1,description:"Second, nested config key value to target when updating the option of the dropdown"},removeAction:{type:{name:"func"},required:!1,description:"Callback function to trigger when removing an item from the ListGroup"},items:{type:{name:"array"},required:!1,description:"Array of strings, or objects, used to populate the list. If objects are used, each entry's key is set to the text and the value is set to the value of"},tooltip:{type:{name:"union",value:[{name:"string"},{name:"object"}]},required:!1,description:"Add a tooltip to describe the ListGroup's usage; JSX markup can also be supplied"}}};const A=({...e})=>t(c,{...e});function J(e={}){const{wrapper:s}=Object.assign({},L(),e.components);return s?t(s,{...e,children:t(i,{})}):i();function i(){const r=Object.assign({h1:"h1",p:"p",h2:"h2"},L(),e.components);return p(w,{children:[t(N,{title:"Components/Element/ListGroup",component:c}),`
`,t(r.h1,{children:"Header"}),`
`,t(r.p,{children:"Content Text"}),`
`,t(r.h2,{children:"Subheader"}),`
`,t(G,{sourceState:"shown",withSource:"open",children:t(q,{name:"Example",args:{label:"State Values",canClear:!0,options:["Line","Bar","Wave"],removeAction:()=>alert("Removed"),items:["test","test2","test3"],tooltip:"This is an <strong>example</strong> tooltip."},children:A.bind({})})}),`
`,t(I,{story:"Example"})]})}}const T=A.bind({});T.storyName="Example";T.args={label:"State Values",canClear:!0,options:["Line","Bar","Wave"],removeAction:()=>alert("Removed"),items:["test","test2","test3"],tooltip:"This is an <strong>example</strong> tooltip."};T.parameters={storySource:{source:`({ ...args
}) => <ListGroup {...args} />`}};const y={title:"Components/Element/ListGroup",component:c,tags:["stories-mdx"],includeStories:["example"]};y.parameters=y.parameters||{};y.parameters.docs={...y.parameters.docs||{},page:J};const ye=["Template","example"];export{A as Template,ye as __namedExportsOrder,y as default,T as example};
//# sourceMappingURL=ListGroup.stories-bd811d33.js.map
