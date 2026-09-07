"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import FAQItem from "./FAQItem";
import type { FAQ as FAQType } from "@/types/faq";
import { useLanguage } from "@/context/LanguageContext";

const FAQ = () => {
  const [activeFaq, setActiveFaq] = useState(1);
  const [faqData, setFaqData] = useState<FAQType[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch('/api/faqs');
        if (response.ok) {
          const data = await response.json();
          setFaqData(Array.isArray(data) ? data : []);
        } else {
          console.error('Erreur lors du chargement des FAQ');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des FAQ:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const handleFaqToggle = (id: number) => {
    activeFaq === id ? setActiveFaq(0) : setActiveFaq(id);
  };
  const displayedFaqs: FAQType[] = faqData.length > 0
    ? faqData
    : t.faq.fallback.map((faq, index) => ({
        id: index + 1,
        quest: faq.question,
        ans: faq.answer,
      }));

  return (
    <>
      {/* <!-- ===== FAQ Start ===== --> */}
      <section id="faq" className="overflow-hidden pb-20 pt-8 lg:pb-25 xl:pb-30" aria-labelledby="faq-title">
        <div className="relative mx-auto max-w-c-1235 px-4 md:px-8 xl:px-0">
          <div className="absolute -bottom-16 -z-1 h-full w-full">
            <Image
              fill
              src="/images/shape/shape-dotted-light.svg"
              alt=""
              className="dark:hidden"
            />
            <Image
              fill
              src="/images/shape/shape-dotted-light.svg"
              alt=""
              className="hidden dark:block"
            />
          </div>
          <div className="flex flex-wrap gap-8 md:flex-nowrap md:items-center xl:gap-32.5">
            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  x: -20,
                },

                visible: {
                  opacity: 1,
                  x: 0,
                },
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 1, delay: 0.1 }}
              viewport={{ once: true }}
              className="animate_left md:w-2/5 lg:w-1/2"
            >
              <span className="font-medium uppercase text-black dark:text-white">
                {t.faq.eyebrow}
              </span>
              <h2 id="faq-title" className="relative mb-6 text-3xl font-bold text-black dark:text-white xl:text-hero">
                {t.faq.title}
              </h2>
              <p className="max-w-md">Retrouvez les informations essentielles pour choisir votre accompagnement en toute confiance.</p>
            </motion.div>

            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  x: 20,
                },

                visible: {
                  opacity: 1,
                  x: 0,
                },
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 1, delay: 0.1 }}
              viewport={{ once: true }}
              className="animate_right md:w-3/5 lg:w-1/2"
            >
              <div className="rounded-lg bg-white shadow-solid-8 dark:border dark:border-strokedark dark:bg-blacksection">
                {loading && faqData.length === 0 ? (
                  <div className="p-6 text-center">Chargement des FAQ...</div>
                ) : (
                  displayedFaqs.map((faq) => (
                    <FAQItem
                      key={faq.id}
                      faqData={{ ...faq, activeFaq, handleFaqToggle }}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* <!-- ===== FAQ End ===== --> */}
    </>
  );
};

export default FAQ;
