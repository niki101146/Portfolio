import { useCallback, useEffect, useState } from "react";
import "./dashboard.css";

const API = import.meta.env.VITE_API_URL || "/api";
const tabs = [["overview", "Overview"], ["projects", "Projects"], ["gallery", "Gallery images"], ["photo", "Profile photo"], ["resume", "Resume"], ["skills", "Skills"], ["education", "Education"], ["messages", "Messages"]];

const ICONS = {
  overview: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  projects: <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
  gallery: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>,
  photo: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></>,
  resume: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
  skills: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  education: <><path d="M22 10L12 5 2 10l10 5z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></>,
  messages: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  logout: <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />,
  external: <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />,
};
const Ic = ({ n }) => (
  <svg className="ic" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{ICONS[n]}</svg>
);
const PageHead = ({ title, sub, action }) => (
  <header className="phead"><div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>{action}</header>
);

async function call(path, { method = "GET", body, token } = {}) {
  const headers = token ? { Authorization: `Token ${token}` } : {};
  let payload = body;
  if (body && !(body instanceof FormData)) { headers["Content-Type"] = "application/json"; payload = JSON.stringify(body); }
  const r = await fetch(`${API}${path}`, { method, headers, body: payload });
  if (r.status === 204) return null;
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const first = Object.values(data).flat()[0];
    const e = new Error(typeof first === "string" ? first : "Something went wrong. Try again.");
    e.status = r.status; throw e;
  }
  return data;
}

function useList(path, { token, onAuthFail }) {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState("");
  const fail = (e) => (e.status === 401 ? onAuthFail() : setErr(e.message));
  const load = useCallback(() => call(path, { token }).then((d) => { setItems(d); setErr(""); }).catch(fail), [path, token]);
  useEffect(() => { load(); }, [load]);
  const act = async (method, p, body) => {
    try { await call(p, { method, body, token }); await load(); return true; } catch (e) { fail(e); return false; }
  };
  return { items, err, act };
}

function Login({ onLogin }) {
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);
  async function submit(e) {
    e.preventDefault(); setErr("");
    try { onLogin((await call("/auth/login/", { method: "POST", body: Object.fromEntries(new FormData(e.target)) })).token); }
    catch (e) { setErr(e.status === 400 ? "Wrong username or password." : e.status === 429 ? "Too many attempts. Wait a while and try again." : e.status ? `The server answered with error ${e.status}, so this is not your password. Check VITE_API_URL in frontend/.env (leave it empty for local use) and restart npm run dev.` : "Cannot reach the server. Check that the backend is running and VITE_API_URL is correct."); }
  }
  return (
    <main className="dlogin">
      <form className="card" onSubmit={submit}>
        <span className="lmark" aria-hidden="true">SN</span>
        <h1>Dashboard</h1>
        <p>Sign in with the account you created using createsuperuser.</p>
        <label>Username<input name="username" required autoComplete="username" /></label>
        <label>Password
          <span className="pw">
            <input name="password" type={show ? "text" : "password"} required autoComplete="current-password" />
            <button type="button" className="eye" aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} onClick={() => setShow(!show)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {show
                  ? <><path d="M17.9 17.9A10.6 10.6 0 0112 20c-7 0-11-8-11-8a18.5 18.5 0 015.1-5.9M9.9 4.2A9.8 9.8 0 0112 4c7 0 11 8 11 8a18.6 18.6 0 01-2.2 3.2M1 1l22 22" /><path d="M14.1 14.1a3 3 0 11-4.2-4.2" /></>
                  : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}
              </svg>
            </button>
          </span>
        </label>
        <button className="btn primary">Sign in</button>
        <p role="alert" className="derr">{err}</p>
        <a href="#/">Back to portfolio</a>
      </form>
    </main>
  );
}

const Err = ({ children }) => (children ? <p role="alert" className="derr">{children}</p> : null);

