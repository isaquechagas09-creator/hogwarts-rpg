import {useEffect,useState} from 'react'; import {supabase} from './lib/supabase'; import Room from './Room';
function Auth(){
 const [mode,setMode]=useState('in'),[email,setEmail]=useState(''),[pw,setPw]=useState(''),[nick,setNick]=useState(''),[err,setErr]=useState(''),[info,setInfo]=useState('');
 const go=async()=>{setErr('');setInfo('');
  const r=mode==='in'?await supabase.auth.signInWithPassword({email,password:pw}):await supabase.auth.signUp({email,password:pw,options:{data:{username:nick}}});
  if(r.error)setErr(r.error.message); else if(mode==='up'&&!r.data.session)setInfo('Conta criada! Confirme o e-mail (se exigido) e entre.');};
 return <div className="mx-auto mt-24 max-w-sm card space-y-3"><h2 className="text-center text-2xl">⚡ HOGWARTS RPG</h2><p className="text-center text-xs opacity-70">Broomstix online · 4 jogadores + Mestre</p>
  {mode==='up'&&<input className="inp" placeholder="Nome de usuário" value={nick} onChange={e=>setNick(e.target.value)}/>}
  <input className="inp" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)}/>
  <input className="inp" type="password" placeholder="Senha (mín. 6)" value={pw} onChange={e=>setPw(e.target.value)}/>
  {err&&<p className="text-sm text-red-400">{err}</p>}{info&&<p className="text-sm text-green-400">{info}</p>}
  <button className="btn w-full" onClick={go}>{mode==='in'?'Entrar':'Criar conta'}</button>
  <button className="w-full text-xs underline opacity-70" onClick={()=>setMode(mode==='in'?'up':'in')}>{mode==='in'?'Não tenho conta':'Já tenho conta'}</button></div>;}
function Lobby({user,open}:any){
 const [mine,setMine]=useState<any[]>([]),[name,setName]=useState(''),[mn,setMn]=useState(user.user_metadata?.username||''),[code,setCode]=useState(''),[pn,setPn]=useState(user.user_metadata?.username||''),[err,setErr]=useState('');
 useEffect(()=>{supabase.from('members').select('role,campaigns(id,name,code)').eq('user_id',user.id).then(r=>setMine(r.data||[]))},[]);
 const create=async()=>{const r=await supabase.rpc('create_campaign',{p_name:name,p_master:mn});r.error?setErr(r.error.message):open(r.data.id)};
 const join=async()=>{const r=await supabase.rpc('join_campaign',{p_code:code,p_name:pn});r.error?setErr(r.error.message):open(r.data.id)};
 return <div className="mx-auto max-w-3xl space-y-4 p-4"><div className="flex items-center justify-between"><h2 className="text-2xl">⚡ HOGWARTS RPG</h2><button className="btn" onClick={()=>supabase.auth.signOut()}>Sair</button></div>
  {err&&<p className="text-red-400">{err}</p>}
  {mine.length>0&&<div className="card"><h3>Minhas campanhas</h3>{mine.map((m,i)=><button key={i} className="mt-2 block w-full rounded border border-gold/30 p-2 text-left hover:bg-wine/40" onClick={()=>open(m.campaigns.id)}>{m.campaigns.name} <span className="text-xs opacity-60">({m.role==='master'?'Mestre':'Jogador'} · código {m.campaigns.code})</span></button>)}</div>}
  <div className="grid gap-4 md:grid-cols-2"><div className="card space-y-2"><h3>Criar sala (Mestre)</h3><input className="inp" placeholder="Nome da campanha" value={name} onChange={e=>setName(e.target.value)}/><input className="inp" placeholder="Nome do Mestre" value={mn} onChange={e=>setMn(e.target.value)}/><button className="btn" disabled={!name||!mn} onClick={create}>Criar e gerar código</button></div>
  <div className="card space-y-2"><h3>Entrar na sala (Jogador)</h3><input className="inp uppercase" placeholder="Código da sala" value={code} onChange={e=>setCode(e.target.value)}/><input className="inp" placeholder="Nome do jogador" value={pn} onChange={e=>setPn(e.target.value)}/><button className="btn" disabled={!code||!pn} onClick={join}>Entrar</button></div></div></div>;}
export default function App(){
 const [user,setUser]=useState<any>(null),[ready,setReady]=useState(false),[camp,setCamp]=useState<string|null>(null);
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{setUser(data.session?.user??null);setReady(true)});
  const {data:s}=supabase.auth.onAuthStateChange((_e,ses)=>setUser(ses?.user??null));return()=>s.subscription.unsubscribe()},[]);
 if(!ready)return null; if(!user)return <Auth/>;
 return camp?<Room campId={camp} user={user} leave={()=>setCamp(null)}/>:<Lobby user={user} open={setCamp}/>;}
