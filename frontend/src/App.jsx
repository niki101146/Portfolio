import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { profile, fallback, expertise, services, process, gallery as galleryFallback } from "./data.js";

const Dashboard = lazy(() => import("./Dashboard.jsx"));
const API = import.meta.env.VITE_API_URL || "/api";
// Fallback used until you upload a resume in the dashboard (the file lives in frontend/public).
const FALLBACK_RESUME = { view: "/Shoba Niki J.pdf", download: "/Shoba Niki J.pdf" };
const ResumeCtx = createContext(FALLBACK_RESUME);
const useResume = () => useContext(ResumeCtx);
function resumeLinks(version) {
  if (!version) return FALLBACK_RESUME;
  const url = `${API}/resume/?v=${version}`;
  return { view: url, download: `${url}&download=1` };
}
// Each entry is its own page, reached through the hash (for example #/projects).
const links = [["", "Home"], ["about", "About"], ["projects", "Projects"], ["gallery", "Gallery"], ["education", "Education"], ["contact", "Contact"]];

function useContent() {
  const [data, setData] = useState({ ...fallback, gallery: galleryFallback });
  useEffect(() => {
    fetch(`${API}/portfolio/`).then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setData((p) => ({ photo: d.photo, resume: d.resume, projects: d.projects?.length ? d.projects : p.projects,
        skills: d.skills?.length ? d.skills : p.skills, education: d.education?.length ? d.education : p.education,
        gallery: d.gallery?.length ? d.gallery : p.gallery }))).catch(() => {});
  }, []);
  return data;
}

const Heading = ({ title, sub, top }) => (<div className="head">{top ? <h1 className="h2">{title}</h1> : <h2>{title}</h2>}{sub && <p>{sub}</p>}</div>);

function Nav({ page }) {
  const resume = useResume();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);
  return (
    <header className="nav">
      <a href="#/" className="brand">{profile.name}<span>.</span></a>
      <button className={`burger${open ? " open" : ""}`} aria-label="Toggle menu" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>
        <span /><span /><span />
      </button>
      <nav id="site-nav" className={open ? "open" : ""}>
        {links.map(([id, l]) => <a key={id} href={`#/${id}`} className={page === id ? "active" : ""} aria-current={page === id ? "page" : undefined} onClick={() => setOpen(false)}>{l}</a>)}
        <a className="btn small" href={resume.view} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>Resume</a>
        <a className="btn small" href="#/contact" onClick={() => setOpen(false)}>Hire me</a>
      </nav>
    </header>
  );
}

function Photo({ src }) {
  const [ok, setOk] = useState(true);
  useEffect(() => setOk(true), [src]);
  return (
    <div className="photo">
      {ok ? <img src={src || "/profile.jpg"} alt="Portrait of Shoba Niki J" onError={() => setOk(false)} /> : <span aria-hidden="true">SN</span>}
    </div>
  );
}

function Hero({ d }) {
  const resume = useResume();
  const stats = [[d.projects.length, "Projects built"], [1, "Certification"], [2026, "Graduating"], [5, "Core technologies"]];
  return (
    <section className="hero wrap">
      <div className="hero-text">
        <p className="pill">Open to internships and junior roles</p>
        <h1 className="h1">Hi, I’m <br />{profile.name}</h1>
        <p className="role">Python Full Stack Developer</p>
        <p className="lead">{profile.intro}</p>
        <div className="cta">
          <a className="btn primary" href="#/projects">View my work</a>
          <a className="btn" href="#/contact">Contact me</a>
          <a className="btn" href={resume.download} download="Shoba_Niki_J_Resume.pdf">Download resume</a>
        </div>
      </div>
      <Photo src={d.photo} />
      <ul className="stats">
        {stats.map(([n, l]) => <li key={l}><b>{n}</b><span>{l}</span></li>)}
      </ul>
    </section>
  );
}

const groupIcon = { Languages: "💻", Language: "💻", Frontend: "🎨", Backend: "⚙️", Database: "🗄️", Tools: "🛠️", "AI tools": "✨", Strengths: "💪" };
const facts = [["BCA", "Graduating 2026"], ["Python Full Stack", "Certified"], ["Django + React", "Core stack"]];

