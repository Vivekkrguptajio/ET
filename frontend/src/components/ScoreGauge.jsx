import { useEffect, useState } from 'react';
import './ScoreGauge.css';

const gradeMap = [
  { min: 90, grade: 'A+', color: 'var(--color-accent-green)', label: 'Excellent' },
  { min: 80, grade: 'A',  color: 'var(--color-accent-green)', label: 'Great' },
  { min: 70, grade: 'B+', color: 'var(--color-accent-blue)',  label: 'Good' },
  { min: 60, grade: 'B',  color: 'var(--color-accent-blue)',  label: 'Fair' },
  { min: 50, grade: 'C',  color: 'var(--color-accent-gold)',  label: 'Needs Work' },
  { min: 0,  grade: 'D',  color: 'var(--color-danger)',       label: 'Critical' },
];

function getGrade(score) {
  return gradeMap.find((g) => score >= g.min) || gradeMap[gradeMap.length - 1];
}

export default function ScoreGauge({ score = 0, animated = true }) {
  const [displayScore, setDisplayScore] = useState(0);
  const grade = getGrade(score);

  // Arc params
  const radius = 80;
  const circumference = Math.PI * radius; // half-circle
  const progress = (score / 100) * circumference;

  useEffect(() => {
    if (!animated) {
      // eslint-disable-next-line
      setDisplayScore(score);
      return () => {};
    }
    let current = 0;
    const step = Math.max(1, Math.floor(score / 60));
    const interval = setInterval(() => {
      current += step;
      if (current >= score) { current = score; clearInterval(interval); }
      setDisplayScore(current);
    }, 20);
    return () => clearInterval(interval);
  }, [score, animated]);

  return (
    <div className="score-gauge animate-scaleIn" id="score-gauge">
      <svg viewBox="0 0 200 120" className="gauge-svg">
        {/* Background arc */}
        <path
          d="M 10 110 A 80 80 0 0 1 190 110"
          fill="none"
          stroke="var(--color-bg-card)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d="M 10 110 A 80 80 0 0 1 190 110"
          fill="none"
          stroke={grade.color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="gauge-progress"
          style={{ filter: `drop-shadow(0 0 8px ${grade.color})` }}
        />
      </svg>
      <div className="gauge-center">
        <span className="gauge-score" style={{ color: grade.color }}>{displayScore}</span>
        <span className="gauge-max">/100</span>
      </div>
      <div className="gauge-grade" style={{ color: grade.color }}>
        {grade.grade}
      </div>
      <div className="gauge-label">{grade.label}</div>
    </div>
  );
}
