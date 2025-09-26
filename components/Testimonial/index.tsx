"use client";
import SectionHeader from "../Common/SectionHeader";

import { Autoplay, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";

import { motion } from "framer-motion";
import SingleTestimonial from "./SingleTestimonial";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

const Testimonial = () => {
  const { t } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data);
        } else {
          console.error('Erreur lors du chargement des témoignages');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des témoignages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <>
      <section>
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          {/* <!-- Section Title Start --> */}
          <div className="animate_top mx-auto text-center">
            <SectionHeader
              headerInfo={{
                title: t.testimonials.title,
                subtitle: t.testimonials.subtitle,
                description: `Des retours positifs et des familles satisfaites`,
              }}
            />
          </div>
          {/* <!-- Section Title End --> */}
        </div>

        <motion.div
          variants={{
            hidden: {
              opacity: 0,
              y: -20,
            },

            visible: {
              opacity: 1,
              y: 0,
            },
          }}
          initial="hidden"
          whileInView="visible"
          transition={{ duration: 1, delay: 0.1 }}
          viewport={{ once: true }}
          className="animate_top mx-auto mt-15 max-w-c-1235 px-4 md:px-8 xl:mt-20 xl:px-0"
        >
          {/* <!-- Slider main container --> */}
          <div className="swiper testimonial-01 mb-20 pb-22.5">
            {/* <!-- Additional required wrapper --> */}
            <Swiper
              spaceBetween={50}
              slidesPerView={2}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
              }}
              modules={[Autoplay, Pagination]}
              breakpoints={{
                // when window width is >= 640px
                0: {
                  slidesPerView: 1,
                },
                // when window width is >= 768px
                768: {
                  slidesPerView: 2,
                },
              }}
            >
              {loading ? (
                <SwiperSlide>
                  <div className="p-6 text-center">Chargement des témoignages...</div>
                </SwiperSlide>
              ) : (
                testimonials.map((review) => (
                  <SwiperSlide key={review?.id}>
                    <SingleTestimonial review={{
                      ...review,
                      id: parseInt(review?.id || '0'),
                      image: (review as any)?.avatar_url || '/images/user/user-01.png',
                      designation: (review as any)?.role || 'Utilisateur'
                    }} />
                  </SwiperSlide>
                ))
              )}
            </Swiper>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Testimonial;
