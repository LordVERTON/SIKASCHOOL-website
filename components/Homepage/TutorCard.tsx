import Image from 'next/image';

type Props = {
  name: string;
  image: string;
  role: string;
  quote?: { title: string; text: string; language: 'fr' | 'en' };
};

export default function TutorCard({ name, image, role, quote }: Props) {
  return (
    <article className="sika-tutor-card">
      <div className="sika-tutor-photo">
        <Image
          src={image}
          alt={name}
          width={480}
          height={560}
          sizes="(max-width: 600px) 88vw, (max-width: 900px) 44vw, 26vw"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="sika-tutor-card-body">
        <p className="sika-eyebrow mb-2">{role}</p>
        <h3>{name}</h3>
        {quote && (
          <div className="sika-quote mt-5">
            <p className="mb-2 text-xs font-semibold">{quote.title}</p>
            <blockquote
              lang={quote.language}
              className="text-sm leading-relaxed"
            >
              « {quote.text} »
            </blockquote>
          </div>
        )}
      </div>
    </article>
  );
}
