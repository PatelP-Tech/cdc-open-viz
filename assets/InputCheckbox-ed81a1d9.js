import{a as y,j as c}from"./jsx-runtime-670450c2.js";import{r as a}from"./index-f1f749bf.js";import{p as t}from"./index-4d501b15.js";import{u as N}from"./useVisConfig-ed2d617d.js";import{g as O}from"./store-4dc22f46.js";import{I as L}from"./Icon-84bbcad3.js";import{L as T}from"./Label-a6b7661b.js";/* empty css              */const x=a.memo(({label:i,labelPosition:s="right",tooltip:u,size:C="small",activeColor:p=null,activeCheckColor:_=null,stretch:S,required:z,configField:l,value:q,className:h,onClick:m,...A})=>{const{config:V,updateVisConfigField:g}=N(),[o,d]=a.useState(!1),b=a.useRef(null),n=l&&O(l,V),v=Boolean(n&&typeof n!==void 0);a.useEffect(()=>{v?n!==o&&d(n):d(q)},[v]),a.useEffect(()=>{l&&o!==n&&g(l,o)},[l,o,g]);const f=()=>b.current.click(),w=e=>{d(r=>!r),m&&m(e)},I=()=>{const e=[],r="cove-input__checkbox-group";return e.push(r),S&&e.push("cove-input__checkbox-group--stretch"),h&&e.push(h),e.join(" ")},j=()=>{const e=[],r="cove-input__checkbox",E={small:"",medium:"--medium",large:"--large",xlarge:"--xlarge"};return e.push(r+E[C]),o&&e.push("cove-input__checkbox--active"),e.join(" ")},k=()=>c("div",{className:"cove-input__checkbox-group__label",...u&&u!==""&&{"data-has-tooltip":!0},children:c(T,{tooltip:u,onClick:f,children:i})});return y("div",{className:I(),flow:s,children:[i&&s==="left"&&c(k,{}),y("div",{className:j(),tabIndex:0,onClick:f,onKeyUp:e=>{(e.code==="Enter"||e.code==="NumpadEnter"||e.code==="Space")&&f()},children:[c("div",{className:`cove-input__checkbox-box${p?" cove-input__checkbox-box--custom-color":""}`,style:o&&p?{backgroundColor:p}:null,children:c(L,{display:"check",className:"cove-input__checkbox-check",color:_||"#025eaa"})}),c("input",{className:"cove-input--hidden",type:"checkbox",defaultChecked:o,onChange:e=>w(e),ref:b,tabIndex:-1,readOnly:!0})]}),i&&s==="right"&&c(k,{})]})});x.propTypes={label:t.string,labelPosition:t.oneOf(["left","right"]),size:t.oneOf(["small","medium","large"]),activeColor:t.string,activeCheckColor:t.string,tooltip:t.oneOfType([t.string,t.object]),stretch:t.bool,configField:t.oneOfType([t.string,t.array]),onClick:t.func};x.__docgenInfo={description:"",methods:[],displayName:"InputCheckbox",props:{labelPosition:{defaultValue:{value:"'right'",computed:!1},type:{name:"enum",value:[{value:"'left'",computed:!1},{value:"'right'",computed:!1}]},required:!1,description:"Position the label relative to the checkbox"},size:{defaultValue:{value:"'small'",computed:!1},type:{name:"enum",value:[{value:"'small'",computed:!1},{value:"'medium'",computed:!1},{value:"'large'",computed:!1}]},required:!1,description:"Select the preferred size of the checkbox"},activeColor:{defaultValue:{value:"null",computed:!1},type:{name:"string"},required:!1,description:"Select the preferred color for the checkbox fill when active"},activeCheckColor:{defaultValue:{value:"null",computed:!1},type:{name:"string"},required:!1,description:"Select the preferred color for the checkbox's check when active"},label:{type:{name:"string"},required:!1,description:"Add label to the input field"},tooltip:{type:{name:"union",value:[{name:"string"},{name:"object"}]},required:!1,description:"Add a tooltip to describe the checkbox's usage; JSX markup can also be supplied"},stretch:{type:{name:"bool"},required:!1,description:"Stretch the checkbox and its label to fill the width of its container"},configField:{type:{name:"union",value:[{name:"string"},{name:"array"}]},required:!1,description:"Supply a reference to the config key this input connects to, if any.<br/><br/>\n**String**<br/>\n`configField=\"title\"` will connect to the `config.title` value.<br/><br/>\n**Array**<br/>\n`configField={[ 'componentStyle', 'shadow' ]}` will connect to the `config.componentStyle.shadow` value. <br/><br/>\nSee [setConfigKeyValue](https://cdcgov.github.io/cdc-open-viz/?path=/docs/helpers-confighelpers-setconfigkeyvalue--docs) for more details."},onClick:{type:{name:"func"},required:!1,description:"Function to call when the input is clicked"}}};export{x as I};
//# sourceMappingURL=InputCheckbox-ed81a1d9.js.map