function Projects(p) {
  const { items, err, act } = useList("/manage/projects/", p);
  const [form, setForm] = useState(null); // null = hidden, {} = new, object = editing
  async function save(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    f.set("highlights", JSON.stringify(f.get("highlights").split("\n").map((x) => x.trim()).filter(Boolean)));
    f.set("stack", JSON.stringify(f.get("stack").split(",").map((x) => x.trim()).filter(Boolean)));
    if (!f.get("image")?.size) f.delete("image");
    const ok = form.id ? await act("PATCH", `/manage/projects/${form.id}/`, f) : await act("POST", "/manage/projects/", f);
    if (ok) setForm(null);
  }
  return (
    <>
      <PageHead title="Projects" sub="The cards shown on your Projects page." action={<button className="btn primary" onClick={() => setForm({})}><Ic n="plus" />Add project</button>} />
      <Err>{err}</Err>
      {form && (
        <form className="card dform" onSubmit={save}>
          <h3>{form.id ? "Edit project" : "New project"}</h3>
          <label>Title<input name="title" required defaultValue={form.title} /></label>
          <label>Short label (for example Travel planner)<input name="tag" maxLength="80" defaultValue={form.tag} /></label>
          <label>Summary<textarea name="summary" rows="3" required defaultValue={form.summary} /></label>
          <label>Highlights (one per line)<textarea name="highlights" rows="4" defaultValue={(form.highlights || []).join("\n")} /></label>
          <label>Tech stack (separate with commas)<input name="stack" defaultValue={(form.stack || []).join(", ")} /></label>
          <label>GitHub link<input name="github_url" type="url" defaultValue={form.github_url} /></label>
          <label>Live site link<input name="live_url" type="url" defaultValue={form.live_url} /></label>
          <label>Small notice on the card (optional, for example slow first load)<input name="note" maxLength="200" defaultValue={form.note} /></label>
          <label>Display order (lowest first)<input name="order" type="number" min="0" defaultValue={form.order ?? 0} /></label>
          <label>Screenshot (JPG or PNG, under 3 MB)<input name="image" type="file" accept="image/*" /></label>
          {form.image && <img className="preview" src={form.image} alt="Current screenshot" />}
          <div className="dbar"><button className="btn primary">Save project</button><button type="button" className="btn" onClick={() => setForm(null)}>Cancel</button></div>
        </form>
      )}
      {items?.length === 0 && !form && <p className="dmuted">No projects yet. Add your first one.</p>}
      {items?.map((x) => (
        <div className="card drow" key={x.id}>
          {x.image && <img className="thumbs" src={x.image} alt="" />}
          <div><h3>{x.title}</h3><p className="dmuted">{x.stack.join(", ")}</p></div>
          <div className="dbar">
            <button className="btn small" onClick={() => setForm(x)}>Edit</button>
            <button className="btn small danger" onClick={() => window.confirm(`Delete “${x.title}”?`) && act("DELETE", `/manage/projects/${x.id}/`)}>Delete</button>
          </div>
        </div>
      ))}
    </>
  );
}

