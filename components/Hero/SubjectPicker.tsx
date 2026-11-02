import { useState } from 'react';

type Props = {
  subjects: string[];
  value: string;
  onChange: (value: string) => void;
  copy: {
    subjectLabel: string;
    otherSubjects: string;
    moreSubjects: string;
    noSubject: string;
  };
};

// The first four catalogue entries, without claiming a popularity ranking.
// Native radios provide one selection, arrow keys and an announced checked state.
export default function SubjectPicker({
  subjects,
  value,
  onChange,
  copy,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const selectedInRest = subjects.slice(4).includes(value);
  const option = (subject: string, label = subject) => (
    <label key={subject} className="sika-subject-option">
      <input
        type="radio"
        name="hero-subject"
        value={subject}
        checked={value === subject}
        onChange={() => onChange(subject)}
      />
      <span className="sika-subject-chip">
        <span>{label}</span>
        <span className="sika-subject-check" aria-hidden="true">
          ✓
        </span>
      </span>
    </label>
  );
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 text-sm font-semibold">
        {copy.subjectLabel}
      </legend>
      <div className="sika-subject-options">
        {subjects.slice(0, 4).map(subject => option(subject))}
      </div>
      {subjects.length > 4 && (
        <>
          <button
            type="button"
            className="sika-text-link mt-2 text-sm"
            aria-expanded={expanded}
            aria-controls="other-subjects"
            onClick={() => setExpanded(current => !current)}
          >
            {copy.moreSubjects}
            {selectedInRest && !expanded ? ` · ${value}` : ''}{' '}
            <span aria-hidden="true">{expanded ? '−' : '+'}</span>
          </button>
          <div id="other-subjects" hidden={!expanded}>
            <p className="mb-3 text-sm">{copy.otherSubjects}</p>
            <div className="sika-subject-options">
              {subjects.slice(4).map(subject => option(subject))}
            </div>
          </div>
        </>
      )}
      <div className="sika-subject-optional mt-3">
        {option('', copy.noSubject)}
      </div>
    </fieldset>
  );
}
