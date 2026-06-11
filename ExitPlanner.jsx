import { useState, useEffect, useCallback, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine, ComposedChart, Area } from "recharts";

// ─── AI FEATURE SWITCH ────────────────────────────────────────────────────────
// The AI features (industry metric guidance + executive summary) call a serverless
// function at /api/anthropic (it keeps the secret API key safe on the server).
// They stay OFF until BOTH:
//   1) VITE_AI_ENABLED=true is set in Vercel → Settings → Environment Variables, and
//   2) ANTHROPIC_API_KEY is set there too.
// See README → "Turning on the AI features". With AI off, every other feature works.
const AI_ENABLED = import.meta.env.VITE_AI_ENABLED === "true";

// ─── DESIGN TOKENS — DECIDEDLY WEALTH MANAGEMENT BRAND ────────────────────────
// Primary #063894 · Dark Navy #021966 · Bright Blue #3174de · Charcoal #2d2d2d
// The "gold"/"goldLight" keys are retained for code stability but now hold the
// Decidedly blue accents. Fonts: Playfair Display (headlines) + Nunito (body).
const C = {
  navy:"#021966",navyMid:"#063894",gold:"#3174de",goldLight:"#a9cbf7",
  cream:"#eef2f9",creamDark:"#d4ddec",slate:"#2d2d2d",slateLight:"#6b7280",
  white:"#FFFFFF",green:"#1f7a5c",red:"#C0392B",amber:"#D97706",
  border:"rgba(6,56,148,0.16)",
};
const fonts=`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,700&family=Nunito:wght@300;400;600;700;800&display=swap');`;

// ─── DECIDEDLY LOGOMARK (official brand mark, embedded as transparent PNG) ────
const LOGO_URI = "data:image/png;base64,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";
function Logomark({size=40}){
  return <img src={LOGO_URI} width={size} height={size} alt="Decidedly" style={{display:"block",flexShrink:0,objectFit:"contain"}}/>;
}

// ─── INDUSTRY DATA — broad umbrella categories covering all family businesses ──
// Multiple ranges are published, cited transaction benchmarks (not opinion). The
// free-text "description" field lets the in-app AI match the specific sub-segment
// within these ranges. `sources` are surfaced in the UI next to every number.
const INDUSTRIES = {
  retail:{ label:"Retail & E-Commerce", sdeMin:2.0,sdeMax:3.3,ebitdaMin:3.5,ebitdaMax:4.8,revenueMultiple:0.5,growthBenchmark:0.07,marginBenchmark:0.40, notes:"Gross margin is the dominant driver. Omnichannel / e-commerce capability runs ~15–25% above brick-and-mortar only. Inventory levels and lease terms matter to buyers.", sources:["Sofer Advisors — Retail Valuation Multiples 2026 (2.51–3.19x SDE; 3.68–4.54x EBITDA)","BizBuySell Insight Report, Q4 2025","DealStream — Retail Store Rules of Thumb"], comparables:[{size:"Brick-and-mortar",range:"2.51x–3.19x SDE",source:"Sofer Advisors 2026"},{size:"E-commerce",range:"2.0x–3.5x SDE / 3.5x–5.5x EBITDA",source:"ExitsHub 2026"},{size:"Revenue check",range:"0.4x–0.7x Revenue",source:"BizBuySell 2025"}] },
  construction:{ label:"Construction & Trades", sdeMin:2.0,sdeMax:3.5,ebitdaMin:3.5,ebitdaMax:5.5,revenueMultiple:0.6,growthBenchmark:0.08,marginBenchmark:0.18, notes:"Backlog visibility and owner-independence drive value. Recurring maintenance/service contracts and commercial (vs residential) work command premiums; essential trades (HVAC, roofing, electrical) trade highest.", sources:["ExitsHub — Valuation Multiples by Industry 2026 (2.0–3.5x SDE; 4.0–6.0x EBITDA)","CLA — Construction Value Drivers 2025","BizBuySell Insight Report, Q4 2025"], comparables:[{size:"General trades",range:"2.0x–3.5x SDE",source:"ExitsHub 2026"},{size:"EBITDA basis",range:"4.0x–6.0x EBITDA",source:"ExitsHub 2026"},{size:"Revenue check",range:"0.5x–1.0x Revenue",source:"ExitsHub 2026"}] },
  professional:{ label:"Professional Services", sdeMin:2.0,sdeMax:3.2,ebitdaMin:3.0,ebitdaMax:5.0,revenueMultiple:0.8,growthBenchmark:0.06,marginBenchmark:0.30, notes:"Legal, accounting, consulting, engineering, architecture, agencies. Transferable vs personal ('rainmaker') goodwill is the single biggest swing — recurring retainers and institutional client relationships earn premiums; individual-practitioner dependence is the main discount.", sources:["ExitsHub — Valuation Multiples by Industry 2026 (2.0–3.0x SDE; 3.0–5.0x EBITDA)","LeanLaw & The Law Practice Exchange — Law Firm Valuation 2025","Olmstead & Associates — Professional Practice Valuation"], comparables:[{size:"Owner-dependent",range:"2.0x–2.5x SDE",source:"ExitsHub 2026"},{size:"Institutionalized",range:"3.0x–5.0x EBITDA",source:"ING COO Guide 2025"},{size:"Revenue check",range:"0.6x–1.0x Revenue",source:"ExitsHub 2026"}] },
  healthcare:{ label:"Healthcare & Wellness", sdeMin:2.0,sdeMax:3.3,ebitdaMin:4.0,ebitdaMax:7.0,revenueMultiple:0.7,growthBenchmark:0.10,marginBenchmark:0.18, notes:"Medical, dental, behavioral health, therapy, veterinary. Payor mix (private-pay / in-network diversification) is the quality-of-earnings signal; multi-location scale and ancillary services add multiple turns. Small single-site practices sit low; PE platforms reach the teens.", sources:["Sofer Advisors — Medical Practice Multiples 2025–2026 (1–3x SDE; 6–12x EBITDA by size)","FOCUS Bankers — Healthcare Services 2025 (median ~11.5x EV/EBITDA at scale)","First Page Sage — Healthcare EBITDA Multiples 2025"], comparables:[{size:"Small single-site",range:"1x–3x SDE",source:"Sofer Advisors 2025-26"},{size:"Multi-site / in-network",range:"6x–12x EBITDA",source:"Sofer / FOCUS 2025"},{size:"PE platform",range:"~11.5x EV/EBITDA",source:"FOCUS Bankers 2025"}] },
  technology:{ label:"Technology & Software", sdeMin:3.0,sdeMax:5.5,ebitdaMin:4.0,ebitdaMax:8.0,revenueMultiple:1.5,growthBenchmark:0.18,marginBenchmark:0.70, notes:"Recurring revenue %, growth, and net revenue retention dominate. SaaS multiples compressed ~20–35% in 2025 from prior peaks. Owner-independence and clean recurring contracts drive the premium.", sources:["QuantPillar — Private Market Multiples 2025–2026 (SaaS compressed 20–35%)","FE International / Axial — SaaS transaction data 2024","ExitsHub — Valuation Multiples by Industry 2026"], comparables:[{size:"Small / owner-run",range:"3.0x–4.0x SDE",source:"ExitsHub 2026"},{size:"Recurring SaaS",range:"4.0x–8.0x EBITDA",source:"FE International 2024"},{size:"Revenue (recurring)",range:"1.0x–3.0x Revenue",source:"QuantPillar 2025-26"}] },
  food_beverage:{ label:"Food, Beverage & Hospitality", sdeMin:1.5,sdeMax:2.5,ebitdaMin:3.0,ebitdaMax:4.0,revenueMultiple:0.4,growthBenchmark:0.05,marginBenchmark:0.60, notes:"Restaurants, catering, food production, hospitality. Tend to trade below the all-business average on thin margins and high owner involvement. Multi-unit operations, brand, and proven systems lift the multiple.", sources:["BizBuySell Insight Report, Q4 2025 (all-sector avg 2.57x SDE)","DealStream — Restaurant Rules of Thumb"], comparables:[{size:"Single unit",range:"1.5x–2.5x SDE",source:"BizBuySell 2025"},{size:"Multi-unit",range:"3.0x–4.0x EBITDA",source:"Industry estimates"},{size:"Revenue check",range:"0.3x–0.5x Revenue",source:"BizBuySell 2025"}] },
  manufacturing:{ label:"Manufacturing & Industrial", sdeMin:2.5,sdeMax:3.8,ebitdaMin:4.0,ebitdaMax:6.5,revenueMultiple:0.7,growthBenchmark:0.07,marginBenchmark:0.30, notes:"Customer concentration, equipment/capex needs, and proprietary products or processes drive value. Specialized manufacturers with EBITDA above ~8% of revenue trade toward the high end.", sources:["Equidam — EBITDA Multiples by Industry 2026 (specialized mfg ~4.5–8x EBITDA)","ExitsHub — Valuation Multiples by Industry 2026 (2.5–9.0x EBITDA mid-market)","BizBuySell Insight Report, Q4 2025"], comparables:[{size:"Small mfg",range:"2.5x–3.8x SDE",source:"BizBuySell 2025"},{size:"Specialized mfg",range:"4.5x–8.0x EBITDA",source:"Equidam 2026"},{size:"Revenue check",range:"0.6x–1.0x Revenue",source:"ExitsHub 2026"}] },
  consumer_services:{ label:"Personal & Consumer Services", sdeMin:1.8,sdeMax:2.8,ebitdaMin:3.0,ebitdaMax:4.0,revenueMultiple:0.5,growthBenchmark:0.06,marginBenchmark:0.45, notes:"Salons, fitness, cleaning, repair, pet care, and similar. Owner dependence is the biggest discount; membership/recurring revenue and multiple locations push toward the high end.", sources:["BizBuySell Insight Report, Q4 2025 (all-sector avg 2.57x SDE; 0.67x revenue)","DealStream — Service Business Rules of Thumb"], comparables:[{size:"Owner-operated",range:"1.8x–2.8x SDE",source:"BizBuySell 2025"},{size:"Membership/recurring",range:"3.0x–4.0x EBITDA",source:"Industry estimates"},{size:"Revenue check",range:"0.4x–0.6x Revenue",source:"BizBuySell 2025"}] },
  transportation:{ label:"Transportation & Logistics", sdeMin:2.2,sdeMax:3.2,ebitdaMin:3.5,ebitdaMax:4.5,revenueMultiple:0.5,growthBenchmark:0.06,marginBenchmark:0.20, notes:"Trucking, logistics, distribution. Asset-heavy; contracted/recurring freight and diversified shippers raise value, while owner-driver dependence and fuel/cost volatility lower it.", sources:["BizBuySell Insight Report, Q4 2025","ExitsHub — Valuation Multiples by Industry 2026"], comparables:[{size:"Owner-operated",range:"2.2x–3.2x SDE",source:"BizBuySell 2025"},{size:"Contracted freight",range:"3.5x–4.5x EBITDA",source:"Industry estimates"},{size:"Revenue check",range:"0.3x–0.8x Revenue",source:"ExitsHub 2026"}] },
  other:{ label:"Other / General Business", sdeMin:2.0,sdeMax:3.3,ebitdaMin:3.0,ebitdaMax:5.0,revenueMultiple:0.65,growthBenchmark:0.07,marginBenchmark:0.20, notes:"Uses the cross-industry average from main-street transactions. Add detail in the description box so the AI can match the closest comparable segment.", sources:["BizBuySell Insight Report, Q1 2021–Q4 2025 (avg 2.57x SDE; 0.67x revenue; sector earnings multiples 2.0–3.3x)"], comparables:[{size:"Main-street median",range:"2.57x SDE",source:"BizBuySell 2025"},{size:"Lower middle market",range:"3.0x–5.0x EBITDA",source:"ExitsHub 2026"},{size:"Revenue range",range:"0.42x–1.2x Revenue",source:"BizBuySell 2025"}] },
};

// Buyer types and headline risk factors per category (kept separate for clarity;
// attached to INDUSTRIES so existing references keep working).
const INDUSTRY_EXTRA={
  retail:{buyerTypes:["Strategic acquirer","Individual buyer","Search fund / PE add-on"],riskFactors:["Margin compression","Customer concentration","Lease & location risk","E-commerce disruption"]},
  construction:{buyerTypes:["Strategic acquirer","Competitor consolidation","Individual buyer / operator"],riskFactors:["Owner dependence","Backlog concentration","Labor availability","Cyclical / seasonal demand"]},
  professional:{buyerTypes:["Merger with larger firm","Partner / internal buyout","Private equity (services roll-up)"],riskFactors:["Rainmaker / owner dependence","Client portability","Regulatory ownership limits"]},
  healthcare:{buyerTypes:["PE platform / roll-up","Health system or network","Individual practitioner"],riskFactors:["Reimbursement / payor risk","Provider retention","Licensing & compliance"]},
  technology:{buyerTypes:["Strategic acquirer","Private equity","Management buyout"],riskFactors:["Customer concentration","Churn / retention","Key-person & technical debt"]},
  food_beverage:{buyerTypes:["Individual buyer / operator","Multi-unit operator","Strategic acquirer"],riskFactors:["Thin margins","Owner dependence","Lease & labor costs","Concept / trend risk"]},
  manufacturing:{buyerTypes:["Strategic acquirer","Private equity","Competitor consolidation"],riskFactors:["Customer concentration","Capital expenditure needs","Supply chain & input costs"]},
  consumer_services:{buyerTypes:["Individual buyer / operator","Franchisee or multi-unit","Strategic acquirer"],riskFactors:["Owner dependence","Local competition","Staff retention"]},
  transportation:{buyerTypes:["Strategic acquirer","Private equity","Competitor consolidation"],riskFactors:["Owner-driver dependence","Fuel & cost volatility","Customer concentration","Asset / maintenance burden"]},
  other:{buyerTypes:["Strategic acquirer","Individual buyer","Financial buyer"],riskFactors:["Owner dependence","Customer concentration","Market conditions"]},
};
Object.keys(INDUSTRIES).forEach(k=>{INDUSTRIES[k].buyerTypes=(INDUSTRY_EXTRA[k]||INDUSTRY_EXTRA.other).buyerTypes;INDUSTRIES[k].riskFactors=(INDUSTRY_EXTRA[k]||INDUSTRY_EXTRA.other).riskFactors;});

