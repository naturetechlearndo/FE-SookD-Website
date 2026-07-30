import { useState } from 'react';
import { api } from '../services/api';
import Footer from './Footer';
import { SITE_CONTENT as c } from '../constants/content';

type AuthView = 'login' | 'reg1' | 'reg2' | 'forgot' | 'reset';

interface Props {
  onBack: () => void;
  onLoginSuccess?: (user: any) => void;
  initialView?: AuthView;
  initialResetToken?: string;
  lang?: 'TH' | 'ENG';
}

const MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="auth-field__err">{msg}</p>;
}

export default function AuthPage({ onBack, onLoginSuccess, initialView = 'login', initialResetToken = '', lang = 'TH' }: Props) {
  const isTH = lang === 'TH';
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
    user_name: '', first_name: '', last_name: '', phone_number: '', address: '', gender: '',
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
  const [regSuccess, setRegSuccess] = useState(false);

  /* ── Forgot password state ── */
  const [fpEmail, setFpEmail] = useState('');
  const [fpErrs, setFpErrs] = useState<Record<string, string>>({});
  const [fpLoading, setFpLoading] = useState(false);
  const [fpApiErr, setFpApiErr] = useState('');
  const [fpSent, setFpSent] = useState(false);
  /* ── Reset password state ── */
  const [resetToken] = useState(initialResetToken);
  const [rpNewPw, setRpNewPw] = useState('');
  const [rpConfirm, setRpConfirm] = useState('');
  const [rpShowPw, setRpShowPw] = useState(false);
  const [rpShowCfm, setRpShowCfm] = useState(false);
  const [rpErrs, setRpErrs] = useState<Record<string, string>>({});
  const [rpLoading, setRpLoading] = useState(false);
  const [rpApiErr, setRpApiErr] = useState('');
  const [fpSuccess, setFpSuccess] = useState(false);

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
      if (res.success) { (window as any).gtag?.('event', 'login', { method: 'email' }); onLoginSuccess?.(res.user); onBack(); }
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
      user_name: r2.username,
      password: r2.password,
    };
    console.log("body",body);
    try {
      const res = await api.auth.register(body);
      if (res.success) {
        (window as any).gtag?.('event', 'sign_up', { method: 'email' });
        setRegSuccess(true);
        setView('login');
      } else {
        setRegApiErr(res.message ?? 'สมัครสมาชิกไม่สำเร็จ');
      }
    } catch {
      setRegApiErr('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setRegLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!fpEmail.trim()) errs.email = isTH ? 'กรุณากรอกข้อมูลในช่องว่าง' : 'Please fill in this field';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fpEmail)) errs.email = isTH ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'Invalid email format';
    setFpErrs(errs);
    if (Object.keys(errs).length > 0) return;
    setFpLoading(true);
    setFpApiErr('');
    try {
      const res = await api.auth.requestPasswordReset({ email: fpEmail });
      if (res.success) {
        setFpSent(true);
      } else {
        setFpApiErr(res.message ?? (isTH ? 'ไม่พบบัญชีที่ใช้อีเมลนี้' : 'No account found with this email'));
      }
    } catch {
      setFpApiErr(isTH ? 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' : 'Cannot connect to server');
    } finally {
      setFpLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!rpNewPw) errs.newPw = isTH ? 'กรุณากรอกข้อมูลในช่องว่าง' : 'Please fill in this field';
    if (!rpConfirm) errs.confirm = isTH ? 'กรุณากรอกข้อมูลในช่องว่าง' : 'Please fill in this field';
    else if (rpNewPw && rpConfirm !== rpNewPw) errs.confirm = isTH ? 'รหัสผ่านไม่ตรงกัน' : 'Passwords do not match';
    setRpErrs(errs);
    if (Object.keys(errs).length > 0) return;
    setRpLoading(true);
    setRpApiErr('');
    try {
      const res = await api.auth.resetPassword({ token: resetToken, new_password: rpNewPw });
      if (res.success) {
        setFpSuccess(true);
        setView('login');
        /* ล้าง token ออกจาก URL โดยไม่ reload */
        window.history.replaceState({ page: 'login' }, '', window.location.pathname);
      } else {
        setRpApiErr(res.message ?? (isTH ? 'ลิงก์หมดอายุหรือไม่ถูกต้อง' : 'Link has expired or is invalid'));
      }
    } catch {
      setRpApiErr(isTH ? 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' : 'Cannot connect to server');
    } finally {
      setRpLoading(false);
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
          <h1 className="auth-title">{isTH ? 'เข้าสู่ระบบ' : 'Login'}</h1>
          {regSuccess && (
            <div className="auth-reg-success-banner">
              <span className="auth-reg-success-banner__icon">✓</span>
              <div>
                <p className="auth-reg-success-banner__title">{isTH ? 'สมัครสมาชิกสำเร็จ!' : 'Registration successful!'}</p>
                <p className="auth-reg-success-banner__sub">{isTH ? 'กรุณารอประมาณ 1 นาที เพื่อให้ระบบอัปเดตข้อมูล จากนั้นจึงจะสามารถเข้าสู่ระบบ (Login) ได้ครับ/ค่ะ' : 'Please wait approximately 1 minute for the system to update, then you can log in.'}</p>
              </div>
            </div>
          )}
          {fpSuccess && (
            <div className="auth-reg-success-banner">
              <span className="auth-reg-success-banner__icon">⏳</span>
              <div>
                <p className="auth-reg-success-banner__title">{isTH ? 'กำลังอัปเดทรหัสผ่าน' : 'Updating your password'}</p>
                <p className="auth-reg-success-banner__sub">{isTH ? 'กรุณารอประมาณ 1 นาที เพื่อให้ระบบอัปเดตข้อมูล จากนั้นจึงจะสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้' : 'Please wait approximately 1 minute for the system to update, then you can log in with your new password.'}</p>
              </div>
            </div>
          )}
          <form onSubmit={handleLogin} noValidate>
            <div className="auth-field">
              <label className="auth-field__label">{isTH ? 'อีเมลล์' : 'Email'}</label>
              <input
                className={`auth-input${loginErrs.email ? ' auth-input--err' : ''}`}
                type="email" placeholder="example@gmail.com"
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
              />
              <FieldError msg={loginErrs.email} />
            </div>
            <div className="auth-field">
              <label className="auth-field__label">{isTH ? 'รหัสผ่าน' : 'Password'}</label>
              <div className="auth-pw-wrap">
                <input
                  className={`auth-input${loginErrs.password ? ' auth-input--err' : ''}`}
                  type={loginShowPw ? 'text' : 'password'}
                  placeholder={isTH ? 'กรอกรหัสผ่าน' : 'Enter your password'}
                  value={loginPass} onChange={e => setLoginPass(e.target.value)}
                />
                <button type="button" className="auth-pw-eye" onClick={() => setLoginShowPw(v => !v)}>
                  <EyeIcon open={loginShowPw} />
                </button>
              </div>
              <FieldError msg={loginErrs.password} />
            </div>
            <div style={{ textAlign: 'right', marginTop: '-.4rem', marginBottom: '.8rem' }}>
              <button type="button" className="auth-link" onClick={() => { setFpSuccess(false); setFpEmail(''); setFpSent(false); setFpErrs({}); setFpApiErr(''); setView('forgot'); }}>
                {isTH ? 'ลืมรหัสผ่าน?' : 'Forgot password?'}
              </button>
            </div>
            {loginApiErr && <p className="auth-api-err">{loginApiErr}</p>}
            <button className="auth-btn auth-btn--primary auth-btn--full" type="submit" disabled={loginLoading}>
              {loginLoading ? 'กำลังเข้าสู่ระบบ...' : (isTH ? 'เข้าสู่ระบบ' : 'Login')}
            </button>
          </form>
          <p className="auth-link-row">
            {isTH ? 'ยังไม่มีบัญชีสมาชิก?' : "Don't have an account?"}{' '}
            <button className="auth-link" onClick={() => {
              (window as any).gtag?.('event', 'click_register_link');
              setUserType('individual');
              setR1({ user_name: '', first_name: '', last_name: '', phone_number: '', address: '', gender: '', bd_day: '', bd_month: '', bd_year: '', legal_entity_name: '', business_registration_number: '', business_type: '' });
              setR2({ email: '', username: '', password: '', confirm: '' });
              setR1Err({}); setR2Err({}); setAgreed(false);
              setView('reg1');
            }}>{isTH ? 'สมัครสมาชิก' : 'Register'}</button>
          </p>
        </div>
      </div>
      <Footer data={c.footer[lang]} />
    </>
  );

  if (view === 'reg1') return (
    <>
      <div className="auth-page">
        <div className="auth-card auth-card--wide">
          <h1 className="auth-title">{isTH ? 'สมัครสมาชิก' : 'Register'}</h1>

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab${userType === 'individual' ? ' auth-tab--active' : ''}`}
              onClick={() => { (window as any).gtag?.('event', 'select_account_type', { type: 'individual' }); setUserType('individual'); setR1Err({}); }}>{isTH ? 'บุคคลธรรมดา' : 'Individual'}</button>
            <button className={`auth-tab${userType === 'legal_entity' ? ' auth-tab--active' : ''}`}
              onClick={() => { (window as any).gtag?.('event', 'select_account_type', { type: 'legal_entity' }); setUserType('legal_entity'); setR1Err({}); }}>{isTH ? 'นิติบุคคล' : 'Legal Entity'}</button>
          </div>

          {userType === 'individual' ? (
            <>
              {field(isTH ? 'ชื่อ' : 'Name', 'first_name', r1.first_name, v => setR1({ ...r1, first_name: v }), r1Err, { placeholder: isTH ? 'กรอกชื่อ' : 'Enter your name' })}
              {field(isTH ? 'นามสกุล' : 'Surname', 'last_name', r1.last_name, v => setR1({ ...r1, last_name: v }), r1Err, { placeholder: isTH ? 'กรอกนามสกุล' : 'Enter your surname' })}
              {field(isTH ? 'เบอร์โทรศัพท์' : 'Phone Number', 'phone_number', r1.phone_number, v => setR1({ ...r1, phone_number: v }), r1Err, { placeholder: 'e.g. 0123456789' })}
              {field(isTH ? 'ที่อยู่จัดส่ง' : 'Shipping Address', 'address', r1.address, v => setR1({ ...r1, address: v }), r1Err, { placeholder: isTH ? 'กรอกที่อยู่จัดส่ง' : 'Enter your shipping address' })}
              {selectField(isTH ? 'เพศ' : 'Gender', 'gender', r1.gender, v => setR1({ ...r1, gender: v }), r1Err,
                isTH ? ['ชาย', 'หญิง', 'อื่นๆ'] : ['Male', 'Female', 'Other'],
                isTH ? 'เลือกเพศ' : 'Select your gender')}

              {/* Birthdate: day / month / year */}
              <div className="auth-field">
                <label className="auth-field__label">{isTH ? 'วันเกิด' : 'Birthdate'}</label>
                <div className="auth-date-row">
                  <select
                    className={`auth-select${r1Err.bd_day ? ' auth-input--err' : ''}`}
                    value={r1.bd_day}
                    onChange={e => setR1({ ...r1, bd_day: e.target.value })}
                  >
                    <option value="">{isTH ? 'วัน' : 'Day'}</option>
                    {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(d =>
                      <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select
                    className={`auth-select${r1Err.bd_month ? ' auth-input--err' : ''}`}
                    value={r1.bd_month}
                    onChange={e => setR1({ ...r1, bd_month: e.target.value })}
                  >
                    <option value="">{isTH ? 'เดือน' : 'Month'}</option>
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
                    <option value="">{isTH ? 'ปี' : 'Year'}</option>
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
              {field(isTH ? 'ชื่อนิติบุคคล' : 'Legal Entity Name', 'legal_entity_name', r1.legal_entity_name, v => setR1({ ...r1, legal_entity_name: v }), r1Err, { placeholder: isTH ? 'กรอกชื่อนิติบุคคล' : 'Enter your legal entity name' })}
              {field(isTH ? 'เลขทะเบียนธุรกิจ' : 'Business Registration Number', 'business_registration_number', r1.business_registration_number, v => setR1({ ...r1, business_registration_number: v }), r1Err, { placeholder: 'e.g. 0123456789123' })}
              {field(isTH ? 'เบอร์โทรศัพท์' : 'Phone Number', 'phone_number', r1.phone_number, v => setR1({ ...r1, phone_number: v }), r1Err, { placeholder: 'e.g. 0123456789' })}
              {field(isTH ? 'ที่อยู่บริษัท' : 'Company Address', 'address', r1.address, v => setR1({ ...r1, address: v }), r1Err, { placeholder: isTH ? 'กรอกที่อยู่บริษัท' : 'Enter your company address' })}
              {selectField(isTH ? 'ประเภทธุรกิจ' : 'Business Type', 'business_type', r1.business_type, v => setR1({ ...r1, business_type: v }), r1Err,
                isTH ? ['ร้านค้าบุคคลธรรมดา', 'ห้างหุ้นส่วน', 'บริษัทจำกัด', 'บริษัทมหาชน', 'อื่นๆ'] : ['Sole Proprietorship', 'Partnership', 'Company Limited', 'Public Company', 'Other'],
                isTH ? 'เลือกประเภทธุรกิจ' : 'Select your business type')}
            </>
          )}

          <div className="auth-btn-row">
            <button className="auth-btn auth-btn--outline" onClick={() => { (window as any).gtag?.('event', 'click_skip_registration', { step: 1 }); setView('login'); }}>{isTH ? 'ไว้ทีหลัง' : 'Maybe later'}</button>
            <button className="auth-btn auth-btn--primary" onClick={() => { if (validateR1()) { (window as any).gtag?.('event', 'sign_up_progress', { step: 1, funnel_name: 'sign_up' }); setView('reg2'); } }}>{isTH ? 'ถัดไป' : 'Next'}</button>
          </div>
          <p className="auth-link-row">
            {isTH ? 'มีบัญชีอยู่แล้ว?' : 'Already have an account?'}{' '}
            <button className="auth-link" onClick={() => { (window as any).gtag?.('event', 'click_login_link'); setView('login'); }}>{isTH ? 'เข้าสู่ระบบ' : 'Login'}</button>
          </p>
        </div>
      </div>
      <Footer data={c.footer[lang]} />
    </>
  );

  if (view === 'forgot') return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">{isTH ? 'ลืมรหัสผ่าน' : 'Forgot Password'}</h1>
          {fpSent ? (
            <div className="auth-reg-success-banner">
              <span className="auth-reg-success-banner__icon">✉</span>
              <div>
                <p className="auth-reg-success-banner__title">{isTH ? 'ส่งลิงก์เรียบร้อยแล้ว!' : 'Link sent!'}</p>
                <p className="auth-reg-success-banner__sub">
                  {isTH
                    ? `เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง ${fpEmail} กรุณาตรวจสอบอีเมลและกดลิงก์เพื่อตั้งรหัสผ่านใหม่`
                    : `We've sent a password reset link to ${fpEmail}. Please check your email and click the link to set a new password.`}
                </p>
              </div>
            </div>
          ) : (
            <>
              <p style={{ textAlign: 'center', fontSize: '.88rem', color: '#666', marginBottom: '1.4rem', lineHeight: 1.55 }}>
                {isTH ? 'กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้' : 'Enter your registered email and we\'ll send you a password reset link.'}
              </p>
              <form onSubmit={handleForgotPassword} noValidate>
                <div className="auth-field">
                  <label className="auth-field__label">{isTH ? 'อีเมลล์' : 'Email'}</label>
                  <input className={`auth-input${fpErrs.email ? ' auth-input--err' : ''}`}
                    type="email" placeholder="example@gmail.com"
                    value={fpEmail} onChange={e => setFpEmail(e.target.value)} />
                  <FieldError msg={fpErrs.email} />
                </div>
                {fpApiErr && <p className="auth-api-err">{fpApiErr}</p>}
                <button className="auth-btn auth-btn--primary auth-btn--full" type="submit" disabled={fpLoading}>
                  {fpLoading ? (isTH ? 'กำลังส่ง...' : 'Sending...') : (isTH ? 'ส่งลิงก์รีเซ็ตรหัสผ่าน' : 'Send Reset Link')}
                </button>
              </form>
            </>
          )}
          <p className="auth-link-row">
            <button className="auth-link" onClick={() => setView('login')}>
              {isTH ? '← กลับไปเข้าสู่ระบบ' : '← Back to login'}
            </button>
          </p>
        </div>
      </div>
      <Footer data={c.footer[lang]} />
    </>
  );

  if (view === 'reset') return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">{isTH ? 'ตั้งรหัสผ่านใหม่' : 'Set New Password'}</h1>
          <form onSubmit={handleResetPassword} noValidate>
            <div className="auth-field">
              <label className="auth-field__label">{isTH ? 'รหัสผ่านใหม่' : 'New Password'}</label>
              <div className="auth-pw-wrap">
                <input className={`auth-input${rpErrs.newPw ? ' auth-input--err' : ''}`}
                  type={rpShowPw ? 'text' : 'password'}
                  placeholder={isTH ? 'กรอกรหัสผ่านใหม่' : 'Enter new password'}
                  value={rpNewPw} onChange={e => setRpNewPw(e.target.value)} />
                <button type="button" className="auth-pw-eye" onClick={() => setRpShowPw(v => !v)}>
                  <EyeIcon open={rpShowPw} />
                </button>
              </div>
              <FieldError msg={rpErrs.newPw} />
            </div>
            <div className="auth-field">
              <label className="auth-field__label">{isTH ? 'ยืนยันรหัสผ่านใหม่' : 'Confirm New Password'}</label>
              <div className="auth-pw-wrap">
                <input className={`auth-input${rpErrs.confirm ? ' auth-input--err' : ''}`}
                  type={rpShowCfm ? 'text' : 'password'}
                  placeholder={isTH ? 'กรอกรหัสผ่านอีกครั้ง' : 'Confirm your new password'}
                  value={rpConfirm} onChange={e => setRpConfirm(e.target.value)} />
                <button type="button" className="auth-pw-eye" onClick={() => setRpShowCfm(v => !v)}>
                  <EyeIcon open={rpShowCfm} />
                </button>
              </div>
              <FieldError msg={rpErrs.confirm} />
            </div>
            {rpApiErr && <p className="auth-api-err">{rpApiErr}</p>}
            <button className="auth-btn auth-btn--primary auth-btn--full" type="submit" disabled={rpLoading}>
              {rpLoading ? (isTH ? 'กำลังบันทึก...' : 'Saving...') : (isTH ? 'บันทึกรหัสผ่านใหม่' : 'Save New Password')}
            </button>
          </form>
        </div>
      </div>
      <Footer data={c.footer[lang]} />
    </>
  );

  /* reg2 */
  return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">{isTH ? 'สมัครสมาชิก' : 'Register'}</h1>
          <form onSubmit={handleRegister} noValidate>
            <div className="auth-field">
              <label className="auth-field__label">{isTH ? 'อีเมลล์' : 'Email'}</label>
              <input className={`auth-input${r2Err.email ? ' auth-input--err' : ''}`}
                type="email" placeholder="example@gmail.com"
                value={r2.email} onChange={e => setR2({ ...r2, email: e.target.value })} />
              <FieldError msg={r2Err.email} />
            </div>
            <div className="auth-field">
              <label className="auth-field__label">{isTH ? 'ชื่อผู้ใช้' : 'Username'}</label>
              <input className={`auth-input${r2Err.username ? ' auth-input--err' : ''}`}
                placeholder={isTH ? 'กรอกชื่อผู้ใช้' : 'Enter your username'}
                value={r2.username} onChange={e => setR2({ ...r2, username: e.target.value })} />
              <FieldError msg={r2Err.username} />
            </div>
            <div className="auth-field">
              <label className="auth-field__label">{isTH ? 'รหัสผ่าน' : 'Password'}</label>
              <div className="auth-pw-wrap">
                <input className={`auth-input${r2Err.password ? ' auth-input--err' : ''}`}
                  type={showPw ? 'text' : 'password'} placeholder={isTH ? 'กรอกรหัสผ่าน' : 'Enter your password'}
                  value={r2.password} onChange={e => setR2({ ...r2, password: e.target.value })} />
                <button type="button" className="auth-pw-eye" onClick={() => setShowPw(v => !v)}>
                  <EyeIcon open={showPw} />
                </button>
              </div>
              <FieldError msg={r2Err.password} />
            </div>
            <div className="auth-field">
              <label className="auth-field__label">{isTH ? 'ยืนยันรหัสผ่าน' : 'Confirm Password'}</label>
              <div className="auth-pw-wrap">
                <input className={`auth-input${r2Err.confirm ? ' auth-input--err' : ''}`}
                  type={showCfm ? 'text' : 'password'} placeholder={isTH ? 'กรอกรหัสผ่านอีกครั้ง' : 'Confirm your password'}
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
                {isTH ? 'ฉันยอมรับข้อกำหนดและเงื่อนไข และนโยบายความเป็นส่วนตัว' : 'I agree to the Terms & Conditions and Privacy Policy.'}
              </label>
            </div>
            {r2Err.agreed && <p className="auth-field__err">{r2Err.agreed}</p>}
            {regApiErr && <p className="auth-api-err">{regApiErr}</p>}

            <div className="auth-btn-row">
              <button type="button" className="auth-btn auth-btn--outline" onClick={() => { (window as any).gtag?.('event', 'click_skip_registration', { step: 2 }); setView('login'); }}>{isTH ? 'ไว้ทีหลัง' : 'Maybe later'}</button>
              <button type="submit" className="auth-btn auth-btn--primary" disabled={regLoading}>
                {regLoading ? 'กำลังสมัคร...' : (isTH ? 'สมัครสมาชิก' : 'Register')}
              </button>
            </div>
          </form>
          <p className="auth-link-row">
            {isTH ? 'มีบัญชีอยู่แล้ว?' : 'Already have an account?'}{' '}
            <button className="auth-link" onClick={() => { (window as any).gtag?.('event', 'click_login_link'); setView('login'); }}>{isTH ? 'เข้าสู่ระบบ' : 'Login'}</button>
          </p>
        </div>
      </div>
      <Footer data={c.footer[lang]} />
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
.auth-reg-success-banner {
  display: flex; align-items: flex-start; gap: .75rem;
  background: #e8f5e9; border: 1.5px solid #4caf50;
  border-radius: 10px; padding: .9rem 1rem;
  margin-bottom: 1.2rem;
}
.auth-reg-success-banner__icon {
  flex-shrink: 0; width: 24px; height: 24px;
  background: #4caf50; color: #fff;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: .85rem; font-weight: 700; margin-top: .05rem;
}
.auth-reg-success-banner__title {
  font-size: .92rem; font-weight: 700; color: #2e7d32;
  margin: 0 0 .25rem; font-family: var(--font-th);
}
.auth-reg-success-banner__sub {
  font-size: .8rem; color: #388e3c; margin: 0;
  line-height: 1.55; font-family: var(--font-th);
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
.auth-pw-wrap input::-ms-reveal,
.auth-pw-wrap input::-ms-clear { display: none; }
.auth-pw-wrap input::-webkit-credentials-auto-fill-button { display: none; }

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
  font: inherit;
}
`;