function About({ skills }) {
  const groups = skills.reduce((a, s) => ((a[s.group] ||= []).push(s.name), a), {});
  return (
    <section className="wrap">
      <Heading top title="About me" />
      <div className="about-hero">
        <p className="big">I’m a BCA student who enjoys building web applications end to end: data models and business logic in <mark>Django</mark>, interfaces in <mark>React</mark> and Bootstrap. I care about readable code, clear screens and software that holds up in real use.</p>
        <ul className="facts">{facts.map(([t, l]) => <li key={t}><b>{t}</b><span>{l}</span></li>)}</ul>
      </div>
      <h2 className="subhead">Skills and tools</h2>
      <div className="skillpanel">
        {Object.entries(groups).map(([g, n]) => (
          <div className="skillrow" key={g}>
            <h3><i aria-hidden="true">{groupIcon[g] || "•"}</i>{g}</h3>
            <ul>{n.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        ))}
      </div>
      <h2 className="subhead">Expertise</h2>
      <ul className="xbars">
        {expertise.map(([n, v]) => (
          <li key={n}>
            <div><span>{n}</span><b>{v}%</b></div>
            <i role="img" aria-label={`${n}: ${v} percent`} style={{ "--v": `${v}%` }} />
          </li>
        ))}
      </ul>
    </section>
  );
}

const Services = () => (
  <section className="wrap">
    <Heading title="What I can do" sub="Everything you need to take a web idea from database to browser." />
    <div className="grid3">
      {services.map(([t, p]) => <article className="card" key={t}><h3>{t}</h3><p>{p}</p></article>)}
    </div>
  </section>
);

function Shot({ src, title, i }) {
  const [ok, setOk] = useState(Boolean(src));
  useEffect(() => setOk(Boolean(src)), [src]);
  return (
    <div className={`thumb t${i % 3}`}>
      <div className="frame" aria-hidden="true"><i /><i /><i /></div>
      {ok ? <img src={src} alt={`Screenshot of ${title}`} loading="lazy" onError={() => setOk(false)} /> : <span>{title}</span>}
    </div>
  );
}

const Teaser = ({ projects }) => (
  <section className="wrap">
    <div className="head"><h2>Latest work</h2></div>
    <div className="grid3 projects">
      {projects.slice(0, 3).map((p, i) => (
        <a key={p.id} href="#/projects" className="card project teaser">
          <Shot src={p.image} title={p.title} i={i} />
          <h3>{p.title}</h3><p>{p.tag || p.summary}</p>
        </a>
      ))}
    </div>
    <p className="more"><a className="btn primary" href="#/projects">See all projects</a><a className="btn" href="#/gallery">Open gallery</a></p>
  </section>
);

const STOP = new Set(["system", "management", "the", "and"]);
const words = (t) => String(t).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !STOP.has(w));
const same = (a, b) => { const x = words(a); return words(b).some((w) => x.includes(w)); };

