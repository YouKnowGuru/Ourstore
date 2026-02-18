import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { messageAPI } from '@/services/api';
import BackToTop from '@/components/BackToTop';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await messageAPI.createMessage(formData);
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['Damphu, Tsirang.', '@ourstore.tech'],
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+97517699032'],
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['tsirang@ourstore.tech'],
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Open Daily: 9AM - 6PM'],
    },
  ];

  return (
    <div className="pt-20">
      <BackToTop />

      {/* Hero */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-maroon via-maroon-800 to-bhutan-blue">
          <div className="absolute inset-0 mandala-pattern opacity-10" />
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-saffron/20 blur-3xl float-slow" />
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-gold/20 blur-3xl float-medium" />
        </div>

        <div className="bhutan-container relative z-10 text-center text-white py-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-dark backdrop-blur-lg mb-6 animate-bounce-in">
            <Mail className="w-4 h-4 text-saffron animate-pulse" />
            <span className="text-sm font-medium">Get in Touch</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 animate-slide-in-up">
            Contact{' '}
            <span className="bg-gradient-to-r from-saffron via-gold to-saffron bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
              Us
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            We'd love to hear from you. Get in touch with us for any inquiries or support.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 bg-gradient-to-b from-white to-bhutan-cream/30">
        <div className="bhutan-container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <div
                key={info.title}
                className="group text-center p-8 bg-white hover:bg-gradient-to-br hover:from-white hover:to-saffron/5 rounded-2xl shadow-lg hover:shadow-bhutan-xl transition-all duration-500 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-saffron/20 to-maroon/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <info.icon className="w-8 h-8 text-saffron group-hover:text-maroon transition-colors" />
                </div>
                <h3 className="font-display font-bold text-lg mb-3 text-gray-900">{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-muted-foreground text-sm leading-relaxed">{detail}</p>
                ))}
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Contact Form */}
            <div className="glass rounded-3xl shadow-bhutan-xl p-10 animate-slide-in-right">
              <h2 className="text-3xl font-display font-bold mb-8 bg-gradient-to-r from-maroon to-saffron bg-clip-text text-transparent">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">Your Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="border-2 focus:border-saffron focus:ring-4 focus:ring-saffron/20 transition-all duration-300"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Your Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="border-2 focus:border-saffron focus:ring-4 focus:ring-saffron/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-gray-700 font-medium">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="border-2 focus:border-saffron focus:ring-4 focus:ring-saffron/20 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-700 font-medium">Message</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="border-2 focus:border-saffron focus:ring-4 focus:ring-saffron/20 transition-all duration-300"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-saffron to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white shadow-xl hover:shadow-glow-lg transform hover:scale-105 transition-all duration-300 py-6 text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  <Send className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Modern High-Impact Map Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="bhutan-container">
          <div className="text-center mb-12 animate-slide-in-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-gradient-to-r from-maroon to-saffron bg-clip-text text-transparent">
              Visit Our Store
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Come and experience our products firsthand in Tsirang.
            </p>
          </div>

          <div className="relative group animate-scale-in">
            {/* Pulsing Outer Rings */}
            <div className="absolute -inset-6 bg-gradient-to-tr from-saffron/30 via-maroon/20 to-bhutan-blue/30 rounded-[3rem] blur-3xl group-hover:scale-105 transition-transform duration-1000 animate-pulse" />

            <div className="relative glass rounded-[3rem] shadow-2xl overflow-hidden border border-white/40 backdrop-blur-3xl p-3">
              <div className="relative rounded-[2.5rem] overflow-hidden min-h-[600px] lg:min-h-[750px] aspect-video md:aspect-auto">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14300.000000000000!2d90.10000000000000!3d27.01700000000000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e3f00000000000%3A0x0!2zMjfCsDAxJzAxLjIiTiA5MMKwMDYnMDAuMCJF!5e0!3m2!1sen!2sbt!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Our Store Location - Damphu"
                  className="filter contrast-125 saturate-150 brightness-110"
                />

                {/* Information Overlay Card */}
                <div className="absolute top-10 left-10 hidden md:block w-80 glass-dark p-8 rounded-3xl border border-white/20 backdrop-blur-2xl shadow-2xl animate-slide-in-right">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron to-maroon flex items-center justify-center shadow-lg mb-6 transform rotate-3">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-display font-bold text-2xl mb-2">Our Store</h4>
                  <p className="text-white/80 text-lg mb-6">Damphu, Tsirang. Bhutan</p>

                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 text-white/90">
                      <Clock className="w-5 h-5 text-saffron" />
                      <span className="font-bold">Open Daily: 9AM - 6PM</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/90">
                      <Phone className="w-5 h-5 text-saffron" />
                      <span className="font-bold">+97517699032</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Floating Card */}
                <div className="absolute bottom-6 left-6 right-6 md:hidden glass-dark p-6 rounded-2xl border border-white/10 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-saffron to-maroon flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-display font-bold">Visit Us</h4>
                      <p className="text-white/60 text-sm">Tsirang, Damphu</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Corner Accents */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-saffron/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-maroon/10 rounded-full blur-[100px] animate-pulse-slow" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