const ALLOC = [
  {key:"retirement",label:"Retirement Accounts (401k, IRA, Roth)",color:C.green},
  {key:"taxable",label:"Taxable Investment Accounts",color:C.gold},
  {key:"realEstate",label:"Real Estate (excl. primary home)",color:C.navyMid},
  {key:"primaryHome",label:"Primary Home Equity",color:"#3DAF9C"},
  {key:"cashSavings",label:"Cash & Savings",color:C.amber},
  {key:"lifeInsCV",label:"Life Insurance Cash Value",color:C.slateLight},
  {key:"otherAssets",label:"Other Assets",color:C.red},
];

// ─── STORAGE KEY ──────────────────────────────────────────────────────────────
const STORAGE_KEY = "decidedly_exit_plan";

// ─── MATH ─────────────────────────────────────────────────────────────────────
const fmt = n => n==null?"—":"$"+Math.round(n).toLocaleString();
const fmtM = n => n==null?"—":"$"+(n/1000000).toFixed(2)+"M";
const fmtPct = n => (n*100).toFixed(1)+"%";
const p = v => parseFloat(v)||0;

function calcGrowthRate(biz) {
  const r0=p(biz.rev0),r1=p(biz.rev1),r2=p(biz.rev2);
  if(r0>0&&r1>0&&r2>0) return ((r0/r2)-1)/2;
  if(r0>0&&r1>0) return (r0/r1)-1;
  return p(biz.growthRate)/100 || (INDUSTRIES[biz.industry]||INDUSTRIES.other).growthBenchmark;
}

// ─── INDUSTRY-SPECIFIC QUALITY DRIVERS ────────────────────────────────────────
// Each industry weights value drivers differently (calibrated from 2024–2026 M&A
// valuation research). A driver's `weight` is the max points (±) it can move the
// score. Contribution = frac(-1..1) × weight, summed onto a base of 50, clamped
// 10–95. Drivers carrying an `input` render an extra industry-specific field.
const DRV = {
  owner:{ label:"Owner / key-person dependence", get:b=>{const k=b.ownerDep;if(!k)return{frac:0,val:"Not entered"};return {frac:{low:1,medium:0,high:-1}[k]??0,val:{low:"Low — runs without owner",medium:"Medium",high:"High — owner is the business"}[k]};} },
  recurring:{ label:"Revenue predictability", get:b=>{const k=b.revenueType;if(!k)return{frac:0,val:"Not entered"};return {frac:{recurring:1,mixed:0.35,project:-0.3,transactional:-0.55}[k]??0,val:{recurring:"Recurring / subscription",mixed:"Mixed",project:"Project-based",transactional:"Transactional"}[k]};} },
  concentration:{ label:"Customer concentration", get:b=>{const c=p(b.customerConc);let f=0;if(c){if(c<15)f=1;else if(c<25)f=0.5;else if(c<40)f=0;else if(c<60)f=-0.6;else f=-1;}return {frac:f,val:c?c+"% from top 3":"—"};} },
  tenure:{ label:"Years established", get:b=>{const y=p(b.yearsOp);let f=0;if(y){if(y>15)f=1;else if(y>10)f=0.6;else if(y>5)f=0.2;else if(y>=3)f=0;else f=-0.8;}return {frac:f,val:y?y+" yrs":"—"};} },
  growth:{ label:"Growth vs. industry", get:(b,ind,gr)=>{const r=ind.growthBenchmark>0?gr/ind.growthBenchmark:1;let f;if(r>1.5)f=1;else if(r>1.2)f=0.6;else if(r>0.8)f=0.1;else if(r>0.5)f=-0.4;else f=-0.8;return {frac:f,val:fmtPct(gr)+" vs "+fmtPct(ind.growthBenchmark)+" bm"};} },
  margin:{ label:"Gross margin vs. industry", get:(b,ind,gr,gm)=>{if(gm==null)return{frac:0,val:"Enter COGS"};const r=ind.marginBenchmark>0?gm/ind.marginBenchmark:1;let f;if(r>1.2)f=1;else if(r>1.0)f=0.5;else if(r>0.8)f=0;else if(r>0.6)f=-0.5;else f=-0.9;return {frac:f,val:fmtPct(gm)+" vs "+fmtPct(ind.marginBenchmark)+" bm"};} },
  backlog:{ label:"Contracted backlog", get:b=>{const m=p(b.backlogMonths);let f=-0.1;if(m){if(m>9)f=1;else if(m>6)f=0.6;else if(m>3)f=0.25;else f=0;}return {frac:f,val:m?m+" mo":"—"};} },
  scale:{ label:"Operational scale (team)", get:b=>{const e=p(b.employees);let f=0;if(e){if(e>40)f=1;else if(e>15)f=0.5;else if(e>5)f=0.15;else f=-0.4;}return {frac:f,val:e?e+" employees":"—"};} },
  recurringPct:{ label:"Recurring revenue %", input:{key:"recurringPct",ph:"70",hint:"Subscription/contract % of total revenue",max:100}, get:b=>{const x=p(b.recurringPct);let f=0;if(x){if(x>=80)f=1;else if(x>=60)f=0.6;else if(x>=40)f=0.1;else if(x>=20)f=-0.3;else f=-0.6;}return {frac:f,val:x?x+"%":"—"};} },
  netRetention:{ label:"Net revenue retention", input:{key:"nrr",ph:"105",hint:"Expansion minus churn; >100% is a premium signal",max:300}, get:b=>{const x=p(b.nrr);let f=0;if(x){if(x>=110)f=1;else if(x>=100)f=0.6;else if(x>=90)f=0;else f=-0.6;}return {frac:f,val:x?x+"%":"—"};} },
  rainmaker:{ label:"Personal-goodwill (rainmaker) dependence", input:{key:"rainmakerDep",ph:"60",hint:"% of revenue tied to owner's personal client relationships — lower is better",max:100}, get:b=>{const x=p(b.rainmakerDep);let f=0;if(x){if(x<=20)f=1;else if(x<=40)f=0.4;else if(x<=60)f=-0.2;else if(x<=80)f=-0.7;else f=-1;}return {frac:f,val:x?x+"% personal":"—"};} },
  maintenance:{ label:"Recurring service/maintenance revenue", input:{key:"maintPct",ph:"25",hint:"% from service/maintenance contracts vs one-time installs",max:100}, get:b=>{const x=p(b.maintPct);let f=-0.1;if(x){if(x>=40)f=1;else if(x>=25)f=0.6;else if(x>=10)f=0.2;else f=-0.1;}return {frac:f,val:x?x+"%":"—"};} },
  publicBacklog:{ label:"Repeat / public-sector client base", input:{key:"repeatPct",ph:"50",hint:"% of revenue from repeat or government clients (stability)",max:100}, get:b=>{const x=p(b.repeatPct);let f=0;if(x){if(x>=60)f=1;else if(x>=40)f=0.5;else if(x>=20)f=0.1;else f=-0.3;}return {frac:f,val:x?x+"%":"—"};} },
  payerMix:{ label:"Private-pay / payer diversification", input:{key:"privatePayPct",ph:"40",hint:"% private-pay vs insurance reimbursement",max:100}, get:b=>{const x=p(b.privatePayPct);let f=0;if(x){if(x>=50)f=1;else if(x>=30)f=0.5;else if(x>=15)f=0.1;else f=-0.3;}return {frac:f,val:x?x+"%":"—"};} },
  locations:{ label:"Multi-location footprint", input:{key:"locations",ph:"2",hint:"Number of locations; multi-site scales value"}, get:b=>{const x=p(b.locations);let f=0;if(x){if(x>=4)f=1;else if(x>=2)f=0.5;else f=-0.1;}return {frac:f,val:x?x+" location(s)":"—"};} },
  online:{ label:"E-commerce / channel diversification", input:{key:"onlinePct",ph:"30",hint:"% of revenue online (widens the buyer pool)",max:100}, get:b=>{const x=p(b.onlinePct);let f=-0.1;if(x){if(x>=40)f=1;else if(x>=20)f=0.5;else if(x>=10)f=0.1;else f=-0.1;}return {frac:f,val:x?x+"%":"—"};} },
};
// Ordered [driverKey, weight] per umbrella category. Weights total ≈ 70–80.
// The factors below (concentration, owner/key-person dependence, margin vs peers,
// recurring revenue, growth, scale) are the documented drivers that move a business
// within its industry range — per Sofer Advisors and BizBuySell transaction analysis.
const INDUSTRY_DRIVERS = {
  retail:            [["margin",20],["online",14],["concentration",12],["owner",12],["tenure",8],["growth",8]],
  construction:      [["backlog",18],["owner",16],["maintenance",14],["scale",10],["concentration",8],["growth",8]],
  professional:      [["rainmaker",20],["concentration",14],["owner",12],["recurring",10],["margin",8],["tenure",8],["growth",6]],
  healthcare:        [["payerMix",16],["locations",12],["owner",14],["scale",10],["concentration",10],["margin",8],["growth",6]],
  technology:        [["recurringPct",18],["growth",16],["netRetention",12],["margin",10],["concentration",10],["owner",8],["tenure",4]],
  food_beverage:     [["owner",18],["scale",14],["margin",12],["concentration",10],["tenure",8],["growth",8]],
  manufacturing:     [["concentration",18],["owner",14],["backlog",12],["margin",12],["scale",8],["growth",8]],
  consumer_services: [["owner",20],["recurring",14],["scale",12],["concentration",10],["tenure",8],["growth",8]],
  transportation:    [["concentration",16],["owner",16],["recurring",12],["scale",10],["margin",8],["growth",8]],
  other:             [["owner",16],["recurring",14],["concentration",12],["growth",10],["margin",10],["tenure",8],["backlog",6]],
};
// Removed from the model per revision: years-in-operation, employees (scale), and backlog.
const _CUT_DRIVERS=["tenure","scale","backlog"];
Object.keys(INDUSTRY_DRIVERS).forEach(k=>{INDUSTRY_DRIVERS[k]=INDUSTRY_DRIVERS[k].filter(([d])=>!_CUT_DRIVERS.includes(d));});

function calcQualityDetail(biz){
  const ind=INDUSTRIES[biz.industry]||INDUSTRIES.other;
  const gr=calcGrowthRate(biz);
  const rev=p(biz.revenue), cogs=p(biz.cogs);
  const gm=rev>0&&cogs>0?(rev-cogs)/rev:null;
  const list=INDUSTRY_DRIVERS[biz.industry]||INDUSTRY_DRIVERS.other;
  let score=50; const factors=[];
  list.forEach(([k,w])=>{
    const d=DRV[k]; if(!d) return;
    const {frac,val}=d.get(biz,ind,gr,gm);
    const pts=Math.round(frac*w*10)/10;
    score+=frac*w;
    factors.push({key:k,label:d.label,weight:w,pts,val});
  });
  return {score:Math.round(Math.max(10,Math.min(95,score))),factors,ind};
}
function calcQualityScore(biz){ return calcQualityDetail(biz).score; }
// Returns the industry-specific extra input fields to render for a business.
function industryInputs(industry){
  return (INDUSTRY_DRIVERS[industry]||INDUSTRY_DRIVERS.other).map(([k])=>DRV[k]).filter(d=>d&&d.input).map(d=>({...d.input,label:d.label}));
}

function calcValuation(biz,overrides) {
  const ind=INDUSTRIES[biz.industry]||INDUSTRIES.other;
  const sdeMin=overrides.sdeMin??ind.sdeMin, sdeMax=overrides.sdeMax??ind.sdeMax;
  const ebitdaMin=overrides.ebitdaMin??ind.ebitdaMin, ebitdaMax=overrides.ebitdaMax??ind.ebitdaMax;
  const revenue=p(biz.revenue), cogs=p(biz.cogs);
  const grossMargin=revenue>0?(revenue-cogs)/revenue:0;
  const sde=p(biz.netIncome)+p(biz.ownerComp)+p(biz.addbacks);
  const ebitda=p(biz.netIncome)+p(biz.depreciation)+p(biz.interest)+p(biz.taxes);
  const bizDebt=p(biz.bizDebt);
  const qs=calcQualityScore(biz);
  const posMult=sdeMin+((qs-10)/85)*(sdeMax-sdeMin);
  const revVal=revenue*(overrides.revenueMultiple??ind.revenueMultiple);
  const entLow=sde*sdeMin*0.5+ebitda*ebitdaMin*0.35+revVal*0.15;
  const entHigh=sde*sdeMax*0.5+ebitda*ebitdaMax*0.35+revVal*0.15;
  const entMid=sde*posMult*0.5+ebitda*((ebitdaMin+ebitdaMax)/2)*0.35+revVal*0.15;
  return {sde,ebitda,grossMargin,qs,posMult,revVal,entLow,entHigh,entMid,
    eqLow:Math.max(0,entLow-bizDebt),eqHigh:Math.max(0,entHigh-bizDebt),
    eqMid:Math.max(0,entMid-bizDebt),bizDebt,sdeMin,sdeMax};
}

function calcAfterTax(price,biz) {
  const gain=Math.max(0,price-p(biz.taxBasis));
  const cCorpHit=(biz.structure==="c_corp"&&biz.dealStructure==="asset")?gain*0.21:0;
  const stRate=(biz.stateTaxRate===""||biz.stateTaxRate==null)?0.05:Math.max(0,p(biz.stateTaxRate))/100;
  const fedCG=gain*0.238, state=gain*stRate;
  const deal=price*0.03, debt=Math.min(p(biz.bizDebt),price);
  return {gain,fedCG,state,deal,debt,cCorpHit,net:price-fedCG-state-deal-debt-cCorpHit};
}

function calcWealth(wealth,netSale,kData) {
  const ret=p(wealth.retirement),tax=p(wealth.taxable),re=p(wealth.realEstate);
  const home=p(wealth.primaryHome),cash=p(wealth.cashSavings),li=p(wealth.lifeInsCV),other=p(wealth.otherAssets);
  const debt=p(wealth.totalDebt), ss=p(kData.ssMonthly)*12;
  const gross=ret+tax+re+home+cash+li+other;
  const net=gross-debt, liquid=ret+tax+cash+li;
  const retAge=p(kData.retirementAge||65), curAge=p(kData.age||50);
  const yrs=Math.max(1,retAge-curAge);
  const savingsAccum=p(kData.savingsRate)*yrs;
  const investableAtExit=liquid*Math.pow(1.07,yrs)+savingsAccum+netSale;
  const lifestyle=p(kData.desiredLifestyle), ssOffset=ss;
  const netLifestyleNeed=Math.max(0,lifestyle-ssOffset);
  const planAge=p(kData.planToAge)||(retAge+27);
  const retYears=Math.max(1,planAge-retAge);
  const ssAge=p(kData.ssStartAge)||retAge;
  const ssGapYears=Math.max(0,Math.min(ssAge,planAge)-retAge);
  const portfolioNeeded=netLifestyleNeed*Math.min(25,retYears)+ss*ssGapYears;
  return {gross,net,liquid,investableAtExit,portfolioNeeded,gap:portfolioNeeded-investableAtExit,yrs,retYears,ssGapYears,ssOffset,netLifestyleNeed,ret,tax,re,home,cash,li,other,debt};
}

