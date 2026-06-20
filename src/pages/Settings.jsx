import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCamera, faXmark, faSpinner, faCheck, faTrash, faEye, faEyeSlash, faWater
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

/* ── Modal de Confirmação de Excluir ── */
const DeleteModal = ({ onClose, onConfirm, loading }) => {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={e => e.stopPropagation()}>
        <button className="settings-modal-close" onClick={onClose}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
        <h3 className="settings-modal-title">Are you sure?</h3>
        <p className="settings-modal-text">
          This action is <strong>irreversible</strong>. An email will be sent with a verification link.
          When you access the link, your account will be permanently deleted.
        </p>
        <p className="settings-modal-text">Confirm your password to continue:</p>

        <div className="settings-pwd-input-container" style={{ marginBottom: 24 }}>
          <div className="settings-input-wrapper">
            <input
              type={show ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ paddingRight: 36 }}
            />
          </div>
          <button type="button" onClick={() => setShow(v => !v)} className="settings-pwd-eye">
            <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
          </button>
        </div>

        <div className="settings-modal-actions">
          <button onClick={onClose} className="settings-modal-btn-cancel">Cancel</button>
          <button
            onClick={() => onConfirm(password)}
            disabled={!password || loading}
            className="settings-modal-btn-danger"
            style={{ cursor: password && !loading ? 'pointer' : 'not-allowed', opacity: !password || loading ? 0.6 : 1 }}
          >
            {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Enviar email'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Componente Principal ── */
const Settings = () => {
  const navigate = useNavigate();
  const bannerRef = useRef(null);
  const picRef = useRef(null);

  // lê o utilizador do localStorage para ter o id
  const storedUser = JSON.parse(localStorage.getItem('@Lanuia:user') || 'null');

  const [form, setForm] = useState({
    name: storedUser?.name || '',
    nick: storedUser?.nick || '',
    bio: storedUser?.bio || '',
  });

  const [bannerPreview, setBannerPreview] = useState(storedUser?.profilebanner || null);
  const [picPreview, setPicPreview]       = useState(storedUser?.profilepic    || null);
  const [bannerFile, setBannerFile]       = useState(null);
  const [picFile, setPicFile]             = useState(null);

  const [pwdForm, setPwdForm]   = useState({ current: '', newPwd: '', confirm: '' });
  const [showPwd, setShowPwd]   = useState({ current: false, newPwd: false, confirm: false });
  const [changingPwd, setChangingPwd] = useState(false);

  const [saving, setSaving]         = useState(false);
  const [feedback, setFeedback]     = useState(null); // { type: 'success'|'error', msg }
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Carrega dados frescos usando o id do utilizador (rota GET /users/:id já existe)
  useEffect(() => {
    const id = storedUser?.id;
    if (!id) return;
    api.get(`/users/${id}`)
      .then(res => {
        const u = res.data;
        setForm({ name: u.name || '', nick: u.nick || '', bio: u.bio || '' });
        setBannerPreview(u.profilebanner || null);
        setPicPreview(u.profilepic || null);
      })
      .catch(err => console.error('Error while loading profile:', err));
  }, []);

  const handleImageChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'banner') { setBannerPreview(url); setBannerFile(file); }
    else                   { setPicPreview(url);    setPicFile(file);    }
  };

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      if (!form.name.trim()) return setFeedback({ type: 'error', msg: 'Your username cannot be empty.' });
      if (!form.nick.trim()) return setFeedback({ type: 'error', msg: 'Your nickname cannot be empty.' });

      const payload = {
        name: form.name.trim(),
        nick: form.nick.trim(),
        bio:  form.bio.trim(),
      };

      if (picFile)    payload.profilepic    = await toBase64(picFile);
      if (bannerFile) payload.profilebanner = await toBase64(bannerFile);

      if (changingPwd) {
        if (!pwdForm.current)            return setFeedback({ type: 'error', msg: 'Insert your current password.' });
        if (pwdForm.newPwd.length < 8)   return setFeedback({ type: 'error', msg: 'Your passwords must have at least 8 characters.' });
        if (pwdForm.newPwd !== pwdForm.confirm) return setFeedback({ type: 'error', msg: 'Passwords do not match.' });
        payload.currentPassword = pwdForm.current;
        payload.newPassword     = pwdForm.newPwd;
      }

      const res     = await api.patch('/users/me', payload);
      const updated = res.data;

      // sincroniza localStorage com os novos dados
      localStorage.setItem('@Lanuia:user', JSON.stringify({ ...storedUser, ...updated }));

      setFeedback({ type: 'success', msg: 'Changes saved successfully!' });
      setPwdForm({ current: '', newPwd: '', confirm: '' });
      setChangingPwd(false);
      setBannerFile(null);
      setPicFile(null);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error while saving changes.';
      setFeedback({ type: 'error', msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = async (password) => {
    setDeleteLoading(true);
    try {
      await api.post('/users/me/delete-request', { password });
      setShowDelete(false);
      setFeedback({ type: 'success', msg: 'Email sent! Verify your inbox.' });
    } catch (err) {
      const msg = err.response?.data?.error || 'Error while proccessing order.';
      setFeedback({ type: 'error', msg });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="feed">
        <div className="feed-container" style={{ paddingBottom: 40 }}>

          {/* Feedback */}
          {feedback && (
            <div
              className={feedback.type === 'success' ? 'success-box' : 'warning-banner'}
              style={{ marginTop: 20, borderRadius: 12 }}
            >
              <FontAwesomeIcon icon={feedback.type === 'success' ? faCheck : faXmark} style={{ marginRight: 8 }} />
              {feedback.msg}
            </div>
          )}

          &nbsp;
          <h1 className="shelf-title">
            Definições de Perfil
          </h1>
          &nbsp;

          {/* Card principal */}
          <div className="settings-post-card post-card">

            {/* ── Banner ── */}
            <div className="settings-group">
              <label className="settings-label">Profile Banner</label>
              <div onClick={() => bannerRef.current?.click()} className="settings-banner-uploader">
                {bannerPreview
                  ? <img src={bannerPreview} alt="banner" />
                  : <span className="settings-banner-placeholder"><FontAwesomeIcon icon={faCamera} /> Click to add banner</span>
                }
                <div className="settings-banner-badge">
                  <FontAwesomeIcon icon={faCamera} /> Change
                </div>
              </div>
              <input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageChange(e, 'banner')} />
              {bannerPreview && (
                <button onClick={() => { setBannerPreview(null); setBannerFile(null); }} className="settings-clear-btn">
                  <FontAwesomeIcon icon={faXmark} /> Remove banner
                </button>
              )}
            </div>

            {/* ── Foto de Perfil ── */}
            <div className="settings-avatar-row">
              <div onClick={() => picRef.current?.click()} className="settings-avatar-clickable profile-avatar">
                {picPreview
                  ? <img src={picPreview} alt="avatar" />
                  : (form.name?.[0]?.toUpperCase() || 'U')
                }
                <div className="settings-avatar-overlay">
                  <FontAwesomeIcon icon={faCamera} style={{ color: 'white', fontSize: 20 }} />
                </div>
              </div>
              <div>
                <label className="settings-label">Profile picture</label>
                <p className="settings-avatar-subtext">Click on the avatar to change it</p>
                {picPreview && (
                  <button onClick={() => { setPicPreview(null); setPicFile(null); }} className="settings-clear-btn">
                    <FontAwesomeIcon icon={faXmark} /> Remove photo
                  </button>
                )}
              </div>
              <input ref={picRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageChange(e, 'pic')} />
            </div>

            {/* ── Nome ── */}
            <div className="settings-group">
              <label className="settings-label">Name</label>
              <div className="settings-input-wrapper">
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                />
              </div>
            </div>

            {/* ── Nick ── */}
            <div className="settings-group">
              <label className="settings-label">Nick</label>
              <div className="settings-input-wrapper">
                <span className="settings-input-prefix">@</span>
                <input
                  value={form.nick}
                  onChange={e => setForm(f => ({ ...f, nick: e.target.value }))}
                  placeholder="o_teu_nick"
                />
              </div>
            </div>

            {/* ── Bio ── */}
            <div className="settings-group">
              <label className="settings-label">Bio</label>
              <div className="settings-input-wrapper" style={{ height: 'auto' }}>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  maxLength={300}
                  rows={4}
                  placeholder="Tell us something funny about you."
                />
              </div>
              <p className="settings-bio-counter">{form.bio.length}/300</p>
            </div>

            {/* ── Password (opcional) ── */}
            <div className="settings-group">
              <div className="settings-pwd-header">
                <label className="settings-label">Password</label>
                <span
                  onClick={() => setChangingPwd(v => !v)}
                  className="settings-pwd-toggle-btn post-tag"
                >
                  {changingPwd ? 'Cancel' : 'Change password'}
                </span>
              </div>

              {changingPwd && (
                <div className="settings-pwd-fields">
                  {[
                    { key: 'current', label: 'Current password' },
                    { key: 'newPwd',  label: 'New password' },
                    { key: 'confirm', label: 'Repeat new password' },
                  ].map(({ key, label }) => (
                    <div key={key} className="settings-pwd-input-container">
                      <div className="settings-input-wrapper">
                        <input
                          type={showPwd[key] ? 'text' : 'password'}
                          placeholder={label}
                          value={pwdForm[key]}
                          onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))}
                          style={{ paddingRight: 36 }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPwd(s => ({ ...s, [key]: !s[key] }))}
                        className="settings-pwd-eye"
                      >
                        <FontAwesomeIcon icon={showPwd[key] ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Botões ── */}
            <div className="settings-actions-footer">
              <button
                onClick={handleSave}
                disabled={saving}
                className="settings-save-btn create-post-btn"
              >
                {saving ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Save changes'}
              </button>

              <button
                onClick={() => setShowDelete(true)}
                className="settings-delete-trigger-btn"
              >
                <FontAwesomeIcon icon={faTrash} /> Delete account
              </button>
            </div>

          </div>
        </div>
      </main>

      {showDelete && (
        <DeleteModal
          onClose={() => setShowDelete(false)}
          onConfirm={handleDeleteRequest}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default Settings;