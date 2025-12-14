import React, { useState } from 'react';
import { Phone, MapPin, TrendingUp, Briefcase, ChevronRight, User, Star, Menu, X, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const phoneNumber = "6399990006"; // Corrected to 10 digits as per typical format
  const formattedPhone = "+91 63999 90006";
  const address = "Shop No. 1, Meekash Puram";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight text-white leading-none">Good Start</h1>
                <span className="text-xs text-blue-400 font-medium tracking-wider uppercase">Business Investment</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Services</a>
              <a href="#about" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">About Us</a>
              <a href="#contact" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Contact</a>
              <a href={`tel:${phoneNumber}`} className="bg-white text-slate-900 px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
                <Phone size={16} />
                Call Now
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300 hover:text-white">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top-5">
            <div className="px-4 py-6 space-y-4">
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-medium text-slate-300 hover:text-white">Services</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-medium text-slate-300 hover:text-white">About Us</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-medium text-slate-300 hover:text-white">Contact</a>
              <a href={`tel:${phoneNumber}`} className="w-full mt-4 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Phone size={18} />
                Call {formattedPhone}
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Star size={12} className="fill-blue-400" />
            Empowering Entrepreneurs
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            Investment for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Small Business</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Fueling the dreams of entrepreneurs with tailored financial solutions. Whether you're starting up or scaling up, Good Start Business is your partner in growth.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#contact" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
              Apply for Investment
              <ArrowRight size={18} />
            </a>
            <a href={`tel:${phoneNumber}`} className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all border border-slate-700 flex items-center justify-center gap-2">
              <Phone size={18} />
              Call {formattedPhone}
            </a>
          </div>
        </div>
      </section>

      {/* Features / About */}
      <section id="services" className="py-24 bg-slate-900 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Good Start?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We understand the unique challenges of small businesses and offer simplified investment processes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Briefcase, title: "Business Loans", desc: "Flexible capital for operational needs, inventory, and expansion." },
              { icon: TrendingUp, title: "Growth Investment", desc: "Strategic funding to help your startup scale to the next level." },
              { icon: User, title: "Expert Guidance", desc: "Personalized financial advice from industry experts like Akash Panday." },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 hover:bg-slate-800 transition-all group">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-slate-700">
                  <feature.icon className="text-blue-400" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 border border-slate-700 shadow-2xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">Get in Touch</h2>
              <p className="text-slate-400">Ready to start? Contact us today.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Person Card */}
              <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-700 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 border-2 border-blue-500">
                  <User size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-white">Akash Panday</h3>
                <p className="text-blue-400 font-medium mb-6">Investment Advisor</p>
                <div className="flex gap-3 w-full">
                   <a href={`tel:${phoneNumber}`} className="flex-1 bg-white text-slate-900 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                     <Phone size={16} /> Call
                   </a>
                </div>
              </div>

              {/* Address Info */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-400 border border-slate-700">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Phone Number</p>
                    <a href={`tel:${phoneNumber}`} className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">
                      {formattedPhone}
                    </a>
                    <p className="text-xs text-slate-500 mt-1">Available Mon-Sat, 9am - 6pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-400 border border-slate-700">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Visit Our Office</p>
                    <p className="text-lg font-semibold text-white">Shop No. 1</p>
                    <p className="text-slate-300">Meekash Puram</p>
                    <p className="text-slate-500 text-sm mt-1">India</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl">
                  <p className="text-sm text-blue-200">
                    "A good start is half the battle won. Let's build your future together."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 bg-slate-950 text-center">
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Good Start Business. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
