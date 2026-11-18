import { useCallback, useEffect, useState } from "react";
import "./dashboard.css";

const API = import.meta.env.VITE_API_URL || "/api";
const tabs = [["projects", "Projects"], ["gallery", "Gallery images"], ["photo", "Profile photo"], ["skills", "Skills"], ["education", "Education"], ["messages", "Messages"]];

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
  async function submit(e) {
    e.preventDefault(); setErr("");
    try { onLogin((await call("/auth/login/", { method: "POST", body: Object.fromEntries(new FormData(e.target)) })).token); }
    catch { setErr("Wrong username or password."); }
  }
  return (
    <main className="dlogin">
      <form className="card" onSubmit={submit}>
        <h1>Dashboard</h1>
        <p>Sign in with the account you created using createsuperuser.</p>
        <label>Username<input name="username" required autoComplete="username" /></label>
        <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
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
      <div className="dbar"><h2>Projects</h2><button className="btn primary" onClick={() => setForm({})}>Add project</button></div>
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
      <h2>Gallery images</h2><Err>{err}</Err>
      <form className="card dform" onSubmit={add}>
        <label>Image (JPG or PNG, under 3 MB)<input name="image" type="file" accept="image/*" required /></label>
        <label>Project name (used for the filter buttons)<input name="project" maxLength="80" placeholder="Explore South" /></label>
        <label>Caption<input name="caption" maxLength="160" placeholder="Home page with chatbot" /></label>
        <label>Display order (lowest first)<input name="order" type="number" min="0" defaultValue="0" /></label>
        <button className="btn primary">Add to gallery</button>
        <p role="status" className="dmuted">{msg}</p>
      </form>
      {items?.length === 0 && <p className="dmuted">No uploaded images yet. Until you add one, the Gallery page shows the built-in screenshots.</p>}
      {items?.map((x) => (
        <div className="card drow" key={x.id}>
          <img className="thumbs" src={x.image} alt="" />
          <div><h3>{x.caption || "Untitled"}</h3><p className="dmuted">{x.project}</p></div>
          <button className="btn small danger" onClick={() => window.confirm("Delete this image?") && act("DELETE", `/manage/gallery/${x.id}/`)}>Delete</button>
        </div>
      ))}
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
      <h2>Profile photo</h2>
      <form className="card dform" onSubmit={upload}>
        {photo ? <img className="preview portrait" src={photo} alt="Current profile photo" /> : <p className="dmuted">No photo yet.</p>}
        <label>New photo (portrait, JPG or PNG, under 3 MB)<input name="photo" type="file" accept="image/*" /></label>
        <button className="btn primary">Upload photo</button>
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
      <h2>Skills</h2><Err>{err}</Err>
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
      <h2>Education</h2><Err>{err}</Err>
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
      <h2>Messages</h2><Err>{err}</Err>
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

const panels = { projects: Projects, gallery: Gallery, photo: Photo, skills: Skills, education: Education, messages: Messages };

export default function Dashboard() {
  const [token, setToken] = useState(() => localStorage.getItem("dash_token") || "");
  const [tab, setTab] = useState("projects");
  const logout = () => { localStorage.removeItem("dash_token"); setToken(""); };
  if (!token) return <Login onLogin={(t) => { localStorage.setItem("dash_token", t); setToken(t); }} />;
  const Panel = panels[tab];
  return (
    <div className="dash">
      <aside>
        <b className="brand">Dashboard</b>
        <nav aria-label="Dashboard sections">
          {tabs.map(([id, l]) => <button key={id} className={tab === id ? "on" : ""} aria-current={tab === id} onClick={() => setTab(id)}>{l}</button>)}
        </nav>
        <a href="#/">View portfolio</a>
        <button className="linklike" onClick={logout}>Sign out</button>
      </aside>
      <main><Panel key={tab} token={token} onAuthFail={logout} /></main>
    </div>
  );
}
