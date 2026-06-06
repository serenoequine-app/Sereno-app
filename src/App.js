import React, { useState, useEffect } from 'react';

const SUPA_URL = 'https://lbfgcvwzealcmychwvus.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmdjdnd6ZWFsY215Y2h3dnVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NTMxMDEsImV4cCI6MjA5NjEyOTEwMX0.fihk8cBQchPyHEdCGj_QTms3JWpzJfih_FgZTJDAczk';

const api = async (table, method='GET', body=null, filter='') => {
  const r = await fetch(`${SUPA_URL}/rest/v1/${table}${filter}`, {
    method,
    headers: {'apikey':SUPA_KEY,'Authorization':`Bearer ${SUPA_KEY}`,'Content-Type':'application/json','Prefer':method==='POST'?'return=representation':''},
    body: body ? JSON.stringify(body) : null
  });
  const t = await r.text();
  return t ? JSON.parse(t) : null;
};

const HARAS_INICIALES = ['Windcrest','La Carlota del Monte','Las Hermanas','SIRE','Haras Felicitas','Haras Elevage','Lupe Di Salvo','Pampy Heguy','Windcrest Epica'];

export default function App() {
  const [haras, setHaras] = useState([]);
  const [yeguas, setYeguas] = useState([]);
  const [fichas, setFichas] = useState([]);
  const [view, setView] = useState('home');
  const [selH, setSelH] = useState(null);
  const [selY, setSelY] = useState(null);
  const [form, setForm] = useState(false);
  const [fd, setFd] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargarHaras(); }, []);

  const cargarHaras = async () => {
    setLoading(true);
    let data = await api('haras','GET',null,'?order=nombre');
    if (!data || data.length === 0) {
      for (const n of HARAS_INICIALES) await api('haras','POST',{nombre:n});
      data = await api('haras','GET',null,'?order=nombre');
    }
    setHaras(data||[]);
    setLoading(false);
  };

  const cargarYeguas = async (hid) => {
    const d = await api('yeguas','GET',null,`?haras_id=eq.${hid}&order=nombre`);
    setYeguas(d||[]);
  };

  const cargarFichas = async (yid) => {
    const d = await api('fichas','GET',null,`?yegua_id=eq.${yid}&order=created_at.desc`);
    setFichas(d||[]);
  };

  const G = {
    page: {fontFamily:"'Georgia', serif",maxWidth:500,margin:'0 auto',minHeight:'100vh',background:'#f2ede6'},
    hdr: {background:'#2c3e2d',padding:'16px 20px',display:'flex',alignItems:'center',gap:12},
    logo: {color:'white',fontSize:22,fontWeight:'bold',letterSpacing:2,margin:0},
    sub: {color:'rgba(255,255,255,0.6)',fontSize:11,margin:0,letterSpacing:1},
    body: {padding:16},
    card: {background:'white',borderRadius:16,padding:18,marginBottom:14,boxShadow:'0 2px 8px rgba(0,0,0,0.07)',border:'1px solid #ece8e0'},
    cardClick: {cursor:'pointer',transition:'transform 0.1s'},
    h2: {fontSize:13,fontWeight:'600',color:'#5a4a3a',letterSpacing:1,textTransform:'uppercase',marginBottom:12},
    row: {display:'flex',justifyContent:'space-between',alignItems:'center'},
    btnPrimary: {background:'#2c3e2d',color:'white',border:'none',borderRadius:10,padding:'12px 20px',fontSize:14,cursor:'pointer',width:'100%',marginTop:10,fontFamily:'inherit'},
    btnSm: {background:'#2c3e2d',color:'white',border:'none',borderRadius:8,padding:'7px 14px',fontSize:12,cursor:'pointer',fontFamily:'inherit'},
    btnBack: {background:'transparent',color:'white',border:'1px solid rgba(255,255,255,0.5)',borderRadius:8,padding:'5px 12px',fontSize:12,cursor:'pointer'},
    inp: {width:'100%',border:'1px solid #ddd',borderRadius:10,padding:'11px',fontSize:14,boxSizing:'border-box',marginTop:5,marginBottom:2,fontFamily:'inherit',background:'#faf8f5'},
    lbl: {fontSize:12,color:'#888',fontWeight:'600',letterSpacing:0.5,textTransform:'uppercase'},
    chip: {background:'#e8f0e8',color:'#2c3e2d',borderRadius:20,padding:'3px 12px',fontSize:12,fontWeight:'600'},
    chipGold: {background:'#f5eed6',color:'#8a6a1a',borderRadius:20,padding:'3px 12px',fontSize:12,fontWeight:'600'},
    empty: {textAlign:'center',color:'#bbb',padding:40,fontSize:14},
    fichaCard: {background:'#faf8f5',borderRadius:12,padding:14,marginBottom:10,border:'1px solid #ece8e0'},
    divider: {height:1,background:'#ece8e0',margin:'10px 0'},
  };

  if (view==='home') return (
    <div style={G.page}>
      <div style={G.hdr}>
        <div>
          <p style={G.logo}>🐴 SERENO</p>
          <p style={G.sub}>GESTIÓN REPRODUCTIVA EQUINA</p>
        </div>
      </div>
      <div style={G.body}>
        <div style={G.card}>
          <div style={G.row}>
            <p style={G.h2}>Haras ({haras.length})</p>
            <button style={G.btnSm} onClick={()=>setForm('haras')}>+ Agregar</button>
          </div>
          {form==='haras' && <>
            <div style={G.divider}/>
            <label style={G.lbl}>Nombre del haras</label>
            <input style={G.inp} value={fd.nombre||''} onChange={e=>setFd({nombre:e.target.value})} placeholder="Ej: Haras San Jorge"/>
            <button style={G.btnPrimary} onClick={async()=>{
              if(fd.nombre){await api('haras','POST',{nombre:fd.nombre});setFd({});setForm(false);cargarHaras();}
            }}>Guardar</button>
          </>}
        </div>
        {loading && <div style={G.empty}>Cargando...</div>}
        {haras.map(h=>(
          <div key={h.id} style={{...G.card,...G.cardClick}} onClick={async()=>{setSelH(h);await cargarYeguas(h.id);setView('haras');setForm(false)}}>
            <div style={G.row}>
              <div>
                <div style={{fontWeight:'600',fontSize:16,color:'#2c2c2c'}}>🏡 {h.nombre}</div>
              </div>
              <span style={G.chip}>Ver →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (view==='haras') return (
    <div style={G.page}>
      <div style={G.hdr}>
        <button style={G.btnBack} onClick={()=>{setView('home');setForm(false);cargarHaras()}}>← Volver</button>
        <div style={{marginLeft:8}}>
          <p style={G.logo}>{selH.nombre}</p>
          <p style={G.sub}>{yeguas.length} YEGUA{yeguas.length!==1?'S':''}</p>
        </div>
      </div>
      <div style={G.body}>
        <div style={G.card}>
          <div style={G.row}>
            <p style={G.h2}>Yeguas</p>
            <button style={G.btnSm} onClick={()=>setForm('yegua')}>+ Nueva yegua</button>
          </div>
          {form==='yegua' && <>
            <div style={G.divider}/>
            <label style={G.lbl}>Nombre de la yegua</label>
            <input style={G.inp} value={fd.nombre||''} onChange={e=>setFd(f=>({...f,nombre:e.target.value}))} placeholder="Ej: Tormenta"/>
            <label style={G.lbl}>Padrillo</label>
            <input style={G.inp} value={fd.padrillo||''} onChange={e=>setFd(f=>({...f,padrillo:e.target.value}))} placeholder="Ej: Thunder"/>
            <label style={G.lbl}>Fecha probable de parto</label>
            <input style={G.inp} type="date" value={fd.parto||''} onChange={e=>setFd(f=>({...f,parto:e.target.value}))}/>
            <button style={G.btnPrimary} onClick={async()=>{
              if(fd.nombre){await api('yeguas','POST',{haras_id:selH.id,nombre:fd.nombre,padrillo:fd.padrillo||null,parto:fd.parto||null});setFd({});setForm(false);cargarYeguas(selH.id);}
            }}>Guardar yegua</button>
          </>}
        </div>
        {yeguas.length===0 && <div style={G.empty}>No hay yeguas registradas.</div>}
        {yeguas.map(y=>(
          <div key={y.id} style={{...G.card,...G.cardClick}} onClick={async()=>{setSelY(y);await cargarFichas(y.id);setView('yegua');setForm(false)}}>
            <div style={G.row}>
              <div>
                <div style={{fontWeight:'600',fontSize:15,color:'#2c2c2c'}}>🐴 {y.nombre}</div>
                <div style={{fontSize:12,color:'#999',marginTop:3}}>
                  {y.padrillo&&`x ${y.padrillo}`}{y.parto&&` · Parto: ${y.parto}`}
                </div>
              </div>
              <span style={G.chipGold}>{fichas.length} fichas</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (view==='yegua') return (
    <div style={G.page}>
      <div style={G.hdr}>
        <button style={G.btnBack} onClick={()=>{setView('haras');setForm(false);cargarYeguas(selH.id)}}>← Volver</button>
        <div style={{marginLeft:8}}>
          <p style={G.logo}>{selY.nombre}</p>
          <p style={G.sub}>{selH.nombre} · {fichas.length} FICHAS</p>
        </div>
      </div>
      <div style={G.body}>
        <div style={G.card}>
          {selY.padrillo&&<div style={{fontSize:14,marginBottom:4}}>🐎 <b>Padrillo:</b> {selY.padrillo}</div>}
          {selY.parto&&<div style={{fontSize:14}}>📅 <b>Parto estimado:</b> {selY.parto}</div>}
        </div>
        <div style={G.card}>
          <div style={G.row}>
            <p style={G.h2}>Fichas ginecológicas</p>
            <button style={G.btnSm} onClick={()=>setForm('ficha')}>+ Nueva ficha</button>
          </div>
          {form==='ficha' && <>
            <div style={G.divider}/>
            <label style={G.lbl}>Ovario derecho</label>
            <input style={G.inp} value={fd.od||''} onChange={e=>setFd(f=>({...f,od:e.target.value}))} placeholder="Ej: folículo 38mm"/>
            <label style={G.lbl}>Ovario izquierdo</label>
            <input style={G.inp} value={fd.oi||''} onChange={e=>setFd(f=>({...f,oi:e.target.value}))} placeholder="Ej: inactivo"/>
            <label style={G.lbl}>Útero / CL / Observaciones</label>
            <input style={G.inp} value={fd.obs||''} onChange={e=>setFd(f=>({...f,obs:e.target.value}))} placeholder="Observaciones clínicas"/>
            <button style={G.btnPrimary} onClick={async()=>{
              await api('fichas','POST',{yegua_id:selY.id,od:fd.od||null,oi:fd.oi||null,obs:fd.obs||null});
              setFd({});setForm(false);cargarFichas(selY.id);
            }}>Guardar ficha</button>
          </>}
        </div>
        {fichas.length===0&&<div style={G.empty}>No hay fichas aún.<br/>Tocá "+ Nueva ficha"</div>}
        {fichas.map(f=>(
          <div key={f.id} style={G.fichaCard}>
            <div style={{fontSize:11,color:'#aaa',marginBottom:6,letterSpacing:0.5}}>📋 {f.fecha||f.created_at?.slice(0,10)}</div>
            {f.od&&<div style={{fontSize:13,marginBottom:2}}><b>OD:</b> {f.od}</div>}
            {f.oi&&<div style={{fontSize:13,marginBottom:2}}><b>OI:</b> {f.oi}</div>}
            {f.obs&&<div style={{fontSize:13,color:'#666',marginTop:4}}>{f.obs}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
