
import React, { useMemo, useState } from 'react';

export default function PatientMedicineInformation({ language = 'English' }) {
  const [search, setSearch] = useState('');

  const isEnglish = language === 'English';

const medicines = [
  {
    name: 'Paracetamol',
    category: 'Pain Reliever / Fever Reducer',
    categoryTL: 'Pampawala ng Sakit at Lagnat',
    description: 'Commonly used to relieve mild to moderate pain and reduce fever.',
    descriptionTL: 'Karaniwang ginagamit upang maibsan ang banayad hanggang katamtamang pananakit at mapababa ang lagnat.',
    uses: 'Pain and fever relief',
    usesTL: 'Pagpapaginhawa ng pananakit at lagnat',
    reminder: 'Follow the instructions provided by a qualified healthcare professional.',
    reminderTL: 'Sundin ang mga tagubilin ng kwalipikadong healthcare professional.'
  },
  {
    name: 'Ibuprofen',
    category: 'Nonsteroidal Anti-inflammatory Drug',
    categoryTL: 'Gamot na Pampabawas ng Pamamaga',
    description: 'An anti-inflammatory medicine used for certain types of pain, swelling, and fever.',
    descriptionTL: 'Isang gamot na ginagamit para sa ilang uri ng pananakit, pamamaga, at lagnat.',
    uses: 'Pain, inflammation, and fever',
    usesTL: 'Pananakit, pamamaga, at lagnat',
    reminder: 'May not be suitable for everyone. Ask a healthcare professional before use.',
    reminderTL: 'Maaaring hindi ito angkop para sa lahat. Kumonsulta muna sa healthcare professional bago gamitin.'
  },
  {
    name: 'Cetirizine',
    category: 'Antihistamine',
    categoryTL: 'Gamot sa Allergy',
    description: 'An antihistamine commonly used to relieve allergy symptoms.',
    descriptionTL: 'Isang gamot na karaniwang ginagamit upang maibsan ang mga sintomas ng allergy.',
    uses: 'Allergy symptoms',
    usesTL: 'Mga sintomas ng allergy',
    reminder: 'Some people may experience drowsiness. Check the product information.',
    reminderTL: 'Maaaring makaranas ng antok ang ilang tao. Basahin ang impormasyon ng produkto.'
  },
  {
    name: 'Oral Rehydration Salts',
    category: 'Rehydration Solution',
    categoryTL: 'Solusyon para sa Rehydration',
    description: 'A preparation used to help replace water and electrolytes lost through dehydration.',
    descriptionTL: 'Isang preparasyon na tumutulong magpalit ng tubig at electrolytes na nawawala dahil sa dehydration.',
    uses: 'Fluid and electrolyte replacement',
    usesTL: 'Pagpapalit ng nawawalang tubig at electrolytes',
    reminder: 'Prepare according to the product instructions or healthcare professional guidance.',
    reminderTL: 'Ihanda ayon sa tagubilin ng produkto o payo ng healthcare professional.'
  },
  {
    name: 'Vitamin C',
    category: 'Vitamin Supplement',
    categoryTL: 'Dagdag na Bitamina',
    description: 'A vitamin that supports normal body functions, including immune system function.',
    descriptionTL: 'Isang bitamina na sumusuporta sa normal na paggana ng katawan, kabilang ang immune system.',
    uses: 'Vitamin C supplementation',
    usesTL: 'Dagdag na Vitamin C',
    reminder: 'Supplements are not a substitute for a balanced diet or medical treatment.',
    reminderTL: 'Hindi kapalit ng balanseng pagkain o medikal na paggamot ang mga supplement.'
  }
];

  const filteredMedicines = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return medicines;

    return medicines.filter((medicine) =>
      [
        medicine.name,
        medicine.category,
        medicine.description,
        medicine.uses,
      ].some((value) => value.toLowerCase().includes(keyword))
    );
  }, [search]);

  const styles = {
    page: {
      width: '100%',
      color: '#17365d',
    },
    header: {
      marginBottom: '25px',
    },
    eyebrow: {
      color: '#0796a5',
      fontSize: '12px',
      fontWeight: '700',
      letterSpacing: '1.5px',
      marginBottom: '10px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      margin: '0 0 8px',
    },
    subtitle: {
      color: '#718096',
      fontSize: '14px',
      margin: 0,
    },
    searchBox: {
      background: '#ffffff',
      border: '1px solid #b8cce2',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: '0 3px 10px rgba(20, 50, 90, 0.05)',
    },
    input: {
      width: '100%',
      boxSizing: 'border-box',
      padding: '13px 15px',
      border: '1px solid #b8cce2',
      borderRadius: '8px',
      fontSize: '14px',
      outlineColor: '#0796a5',
      color: '#17365d',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
    },
    card: {
      background: '#ffffff',
      border: '1px solid #b8cce2',
      borderRadius: '12px',
      padding: '22px',
      boxShadow: '0 4px 12px rgba(20, 50, 90, 0.07)',
    },
    icon: {
      width: '46px',
      height: '46px',
      borderRadius: '12px',
      background: '#eaf2f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '23px',
      marginBottom: '16px',
    },
    medicineName: {
      fontSize: '19px',
      fontWeight: '700',
      color: '#17365d',
      margin: '0 0 8px',
    },
    category: {
      display: 'inline-block',
      background: '#e9f5f8',
      color: '#087e91',
      padding: '6px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      marginBottom: '15px',
    },
    description: {
      color: '#63758b',
      fontSize: '13px',
      lineHeight: '1.7',
      minHeight: '65px',
    },
    info: {
      borderTop: '1px solid #e3eaf2',
      paddingTop: '13px',
      marginTop: '14px',
      fontSize: '13px',
      lineHeight: '1.6',
    },
    reminder: {
      background: '#f3f7fb',
      borderLeft: '3px solid #0796a5',
      borderRadius: '5px',
      padding: '11px',
      color: '#52657c',
      fontSize: '12px',
      lineHeight: '1.6',
      marginTop: '13px',
    },
    empty: {
      background: '#ffffff',
      border: '1px solid #b8cce2',
      borderRadius: '12px',
      padding: '35px 20px',
      textAlign: 'center',
      color: '#718096',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.eyebrow}>SMART HEALTHCARE MANAGEMENT SYSTEM</div>

        <h1 style={styles.title}>
          {isEnglish ? 'Medicine Information' : 'Impormasyon sa Gamot'}
        </h1>

        <p style={styles.subtitle}>
          {isEnglish
            ? 'Browse general information about commonly known medicines.'
            : 'Tingnan ang pangkalahatang impormasyon tungkol sa mga karaniwang gamot.'}
        </p>
      </div>

      <div style={styles.searchBox}>
        <label
          htmlFor="medicine-search"
          style={{ display: 'block', fontWeight: '600', marginBottom: '10px' }}
        >
          {isEnglish ? 'Search Medicine' : 'Maghanap ng Gamot'}
        </label>

        <input
          id="medicine-search"
          type="text"
          placeholder={
            isEnglish
              ? 'Search by medicine name or category...'
              : 'Maghanap ayon sa pangalan o uri ng gamot...'
          }
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={styles.input}
        />

        <p style={{ color: '#718096', fontSize: '12px', marginBottom: 0 }}>
          {filteredMedicines.length}{' '}
          {isEnglish ? 'medicine(s) found' : 'gamot ang nakita'}
        </p>
      </div>

      {filteredMedicines.length > 0 ? (
        <div style={styles.grid}>
          {filteredMedicines.map((medicine) => (
            <div key={medicine.name} style={styles.card}>
              <div style={styles.icon}>💊</div>

              <h2 style={styles.medicineName}>{medicine.name}</h2>

              {isEnglish ? medicine.category : medicine.categoryTL}

              <p style={styles.description}>
               {isEnglish ? medicine.description : medicine.descriptionTL}
              </p>

              <div style={styles.info}>
                <strong>
                  {isEnglish ? 'General Information:' : 'Pangkalahatang Impormasyon:'}
                </strong>
                <p style={{ margin: '5px 0 0', color: '#63758b' }}>
              {isEnglish ? medicine.uses : medicine.usesTL}
                </p>
              </div>

              <div style={styles.reminder}>
                <strong>
                  {isEnglish ? 'Important Reminder' : 'Mahalagang Paalala'}
                </strong>
                <br />
             {isEnglish ? medicine.reminder : medicine.reminderTL}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.empty}>
          <div style={{ fontSize: '35px', marginBottom: '10px' }}>🔍</div>
          <strong>
            {isEnglish ? 'No medicine found' : 'Walang nahanap na gamot'}
          </strong>
          <p style={{ fontSize: '13px' }}>
            {isEnglish
              ? 'Try another medicine name or keyword.'
              : 'Subukan ang ibang pangalan o keyword.'}
          </p>
        </div>
      )}

      <div
        style={{
          marginTop: '25px',
          padding: '15px',
          background: '#fff8e8',
          border: '1px solid #f1dfb5',
          borderRadius: '9px',
          color: '#775c27',
          fontSize: '12px',
          lineHeight: '1.7',
        }}
      >
        <strong>
          {isEnglish ? 'Medical Disclaimer' : 'Paalalang Medikal'}
        </strong>
        <br />
        {isEnglish
          ? 'This page provides general educational information only. It does not provide prescriptions, personalized treatment, or dosage instructions. Consult a qualified healthcare professional for medication decisions.'
          : 'Ang page na ito ay nagbibigay lamang ng pangkalahatang impormasyong pang-edukasyon. Hindi ito nagbibigay ng reseta, personal na paggamot, o dosage instructions. Kumonsulta sa kwalipikadong healthcare professional para sa mga desisyon tungkol sa gamot.'}
      </div>
    </div>
  );
}
