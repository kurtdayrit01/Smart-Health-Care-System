
import React, { useEffect, useState } from 'react';
import './PatientBookAppointment.css';
import { useLanguage } from './LanguageContext.jsx';

const API = 'http://localhost:4000/api/appointments';

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getCurrentMonth() {
  return getLocalDateString(new Date()).slice(0, 7);
}

function formatTime(time) {
  const [hour, minute] = time.split(':').map(Number);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export default function PatientBookAppointment() {
  const { language } = useLanguage();
  const isTagalog = language === 'Tagalog';

  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');

  const [appointmentType, setAppointmentType] = useState('Face-to-Face');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  const [month, setMonth] = useState(getCurrentMonth());
  const [availableDates, setAvailableDates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');
  const [success, setSuccess] = useState('');

  const token = sessionStorage.getItem('token') || '';

  const today = getLocalDateString(new Date());
  const minimumMonth = getCurrentMonth();

  const [year, monthNumber] = month.split('-').map(Number);

  const firstDay = new Date(year, monthNumber - 1, 1).getDay();
  const daysInMonth = new Date(year, monthNumber, 0).getDate();

  const calendarCells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      return `${month}-${String(day).padStart(2, '0')}`;
    }),
  ];

  const availableDateMap = new Map(
    availableDates.map((item) => [item.date, item])
  );

  const selectedDateInfo = availableDateMap.get(date);

  // Load doctors
  useEffect(() => {
    async function loadDoctors() {
      try {
        const response = await fetch(
          `${API}/options/patient-doctors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load doctors.');
        }

        setDoctors(data);
      } catch (err) {
        setError(
          isTagalog
            ? 'Hindi ma-load ang listahan ng mga doktor. Pakisubukang muli.'
            : err.message || 'Unable to load doctors.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadDoctors();
  }, [token]);

  // Load available dates and time slots
  useEffect(() => {
    if (!doctorId) {
      setAvailableDates([]);
      setAvailabilityError('');
      return;
    }

    const controller = new AbortController();

    async function loadAvailability() {
      setAvailabilityLoading(true);
      setAvailabilityError('');
      setAvailableDates([]);
      setDate('');
      setTime('');

      try {
        const response = await fetch(
          `${API}/patient/availability?doctor_id=${doctorId}&month=${month}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Unable to load available appointment dates.'
          );
        }

        setAvailableDates(data.available_dates || []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setAvailabilityError(
            isTagalog
              ? 'Hindi ma-load ang mga available na petsa. Pakisubukang muli.'
              : err.message || 'Unable to load available appointment dates.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setAvailabilityLoading(false);
        }
      }
    }

    loadAvailability();

    return () => controller.abort();
  }, [doctorId, month, token]);

  function changeMonth(direction) {
    const [currentYear, currentMonth] = month.split('-').map(Number);

    const nextDate = new Date(
      currentYear,
      currentMonth - 1 + direction,
      1
    );

    const nextMonth =
      `${nextDate.getFullYear()}-${String(
        nextDate.getMonth() + 1
      ).padStart(2, '0')}`;

    if (nextMonth < minimumMonth) return;

    setMonth(nextMonth);
    setDate('');
    setTime('');
    setError('');
  }

  function selectDate(selectedDate) {
    if (!availableDateMap.has(selectedDate)) return;

    setDate(selectedDate);
    setTime('');
    setError('');
  }

  function selectTime(selectedTime) {
    setTime(selectedTime);
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (
      !doctorId ||
      !appointmentType ||
      !date ||
      !time ||
      !reason.trim()
    ) {
      setError(
        isTagalog
          ? 'Pakikumpleto ang lahat ng kinakailangang impormasyon.'
          : 'Please complete all required fields.'
      );
      return;
    }

    if (date < today) {
      setError(
        isTagalog
          ? 'Pumili ng petsa ngayong araw o sa susunod na mga araw.'
          : 'Please select today or a future appointment date.'
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API}/patient/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctor_id: Number(doctorId),
          appointment_type: appointmentType,
          appointment_date: date,
          appointment_time: time,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Booking failed.');
      }

      const queueNumber = String(data.queue_number).padStart(3, '0');

      setSuccess(
        isTagalog
          ? `Matagumpay na na-book ang iyong appointment! Ang iyong Queue Number ay ${queueNumber}.`
          : `Appointment booked successfully! Your Queue Number is ${queueNumber}.`
      );

      setDoctorId('');
      setAppointmentType('Face-to-Face');
      setDate('');
      setTime('');
      setReason('');
    } catch (err) {
      setError(
        isTagalog
          ? 'Hindi naisumite ang appointment. Pakisuri ang impormasyon at subukang muli.'
          : err.message || 'Booking failed.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="patient-booking-page">
      <header className="patient-booking-header">
        <h1>
          {isTagalog ? 'Mag-book ng Appointment' : 'Book an Appointment'}
        </h1>

        <p>
          {isTagalog
            ? 'Mag-iskedyul ng konsultasyon sa isa sa aming mga healthcare professional.'
            : 'Schedule your consultation with one of our healthcare professionals.'}
        </p>
      </header>

      <section className="patient-booking-card">
        <div className="patient-booking-section-title">
          <h2>
            {isTagalog
              ? 'Impormasyon ng Appointment'
              : 'Appointment Information'}
          </h2>

          <p>
            {isTagalog
              ? 'Punan ang mga detalye sa ibaba upang humiling ng appointment.'
              : 'Fill in the details below to request an appointment.'}
          </p>
        </div>

        {/* APPOINTMENT NOTICE */}
        <div className="patient-booking-note">
          <strong>
            {isTagalog ? 'Paalala sa Appointment' : 'Appointment Notice'}
          </strong>

          <p>
            {isTagalog
              ? 'Ang iyong kahilingan sa appointment ay ligtas na iuugnay sa iyong rehistradong patient profile. Tiyaking tama at updated ang impormasyon ng iyong account.'
              : 'Your appointment request will be securely associated with your registered patient profile. Please ensure that your account information is accurate and up to date.'}
          </p>
        </div>

        {error && (
          <div className="patient-booking-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="patient-booking-success" role="status">
            {success}
          </div>
        )}

        {loading ? (
          <p>
            {isTagalog
              ? 'Naglo-load ng mga available na doktor...'
              : 'Loading available doctors...'}
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* DOCTOR SELECTION */}
            <div className="patient-booking-field">
              <label htmlFor="booking-doctor">
                {isTagalog ? 'Piling Doktor' : 'Preferred Doctor'} *
              </label>

              <select
                id="booking-doctor"
                value={doctorId}
                onChange={(e) => {
                  setDoctorId(e.target.value);
                  setDate('');
                  setTime('');
                  setError('');
                  setSuccess('');
                }}
                required
              >
                <option value="">
                  {isTagalog ? 'Pumili ng Doktor' : 'Select a doctor'}
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
            </div>

            {/* APPOINTMENT TYPE */}
            <div className="patient-booking-field">
              <label>
                {isTagalog ? 'Uri ng Appointment' : 'Appointment Type'} *
              </label>

              <div className="appointment-type-options">
                <label
                  className={`appointment-type-card ${
                    appointmentType === 'Face-to-Face' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="appointmentType"
                    value="Face-to-Face"
                    checked={appointmentType === 'Face-to-Face'}
                    onChange={(e) =>
                      setAppointmentType(e.target.value)
                    }
                  />

                  <span className="appointment-type-icon">🏥</span>

                  <strong>
                    {isTagalog
                      ? 'Personal na Konsultasyon'
                      : 'Face-to-Face'}
                  </strong>

                  <small>
                    {isTagalog
                      ? 'Pumunta sa klinika para sa konsultasyon.'
                      : 'Visit the clinic for consultation.'}
                  </small>
                </label>

                <label
                  className={`appointment-type-card ${
                    appointmentType === 'Video Call' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="appointmentType"
                    value="Video Call"
                    checked={appointmentType === 'Video Call'}
                    onChange={(e) =>
                      setAppointmentType(e.target.value)
                    }
                  />

                  <span className="appointment-type-icon">📹</span>

                  <strong>Video Call</strong>

                  <small>
                    {isTagalog
                      ? 'Kumonsulta sa iyong doktor online.'
                      : 'Consult with your doctor online.'}
                  </small>
                </label>
              </div>
            </div>

            {/* AVAILABLE DATE CALENDAR */}
            <div className="patient-booking-field">
              <label>
                {isTagalog
                  ? 'Pumili ng Petsa ng Appointment'
                  : 'Choose Appointment Date'} *
              </label>

              {!doctorId ? (
                <p>
                  {isTagalog
                    ? 'Pumili muna ng doktor upang makita ang mga available na petsa.'
                    : 'Please select a doctor first to see available dates.'}
                </p>
              ) : (
                <div className="booking-calendar">
                  <div className="booking-calendar-header">
                    <button
                      type="button"
                      onClick={() => changeMonth(-1)}
                      disabled={
                        month <= minimumMonth || availabilityLoading
                      }
                    >
                      {isTagalog ? 'Nakaraan' : 'Previous'}
                    </button>

                    <strong>
                      {new Date(
                        year,
                        monthNumber - 1,
                        1
                      ).toLocaleDateString(
                        isTagalog ? 'fil-PH' : 'en-US',
                        {
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                    </strong>

                    <button
                      type="button"
                      onClick={() => changeMonth(1)}
                      disabled={availabilityLoading}
                    >
                      {isTagalog ? 'Susunod' : 'Next'}
                    </button>
                  </div>

                  {availabilityLoading ? (
                    <p>
                      {isTagalog
                        ? 'Naglo-load ng mga available na petsa...'
                        : 'Loading available dates...'}
                    </p>
                  ) : availabilityError ? (
                    <p className="patient-booking-error">
                      {availabilityError}
                    </p>
                  ) : (
                    <>
                      <div className="booking-calendar-grid">
                        {(isTagalog
                          ? ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab']
                          : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                        ).map((day) => (
                          <strong
                            key={day}
                            className="calendar-weekday"
                          >
                            {day}
                          </strong>
                        ))}

                        {calendarCells.map((calendarDate, index) => {
                          if (!calendarDate) {
                            return (
                              <span
                                key={`empty-${index}`}
                                className="calendar-empty"
                              />
                            );
                          }

                          const available =
                            availableDateMap.has(calendarDate);

                          const selected = date === calendarDate;

                          return (
                            <button
                              key={calendarDate}
                              type="button"
                              disabled={!available}
                              onClick={() => selectDate(calendarDate)}
                              className={`calendar-date ${
                                available ? 'available' : 'unavailable'
                              } ${selected ? 'selected' : ''}`}
                              aria-pressed={selected}
                              title={
                                available
                                  ? isTagalog
                                    ? 'May available na appointment sa petsang ito'
                                    : 'Available appointment date'
                                  : isTagalog
                                    ? 'Walang available na appointment'
                                    : 'No available appointments'
                              }
                            >
                              {Number(calendarDate.slice(-2))}
                            </button>
                          );
                        })}
                      </div>

                      <div className="booking-calendar-legend">
                        <span>
                          🟢 {isTagalog ? 'Available' : 'Available'}
                        </span>

                        <span>
                          ⚪ {isTagalog ? 'Hindi Available' : 'Unavailable'}
                        </span>
                      </div>

                      {availableDates.length === 0 && (
                        <p>
                          {isTagalog
                            ? 'Walang available na petsa ng appointment para sa buwang ito. Subukan ang ibang buwan.'
                            : 'No available appointment dates for this month. Try another month.'}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* AVAILABLE TIME SLOTS */}
            {date && selectedDateInfo && (
              <div className="patient-booking-field">
                <label>
                  {isTagalog
                    ? 'Pumili ng Available na Oras'
                    : 'Choose Available Time'} *
                </label>

                <p>
                  {isTagalog ? 'Napiling Petsa:' : 'Selected date:'}{' '}
                  <strong>{date}</strong>
                </p>

                <div className="booking-time-slots">
                  {selectedDateInfo.slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`booking-time-button ${
                        time === slot ? 'selected' : ''
                      }`}
                      onClick={() => selectTime(slot)}
                      aria-pressed={time === slot}
                    >
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>

                {selectedDateInfo.slots.length === 0 && (
                  <p>
                    {isTagalog
                      ? 'Walang available na oras para sa petsang ito.'
                      : 'No available time slots for this date.'}
                  </p>
                )}
              </div>
            )}

            {/* REASON */}
            <div className="patient-booking-field">
              <label htmlFor="booking-reason">
                {isTagalog
                  ? 'Dahilan ng Konsultasyon'
                  : 'Reason for Consultation'} *
              </label>

              <textarea
                id="booking-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  isTagalog
                    ? 'Ilarawan ang dahilan ng iyong konsultasyon...'
                    : 'Please describe your reason for consultation...'
                }
                maxLength={255}
                rows={5}
                required
              />

              <small>
                {isTagalog
                  ? 'Maximum na 255 character.'
                  : 'Maximum of 255 characters.'}
              </small>
            </div>

            {/* REMINDER */}
            <div className="patient-booking-reminder">
              <strong>
                {isTagalog ? 'Mahalagang Paalala' : 'Important Reminder'}
              </strong>

              <p>
                {isTagalog
                  ? 'Ang iyong appointment ay mamarkahang Pending hanggang masuri ito ng healthcare staff. Awtomatikong itatalaga ang iyong queue number.'
                  : 'Your appointment will be marked as Pending until it has been reviewed by the healthcare staff. Your queue number is assigned automatically.'}
              </p>

              <p>
                {isTagalog
                  ? 'Available ang mga schedule mula Lunes hanggang Sabado, 6:00 AM hanggang 12:00 PM. Bawat appointment ay tatagal ng 30 minuto.'
                  : 'Available schedules are Monday to Saturday, from 6:00 AM to 12:00 PM. Each appointment lasts 30 minutes.'}
              </p>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={
                saving ||
                availabilityLoading ||
                !doctorId ||
                !date ||
                !time
              }
            >
              {saving
                ? isTagalog
                  ? 'Isinusumite ang Kahilingan...'
                  : 'Submitting Request...'
                : isTagalog
                  ? 'Isumite ang Kahilingan sa Appointment'
                  : 'Submit Appointment Request'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
