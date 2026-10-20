'use client';

type HeaderInfo = {
  title: string;
  subtitle: string;
  description: string;
};

const SectionHeader = ({
  headerInfo,
  headingLevel = 'h2',
}: {
  headerInfo: HeaderInfo;
  headingLevel?: 'h1' | 'h2';
}) => {
  const { title, subtitle, description } = headerInfo;
  const Heading = headingLevel;

  return (
    <>
      {/* <!-- Section Title Start --> */}
      <div className="mx-auto text-center">
        <div className="bg-zumthor dark:border-strokedark dark:bg-blacksection mb-4 inline-block rounded-full px-4.5 py-1.5 dark:border">
          <span className="text-sectiontitle font-medium text-black dark:text-white">
            {title}
          </span>
        </div>
        <Heading className="sika-display sika-section-title mx-auto mb-4">
          {subtitle}
        </Heading>
        <p className="mx-auto md:w-4/5 lg:w-3/5 xl:w-[46%]">{description}</p>
      </div>
      {/* <!-- Section Title End --> */}
    </>
  );
};

export default SectionHeader;
