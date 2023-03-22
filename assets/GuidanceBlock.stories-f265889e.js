import{M as x,C as T,S as B,A as C}from"./index-d00d5d05.js";import{a as c,F as g,j as e}from"./jsx-runtime-670450c2.js";import{r as w}from"./index-f1f749bf.js";import{p}from"./index-4d501b15.js";import{I as E}from"./Icon-e6436e69.js";import{u}from"./index-4fb8b842.js";import"./iframe-a7047431.js";import"../sb-preview/runtime.mjs";import"./index-6e91e324.js";import"./index-d475d2ea.js";import"./index-96c5f47c.js";import"./_commonjsHelpers-042e6b4d.js";import"./index-d37d4223.js";import"./index-53833bae.js";import"./index-356e4a49.js";const y=()=>null,b=()=>null,n=({linkTo:o,icon:t,target:a="_blank",accentColor:r="#005eaa",children:v,className:f,..._})=>{const k=w.Children.toArray(v),s=k.find(i=>(i==null?void 0:i.type)===y),l=k.find(i=>(i==null?void 0:i.type)===b);return c(g,{children:[r&&e("style",{children:`.cove-guidance-block:before {
        background: ${r};
      }`}),c("a",{className:`cove-guidance-block${f?" "+f:""}`,href:o||"#",target:a,..._,children:[t&&e("div",{className:"cove-guidance-block__icon",style:{color:r||null},children:e(E,{display:t,base:!0})}),c("div",{className:"cove-guidance-block__content-wrapper",children:[s&&e("h3",{className:"cove-guidance-block__header",children:s==null?void 0:s.props.children}),l&&e("div",{className:"cove-guidance-block__content",children:l==null?void 0:l.props.children})]})]})]})};n.Title=y;n.Content=b;n.propTypes={linkTo:p.string,icon:p.string,target:p.string,accentColor:p.string};n.__docgenInfo={description:"",methods:[{name:"Title",docblock:null,modifiers:["static"],params:[],returns:null},{name:"Content",docblock:null,modifiers:["static"],params:[],returns:null}],displayName:"GuidanceBlock",props:{target:{defaultValue:{value:"'_blank'",computed:!1},type:{name:"string"},required:!1,description:"Specify the `target` namespace for the link to use when opened. `_blank` can be used to open the link in a new tab"},accentColor:{defaultValue:{value:"'#005eaa'",computed:!1},type:{name:"string"},required:!1,description:"Override the default icon and border accent color"},linkTo:{type:{name:"string"},required:!1,description:"Specify an internal/external link that is opened when users click the Guidance Block"},icon:{type:{name:"string"},required:!1,description:"Display an icon by your block by supplying a valid Icon component code; see the [Components/UI/Icon](../?path=/docs/components-ui-icon--docs) section for options"}}};const G=({...o})=>{const t=Object.assign({p:"p"},u());return n||m("GuidanceBlock",!1),n.Content||m("GuidanceBlock.Content",!0),n.Title||m("GuidanceBlock.Title",!0),c(n,{...o,children:[e(n.Title,{children:"Get Help"}),e(n.Content,{children:e(t.p,{children:"Click here for more information and resources to assist you further."})})]})};function M(o={}){const{wrapper:t}=Object.assign({},u(),o.components);return t?e(t,{...o,children:e(a,{})}):a();function a(){const r=Object.assign({h1:"h1",p:"p"},u(),o.components);return c(g,{children:[e(x,{title:"Components/Element/GuidanceBlock",component:n}),`
`,e(r.h1,{children:"GuidanceBlock Component"}),`
`,e(r.p,{children:"The GuidanceBlock component is used for prominently highlighting either informative, or call-to-action, content."}),`
`,e(r.p,{children:"They primarily assist users by either providing context, or by directing them to related content links."}),`
`,e(T,{sourceState:"shown",withSource:"open",children:e(B,{name:"Example",args:{linkTo:"https://www.cdc.gov",icon:"mapFolded"},children:G.bind({})})}),`
`,e(C,{story:"Example"})]})}}function m(o,t){throw new Error("Expected "+(t?"component":"object")+" `"+o+"` to be defined: you likely forgot to import, pass, or provide it.")}const h=G.bind({});h.storyName="Example";h.args={linkTo:"https://www.cdc.gov",icon:"mapFolded"};h.parameters={storySource:{source:`({ ...args
}) => <GuidanceBlock {...args}>
  <GuidanceBlock.Title>
    Get Help
  </GuidanceBlock.Title>
  <GuidanceBlock.Content>
    <p>Click here for more information and resources to assist you further.</p>
  </GuidanceBlock.Content>
</GuidanceBlock>`}};const d={title:"Components/Element/GuidanceBlock",component:n,tags:["stories-mdx"],includeStories:["example"]};d.parameters=d.parameters||{};d.parameters.docs={...d.parameters.docs||{},page:M};const U=["Template","example"];export{G as Template,U as __namedExportsOrder,d as default,h as example};
//# sourceMappingURL=GuidanceBlock.stories-f265889e.js.map
