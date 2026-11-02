import AccordionItem from '@/components/Common/AccordionItem';
import type { FAQ } from '@/types/faq';

export default function FAQItem({
  item,
  open,
  onToggle,
  language,
}: {
  item: FAQ;
  open: boolean;
  onToggle: () => void;
  language: 'fr' | 'en';
}) {
  return (
    <AccordionItem
      title={item.quest}
      open={open}
      onToggle={onToggle}
      language={language}
    >
      <p>{item.ans}</p>
    </AccordionItem>
  );
}
