'use client';
import { useState, useMemo } from 'react';

const PC = { openai:'#74aa9c', anthropic:'#d4915a', google:'#4285f4', meta:'#0082fb', xai:'#e7e7e7', deepseek:'#4d7fff', mistral:'#ff7000' };
const BM = { 'swe-bench':'SWE-bench','humaneval':'HumanEval','mmlu':'MMLU','gpqa-diamond':'GPQA Diamond','math':'MATH','gsm8k':'GSM8K','mmlu-pro':'MMLU-Pro' };
const BD = { 'swe-bench':'Real GitHub issues resolved','humaneval':'Python code generation','mmlu':'Multitask knowledge','gpqa-diamond':'PhD-level science','math':'Competition math','gsm8k':'Grade school math','mmlu-pro':'Harder MMLU' };

function Bar({ score, max=100, color }) {
  return <div className="score-bar" style={{width:72}}><div className="score-bar-fill" style={{width:`${Math.min(100,score/max*100)}%`,background:color}} /></div>;
}
function Rank({ n }) {
  const s = n===1?{background:'rgba(184,249,74,0.15)',color:'#b8f94a',border:'1px solid rgba(184,249,74,0.3)'}:n===2?{background:'rgba(74,255,200,0.1)',color:'#4affc8',border:'1px solid rgba(74,255,200,0.2)'}:n===3?{background:'rgba(255,160,80,0.1)',color:'#ffa050',border:'1px solid rgba(255,160,80,0.2)'}:{background:'transparent',color:'#7d8590',border:'1px solid #21262d'};
  return <div className="rank" style={s}>{n}</div>;
}

