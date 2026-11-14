import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Clock,
  BarChart3,
  Building2,
  CheckCircle,
  ArrowRight,
  Wifi,
  Laptop,
  Droplets,
  Lightbulb,
  Building,
  GraduationCap,
  Sparkles,
  UserPlus,
  LogIn,
  CheckCircle2,
  Layers
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      title: 'Smart Instant Registration',
      desc: 'Intuitive grievance submission with auto-validation and instant ticket tracking generation.',
      icon: Zap,
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20'
    },
    {
      title: 'Automatic Department Routing',
      desc: 'Selected complaint categories are automatically routed directly to Computer, IT, Civil, or E&TC departments.',
      icon: Building2,
      gradient: 'from-blue-600 to-cyan-600',
      shadow: 'shadow-blue-500/20'
    },
    {
      title: 'Live Resolution Lifecycle',
      desc: 'Complete transparency through Open, In Progress, Resolved, and Closed status stages with chronological audit logs.',
      icon: Clock,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20'
    },
    {
      title: 'Departmental Action Queue',
      desc: 'Staff members receive department-specific grievances, assign technicians, and log technical remarks.',
      icon: ShieldCheck,
      gradient: 'from-purple-600 to-indigo-600',
      shadow: 'shadow-purple-500/20'
    },
    {
      title: 'Executive Analytics & Insights',
      desc: 'Visual dashboards detailing departmental resolution efficiency, category trends, and resolution SLAs.',
      icon: BarChart3,
      gradient: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/20'
    }
  ];

  const facilities = [
    { name: 'Classrooms & Benches', dept: 'Civil', icon: Building, color: 'text-amber-400' },
    { name: 'Laboratories & Systems', dept: 'Computer', icon: Laptop, color: 'text-blue-400' },
    { name: 'Campus Wi-Fi & Network', dept: 'IT', icon: Wifi, color: 'text-cyan-400' },
    { name: 'Water & Sanitation', dept: 'Civil', icon: Droplets, color: 'text-teal-400' },
    { name: 'Electrical & AC Units', dept: 'E&TC', icon: Lightbulb, color: 'text-yellow-400' },
    { name: 'Hostel & Mess Services', dept: 'Civil', icon: GraduationCap, color: 'text-indigo-400' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-brand-600/20 via-indigo-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Header / Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-500/25 ring-1 ring-white/20">
              SC
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white block leading-tight">
                Smart Complaint
              </span>
              <span className="text-[10px] uppercase tracking-widest text-brand-400 font-bold block">
                College Management System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all border border-slate-800 hover:border-slate-700"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-brand-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-950/90 to-indigo-950/90 border border-brand-700/50 text-brand-300 text-xs font-semibold mb-6 shadow-inner backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            <span>Campus Grievance Redressal & Resolution Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-5xl mx-auto leading-[1.1]">
            Intelligent College Complaint <br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              Management & Tracking System
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-semibold text-brand-300/90 mt-5 tracking-wide">
            "Report. Track. Resolve."
          </p>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
            A unified digital portal connecting Students, Department Staff, and Administrators.
            Raise facility issues, track live resolution workflows, and view real-time department statistics.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/register"
              className="px-7 py-4 bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-brand-600/30 flex items-center gap-2.5 text-sm sm:text-base transition-all transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-5 h-5" />
              <span>Get Started — Create Account</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/login"
              className="px-7 py-4 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-bold rounded-2xl shadow-lg flex items-center gap-2 text-sm sm:text-base transition-all transform hover:-translate-y-0.5 backdrop-blur-md"
            >
              <LogIn className="w-5 h-5 text-slate-400" />
              <span>Sign In to Portal</span>
            </Link>
          </div>

          {/* Quick Role Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-3 text-xs text-slate-400">
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Student Portal
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Staff Action Queue
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Administrator Oversight
            </span>
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-16 bg-slate-950/70 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2">Automated Routing Categories</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Campus Facilities Covered</h3>
            <p className="text-slate-400 text-sm mt-2">
              Every complaint is automatically classified and dispatched to its respective specialized department.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {facilities.map((fac, idx) => {
              const Icon = fac.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-center hover:border-brand-500/50 transition-all group hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5"
                >
                  <div className={`w-12 h-12 rounded-xl bg-slate-800/80 ${fac.color} mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-white leading-snug">{fac.name}</p>
                  <span className="inline-block mt-2.5 text-[10px] uppercase font-bold text-brand-400 bg-brand-950/80 border border-brand-800/50 px-2 py-0.5 rounded-full">
                    {fac.dept}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2">Platform Capabilities</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">Designed For Fast Redressal</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 rounded-2xl p-7 hover:border-slate-700 transition-all shadow-xl group hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.gradient} text-white flex items-center justify-center mb-5 shadow-lg ${feat.shadow}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-brand-300 transition-colors">{feat.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}

            {/* MongoDB Document Store Card */}
            <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-800/50 rounded-2xl p-7 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-emerald-200 mb-2">MongoDB Document Database</h4>
              <p className="text-sm text-emerald-300/80 leading-relaxed">
                Powered by high-performance MongoDB (<code className="text-emerald-300 font-mono font-bold">smart_complaint_db</code>) with real-time aggregation pipelines and Mongoose schema references.
              </p>
              <div className="mt-5 pt-4 border-t border-emerald-900/50 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span>MongoDB 8.x Document Store</span>
                <span>Compass Visualizer Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-brand-700 via-indigo-700 to-purple-800 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
                Ready to submit or manage complaints?
              </h3>
              <p className="mt-3 text-brand-100 text-sm sm:text-base max-w-xl mx-auto">
                Create a student account or sign in to your staff/admin portal for seamless college grievance redressal.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="px-6 py-3 bg-white text-brand-700 hover:bg-brand-50 font-bold rounded-xl shadow-lg transition-all text-sm"
                >
                  Create New Account
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all text-sm border border-white/20"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-400">Smart College Complaint Management System</p>
          <p className="mt-1">
            Web-based platform for tertiary institution grievance management & tracking
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
