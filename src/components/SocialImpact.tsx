import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { ImpactStat } from '../types';

interface SocialImpactProps {
  heading: string;
  subheading: string;
  stats: ImpactStat[];
}

export default function SocialImpact({ heading, subheading, stats }: SocialImpactProps) {
  const [impact, setImpact] = useState({
    job_count: 0,
    sum_profits: 0,
  });

  useEffect(() => {
    async function loadImpact() {
      try {
        const data = await api.orders.getImpact();
        setImpact(data);
      } catch (err) {
        console.error("Failed to load impact", err);
      }
    }

    loadImpact();
  }, []);

  const displayStats = [
    stats[0],
    {
      ...stats[1],
      value: impact.job_count.toLocaleString(),
    },
    {
      ...stats[2],
      value: impact.sum_profits.toLocaleString(),
    },
  ];
  // console.log(stats);
  return (
    /* bg image: /img/social-impact-bg.jpg  (นาขั้นบันได/rice terraces + ชนเผ่า) */
    <section className="impact" aria-label="Social Impact">
      <div className="impact__overlay" />
      <div className="impact__content">
        <h2 className="impact__heading">{heading}</h2>
        <p className="impact__sub">{subheading}</p>
        <div className="impact__stats">
          {displayStats.map((stat) => (
            <div key={stat.id} className={`impact__card ${stat.id === 's1' ? "small" : ""}`}>
              <span className={`impact__value ${stat.id === 's1' ? "small" : ""}`}>
                {stat.value}
              </span>

              <span className="impact__label">{stat.label}</span>
              <div className="impact__tooltip">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
