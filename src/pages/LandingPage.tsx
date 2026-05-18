import { ShoppingCart, MapPin, Clock, ShieldCheck, Droplets, Users } from 'lucide-react';

const LandingPage = ({ onOpenAuth }: { onOpenAuth: () => void }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Navigation */}
      <nav className="h-20 bg-white border-b border-slate-100 px-6 lg:px-20 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight">Water Market Station</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">HINUNANGAN, SOUTHERN LEYTE</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <button onClick={onOpenAuth} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Sign In</button>
          <button onClick={onOpenAuth} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
            Create Account
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 lg:px-20 py-20 flex flex-col items-center text-center max-w-7xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full mb-8 border border-blue-100">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Trusted Water Refilling Station in Hinunangan</span>
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 leading-[1.1]">
          Water Market <br />
          <span className="text-blue-600">Station</span>
        </h1>
        
        <p className="text-slate-600 text-lg lg:text-xl max-w-2xl mb-12 leading-relaxed">
          Your reliable source of clean, safe, and affordable purified water in <span className="font-bold text-slate-900">Hinunangan, Southern Leyte</span>. We serve the community with quality water refills delivered right to your doorstep.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-start space-x-4 text-left">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Station Address</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Purok Saging, Brgy. Panalaron, <span className="text-blue-600 font-medium">Hinunangan, Southern Leyte</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-start space-x-4 text-left">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Operating Hours</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Monday–Saturday: 7:00 AM – 6:00 PM <br />
                <span className="text-slate-400">Sunday: Closed</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-blue-50/50 py-24 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">What We Offer</h2>
          <p className="text-slate-500">Clean water services for your home and business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {[
            { icon: Droplets, title: 'Purified Water', desc: 'High-quality purified water refill at ₱30 per container', color: 'bg-blue-500' },
            { icon: ShoppingCart, title: 'Online Ordering', desc: 'Order water delivery from the comfort of your home', color: 'bg-indigo-500' },
            { icon: Users, title: 'Walk-in Service', desc: 'Visit our station anytime during operating hours', color: 'bg-emerald-500' },
            { icon: ShieldCheck, title: 'Safe & Clean', desc: 'Filtered and tested water you can trust for your family', color: 'bg-pink-500' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 card-shadow hover:scale-105 transition-transform duration-300">
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20`}>
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-3">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-slate-400 text-sm bg-white border-t border-slate-100">
        <p>© 2025 Water Market Water Refilling Station. Hinunangan, Southern Leyte</p>
      </footer>
    </div>
  );
};

export default LandingPage;
