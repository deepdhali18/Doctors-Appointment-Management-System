const Doctor = require('../models/Doctor');

const specialtyRules = [
  { specialty: 'Cardiologist', keywords: ['chest pain', 'heart pain', 'palpitation', 'palpitations', 'irregular heartbeat', 'high blood pressure', 'hypertension', 'shortness of breath', 'breathlessness'] },
  { specialty: 'Dermatologist', keywords: ['skin', 'rash', 'itching', 'acne', 'pimple', 'eczema', 'psoriasis', 'hair loss', 'fungal infection'] },
  { specialty: 'Gastroenterologist', keywords: ['stomach pain', 'abdominal pain', 'gastric', 'acidity', 'acid reflux', 'vomiting', 'diarrhea', 'constipation', 'indigestion', 'ulcer'] },
  { specialty: 'Neurologist', keywords: ['migraine', 'severe headache', 'headache', 'dizziness', 'vertigo', 'seizure', 'numbness', 'tingling', 'memory loss'] },
  { specialty: 'Orthopedic', keywords: ['bone', 'joint pain', 'back pain', 'knee pain', 'shoulder pain', 'fracture', 'arthritis', 'neck pain', 'muscle pain'] },
  { specialty: 'Pediatrician', keywords: ['child', 'baby', 'infant', 'kid', 'children', 'newborn'] },
  { specialty: 'Gynecologist', keywords: ['period pain', 'periods', 'menstrual', 'pregnancy', 'pregnant', 'pcos', 'pcod', 'ovarian', 'women health'] },
  { specialty: 'ENT Specialist', keywords: ['ear pain', 'hearing', 'sinus', 'sinusitis', 'sore throat', 'throat pain', 'tonsil', 'nose bleed', 'blocked nose'] },
  { specialty: 'Ophthalmologist', keywords: ['eye pain', 'eye redness', 'blurred vision', 'vision', 'eyesight', 'cataract', 'dry eyes'] },
  { specialty: 'Dentist', keywords: ['tooth pain', 'toothache', 'teeth', 'gum pain', 'cavity', 'dental'] },
  { specialty: 'Psychiatrist', keywords: ['anxiety', 'panic attack', 'depression', 'stress', 'sleep problem', 'insomnia', 'mental health'] },
  { specialty: 'General Physician', keywords: ['fever', 'cold', 'cough', 'flu', 'weakness', 'fatigue', 'body pain', 'infection', 'not feeling well'] },
];

const emergencyWords = [
  'severe chest pain', 'crushing chest pain', 'difficulty breathing', 'cannot breathe', 'unable to breathe',
  'loss of consciousness', 'unconscious', 'fainted', 'stroke', 'face drooping', 'slurred speech',
  'one side weakness', 'severe bleeding', 'heavy bleeding', 'suicidal', 'suicide', 'overdose', 'seizure lasting',
];

const cleanText = (value = '') => {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
};

const isEmergency = (message) => {
  const text = cleanText(message);
  return emergencyWords.some(keyword => text.includes(keyword));
};

const findSpecialty = (message) => {
  const text = cleanText(message);
  let best = null;
  let bestScore = 0;
  for (const rule of specialtyRules) {
    const score = rule.keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = rule.specialty;
    }
  }
  return best;
};

const findDoctors = async (specialization) => {
  if (!specialization) return [];
  const exact = await Doctor.find({
    isDoctor: true,
    specialization: { $regex: `^${specialization}$`, $options: 'i' },
  }).populate('user', 'firstname lastname email profileImage').sort({ experience: -1, fees: 1 }).limit(6);

  if (exact.length) return exact;

  return Doctor.find({
    isDoctor: true,
    specialization: { $regex: specialization, $options: 'i' },
  }).populate('user', 'firstname lastname email profileImage').sort({ experience: -1, fees: 1 }).limit(6);
};

const doctorInfo = (doctor) => ({
  id: doctor._id,
  doctorUserId: doctor.user?._id,
  name: doctor.user ? `Dr. ${doctor.user.firstname || ''} ${doctor.user.lastname || ''}`.replace(/\s+/g, ' ').trim() : 'Doctor',
  specialization: doctor.specialization,
  experience: doctor.experience || 0,
  fees: doctor.fees,
  qualifications: doctor.qualifications || '',
  profileImage: doctor.user?.profileImage || '',
});

const getAiSpecialty = async (message) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;


  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: `You are a healthcare navigation classifier, not a doctor. Select one specialty from this exact list: ${specialties}. If the message is not enough to recommend a specialty, return NONE. Return only the specialty name or NONE. Do not diagnose or recommend medication.`,
          },
          { role: 'user', content: message },
        ],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();
    if (!answer || answer.toUpperCase() === 'NONE') return null;
    return specialtyRules.some(r => r.specialty.toLowerCase() === answer.toLowerCase())
      ? specialtyRules.find(r => r.specialty.toLowerCase() === answer.toLowerCase()).specialty
      : null;
  } catch {
    return null;
  }
};

exports.message = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Please enter a message.' });
    }

    const cleanMessage = message.trim();

    if (isEmergency(cleanMessage)) {
      return res.json({
        urgent: true,
        specialization: null,
        doctors: [],
        message: 'Your message describes symptoms that may require urgent medical attention. Please contact your local emergency service or go to the nearest emergency department now. Do not wait for a routine appointment. I can still help with non-emergency doctor navigation after you are safe.',
      });
    }

    let specialization = findSpecialty(cleanMessage);
    if (!specialization) specialization = await getAiSpecialty(cleanMessage);

    if (!specialization) {
      return res.json({
        urgent: false,
        specialization: null,
        doctors: [],
        message: 'I can help you find the right type of doctor. Please describe your main symptom, where you feel it, and how long you have had it. I will use that information only to guide you to an appropriate medical specialty, not to diagnose you.',
      });
    }

    const doctors = await findDoctors(specialization);
    const formattedDoctors = doctors.map(doctorInfo);

    return res.json({
      urgent: false,
      specialization,
      doctors: formattedDoctors,
      message: formattedDoctors.length
        ? `Based on the symptoms you described, a ${specialization} may be a suitable specialist to consult. I found ${formattedDoctors.length} doctor${formattedDoctors.length > 1 ? 's' : ''} in that specialty. You can select one below to continue with an appointment.`
        : `Based on the symptoms you described, a ${specialization} may be a suitable specialist to consult. I could not find an available doctor in that specialty right now. You can browse all doctors or try another description of your symptoms.`,
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'The assistant could not process your request right now.' });
  }
};
