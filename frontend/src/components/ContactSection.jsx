import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const ContactSection = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock contact submission
    setTimeout(() => {
      setLoading(false);
      toast.success('Message sent! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Get in <span className="text-gradient">touch</span>
            </h2>
            <p className="text-slate-400 text-lg mb-12 max-w-lg">
              Have questions about our library services or partnership opportunities? Our team is here to help you navigate the future of knowledge management.
            </p>

            <div className="space-y-8">
              {[
                { icon: <Phone className="w-6 h-6 text-indigo-500" />, title: "Call Us", detail: "+91 (coming soon)" },
                { icon: <Mail className="w-6 h-6 text-indigo-500" />, title: "Email Support", detail: "patelandco.@gmail.com" },
                { icon: <MapPin className="w-6 h-6 text-indigo-500" />, title: "Visit HQ", detail: "Bareilly, Uttar Pradesh, India" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{item.title}</h4>
                    <p className="text-slate-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 backdrop-blur-md p-8 md:p-12 rounded-[32px] shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Your Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-colors text-white placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Email Address</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-colors text-white placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Message</label>
                <textarea
                  required
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-colors text-white placeholder:text-slate-600 resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-95"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                {loading ? "Transmitting..." : "Send Message"}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
