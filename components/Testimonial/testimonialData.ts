import { homepageTestimonials } from "@/lib/homepage-testimonials";
import { Testimonial } from "@/types/testimonial";

const toTestimonial = (testimonial: (typeof homepageTestimonials)[number]): Testimonial => ({
  id: testimonial.id,
  name: testimonial.name,
  designation: testimonial.role,
  image: testimonial.avatar,
  content: testimonial.content,
});

export const getTestimonialData = (_t: any): Testimonial[] =>
  homepageTestimonials.map(toTestimonial);

// Keep the original export for backward compatibility.
export const testimonialData: Testimonial[] = homepageTestimonials.map(toTestimonial);