function Gallery(p) {
  const { items, err, act } = useList("/manage/gallery/", p);
  const [msg, setMsg] = useState("");
  async function add(e) {
    e.preventDefault(); setMsg("");
    const f = new FormData(e.target);
    if (!f.get("image")?.size) return setMsg("Choose an image first.");
    if (await act("POST", "/manage/gallery/", f)) { e.target.reset(); setMsg("Image added."); }
  }
  return (
    <>
      <PageHead title="Gallery images" sub="Screenshots shown on the Gallery page." /><Err>{err}</Err>
      <form className="card dform" onSubmit={add}>
        <label>Image (JPG or PNG, under 3 MB)<input name="image" type="file" accept="image/*" required /></label>
        <label>Project name (used for the filter buttons)<input name="project" maxLength="80" placeholder="Explore South" /></label>
        <label>Caption<input name="caption" maxLength="160" placeholder="Home page with chatbot" /></label>
        <label>Display order (lowest first)<input name="order" type="number" min="0" defaultValue="0" /></label>
        <button className="btn primary">Add to gallery</button>
        <p role="status" className="dmuted">{msg}</p>
      </form>
      {items?.length === 0 && <p className="dmuted">No uploaded images yet. Until you add one, the Gallery page shows the built-in screenshots.</p>}
      <div className="gal">
        {items?.map((x) => (
          <figure className="gcard" key={x.id}>
            <img src={x.image} alt={x.caption || "Gallery image"} loading="lazy" />
            <figcaption>
              <b>{x.caption || "Untitled"}</b>
              {x.project && <span className="chip">{x.project}</span>}
              <button className="btn small danger" onClick={() => window.confirm("Delete this image?") && act("DELETE", `/manage/gallery/${x.id}/`)}><Ic n="trash" />Delete</button>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}

function Photo(p) {
  const [photo, setPhoto] = useState(null);
  const [msg, setMsg] = useState("");
  useEffect(() => { call("/manage/profile/", { token: p.token }).then((d) => setPhoto(d.photo)).catch((e) => e.status === 401 && p.onAuthFail()); }, []);
  async function upload(e) {
    e.preventDefault(); setMsg("");
    const f = new FormData(e.target);
    if (!f.get("photo")?.size) return setMsg("Choose a photo first.");
    try { setPhoto((await call("/manage/profile/", { method: "PATCH", body: f, token: p.token })).photo); setMsg("Photo updated."); e.target.reset(); }
    catch (er) { setMsg(er.message); }
  }
  return (
    <>
      <PageHead title="Profile photo" sub="The portrait shown on your home page." />
      <form className="card dform" onSubmit={upload}>
        {photo ? <img className="preview portrait" src={photo} alt="Current profile photo" /> : <p className="dmuted">No photo yet.</p>}
        <label>New photo (portrait, JPG or PNG, under 3 MB)<input name="photo" type="file" accept="image/*" /></label>
        <button className="btn primary">Upload photo</button>
        <p role="status" className="dmuted">{msg}</p>
      </form>
    </>
  );
}

function Resume(p) {
  const [info, setInfo] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    call("/manage/resume/", { token: p.token }).then(setInfo)
      .catch((e) => (e.status === 401 ? p.onAuthFail() : setMsg(e.message)));
  }, []);
  async function upload(e) {
    e.preventDefault(); setMsg("");
    const f = new FormData(e.target);
    if (!f.get("resume")?.size) return setMsg("Choose a PDF first.");
    setBusy(true);
    try { setInfo(await call("/manage/resume/", { method: "POST", body: f, token: p.token })); setMsg("Resume updated. It is live on your portfolio now."); e.target.reset(); }
    catch (er) { setMsg(er.message); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!window.confirm("Remove the uploaded resume? The portfolio will go back to the built-in file.")) return;
    try { await call("/manage/resume/", { method: "DELETE", token: p.token }); setInfo({ has_resume: false }); setMsg("Resume removed."); }
    catch (er) { setMsg(er.message); }
  }
  return (
    <>
      <PageHead title="Resume" sub="The PDF behind the Resume and Download resume buttons on your site." />
      <div className="card drow">
        <div>
          <h3>{info?.has_resume ? info.name || "resume.pdf" : "No resume uploaded yet"}</h3>
          <p className="dmuted">{info?.has_resume
            ? `Uploaded ${new Date(info.updated).toLocaleString()} · ${Math.max(1, Math.round(info.size / 1024))} KB`
            : "Until you upload one, the site uses the resume file bundled with the frontend."}</p>
        </div>
        {info?.has_resume && (
          <div className="dbar">
            <a className="btn small" href={`${API}/resume/?v=${info.version}`} target="_blank" rel="noopener noreferrer"><Ic n="external" />View</a>
            <button className="btn small danger" onClick={remove}><Ic n="trash" />Remove</button>
          </div>
        )}
      </div>
      <form className="card dform" onSubmit={upload}>
        <label>{info?.has_resume ? "Replace with a new resume" : "Upload your resume"} (PDF, under 5 MB)<input name="resume" type="file" accept="application/pdf,.pdf" /></label>
        <button className="btn primary" disabled={busy}>{busy ? "Uploading…" : info?.has_resume ? "Replace resume" : "Upload resume"}</button>
        <p role="status" className="dmuted">{msg}</p>
      </form>
    </>
  );
}

function Skills(p) {
  const { items, err, act } = useList("/manage/skills/", p);
  const groups = [...new Set((items || []).map((s) => s.group))];
  async function add(e) {
    e.preventDefault();
    const f = e.target;
    if (await act("POST", "/manage/skills/", Object.fromEntries(new FormData(f)))) f.name.value = "";
  }
  return (
    <>
      <PageHead title="Skills" sub="Grouped skills shown in Skills and tools." /><Err>{err}</Err>
      <form className="card dform inline" onSubmit={add}>
        <label>Group<input name="group" list="groups" required placeholder="Frontend" /></label>
        <datalist id="groups">{groups.map((g) => <option key={g} value={g} />)}</datalist>
        <label>Skill<input name="name" required placeholder="React" /></label>
        <button className="btn primary">Add skill</button>
      </form>
      {groups.map((g) => (
        <div className="card" key={g}><h3>{g}</h3>
          {items.filter((s) => s.group === g).map((s) => (
            <span className="chip" key={s.id}>{s.name} <button aria-label={`Remove ${s.name}`} onClick={() => act("DELETE", `/manage/skills/${s.id}/`)}>×</button></span>
          ))}
        </div>
      ))}
    </>
  );
}

function Education(p) {
  const { items, err, act } = useList("/manage/education/", p);
  async function add(e) {
    e.preventDefault();
    const f = e.target;
    if (await act("POST", "/manage/education/", Object.fromEntries(new FormData(f)))) f.reset();
  }
  return (
    <>
      <PageHead title="Education" sub="Your timeline on the Education page." /><Err>{err}</Err>
      <form className="card dform" onSubmit={add}>
        <label>Qualification<input name="title" required /></label>
        <label>Institution<input name="institution" required /></label>
        <label>Years (for example 2023–2026)<input name="period" required /></label>
        <button className="btn primary">Add education</button>
      </form>
      {items?.map((x) => (
        <div className="card drow" key={x.id}>
          <div><h3>{x.title}</h3><p className="dmuted">{x.institution} · {x.period}</p></div>
          <button className="btn small danger" onClick={() => window.confirm("Delete this entry?") && act("DELETE", `/manage/education/${x.id}/`)}>Delete</button>
        </div>
      ))}
    </>
  );
}

function Messages(p) {
  const { items, err, act } = useList("/manage/messages/", p);
  return (
    <>
      <PageHead title="Messages" sub="Sent from the contact form on your site." /><Err>{err}</Err>
      {items?.length === 0 && <p className="dmuted">No messages yet. Visitors’ contact form messages appear here.</p>}
      {items?.map((m) => (
        <div className="card" key={m.id}>
          <h3>{m.name}</h3>
          <p className="dmuted"><a href={`mailto:${m.email}`}>{m.email}</a> · {new Date(m.created).toLocaleString()}</p>
          <p>{m.body}</p>
          <button className="btn small danger" onClick={() => window.confirm("Delete this message?") && act("DELETE", `/manage/messages/${m.id}/`)}>Delete</button>
        </div>
      ))}
    </>
  );
}

function Overview(p) {
  const lists = {
    projects: useList("/manage/projects/", p), gallery: useList("/manage/gallery/", p),
    skills: useList("/manage/skills/", p), education: useList("/manage/education/", p),
    messages: useList("/manage/messages/", p),
  };
  const labels = { projects: "Projects", gallery: "Gallery images", skills: "Skills", education: "Education", messages: "Messages" };
  const latest = (lists.messages.items || []).slice(0, 3);
  return (
    <>
      <PageHead title="Overview" sub="A quick look at what is on your portfolio." action={<a className="btn" href="#/" target="_blank" rel="noopener noreferrer"><Ic n="external" />View portfolio</a>} />
      <div className="stats-grid">
        {Object.keys(labels).map((id) => (
          <button key={id} className="stat" onClick={() => p.go(id)}>
            <span className="sico"><Ic n={id} /></span>
            <b>{lists[id].items ? lists[id].items.length : "–"}</b>
            <span>{labels[id]}</span>
          </button>
        ))}
      </div>
      <h3 className="dsub">Latest messages</h3>
      {lists.messages.items && latest.length === 0 && <p className="dmuted">No messages yet.</p>}
      {latest.map((m) => (
        <div className="card msg" key={m.id}>
          <span className="avatar" aria-hidden="true">{(m.name || "?").charAt(0).toUpperCase()}</span>
          <div><h3>{m.name}</h3><p className="dmuted">{m.email} · {new Date(m.created).toLocaleDateString()}</p><p>{m.body}</p></div>
        </div>
      ))}
    </>
  );
}

const panels = { overview: Overview, projects: Projects, gallery: Gallery, photo: Photo, resume: Resume, skills: Skills, education: Education, messages: Messages };

export default function Dashboard() {
  const [token, setToken] = useState(() => localStorage.getItem("dash_token") || "");
  const [tab, setTab] = useState("overview");
  const logout = () => { localStorage.removeItem("dash_token"); setToken(""); };
  if (!token) return <Login onLogin={(t) => { localStorage.setItem("dash_token", t); setToken(t); }} />;
  const Panel = panels[tab];
  return (
    <div className="dash">
      <aside>
        <div className="dbrand"><span className="lmark small" aria-hidden="true">SN</span><b>Dashboard</b></div>
        <nav aria-label="Dashboard sections">
          {tabs.map(([id, l]) => (
            <button key={id} className={tab === id ? "on" : ""} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}><Ic n={id} /><span>{l}</span></button>
          ))}
        </nav>
        <div className="dfoot">
          <a href="#/" target="_blank" rel="noopener noreferrer"><Ic n="external" /><span>View portfolio</span></a>
          <button className="linklike" onClick={logout}><Ic n="logout" /><span>Sign out</span></button>
        </div>
      </aside>
      <main><Panel key={tab} token={token} onAuthFail={logout} go={setTab} /></main>
    </div>
  );
}