import {useState} from 'react'; import {supabase} from './lib/supabase'; import * as R from './lib/rules';
const A3:R.Apt[]=['atletismo','conhecimento','intriga'];
export default function Wizard({camp,me,done}:any){
 const rules=camp.rules||{},[s,setS]=useState(0),[err,setErr]=useState('');
 const [f,setF]=useState({name:'',age:11,year:1,desc:'',pers:'',look:''});
 const [ap,setAp]=useState<Record<string,number>>({atletismo:0,conhecimento:0,intriga:0});
 const [sk,setSk]=useState<Record<string,number>>({}),[ans,setAns]=useState<number[]>(Array(10).fill(-1));
 const [un,setUn]=useState<string[]>([]),[afin,setAfin]=useState('encantos');
 const [wand,setWand]=useState<any>({wood:R.WOODS[0],len:11,flex:'maleável',core:R.CORES[0],favored:'encantos',disfavored:'pocoes'});
 const [fam,setFam]=useState({kind:'coruja',name:'',desc:''}),[broom,setBroom]=useState('Shooting Star');
 const A:Record<string,number>={...ap,magia:f.year};
 const pos=A3.reduce((t,a)=>t+Math.max(ap[a],0),0),avail=5+(A3.some(a=>ap[a]===-1)?1:0);
 const grp=(a:string)=>R.SKILLS.filter(x=>x.a===a).reduce((t,x)=>t+(sk[x.k]||0),0);
 const pool3=A3.reduce((t,a)=>t+Math.max(ap[a],0),0)-(un.length>1?2:0);
 const used3=A3.reduce((t,a)=>t+grp(a),0);
 const hat=ans.every(a=>a>=0)?R.sortHat(ans,!!rules.sonserina):'';
 const bonus=(k:string)=>un.reduce((t,u)=>t+(R.UNIQUES.find(x=>x.k===u)?.b?.[k]||0),0)+(un.includes('afinidade')&&afin===k?2:0);
 const next=()=>{setErr('');
  if(s===0&&!f.name)return setErr('Dê um nome ao personagem.');
  if(s===1&&(pos>avail||A3.some(a=>ap[a]<-1)))return setErr(`Distribua no máximo ${avail} pontos.`);
  if(s===2){if(used3>pool3)return setErr(`Pontos de perícia (Atletismo/Conhecimento/Intriga): máx ${pool3}.`);
   if(grp('magia')>A.magia)return setErr(`Perícias mágicas: máx ${A.magia}.`);
   const bad=R.SKILLS.find(x=>(sk[x.k]||0)>Math.max(A[x.a],0)||((sk[x.k]||0)>0&&!R.meetsReq(x.k,A.magia,sk)));if(bad)return setErr(`${bad.l}: acima do limite da Aptidão ou sem pré-requisito.`);}
  if(s===3&&!hat)return setErr('Responda as 10 perguntas do Chapéu Seletor.');
  setS(s+1)};
 const save=async()=>{
  const skills:Record<string,number>={};R.SKILLS.forEach(x=>{skills[x.k]=(sk[x.k]||0)+bonus(x.k)});
  const {error}=await supabase.from('characters').insert({campaign_id:camp.id,owner_id:me.user_id,name:f.name,player_name:me.name,age:f.age,year:f.year,house:hat,
   bio:[f.desc,f.pers&&'Personalidade: '+f.pers,f.look&&'Aparência: '+f.look].filter(Boolean).join('\n'),aptitudes:A,skills,uniques:un,wand,familiar:fam,broom,galleons:10});
  error?setErr(error.message):done()};
 const num=(v:number,set:(n:number)=>void,min:number,max:number)=><div className="flex items-center gap-2"><button className="btn" onClick={()=>set(Math.max(min,v-1))}>−</button><b className="w-6 text-center">{v}</b><button className="btn" onClick={()=>set(Math.min(max,v+1))}>+</button></div>;
 const toggle=(k:string)=>setUn(u=>u.includes(k)?u.filter(x=>x!==k):u.length<2?[...u,k]:u);
 const steps=['Informações','Aptidões','Perícias','Chapéu Seletor','Situações · Varinha · Familiar · Vassoura'];
 return <div className="card space-y-3"><h3>Criar personagem — etapa {s+1}/5: {steps[s]}</h3>
 {s===0&&<div className="grid gap-2 md:grid-cols-2"><input className="inp" placeholder="Nome" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
  <label className="text-sm">Idade <input className="inp" type="number" value={f.age} onChange={e=>setF({...f,age:+e.target.value})}/></label>
  <label className="text-sm">Ano escolar (Magia = ano; 1º ano = 1) <input className="inp" type="number" min={1} max={7} value={f.year} onChange={e=>setF({...f,year:Math.min(7,Math.max(1,+e.target.value))})}/></label>
  <textarea className="inp md:col-span-2" placeholder="Descrição" value={f.desc} onChange={e=>setF({...f,desc:e.target.value})}/><input className="inp" placeholder="Personalidade" value={f.pers} onChange={e=>setF({...f,pers:e.target.value})}/><input className="inp" placeholder="Aparência" value={f.look} onChange={e=>setF({...f,look:e.target.value})}/></div>}
 {s===1&&<div className="space-y-2"><p className="text-sm opacity-80">Aptidões começam em 0. Distribua {avail} pontos entre Atletismo, Conhecimento e Intriga (um ponto extra se escolher uma Aptidão com −1). Usados: {pos}/{avail}. Magia é fixa: {A.magia} (anos de escola).</p>
  {A3.map(a=><div key={a} className="flex items-center justify-between"><span>{R.APT[a]}</span>{num(ap[a],n=>setAp({...ap,[a]:n}),-1,5)}</div>)}<div className="flex justify-between"><span>Magia (fixa)</span><b>{A.magia}</b></div></div>}
 {s===2&&<div className="space-y-3"><p className="text-sm opacity-80">Aptidão → Perícias → Valor. Pontos por Aptidão = valor dela; nenhuma perícia passa do valor da Aptidão{un.length>1?' (2 pontos sacrificados pela 2ª Situação Única — escolha-a antes, na última etapa)':''}. Atletismo/Conhecimento/Intriga: {used3}/{pool3} · Magia: {grp('magia')}/{A.magia}</p>
  {(Object.keys(R.APT) as R.Apt[]).map(a=><div key={a}><b className="text-gold">{R.APT[a]} ({A[a]})</b>{R.SKILLS.filter(x=>x.a===a).map(x=><div key={x.k} className="flex items-center justify-between py-0.5 text-sm"><span>{x.l}{!R.meetsReq(x.k,A.magia,sk)&&' 🔒'}</span>{num(sk[x.k]||0,n=>setSk({...sk,[x.k]:n}),0,Math.max(A[a],0))}</div>)}</div>)}</div>}
 {s===3&&<div className="space-y-2"><p className="text-sm opacity-80">🎩 Responda como seu personagem. O Mestre pode alterar a Casa depois.</p>
  {R.HAT.map((h,i)=><div key={i}><p className="text-sm">{i+1}. {h.q}</p><div className="flex flex-wrap gap-1">{h.o.map((o,j)=><button key={j} className={`btn ${ans[i]===j?'ring-2 ring-gold':'opacity-70'}`} onClick={()=>setAns(ans.map((x,n)=>n===i?j:x))}>{o}</button>)}</div></div>)}
  {hat&&<p className="text-lg text-gold">O Chapéu diz: {R.HOUSES[hat].n}!</p>}</div>}
 {s===4&&<div className="space-y-3"><div><b className="text-gold">Situações Únicas (até 2; a 2ª custa 2 pontos de perícia)</b><div className="grid gap-1 md:grid-cols-2">{R.UNIQUES.filter(u=>!(rules.disabled||[]).includes(u.k)).map(u=><button key={u.k} onClick={()=>toggle(u.k)} className={`rounded border p-2 text-left text-xs ${un.includes(u.k)?'border-gold bg-wine/60':'border-gold/20'}`}><b>{u.l}</b><br/>{u.d}</button>)}</div>
   {un.includes('afinidade')&&<select className="inp mt-1" value={afin} onChange={e=>setAfin(e.target.value)}>{R.SKILLS.filter(x=>x.a==='magia').map(x=><option key={x.k} value={x.k}>{x.l}</option>)}</select>}</div>
  <div className="grid gap-2 md:grid-cols-3"><b className="text-gold md:col-span-3">Varinha (+1 magia favorecida / −1 prejudicada)</b>
   <select className="inp" value={wand.wood} onChange={e=>setWand({...wand,wood:e.target.value})}>{R.WOODS.map(w=><option key={w}>{w}</option>)}</select>
   <input className="inp" type="number" min={8} max={16} value={wand.len} onChange={e=>setWand({...wand,len:+e.target.value})}/>
   <select className="inp" value={wand.flex} onChange={e=>setWand({...wand,flex:e.target.value})}>{R.FLEX.map(w=><option key={w}>{w}</option>)}</select>
   <select className="inp" value={wand.core} onChange={e=>setWand({...wand,core:e.target.value})}>{R.CORES.map(w=><option key={w}>{w}</option>)}</select>
   <select className="inp" value={wand.favored} onChange={e=>setWand({...wand,favored:e.target.value})}>{R.SKILLS.filter(x=>x.a==='magia').map(x=><option key={x.k} value={x.k}>+1 {x.l}</option>)}</select>
   <select className="inp" value={wand.disfavored} onChange={e=>setWand({...wand,disfavored:e.target.value})}>{R.SKILLS.filter(x=>x.a==='magia').map(x=><option key={x.k} value={x.k}>−1 {x.l}</option>)}</select></div>
  <div className="grid gap-2 md:grid-cols-3"><b className="text-gold md:col-span-3">Familiar e vassoura</b>
   <select className="inp" value={fam.kind} onChange={e=>setFam({...fam,kind:e.target.value})}>{R.FAMILIARS.map(w=><option key={w}>{w}</option>)}</select>
   <input className="inp" placeholder="Nome do familiar" value={fam.name} onChange={e=>setFam({...fam,name:e.target.value})}/>
   <select className="inp" value={broom} onChange={e=>setBroom(e.target.value)}>{R.BROOMS.map(b=><option key={b.n} value={b.n}>{b.n} (Voar {R.sign(b.m)})</option>)}</select></div></div>}
 {err&&<p className="text-sm text-red-400">{err}</p>}
 <div className="flex justify-between"><button className="btn" disabled={s===0} onClick={()=>setS(s-1)}>Voltar</button>{s<4?<button className="btn" onClick={next}>Próximo</button>:<button className="btn" onClick={save}>✨ Criar personagem</button>}</div></div>;}