function projectYears(biz,overrides,futureYrs=3) {
  const ind=INDUSTRIES[biz.industry]||INDUSTRIES.other;
  const gr=(overrides.growthRate??calcGrowthRate(biz))||ind.growthBenchmark;
  const mi=overrides.marginImprovRate??0.01;
  const hist=[];
  if(p(biz.rev2)>0) hist.push({year:"Yr -2",revenue:p(biz.rev2),netIncome:p(biz.ni2),sde:p(biz.ni2)+p(biz.ownerComp)+p(biz.addbacks),valuationLow:null,valuationHigh:null,valuationMid:null,range:null});
  if(p(biz.rev1)>0) hist.push({year:"Yr -1",revenue:p(biz.rev1),netIncome:p(biz.ni1),sde:p(biz.ni1)+p(biz.ownerComp)+p(biz.addbacks),valuationLow:null,valuationHigh:null,valuationMid:null,range:null});
  const sdeMin=overrides.sdeMin??ind.sdeMin, sdeMax=overrides.sdeMax??ind.sdeMax;
  let rev=p(biz.revenue)||0, ni=p(biz.netIncome)||0;
  const future=[];
  for(let y=0;y<=futureYrs;y++){
    const sde=ni+p(biz.ownerComp)+p(biz.addbacks);
    const qs=calcQualityScore(biz);
    const mid=sdeMin+((qs-10)/85)*(sdeMax-sdeMin);
    future.push({year:y===0?"Today":`Yr +${y}`,revenue:Math.round(rev),netIncome:Math.round(ni),sde:Math.round(sde),valuationLow:Math.round(sde*sdeMin),valuationHigh:Math.round(sde*sdeMax),valuationMid:Math.round(sde*mid),range:[Math.round(sde*sdeMin),Math.round(sde*sdeMax)]});
    rev*=(1+gr); ni*=(1+gr+mi);
  }
  return [...hist,...future];
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const iS={width:"100%",padding:"10px 14px",borderRadius:8,border:`1px solid ${C.creamDark}`,background:C.white,fontFamily:"'Nunito',sans-serif",fontSize:14,color:C.navy,outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"};
function SectionHeader({num,title,subtitle}){return(<div style={{marginBottom:32}}><div style={{display:"flex",alignItems:"center",gap:14,marginBottom:8}}><div style={{width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${C.navyMid},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:C.white,flexShrink:0}}>{num}</div><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:C.navy,margin:0}}>{title}</h2></div>{subtitle&&<p style={{fontFamily:"'Nunito',sans-serif",fontSize:14,color:C.slateLight,margin:"0 0 0 54px",lineHeight:1.6}}>{subtitle}</p>}<div style={{height:2,background:`linear-gradient(90deg,${C.gold},transparent)`,marginTop:16}}/></div>);}
function Field({label,children,hint,half,third}){const w=third?"calc(33% - 12px)":half?"calc(50% - 8px)":"100%";return(<div style={{marginBottom:20,width:w}}><label style={{display:"block",fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:C.slate,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>{label}</label>{children}{hint&&<p style={{fontFamily:"'Nunito',sans-serif",fontSize:11,color:C.slateLight,margin:"4px 0 0"}}>{hint}</p>}</div>);}
function Input({value,onChange,type="text",placeholder,prefix,min,max}){return(<div style={{position:"relative"}}>{prefix&&<span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.slateLight,fontFamily:"'Nunito',sans-serif",fontSize:14}}>{prefix}</span>}<input type={type} value={value} placeholder={placeholder} min={min} max={max} onChange={e=>onChange(e.target.value)} onWheel={e=>e.currentTarget.blur()} style={{...iS,paddingLeft:prefix?26:14}} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.creamDark}/></div>);}
function Select({value,onChange,options}){return<select value={value} onChange={e=>onChange(e.target.value)} style={{...iS,cursor:"pointer",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%232d2d2d' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center"}}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>;}
function Textarea({value,onChange,placeholder,rows=3}){return<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{...iS,resize:"vertical",lineHeight:1.6}} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.creamDark}/>;}
function Card({children,style={}}){return<div style={{background:C.white,borderRadius:16,padding:28,border:`1px solid ${C.border}`,boxShadow:"0 2px 16px rgba(2,25,102,0.06)",...style}}>{children}</div>;}
function StatBox({label,value,sub,accent,warn,ok}){
  const bg=accent?`linear-gradient(135deg,${C.navy},${C.navyMid})`:warn?"rgba(192,57,43,0.06)":ok?"rgba(31,122,92,0.06)":C.cream;
  const border=accent?"transparent":warn?"rgba(192,57,43,0.25)":ok?"rgba(31,122,92,0.25)":C.border;
  const valColor=accent?C.white:warn?C.red:ok?C.green:C.navy;
  return(<div style={{background:bg,borderRadius:12,padding:"18px 20px",border:`1px solid ${border}`}}><div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:accent?C.goldLight:warn?C.red:ok?C.green:C.slateLight,marginBottom:6}}>{label}</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:valColor}}>{value}</div>{sub&&<div style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:accent?"rgba(255,255,255,0.6)":C.slateLight,marginTop:4}}>{sub}</div>}</div>);}

function QualityBar({score}){
  const color=score>=70?C.green:score>=45?C.amber:C.red;
  const label=score>=70?"Strong — positions toward the upper range":score>=45?"Average — positions mid-range":"Below average — positions toward the lower range";
  return(<div style={{padding:"14px 18px",borderRadius:10,background:C.cream,border:`1px solid ${C.border}`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:C.slate,textTransform:"uppercase",letterSpacing:"0.07em"}}>Business Quality Score</span><span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color}}>{score}/100</span></div><div style={{height:7,borderRadius:4,background:C.creamDark,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:`${score}%`,background:color,borderRadius:4,transition:"width 0.5s"}}/></div><p style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:C.slateLight,margin:0}}>{label} — weighted by the value drivers that matter most in this client's industry (breakdown below).</p></div>);}

// Transparent, industry-specific breakdown of how the quality score was built.
function QualityBreakdown({detail}){
  const {factors,ind}=detail;
  return(<div style={{marginTop:18,padding:"16px 18px",borderRadius:10,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)"}}>
    <div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.goldLight,marginBottom:12}}>How this score was built · weighting for {ind.label}</div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {factors.map((f,i)=>{
        const col=f.pts>0.3?"#74e0ad":f.pts<-0.3?"#ff9e90":"rgba(255,255,255,0.6)";
        return(<div key={i} style={{display:"flex",alignItems:"center",gap:10,fontFamily:"'Nunito',sans-serif",fontSize:12.5}}>
          <div style={{flex:1,minWidth:0,color:"rgba(255,255,255,0.88)"}}>{f.label} <span style={{color:"rgba(255,255,255,0.45)"}}>· {f.val}</span></div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",whiteSpace:"nowrap"}}>wt {f.weight}</div>
          <div style={{width:46,textAlign:"right",fontWeight:800,color:col}}>{f.pts>=0?"+":""}{f.pts}</div>
        </div>);
      })}
    </div>
    <p style={{fontFamily:"'Nunito',sans-serif",fontSize:11,color:"rgba(255,255,255,0.45)",marginTop:12,lineHeight:1.5}}>Each factor's weight is tuned to what drives value in {ind.label.toLowerCase()}. The score starts at 50; the factors above move it up or down. These are the documented within-range drivers (customer concentration, owner/key-person dependence, margin vs peers, recurring revenue, growth, scale) per Sofer Advisors and BizBuySell transaction analysis — not subjective inputs. Adjust any multiple directly in the Advisor panel below.</p>
  </div>);
}

