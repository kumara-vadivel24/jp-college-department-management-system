import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import campusImage from '../assets/campus.png';
import { 
  GraduationCap, BookOpen, Award, Users, Building2, MapPin, Phone, Mail, 
  ArrowRight, Sparkles, Library, Microscope, Monitor, Trophy, Dumbbell, Landmark 
} from 'lucide-react';

export const PublicHeader = () => {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md">
            JP
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-base leading-tight">J.P. College of Engineering</h1>
            <p className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">Approved by AICTE & Affiliated to University</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-600">
          <Link to="/" className="hover:text-sky-600 transition-colors">Home</Link>
          <Link to="/about" className="hover:text-sky-600 transition-colors">About Us</Link>
          <Link to="/public-departments" className="hover:text-sky-600 transition-colors">Departments</Link>
          <Link to="/gallery" className="hover:text-sky-600 transition-colors">Gallery</Link>
          <Link to="/admission" className="hover:text-sky-600 transition-colors">Admissions</Link>
          <Link to="/contact" className="hover:text-sky-600 transition-colors">Contact</Link>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105"
        >
          Explore ERP Portal <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};

export const PublicFooter = () => (
  <footer className="bg-gray-900 text-white pt-16 pb-8 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-800 text-xs">
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-white">J.P. College of Engineering</h4>
        <p className="text-gray-400 leading-relaxed">
          Empowering engineering visionaries through academic rigor, state-of-the-art facilities, and practical innovation.
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-white">Public Pages</h4>
        <ul className="space-y-2 text-gray-400">
          <li><Link to="/about" className="hover:text-sky-400">About College</Link></li>
          <li><Link to="/public-departments" className="hover:text-sky-400">Engineering Departments</Link></li>
          <li><Link to="/gallery" className="hover:text-sky-400">Campus Gallery</Link></li>
          <li><Link to="/contact" className="hover:text-sky-400">Contact Us</Link></li>
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
        <h4 className="text-sm font-bold text-white">ERP Institutional Access</h4>
        <p className="text-gray-400 leading-relaxed">
          Strictly for authorized Students, Faculty, and HODs.
        </p>
        <Link to="/login" className="inline-block w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs text-center transition-colors">
          Go to ERP Login Portal
        </Link>
      </div>
    </div>

    <div className="max-w-7xl mx-auto pt-6 text-center text-xs text-gray-500">
      &copy; {new Date().getFullYear()} J.P. College of Engineering. All Public Rights Reserved.
    </div>
  </footer>
);

// Dedicated Public Pages
export const AboutPage = () => (
  <div className="min-h-screen bg-white font-sans">
    <PublicHeader />
    <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">About Our Institution</span>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Legacy of Academic Excellence & Innovation</h1>
        <p className="text-sm text-gray-600 leading-relaxed font-medium">
          Established to deliver world-class technical education, J.P. College of Engineering stands as a beacon of research, ethics, and career excellence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="bg-sky-50 border border-sky-100 rounded-3xl p-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Chairman's Message</h2>
          <p className="text-xs text-gray-700 leading-relaxed">
            "Our mission is to foster innovation, integrity, and technical mastery. We empower students to solve real-world industrial challenges through modern engineering practices."
          </p>
        </div>
        <div className="bg-sky-50 border border-sky-100 rounded-3xl p-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Principal's Message</h2>
          <p className="text-xs text-gray-700 leading-relaxed">
            "We provide an outcome-based education ecosystem supported by advanced research centers, experienced faculty, and strong industrial placement ties."
          </p>
        </div>
      </div>
    </div>
    <PublicFooter />
  </div>
);

export const PublicDepartmentsPage = () => (
  <div className="min-h-screen bg-white font-sans">
    <PublicHeader />
    <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Academic Programs</span>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Engineering & Post-Graduate Departments</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          'Computer Science & Engineering', 'Artificial Intelligence & Data Science',
          'Electronics & Communication Engg.', 'Electrical & Electronics Engg.',
          'Mechanical Engineering', 'Civil Engineering', 'Master of Business Administration (MBA)',
          'Master of Computer Applications (MCA)'
        ].map((d, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-sky-300 transition-colors">
            <Building2 className="w-8 h-8 text-sky-500 mb-3" />
            <h3 className="font-bold text-gray-900 text-base">{d}</h3>
            <p className="text-xs text-gray-500 mt-2">NBA Accredited &bull; Outcome-Based Curriculum</p>
          </div>
        ))}
      </div>
    </div>
    <PublicFooter />
  </div>
);

export const GalleryPage = () => (
  <div className="min-h-screen bg-white font-sans">
    <PublicHeader />
    <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Campus Life</span>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Campus & Facilities Photo Gallery</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Main Academic Block', icon: Landmark },
          { title: 'Digital Library & Research Center', icon: Library },
          { title: 'Robotics & AI Super Lab', icon: Microscope },
          { title: 'High-Performance Computing Center', icon: Monitor },
          { title: 'Sports & Athletics Ground', icon: Dumbbell },
          { title: 'Auditorium & Cultural Hall', icon: Trophy }
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-3 text-center shadow-sm">
              <Icon className="w-12 h-12 text-sky-500 mx-auto" />
              <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
            </div>
          );
        })}
      </div>
    </div>
    <PublicFooter />
  </div>
);

export const ContactPage = () => (
  <div className="min-h-screen bg-white font-sans">
    <PublicHeader />
    <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Get In Touch</span>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Contact Information & Campus Location</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-sky-50 p-6 rounded-2xl text-center space-y-2 border border-sky-100">
          <MapPin className="w-8 h-8 text-sky-600 mx-auto" />
          <h3 className="font-bold text-gray-900 text-sm">Campus Address</h3>
          <p className="text-xs text-gray-600">College Road, Tenkasi District, Tamil Nadu</p>
        </div>
        <div className="bg-sky-50 p-6 rounded-2xl text-center space-y-2 border border-sky-100">
          <Phone className="w-8 h-8 text-sky-600 mx-auto" />
          <h3 className="font-bold text-gray-900 text-sm">Phone Enquiries</h3>
          <p className="text-xs text-gray-600">+91 4633 280100 / 280200</p>
        </div>
        <div className="bg-sky-50 p-6 rounded-2xl text-center space-y-2 border border-sky-100">
          <Mail className="w-8 h-8 text-sky-600 mx-auto" />
          <h3 className="font-bold text-gray-900 text-sm">Email Admissions</h3>
          <p className="text-xs text-gray-600">admissions@jpcoe.ac.in</p>
        </div>
      </div>
    </div>
    <PublicFooter />
  </div>
);

export const AdmissionPage = () => (
  <div className="min-h-screen bg-white font-sans">
    <PublicHeader />
    <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Enrollment 2026-27</span>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admissions Guidelines & Eligibility</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 space-y-4 max-w-3xl mx-auto shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">B.E. / B.Tech Admissions Process</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Admissions are conducted through Single Window Counseling and Management Quota. Eligibility requires 10+2 with Physics, Chemistry, and Mathematics.
        </p>
      </div>
    </div>
    <PublicFooter />
  </div>
);
