import Appointments from './Appointments';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import Billing from './billing';
import PatientBookAppointment from './PatientBookAppointment';
import PatientAI from './PatientAI';
import PatientMedicineInformation from './PatientMedicineInformation';
import {
  LanguageProvider,
  useLanguage
} from './LanguageContext.jsx';

const API = 'http://localhost:4000/api';

// =====================================================
// AUTH HELPERS
// =====================================================

const token = () => sessionStorage.getItem('token') || '';

const user = () => JSON.parse(sessionStorage.getItem('user') || 'null');
// =====================================================
// API HELPER
// =====================================================

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token()) {
    headers.Authorization = 'Bearer ' + token();
  }

  const response = await fetch(API + path, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw Error(data.message || 'Request failed');
  }

  return data;
}
async function uploadProfilePicture(file) {
  const formData = new FormData();
  formData.append('profile', file);

  const response = await fetch(`${API}/patient/profile-picture`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token(),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Profile picture upload failed.');
  }

  return data;
}
// =====================================================
// LOGIN
// =====================================================



function Login({ done }) {
  const [isRegister, setIsRegister] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  // Patient Registration
  const [isPatientRegister, setIsPatientRegister] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isRegister) return;

    api('/public/departments')
      .then(setDepartments)
      .catch((err) => setError(err.message));
  }, [isRegister]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isRegister || isPatientRegister) {
        if (password.length < 8) {
          throw Error('Password must be at least 8 characters.');
        }

        if (password !== confirmPassword) {
          throw Error('Passwords do not match.');
        }

        
const result = await api(
  isPatientRegister
    ? '/auth/register-patient'
    : '/auth/register',
  {
    method: 'POST',
    body: JSON.stringify(
      isPatientRegister
        ? {
            full_name: fullName.trim(),
            email: email.trim().toLowerCase(),
            password,
            birth_date: birthDate || null,
            sex: sex || null,
            contact_number: contactNumber.trim(),
            address: address.trim(),
          }
        : {
            full_name: fullName.trim(),
            email: email.trim().toLowerCase(),
            password,
            license_number: licenseNumber.trim(),
            specialization: specialization.trim(),
            department_id: Number(departmentId),
          }
    ),
  }
);


        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setLicenseNumber('');
        setSpecialization('');
        setDepartmentId('');
        setMessage(
          result.message || 'Doctor account created. You can now sign in.'
        );
      } else {
        const data = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        sessionStorage.setItem('token', data.token);
sessionStorage.setItem('user', JSON.stringify(data.user));
        done(data.user);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>Smart Healthcare</h1>

        <p>
          {isRegister
            ? 'Doctor Registration'
            : 'Healthcare Management System'}
        </p>

       {(isRegister || isPatientRegister) && (
          <>
            <input 
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              autoComplete="name"
              maxLength={120}
              required
            />
{!isPatientRegister && (
  <>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="Professional license number"
              maxLength={60}
              required
            />

            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="Specialization"
              maxLength={100}
              required
            />

            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              required
            >
              <option value="">Select department</option>
              {departments.map((department) => (
                <option
                  key={department.department_id}
                  value={department.department_id}
                >
                  {department.department_name}
                </option>
              ))}
            </select>
              </>
           )}
          </>
        )}

       
{isPatientRegister && (
  <>
    <input
      type="date"
      value={birthDate}
      onChange={(e) => setBirthDate(e.target.value)}
      required
    />

    <select
      value={sex}
      onChange={(e) => setSex(e.target.value)}
      required
    >
      <option value="">Select sex</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
    </select>

    <input
      type="tel"
      value={contactNumber}
      onChange={(e) => setContactNumber(e.target.value)}
      placeholder="Contact number"
    />

    <input
      type="text"
      value={address}
      onChange={(e) => setAddress(e.target.value)}
      placeholder="Address"
    />
  </>
)}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          autoComplete="email"
          maxLength={160}
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (at least 8 characters)"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          minLength={isRegister ? 8 : undefined}
          required
        />

       {(isRegister || isPatientRegister) && (
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        )}

        {message && <p className="success">{message}</p>}
        {error && <p className="err">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading
            ? 'Please wait...'
            : isPatientRegister
          ? 'Register as Patient'
          : isPatientRegister
           ? 'Register as Patient'
          : isRegister
           ? 'Register as Doctor'
           : 'Sign in'}
        </button>

        <p>
          {isRegister
            ? 'Already have an account?'
            : "Don't have an account?"}{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => {
           if (isPatientRegister) {
            setIsPatientRegister(false);
         } else {
          setIsRegister(!isRegister);
         }
           setError('');
          setMessage('');
           }}
          >
            {isPatientRegister
            ? 'Sign in'
           : isRegister
          ? 'Sign in'
          : 'Register as Doctor'}
          </button>
        </p>
        <button
       type="button"
      className="link-button"
      onClick={() => {
        setIsPatientRegister(true);
        setIsRegister(false);
        setError('');
       setMessage('');
       }}
       >
       Register as Patient
</button>
      </form>
    </div>
  );
}