function Projects({ projects }) {
  const [openId, setOpenId] = useState(null);
  return (
    <section className="wrap">
      <Heading top title="Selected work" sub="Live projects you can open and try right now." />
      <div className="grid2 projects">
        {projects.map((p, i) => {
          const open = openId === p.id;
          return (
            <article key={p.id} className={`card project${open ? " open" : ""}`}>
              <a className="shotlink" href={`#/gallery/${encodeURIComponent(p.title)}`} aria-label={`See ${p.title} screenshots in the gallery`}>
                <Shot src={p.image} title={p.title} i={i} />
              </a>
              {p.tag && <p className="tag">{p.tag}</p>}
              <h3>{p.title}</h3>
              <div className="pdetail" id={`pd-${p.id}`}>
                <p>{p.summary}</p>
                <ul>{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
                <p>{p.stack.map((s) => <span className="chip" key={s}>{s}</span>)}</p>
              </div>
              {p.note && <p className="note">⏳ {p.note}</p>}
              <p className="plinks">
                {p.live_url && <a className="btn primary small" href={p.live_url} target="_blank" rel="noopener noreferrer">Live demo ↗</a>}
                <button type="button" className="btn small dbtn" aria-expanded={open} aria-controls={`pd-${p.id}`} onClick={() => setOpenId(open ? null : p.id)}>{open ? "Hide details" : "Details"}</button>
                {p.github_url && <a className="btn small" href={p.github_url} target="_blank" rel="noopener noreferrer">Source code</a>}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Gallery({ gallery, initial }) {
  const names = ["All", ...new Set(gallery.map((g) => g.project).filter(Boolean))];
  const [f, setF] = useState(() => (initial ? names.find((n) => n !== "All" && same(n, initial)) || "All" : "All"));
  const [idx, setIdx] = useState(null);
  const [bad, setBad] = useState({});
  const touch = useRef(0);
  const items = gallery.filter((g) => !bad[g.src] && (f === "All" || g.project === f));
  const shown = idx !== null ? items[idx] : null;
  const step = (d) => setIdx((i) => (i + d + items.length) % items.length);
  useEffect(() => {
    if (idx === null) return;
    const k = (e) => { if (e.key === "Escape") setIdx(null); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [idx, items.length]);
  return (
    <section className="wrap">
      <Heading top title="Project gallery" sub="A closer look at the screens I built." />
      <div className="filters" role="group" aria-label="Filter gallery">
        {names.map((n) => <button key={n} className={`chip fbtn${f === n ? " on" : ""}`} aria-pressed={f === n} onClick={() => setF(n)}>{n}</button>)}
      </div>
      <div className="gallery">
        {items.map((g, i) => (
          <button key={g.src} className="gitem" onClick={() => setIdx(i)} aria-label={`Enlarge: ${g.caption}`}>
            <img src={g.src} alt={g.caption} loading="lazy" onError={() => setBad((b) => ({ ...b, [g.src]: true }))} />
            <span><b>{g.project}</b><em>{g.caption}</em></span>
          </button>
        ))}
      </div>
      {shown && createPortal(
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={shown.caption} onClick={() => setIdx(null)}
          onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - touch.current; if (Math.abs(d) > 50 && items.length > 1) step(d < 0 ? 1 : -1); }}>
          <button className="btn small close" onClick={() => setIdx(null)}>Close ✕</button>
          {items.length > 1 && <button className="nbtn prev" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); step(-1); }}>‹</button>}
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={shown.src} alt={shown.caption} />
            <figcaption>{shown.project}: {shown.caption} <span className="count">{idx + 1} / {items.length}</span></figcaption>
          </figure>
          {items.length > 1 && <button className="nbtn next" aria-label="Next image" onClick={(e) => { e.stopPropagation(); step(1); }}>›</button>}
        </div>, document.body)}
    </section>
  );
}

const Process = () => (
  <section className="wrap">
    <Heading title="How I work" />
    <ol className="flow">
      {process.map(([t, p], i) => <li key={t}><b>{i + 1}</b><h3>{t}</h3><p>{p}</p></li>)}
    </ol>
  </section>
);

function Education({ education }) {
  return (
    <section className="wrap">
      <Heading top title="Education and certification" />
      <ol className="timeline">
        {education.map((e) => <li key={e.title}><time>{e.period}</time><div className="card"><h3>{e.title}</h3><p>{e.institution}</p></div></li>)}
        <li><time>Certified</time><div className="card"><h3>Python Full Stack Development</h3><p>Certification course</p></div></li>
      </ol>
    </section>
  );
}

function Icon({ n }) {
  const p = { className: "ico", viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false" };
  if (n === "github") return <svg {...p} viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>;
  if (n === "linkedin") return <svg {...p} fill="currentColor"><rect x="2" y="9" width="4" height="13" /><circle cx="4" cy="4.2" r="2.2" /><path d="M9 9h3.8v1.8h.1c.5-1 1.8-2.1 3.8-2.1 4 0 4.8 2.6 4.8 6V22h-4v-6.2c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V22H9z" /></svg>;
  if (n === "whatsapp") return <svg {...p} fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2z" /><path fill="var(--card)" d="M16.5 14.4c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1-.7-.3-1.6-.8-2.3-1.6-.6-.6-1-1.3-1.1-1.5-.1-.2 0-.3.1-.4l.4-.4.2-.4c.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4c-.2 0-.4.1-.6.3-.2.3-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.4 1.9.8 2.3.6 2.7.6.4 0 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3z" /></svg>;
  if (n === "phone") return <svg {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z" /></svg>;
  if (n === "file") return <svg {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></svg>;
  return <svg {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 6 10-6" /></svg>;
}

function Contact() {
  const resume = useResume();
  const [state, setState] = useState("idle");
  const tel = profile.phone.replace(/\s/g, "");
  async function send(e) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    setState("sending");
    try {
      const r = await fetch(`${API}/contact/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw 0;
      e.target.reset(); setState("sent");
    } catch { setState("error"); }
  }
  return (
    <section className="wrap">
      <Heading top title="Let’s build something great" sub="Tell me about your project or role. I reply by email." />
      <div className="two">
        <form onSubmit={send}>
          <label>Name<input name="name" required maxLength="80" autoComplete="name" /></label>
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          <label>Message<textarea name="body" rows="4" required maxLength="2000" /></label>
          <button className="btn primary" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}</button>
          <p role="status" className="status">
            {state === "sent" && "Message sent. Thank you!"}
            {state === "error" && "The message didn’t send. Email me at " + profile.email}
          </p>
        </form>
        <div className="card direct">
          <h3>Contact details</h3>
          <ul className="clist">
            <li><a href={`mailto:${profile.email}`}><Icon n="mail" />{profile.email}</a></li>
            <li><a href={`tel:${tel}`}><Icon n="phone" />{profile.phone}</a></li>
            <li><a href={`https://wa.me/${tel.replace("+", "")}`} target="_blank" rel="noopener noreferrer"><Icon n="whatsapp" />WhatsApp chat</a></li>
            <li><a href={profile.github} target="_blank" rel="noopener noreferrer"><Icon n="github" />GitHub</a></li>
            <li><a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Icon n="linkedin" />LinkedIn</a></li>
            <li><a href={resume.view} target="_blank" rel="noopener noreferrer"><Icon n="file" />Resume (PDF)</a></li>
          </ul>
        </div>
      </div>
    </section>
  );
}

const bIcons = {
  "": <path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />,
  about: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  projects: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 21h8M12 18v3" /></>,
  gallery: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 16l-5-5-9 9" /></>,
  contact: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 6 10-6" /></>,
};
function BottomNav({ page }) {
  return (
    <nav className="bnav" aria-label="Quick navigation">
      {[["", "Home"], ["about", "About"], ["projects", "Work"], ["gallery", "Gallery"], ["contact", "Contact"]].map(([id, l]) => (
        <a key={id} href={`#/${id}`} className={page === id ? "active" : ""} aria-current={page === id ? "page" : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{bIcons[id]}</svg>{l}
        </a>
      ))}
    </nav>
  );
}

export default function App() {
  const d = useContent();
  const [route, setRoute] = useState(window.location.hash);
  useEffect(() => {
    const h = () => { setRoute(window.location.hash); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  if (route.startsWith("#/dashboard")) return <Suspense fallback={<p className="wrap">Loading…</p>}><Dashboard /></Suspense>;
  const [seg, rawArg] = route.replace(/^#\/?/, "").split("/");
  let arg = "";
  try { arg = decodeURIComponent(rawArg || ""); } catch { arg = ""; }
  const current = links.some(([id]) => id === seg) ? seg : "";
  return (
    <ResumeCtx.Provider value={resumeLinks(d.resume)}>
      <Nav page={current} />
      <BottomNav page={current} />
      <main key={`${current}/${arg}`} className="page">
        {current === "" && <><Hero d={d} /><Services /><Teaser projects={d.projects} /></>}
        {current === "about" && <><About skills={d.skills} /><Process /></>}
        {current === "projects" && <Projects projects={d.projects} />}
        {current === "gallery" && <Gallery gallery={d.gallery} initial={arg} />}
        {current === "education" && <Education education={d.education} />}
        {current === "contact" && <Contact />}
      </main>
      <footer className="wrap foot">
        <span>© {new Date().getFullYear()} {profile.name}. Built with React, Django and PostgreSQL.</span>
        <span className="soc">
          <a href={profile.github} aria-label="GitHub" target="_blank" rel="noopener noreferrer"><Icon n="github" /></a>
          <a href={profile.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><Icon n="linkedin" /></a>
          <a href={`https://wa.me/${profile.phone.replace(/[^\d]/g, "")}`} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><Icon n="whatsapp" /></a>
          <a href={`mailto:${profile.email}`} aria-label="Email"><Icon n="mail" /></a>
        </span>
      </footer>
    </ResumeCtx.Provider>
  );
}