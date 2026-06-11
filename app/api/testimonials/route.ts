import { NextRequest, NextResponse } from 'next/server';
import { homepageTestimonials } from '@/lib/homepage-testimonials';

const testimonialsResponse = homepageTestimonials.map((testimonial) => ({
  ...testimonial,
  id: String(testimonial.id),
}));

export async function GET(_request: NextRequest) {
  return NextResponse.json(testimonialsResponse);
}
