import{s as p,j as s}from"./index-DEeLvXnu.js";import{r as c}from"./react-vendor-Bv85i7Ov.js";import"./supabase-rmNQJafb.js";import"./router-BdISkiBh.js";import"./i18n-B68-4bJn.js";import"./icons-C7HOAQsH.js";const T=()=>{const[l,x]=c.useState(""),[$,m]=c.useState(!0);c.useEffect(()=>{w()},[]);const w=async()=>{try{const a=window.location.origin,n=new Date().toISOString().split("T")[0],{data:f}=await p.from("listings").select("slug, slug_lt, slug_en, slug_pl, slug_de, slug_ru, category, updated_at").eq("status","active"),{data:h}=await p.from("articles").select("slug, slug_lt, slug_en, slug_pl, slug_de, slug_ru, updated_at").eq("status","published"),{data:y}=await p.from("events").select("id, updated_at").eq("status","active"),q=[{url:"/",priority:"1.0",changefreq:"daily"},{url:"/see",priority:"0.9",changefreq:"daily"},{url:"/eat",priority:"0.9",changefreq:"daily"},{url:"/stay",priority:"0.9",changefreq:"daily"},{url:"/bar",priority:"0.9",changefreq:"daily"},{url:"/shop",priority:"0.9",changefreq:"daily"},{url:"/events",priority:"0.9",changefreq:"daily"},{url:"/plan",priority:"0.8",changefreq:"weekly"}],i=["lt","en","de","ru","pl"],S={attraction:"/see/",restaurant:"/eat/",hotel:"/stay/",bar:"/bar/",shop:"/shop/"};let t=`<?xml version="1.0" encoding="UTF-8"?>
`;t+=`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
`,q.forEach(e=>{t+=`  <url>
`,t+=`    <loc>${a}${e.url}</loc>
`,t+=`    <lastmod>${n}</lastmod>
`,t+=`    <changefreq>${e.changefreq}</changefreq>
`,t+=`    <priority>${e.priority}</priority>
`,i.forEach(r=>{t+=`    <xhtml:link rel="alternate" hreflang="${r}" href="${a}${e.url}?lang=${r}" />
`}),t+=`  </url>
`}),f&&f.forEach(e=>{const r=S[e.category]||"/",g=e.updated_at?new Date(e.updated_at).toISOString().split("T")[0]:n,d={lt:e.slug_lt||e.slug,en:e.slug_en||e.slug,pl:e.slug_pl||e.slug,de:e.slug_de||e.slug,ru:e.slug_ru||e.slug},u=e.slug_en||e.slug_lt||e.slug;t+=`  <url>
`,t+=`    <loc>${a}${r}${u}</loc>
`,t+=`    <lastmod>${g}</lastmod>
`,t+=`    <changefreq>weekly</changefreq>
`,t+=`    <priority>0.8</priority>
`,i.forEach(o=>{const _=d[o];_&&(t+=`    <xhtml:link rel="alternate" hreflang="${o}" href="${a}${r}${_}" />
`)}),t+=`  </url>
`}),h&&h.forEach(e=>{const r=e.updated_at?new Date(e.updated_at).toISOString().split("T")[0]:n,g={lt:e.slug_lt||e.slug,en:e.slug_en||e.slug,pl:e.slug_pl||e.slug,de:e.slug_de||e.slug,ru:e.slug_ru||e.slug},d=e.slug_en||e.slug_lt||e.slug;t+=`  <url>
`,t+=`    <loc>${a}/articles/${d}</loc>
`,t+=`    <lastmod>${r}</lastmod>
`,t+=`    <changefreq>monthly</changefreq>
`,t+=`    <priority>0.7</priority>
`,i.forEach(u=>{const o=g[u];o&&(t+=`    <xhtml:link rel="alternate" hreflang="${u}" href="${a}/articles/${o}" />
`)}),t+=`  </url>
`}),y&&y.forEach(e=>{const r=e.updated_at?new Date(e.updated_at).toISOString().split("T")[0]:n;t+=`  <url>
`,t+=`    <loc>${a}/events/${e.id}</loc>
`,t+=`    <lastmod>${r}</lastmod>
`,t+=`    <changefreq>weekly</changefreq>
`,t+=`    <priority>0.7</priority>
`,t+=`  </url>
`}),t+="</urlset>",x(t),m(!1),document.querySelector('meta[name="Content-Type"]')?.setAttribute("content","application/xml")}catch(a){console.error("Error generating sitemap:",a),m(!1)}};return c.useEffect(()=>{if(l){const a=new Blob([l],{type:"application/xml"});URL.createObjectURL(a),window.location.href=`data:application/xml;charset=utf-8,${encodeURIComponent(l)}`}},[l]),$?s.jsx("div",{className:"min-h-screen flex items-center justify-center bg-gray-50",children:s.jsxs("div",{className:"text-center",children:[s.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto mb-4"}),s.jsx("p",{className:"text-gray-600",children:"Generuojamas sitemap..."})]})}):s.jsx("div",{className:"min-h-screen bg-white",children:s.jsx("pre",{className:"p-4 text-xs overflow-auto",children:l})})};export{T as default};
