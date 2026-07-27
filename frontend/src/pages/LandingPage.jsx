import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import campusImage from '../assets/campus.png';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Users, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Library,
  Microscope,
  Monitor,
  Trophy,
  Dumbbell,
  Landmark
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    students: 0,
    faculty: 0,
    departments: 0,
    placements: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setCounts({
        students: 1420,
        faculty: 85,
        departments: 7,
        placements: 94
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const galleryItems = [
    { title: 'Campus Main Building', icon: Landmark, desc: 'State of the art architectural campus' },
    { title: 'Central Library', icon: Library, desc: 'Over 50,000 reference books & digital journals' },
    { title: 'Advanced Research Labs', icon: Microscope, desc: 'Modern equipment for AI & Robotics' },
    { title: 'Computer Super Center', icon: Monitor, desc: 'High performance computing workstations' },
    { title: 'Sports Arena', icon: Dumbbell, desc: 'Full size grounds for cricket, football & athletics' },
    { title: 'Grand Auditorium', icon: Trophy, desc: '1000+ seating capacity for symposiums' }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-sky-100 selection:text-sky-700">
      {/* Top Header Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-sky-400/20">
              JP
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-base leading-tight">J.P. College of Engineering</h1>
              <p className="text-[10px] text-sky-600 font-semibold uppercase tracking-wider">Approved by AICTE & Affiliated to University</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-600">
            <a href="#about" className="hover:text-sky-600 transition-colors">About</a>
            <a href="#departments" className="hover:text-sky-600 transition-colors">Departments</a>
            <a href="#facilities" className="hover:text-sky-600 transition-colors">Facilities</a>
            <a href="#placements" className="hover:text-sky-600 transition-colors">Placements</a>
            <a href="#gallery" className="hover:text-sky-600 transition-colors">Gallery</a>
            <a href="#contact" className="hover:text-sky-600 transition-colors">Contact</a>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-full shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition-all transform hover:scale-105"
          >
            ERP Portal Login <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative pt-32 pb-24 px-6 bg-cover bg-center min-h-[85vh] flex items-center"
        style={{ backgroundImage: `url(${campusImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/30 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-sky-500" /> Empowering Next-Gen Engineers
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              J.P. College of Engineering
            </h1>
            <p className="text-lg font-bold text-sky-600">
              College ERP Management System
            </p>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              "Empowering Education Through Smart Digital Management". Experience seamless academic management, real-time attendance tracking, automated grading, and smart digital workflows.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm shadow-xl shadow-sky-500/25 flex items-center gap-2 transition-all transform hover:scale-105"
              >
                Explore ERP Portal <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#about"
                className="px-8 py-3.5 bg-white hover:bg-sky-50 text-sky-700 font-bold rounded-xl text-sm border border-sky-200 shadow-sm transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Statistics Section */}
      <section className="bg-sky-500 text-white py-12 px-6 shadow-inner">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <h3 className="text-3xl font-black">{counts.students}+</h3>
            <p className="text-xs font-semibold text-sky-100">Enrolled Students</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black">{counts.faculty}+</h3>
            <p className="text-xs font-semibold text-sky-100">Expert Faculty</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black">{counts.departments}</h3>
            <p className="text-xs font-semibold text-sky-100">Academic Departments</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black">{counts.placements}%</h3>
            <p className="text-xs font-semibold text-sky-100">Placement Record</p>
          </div>
        </div>
      </section>

      {/* About College Section */}
      <section id="about" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">About Institution</span>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Academic Excellence & Innovation</h2>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            J.P. College of Engineering is dedicated to imparting world-class technical education, fostering research culture, and building future industry leaders with ethical values.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Our Vision</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              To emerge as a premier technical institution producing global engineering professionals with cutting-edge research capabilities.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Our Mission</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Providing outcome-based education, modern infrastructure, industry collaborations, and continuous career development opportunities.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Accreditations</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              AICTE approved, Anna University affiliated, NBA accredited departments with state-of-the-art research innovation hubs.
            </p>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Specializations</span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Engineering Departments</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              'Computer Science & Engineering',
              'Artificial Intelligence & Data Science',
              'Electronics & Communication Engg.',
              'Electrical & Electronics Engg.',
              'Mechanical Engineering',
              'Civil Engineering'
            ].map((dept, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-sky-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{dept}</h4>
                  <p className="text-[11px] text-gray-500">UG & PG Programs &bull; NBA Accredited</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Campus Infrastructure</span>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Campus & Facilities Gallery</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {galleryItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact & Footer Section */}
      <footer id="contact" className="bg-gray-900 text-white pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-800 text-xs">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">J.P. College of Engineering</h4>
            <p className="text-gray-400 leading-relaxed">
              Leading technical institution shaping engineering visionaries with academic rigor and practical innovation.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#about" className="hover:text-sky-400">About Us</a></li>
              <li><a href="#departments" className="hover:text-sky-400">Departments</a></li>
              <li><a href="#gallery" className="hover:text-sky-400">Campus Gallery</a></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-sky-400">ERP Login Portal</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">Contact Info</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-400" /> College Road, Tenkasi District</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-sky-400" /> +91 4633 280100</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-sky-400" /> info@jpcoe.ac.in</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">ERP System</h4>
            <p className="text-gray-400 leading-relaxed">
              Powered by Cloud Firebase & Integrated Real-Time Department Management System.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-xs transition-colors"
            >
              Access ERP Dashboard
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} J.P. College of Engineering. All rights reserved. Built with Firebase & React ERP Architecture.
        </div>
      </footer>
    </div>
  );
}
