import express from 'express';
import { auth } from './auth.js';

const router = express.Router();

const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat';
const MODEL = 'qwen2.5:1.5b';

function getPreparedAnswer(message, language) {
  const text = message.toLowerCase().trim();
  const isEnglish = language === 'English';

  // APPOINTMENT CANCELLATION
  if (
    /\b(cancel|cancellation|kansel|kanselahin)\b/.test(text) ||
    /mag.cancel/.test(text)
  ) {
    return isEnglish
      ? `To cancel an appointment:

1. Open My Appointments.
2. Find the appointment you want to cancel.
3. Use the available Cancel option.

I cannot cancel an appointment for you.`
      : `Para mag-cancel ng appointment:

1. Buksan ang My Appointments.
2. Hanapin ang appointment na gusto mong i-cancel.
3. Gamitin ang available Cancel option.

Hindi ako ang mismong nagca-cancel ng appointment.`;
  }

  // APPOINTMENT STATUS
  if (
    /\b(status|confirmed|confirmation|pending)\b/.test(text) ||
    /saan.*(appointment|booking).*(status|kalagayan)/.test(text) ||
    /status.*appointment/.test(text)
  ) {
    return isEnglish
      ? `To check your appointment status, open My Appointments. You can view your appointment records and available status information there.`
      : `Para makita ang status ng appointment mo, buksan ang My Appointments. Doon mo makikita ang iyong appointment records at available status information.`;
  }

  // APPOINTMENT BOOKING
  if (
    /\b(book|booking|schedule|appointment)\b/.test(text) ||
    /mag.book/.test(text) ||
    /magpa.appointment/.test(text)
  ) {
    return isEnglish
      ? `To book an appointment:

1. Open the Book Appointment page.
2. Select an available Department and Doctor.
3. Choose a Date and Time.
4. Review the details and submit your booking request.

Your appointment request may still need confirmation.`
      : `Para mag-book ng appointment:

1. Buksan ang Book Appointment page.
2. Piliin ang available Department at Doctor.
3. Piliin ang Date at Time.
4. I-check ang details at i-submit ang booking request.

Maaaring kailanganin pang kumpirmahin ang appointment request mo.`;
  }

  // PROFILE
  if (
    /\b(profile|personal information|account details)\b/.test(text) ||
    /i.update.*profile/.test(text) ||
    /baguhin.*profile/.test(text)
  ) {
    return isEnglish
      ? `To view or update your profile:

1. Open the My Profile page.
2. Find the information you want to change.
3. Use the available update or save option.`
      : `Para makita o i-update ang profile mo:

1. Buksan ang My Profile page.
2. Hanapin ang information na gusto mong baguhin.
3. Gamitin ang available update o save option sa page.`;
  }

  // MEDICINE INFORMATION
  if (
    /\b(medicine|medication|gamot|medicines)\b/.test(text) ||
    /medicine information/.test(text)
  ) {
    return isEnglish
      ? `To view medicine-related information, open the Medicine Information page.

For personal medication concerns, consult a qualified healthcare professional.`
      : `Para makita ang medicine-related information, buksan ang Medicine Information page.

Para sa personal medication concerns, kumonsulta muna sa qualified healthcare professional.`;
  }

  return null;
}

router.post('/chat', auth, async (req, res) => {
  try {
    const {
      message,
      history = [],
      language: requestedLanguage
    } = req.body;

    const language =
      requestedLanguage === 'Tagalog'
        ? 'Tagalog'
        : 'English';

    const isEnglish = language === 'English';

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        message: isEnglish
          ? 'Please enter a message.'
          : 'Maglagay muna ng mensahe.'
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        message: isEnglish
          ? 'Message is too long.'
          : 'Masyadong mahaba ang mensahe.'
      });
    }

    const preparedAnswer = getPreparedAnswer(message, language);

    if (preparedAnswer) {
      return res.json({
        reply: preparedAnswer
      });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(item =>
            ['user', 'assistant'].includes(item.role) &&
            typeof item.content === 'string'
          )
          .slice(-6)
          .map(item => ({
            role: item.role,
            content: item.content.slice(0, 2000)
          }))
      : [];

    const systemPrompt = `
You are the SHMS Patient Assistant.

SELECTED RESPONSE LANGUAGE:
The application's selected language is: ${language}.

STRICT LANGUAGE RULE:
- Always answer in ${language}.
- Do not switch languages just because the patient uses a different language.
- If English is selected, respond in clear, simple English.
- If Tagalog is selected, respond in natural, conversational Filipino/Taglish.
- Keep technical page names in English, such as Dashboard, Book Appointment, My Appointments, Medicine Information, My Profile, Department, Doctor, Date, and Time.
- The selected application language has priority over the language used in previous conversation messages.

MAIN PURPOSE:
Guide patients in using the Smart Healthcare Management System.

APPOINTMENT GUIDE:
- Explain how patients can book an appointment through the patient portal.
- Guide patients to the Book Appointment page when they want to schedule.
- Patients should select an available Department, Doctor, Date, and Time before submitting their booking request.
- Patients can check appointment records and status in My Appointments.
- Patients can use the available Cancel option in My Appointments.
- Appointment requests may need confirmation.
- Never claim that you booked, changed, or cancelled an appointment.
- Do not invent appointment availability, doctors, or booking statuses.

PATIENT PORTAL PAGES:
These are the actual patient portal pages:
1. Dashboard
2. Book Appointment
3. My Appointments
4. Medicine Information
5. My Profile

PAGE GUIDE:
- Dashboard: Main patient page where patients can view dashboard information.
- Book Appointment: Used to request a new appointment.
- My Appointments: Used to view appointment records and use the available Cancel option.
- Medicine Information: Used for medicine-related information.
- My Profile: Used to view or update profile information.

NAVIGATION RULES:
- Always use the exact page names listed above.
- Give simple step-by-step instructions when needed.
- Do not invent pages or features.
- Do not claim that a Billing page exists in the patient portal.
- Never invent an Appointment Status page.
- If a feature is unavailable or unknown, explain that clearly.

GENERAL RULES:
- Use simple and friendly language.
- Do not diagnose illnesses or prescribe medicine.
- For medical concerns, recommend consulting a qualified doctor.
- Never claim to have accessed patient records, billing details, or appointment information.
- Never invent email confirmations or appointment statuses.
- Only describe procedures supported by the actual SHMS system.

RESPONSE STYLE:
- Keep answers short, clear, and organized.
- Answer only what the patient asks.
- Use numbered steps for instructions.
- Do not add unrelated information.
- Never claim that you performed an action for the patient.
- You are an information assistant only.
`;

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...safeHistory,
          {
            role: 'user',
            content: message.trim()
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    const data = await response.json();

    res.json({
      reply: data.message?.content ||
        (isEnglish
          ? 'No response received.'
          : 'Walang natanggap na sagot.')
    });

  } catch (error) {
    console.error('SHMS AI error:', error.message);

    const isEnglish = req.body?.language !== 'Tagalog';

    res.status(503).json({
      message: isEnglish
        ? 'AI assistant is unavailable. Please try again.'
        : 'Hindi available ang AI Assistant sa ngayon. Subukan ulit mamaya.'
    });
  }
});

export default router;