function PatientDashboard({ me, onNavigate, language }) {
  const isEnglish = language === 'English';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api('/appointments/mine')
      .then((data) => {
        if (!active) return;

        const records = Array.isArray(data)
          ? data
          : Array.isArray(data?.appointments)
            ? data.appointments
            : [];

        setAppointments(records);
      })
      .catch((err) => {
        if (active) {
          setError(err.message || (isEnglish
            ? 'Unable to load appointments.'
            : 'Hindi ma-load ang mga appointment.'));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const now = new Date();

  const upcoming = appointments.filter((item) => {
    const date = new Date(
      String(item.appointment_datetime || item.appointment_date || '')
        .replace(' ', 'T')
    );

    const status = String(item.status || '').toLowerCase();

    return (
      !Number.isNaN(date.getTime()) &&
      date >= now &&
      !['cancelled', 'completed', 'rejected'].includes(status)
    );
  });

  const pending = appointments.filter(
    (item) => String(item.status || '').toLowerCase() === 'pending'
  );

  const completed = appointments.filter(
    (item) => String(item.status || '').toLowerCase() === 'completed'
  );

  const nextAppointment = [...upcoming].sort(
    (a, b) =>
      new Date(a.appointment_datetime || a.appointment_date) -
      new Date(b.appointment_datetime || b.appointment_date)
  )[0];

  const getAppointmentDate = (item) => {
    const value = item?.appointment_datetime || item?.appointment_date;

    if (!value) return isEnglish ? 'Date not available' : 'Walang petsang available';

    const date = new Date(String(value).replace(' ', 'T'));

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString(isEnglish ? 'en-PH' : 'fil-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const firstName = String(me?.name || 'Patient').trim().split(/\s+/)[0];

  const goTo = (page) => {
    if (onNavigate) onNavigate(page);
  };

  const statusLabel = (status) => {
    const value = String(status || 'Pending').toLowerCase();

    if (isEnglish) return status || 'Pending';

    const translations = {
      pending: 'Nakabinbin',
      confirmed: 'Kumpirmado',
      completed: 'Tapos na',
      cancelled: 'Kinansela',
      rejected: 'Tinanggihan',
    };

    return translations[value] || status || 'Nakabinbin';
  };

  return (
    <section className="patient-home">

      <div className="patient-home-welcome">
        <div>
          <span className="patient-home-eyebrow">
            {isEnglish ? 'PATIENT PORTAL' : 'PORTAL NG PASYENTE'}
          </span>

          <h1>
            {isEnglish ? `Welcome back, ${firstName}!` : `Maligayang pagbabalik, ${firstName}!`}
          </h1>

          <p>
            {isEnglish
              ? 'Manage your appointments and access your healthcare services.'
              : 'Pamahalaan ang iyong mga appointment at gamitin ang aming healthcare services.'}
          </p>
        </div>

        <div className="patient-home-avatar">
          {firstName.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="patient-home-stats">

        <div className="patient-home-stat">
          <span className="patient-home-stat-icon">📅</span>
          <div>
            <small>{isEnglish ? 'Total Appointments' : 'Kabuuang Appointment'}</small>
            <h2>{appointments.length}</h2>
          </div>
        </div>

        <div className="patient-home-stat">
          <span className="patient-home-stat-icon">🕒</span>
          <div>
            <small>{isEnglish ? 'Upcoming' : 'Mga Susunod'}</small>
            <h2>{upcoming.length}</h2>
          </div>
        </div>

        <div className="patient-home-stat">
          <span className="patient-home-stat-icon">⏳</span>
          <div>
            <small>{isEnglish ? 'Pending' : 'Nakabinbin'}</small>
            <h2>{pending.length}</h2>
          </div>
        </div>

        <div className="patient-home-stat">
          <span className="patient-home-stat-icon">✓</span>
          <div>
            <small>{isEnglish ? 'Completed' : 'Tapos na'}</small>
            <h2>{completed.length}</h2>
          </div>
        </div>

      </div>

      <div className="patient-home-main-grid">

        <div className="patient-home-panel">
          <div className="patient-home-panel-heading">
            <div>
              <h2>{isEnglish ? 'Upcoming Appointment' : 'Susunod na Appointment'}</h2>
              <p>{isEnglish ? 'Your next scheduled visit' : 'Ang susunod mong nakatakdang pagbisita'}</p>
            </div>

            <button
              className="patient-home-text-button"
              onClick={() => goTo('My Appointments')}
            >
              {isEnglish ? 'View All' : 'Tingnan Lahat'}
            </button>
          </div>

          {loading ? (
            <p className="patient-home-empty">
              {isEnglish ? 'Loading appointments...' : 'Kinukuha ang mga appointment...'}
            </p>
          ) : error ? (
            <p className="patient-home-error">{error}</p>
          ) : nextAppointment ? (
            <div className="patient-home-next">
              <div className="patient-home-calendar">
                <span>📅</span>
              </div>

              <div className="patient-home-next-info">
                <h3>
                  {nextAppointment.doctor_name
                    ? `Dr. ${nextAppointment.doctor_name}`
                    : isEnglish ? 'Doctor Appointment' : 'Appointment sa Doctor'}
                </h3>

                <p>
                  {nextAppointment.specialization ||
                    (isEnglish ? 'Medical Consultation' : 'Konsultasyong Medikal')}
                </p>

                <p className="patient-home-date">
                  {getAppointmentDate(nextAppointment)}
                </p>

                <span className={`patient-home-status ${
                  String(nextAppointment.status || 'pending').toLowerCase()
                }`}>
                  {statusLabel(nextAppointment.status)}
                </span>
              </div>
            </div>
          ) : (
            <div className="patient-home-empty">
              <span>📅</span>
              <h3>{isEnglish ? 'No upcoming appointments' : 'Walang nakatakdang appointment'}</h3>
              <p>
                {isEnglish
                  ? 'Book an appointment when you need a consultation.'
                  : 'Mag-book ng appointment kapag kailangan mo ng konsultasyon.'}
              </p>

              <button
                className="patient-home-primary-button"
                onClick={() => goTo('Book Appointment')}
              >
                {isEnglish ? 'Book Appointment' : 'Mag-book ng Appointment'}
              </button>
            </div>
          )}
        </div>

        <div className="patient-home-panel">
          <div className="patient-home-panel-heading">
            <div>
              <h2>{isEnglish ? 'Quick Access' : 'Mabilis na Pag-access'}</h2>
              <p>{isEnglish ? 'Frequently used services' : 'Mga madalas gamitin na serbisyo'}</p>
            </div>
          </div>

          <div className="patient-home-quick-grid">

            <button onClick={() => goTo('Book Appointment')}>
              <span>📅</span>
              <strong>{isEnglish ? 'Book Appointment' : 'Mag-book ng Appointment'}</strong>
              <small>{isEnglish ? 'Schedule a visit' : 'Magtakda ng pagbisita'}</small>
            </button>

            <button onClick={() => goTo('My Appointments')}>
              <span>🗓️</span>
              <strong>{isEnglish ? 'My Appointments' : 'Aking mga Appointment'}</strong>
              <small>{isEnglish ? 'View your schedule' : 'Tingnan ang iyong iskedyul'}</small>
            </button>

            <button onClick={() => goTo('Medicine Information')}>
              <span>💊</span>
              <strong>{isEnglish ? 'Medicine Information' : 'Impormasyon sa Gamot'}</strong>
              <small>{isEnglish ? 'View medicine guide' : 'Tingnan ang gabay sa gamot'}</small>
            </button>

            <button onClick={() => goTo('My Profile')}>
              <span>👤</span>
              <strong>{isEnglish ? 'My Profile' : 'Aking Profile'}</strong>
              <small>{isEnglish ? 'Manage your details' : 'Pamahalaan ang iyong impormasyon'}</small>
            </button>

          </div>
        </div>

      </div>

      <div className="patient-home-panel patient-home-features">
        <div className="patient-home-panel-heading">
          <div>
            <h2>{isEnglish ? 'Healthcare Services' : 'Mga Serbisyong Pangkalusugan'}</h2>
            <p>{isEnglish ? 'Available and planned patient services' : 'Mga available at nakaplanong serbisyo para sa pasyente'}</p>
          </div>
        </div>

        <div className="patient-home-feature-grid">

          {[
            ['💊', 'Medicine Information', 'General medicine reference', 'Impormasyon sa Gamot', 'Pangkalahatang gabay sa gamot', true],
            ['🧪', 'Lab Results & Reports', 'View laboratory results', 'Mga Resulta ng Laboratoryo', 'Tingnan ang resulta ng laboratoryo'],
            ['📋', 'My Prescriptions', 'View prescribed medicines', 'Aking mga Reseta', 'Tingnan ang mga iniresetang gamot'],
            ['📁', 'Medical History', 'Access medical records', 'Kasaysayang Medikal', 'Tingnan ang mga rekord medikal'],
            ['⚕️', 'Allergies', 'Patient allergy information', 'Mga Allergy', 'Impormasyon tungkol sa allergy'],
            ['🖥️', 'Telehealth', 'Online consultation', 'Telehealth', 'Online na konsultasyon'],
            ['💬', 'Secure Messaging', 'Contact healthcare staff', 'Ligtas na Pagmemensahe', 'Makipag-ugnayan sa healthcare staff'],
            ['📝', "Doctor's Notes", 'Consultation notes', 'Mga Tala ng Doctor', 'Mga tala ng konsultasyon'],
            ['💳', 'Billing & Payments', 'Manage healthcare bills', 'Bayarin at Pagbabayad', 'Pamahalaan ang mga bayarin'],
            ['📄', 'Insurance Claims', 'Insurance information', 'Mga Claim sa Insurance', 'Impormasyon sa insurance'],
          ].map((item, index) => (
            <div
              className={`patient-home-feature ${item[5] ? 'available' : ''}`}
              key={index}
            >
              <span>{item[0]}</span>
              <div>
                <strong>{isEnglish ? item[1] : item[3]}</strong>
                <small>{isEnglish ? item[2] : item[4]}</small>
              </div>
              <span className="patient-home-feature-label">
                {item[5]
                  ? (isEnglish ? 'Available' : 'Available')
                  : (isEnglish ? 'Coming Soon' : 'Malapit Nang Magagamit')}
              </span>
            </div>
          ))}

        </div>

        <p className="patient-home-disclaimer">
          {isEnglish
            ? 'Medicine Information is a general reference only. It does not represent your personal prescription or medical advice.'
            : 'Ang Impormasyon sa Gamot ay pangkalahatang gabay lamang. Hindi ito personal na reseta o medikal na payo.'}
        </p>
      </div>

      <div className="patient-home-footer">
        <span>SHMS — Smart Healthcare Management System</span>
        <span>{isEnglish ? 'Patient Portal' : 'Portal ng Pasyente'}</span>
      </div>

      <PatientAI />

    </section>
  );
}
// =====================================================
// PATIENT MY APPOINTMENTS
// =====================================================

function PatientAppointments({ me }) {
  const { language } = useLanguage();
  const isEnglish = language === 'English';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadAppointments() {
    setLoading(true);
    setError('');

    try {
      const data = await api('/appointments/mine');

      const records = Array.isArray(data)
        ? data
        : Array.isArray(data?.appointments)
          ? data.appointments
          : [];

      setAppointments(records);
    } catch (err) {
      setError(
        err.message ||
        (isEnglish
          ? 'Unable to load appointments.'
          : 'Hindi ma-load ang mga appointment.')
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  function formatDate(item) {
    const value =
      item.appointment_datetime ||
      item.appointment_date;

    if (!value) return isEnglish
      ? 'Date unavailable'
      : 'Walang petsang available';

    const date = new Date(String(value).replace(' ', 'T'));

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString(
      isEnglish ? 'en-PH' : 'fil-PH',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }
    );
  }

  function translateStatus(status) {
    const translations = {
      pending: 'Nakabinbin',
      confirmed: 'Kumpirmado',
      completed: 'Tapos na',
      cancelled: 'Kinansela',
      rejected: 'Tinanggihan',
    };

    return isEnglish
      ? status || 'Pending'
      : translations[String(status || 'pending').toLowerCase()]
        || status;
  }

  return (
    <section className="patient-home">

      <div className="patient-home-panel">
        <div className="patient-home-panel-heading">
          <div>
            <h2>
              {isEnglish
                ? 'My Appointments'
                : 'Aking mga Appointment'}
            </h2>

            <p>
              {isEnglish
                ? 'View your appointment records and schedules.'
                : 'Tingnan ang iyong mga appointment at iskedyul.'}
            </p>
          </div>

          <button
            className="patient-home-text-button"
            onClick={loadAppointments}
            disabled={loading}
          >
            {isEnglish ? 'Refresh' : 'I-refresh'}
          </button>
        </div>

        {loading ? (
          <p>
            {isEnglish
              ? 'Loading appointments...'
              : 'Kinukuha ang mga appointment...'}
          </p>
        ) : error ? (
          <div className="patient-home-error">
            {error}
          </div>
        ) : appointments.length === 0 ? (
          <div className="patient-home-empty">
            <span>📅</span>

            <h3>
              {isEnglish
                ? 'No appointments found'
                : 'Walang nahanap na appointment'}
            </h3>

            <p>
              {isEnglish
                ? 'Your booked appointments will appear here.'
                : 'Dito makikita ang iyong mga na-book na appointment.'}
            </p>
          </div>
        ) : (
          <div className="patient-home-quick-grid">

            {appointments.map((item) => (
              <article
                className="patient-home-panel"
                key={item.appointment_id}
              >
                <h3>
                  {item.doctor_name
                    ? `Dr. ${item.doctor_name}`
                    : isEnglish
                      ? 'Doctor Appointment'
                      : 'Appointment sa Doktor'}
                </h3>

                <p>
                  <strong>
                    {isEnglish ? 'Specialization:' : 'Espesyalisasyon:'}
                  </strong>{' '}
                  {item.specialization || '—'}
                </p>

                <p>
                  <strong>
                    {isEnglish ? 'Date:' : 'Petsa:'}
                  </strong>{' '}
                  {formatDate(item)}
                </p>

                <p>
                  <strong>
                    {isEnglish ? 'Status:' : 'Katayuan:'}
                  </strong>{' '}
                  {translateStatus(item.status)}
                </p>

                {item.appointment_type && (
                  <p>
                    <strong>
                      {isEnglish ? 'Type:' : 'Uri:'}
                    </strong>{' '}
                    {item.appointment_type === 'Face-to-Face'
                      ? isEnglish
                        ? 'Face-to-Face'
                        : 'Personal na Konsultasyon'
                      : item.appointment_type}
                  </p>
                )}

                {item.reason && (
                  <p>
                    <strong>
                      {isEnglish ? 'Reason:' : 'Dahilan:'}
                    </strong>{' '}
                    {item.reason}
                  </p>
                )}

                {item.queue_number && (
                  <p>
                    <strong>Queue Number:</strong>{' '}
                    {String(item.queue_number).padStart(3, '0')}
                  </p>
                )}
              </article>
            ))}

          </div>
        )}
      </div>

    </section>
  );
}
// =====================================================
// PATIENT PROFILE
// =====================================================

function PatientProfile({ me, onProfileUpdated, language = "English" }) {
  const tr = (lang, english, tagalog) =>
    lang === 'English' ? english : tagalog;

  const [patient, setPatient] = useState(null);
  const [image, setImage] = useState('');
  const [preview, setPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    birth_date: '',
    sex: '',
    contact_number: '',
    address: '',
  });

  useEffect(() => {
    loadPatientProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function loadPatientProfile() {
    try {
      setLoading(true);
      setMessage('');

      const response = await fetch(`${API}/patient/profile`, {
        headers: {
          Authorization: 'Bearer ' + token(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load profile.');
      }

      const p = data.patient;

      setPatient(p);
      setImage(p.profile_image_url || '');

      setForm({
        full_name: p.full_name || '',
        birth_date: p.birth_date
          ? String(p.birth_date).slice(0, 10)
          : '',
        sex: p.sex || '',
        contact_number: p.contact_number || '',
        address: p.address || '',
      });

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value,
    }));
  }

  function cancelEditing() {
    setForm({
      full_name: patient.full_name || '',
      birth_date: patient.birth_date
        ? String(patient.birth_date).slice(0, 10)
        : '',
      sex: patient.sex || '',
      contact_number: patient.contact_number || '',
      address: patient.address || '',
    });

    setEditing(false);
    setMessage('');
  }

  async function saveProfile() {
    try {
      setSaving(true);
      setMessage('');

      const response = await fetch(`${API}/patient/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token(),
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update profile.');
      }

      setPatient(data.patient);

      setForm({
        full_name: data.patient.full_name || '',
        birth_date: data.patient.birth_date
          ? String(data.patient.birth_date).slice(0, 10)
          : '',
        sex: data.patient.sex || '',
        contact_number: data.patient.contact_number || '',
        address: data.patient.address || '',
      });

      onProfileUpdated?.(data.patient.full_name);

      setEditing(false);

      setMessage(
        tr(language,
          'Profile updated successfully!',
          'Matagumpay na na-update ang profile!'
        )
      );

    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage(
        tr(language,
          'Please select a JPG, PNG, or WebP image.',
          'Pumili ng JPG, PNG, o WebP na larawan.'
        )
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage(
        tr(language,
          'Image must not exceed 2 MB.',
          'Hindi dapat lumampas sa 2 MB ang larawan.'
        )
      );
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setMessage('');
  }

  async function handleUpload() {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setMessage('');

      const result = await uploadProfilePicture(selectedFile);

      setImage(result.profile_image_url);

      setPatient(previous => ({
        ...previous,
        profile_image_url: result.profile_image_url,
      }));

      setPreview('');
      setSelectedFile(null);

      setMessage(
        tr(language,
          'Profile picture updated successfully!',
          'Matagumpay na napalitan ang larawan ng profile!'
        )
      );

    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <section className="patient-profile-loading">
        {tr(language, 'Loading profile...', 'Kinukuha ang profile...')}
      </section>
    );
  }

  if (!patient) {
    return (
      <section className="patient-profile-loading">
        <h2>{tr(language, 'My Profile', 'Aking Profile')}</h2>

        <p>
          {message ||
            tr(
              language,
              'Unable to load patient information.',
              'Hindi makuha ang impormasyon ng pasyente.'
            )}
        </p>

        <button type="button" onClick={loadPatientProfile}>
          {tr(language, 'Try Again', 'Subukan Muli')}
        </button>
      </section>
    );
  }

  const initials = (patient.full_name || 'Patient')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

  return (
    <section className="patient-profile-card">

      <div className="patient-profile-heading">
        <div>
          <span className="patient-profile-eyebrow">
            {tr(language, 'ACCOUNT SETTINGS', 'MGA SETTING NG ACCOUNT')}
          </span>

          <h2>
            {tr(language, 'My Patient Profile', 'Aking Profile Bilang Pasyente')}
          </h2>

          <p>
            {tr(
              language,
              'View and manage your personal information.',
              'Tingnan at baguhin ang personal mong impormasyon.'
            )}
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setMessage('');
            }}
          >
            {tr(language, 'Edit Profile', 'I-edit ang Profile')}
          </button>
        ) : (
          <div className="patient-profile-actions">
            <button
              type="button"
              className="profile-cancel"
              onClick={cancelEditing}
            >
              {tr(language, 'Cancel', 'Kanselahin')}
            </button>

            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
            >
              {saving
                ? tr(language, 'Saving...', 'Sine-save...')
                : tr(language, 'Save Changes', 'I-save ang mga Pagbabago')}
            </button>
          </div>
        )}
      </div>

      <div className="patient-profile-layout">

        <div className="patient-profile-sidebar">

          <div className="patient-profile-avatar">
            {preview || image ? (
              <img
                src={preview || image}
                alt="Patient profile"
              />
            ) : (
              <div className="patient-profile-placeholder">
                {initials}
              </div>
            )}
          </div>

          <h3 className="patient-profile-display-name">
            {patient.full_name}
          </h3>

          <span className="patient-profile-role">Patient</span>

          <div className="patient-profile-upload">

            <label htmlFor="patient-profile-file">
              {tr(
                language,
                'Change Profile Photo',
                'Palitan ang Larawan ng Profile'
              )}
            </label>

            <input
              id="patient-profile-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />

            <small>JPG, PNG, or WebP · Maximum 2 MB</small>

            {selectedFile && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading
                  ? tr(language, 'Uploading...', 'Ina-upload...')
                  : tr(language, 'Upload Photo', 'I-upload ang Larawan')}
              </button>
            )}

          </div>

          <p className="patient-profile-code">
            {tr(language, 'Patient Code', 'Code ng Pasyente')}

            <strong>
              {patient.patient_code ||
                tr(language, 'Not available', 'Hindi available')}
            </strong>
          </p>

        </div>

        <div className="patient-profile-details">

          <div className="patient-profile-section-title">
            <h3>
              {tr(language, 'Personal Information', 'Personal na Impormasyon')}
            </h3>

            <p>
              {tr(
                language,
                'Your basic patient details.',
                'Mga pangunahing detalye mo bilang pasyente.'
              )}
            </p>
          </div>

          <div className="patient-profile-fields">

            <div className="patient-profile-field">
              <label>
                {tr(language, 'Full Name', 'Buong Pangalan')}
              </label>

              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            <div className="patient-profile-field">
              <label>
                {tr(language, 'Birth Date', 'Petsa ng Kapanganakan')}
              </label>

              <input
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            <div className="patient-profile-field">
              <label>
                {tr(language, 'Sex', 'Kasarian')}
              </label>

              <select
                name="sex"
                value={form.sex}
                onChange={handleChange}
                disabled={!editing}
              >
                <option value="">Select sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

          </div>

          <div className="patient-profile-section-title contact-title">
            <h3>
              {tr(
                language,
                'Contact Information',
                'Impormasyon sa Pakikipag-ugnayan'
              )}
            </h3>

            <p>
              {tr(
                language,
                'How the healthcare team can reach you.',
                'Paraan para makontak ka ng healthcare team.'
              )}
            </p>
          </div>

          <div className="patient-profile-fields">

            <div className="patient-profile-field">
              <label>
                {tr(language, 'Contact Number', 'Numero ng Telepono')}
              </label>

              <input
                name="contact_number"
                value={form.contact_number}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter contact number"
              />
            </div>

            <div className="patient-profile-field full-width">
              <label>
                {tr(language, 'Complete Address', 'Kumpletong Address')}
              </label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter complete address"
                rows={4}
              />
            </div>

          </div>

        </div>
      </div>

      {message && (
        <p className="patient-profile-message" role="status">
          {message}
        </p>
      )}

    </section>
  );
}
// =====================================================
// MAIN APP
// =====================================================


function App() {
  const [me, setMe] = useState(user());
  const [page, setPage] = useState('Dashboard');

  // GLOBAL LANGUAGE SETTINGS
  const { language, setLanguage, t } = useLanguage();
  const roleLabel = {
  Admin: language === 'English' ? 'Admin' : 'Tagapangasiwa',
  Doctor: language === 'English' ? 'Doctor' : 'Doktor',
  Staff: language === 'English' ? 'Staff' : 'Kawani',
  Patient: language === 'English' ? 'Patient' : 'Pasyente',
}[me?.role] || me?.role;

  // THEME SETTINGS
  const [theme, setTheme] = useState(
    localStorage.getItem('shms_theme') || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('shms_theme', theme);
  }, [theme]);

  if (!me || !token()) {
    return <Login done={setMe} />;
  }

  function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setMe(null);
  }

  const menuItems =
    me.role === 'Patient'
      ? [
          'Dashboard',
          'Book Appointment',
          'My Appointments',
          'Medicine Information',
          'My Profile',
        ]
      : [
          'Dashboard',
          'Patients',
          'Appointments',
          'Billing',
          ...(me.role === 'Admin'
            ? ['Staff Accounts', 'Doctor Approvals']
            : []),
        ];

  // SIDEBAR TRANSLATIONS
  const labels = {
    Dashboard: t('dashboard'),
    'Book Appointment': t('bookAppointment'),
    'My Appointments': t('myAppointments'),
    'Medicine Information': t('medicineInformation'),
    'My Profile': t('myProfile'),
    Patients: t('patients'),
    Appointments: t('appointments'),
    Billing: t('billing'),
    'Staff Accounts': t('staffAccounts'),
    'Doctor Approvals': t('doctorApprovals'),
  };

  return (
    <div className="app">
      <aside>
        <b>SHMS</b>

        <span>
          {me.name}
          <br />
          {roleLabel}
        </span>

        {menuItems.map((item) => (
          <button key={item} onClick={() => setPage(item)}>
            {labels[item] || item}
          </button>
        ))}

        <button onClick={logout}>
          {t('logout')}
        </button>
      </aside>

      <main>
        <div className="global-controls">
          <div className="global-controls-user">
            <span>{me.name}</span>
            <small>{roleLabel}</small>
          </div>

          {/* LANGUAGE SWITCH */}
          <button
            className="control-button language-button"
            onClick={() =>
              setLanguage(
                language === 'English' ? 'Tagalog' : 'English'
              )
            }
          >
            {language === 'English' ? 'EN | TL' : 'TL | EN'}
          </button>

          {/* THEME SWITCH */}
          <button
            className="control-button theme-button"
            onClick={() =>
              setTheme(theme === 'light' ? 'dark' : 'light')
            }
          >
            <span className="theme-icon">
              {theme === 'light' ? '◐' : '◑'}
            </span>

            {theme === 'light'
              ? t('darkMode')
              : t('lightMode')}
          </button>

        
        </div>

        {/* PATIENT PAGES */}
        {me.role === 'Patient' ? (
          <>
            {page === 'Dashboard' && (
              <PatientDashboard
                me={me}
                onNavigate={setPage}
                language={language}
              />
            )}

            {page === 'Book Appointment' && (
              <PatientBookAppointment />
            )}

            {page === 'My Appointments' && (
              <PatientAppointments me={me} />
            )}

            {page === 'Medicine Information' && (
              <PatientMedicineInformation language={language} />
            )}

            {page === 'My Profile' && (
               <PatientProfile
            me={me}
               language={language}
             onProfileUpdated={(newName) => {
            const updatedUser = {
            ...me,
             name: newName,
             };

              setMe(updatedUser);
              }}
          />
         )}
          </>
        ) : (
          /* ADMIN, DOCTOR AND STAFF PAGES */
          <>
            {page === 'Dashboard' && <Dash language={language} />}

            {page === 'Patients' && <Patients />}

            {page === 'Appointments' && <Appointments />}

            {page === 'Billing' && <Billing />}

            {page === 'Staff Accounts' && me.role === 'Admin' && (
             <StaffAccounts language={language} />
            )}

            {page === 'Doctor Approvals' && me.role === 'Admin' && (
           <DoctorApprovals language={language} />
            )}
          </>
        )}
      </main>
    </div>
  );
}


// =====================================================
// STAFF ACCOUNTS
// =====================================================


function StaffAccounts({ language }) {
  const isEnglish = language === 'English';

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const result = await api('/admin/staff', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setMessage(
        result.message ||
        (isEnglish
          ? 'Staff account created successfully.'
          : 'Matagumpay na nagawa ang Staff account.')
      );

      setForm({
        full_name: '',
        email: '',
        password: '',
      });
    } catch (err) {
      setError(
        err.message ||
        (isEnglish
          ? 'Failed to create Staff account.'
          : 'Hindi nagawa ang Staff account.')
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>{isEnglish ? 'Staff Accounts' : 'Mga Account ng Staff'}</h2>

      <p>
        {isEnglish
          ? 'Create a new Staff account.'
          : 'Gumawa ng bagong Staff account.'}
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          {isEnglish ? 'Full Name' : 'Buong Pangalan'}
          <input
            type="text"
            value={form.full_name}
            onChange={(e) =>
              setForm({ ...form, full_name: e.target.value })
            }
            required
          />
        </label>

        <label>
          {isEnglish ? 'Email' : 'Adres ng Email'}
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />
        </label>

        <label>
       {isEnglish ? 'Password' : 'Salitang-Sikreto'}
          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            minLength={8}
            maxLength={128}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading
            ? (isEnglish ? 'Creating...' : 'Gumagawa...')
            : (isEnglish
                ? 'Create Staff Account'
                : 'Gumawa ng Staff Account')}
        </button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </section>
  );
}


// =====================================================
// DASHBOARD
// =====================================================
// =====================================================
// DOCTOR APPROVALS
// =====================================================


function DoctorApprovals({ language }) {
  const isEnglish = language === 'English';

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadDoctors() {
    setLoading(true);
    setError('');

    try {
      const result = await api('/admin/doctor-registrations');
      setDoctors(Array.isArray(result) ? result : result.doctors || []);
    } catch (err) {
      setError(
        err.message ||
        (isEnglish
          ? 'Failed to load doctor registrations.'
          : 'Hindi ma-load ang mga rehistradong doktor.')
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDoctors();
  }, []);

  async function updateDoctor(userId, action) {
    setError('');
    setMessage('');

    try {
      const result = await api(
        `/admin/doctor-registrations/${userId}/${action}`,
        { method: 'PATCH' }
      );

      setMessage(
        result.message ||
        (isEnglish
          ? `Doctor ${action}d successfully.`
          : action === 'approve'
            ? 'Matagumpay na naaprubahan ang doktor.'
            : 'Matagumpay na natanggihan ang doktor.')
      );

      await loadDoctors();
    } catch (err) {
      setError(
        err.message ||
        (isEnglish
          ? `Failed to ${action} doctor.`
          : 'Hindi naisagawa ang aksyon sa doktor.')
      );
    }
  }

  return (
    <section>
      <h2>
        {isEnglish ? 'Doctor Approvals' : 'Pag-apruba sa mga Doktor'}
      </h2>

      <p>
        {isEnglish
          ? 'Review and manage pending doctor registrations.'
          : 'Suriin at pamahalaan ang mga doktor na naghihintay ng pag-apruba.'}
      </p>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>
          {isEnglish
            ? 'Loading doctor registrations...'
            : 'Kinukuha ang mga rehistradong doktor...'}
        </p>
      ) : doctors.length === 0 ? (
        <p>
          {isEnglish
            ? 'No pending doctor registrations.'
            : 'Walang doktor na naghihintay ng pag-apruba.'}
        </p>
      ) : (
        doctors.map((doctor) => (
          <div
            key={doctor.user_id}
            style={{
              border: '1px solid #ddd',
              padding: '16px',
              marginBottom: '12px',
              borderRadius: '8px',
            }}
          >
            <h3>{doctor.full_name}</h3>
            <p>{isEnglish ? 'Email' : 'Adres ng Email'}: {doctor.email}</p>
            <p>{isEnglish ? 'License Number' : 'Numero ng Lisensya'}: {doctor.license_number}</p>
            <p>{isEnglish ? 'Specialization' : 'Espesyalisasyon'}: {doctor.specialization}</p>
            <p>{isEnglish ? 'Status' : 'Katayuan'}: {doctor.approval_status}</p>

            <button onClick={() => updateDoctor(doctor.user_id, 'approve')}>
              {isEnglish ? 'Approve' : 'Aprubahan'}
            </button>

            <button onClick={() => updateDoctor(doctor.user_id, 'reject')}>
              {isEnglish ? 'Reject' : 'Tanggihan'}
            </button>
          </div>
        ))
      )}
    </section>
  );
}


// =====================================================
// DASHBOARD
// =====================================================


function Dash({ language }) {
  const isEnglish = language === 'English';
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/dashboard/summary').then(setData);
  }, []);

  const modules = [
    {
      number: '01',
      title: isEnglish ? 'Patient Records' : 'Mga Rekord ng Pasyente',
      description: isEnglish
        ? 'Manage and review registered patient information.'
        : 'Pamahalaan at suriin ang impormasyon ng mga rehistradong pasyente.',
    },
    {
      number: '02',
      title: isEnglish ? 'Doctor Management' : 'Pamamahala ng mga Doktor',
      description: isEnglish
        ? 'View doctor information and specializations.'
        : 'Tingnan ang impormasyon at espesyalisasyon ng mga doktor.',
    },
    {
      number: '03',
      title: isEnglish ? 'Appointments' : 'Mga Appointment',
      description: isEnglish
        ? 'Manage patient appointment requests and schedules.'
        : 'Pamahalaan ang mga kahilingan at iskedyul ng appointment.',
    },
    {
      number: '04',
      title: isEnglish ? 'Medical Records' : 'Mga Rekord Medikal',
      description: isEnglish
        ? 'Access and organize patient medical information.'
        : 'Tingnan at ayusin ang mga impormasyong medikal ng pasyente.',
    },
    {
      number: '05',
      title: isEnglish ? 'Prescriptions' : 'Mga Reseta',
      description: isEnglish
        ? 'Manage prescription-related information.'
        : 'Pamahalaan ang mga impormasyon tungkol sa mga reseta.',
    },
    {
      number: '06',
      title: isEnglish ? 'Billing and Payments' : 'Pagsingil at Pagbabayad',
      description: isEnglish
        ? 'Review billing records and payment information.'
        : 'Suriin ang mga rekord ng bayarin at impormasyon sa pagbabayad.',
    },
    {
      number: '07',
      title: isEnglish ? 'AI Database Assistant' : 'AI Database Assistant',
      description: isEnglish
        ? 'Access the healthcare database assistant.'
        : 'Gamitin ang AI assistant para sa healthcare database.',
    },
  ];

  return (
    <div className="professional-dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">
            SMART HEALTHCARE MANAGEMENT SYSTEM
          </span>
          <h2>
            {isEnglish ? 'Dashboard Overview' : 'Pangkalahatang Dashboard'}
          </h2>
          <p>
            {isEnglish
              ? 'Monitor your healthcare system activities and records.'
              : 'Subaybayan ang mga gawain at rekord ng healthcare system.'}
          </p>
        </div>
      </div>

      <div className="dashboard-section-title">
        <h3>{isEnglish ? 'System Summary' : 'Buod ng Sistema'}</h3>
        <p>
          {isEnglish
            ? 'Current system statistics'
            : 'Kasalukuyang estadistika ng sistema'}
        </p>
      </div>

      {data ? (
        <div className="dashboard-stat-grid">
          <div className="dashboard-stat-card">
            <div className="stat-card-top">
              <span>{isEnglish ? 'Patient Records' : 'Mga Rekord ng Pasyente'}</span>
              <span className="stat-icon">PT</span>
            </div>
            <strong>{data.patients}</strong>
            <small>{isEnglish ? 'Registered patients' : 'Mga rehistradong pasyente'}</small>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-card-top">
              <span>{isEnglish ? 'Doctors' : 'Mga Doktor'}</span>
              <span className="stat-icon">DR</span>
            </div>
            <strong>{data.doctors}</strong>
            <small>{isEnglish ? 'Registered doctors' : 'Mga rehistradong doktor'}</small>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-card-top">
              <span>{isEnglish ? 'Appointments' : 'Mga Appointment'}</span>
              <span className="stat-icon">AP</span>
            </div>
            <strong>{data.appointments}</strong>
            <small>{isEnglish ? 'Total appointments' : 'Kabuuang mga appointment'}</small>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-card-top">
              <span>{isEnglish ? 'Unpaid Balance' : 'Hindi Pa Nababayaran'}</span>
              <span className="stat-icon">₱</span>
            </div>
            <strong>₱{Number(data.unpaidAmount).toFixed(2)}</strong>
            <small>{isEnglish ? 'Outstanding amount' : 'Natitirang halaga ng bayarin'}</small>
          </div>
        </div>
      ) : (
        <section className="dashboard-loading">
          {isEnglish
            ? 'Loading dashboard information...'
            : 'Kinukuha ang impormasyon ng dashboard...'}
        </section>
      )}

      <div className="dashboard-section-title">
        <h3>{isEnglish ? 'System Modules' : 'Mga Module ng Sistema'}</h3>
        <p>
          {isEnglish
            ? 'Healthcare management services and functionalities'
            : 'Mga serbisyo at kakayahan ng healthcare management system'}
        </p>
      </div>

      <div className="dashboard-module-grid">
        {modules.map((module) => (
          <div className="dashboard-module-card" key={module.number}>
            <span className="module-number">{module.number}</span>
            <h4>{module.title}</h4>
            <p>{module.description}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-footer">
        <span>SHMS</span>
        <p>Smart Healthcare Management System</p>
      </div>
    </div>
  );
}


// =====================================================
// PATIENTS
// =====================================================


function Patients() {
  const [rows, setRows] = useState([]);
  const { language } = useLanguage();
  const isEnglish = language === 'English';

  const [form, setForm] = useState({
    patient_code: '',
    full_name: '',
    birth_date: '',
    sex: '',
    contact_number: '',
    address: '',
  });

  const [message, setMessage] = useState('');

  const fieldLabels = {
    patient_code: isEnglish ? 'Patient Code' : 'Patient Code',
    full_name: isEnglish ? 'Full Name' : 'Buong Pangalan',
    birth_date: isEnglish ? 'Birth Date' : 'Petsa ng Kapanganakan',
    sex: isEnglish ? 'Sex' : 'Kasarian',
    contact_number: isEnglish ? 'Contact Number' : 'Contact Number',
    address: isEnglish ? 'Address' : 'Tirahan',
  };

  const load = () => {
    api('/patients')
      .then(setRows)
      .catch((error) => setMessage(error.message));
  };

  useEffect(load, []);

  async function addPatient(event) {
    event.preventDefault();

    try {
      await api('/patients', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setForm({
        patient_code: '',
        full_name: '',
        birth_date: '',
        sex: '',
        contact_number: '',
        address: '',
      });

      setMessage(
        isEnglish
          ? 'Patient added successfully.'
          : 'Matagumpay na naidagdag ang pasyente.'
      );

      load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deletePatient(id) {
    const confirmed = window.confirm(
      isEnglish
        ? 'Are you sure you want to delete this patient?'
        : 'Sigurado ka bang gusto mong tanggalin ang pasyenteng ito?'
    );

    if (confirmed) {
      try {
        await api('/patients/' + id, {
          method: 'DELETE',
        });

        setMessage(
          isEnglish
            ? 'Patient deleted successfully.'
            : 'Matagumpay na natanggal ang pasyente.'
        );

        load();
      } catch (error) {
        setMessage(error.message);
      }
    }
  }

  return (
    <>
      <h2>{isEnglish ? 'Patients' : 'Mga Pasyente'}</h2>

      <form className="form" onSubmit={addPatient}>
        {Object.keys(form).map((key) => (
          <input
            key={key}
            type={
              key === 'birth_date'
                ? 'date'
                : 'text'
            }
            placeholder={fieldLabels[key]}
            aria-label={fieldLabels[key]}
            value={form[key]}
            onChange={(e) =>
              setForm({
                ...form,
                [key]: e.target.value,
              })
            }
            required={
              key === 'patient_code' ||
              key === 'full_name'
            }
          />
        ))}

        <button type="submit">
          {isEnglish ? 'Add Patient' : 'Magdagdag ng Pasyente'}
        </button>
      </form>

      <p>{message}</p>

      <Table
        rows={rows}
        del={deletePatient}
        language={language}
      />
    </>
  );
}


// =====================================================
// TABLE
// =====================================================

function Table({ rows, del }) {
  return (
    <section>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Name</th>
            <th>Birth</th>

            {del && <th>Action</th>}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.patient_id}>
              <td>{row.patient_id}</td>

              <td>{row.patient_code}</td>

              <td>{row.full_name}</td>

              <td>
                {String(row.birth_date || '').slice(
                  0,
                  10
                )}
              </td>

              {del && (
                <td>
                  <button
                    onClick={() =>
                      del(row.patient_id)
                    }
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// =====================================================
// GENERIC LIST
// =====================================================

function List({ path, title }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api(path)
      .then(setRows)
      .catch(() => {});
  }, [path]);

  return (
    <>
      <h2>{title}</h2>

      <section>
        <table>
          <thead>
            <tr>
              {rows[0] &&
                Object.keys(rows[0])
                  .slice(0, 6)
                  .map((key) => (
                    <th key={key}>{key}</th>
                  ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {Object.keys(row)
                  .slice(0, 6)
                  .map((key) => (
                    <td key={key}>
                      {String(row[key] ?? '')}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);

// =====================================================
// AI DATABASE ASSISTANT
// =====================================================

function AI() {
  const [intent, setIntent] = useState(
    'patient_appointment_count'
  );

  const [patientCode, setPatientCode] =
    useState('P-001');

  const [status, setStatus] =
    useState('Confirmed');

  const [result, setResult] = useState(null);

  async function run() {
    const body = {
      intent,
    };

    if (intent === 'patient_appointment_count') {
      body.patientCode = patientCode;
    }

    if (intent === 'appointments_by_status') {
      body.status = status;
    }

    setResult(
      await api('/ai/query', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    );
  }

  return (
    <>
      <h2>AI Database Assistant</h2>

      <section>
        <p>
          This safe demo maps approved questions to
          fixed read-only parameterized SQL. It does
          not execute arbitrary generated SQL.
        </p>

        <select
          value={intent}
          onChange={(e) =>
            setIntent(e.target.value)
          }
        >
          <option value="patient_appointment_count">
            Patient appointment count
          </option>

          <option value="appointments_by_status">
            Appointments by status
          </option>

          <option value="unpaid_invoices">
            Unpaid invoices
          </option>
        </select>

        {intent === 'patient_appointment_count' && (
          <input
            value={patientCode}
            onChange={(e) =>
              setPatientCode(e.target.value)
            }
            placeholder="Patient code"
          />
        )}

        {intent === 'appointments_by_status' && (
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >
            <option>Pending</option>
            <option>Confirmed</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        )}

        <button onClick={run}>Run</button>

        {result && (
          <pre>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </section>
    </>
  );
}

// =====================================================
// RENDER APP
// =====================================================