// Clickable score: tap to reveal where points are being lost, then the full breakdown.
function QualityScore({score,detail}){
  const [open,setOpen]=useState(false);
  const color=score>=70?C.green:score>=45?C.amber:C.red;
  const label=score>=70?"Strong — positions toward the upper range":score>=45?"Average — positions mid-range":"Below average — positions toward the lower range";
  const lost=(detail.factors||[]).map(f=>({...f,lost:Math.round((f.weight-f.pts)*10)/10})).filter(f=>f.lost>0.3).sort((a,b)=>b.lost-a.lost);
  return(<div>
    <div onClick={()=>setOpen(o=>!o)} style={{cursor:"pointer",padding:"14px 18px",borderRadius:10,background:C.cream,border:`1px solid ${C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,alignItems:"center"}}>
        <span style={{fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:C.slate,textTransform:"uppercase",letterSpacing:"0.07em"}}>Business Quality Score</span>
        <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color}}>{score}/100</span>
      </div>
      <div style={{height:7,borderRadius:4,background:C.creamDark,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:`${score}%`,background:color,borderRadius:4,transition:"width 0.5s"}}/></div>
      <p style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:C.gold,margin:0,fontWeight:700}}>{open?"▾ Hide breakdown":"▸ Click to see where points are being lost"}</p>
      <p style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:C.slateLight,margin:"4px 0 0"}}>{label}.</p>
    </div>
    {open&&<div>
      <div style={{marginTop:14,padding:"16px 18px",borderRadius:10,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,158,144,0.35)"}}>
        <div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:"#ff9e90",marginBottom:10}}>Where points are being lost</div>
        {lost.length?(<div style={{display:"flex",flexDirection:"column",gap:8}}>
          {lost.map((f,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,fontFamily:"'Nunito',sans-serif",fontSize:12.5}}>
            <div style={{flex:1,minWidth:0,color:"rgba(255,255,255,0.88)"}}>{f.label} <span style={{color:"rgba(255,255,255,0.45)"}}>· {f.val}</span></div>
            <div style={{width:120,textAlign:"right",fontWeight:800,color:"#ff9e90",whiteSpace:"nowrap"}}>{f.lost} pts to gain</div>
          </div>))}
        </div>):(<p style={{fontFamily:"'Nunito',sans-serif",fontSize:12.5,color:"rgba(255,255,255,0.7)",margin:0}}>No major gaps — this business scores well across the board.</p>)}
      </div>
      <QualityBreakdown detail={detail}/>
    </div>}
  </div>);
}

// Celebratory "fully funded" moment when the client is in surplus.
function SurplusBanner({surplus,compact}){
  return(<div style={{borderRadius:14,overflow:"hidden",background:"linear-gradient(135deg,#0f7a52,#1fa874)",boxShadow:"0 8px 30px rgba(18,122,82,0.32)"}}>
    <div style={{padding:compact?"18px 22px":"26px 28px",color:C.white}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
        <span style={{fontSize:26}}>🎉</span>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:compact?20:24,fontWeight:700}}>Fully Funded — You're in a Strong Position</div>
      </div>
      <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,opacity:0.93,lineHeight:1.6,marginBottom:14,maxWidth:680}}>Your projected resources exceed what you need to fund your desired lifestyle. This is a genuine milestone — worth pausing to recognize before moving on. Your plan works.</div>
      <div style={{display:"inline-flex",alignItems:"baseline",gap:12,background:"rgba(255,255,255,0.16)",borderRadius:12,padding:"12px 20px"}}>
        <span style={{fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",opacity:0.85}}>Projected Surplus</span>
        <span style={{fontFamily:"'Playfair Display',serif",fontSize:compact?26:34,fontWeight:700}}>{fmtM(surplus)}</span>
      </div>
      {!compact&&<div style={{fontFamily:"'Nunito',sans-serif",fontSize:12.5,opacity:0.85,marginTop:14,lineHeight:1.6,maxWidth:680}}>The conversation can now shift from "will I have enough?" to better questions: exiting sooner, de-risking the portfolio, increasing gifts to family or causes, or shaping a legacy. That's the Decidedly conversation.</div>}
    </div>
  </div>);
}

// One memorable headline — the single thing the client should walk away with.
function HeadlineBanner({wc,yrs,ready,compact}){
  if(!ready) return null;
  if(wc.gap<=0) return <SurplusBanner surplus={Math.abs(wc.gap)} compact={compact}/>;
  const y=Math.max(1,yrs||1);
  return(<div style={{borderRadius:14,overflow:"hidden",background:`linear-gradient(135deg,${C.navy},${C.gold})`,boxShadow:"0 8px 30px rgba(6,56,148,0.30)"}}>
    <div style={{padding:compact?"18px 22px":"26px 28px",color:C.white}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
        <span style={{fontSize:compact?22:25}}>🎯</span>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:compact?19:24,fontWeight:700,lineHeight:1.2}}>You're {fmtM(wc.gap)} short of your goal</div>
      </div>
      <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,opacity:0.92,lineHeight:1.6,maxWidth:680}}>Your projected resources fall short of fully funding your desired lifestyle by approximately {fmtM(wc.gap)}, with {y} {y===1?"year":"years"} until the planned exit to address it.</div>
    </div>
  </div>);
}

// Industry-based guidance shown beside the score. Confirms nothing is assumed,
// gives static industry benchmarks, and offers an AI suggestion of typical metrics.
function ScoreGuidance({biz}){
  const ind=INDUSTRIES[biz.industry]||INDUSTRIES.other;
  const detail=calcQualityDetail(biz);
  const blanks=["—","Not entered","Enter COGS"];
  const entered=detail.factors.filter(f=>!blanks.includes(f.val)).length;
  const total=detail.factors.length;
  const topDrivers=(INDUSTRY_DRIVERS[biz.industry]||INDUSTRY_DRIVERS.other).slice().sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>DRV[k]&&DRV[k].label).filter(Boolean);
  const [sug,setSug]=useState(""); const [ld,setLd]=useState(false);
  const askAI=async()=>{
    if(!AI_ENABLED){ setSug("AI metric suggestions aren't switched on yet (see README → \"Turning on the AI features\"). The industry guidance above still applies."); return; }
    setLd(true); setSug("");
    try{
      const prompt=`For a ${ind.label} business described specifically as: "${biz.description||"(no specific description provided)"}", list the TYPICAL industry norms an advisor should expect for the factors that drive a small-business valuation quality score: owner/key-person dependence, recurring vs project revenue, customer concentration (% from top 3 clients), gross margin %, annual growth %, contracted backlog (months), and the most relevant industry-specific factor. Give a short bullet list of typical ranges, each with a one-line reason, and note these are general industry norms (cite that they are typical benchmarks, not a valuation of this specific business). Do NOT invent specific figures for this particular business. Under 180 words.`;
      const res=await fetch("/api/anthropic",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:prompt}]})});
      const d=await res.json(); setSug((d.content||[]).map(b=>b.text||"").join("").trim()||"No suggestion returned.");
    }catch(e){ setSug("Could not reach the AI service. "+(e.message||"")); }
    setLd(false);
  };
  return(<div style={{marginBottom:18,padding:"16px 18px",borderRadius:10,background:"rgba(255,255,255,0.06)",border:"1px dashed rgba(255,255,255,0.28)"}}>
    <div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.goldLight,marginBottom:8}}>Score guidance — {ind.label}</div>
    <p style={{fontFamily:"'Nunito',sans-serif",fontSize:12.5,color:"rgba(255,255,255,0.85)",margin:"0 0 10px",lineHeight:1.6}}>No score factor is assumed — the score reflects only what you enter ({entered} of {total} factors entered so far). Typical for this industry: gross margin near {fmtPct(ind.marginBenchmark)}, annual growth near {fmtPct(ind.growthBenchmark)}. The factors that matter most here: {topDrivers.join(", ")}.</p>
    <button onClick={askAI} disabled={ld} style={{padding:"8px 16px",borderRadius:7,border:"none",background:ld?"rgba(255,255,255,0.15)":`linear-gradient(135deg,${C.gold},${C.navyMid})`,color:C.white,fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,cursor:ld?"wait":"pointer",letterSpacing:"0.03em"}}>{ld?"Thinking…":"✦ Suggest typical metrics for this industry (AI)"}{!AI_ENABLED?" — off":""}</button>
    {sug&&<div style={{marginTop:12,padding:"12px 14px",borderRadius:8,background:"rgba(0,0,0,0.18)",fontFamily:"'Nunito',sans-serif",fontSize:12.5,color:"rgba(255,255,255,0.9)",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{sug}</div>}
  </div>);
}

function OverridePanel({overrides,setOverrides,industry}){
  const ind=INDUSTRIES[industry]||INDUSTRIES.other;
  const [open,setOpen]=useState(false);
  const set=(k,v)=>setOverrides(o=>({...o,[k]:parseFloat(v)||undefined}));
  const td=(INDUSTRY_DRIVERS[industry]||INDUSTRY_DRIVERS.other).slice().sort((a,b)=>b[1]-a[1])[0];
  const topLabel=td&&DRV[td[0]]?DRV[td[0]].label.toLowerCase():"the key value drivers";
  const src=(ind.sources&&ind.sources[0])||"published transaction data";
  const gpct=(ind.growthBenchmark*100).toFixed(0);
  const fields=[
    {k:"sdeMin",l:"SDE Low",d:ind.sdeMin,s:"x",w:`Low end of the published SDE range for ${ind.label} (${ind.sdeMin}–${ind.sdeMax}x). Where owner-dependent, customer-concentrated businesses land. Basis: ${src}.`},
    {k:"sdeMax",l:"SDE High",d:ind.sdeMax,s:"x",w:`High end of the SDE range — earned by ${ind.label.toLowerCase()} with strong ${topLabel}, diversified customers, and clean financials.`},
    {k:"ebitdaMin",l:"EBITDA Low",d:ind.ebitdaMin,s:"x",w:`Low end of the EBITDA range institutional and PE buyers apply to ${ind.label.toLowerCase()} (${ind.ebitdaMin}–${ind.ebitdaMax}x).`},
    {k:"ebitdaMax",l:"EBITDA High",d:ind.ebitdaMax,s:"x",w:`High end — for scaled, low-owner-dependence operations with predictable cash flow.`},
    {k:"revenueMultiple",l:"Rev Multiple",d:ind.revenueMultiple,s:"x",w:`Sanity-check only: ${ind.label.toLowerCase()} transact near ${ind.revenueMultiple}x revenue. Weighted lowest because profitability varies more than top line.`},
    {k:"growthRate",l:"Growth Rate",d:ind.growthBenchmark,s:"%",w:`Typical annual growth for ${ind.label} (~${gpct}%); drives the forward projection. Auto-replaced by the client's actual 3-year rate when financial history is entered.`},
    {k:"marginImprovRate",l:"Margin Impr./Yr",d:0.01,s:"%",w:`Conservative assumption for annual margin gains from operational improvements (default 1%).`},
  ];
  return(<div style={{marginTop:24,border:`1px dashed ${C.gold}`,borderRadius:12,overflow:"hidden"}}><button onClick={()=>setOpen(!open)} style={{width:"100%",padding:"12px 20px",background:"rgba(49,116,222,0.08)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:C.gold,letterSpacing:"0.06em"}}><span>⚙ ADVISOR OVERRIDES (OPTIONAL) — Adjust Multiples & Assumptions</span><span style={{transform:open?"rotate(180deg)":"none",transition:"0.2s"}}>▾</span></button>{open&&(<div style={{padding:20,background:"rgba(49,116,222,0.04)"}}><p style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:C.slateLight,marginBottom:16,marginTop:0}}><strong style={{color:C.navyMid}}>Optional.</strong> You don't need to touch this — every field below already uses the published industry benchmark, so the app produces a full valuation and conclusion on its own. Override only when you have case-specific reason to. Leaving a field blank keeps its benchmark default. The Quality Score controls where in the range the midpoint lands. Each field below also notes why it starts where it does.</p><div style={{display:"flex",flexWrap:"wrap",gap:16}}>{fields.map(({k,l,d,s,w})=>(<div key={k} style={{width:"calc(50% - 8px)",minWidth:200}}><label style={{fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,color:C.slate,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:4}}>{l}</label><div style={{display:"flex",alignItems:"center",gap:6}}><input type="number" step="0.1" placeholder={s==="%"?(d*100).toFixed(1):d.toFixed(2)} value={overrides[k]!=null?(s==="%"?(overrides[k]*100).toFixed(1):overrides[k]):""} onChange={e=>set(k,s==="%"?parseFloat(e.target.value)/100:e.target.value)} style={{...iS,width:"80px",fontSize:13}}/><span style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.slateLight}}>{s}</span></div><div style={{fontFamily:"'Nunito',sans-serif",fontSize:10,color:C.slateLight,marginTop:2}}>Default: {s==="%"?(d*100).toFixed(1):d.toFixed(2)}{s}</div><div style={{fontFamily:"'Nunito',sans-serif",fontSize:10.5,color:C.slateLight,marginTop:4,lineHeight:1.45,fontStyle:"italic"}}>{w}</div></div>))}</div><button onClick={()=>setOverrides({})} style={{marginTop:14,padding:"6px 14px",borderRadius:6,border:`1px solid ${C.creamDark}`,background:"transparent",fontFamily:"'Nunito',sans-serif",fontSize:12,color:C.slateLight,cursor:"pointer"}}>Reset to Defaults</button></div>)}</div>);}

// ─── MODULE 1: GOALS & EXIT TARGETS ───────────────────────────────────────────
function ModuleProfile({data,set}){
  const s=(k,v)=>set(d=>({...d,[k]:v}));
  return(<div><SectionHeader num="1" title="Goals & Exit Targets" subtitle="The inputs that drive the gap analysis and projections — limited to what moves the outcome."/>
  <div style={{display:"flex",flexDirection:"column",gap:24}}>
    <div style={{padding:"12px 16px",borderRadius:10,background:"rgba(49,116,222,0.08)",border:`1px solid ${C.border}`}}><p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.slate,margin:0,lineHeight:1.55}}><strong style={{color:C.navyMid}}>For the gap analysis, enter at least:</strong> Current Age, Target Exit Age, and Desired Retirement Lifestyle. The rest sharpens the picture.</p></div>
    <Card><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,marginTop:0,marginBottom:20}}>Retirement Targets</h3>
    <div style={{display:"flex",flexWrap:"wrap",gap:16}}>
      <Field label="Current Annual Lifestyle Cost" half><Input value={data.lifestyleCost||""} onChange={v=>s("lifestyleCost",v)} prefix="$" placeholder="120,000" type="number"/></Field>
      <Field label="Desired Retirement Lifestyle" half><Input value={data.desiredLifestyle||""} onChange={v=>s("desiredLifestyle",v)} prefix="$" placeholder="150,000" type="number"/></Field>
      <Field label="Annual Savings / Investment Rate" half><Input value={data.savingsRate||""} onChange={v=>s("savingsRate",v)} prefix="$" placeholder="24,000" type="number"/></Field>
      <Field label="Expected Social Security (monthly)" half><Input value={data.ssMonthly||""} onChange={v=>s("ssMonthly",v)} prefix="$" placeholder="2,400" type="number" hint="Use SSA.gov estimate — reduces portfolio needed"/></Field>
      <Field label="Current Age" third><Input value={data.age||""} onChange={v=>s("age",v)} placeholder="52" type="number"/></Field>
      <Field label="Target Exit Age" third><Input value={data.retirementAge||""} onChange={v=>s("retirementAge",v)} placeholder="62" type="number"/></Field>
      <Field label="Years to Exit" third><div style={{...iS,background:C.cream,display:"flex",alignItems:"center",color:C.slateLight,fontSize:14}}>{data.age&&data.retirementAge?Math.max(0,p(data.retirementAge)-p(data.age))+" years":"—"}</div></Field>
      <Field label="Social Security Start Age" third><Input value={data.ssStartAge||""} onChange={v=>s("ssStartAge",v)} placeholder="67" type="number" hint="When benefits begin (62–70). Years before this are self-funded."/></Field>
      <Field label="Plan To Age (life expectancy)" third><Input value={data.planToAge||""} onChange={v=>s("planToAge",v)} placeholder="90" type="number" hint="For one person — assumes a married couple passes within a close range of each other."/></Field>
      <Field label="Years in Retirement" third><div style={{...iS,background:C.cream,display:"flex",alignItems:"center",color:C.slateLight,fontSize:14}}>{data.retirementAge&&data.planToAge?Math.max(0,p(data.planToAge)-p(data.retirementAge))+" years":"—"}</div></Field>
    </div></Card>
  </div></div>);}

// Itemized add-backs helper — documents SDE so it holds up under buyer scrutiny.
const ADDBACK_ITEMS=[
  {k:"ab_salary",l:"Above-market owner salary"},
  {k:"ab_vehicle",l:"Personal vehicle / auto"},
  {k:"ab_health",l:"Owner health & life insurance"},
  {k:"ab_travel",l:"Personal travel & meals"},
  {k:"ab_legal",l:"One-time legal / professional fees"},
  {k:"ab_other",l:"Other one-time / non-recurring"},
];
function AddBacksHelper({biz,sb}){
  const [open,setOpen]=useState(false);
  const total=ADDBACK_ITEMS.reduce((s,it)=>s+p(biz[it.k]),0);
  const setItem=(k,v)=>{const t=ADDBACK_ITEMS.reduce((s,it)=>s+(it.k===k?p(v):p(biz[it.k])),0);sb(k,v);sb("addbacks",t);};
  return(<div style={{marginTop:12,border:`1px dashed ${C.border}`,borderRadius:10,overflow:"hidden"}}>
    <button onClick={()=>setOpen(!open)} style={{width:"100%",padding:"10px 16px",background:C.cream,border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:C.navyMid}}><span>＋ Itemize add-backs (optional — builds a defensible SDE)</span><span style={{transform:open?"rotate(180deg)":"none",transition:"0.2s"}}>▾</span></button>
    {open&&<div style={{padding:16}}>
      <p style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:C.slateLight,margin:"0 0 14px"}}>Add-backs are owner perks and one-time costs a buyer would not carry. Itemizing them documents the SDE so it holds up under buyer scrutiny. This total replaces the Add-backs line in the table above.</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:14}}>
        {ADDBACK_ITEMS.map(it=><Field key={it.k} label={it.l} half><Input value={biz[it.k]||""} onChange={v=>setItem(it.k,v)} prefix="$" type="number" placeholder="0"/></Field>)}
      </div>
      <div style={{marginTop:14,padding:"10px 16px",borderRadius:8,background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:C.goldLight,letterSpacing:"0.06em",textTransform:"uppercase"}}>Total Add-backs</span>
        <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.white}}>{fmt(total)}</span>
      </div>
    </div>}
  </div>);
}

