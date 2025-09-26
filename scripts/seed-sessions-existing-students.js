const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function addMinutes(iso, minutes) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

const SUBJECTS = ['Mathématiques', 'Physique', 'Français', 'Chimie'];
const LEVELS = ['Seconde', 'Première', 'Terminale'];
const TYPES = ['AVA', 'TODA', 'NOTA'];

async function seedForStudent(studentUser) {
  // pick a tutor
  const { data: tutors, error: tutorsError } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'TUTOR')
    .eq('is_active', true)
    .limit(3);
  if (tutorsError) throw tutorsError;
  if (!tutors || tutors.length === 0) {
    console.log('No tutors found, skipping student', studentUser.email);
    return;
  }

  const tutorIds = tutors.map(t => t.id);

  const sessions = [
    // two completed in the past week
    {
      student_id: studentUser.id,
      tutor_id: tutorIds[0],
      subject: SUBJECTS[Math.floor(Math.random()*SUBJECTS.length)],
      level: LEVELS[Math.floor(Math.random()*LEVELS.length)],
      type: TYPES[Math.floor(Math.random()*TYPES.length)],
      status: 'COMPLETED',
      started_at: daysFromNow(-7),
      completed_at: addMinutes(daysFromNow(-7), 60),
      duration_minutes: 60,
      topics_covered: 'Révisions, Exercices ciblés',
      homework_assigned: 'Feuille d\'exercices n°2',
      student_rating: Math.floor(Math.random() * 2) + 4 // 4-5
    },
    {
      student_id: studentUser.id,
      tutor_id: tutorIds[1 % tutorIds.length],
      subject: SUBJECTS[Math.floor(Math.random()*SUBJECTS.length)],
      level: LEVELS[Math.floor(Math.random()*LEVELS.length)],
      type: TYPES[Math.floor(Math.random()*TYPES.length)],
      status: 'COMPLETED',
      started_at: daysFromNow(-3),
      completed_at: addMinutes(daysFromNow(-3), 90),
      duration_minutes: 90,
      topics_covered: 'Méthodologie, Problèmes types',
      homework_assigned: 'Annales – Sujet 2022',
      student_rating: Math.floor(Math.random() * 2) + 4
    },
    // one in progress today
    {
      student_id: studentUser.id,
      tutor_id: tutorIds[2 % tutorIds.length],
      subject: SUBJECTS[Math.floor(Math.random()*SUBJECTS.length)],
      level: LEVELS[Math.floor(Math.random()*LEVELS.length)],
      type: TYPES[Math.floor(Math.random()*TYPES.length)],
      status: 'IN_PROGRESS',
      started_at: daysFromNow(0),
      duration_minutes: 60,
      topics_covered: 'Cours en cours',
      homework_assigned: ''
    },
    // one scheduled in 2 days
    {
      student_id: studentUser.id,
      tutor_id: tutorIds[0],
      subject: SUBJECTS[Math.floor(Math.random()*SUBJECTS.length)],
      level: LEVELS[Math.floor(Math.random()*LEVELS.length)],
      type: TYPES[Math.floor(Math.random()*TYPES.length)],
      status: 'SCHEDULED',
      started_at: daysFromNow(2),
      duration_minutes: 60,
      topics_covered: '',
      homework_assigned: ''
    }
  ];

  for (const s of sessions) {
    const { error: insertError } = await supabase.from('sessions').insert(s).select().single();
    if (insertError) {
      console.log('Insert session error for', studentUser.email, insertError.message);
    } else {
      console.log('Inserted session for', studentUser.email, s.subject, s.status);
    }
  }
}

(async function main() {
  try {
    console.log('Seeding 4 sessions per existing student...');
    const { data: students, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('role', 'STUDENT')
      .eq('is_active', true);
    if (error) throw error;
    if (!students || students.length === 0) {
      console.log('No students found. Exiting.');
      process.exit(0);
    }

    for (const stu of students) {
      await seedForStudent(stu);
    }

    console.log('Done seeding sessions.');
  } catch (e) {
    console.error('Seed error:', e);
    process.exit(1);
  }
})();
