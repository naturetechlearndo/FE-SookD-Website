interface PursuitFeelingProps {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

export default function PursuitFeeling({ heading, body, ctaLabel, ctaHref }: PursuitFeelingProps) {
  return (
    <section className="pursuit" id="pursuit">
      {/* LEFT: text */}
      <div className="pursuit__text">
        <h2 className="pursuit__heading">{heading}</h2>
        <p className="pursuit__body">{body}</p>
        {/* <a href={ctaHref} className="pursuit__cta">{ctaLabel}</a> */}
      </div>
      {/* RIGHT: image — /img/pursuit-river.jpg  (ทะเลสาบ/raft house ในป่า) */}
      <div className="pursuit__image" role="img" aria-label="River raft houses in forest" />
    </section>
  );
}