// ─── MODULE 2: BUSINESS + WEALTH ──────────────────────────────────────────────
function ModuleBusiness({biz,setBiz,wealth,setWealth,overrides,setOverrides,kData,isAdvisor}){
  const sb=(k,v)=>setBiz(d=>({...d,[k]:v}));
  const sw=(k,v)=>setWealth(d=>({...d,[k]:v}));
  const v=calcValuation(biz,overrides);
  const ind=INDUSTRIES[biz.industry]||INDUSTRIES.other;
  const autoGR=calcGrowthRate(biz);
  const hasHistory=p(biz.rev1)>0||p(biz.rev2)>0;

  return(<div><SectionHeader num="2" title="Value Assessment & Wealth Snapshot" subtitle="Business financials, quality scoring, complete personal wealth picture, and market comparables."/>
  <div style={{display:"flex",flexDirection:"column",gap:24}}>

    <div style={{padding:"12px 16px",borderRadius:10,background:"rgba(49,116,222,0.08)",border:`1px solid ${C.border}`}}><p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.slate,margin:0,lineHeight:1.55}}><strong style={{color:C.navyMid}}>To see a valuation, enter at least:</strong> Industry, Revenue, Net Income, and Owner Compensation (most recent year). Everything else is optional and refines the result.</p></div>

    <Card><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,marginTop:0,marginBottom:20}}>Business Profile</h3>
    <div style={{display:"flex",flexWrap:"wrap",gap:16}}>
      <Field label="Business Name"><Input value={biz.bizName||""} onChange={v=>sb("bizName",v)} placeholder="ABC Company LLC"/></Field>
      <Field label="Industry" half><Select value={biz.industry||"other"} onChange={v=>sb("industry",v)} options={Object.entries(INDUSTRIES).map(([k,v])=>({value:k,label:v.label}))}/></Field>
      <Field label="Business Structure" half><Select value={biz.structure||"llc"} onChange={v=>sb("structure",v)} options={[{value:"llc",label:"LLC"},{value:"s_corp",label:"S-Corporation"},{value:"c_corp",label:"C-Corporation"},{value:"partnership",label:"Partnership"},{value:"sole_prop",label:"Sole Proprietorship"}]}/></Field>
      <Field label="Owner Dependence" half><Select value={biz.ownerDep||""} onChange={v=>sb("ownerDep",v)} options={[{value:"",label:"— Select (drives score) —"},{value:"low",label:"Low — runs without me"},{value:"medium",label:"Medium — I manage, have a team"},{value:"high",label:"High — I am the business"}]}/></Field>
      <Field label="Revenue Type" half><Select value={biz.revenueType||""} onChange={v=>sb("revenueType",v)} options={[{value:"",label:"— Select (drives score) —"},{value:"recurring",label:"Primarily recurring / subscription"},{value:"mixed",label:"Mix recurring & project"},{value:"project",label:"Primarily project-based"},{value:"transactional",label:"Transactional / retail"}]}/></Field>
      <Field label="% Revenue from Top 3 Customers" half><Input value={biz.customerConc||""} onChange={v=>sb("customerConc",v)} placeholder="35" type="number" hint=">40% is a buyer concern"/></Field>
      <Field label="Deal Structure" half><Select value={biz.dealStructure||"asset"} onChange={v=>sb("dealStructure",v)} options={[{value:"asset",label:"Asset Sale (most common)"},{value:"stock",label:"Stock / Equity Sale"},{value:"installment",label:"Installment Sale (spread over years)"},{value:"esop",label:"ESOP (employee ownership)"}]}/></Field>
      <Field label="Describe specifically what this business does" hint="The AI summary uses this to match the closest comparable segment within the category. E.g. 'Residential & light-commercial fencing — install and repair, ~80% homeowners, wood & vinyl, 2 crews.'"><Textarea value={biz.description||""} onChange={v=>sb("description",v)} placeholder="Be specific: products/services, who the customers are, what makes it distinct…"/></Field>
    </div></Card>

    {industryInputs(biz.industry).length>0&&<Card><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,marginTop:0,marginBottom:6}}>Industry-Specific Value Drivers — {ind.label}</h3>
    <p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.slateLight,marginBottom:20,marginTop:0}}>These factors carry extra weight for {ind.label.toLowerCase()} and sharpen the quality score and where the valuation lands. Leave blank if unknown.</p>
    <div style={{display:"flex",flexWrap:"wrap",gap:16}}>{industryInputs(biz.industry).map(f=><Field key={f.key} label={f.label} half><Input value={biz[f.key]||""} onChange={v=>{if(v!==""){const n=parseFloat(v);if(!isNaN(n)&&(n<0||(f.max!=null&&n>f.max))){sb(f.key,String(Math.min(f.max==null?Infinity:f.max,Math.max(0,n))));return;}}sb(f.key,v);}} placeholder={f.ph} type="number" min="0" max={f.max} hint={f.hint}/></Field>)}</div></Card>}

    <Card><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,marginTop:0,marginBottom:8}}>3-Year Financial History</h3>
    <p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.slateLight,marginBottom:20,marginTop:0}}>Enter prior years to auto-calculate actual growth rate. More history = more accurate projections.</p>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontFamily:"'Nunito',sans-serif",fontSize:13}}>
      <thead><tr>{["Metric","2 Years Ago","1 Year Ago","Most Recent Year (Required)"].map((h,i)=><th key={i} style={{textAlign:i===0?"left":"right",padding:"8px 12px",borderBottom:`2px solid ${C.creamDark}`,color:i===3?C.navy:C.slateLight,fontWeight:i===3?700:400,fontSize:12,letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
      <tbody>{[{lbl:"Revenue",k0:"rev2",k1:"rev1",k2:"revenue"},{lbl:"Net Income",k0:"ni2",k1:"ni1",k2:"netIncome"},{lbl:"COGS",k0:"cogs2",k1:"cogs1",k2:"cogs"},{lbl:"Owner Comp",k0:null,k1:null,k2:"ownerComp"},{lbl:"Add-backs",k0:null,k1:null,k2:"addbacks"},{lbl:"Depreciation",k0:null,k1:null,k2:"depreciation"},{lbl:"Interest",k0:null,k1:null,k2:"interest"},{lbl:"Taxes Paid",k0:null,k1:null,k2:"taxes"},{lbl:"CapEx",k0:null,k1:null,k2:"capex"},{lbl:"Business Debt",k0:null,k1:null,k2:"bizDebt"}].map((row,i)=>(
        <tr key={i} style={{background:i%2===0?C.cream:C.white}}>
          <td style={{padding:"8px 12px",fontWeight:700,color:C.slate,fontSize:13}}>{row.lbl}</td>
          <td style={{padding:"8px 12px"}}>{row.k0?<Input value={biz[row.k0]||""} onChange={v=>sb(row.k0,v)} prefix="$" type="number" placeholder="—"/>:<span style={{color:C.creamDark,display:"flex",justifyContent:"flex-end"}}>—</span>}</td>
          <td style={{padding:"8px 12px"}}>{row.k1?<Input value={biz[row.k1]||""} onChange={v=>sb(row.k1,v)} prefix="$" type="number" placeholder="—"/>:<span style={{color:C.creamDark,display:"flex",justifyContent:"flex-end"}}>—</span>}</td>
          <td style={{padding:"8px 12px"}}><Input value={biz[row.k2]||""} onChange={v=>sb(row.k2,v)} prefix="$" type="number" placeholder={row.k2==="revenue"?"Required":"Optional"}/></td>
        </tr>
      ))}</tbody>
    </table></div>
    <AddBacksHelper biz={biz} sb={sb}/>
    {hasHistory&&<div style={{marginTop:12,padding:"10px 16px",borderRadius:8,background:C.cream,border:`1px solid ${C.border}`}}><p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.slate,margin:0}}><strong>Calculated 3-Year Growth Rate: {fmtPct(autoGR)}</strong> — used in projections (override in Advisor panel if needed)</p></div>}
    <div style={{display:"flex",flexWrap:"wrap",gap:16,marginTop:16}}>
      <Field label="Tax Basis in Business" half><Input value={biz.taxBasis||""} onChange={v=>sb("taxBasis",v)} prefix="$" placeholder="150,000" type="number" hint="Original investment + undistributed retained earnings"/></Field>
      <Field label="State Capital Gains Rate (%)" half><Input value={biz.stateTaxRate||""} onChange={v=>sb("stateTaxRate",v.startsWith("-")?"0":v)} placeholder="5.0" type="number" min="0"/></Field>
      {biz.dealStructure==="installment"&&<Field label="Installment Sale — Years to Spread" half><Input value={biz.installmentYears||""} onChange={v=>sb("installmentYears",v)} placeholder="5" type="number"/></Field>}
    </div>
    {biz.structure==="c_corp"&&biz.dealStructure==="asset"&&<div style={{marginTop:8,padding:"12px 16px",borderRadius:8,background:"rgba(192,57,43,0.06)",border:"1px solid rgba(192,57,43,0.3)"}}><p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.red,margin:0}}>⚠ C-Corp Asset Sale creates double taxation (~21% corporate + individual capital gains). Consider S-Corp conversion 5+ years before sale, or negotiate a stock sale structure.</p></div>}
    </Card>

    <Card><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,marginTop:0,marginBottom:6}}>Personal Wealth Snapshot</h3>
    <p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.slateLight,marginBottom:20,marginTop:0}}>All assets outside the business. This completes the true retirement picture when combined with sale proceeds.</p>
    <div style={{display:"flex",flexWrap:"wrap",gap:16}}>
      {ALLOC.map(cat=><Field key={cat.key} label={cat.label} half><Input value={wealth[cat.key]||""} onChange={v=>sw(cat.key,v)} prefix="$" placeholder="0" type="number"/></Field>)}
      <Field label="Total Personal Debt (all liabilities)" half><Input value={wealth.totalDebt||""} onChange={v=>sw("totalDebt",v)} prefix="$" placeholder="0" type="number"/></Field>
    </div>
    {p(wealth.retirement)+p(wealth.taxable)+p(wealth.cashSavings)>0&&(()=>{
      const liq=p(wealth.retirement)+p(wealth.taxable)+p(wealth.cashSavings)+p(wealth.lifeInsCV);
      const gross=ALLOC.reduce((a,c)=>a+p(wealth[c.key]),0);
      const net=gross-p(wealth.totalDebt);
      return(<div style={{marginTop:16,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
        <StatBox label="Gross Assets" value={fmtM(gross)} sub="Before liabilities"/>
        <StatBox label="Personal Net Worth" value={fmtM(net)} sub="Excl. business"/>
        <StatBox label="Liquid / Investable" value={fmtM(liq)} sub="Grows 7%/yr to exit"/>
      </div>);
    })()}</Card>

    {biz.revenue&&biz.netIncome&&(()=>{
      const v2=calcValuation(biz,overrides);
      const atax=calcAfterTax(v2.eqMid,biz);
      const wc=calcWealth(wealth,atax.net,kData);
      return(<Card style={{background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,border:"none"}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:C.goldLight,marginTop:0,marginBottom:14}}>Current Estimated Valuation</h3>
        <div style={{marginBottom:18}}>
          <div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.goldLight,marginBottom:6}}>Estimated Equity Value — Range</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:38,fontWeight:700,color:C.white,lineHeight:1.1}}>{fmtM(v2.eqLow)} – {fmtM(v2.eqHigh)}</div>
          <div style={{fontFamily:"'Nunito',sans-serif",fontSize:12.5,color:"rgba(255,255,255,0.75)",marginTop:8,lineHeight:1.55,maxWidth:620}}>Midpoint estimate {fmtM(v2.eqMid)} · quality score {v2.qs}/100. This is a planning <strong>estimate built from published market benchmarks — not a formal appraisal or an offer.</strong> Actual offers vary; always speak to the range, not a single number.</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14,marginBottom:20}}>
          <StatBox accent label="SDE" value={fmt(v2.sde)} sub="Seller's Discretionary Earnings"/>
          <StatBox accent label="EBITDA" value={fmt(v2.ebitda)} sub="Operating profitability"/>
          <StatBox accent label="Gross Margin" value={biz.cogs?fmtPct(v2.grossMargin):"Enter COGS"} sub={`Benchmark: ${fmtPct(ind.marginBenchmark)}`}/>
          <StatBox accent label="Equity (midpoint)" value={fmtM(v2.eqMid)} sub={v2.bizDebt?`Net of ${fmtM(v2.bizDebt)} debt`:"No business debt entered"}/>
        </div>
        <ScoreGuidance biz={biz}/>
        <QualityScore score={v2.qs} detail={calcQualityDetail(biz)}/>
        {kData.desiredLifestyle&&kData.age&&kData.retirementAge&&(<div style={{borderTop:"1px solid rgba(49,116,222,0.3)",paddingTop:20,marginTop:20}}>
          <h4 style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:C.goldLight,marginTop:0,marginBottom:16}}>Full Wealth Gap Analysis</h4>
          <div style={{marginBottom:18}}><HeadlineBanner wc={wc} yrs={wc.yrs} ready compact/></div>
          {wc.ssOffset>0&&<div style={{padding:"10px 14px",borderRadius:8,background:"rgba(49,116,222,0.1)",border:"1px solid rgba(49,116,222,0.2)",marginBottom:14}}><p style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:C.goldLight,margin:0}}>Social Security ({fmt(wc.ssOffset)}/yr) reduces annual portfolio draw from {fmt(p(kData.desiredLifestyle))} to {fmt(wc.netLifestyleNeed)}/yr → portfolio needed {fmtM(wc.portfolioNeeded)}</p></div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
            <StatBox accent label="Portfolio Needed" value={fmtM(wc.portfolioNeeded)} sub={`${fmt(wc.netLifestyleNeed)}/yr at 4% rule`}/>
            <StatBox accent label="Net from Sale" value={fmtM(atax.net)} sub="After tax, debt & deal costs"/>
            <StatBox accent label="Liquid Wealth (projected)" value={fmtM(p(wealth.retirement)+p(wealth.taxable)+p(wealth.cashSavings)+p(wealth.lifeInsCV)*Math.pow(1.07,wc.yrs))} sub={`${wc.yrs}yr growth @7%`}/>
            <StatBox accent label="Future Savings" value={fmt(p(kData.savingsRate)*wc.yrs)} sub={`${wc.yrs} yrs accumulated`}/>
            {wc.gap<=0?<StatBox ok label="Surplus" value={fmtM(Math.abs(wc.gap))} sub="On track ✓"/>:<StatBox warn label="Gap to Close" value={fmtM(wc.gap)} sub="Grow value, save more, or delay"/>}
          </div>
          {biz.dealStructure==="installment"&&(()=>{const yrs=p(biz.installmentYears)||5;const gain=Math.max(0,v2.eqMid-p(biz.taxBasis));const gpp=v2.eqMid>0?gain/v2.eqMid:0;const stRate=(biz.stateTaxRate===""||biz.stateTaxRate==null)?0.05:Math.max(0,p(biz.stateTaxRate))/100;const annTax=(v2.eqMid/yrs)*gpp*(0.238+stRate);const lumpTax=gain*(0.238+stRate);return(<div style={{marginTop:14,padding:"12px 16px",borderRadius:8,background:"rgba(49,116,222,0.1)",border:"1px solid rgba(49,116,222,0.2)"}}><p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.goldLight,margin:0}}><strong>Installment Sale:</strong> Spreading over {yrs} years saves ~{fmt(lumpTax-annTax*yrs)} in taxes vs. lump sum ({fmt(v2.eqMid/yrs)}/yr for {yrs} years).</p></div>);})()}
        </div>)}
        <div style={{marginTop:16,padding:"12px 16px",borderRadius:8,background:"rgba(49,116,222,0.1)",border:"1px solid rgba(49,116,222,0.2)"}}><p style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:C.goldLight,margin:0}}><strong>Industry Note:</strong> {ind.notes}</p></div>
        {ind.sources&&<div style={{marginTop:10}}><p style={{fontFamily:"'Nunito',sans-serif",fontSize:10,color:"rgba(255,255,255,0.55)",margin:0,lineHeight:1.6}}><strong style={{color:"rgba(255,255,255,0.7)"}}>Range basis (published transaction data):</strong> {ind.sources.join(" · ")}. These are objective market benchmarks; the Quality Score positions this business within the range. Advisor can override any multiple below.</p></div>}
      </Card>);
    })()}

    <Card><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,marginTop:0,marginBottom:16}}>Market Comparables — {ind.label}</h3>
    <p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.slateLight,marginBottom:16,marginTop:0}}>Published transaction data from M&A databases and business broker reports. Use as a sanity check on multiple assumptions.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
      {ind.comparables.map((c,i)=><div key={i} style={{padding:"14px 16px",borderRadius:10,background:C.cream,border:`1px solid ${C.border}`}}><div style={{fontFamily:"'Nunito',sans-serif",fontSize:10,fontWeight:700,color:C.gold,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{c.size}</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:C.navy,marginBottom:4}}>{c.range}</div><div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,color:C.slateLight}}>{c.source}</div></div>)}
    </div>
    <p style={{fontFamily:"'Nunito',sans-serif",fontSize:11,color:C.slateLight,marginBottom:0,marginTop:12}}>Sources: BizBuySell, Axial, Peak Business Valuation, FOCUS Bankers, BMI Mergers, FE International. Data reflects 2024–2025 private transaction activity. These are benchmarks, not guarantees — actual multiples depend on deal-specific factors.</p>
    </Card>

    <OverridePanel overrides={overrides} setOverrides={setOverrides} industry={biz.industry||"other"}/>
  </div></div>);}

