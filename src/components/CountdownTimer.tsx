import { useState, useEffect } from 'react';
import { differenceInSeconds, parseISO } from 'date-fns';

interface CountdownTimerProps {
  targetDate: string;
  targetTime: string;
}

export default function CountdownTimer({ targetDate, targetTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = parseISO(`${targetDate}T${targetTime}:00`);

    const update = () => {
      const totalSeconds = differenceInSeconds(target, new Date());

      if (totalSeconds <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  const blocks = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ];

  return (
    <div className="flex items-center gap-3">
      {blocks.map((block) => (
        <div key={block.label} className="flex flex-col items-center">
          <div className="bg-ahly-dark/60 border border-ahly-red/30 rounded-lg w-16 h-16 flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl font-bold text-white tabular-nums">
              {String(block.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] text-ahly-muted mt-1 uppercase tracking-wider">
            {block.label}
          </span>
        </div>
      ))}
    </div>
  );
}