export default function LeaderboardClient({ models, benchmarks, initialLeaderboard }) {
  const [tab, setTab] = useState('leaderboard');
  const [bench, setBench] = useState('swe-bench');
  const [data, setData] = useState(initialLeaderboard||[]);
  const [pf, setPf] = useState('all');
  const [sc, setSc] = useState('score');
  const [sd, setSd] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  const providers = useMemo(()=>['all',...Array.from(new Set(models.map(m=>m.provider))).sort()],[models]);
  const em = useMemo(()=>models.map(m=>({...m,ip:m.pricing?.input_per_1m??null,op:m.pricing?.output_per_1m??null})),[models]);
  const pc = s=>PC[(s||'').toLowerCase()]||'#7d8590';
  const bmList = benchmarks.filter(b=>BM[b.slug]);

  async function load(slug) {
    setBench(slug); setLoading(true);
    try { const r=await fetch('https://ai-model-api-production-aa9d.up.railway.app/leaderboard/'+slug); setData(await r.json()); } catch { setData([]); }
    setLoading(false);
  }
  function sort(col) { if(sc===col) setSd(d=>d==='asc'?'desc':'asc'); else{setSc(col);setSd('desc');} }

  const rows = useMemo(()=>{
    let d=[...data];
    if(pf!=='all') d=d.filter(e=>{ const m=em.find(m=>m.slug===e.model_slug); return m?.provider===pf; });
    if(q) d=d.filter(e=>e.model_name.toLowerCase().includes(q.toLowerCase()));
    d.sort((a,b)=>{ let av=a[sc],bv=b[sc]; if(typeof av==='string'){av=av.toLowerCase();bv=bv.toLowerCase();} return sd==='asc'?(av>bv?1:-1):(av<bv?1:-1); });
    return d;
  },[data,pf,q,sc,sd,em]);

  const val = useMemo(()=>data.map(e=>{ const m=em.find(m=>m.slug===e.model_slug); const p=m?.ip; return {...e,provider:m?.provider||e.provider,ip:p,vs:p&&p>0?(e.score/p).toFixed(1):null}; }).filter(e=>e.vs).sort((a,b)=>b.vs-a.vs),[data,em]);

  const SI = ({col})=>sc===col?<span style={{color:'#b8f94a',marginLeft:4}}>{sd==='asc'?'↑':'↓'}</span>:<span style={{color:'#3d444d',marginLeft:4}}>↕</span>;

  const Picker = ()=>(
    <div style={{marginBottom:20}}>
      <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--muted)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}}>Select benchmark</div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        {bmList.map(b=><button key={b.slug} className={'chip'+(bench===b.slug?' active':'')} style={bench===b.slug?{color:'var(--accent)',borderColor:'var(--accent)'}:{}} onClick={()=>load(b.slug)}>{BM[b.slug]||b.name}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <header style={{position:'relative',borderBottom:'1px solid var(--border)',overflow:'hidden',background:'var(--bg2)'}}>
        <div className="scanline"/>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'32px 24px 28px'}}>
          <div className="fade-up" style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:'#b8f94a',boxShadow:'0 0 8px #b8f94a',animation:'pulse-accent 2s infinite'}}/>
                <span className="font-mono" style={{fontSize:10,letterSpacing:'0.15em',color:'var(--accent)',textTransform:'uppercase'}}>Live · Updated nightly</span>
              </div>
              <h1 className="font-mono" style={{fontSize:'clamp(22px,4vw,36px)',fontWeight:700,letterSpacing:'-0.02em',lineHeight:1.1}}>
                AI Model<br/><span style={{color:'var(--accent)'}}>Intelligence</span>
              </h1>
              <p style={{marginTop:10,color:'var(--muted)',fontSize:13,maxWidth:460}}>Benchmarks, pricing, and performance for every major LLM — {models.length} models across {benchmarks.length} benchmarks.</p>
            </div>
            <div className="fade-up-2" style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
              {[{l:'Models',v:models.length},{l:'Benchmarks',v:benchmarks.length},{l:'Providers',v:providers.length-1}].map(({l,v})=>(
                <div key={l} style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{color:'var(--muted)',fontSize:11,fontFamily:'var(--font-mono)'}}>{l}</span>
                  <span className="font-mono" style={{fontSize:20,fontWeight:700,color:'var(--accent)'}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="fade-up-3" style={{display:'flex',gap:6,marginTop:24,flexWrap:'wrap'}}>
            {[['leaderboard','// Leaderboard'],['value','// Value Index'],['pricing','// Pricing']].map(([id,l])=>(
              <button key={id} className={'tab-btn'+(tab===id?' active':'')} onClick={()=>setTab(id)}>{l}</button>
            ))}
          </div>
        </div>
      </header>

      <main style={{maxWidth:1200,margin:'0 auto',padding:24}}>

        {tab==='leaderboard'&&<div className="fade-up">
          <Picker/>
          <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search models..." style={{background:'var(--bg3)',border:'1px solid var(--border)',color:'var(--text)',borderRadius:6,padding:'7px 12px',fontSize:13,outline:'none',width:200}}/>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {providers.map(p=><button key={p} className={'chip'+(pf===p?' active':'')} style={pf===p&&p!=='all'?{color:pc(p),borderColor:pc(p)}:{}} onClick={()=>setPf(p)}>{p==='all'?'All':p}</button>)}
            </div>
          </div>
          <div style={{marginBottom:16,padding:'10px 16px',background:'var(--bg3)',borderRadius:8,border:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <span className="font-mono" style={{fontSize:11,color:'var(--accent)'}}>{BM[bench]||bench}</span>
            <span style={{color:'var(--muted)',fontSize:12}}>{BD[bench]}</span>
            <span style={{marginLeft:'auto',fontSize:11,color:'var(--muted)',fontFamily:'var(--font-mono)'}}>{rows.length} models</span>
          </div>
          <div style={{background:'var(--bg2)',borderRadius:10,border:'1px solid var(--border)',overflow:'auto'}}>
            {loading?<div style={{padding:60,textAlign:'center',color:'var(--muted)',fontFamily:'var(--font-mono)',fontSize:12}}>Loading...</div>:rows.length===0?<div style={{padding:60,textAlign:'center',color:'var(--muted)',fontFamily:'var(--font-mono)',fontSize:12}}>No data yet</div>:(
              <table className="data-table">
                <thead><tr>
                  <th style={{width:50}}>#</th>
                  <th onClick={()=>sort('model_name')}>Model<SI col="model_name"/></th>
                  <th onClick={()=>sort('provider')}>Provider<SI col="provider"/></th>
                  <th onClick={()=>sort('score')} className={sc==='score'?'sorted':''}>Score<SI col="score"/></th>
                  <th>Visual</th>
                </tr></thead>
                <tbody>{rows.map((e,i)=>{
                  const m=em.find(m=>m.slug===e.model_slug);
                  const c=pc(m?.provider_slug||e.provider?.toLowerCase());
                  const top=rows[0]?.score||100;
                  return <tr key={e.model_id||i}>
                    <td><Rank n={e.rank||i+1}/></td>
                    <td><div style={{fontWeight:600,fontSize:13}}>{e.model_name}</div>{m?.api_identifier&&<div className="font-mono" style={{fontSize:10,color:'var(--muted)',marginTop:2}}>{m.api_identifier}</div>}</td>
                    <td><div style={{display:'flex',alignItems:'center',gap:8}}><span className="dot" style={{background:c}}/><span style={{color:'var(--muted)',fontSize:12}}>{e.provider}</span></div></td>
                    <td><span className="font-mono" style={{fontSize:15,fontWeight:700,color:(e.rank||i+1)===1?'var(--accent)':'var(--text)'}}>{e.score}</span><span style={{color:'var(--muted)',fontSize:11,marginLeft:3}}>/ 100</span></td>
                    <td><Bar score={e.score} max={top} color={c}/></td>
                  </tr>;
                })}</tbody>
              </table>
            )}
          </div>
        </div>}

        {tab==='value'&&<div className="fade-up">
          <Picker/>
          <div style={{marginBottom:16,padding:'10px 16px',background:'rgba(184,249,74,0.05)',borderRadius:8,border:'1px solid rgba(184,249,74,0.15)'}}>
            <span className="font-mono" style={{fontSize:11,color:'var(--accent)'}}>Value Index = benchmark score ÷ price per 1M input tokens</span>
            <span style={{color:'var(--muted)',fontSize:12,marginLeft:12}}>Higher is better. Open-source excluded.</span>
          </div>
          <div style={{background:'var(--bg2)',borderRadius:10,border:'1px solid var(--border)',overflow:'auto'}}>
            {val.length===0?<div style={{padding:60,textAlign:'center',color:'var(--muted)',fontFamily:'var(--font-mono)',fontSize:12}}>No pricing data for this benchmark</div>:(
              <table className="data-table">
                <thead><tr><th style={{width:50}}>#</th><th>Model</th><th>Provider</th><th>Score</th><th>$/1M in</th><th style={{color:'var(--accent)'}}>Value ↓</th></tr></thead>
                <tbody>{val.map((e,i)=>{
                  const c=pc(e.provider?.toLowerCase());
                  const top=parseFloat(val[0]?.vs)||1;
                  return <tr key={e.model_id||i}>
                    <td><Rank n={i+1}/></td>
                    <td><div style={{fontWeight:600,fontSize:13}}>{e.model_name}</div></td>
                    <td><div style={{display:'flex',alignItems:'center',gap:8}}><span className="dot" style={{background:c}}/><span style={{color:'var(--muted)',fontSize:12}}>{e.provider}</span></div></td>
                    <td><span className="font-mono" style={{fontWeight:700}}>{e.score}</span></td>
                    <td><span className="font-mono" style={{color:'var(--muted)',fontSize:12}}>${e.ip?.toFixed(2)}</span></td>
                    <td><div style={{display:'flex',alignItems:'center',gap:10}}><span className="font-mono" style={{fontSize:15,fontWeight:700,color:i===0?'var(--accent)':'var(--text)'}}>{e.vs}</span><Bar score={parseFloat(e.vs)} max={top} color={c}/></div></td>
                  </tr>;
                })}</tbody>
              </table>
            )}
          </div>
        </div>}

        {tab==='pricing'&&<div className="fade-up">
          <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
            {providers.map(p=><button key={p} className={'chip'+(pf===p?' active':'')} style={pf===p&&p!=='all'?{color:pc(p),borderColor:pc(p)}:{}} onClick={()=>setPf(p)}>{p==='all'?'All':p}</button>)}
          </div>
          <div style={{background:'var(--bg2)',borderRadius:10,border:'1px solid var(--border)',overflow:'auto'}}>
            <table className="data-table">
              <thead><tr><th>Model</th><th>Provider</th><th>Context</th><th>Input/1M</th><th>Output/1M</th><th>Multimodal</th><th>Open</th></tr></thead>
              <tbody>{em.filter(m=>pf==='all'||m.provider===pf).filter(m=>m.status==='active').sort((a,b)=>(a.ip??9999)-(b.ip??9999)).map(m=>{
                const c=pc(m.provider_slug);
                return <tr key={m.id}>
                  <td><div style={{fontWeight:600,fontSize:13}}>{m.name}</div><div className="font-mono" style={{fontSize:10,color:'var(--muted)',marginTop:2}}>{m.api_identifier}</div></td>
                  <td><div style={{display:'flex',alignItems:'center',gap:8}}><span className="dot" style={{background:c}}/><span style={{color:'var(--muted)',fontSize:12}}>{m.provider}</span></div></td>
                  <td><span className="font-mono" style={{fontSize:12,color:'var(--muted)'}}>{m.context_window>=1000000?`${(m.context_window/1000000).toFixed(0)}M`:`${(m.context_window/1000).toFixed(0)}K`}</span></td>
                  <td>{m.ip!=null?<span className="font-mono" style={{fontSize:13,fontWeight:700,color:m.ip<0.5?'var(--accent)':m.ip<2?'var(--text)':'var(--muted)'}}>${m.ip.toFixed(2)}</span>:<span style={{color:'var(--accent)',fontSize:12}}>Free</span>}</td>
                  <td>{m.op!=null?<span className="font-mono" style={{fontSize:13,color:'var(--muted)'}}>${m.op.toFixed(2)}</span>:<span style={{color:'var(--muted)',fontSize:12}}>—</span>}</td>
                  <td><span style={{fontSize:12,color:m.is_multimodal?'var(--accent2)':'var(--muted)'}}>{m.is_multimodal?'✓':'—'}</span></td>
                  <td><span style={{fontSize:12,color:m.is_open_source?'var(--accent)':'var(--muted)'}}>{m.is_open_source?'Open':'—'}</span></td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        </div>}

        <footer style={{marginTop:48,paddingTop:24,borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
          <span className="font-mono" style={{fontSize:11,color:'var(--muted)'}}>
            AI Model Intelligence · Updated nightly · <a href="https://rapidapi.com/solemly/api/ai-model-intelligence" target="_blank" rel="noopener noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>API on RapidAPI</a>
          </span>
          <a href="https://docs.google.com/forms/d/1WE89K7a4TeGg2XL4IAvnKJGQm6w_Oxu3ecf0gaFhmhA/viewform" target="_blank" rel="noopener noreferrer" style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--accent)',textDecoration:'none',border:'1px solid rgba(184,249,74,0.3)',padding:'6px 12px',borderRadius:6}}>
            🔔 Get model change alerts →
          </a>
        </footer>
      </main>
    </div>
  );
}