// ─── MODULE 3: EXIT STRATEGY ──────────────────────────────────────────────────
function ModuleExit({biz,kData,wealth,overrides,isAdvisor}){
  const [futureYrs,setFutureYrs]=useState(3);
  const [compareYr,setCompareYr]=useState(0);
  const ind=INDUSTRIES[biz.industry]||INDUSTRIES.other;
  const projData=projectYears(biz,overrides,futureYrs);
  const projToday=projData.find(r=>r.year==="Today")||projData[0]||{};
  const projExit=projData[projData.length-1]||{};
  const v=calcValuation(biz,overrides);

  const scenarioYear=(yr)=>{
    const d=projData.find(r=>r.year===(yr===0?"Today":`Yr +${yr}`))||projData[0];
    if(!d) return null;
    const fakeBiz={...biz,netIncome:d.netIncome,revenue:d.revenue};
    const fv=calcValuation(fakeBiz,overrides);
    return fv;
  };
  const baseV=scenarioYear(0);
  const compV=scenarioYear(compareYr);

  // Three fixed exit paths for every industry. Multiples are relative to the
  // quality-adjusted value: strategic buyers pay a synergy premium; PE pays around
  // fair value; an employee/internal purchase sits below on limited financing.
  const scenarios=[
    {name:"Strategic Buyer",mult:1.10},
    {name:"Private Equity",mult:1.00},
    {name:"Employee Purchase (ESOP)",mult:0.80},
  ].map(({name,mult})=>{
    const price=v.eqMid*mult;
    const at=calcAfterTax(price,biz);
    return {name,price,net:at.net,fedCG:at.fedCG,state:at.state,deal:at.deal,debt:at.debt};
  });

  return(<div><SectionHeader num="3" title="Exit Strategy & Projections" subtitle="Modeled exit paths, value trajectory, scenario comparison, and market timing analysis."/>
  <div style={{display:"flex",flexDirection:"column",gap:24}}>
    {biz.revenue&&biz.netIncome?(<>
      <Card>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:8}}>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,margin:0}}>Business Value Trajectory</h3>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:C.slateLight}}>Project</span>
            {[3,5,7].map(y=><button key={y} onClick={()=>setFutureYrs(y)} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${futureYrs===y?C.gold:C.creamDark}`,background:futureYrs===y?"rgba(49,116,222,0.12)":"transparent",fontFamily:"'Nunito',sans-serif",fontSize:12,color:futureYrs===y?C.navy:C.slateLight,cursor:"pointer",fontWeight:futureYrs===y?700:400}}>{y}yr</button>)}
          </div>
        </div>
        <p style={{fontFamily:"'Nunito',sans-serif",fontSize:13.5,color:C.slate,marginBottom:18,marginTop:0,lineHeight:1.6}}>This shows what the business could be worth over the next {futureYrs} years if it keeps growing at about {fmtPct(overrides.growthRate??calcGrowthRate(biz))} a year{p(biz.rev1)>0?" (calculated from the financial history you entered)":" (industry estimate — add prior-year revenue for a tailored rate)"}. The line is the expected value; the shaded area is the realistic range.</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBottom:18}}>
          {[["Value today",fmtM(projToday.valuationMid)],[`Estimated value at exit (~${futureYrs} yrs)`,fmtM(projExit.valuationMid)],["Likely range at exit",`${fmtM(projExit.valuationLow)} – ${fmtM(projExit.valuationHigh)}`]].map(([l,val],i)=>(<div key={i} style={{flex:"1 1 180px",minWidth:160,padding:"12px 16px",borderRadius:10,background:C.cream,border:`1px solid ${C.border}`}}><div style={{fontFamily:"'Nunito',sans-serif",fontSize:10.5,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:C.slateLight,marginBottom:4}}>{l}</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:i===2?C.gold:C.navy}}>{val}</div></div>))}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={projData} margin={{top:10,right:20,bottom:5,left:10}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.creamDark} vertical={false}/>
            <XAxis dataKey="year" tick={{fontFamily:"'Nunito',sans-serif",fontSize:12,fill:C.slate}}/>
            <YAxis tickFormatter={n=>"$"+(n/1000000).toFixed(1)+"M"} tick={{fontFamily:"'Nunito',sans-serif",fontSize:12,fill:C.slate}} width={64}/>
            <Tooltip formatter={(n,name)=>[Array.isArray(n)?fmtM(n[0])+" – "+fmtM(n[1]):fmtM(n),{range:"Likely range",valuationMid:"Expected value"}[name]||name]} labelStyle={{fontFamily:"'Nunito',sans-serif",fontWeight:700}} contentStyle={{fontFamily:"'Nunito',sans-serif",borderRadius:8}}/>
            <Legend wrapperStyle={{fontFamily:"'Nunito',sans-serif",fontSize:13,paddingTop:8}}/>
            <ReferenceLine x="Today" stroke={C.gold} strokeDasharray="4 4" label={{value:"Today",position:"top",fontFamily:"'Nunito',sans-serif",fontSize:12,fill:C.gold,fontWeight:700}}/>
            <Area type="monotone" dataKey="range" stroke="none" fill={C.gold} fillOpacity={0.16} name="Likely range" connectNulls={false} activeDot={false} legendType="rect"/>
            <Line type="monotone" dataKey="valuationMid" stroke={C.green} strokeWidth={3.5} name="Expected value" dot={{r:3,fill:C.green}} activeDot={{r:6}}/>
          </ComposedChart>
        </ResponsiveContainer>
        <p style={{fontFamily:"'Nunito',sans-serif",fontSize:12.5,color:C.slateLight,margin:"10px 4px 0",lineHeight:1.55}}>How to read it together: start at "Today" on the left and follow the green line to the right to see the estimated value at exit. The shaded band is the realistic high-to-low range — a real sale is rarely one exact number.</p>
      </Card>

      <Card>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,marginTop:0,marginBottom:8}}>What If I Wait?</h3>
        <p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.slateLight,marginBottom:16,marginTop:0}}>Compare selling today vs. waiting. Drag to compare years.</p>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <span style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.slate}}>Compare: Today vs. Year +</span>
          <input type="range" min={1} max={futureYrs} value={compareYr||1} onChange={e=>setCompareYr(parseInt(e.target.value))} style={{flex:1,maxWidth:200,accentColor:C.gold}}/>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:C.navy}}>+{compareYr||1}</span>
        </div>
        {baseV&&compV&&(()=>{
          const nowAt=calcAfterTax(baseV.eqMid,biz);
          const thenAt=calcAfterTax(compV.eqMid,biz);
          const diff=thenAt.net-nowAt.net;
          return(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{padding:20,borderRadius:12,background:C.cream,border:`1px solid ${C.border}`}}>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,color:C.slateLight,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Sell Today</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.navy,marginBottom:4}}>{fmtM(baseV.eqMid)}</div>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.green}}>Net after tax: {fmtM(nowAt.net)}</div>
            </div>
            <div style={{padding:20,borderRadius:12,background:diff>0?"rgba(31,122,92,0.06)":"rgba(192,57,43,0.06)",border:`1px solid ${diff>0?"rgba(31,122,92,0.25)":"rgba(192,57,43,0.25)"}`}}>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,color:C.slateLight,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Sell in Year +{compareYr||1}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.navy,marginBottom:4}}>{fmtM(compV.eqMid)}</div>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:diff>0?C.green:C.red}}>Net after tax: {fmtM(thenAt.net)} ({diff>0?"+":""}{fmtM(diff)})</div>
            </div>
          </div>);
        })()}
      </Card>

      <Card>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,marginTop:0,marginBottom:8}}>Exit Scenario Comparison — After Tax</h3>
        <p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.slateLight,marginBottom:20,marginTop:0}}>Net proceeds by buyer type after capital gains, state tax, deal costs, and business debt payoff.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:16}}>
          {scenarios.map((sc,i)=>(
            <div key={i} style={{padding:20,borderRadius:12,border:`2px solid ${i===0?C.gold:C.creamDark}`,background:i===0?`linear-gradient(135deg,rgba(49,116,222,0.08),transparent)`:C.cream,position:"relative"}}>
              {i===0&&<div style={{position:"absolute",top:-10,left:16,background:C.gold,color:C.white,fontSize:10,fontWeight:700,padding:"2px 10px",borderRadius:10,fontFamily:"'Nunito',sans-serif",letterSpacing:"0.06em"}}>BEST CASE</div>}
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:C.navy,marginBottom:12}}>{sc.name}</div>
              {[["Sale Price",fmt(sc.price),false],["Business Debt","-"+fmt(sc.debt),true],["Fed Capital Gains","-"+fmt(sc.fedCG),true],["State Tax","-"+fmt(sc.state),true],["Deal Costs","-"+fmt(sc.deal),true]].map(([l,v,neg],j)=>(
                <div key={j} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:C.slateLight}}>{l}</span><span style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:neg?C.red:C.navy,fontWeight:neg?400:700}}>{v}</span></div>
              ))}
              <div style={{height:1,background:C.creamDark,margin:"8px 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:C.slate}}>Net to Owner</span><span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:C.green}}>{fmtM(sc.net)}</span></div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,marginTop:0,marginBottom:16}}>Exit Readiness Roadmap</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16}}>
          {[{phase:"Now – Year 1",label:"Foundation",items:["Complete value gap analysis","Identify key employees","Begin documentation","Review entity structure"]},{phase:"Year 1–3",label:"Value Building",items:["Reduce owner dependence","Grow recurring revenue","Formalize systems/SOPs","Address legal gaps"]},{phase:"Year 3–4",label:"Pre-Market Prep",items:["Engage business broker","Clean up financials","Buyer outreach strategy","Due diligence prep"]},{phase:"Year 4–5",label:"Go to Market",items:["Active deal marketing","LOI negotiation","Tax structure optimization","Transition planning"]}].map((ph,i)=>(
            <div key={i} style={{padding:16,borderRadius:10,background:C.cream,border:`1px solid ${C.border}`}}>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.gold,textTransform:"uppercase",marginBottom:4}}>{ph.phase}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:C.navy,marginBottom:10}}>{ph.label}</div>
              <ul style={{margin:0,padding:"0 0 0 16px"}}>{ph.items.map((it,j)=><li key={j} style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:C.slate,marginBottom:4,lineHeight:1.4}}>{it}</li>)}</ul>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,marginTop:0,marginBottom:16}}>Industry Risk Factors</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {ind.riskFactors.map((risk,i)=>{
            const flagged=(risk.toLowerCase().includes("owner")&&biz.ownerDep==="high")||(risk.toLowerCase().includes("concentration")&&p(biz.customerConc)>40);
            return(<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:8,background:flagged?"rgba(192,57,43,0.06)":C.cream,border:`1px solid ${flagged?"rgba(192,57,43,0.25)":C.border}`}}><span style={{fontSize:16}}>{flagged?"⚠️":"📋"}</span><div><div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:flagged?C.red:C.navy}}>{risk}</div>{flagged&&<div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,color:C.red,marginTop:2}}>Flagged based on inputs — discuss mitigation strategy</div>}</div></div>);
          })}
        </div>
      </Card>
    </>):(<Card><p style={{fontFamily:"'Nunito',sans-serif",fontSize:14,color:C.slateLight,textAlign:"center",padding:"40px 0"}}>Complete Module 2 with financial data to see projections.</p></Card>)}
  </div></div>);}

// ─── MODULE 4: CONTINGENCY ────────────────────────────────────────────────────
function ModuleContingency({data,set,biz}){
  const s=(k,v)=>set(d=>({...d,[k]:v}));
  const owners=p(data.numOwners)||1;
  const nowY=new Date().getFullYear();
  const items=[];
  // Buy-Sell (only relevant with 2+ owners)
  if(owners>=2){
    if(data.buySell==="yes_current") items.push({k:"Buy-Sell Agreement",s:"ok",m:"Current agreement in place."});
    else if(data.buySell==="yes_outdated") items.push({k:"Buy-Sell Agreement",s:"warn",m:"Agreement is outdated — review with the attorney."});
    else items.push({k:"Buy-Sell Agreement",s:"risk",m:"Multiple owners with no buy-sell — major risk on death or disability. Flag for attorney."});
    if(data.buySell==="yes_current"||data.buySell==="yes_outdated"){
      if(!data.buySellFunding||data.buySellFunding==="none") items.push({k:"Buy-Sell Funding",s:"risk",m:"Agreement is unfunded — no source of money to actually execute it."});
      else items.push({k:"Buy-Sell Funding",s:"ok",m:"Funding mechanism in place."});
    }
  } else items.push({k:"Buy-Sell Agreement",s:"ok",m:"Single owner — a buy-sell agreement is not required."});
  // Will
  items.push(data.will==="yes"?{k:"Will / Estate Plan",s:"ok",m:"Will in place."}:data.will==="outdated"?{k:"Will / Estate Plan",s:"warn",m:"Will is outdated — update recommended."}:{k:"Will / Estate Plan",s:"risk",m:"No will — a foundational estate document is missing."});
  // Financial POA
  items.push(data.fpoa==="yes"?{k:"Financial Power of Attorney",s:"ok",m:"In place."}:{k:"Financial Power of Attorney",s:"risk",m:"Missing — needed for someone to act if the owner is incapacitated."});
  // Medical directive
  items.push(data.medDirective==="yes"?{k:"Medical Directive",s:"ok",m:"In place."}:{k:"Medical Directive",s:"risk",m:"Missing — an advance medical directive is recommended."});
  // Beneficiary currency
  const byr=p(data.lastBene);
  items.push(byr&&nowY-byr<=3?{k:"Beneficiary Designations",s:"ok",m:`Updated ${byr} — within the last 3 years.`}:byr?{k:"Beneficiary Designations",s:"warn",m:`Last updated ${byr} — confirm still accurate.`}:{k:"Beneficiary Designations",s:"risk",m:"No recent update on record — verify beneficiaries are current."});
  // Key person insurance
  items.push(data.keyManIns==="yes"?{k:"Key Person Insurance",s:"ok",m:"Adequate coverage in place."}:data.keyManIns==="yes_low"?{k:"Key Person Insurance",s:"warn",m:"Coverage likely underfunded — review the amount."}:{k:"Key Person Insurance",s:"risk",m:"No key-person coverage — business continuity is exposed."});
  // Disability
  items.push(data.diIns==="yes"?{k:"Disability / Income Replacement",s:"ok",m:"Coverage in place."}:data.diIns==="partial"?{k:"Disability / Income Replacement",s:"warn",m:"Partial coverage — review adequacy."}:{k:"Disability / Income Replacement",s:"risk",m:"No disability coverage for the owner."});
  // Succession
  items.push(data.succession==="yes"?{k:"Succession Plan",s:"ok",m:"Formal written plan."}:data.succession==="informal"?{k:"Succession Plan",s:"warn",m:"Only informal/verbal — get it documented."}:{k:"Succession Plan",s:"risk",m:"No succession plan."});
  // Internal successor
  items.push(data.successor&&data.successor!=="no"?{k:"Internal Successor",s:"ok",m:"A successor has been identified."}:{k:"Internal Successor",s:"risk",m:"No successor identified — who runs it if the owner is suddenly gone?"});
  // Break-glass continuity
  items.push(data.breakGlass&&data.breakGlass.trim()?{k:"Business Continuity Plan",s:"ok",m:"A 'break glass' plan is documented."}:{k:"Business Continuity Plan",s:"risk",m:"No documented continuity plan for the first days after a loss."});
  // Entity structure
  if(biz.structure==="c_corp") items.push({k:"Entity Structure",s:"warn",m:"C-Corp — discuss S-Corp conversion with the CPA well before sale (double-tax risk)."});
  const risks=items.filter(i=>i.s==="risk").length, warns=items.filter(i=>i.s==="warn").length, oks=items.filter(i=>i.s==="ok").length;
  return(<div><SectionHeader num="4" title="Contingency & Risk Planning" subtitle="The 'break glass' plan — what happens if the owner dies or is suddenly out. Every item below shows a green, amber, or red status."/>
  <div style={{display:"flex",flexDirection:"column",gap:24}}>
    <Card><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,marginTop:0,marginBottom:20}}>Ownership & Legal Documents</h3>
    <div style={{display:"flex",flexWrap:"wrap",gap:16}}>
      <Field label="Number of Owners" third><Input value={data.numOwners||""} onChange={v=>s("numOwners",v)} placeholder="1" type="number" min="0"/></Field>
      <Field label="Buy-Sell Agreement?" third><Select value={data.buySell||"no"} onChange={v=>s("buySell",v)} options={[{value:"no",label:"No"},{value:"yes_current",label:"Yes — current"},{value:"yes_outdated",label:"Yes — outdated"}]}/></Field>
      <Field label="Buy-Sell Funding" third><Select value={data.buySellFunding||"none"} onChange={v=>s("buySellFunding",v)} options={[{value:"none",label:"None"},{value:"life_ins",label:"Life insurance funded"},{value:"installment",label:"Installment payments"},{value:"sinking_fund",label:"Sinking fund"}]}/></Field>
      <Field label="Will in Place?" third><Select value={data.will||"no"} onChange={v=>s("will",v)} options={[{value:"no",label:"No"},{value:"yes",label:"Yes"},{value:"outdated",label:"Outdated"}]}/></Field>
      <Field label="Financial POA?" third><Select value={data.fpoa||"no"} onChange={v=>s("fpoa",v)} options={[{value:"no",label:"No"},{value:"yes",label:"Yes"}]}/></Field>
      <Field label="Medical Directive?" third><Select value={data.medDirective||"no"} onChange={v=>s("medDirective",v)} options={[{value:"no",label:"No"},{value:"yes",label:"Yes"}]}/></Field>
      <Field label="Last Beneficiary Update (year)" third><Input value={data.lastBene||""} onChange={v=>s("lastBene",v)} placeholder="2024" type="number"/></Field>
    </div></Card>
    <Card><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,marginTop:0,marginBottom:20}}>Insurance</h3>
    <div style={{display:"flex",flexWrap:"wrap",gap:16}}>
      <Field label="Key Person Life Insurance?" half><Select value={data.keyManIns||"no"} onChange={v=>s("keyManIns",v)} options={[{value:"no",label:"No"},{value:"yes",label:"Yes — adequate"},{value:"yes_low",label:"Yes — likely underfunded"}]}/></Field>
      <Field label="Disability / Income Replacement?" half><Select value={data.diIns||"no"} onChange={v=>s("diIns",v)} options={[{value:"no",label:"No"},{value:"yes",label:"Yes"},{value:"partial",label:"Partial"}]}/></Field>
    </div>
    {p(biz.revenue)>0&&<div style={{marginTop:14,padding:"14px 18px",borderRadius:10,background:C.cream,border:`1px solid ${C.border}`}}><p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.slate,margin:0}}><strong>Suggested Key Person Coverage:</strong> {fmt(p(biz.revenue)*1.5)} – {fmt(p(biz.revenue)*2.0)} (1.5–2× annual revenue of {fmt(p(biz.revenue))})</p></div>}
    </Card>
    <Card><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,marginTop:0,marginBottom:20}}>Succession</h3>
    <div style={{display:"flex",flexWrap:"wrap",gap:16}}>
      <Field label="Formal Succession Plan?" half><Select value={data.succession||"no"} onChange={v=>s("succession",v)} options={[{value:"no",label:"No"},{value:"informal",label:"Informal / verbal"},{value:"yes",label:"Yes — formal written"}]}/></Field>
      <Field label="Internal Successor Identified?" half><Select value={data.successor||"no"} onChange={v=>s("successor",v)} options={[{value:"no",label:"No"},{value:"family",label:"Family member"},{value:"employee",label:"Key employee"},{value:"mgmt_team",label:"Management team"}]}/></Field>
      <Field label="'Break Glass' Business Continuity Plan"><Textarea value={data.breakGlass||""} onChange={v=>s("breakGlass",v)} placeholder="Who takes over operations immediately? Who has banking and system access? First 30-day priorities?" rows={4}/></Field>
    </div></Card>
    <Card><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:6}}><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,margin:0}}>Contingency Status</h3><div style={{fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:C.slateLight}}>🟢 {oks} ok · 🟡 {warns} review · 🔴 {risks} risk</div></div>
    <p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.slate,marginTop:0,marginBottom:16}}>Every item below is flagged. Share the red and amber items with the client's attorney before document drafting.</p>
    <div style={{display:"flex",flexDirection:"column",gap:9}}>{items.map((it,i)=>{const c=it.s==="ok"?"rgba(31,122,92,":it.s==="warn"?"rgba(215,119,6,":"rgba(192,57,43,";const dot=it.s==="ok"?"🟢":it.s==="warn"?"🟡":"🔴";return(<div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 14px",borderRadius:8,background:c+"0.06)",border:`1px solid ${c}0.28)`}}><span style={{fontSize:14,flexShrink:0,lineHeight:1.4}}>{dot}</span><div style={{minWidth:0}}><div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:C.slate}}>{it.k}</div><div style={{fontFamily:"'Nunito',sans-serif",fontSize:12.5,color:C.slateLight,marginTop:2,lineHeight:1.5}}>{it.m}</div></div></div>);})}</div></Card>
  </div></div>);}

// ─── MODULE 5: SUMMARY ────────────────────────────────────────────────────────
// Factual highlight chip for the Key Takeaways strip.
function TakeChip({label,value,good,warn}){
  const col=good?C.green:warn?C.amber:C.navy;
  return(<div style={{flex:"1 1 140px",minWidth:140,padding:"12px 14px",borderRadius:10,background:C.cream,border:`1px solid ${C.border}`}}>
    <div style={{fontFamily:"'Nunito',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:C.slateLight,marginBottom:4}}>{label}</div>
    <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:col}}>{value}</div>
  </div>);
}

function ModuleSummary({kData,biz,cont,wealth,overrides,isAdvisor}){
  const [sum,setSum]=useState(""),loading=useState(false);
  const [ld,setLd]=useState(false);
  const v=calcValuation(biz,overrides);
  const ind=INDUSTRIES[biz.industry]||INDUSTRIES.other;
  const atax=biz.revenue?calcAfterTax(v.eqMid,biz):{net:0};
  const wc=calcWealth(wealth,atax.net,kData);

  const generate=async()=>{
    if(!AI_ENABLED){ setSum("The AI executive summary isn't switched on yet. Every number and section above is ready to print and share as-is. To enable this AI write-up later, see the project README → \"Turning on the AI features.\""); return; }
    setLd(true);
    const prompt=`You are a senior financial advisor at Decidedly Wealth Management writing a professional exit planning summary for a business owner. Use warm, specific, advisor-to-client language. Use the actual numbers provided — no generic filler.

CLIENT: ${biz.bizName||"Client's Business"} (${ind.label})
Specifically: ${biz.description||"not described — infer from category"}
Age: ${kData.age||"N/A"} → Target exit: ${kData.retirementAge||"N/A"} (${Math.max(0,p(kData.retirementAge||65)-p(kData.age||50))} years)
Exit assumption: full sale, owner does not stay on (conservative)
Desired Lifestyle: $${p(kData.desiredLifestyle).toLocaleString()}/yr | SS Income: $${(p(kData.ssMonthly)*12).toLocaleString()}/yr

FINANCIALS:
Revenue: $${p(biz.revenue).toLocaleString()} | Gross Margin: ${biz.cogs?fmtPct((p(biz.revenue)-p(biz.cogs))/p(biz.revenue)):"N/A"}
SDE: $${v.sde.toLocaleString()} | EBITDA: $${v.ebitda.toLocaleString()}
Business Quality Score: ${v.qs}/100 | Owner Dependence: ${biz.ownerDep||"not entered"}
Equity Value Range: ${fmtM(v.eqLow)} – ${fmtM(v.eqHigh)} | Quality-Adj. Value: ${fmtM(v.eqMid)}
Est. After-Tax Net from Sale: ${fmtM(atax.net)} | Deal Structure: ${biz.dealStructure||"asset sale"}
Category benchmark basis: ${(ind.sources||[]).join("; ")}

WEALTH PICTURE:
Personal Net Worth (excl. business): ${fmtM(wc.net)}
Liquid Investable Assets: ${fmtM(wc.liquid)}
Portfolio Needed at Retirement: ${fmtM(wc.portfolioNeeded)} | Gap/Surplus: ${wc.gap>0?fmtM(wc.gap)+" shortfall":fmtM(Math.abs(wc.gap))+" surplus"}

RISKS: ${ind.riskFactors.join(", ")}

Write 4 paragraphs:
1. Where they are today — business value in context of their total wealth picture. Use the "Specifically" description to name the closest comparable sub-segment and note where it sits within the category's published range.
2. Where they are going — whether the numbers support their retirement vision, the gap if any
3. Key risks and top 2–3 value-building priorities specific to what this business actually does (use the description), not just the category
4. Concrete next steps with Decidedly — specific, actionable, not generic

Under 400 words. Encouraging but honest. Reference the actual numbers, and where you cite a typical multiple range, attribute it to the benchmark basis provided (e.g., "per BizBuySell / Sofer Advisors data") rather than stating it as fact.`;
    try{
      const res=await fetch("/api/anthropic",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const d=await res.json();
      setSum(d.content?.map(b=>b.text||"").join("")||"Unable to generate.");
    }catch(e){setSum("Could not connect. Check connection and try again.");}
    setLd(false);
  };

  const checks=[
    {cat:"Goals & Targets",items:[{l:"Retirement lifestyle defined",d:!!kData.desiredLifestyle},{l:"Exit age set",d:!!kData.retirementAge},{l:"Social Security start & life expectancy set",d:!!(kData.ssStartAge&&kData.planToAge)},{l:"SS income entered",d:!!kData.ssMonthly}]},
    {cat:"Business Valuation",items:[{l:"3-year financials entered",d:!!(biz.revenue&&biz.netIncome)},{l:"COGS / gross margin",d:!!biz.cogs},{l:"Business debt entered",d:biz.bizDebt!==undefined},{l:"Deal structure selected",d:!!biz.dealStructure}]},
    {cat:"Personal Wealth",items:[{l:"Retirement accounts",d:!!wealth.retirement},{l:"Taxable investments",d:!!wealth.taxable},{l:"Real estate",d:!!(wealth.realEstate||wealth.primaryHome)},{l:"Personal debt",d:wealth.totalDebt!==undefined}]},
    {cat:"Legal & Contingency",items:[{l:"Buy-Sell Agreement confirmed",d:cont.buySell==="yes_current"},{l:"Key Man Insurance reviewed",d:cont.keyManIns==="yes"},{l:"Estate documents reviewed",d:cont.will==="yes"&&cont.fpoa==="yes"},{l:"Succession plan documented",d:cont.succession==="yes"}]},
  ];
  const totalDone=checks.flatMap(c=>c.items).filter(i=>i.d).length;
  const totalItems=checks.flatMap(c=>c.items).length;

  // Key takeaways (factual highlights) + biggest value drag
  const qd=calcQualityDetail(biz);
  const dragF=qd.factors.filter(f=>!["—","Not entered","Enter COGS"].includes(f.val)).sort((a,b)=>a.pts-b.pts)[0];
  const bigDrag=dragF&&dragF.pts<0?dragF.label:((ind.riskFactors&&ind.riskFactors[0])||"—");
  const goalsReady=!!(kData.desiredLifestyle&&kData.age&&kData.retirementAge);
  const fundedTxt=goalsReady?(wc.gap<=0?"Surplus "+fmtM(Math.abs(wc.gap)):"Short "+fmtM(wc.gap)):"Enter goals";

  const printSummary=()=>{
    const w=window.open("","_blank","width=840,height=1000");
    if(!w){alert("Please allow pop-ups for this site to print the summary.");return;}
    const row=(l,val)=>`<tr><td style="padding:8px 0;color:#6b7280;font-size:13px">${l}</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#021966;font-size:14px">${val}</td></tr>`;
    const steps=checks.flatMap(c=>c.items).filter(i=>!i.d).slice(0,6).map(i=>`<li style="margin-bottom:6px">${i.l}</li>`).join("")||"<li>All readiness items complete.</li>";
    const esc=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;");
    const body=`
      <div style="background:#021966;padding:22px 28px;display:flex;align-items:center;gap:14px">
        <img src="${LOGO_URI}" width="40" height="40" alt=""/>
        <div><div style="font-family:Nunito,Arial,sans-serif;font-weight:800;letter-spacing:.22em;color:#fff;font-size:20px">DECIDEDLY</div><div style="font-family:Nunito,Arial,sans-serif;font-size:8px;letter-spacing:.34em;color:#a9cbf7;text-transform:uppercase">Wealth Management</div></div>
        <div style="margin-left:auto;color:#a9cbf7;font-family:Nunito,Arial,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.12em">Business Exit Plan Summary</div>
      </div>
      <div style="padding:28px 32px;font-family:Nunito,Arial,sans-serif;color:#2d2d2d">
        <h1 style="font-family:'Playfair Display',Georgia,serif;color:#021966;font-size:24px;margin:0 0 2px">${esc(biz.bizName||"Client's Business")}</h1>
        <div style="color:#6b7280;font-size:13px;margin-bottom:20px">${esc(ind.label)}${biz.description?" — "+esc(biz.description):""} &middot; Prepared ${new Date().toLocaleDateString()}</div>
        ${goalsReady?`<div style="border-radius:10px;padding:16px 18px;margin-bottom:22px;background:${wc.gap<=0?"#e8f5ee":"#eaf0fb"};border-left:5px solid ${wc.gap<=0?"#0f7a52":"#063894"}"><div style="font-family:'Playfair Display',Georgia,serif;font-size:17px;font-weight:700;color:${wc.gap<=0?"#0f7a52":"#063894"}">${wc.gap<=0?"On track — fully funded":"You're "+fmtM(wc.gap)+" short of your goal"}</div><div style="font-size:12.5px;color:#2d2d2d;margin-top:5px;line-height:1.5">${wc.gap<=0?"Your projected resources fully fund your desired lifestyle, with a surplus of "+fmtM(Math.abs(wc.gap))+".":"Your projected resources fall short of fully funding your desired lifestyle by approximately "+fmtM(wc.gap)+", with "+wc.yrs+" years until the planned exit."}</div></div>`:""}
        <h2 style="font-family:'Playfair Display',Georgia,serif;color:#063894;font-size:16px;border-bottom:2px solid #d4ddec;padding-bottom:6px">Key Numbers</h2>
        <table style="width:100%;border-collapse:collapse">
          ${row("Estimated Value Range", biz.revenue?fmtM(v.eqLow)+" &ndash; "+fmtM(v.eqHigh):"&mdash;")}
          ${row("Quality-Adjusted (Expected) Value", biz.revenue?fmtM(v.eqMid):"&mdash;")}
          ${row("Business Quality Score", v.qs+" / 100")}
          ${row("Estimated After-Tax Net from Sale", biz.revenue?fmtM(atax.net):"&mdash;")}
          ${row("Funded Status", goalsReady?(wc.gap<=0?"Fully funded &mdash; surplus "+fmtM(Math.abs(wc.gap)):"Short by "+fmtM(wc.gap)):"&mdash;")}
          ${row("Target Exit", kData.retirementAge?("Age "+kData.retirementAge):"&mdash;")}
          ${row("Biggest Value Driver to Address", esc(bigDrag))}
        </table>
        <h2 style="font-family:'Playfair Display',Georgia,serif;color:#063894;font-size:16px;border-bottom:2px solid #d4ddec;padding-bottom:6px;margin-top:24px">Recommended Next Steps</h2>
        <ul style="font-size:13px;line-height:1.6;color:#2d2d2d;padding-left:18px">${steps}</ul>
        ${sum?`<h2 style="font-family:'Playfair Display',Georgia,serif;color:#063894;font-size:16px;border-bottom:2px solid #d4ddec;padding-bottom:6px;margin-top:24px">Advisor Summary</h2><div style="font-size:13px;line-height:1.7;white-space:pre-line">${esc(sum)}</div>`:""}
        <p style="margin-top:28px;font-size:10px;color:#9aa3b2;line-height:1.5">Valuation ranges are based on published transaction benchmarks (${esc((ind.sources||[]).join("; "))}) and are estimates for planning discussion, not a formal appraisal or offer. Prepared by Decidedly Wealth Management.</p>
      </div>`;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(biz.bizName||"Exit Plan")} - Summary</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet"></head><body style="margin:0">${body}</body></html>`);
    w.document.close(); w.focus();
    setTimeout(()=>{try{w.print();}catch(e){}},500);
  };

  return(<div><SectionHeader num="5" title="Exit Plan Summary" subtitle="Everything synthesized — one complete deliverable the client takes home."/>
  <div style={{display:"flex",flexDirection:"column",gap:24}}>
    {biz.revenue&&<HeadlineBanner wc={wc} yrs={wc.yrs} ready={!!(kData.desiredLifestyle&&kData.age&&kData.retirementAge)}/>}
    {biz.revenue&&<Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:16}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,margin:0}}>Key Takeaways</h3>
        <button onClick={printSummary} style={{padding:"9px 18px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${C.gold},${C.navyMid})`,color:C.white,fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:"0.03em"}}>🖨 Print / Save as PDF</button>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
        <TakeChip label="Estimated Value" value={fmtM(v.eqLow)+" – "+fmtM(v.eqHigh)}/>
        <TakeChip label="Expected (Quality-Adj.)" value={fmtM(v.eqMid)}/>
        <TakeChip label="After-Tax Net" value={fmtM(atax.net)}/>
        <TakeChip label="Quality Score" value={v.qs+"/100"}/>
        <TakeChip label="Funded Status" value={fundedTxt} good={goalsReady&&wc.gap<=0} warn={goalsReady&&wc.gap>0}/>
      </div>
      <p style={{fontFamily:"'Nunito',sans-serif",fontSize:12.5,color:C.slateLight,margin:"14px 0 0"}}>Biggest value driver to address: <strong style={{color:C.slate}}>{bigDrag}</strong>.{sum?"":" For the full plain-language write-up, generate the advisor summary below."}</p>
    </Card>}
    <Card>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:12}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,margin:0}}>Exit Planning Readiness</h3>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{height:8,width:120,borderRadius:4,background:C.creamDark,overflow:"hidden"}}><div style={{height:"100%",width:`${(totalDone/totalItems)*100}%`,background:C.green,borderRadius:4,transition:"width 0.5s"}}/></div>
          <span style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.slate,fontWeight:700}}>{totalDone}/{totalItems} complete</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:20}}>
        {checks.map((cat,i)=><div key={i}><div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,color:C.gold,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{cat.cat}</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{cat.items.map((item,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,background:item.d?C.green:C.creamDark,display:"flex",alignItems:"center",justifyContent:"center"}}>{item.d&&<span style={{color:C.white,fontSize:10,fontWeight:700}}>✓</span>}</div><span style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:item.d?C.slate:C.slateLight}}>{item.l}</span></div>)}</div></div>)}
      </div>
    </Card>

    {biz.revenue&&<Card style={{background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,border:"none"}}><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:C.goldLight,marginTop:0,marginBottom:20}}>Key Numbers at a Glance</h3>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:14}}>
      <StatBox accent label="Equity Value Range" value={`${fmtM(v.eqLow)} – ${fmtM(v.eqHigh)}`}/>
      <StatBox accent label="Quality Score" value={`${v.qs}/100`} sub="Adjusts multiple position"/>
      <StatBox accent label="Personal Net Worth" value={fmtM(wc.net)} sub="Excl. business"/>
      {kData.desiredLifestyle&&<StatBox accent label="Portfolio Needed" value={fmtM(wc.portfolioNeeded)} sub={`${fmt(wc.netLifestyleNeed)}/yr after SS`}/>}
      {wc.gap!==0&&(wc.gap>0?<StatBox warn label="Gap to Close" value={fmtM(wc.gap)} sub="Grow value, save more, delay"/>:<StatBox ok label="Surplus" value={fmtM(Math.abs(wc.gap))} sub="On track for goal ✓"/>)}
    </div></Card>}

    <Card>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:12}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:C.navy,margin:0}}>AI-Generated Executive Summary</h3>
        <button onClick={generate} disabled={ld} style={{padding:"10px 22px",borderRadius:8,border:"none",background:ld?C.creamDark:`linear-gradient(135deg,${C.gold},${C.navyMid})`,color:C.white,fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,cursor:ld?"wait":"pointer",letterSpacing:"0.04em"}}>{ld?"Generating...":sum?"Regenerate":"Generate Summary"}</button>
      </div>
      {sum?<div style={{fontFamily:"'Nunito',sans-serif",fontSize:14,color:C.slate,lineHeight:1.8,whiteSpace:"pre-line"}}>{sum}</div>:<div style={{padding:"32px 0",textAlign:"center",color:C.slateLight,fontFamily:"'Nunito',sans-serif",fontSize:14}}>Click "Generate Summary" to create a personalized AI-written executive summary using all data entered across all modules.</div>}
    </Card>

    <div style={{padding:"16px 20px",borderRadius:10,background:C.cream,border:`1px solid ${C.border}`,display:"flex",gap:12,alignItems:"center"}}>
      <span style={{fontSize:20}}>🖨</span>
      <p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.slate,margin:0}}><strong>Share with client:</strong> Browser Print (Ctrl/Cmd+P) → Save as PDF. Full plan prints cleanly across pages.</p>
    </div>
  </div></div>);}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const BLANK={kData:{},biz:{industry:"other"},cont:{},wealth:{},overrides:{}};

