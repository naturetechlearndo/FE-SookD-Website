import { useState } from 'react';
import { api } from '../services/api';
import Footer from './Footer';
import { SITE_CONTENT as c } from '../constants/content';

type AuthView = 'login' | 'reg1' | 'reg2';

interface Props {
  onBack: () => void;
  onLoginSuccess?: (user: any) => void;
  initialView?: AuthView;
}

const MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="auth-field__err">{msg}</p>;
}

export default function AuthPage({ onBack, onLoginSuccess, initialView = 'login' }: Props) {
  const [view, setView] = useState<AuthView>(initialView);

  /* ── Login state ── */
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginShowPw, setLoginShowPw] = useState(false);
  const [loginErrs, setLoginErrs] = useState<Record<string, string>>({});
  const [loginApiErr, setLoginApiErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  /* ── Register step 1 ── */
  const [userType, setUserType] = useState<'individual' | 'legal_entity'>('individual');
  const [r1, setR1] = useState({
    first_name: '', last_name: '', phone_number: '', address: '', gender: '',
    bd_day: '', bd_month: '', bd_year: '',
    legal_entity_name: '', business_registration_number: '', business_type: '',
  });
  const [r1Err, setR1Err] = useState<Record<string, string>>({});

  /* ── Register step 2 ── */
  const [r2, setR2] = useState({ email: '', username: '', password: '', confirm: '' });
  const [r2Err, setR2Err] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regApiErr, setRegApiErr] = useState('');

  /* ── Handlers ── */
  function validateLogin(): boolean {
    const errs: Record<string, string> = {};
    if (!loginEmail.trim()) errs.email = 'กรุณากรอกข้อมูลในช่องว่าง';
    if (!loginPass) errs.password = 'กรุณากรอกข้อมูลในช่องว่าง';
    setLoginErrs(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginApiErr('');
    if (!validateLogin()) return;
    setLoginLoading(true);
    try {
      const res = await api.auth.login({ email: loginEmail, password: loginPass });
      if (res.success) { onLoginSuccess?.(res.user); onBack(); }
      else setLoginApiErr(res.message ?? 'เข้าสู่ระบบไม่สำเร็จ');
    } catch {
      setLoginApiErr('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setLoginLoading(false);
    }
  }

  function validateR1(): boolean {
    const errs: Record<string, string> = {};
    if (userType === 'individual') {
      if (!r1.first_name.trim()) errs.first_name = 'กรุณากรอกข้อมูลในช่องว่าง';
      if (!r1.last_name.trim()) errs.last_name = 'กรุณากรอกข้อมูลในช่องว่าง';
      if (!r1.phone_number.trim()) errs.phone_number = 'กรุณากรอกข้อมูลในช่องว่าง';
      if (!r1.address.trim()) errs.address = 'กรุณากรอกข้อมูลในช่องว่าง';
      if (!r1.gender) errs.gender = 'กรุณากรอกข้อมูลในช่องว่าง';
      if (!r1.bd_day) errs.bd_day = 'กรุณากรอกข้อมูลในช่องว่าง';
      if (!r1.bd_month) errs.bd_month = 'กรุณากรอกข้อมูลในช่องว่าง';
      if (!r1.bd_year) errs.bd_year = 'กรุณากรอกข้อมูลในช่องว่าง';
    } else {
      if (!r1.legal_entity_name.trim()) errs.legal_entity_name = 'กรุณากรอกข้อมูลในช่องว่าง';
      if (!r1.business_registration_number.trim()) errs.business_registration_number = 'กรุณากรอกข้อมูลในช่องว่าง';
      if (!r1.phone_number.trim()) errs.phone_number = 'กรุณากรอกข้อมูลในช่องว่าง';
      if (!r1.address.trim()) errs.address = 'กรุณากรอกข้อมูลในช่องว่าง';
      if (!r1.business_type) errs.business_type = 'กรุณากรอกข้อมูลในช่องว่าง';
    }
    setR1Err(errs);
    return Object.keys(errs).length === 0;
  }

  function validateR2(): boolean {
    const errs: Record<string, string> = {};
    if (!r2.email.trim()) errs.email = 'กรุณากรอกข้อมูลในช่องว่าง';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r2.email)) errs.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!r2.username.trim()) errs.username = 'กรุณากรอกข้อมูลในช่องว่าง';
    if (!r2.password) errs.password = 'กรุณากรอกข้อมูลในช่องว่าง';
    if (!r2.confirm) errs.confirm = 'กรุณากรอกข้อมูลในช่องว่าง';
    else if (r2.password && r2.confirm !== r2.password) errs.confirm = 'รหัสผ่านไม่ตรงกัน';
    if (!agreed) errs.agreed = 'กรุณายอมรับข้อตกลง';
    setR2Err(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!validateR2()) return;
    setRegLoading(true);
    setRegApiErr('');
    const birthdate = `${r1.bd_day}/${r1.bd_month}/${r1.bd_year}`;
    const body = {
      user_type: userType,
      ...(userType === 'individual'
        ? { first_name: r1.first_name, last_name: r1.last_name, gender: r1.gender, birthdate }
        : { legal_entity_name: r1.legal_entity_name, business_registration_number: r1.business_registration_number, business_type: r1.business_type }),
      phone_number: r1.phone_number,
      address: r1.address,
      email: r2.email,
      username: r2.username,
      password: r2.password,
    };
    try {
      const res = await api.auth.register(body);
      if (res.success) { setView('login'); }
      else setRegApiErr(res.message ?? 'สมัครสมาชิกไม่สำเร็จ');
    } catch {
      setRegApiErr('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setRegLoading(false);
    }
  }

  function field(
    label: string, key: string, value: string, onChange: (v: string) => void,
    errors: Record<string, string>, opts?: { placeholder?: string; type?: string }
  ) {
    const err = errors[key];
    return (
      <div className="auth-field">
        <label className="auth-field__label">{label}</label>
        <input
          className={`auth-input${err ? ' auth-input--err' : ''}`}
          type={opts?.type ?? 'text'}
          placeholder={opts?.placeholder ?? ''}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <FieldError msg={err} />
      </div>
    );
  }

  function selectField(
    label: string, key: string, value: string, onChange: (v: string) => void,
    errors: Record<string, string>, options: string[], placeholder: string
  ) {
    const err = errors[key];
    return (
      <div className="auth-field">
        <label className="auth-field__label">{label}</label>
        <select
          className={`auth-select${err ? ' auth-input--err' : ''}`}
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <FieldError msg={err} />
      </div>
    );
  }

  /* ────────────────── RENDER ────────────────── */

  if (view === 'login') return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Login</h1>
          <form onSubmit={handleLogin} noValidate>
            <div className="auth-field">
              <label className="auth-field__label">Email</label>
              <input
                className={`auth-input${loginErrs.email ? ' auth-input--err' : ''}`}
                type="email" placeholder="example@gmail.com"
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
              />
              <FieldError msg={loginErrs.email} />
            </div>
            <div className="auth-field">
              <label className="auth-field__label">Password</label>
              <div className="auth-pw-wrap">
                <input
                  className={`auth-input${loginErrs.password ? ' auth-input--err' : ''}`}
                  type={loginShowPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={loginPass} onChange={e => setLoginPass(e.target.value)}
                />
                <button type="button" className="auth-pw-eye" onClick={() => setLoginShowPw(v => !v)}>
                  <EyeIcon open={loginShowPw} />
                </button>
              </div>
              <FieldError msg={loginErrs.password} />
            </div>
            {loginApiErr && <p className="auth-api-err">{loginApiErr}</p>}
            <button className="auth-btn auth-btn--primary auth-btn--full" type="submit" disabled={loginLoading}>
              {loginLoading ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
            </button>
          </form>
          <p className="auth-link-row">
            Don't have an account?{' '}
            <button className="auth-link" onClick={() => setView('reg1')}>Register</button>
          </p>
        </div>
      </div>
      <Footer data={c.footer} />
    </>
  );

  if (view === 'reg1') return (
    <>
      <div className="auth-page">
        <div className="auth-card auth-card--wide">
          <h1 className="auth-title">Register</h1>

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab${userType === 'individual' ? ' auth-tab--active' : ''}`}
              onClick={() => { setUserType('individual'); setR1Err({}); }}>Individual</button>
            <button className={`auth-tab${userType === 'legal_entity' ? ' auth-tab--active' : ''}`}
              onClick={() => { setUserType('legal_entity'); setR1Err({}); }}>Legal Entity</button>
          </div>

          {userType === 'individual' ? (
            <>
              {field('Name', 'first_name', r1.first_name, v => setR1({ ...r1, first_name: v }), r1Err, { placeholder: 'Enter your name' })}
              {field('Surname', 'last_name', r1.last_name, v => setR1({ ...r1, last_name: v }), r1Err, { placeholder: 'Enter your surname' })}
              {field('Phone Number', 'phone_number', r1.phone_number, v => setR1({ ...r1, phone_number: v }), r1Err, { placeholder: 'e.g. 0123456789' })}
              {field('Address', 'address', r1.address, v => setR1({ ...r1, address: v }), r1Err, { placeholder: 'Enter your address' })}
              {selectField('Gender', 'gender', r1.gender, v => setR1({ ...r1, gender: v }), r1Err,
                ['Male', 'Female', 'Other'], 'Select your gender')}

              {/* Birthdate: day / month / year */}
              <div className="auth-field">
                <label className="auth-field__label">Birthdate</label>
                <div className="auth-date-row">
                  <select
                    className={`auth-select${r1Err.bd_day ? ' auth-input--err' : ''}`}
                    value={r1.bd_day}
                    onChange={e => setR1({ ...r1, bd_day: e.target.value })}
                  >
                    <option value="">วัน</option>
                    {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(d =>
                      <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select
                    className={`auth-select${r1Err.bd_month ? ' auth-input--err' : ''}`}
                    value={r1.bd_month}
                    onChange={e => setR1({ ...r1, bd_month: e.target.value })}
                  >
                    <option value="">เดือน</option>
                    {MONTHS.map((m, i) => {
                      const val = String(i + 1).padStart(2, '0');
                      return <option key={val} value={val}>{m}</option>;
                    })}
                  </select>
                  <select
                    className={`auth-select${r1Err.bd_year ? ' auth-input--err' : ''}`}
                    value={r1.bd_year}
                    onChange={e => setR1({ ...r1, bd_year: e.target.value })}
                  >
                    <option value="">ปี</option>
                    {Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i)).map(y =>
                      <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {(r1Err.bd_day || r1Err.bd_month || r1Err.bd_year) && (
                  <p className="auth-field__err">กรุณากรอกข้อมูลในช่องว่าง</p>
                )}
              </div>
            </>
          ) : (
            <>
              {field('Legal Entity Name', 'legal_entity_name', r1.legal_entity_name, v => setR1({ ...r1, legal_entity_name: v }), r1Err, { placeholder: 'Enter your legal entity name' })}
              {field('Business Registration Number', 'business_registration_number', r1.business_registration_number, v => setR1({ ...r1, business_registration_number: v }), r1Err, { placeholder: 'e.g. 0123456789123' })}
              {field('Phone Number', 'phone_number', r1.phone_number, v => setR1({ ...r1, phone_number: v }), r1Err, { placeholder: 'e.g. 0123456789' })}
              {field('Company Address', 'address', r1.address, v => setR1({ ...r1, address: v }), r1Err, { placeholder: 'Enter your company address' })}
              {selectField('Business Type', 'business_type', r1.business_type, v => setR1({ ...r1, business_type: v }), r1Err,
                ['Sole Proprietorship', 'Partnership', 'Company Limited', 'Public Company', 'Other'],
                'Select your business type')}
            </>
          )}

          <div className="auth-btn-row">
            <button className="auth-btn auth-btn--outline" onClick={() => setView('login')}>Maybe later</button>
            <button className="auth-btn auth-btn--primary" onClick={() => { if (validateR1()) setView('reg2'); }}>Next</button>
          </div>
          <p className="auth-link-row">
            Already have an account?{' '}
            <button className="auth-link" onClick={() => setView('login')}>Login</button>
          </p>
        </div>
      </div>
      <Footer data={c.footer} />
    </>
  );

  /* reg2 */
  return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Register</h1>
          <form onSubmit={handleRegister} noValidate>
            <div className="auth-field">
              <label className="auth-field__label">Email</label>
              <input className={`auth-input${r2Err.email ? ' auth-input--err' : ''}`}
                type="email" placeholder="example@gmail.com"
                value={r2.email} onChange={e => setR2({ ...r2, email: e.target.value })} />
              <FieldError msg={r2Err.email} />
            </div>
            <div className="auth-field">
              <label className="auth-field__label">Username</label>
              <input className={`auth-input${r2Err.username ? ' auth-input--err' : ''}`}
                placeholder="Enter your username"
                value={r2.username} onChange={e => setR2({ ...r2, username: e.target.value })} />
              <FieldError msg={r2Err.username} />
            </div>
            <div className="auth-field">
              <label className="auth-field__label">Password</label>
              <div className="auth-pw-wrap">
                <input className={`auth-input${r2Err.password ? ' auth-input--err' : ''}`}
                  type={showPw ? 'text' : 'password'} placeholder="Enter your password"
                  value={r2.password} onChange={e => setR2({ ...r2, password: e.target.value })} />
                <button type="button" className="auth-pw-eye" onClick={() => setShowPw(v => !v)}>
                  <EyeIcon open={showPw} />
                </button>
              </div>
              <FieldError msg={r2Err.password} />
            </div>
            <div className="auth-field">
              <label className="auth-field__label">Confirm Password</label>
              <div className="auth-pw-wrap">
                <input className={`auth-input${r2Err.confirm ? ' auth-input--err' : ''}`}
                  type={showCfm ? 'text' : 'password'} placeholder="Confirm your password"
                  value={r2.confirm} onChange={e => setR2({ ...r2, confirm: e.target.value })} />
                <button type="button" className="auth-pw-eye" onClick={() => setShowCfm(v => !v)}>
                  <EyeIcon open={showCfm} />
                </button>
              </div>
              <FieldError msg={r2Err.confirm} />
            </div>

            <div className="auth-agree">
              <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <label htmlFor="agree" className={r2Err.agreed ? 'auth-agree--err' : ''}>
                I agree to the Terms &amp; Conditions and Privacy Policy.
              </label>
            </div>
            {r2Err.agreed && <p className="auth-field__err">{r2Err.agreed}</p>}
            {regApiErr && <p className="auth-api-err">{regApiErr}</p>}

            <div className="auth-btn-row">
              <button type="button" className="auth-btn auth-btn--outline" onClick={() => setView('login')}>Maybe later</button>
              <button type="submit" className="auth-btn auth-btn--primary" disabled={regLoading}>
                {regLoading ? 'กำลังสมัคร...' : 'Register'}
              </button>
            </div>
          </form>
          <p className="auth-link-row">
            Already have an account?{' '}
            <button className="auth-link" onClick={() => setView('login')}>Login</button>
          </p>
        </div>
      </div>
      <Footer data={c.footer} />
    </>
  );
}

export const AUTH_CSS = `
.auth-page {
  min-height: calc(100vh - 64px);
  padding-top: 64px;
  background: #dde5e0;
  display: flex; align-items: center; justify-content: center;
  padding-left: 1rem; padding-right: 1rem;
  padding-bottom: 3rem;
}
.auth-card {
  background: var(--white);
  border-radius: 16px;
  padding: 2.5rem 2.8rem;
  width: 100%; max-width: 460px;
  box-shadow: 0 4px 24px rgba(0,0,0,.08);
  margin: 2rem 0;
}
.auth-card--wide { max-width: 560px; }
.auth-title {
  font-size: 1.6rem; font-weight: 700;
  text-align: center; margin-bottom: 1.8rem;
  color: var(--text);
}

/* Tabs */
.auth-tabs {
  display: flex; border-radius: 8px; overflow: hidden;
  border: 1.5px solid var(--forest);
  margin-bottom: 1.6rem;
}
.auth-tab {
  flex: 1; padding: .6rem 0;
  background: none; border: none; cursor: pointer;
  font-size: .9rem; font-weight: 500;
  color: var(--forest); transition: all .2s;
  font-family: var(--font-th);
}
.auth-tab--active { background: var(--forest); color: var(--white); }

/* Fields */
.auth-field { margin-bottom: 1.1rem; }
.auth-field__label {
  display: block; font-size: .88rem; font-weight: 500;
  color: var(--text); margin-bottom: .4rem;
}
.auth-input, .auth-select {
  width: 100%; padding: .65rem .9rem;
  border: 1.5px solid #d5d5d5; border-radius: 8px;
  font-size: .9rem; font-family: var(--font-th);
  background: var(--white); color: var(--text);
  outline: none; transition: border .2s;
}
.auth-input:focus, .auth-select:focus { border-color: var(--forest); }
.auth-input--err { border-color: #e53935 !important; }
.auth-field__err {
  margin-top: .3rem; font-size: .78rem;
  color: #e53935; font-family: var(--font-th);
}
.auth-api-err {
  text-align: center; font-size: .83rem;
  color: #e53935; margin-bottom: .8rem;
  font-family: var(--font-th);
}

/* Password */
.auth-pw-wrap { position: relative; }
.auth-pw-wrap .auth-input { padding-right: 2.8rem; }
.auth-pw-eye {
  position: absolute; right: .75rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: #aaa; display: flex; align-items: center;
}

/* Birthdate 3-column */
.auth-date-row {
  display: grid; grid-template-columns: 1fr 2fr 1.5fr;
  gap: .5rem;
}

/* Agree */
.auth-agree {
  display: flex; align-items: flex-start; gap: .6rem;
  margin-bottom: 1.2rem; margin-top: .3rem;
}
.auth-agree input[type=checkbox] { margin-top: .2rem; accent-color: var(--forest); }
.auth-agree label { font-size: .82rem; color: #555; font-family: var(--font-th); cursor: pointer; line-height: 1.5; }
.auth-agree--err { color: #e53935 !important; }

/* Buttons */
.auth-btn {
  padding: .7rem 2rem; border-radius: 50px;
  font-size: .95rem; font-weight: 600; cursor: pointer;
  border: none; transition: all .2s;
  font-family: var(--font-th);
}
.auth-btn--primary {
  background: var(--forest); color: var(--white);
}
.auth-btn--primary:hover:not(:disabled) { background: #1a3d2e; }
.auth-btn--primary:disabled { opacity: .6; cursor: default; }
.auth-btn--outline {
  background: none; border: 1.5px solid var(--forest);
  color: var(--forest);
}
.auth-btn--outline:hover { background: #f0f5f2; }
.auth-btn--full { width: 100%; margin-top: .5rem; }
.auth-btn-row {
  display: flex; gap: 1rem; justify-content: center;
  margin-top: 1.4rem;
}
.auth-link-row {
  text-align: center; margin-top: 1.2rem;
  font-size: .85rem; color: #666;
}
.auth-link {
  background: none; border: none; cursor: pointer;
  color: var(--forest); font-weight: 600; font-size: .85rem;
  text-decoration: underline;
}
`;
