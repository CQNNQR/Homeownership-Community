import { getTestimonials } from '@/lib/settings'

export const revalidate = 10

export default async function TestimonialsPreview() {
  const testimonials = await getTestimonials()

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-4">What Our Members Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from people who have transformed their lives through the Homeownership Community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial: any) => (
            <div key={testimonial.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
              <div className="border-t pt-4">
                <p className="font-bold text-black">{testimonial.name}</p>
                {testimonial.role && <p className="text-sm text-gray-500">{testimonial.role}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