function loadState(){try{const s=localStorage.getItem(STORAGE_KEY);return s?JSON.parse(s):null;}catch{return null;}}
function saveState(s){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s));}catch{}}

export default function App(){
  const saved=loadState();
  const [active,setActive]=useState(0);
  const [kData,setKData]=useState(saved?.kData||{});
  const [biz,setBiz]=useState(saved?.biz||{industry:"other"});
  const [cont,setCont]=useState(saved?.cont||{});
  const [wealth,setWealth]=useState(saved?.wealth||{});
  const [overrides,setOverrides]=useState(saved?.overrides||{});
  const [saveMsg,setSaveMsg]=useState("");

  // Auto-save on every change
  useEffect(()=>{
    saveState({kData,biz,cont,wealth,overrides});
    setSaveMsg("Saved");
    const t=setTimeout(()=>setSaveMsg(""),2000);
    return()=>clearTimeout(t);
  },[kData,biz,cont,wealth,overrides]);

  const clearAll=()=>{if(window.confirm("Clear all data and start a new client session?")){ setKData({});setBiz({industry:"other"});setCont({});setWealth({});setOverrides({});localStorage.removeItem(STORAGE_KEY);setActive(0);}};

  const mods=[{label:"Goals & Targets"},{label:"Value Assessment"},{label:"Exit Strategy"},{label:"Contingency"},{label:"Summary"}];

  return(<>
    <style>{fonts}</style>
    <div style={{minHeight:"100vh",background:C.cream}}>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,padding:"18px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`3px solid ${C.gold}`,flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <Logomark size={46} color={C.white} fan={C.goldLight}/>
          <div>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:22,fontWeight:800,color:C.white,letterSpacing:"0.22em"}}>DECIDEDLY</div>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:9,fontWeight:600,color:C.goldLight,letterSpacing:"0.34em",textTransform:"uppercase",marginTop:2}}>Wealth Management</div>
          </div>
          <div style={{width:1,height:34,background:"rgba(255,255,255,0.18)",margin:"0 4px"}}/>
          <div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,color:"rgba(255,255,255,0.55)",letterSpacing:"0.14em",textTransform:"uppercase",maxWidth:140,lineHeight:1.4}}>Business Exit Planning Platform</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          {saveMsg&&<span style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:C.goldLight}}>✓ {saveMsg}</span>}
          <button onClick={clearAll} style={{padding:"6px 14px",borderRadius:7,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",fontFamily:"'Nunito',sans-serif",fontSize:12,color:"rgba(255,255,255,0.5)",cursor:"pointer"}}>New Client</button>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,color:"rgba(255,255,255,0.35)"}}>CLIENT</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:C.white}}>{biz.bizName||"New Session"}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.creamDark}`,padding:"0 32px",display:"flex",overflowX:"auto"}}>
        {mods.map((m,i)=><button key={i} onClick={()=>setActive(i)} style={{padding:"16px 22px",border:"none",background:"transparent",cursor:"pointer",borderBottom:active===i?`3px solid ${C.gold}`:"3px solid transparent",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:active===i?700:400,color:active===i?C.navy:C.slateLight,whiteSpace:"nowrap",transition:"all 0.15s"}}><span style={{color:C.gold,marginRight:6}}>{i+1}.</span>{m.label}</button>)}
      </div>

      {/* Content */}
      <div style={{maxWidth:1000,margin:"0 auto",padding:"40px 24px"}}>
        {active===0&&<ModuleProfile data={kData} set={setKData}/>}
        {active===1&&<ModuleBusiness biz={biz} setBiz={setBiz} wealth={wealth} setWealth={setWealth} overrides={overrides} setOverrides={setOverrides} kData={kData}/>}
        {active===2&&<ModuleExit biz={biz} kData={kData} wealth={wealth} overrides={overrides}/>}
        {active===3&&<ModuleContingency data={cont} set={setCont} biz={biz}/>}
        {active===4&&<ModuleSummary kData={kData} biz={biz} cont={cont} wealth={wealth} overrides={overrides}/>}

        <div style={{display:"flex",justifyContent:"space-between",marginTop:40,paddingTop:24,borderTop:`1px solid ${C.creamDark}`}}>
          <button onClick={()=>setActive(m=>Math.max(0,m-1))} disabled={active===0} style={{padding:"12px 28px",borderRadius:8,border:`1px solid ${C.creamDark}`,background:"transparent",fontFamily:"'Nunito',sans-serif",fontSize:14,color:active===0?C.creamDark:C.slate,cursor:active===0?"default":"pointer"}}>← Previous</button>
          <button onClick={()=>setActive(m=>Math.min(4,m+1))} disabled={active===4} style={{padding:"12px 28px",borderRadius:8,border:"none",background:active===4?C.creamDark:`linear-gradient(135deg,${C.navy},${C.navyMid})`,fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:700,color:active===4?C.slateLight:C.white,cursor:active===4?"default":"pointer"}}>Next Section →</button>
        </div>

        <div style={{marginTop:28,padding:"14px 18px",borderRadius:10,background:C.cream,border:`1px solid ${C.creamDark}`}}>
          <p style={{fontFamily:"'Nunito',sans-serif",fontSize:11,color:C.slateLight,margin:0,lineHeight:1.6,textAlign:"center"}}>Prototype for planning discussion. All figures are estimates from published benchmarks — not a formal business appraisal, tax advice, or an offer. Data is saved only in this browser on this device (it does not sync or back up). Use sample data until reviewed by Decidedly's compliance team.</p>
        </div>
      </div>
    </div>
  </>);}
