
import React, { useCallback, useEffect, useState } from 'react';
import './Appointments.css';
import { useLanguage } from './LanguageContext.jsx';

const API = 'https://shms-backend-g9ie.onrender.com/api/appointments';

function getToken() {
  return sessionStorage.getItem('token') || '';
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error('No login token. Please log in again.');
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'The request failed.');
  }

  return data;
}

function translateStatus(status, language) {
  if (language === 'English') return status;

  const statusLabels = {
    Pending: 'Nakabinbin',
    Confirmed: 'Kumpirmado',
    Completed: 'Nakumpleto',
    Cancelled: 'Kinansela',
  };

  return statusLabels[status] || status;
}

function translateType(type, language) {
  if (language === 'English') return type || 'Not specified';

  const types = {
    'Video Call': 'Video Call',
    'Face-to-Face': 'Personal na Konsultasyon',
  };

  return types[type] || type || 'Hindi tinukoy';
}

export default function Appointments() {
  const { language, t } = useLanguage();
  const isTagalog = language === 'Tagalog';

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  const [form, setForm] = useState({
    patient_id: '',
    doctor_id: '',
    date: '',
    reason: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [
        appointmentRows,
        patientRows,
        doctorRows,
        dashboard,
      ] = await Promise.all([
        apiRequest('/'),
        apiRequest('/options/patients'),
        apiRequest('/options/doctors'),
        apiRequest('/dashboard'),
      ]);

      setAppointments(appointmentRows);
      setPatients(patientRows);
      setDoctors(doctorRows);
      setCounts(dashboard);
    } catch (err) {
      setError(
        err.message ||
          (isTagalog
            ? 'Hindi ma-load ang mga appointment.'
            : 'Unable to load appointments.')
      );
    } finally {
      setLoading(false);
    }
  }, [isTagalog]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (!form.patient_id || !form.doctor_id) {
        throw new Error(
          isTagalog
            ? 'Pumili ng pasyente at doktor.'
            : 'Please select a patient and doctor.'
        );
      }

      const response = await apiRequest('/', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: Number(form.patient_id),
          doctor_id: Number(form.doctor_id),
          appointment_date: form.date,
          reason: form.reason.trim(),
        }),
      });

      setSuccess(
        isTagalog
          ? `Matagumpay na nagawa ang appointment! Queue Number: ${String(
              response.queue_number
            ).padStart(3, '0')}`
          : `Appointment created successfully! Queue Number: ${String(
              response.queue_number
            ).padStart(3, '0')}`
      );

      setForm({
        patient_id: '',
        doctor_id: '',
        date: '',
        reason: '',
      });

      await loadData();
    } catch (err) {
      setError(
        err.message ||
          (isTagalog
            ? 'Hindi na-save ang appointment.'
            : 'The appointment could not be saved.')
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id, status) {
    setError('');
    setSuccess('');

    try {
      await apiRequest(`/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      setSuccess(
        isTagalog
          ? `Na-update ang status sa ${translateStatus(status, language)}.`
          : `Appointment status updated to ${status}.`
      );

      await loadData();
    } catch (err) {
      setError(
        err.message ||
          (isTagalog
            ? 'Hindi ma-update ang status.'
            : 'The status could not be updated.')
      );
    }
  }

  const statLabels = [
    [t('totalAppointments'), counts.total],
    [t('pending'), counts.pending],
    [isTagalog ? 'Kumpirmado' : 'Confirmed', counts.confirmed],
    [t('completed'), counts.completed],
    [isTagalog ? 'Kinansela' : 'Cancelled', counts.cancelled],
  ];

  return (
    <main className="appointments-page">
      <header className="appointments-header">
        <div>
          <h1>{t('appointments')}</h1>
          <p>
            {isTagalog
              ? 'Mag-iskedyul at mamahala ng mga pagbisita ng pasyente.'
              : 'Schedule and manage patient visits.'}
          </p>
        </div>

        <button type="button" onClick={loadData}>
          {t('refresh')}
        </button>
      </header>

      {error && (
        <div
          className="appointment-message appointment-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="appointment-message appointment-success"
          role="status"
        >
          {success}
        </div>
      )}

      <section className="appointment-dashboard">
        {statLabels.map(([label, value]) => (
          <article className="appointment-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="appointment-card">
        <h2>
          {isTagalog
            ? 'Mag-book ng Appointment'
            : 'Book an Appointment'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="appointment-grid">
            <label>
              {isTagalog ? 'Pasyente' : 'Patient'}

              <select
                name="patient_id"
                value={form.patient_id}
                onChange={handleChange}
                required
              >
                <option value="">
                  {isTagalog
                    ? 'Pumili ng pasyente'
                    : 'Select patient'}
                </option>

                {patients.map((patient) => (
                  <option
                    key={patient.patient_id}
                    value={patient.patient_id}
                  >
                    {patient.full_name}
                    {patient.patient_code
                      ? ` (${patient.patient_code})`
                      : ''}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {isTagalog ? 'Doktor' : 'Doctor'}

              <select
                name="doctor_id"
                value={form.doctor_id}
                onChange={handleChange}
                required
              >
                <option value="">
                  {isTagalog
                    ? 'Pumili ng doktor'
                    : 'Select doctor'}
                </option>

                {doctors.map((doctor) => (
                  <option
                    key={doctor.doctor_id}
                    value={doctor.doctor_id}
                  >
                    {doctor.doctor_name}
                    {doctor.specialization
                      ? ` — ${doctor.specialization}`
                      : ''}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t('appointmentDate')}

              <input
                type="date"
                name="date"
                min={new Date().toLocaleDateString('en-CA')}
                value={form.date}
                onChange={handleChange}
                required
              />
            </label>

            <label className="full-width">
              {isTagalog
                ? 'Dahilan ng Pagbisita'
                : 'Reason for Visit'}

              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder={
                  isTagalog
                    ? 'Ilarawan ang dahilan ng appointment'
                    : 'Describe the reason for the appointment'
                }
                maxLength={255}
                required
              />
            </label>
          </div>

          <button
            className="book-button"
            type="submit"
            disabled={saving}
          >
            {saving
              ? isTagalog
                ? 'Sine-save...'
                : 'Saving...'
              : isTagalog
                ? '+ Mag-book ng Appointment'
                : '+ Book Appointment'}
          </button>
        </form>
      </section>

      <section className="appointment-card">
        <h2>
          {isTagalog
            ? 'Listahan ng mga Appointment'
            : 'Appointment List'}
        </h2>

        {loading ? (
          <p>{t('loadingAppointments')}</p>
        ) : appointments.length === 0 ? (
          <p className="empty-state">
            {isTagalog
              ? 'Walang nahanap na appointment sa database.'
              : 'No appointments found in the database.'}
          </p>
        ) : (
          <div className="appointment-list">
            {appointments.map((appointment) => (
              <article
                className="appointment-item"
                key={appointment.appointment_id}
              >
                <div>
                  <h3>
                    {appointment.patient_name ||
                      `Patient #${appointment.patient_id}`}
                  </h3>

                  <p>
                    {isTagalog ? 'Doktor:' : 'Doctor:'}{' '}
                    {appointment.doctor_name ||
                      `Doctor #${appointment.doctor_id}`}
                  </p>

                  <p>
                    {t('appointmentDate')}:{' '}
                    {new Date(
                      appointment.appointment_date
                    ).toLocaleDateString(
                      isTagalog ? 'fil-PH' : 'en-PH',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'Asia/Manila',
                      }
                    )}
                  </p>

                  <p>
                    {isTagalog ? 'Queue Number:' : 'Queue Number:'}{' '}
                    <strong>
                      {String(
                        appointment.queue_number
                      ).padStart(3, '0')}
                    </strong>
                  </p>

                  <p>
                    {isTagalog
                      ? 'Uri ng Appointment:'
                      : 'Appointment Type:'}{' '}
                    <strong
                      className={`appointment-type-badge ${
                        appointment.appointment_type === 'Video Call'
                          ? 'video-call'
                          : 'face-to-face'
                      }`}
                    >
                      {translateType(
                        appointment.appointment_type,
                        language
                      )}
                    </strong>
                  </p>

                  <p>
                    {isTagalog ? 'Dahilan:' : 'Reason:'}{' '}
                    {appointment.reason}
                  </p>

                  <p>
                    {t('status')}:{' '}
                    <strong>
                      {translateStatus(
                        appointment.status,
                        language
                      )}
                    </strong>
                  </p>
                </div>

                <label>
                  {isTagalog
                    ? 'I-update ang status'
                    : 'Update status'}

                  <select
                    value={appointment.status}
                    onChange={(event) =>
                      updateStatus(
                        appointment.appointment_id,
                        event.target.value
                      )
                    }
                  >
                    {[
                      'Pending',
                      'Confirmed',
                      'Completed',
                      'Cancelled',
                    ].map((status) => (
                      <option key={status} value={status}>
                        {translateStatus(status, language)}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
