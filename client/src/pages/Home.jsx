import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Globe,
  Activity,
  Rocket,
  Satellite,
  BarChart3,
  Github,
  ExternalLink,
  ChevronDown,
  LayoutDashboard,
  Zap,
} from 'lucide-react';
import { lazy, Suspense } from 'react';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
const SatelliteEarthView = lazy(() => import('../components/SatelliteEarthView'));

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};


const ScrollReveal = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-space-950">
      <section className="relative min-h-[100dvh] sm:min-h-[100vh] flex flex-col overflow-hidden bg-noise" id="hero">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 hero-mesh" aria-hidden />
          <div className="absolute inset-0 hero-stars opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-space-950/70 via-space-950/50 to-space-950" />
          <div className="absolute inset-0 hero-spotlight" aria-hidden />
          <div className="hero-glow absolute top-0 right-0 w-[50vmin] h-[50vmin] max-w-[400px] rounded-full bg-accent-purple/15 blur-[80px] pointer-events-none" aria-hidden />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-6 sm:pb-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 flex flex-col justify-center text-left">
              <motion.p 
                className="landing-label mb-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Near-Earth Object Monitoring
              </motion.p>
              
              <motion.div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-accent-purple text-sm font-medium mb-6 w-fit"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-purple opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-purple" />
                </span>
                Live NASA NeoWs · Updated every 24h
              </motion.div>

              <motion.h1 
                className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <span className="block text-white">Monitor</span>
                <span className="block gradient-text mt-1">Near-Earth Objects</span>
              </motion.h1>
              
              <motion.div 
                className="headline-underline-wide mt-4"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />

              <motion.p 
                className="mt-6 text-base sm:text-lg text-gray-400 max-w-xl leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Real-time NEO tracking with NASA's NeoWs API. Risk scores, approach dates, and alerts—in one dashboard.
              </motion.p>

              <motion.div 
                className="mt-10 flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-accent-purple hover:bg-violet-500 rounded-xl transition-all duration-200 shadow-[0_0_32px_-8px_rgba(139,92,246,0.5)] hover:-translate-y-0.5"
                  >
                    Launch Dashboard
                    <ArrowRight size={18} className="shrink-0" />
                  </Link>
                </motion.div>
                
                <motion.a
                  href="https://github.com/saswatbarai/cosmic-watch"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-white/90 bg-white/[0.06] border border-white/20 hover:bg-white/10 rounded-xl transition-all duration-200"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Github size={18} />
                  View on GitHub
                </motion.a>
              </motion.div>

              <motion.p 
                className="mt-8 text-xs text-gray-500 flex items-center gap-2 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <span className="inline-flex items-center gap-1.5 text-gray-500">
                  <Satellite size={12} />
                  Powered by NASA JPL
                </span>
                <span className="text-white/20">·</span>
                <span>Open data, open source</span>
              </motion.p>

              <motion.div 
                className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                transition={{ delay: 1 }}
              >
                {[
                  { value: '24/7', label: 'Monitoring' },
                  { value: 'NASA', label: 'NeoWs API' },
                  { value: 'Real-time', label: 'Risk scores' },
                  { value: 'Free', label: 'To use' },
                ].map(({ value, label }) => (
                  <motion.div
                    key={label}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left backdrop-blur-sm"
                    variants={scaleIn}
                    whileHover={{ scale: 1.05, borderColor: 'rgba(139, 92, 246, 0.3)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="font-heading text-lg md:text-xl font-bold text-white">{value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div 
              className="order-1 lg:order-2 relative w-full h-[340px] sm:h-[420px] lg:h-[540px]"
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 50 }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
                <div className="w-[60%] h-[60%] rounded-full bg-accent-purple/10 blur-[60px]" />
              </div>
              <Suspense fallback={
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <div className="w-20 h-20 rounded-full border-2 border-white/10 border-t-accent-purple animate-spin" />
                  <span className="text-xs text-gray-500">Loading satellite view...</span>
                </div>
              }>
                <SatelliteEarthView className="w-full h-full" />
              </Suspense>
            </motion.div>
          </div>
        </div>

        <motion.a
          href="#features"
          className="relative z-10 flex flex-col items-center gap-1 pb-6 text-gray-500 hover:text-gray-400 transition-colors"
          aria-label="Scroll to features"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
        >
          <span className="text-[10px] font-medium uppercase tracking-widest">Scroll</span>
          <ChevronDown size={18} className="animate-bounce" />
        </motion.a>
      </section>

      <section className="relative py-10 border-t border-white/5 bg-grid">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="landing-label mb-6">Built with</p>
          </ScrollReveal>
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {['NASA NeoWs', 'React', 'Node.js', 'Tailwind', 'Vite'].map((tech) => (
              <motion.span
                key={tech}
                className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all duration-200"
                variants={scaleIn}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 border-t border-white/5" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <ScrollReveal>
              <p className="landing-label mb-4">Features</p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4">
                Planetary Defense System
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="headline-underline-wide mx-auto" />
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
                Everything you need for space situational awareness
              </p>
            </ScrollReveal>
          </div>

          <motion.div 
            className="grid md:grid-cols-3 gap-6 mb-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div 
              className="md:col-span-2 group relative p-8 md:p-10 rounded-2xl glass-card border border-white/10 hover:border-violet-500/30 hover:shadow-[0_0_40px_-12px_rgba(139,92,246,0.15)] transition-all duration-300 overflow-hidden"
              variants={slideInLeft}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                <motion.div 
                  className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:shadow-[0_0_24px_-8px_rgba(59,130,246,0.4)] transition-all duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Globe className="text-blue-400" size={32} />
                </motion.div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-white mb-2">Global NEO Tracking</h3>
                  <p className="text-gray-400 leading-relaxed max-w-xl">
                    Real-time data from NASA's Jet Propulsion Laboratory. Orbits, approach dates, miss distances, and diameters—all normalized and ready for the dashboard.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="group relative p-8 rounded-2xl glass-card border border-white/10 hover:border-violet-500/30 hover:-translate-y-1 hover:shadow-[0_0_32px_-12px_rgba(139,92,246,0.2)] transition-all duration-300"
              variants={slideInRight}
              whileHover={{ scale: 1.05, y: -8 }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <motion.div 
                className="relative w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-[0_0_20px_-8px_rgba(139,92,246,0.3)] transition-all duration-300"
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Shield className="text-accent-purple" size={26} />
              </motion.div>
              <h3 className="font-heading text-xl font-bold text-white mb-2">Risk Analysis</h3>
              <p className="text-gray-400 text-[15px] leading-relaxed">
                Scores from velocity, diameter, and miss distance. Hazardous objects flagged so you can act first.
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div 
              className="group relative p-8 rounded-2xl glass-card border border-white/10 hover:border-amber-500/30 hover:-translate-y-1 hover:shadow-[0_0_32px_-12px_rgba(245,158,11,0.15)] transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -8 }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <motion.div 
                className="relative w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                whileHover={{ scale: 1.2, rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                <Activity className="text-amber-400" size={26} />
              </motion.div>
              <h3 className="font-heading text-xl font-bold text-white mb-2">Live Alerts</h3>
              <p className="text-gray-400 text-[15px] leading-relaxed">
                Automated monitoring with alerts for hazardous classifications. Stay informed 24/7.
              </p>
            </motion.div>

            <motion.div 
              className="group relative p-8 rounded-2xl glass-card border border-white/10 hover:border-cyan-500/30 hover:-translate-y-1 hover:shadow-[0_0_32px_-12px_rgba(34,211,238,0.15)] transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -8 }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <motion.div 
                className="relative w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                whileHover={{ scale: 1.2, rotateY: 180 }}
                transition={{ duration: 0.4 }}
              >
                <LayoutDashboard className="text-cyan-400" size={26} />
              </motion.div>
              <h3 className="font-heading text-xl font-bold text-white mb-2">One Dashboard</h3>
              <p className="text-gray-400 text-[15px] leading-relaxed">
                Stats, object list, watchlist, and alerts in one place. No switching tools.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 border-t border-white/5 bg-grid bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <ScrollReveal>
              <p className="landing-label mb-4">Product</p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4">
                See It In Action
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="headline-underline-wide mx-auto" />
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <p className="mt-4 text-gray-400 text-lg max-w-xl mx-auto">
                Your command center for near-Earth objects
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.4}>
            <motion.div 
              className="relative rounded-2xl border border-white/15 glass-card overflow-hidden shadow-2xl shadow-black/20"
              whileHover={{ scale: 1.01, y: -5 }}
              transition={{ duration: 0.3 }}
            >
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10 bg-white/[0.06]">
              <LayoutDashboard size={18} className="text-accent-purple" />
              <span className="font-heading font-semibold text-white">Live Monitor</span>
              <span className="ml-auto text-xs text-gray-500 font-mono">Last updated: live</span>
            </div>
            <div className="p-4 sm:p-6 md:p-8">
              <motion.div 
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  { label: 'Total Objects', value: '24', icon: Globe, iconClass: 'text-blue-400' },
                  { label: 'Threat Level', value: '2', icon: Zap, iconClass: 'text-red-400' },
                  { label: 'Safe', value: '22', icon: Shield, iconClass: 'text-green-400' },
                  { label: 'Closest', value: '4.2M km', icon: Activity, iconClass: 'text-amber-400' },
                ].map(({ label, value, icon, iconClass }, idx) => {
                  const Icon = icon;
                  return (
                    <motion.div 
                      key={label} 
                      className="rounded-xl border border-white/10 bg-white/[0.05] p-4 hover:border-white/20 hover:bg-white/[0.08] transition-all duration-200"
                      variants={scaleIn}
                      whileHover={{ scale: 1.08, y: -4 }}
                      custom={idx}
                    >
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <motion.p 
                        className="font-heading text-2xl font-bold text-white"
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * idx + 0.2 }}
                      >
                        {value}
                      </motion.p>
                      <Icon size={16} className={`mt-2 ${iconClass}`} />
                    </motion.div>
                  );
                })}
              </motion.div>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  { name: '2024 AB1', risk: 'SAFE', date: '2024-03-15', dist: '5.2M km', color: 'green' },
                  { name: '2024 CD2', risk: 'WARNING', date: '2024-04-02', dist: '1.8M km', color: 'amber' },
                  { name: '2024 EF3', risk: 'SAFE', date: '2024-05-10', dist: '12.1M km', color: 'green' },
                ].map(({ name, risk, date, dist, color }) => (
                  <motion.div 
                    key={name} 
                    className="rounded-xl border border-white/10 bg-white/[0.05] p-4 hover:border-white/20 transition-colors"
                    variants={fadeInUp}
                    whileHover={{ scale: 1.03, y: -3 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-heading font-semibold text-white text-sm">{name}</span>
                      <motion.span 
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${color === 'amber' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}`}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        {risk}
                      </motion.span>
                    </div>
                    <p className="text-xs text-gray-500">Approach: {date}</p>
                    <p className="text-sm font-mono text-accent-purple mt-1">Miss: {dist}</p>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div 
                className="rounded-xl border border-accent-purple/20 bg-accent-purple/5 p-5 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-accent-purple font-semibold hover:text-violet-400 transition-colors"
                  >
                    Open full dashboard
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
          </ScrollReveal>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 border-t border-white/5" id="how-it-works">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <ScrollReveal>
              <p className="landing-label mb-4">Process</p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4">
                How It Works
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="headline-underline-wide mx-auto" />
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <p className="mt-4 text-gray-400 text-lg">
                Three steps from NASA data to your screen
              </p>
            </ScrollReveal>
          </div>

          <div className="relative">
            <motion.div 
              className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-accent-purple/50 via-white/20 to-transparent hidden md:block"
              initial={{ height: 0 }}
              whileInView={{ height: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            />
            <motion.div 
              className="space-y-8 md:space-y-0"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {[
                { step: 1, title: 'We fetch NeoWs data', body: "Our backend pulls the latest NEO data from NASA's NeoWs API and normalizes it for the dashboard.", icon: Satellite },
                { step: 2, title: 'We compute risk', body: 'Each object gets a risk score from size, speed, and miss distance. High-risk objects are flagged automatically.', icon: Shield },
                { step: 3, title: 'You monitor & act', body: 'Use the dashboard to browse objects, check approach dates, and add items to your watchlist. Alerts keep you in the loop.', icon: LayoutDashboard },
              ].map(({ step, title, body, icon }) => {
                const Icon = icon;
                return (
                  <motion.div 
                    key={step} 
                    className="relative flex gap-6 md:gap-8 items-start"
                    variants={fadeInUp}
                  >
                    <motion.div 
                      className="shrink-0 w-14 h-14 rounded-2xl bg-accent-purple/20 text-accent-purple font-heading font-bold text-xl flex items-center justify-center border-2 border-accent-purple/30"
                      whileHover={{ scale: 1.15, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {step}
                    </motion.div>
                    <div className="flex-1 pb-12 md:pb-20">
                      <h3 className="font-heading text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 * step, type: "spring", stiffness: 200 }}
                        >
                          <Icon size={20} className="text-accent-purple/80" />
                        </motion.div>
                        {title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">{body}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="landing-label mb-4">Mission</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.6 }}
              className="inline-block"
            >
              <BarChart3 className="mx-auto w-10 h-10 sm:w-12 sm:h-12 text-accent-purple/80 mb-6" />
            </motion.div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
              Why Space Situational Awareness Matters
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8">
              Thousands of asteroids pass near Earth every year. Most pose no threat—but early detection and tracking are the backbone of planetary defense. Perilux puts NASA's public data in one place so researchers, educators, and curious minds can understand what's out there.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.4}>
            <motion.div 
              className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/[0.04] mb-10"
              whileHover={{ scale: 1.05, borderColor: 'rgba(139, 92, 246, 0.5)' }}
            >
              <span className="font-heading text-3xl font-bold text-accent-purple">100%</span>
              <span className="text-gray-400 text-left max-w-[200px]">Free & open. NASA Open API data.</span>
            </motion.div>
          </ScrollReveal>
          <ScrollReveal delay={0.5}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-accent-purple font-semibold hover:bg-white/10 hover:border-white/20 transition-all"
              >
                Explore the dashboard
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      <section className="relative py-20 sm:py-24 md:py-28 lg:py-32 border-t border-white/5 bg-gradient-to-b from-accent-purple/10 via-accent-purple/5 to-transparent overflow-hidden">
        <motion.div 
          className="absolute inset-0 pointer-events-none" 
          aria-hidden
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-accent-purple/20 blur-[120px]"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Ready to monitor the sky?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-xl mx-auto">
              Launch the dashboard and see today's near-Earth objects with risk scores and approach data.
            </p>
          </ScrollReveal>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-semibold text-white bg-accent-purple hover:bg-violet-500 rounded-xl transition-all duration-200 shadow-[0_0_40px_-8px_rgba(139,92,246,0.5)] hover:shadow-[0_0_56px_-12px_rgba(139,92,246,0.7)]"
              >
                <Rocket size={20} />
                Launch Dashboard
              </Link>
            </motion.div>
            <motion.a
              href="https://api.nasa.gov/"
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-semibold text-white/90 bg-white/[0.06] border border-white/20 hover:bg-white/10 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <ExternalLink size={18} />
              NASA API
            </motion.a>
          </motion.div>
        </div>
      </section>

      <footer className="mt-auto border-t border-white/[0.08] bg-space-900/95 backdrop-blur-sm bg-gradient-to-b from-transparent to-space-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-8 mb-10 sm:mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div className="col-span-2 md:col-span-1" variants={fadeInUp}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
                  <img 
                    src="/cosmic-watch-logo-icon.svg" 
                    alt="Perilux Logo" 
                    className="h-9 w-9 group-hover:scale-110 transition-transform duration-200"
                  />
                  <span className="font-heading font-bold text-lg text-white">
                    Peri<span className="text-accent-purple">lux</span>
                  </span>
                </Link>
              </motion.div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Real-time NEO tracking powered by NASA's NeoWs API. Open data, open source.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h4 className="font-heading font-semibold text-white mb-4">Product</h4>
              <motion.ul className="space-y-3" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <motion.li variants={fadeIn}><Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">Dashboard</Link></motion.li>
                <motion.li variants={fadeIn}><Link to="/watchlist" className="text-sm text-gray-400 hover:text-white transition-colors">Watchlist</Link></motion.li>
                <motion.li variants={fadeIn}><Link to="/alerts" className="text-sm text-gray-400 hover:text-white transition-colors">Alerts</Link></motion.li>
              </motion.ul>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h4 className="font-heading font-semibold text-white mb-4">Resources</h4>
              <motion.ul className="space-y-3" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <motion.li variants={fadeIn}>
                  <a href="https://api.nasa.gov/" target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1">
                    NASA API <ExternalLink size={12} />
                  </a>
                </motion.li>
                <motion.li variants={fadeIn}>
                  <a href="https://github.com/saswatbarai/cosmic-watch" target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1">
                    GitHub <ExternalLink size={12} />
                  </a>
                </motion.li>
                <motion.li variants={fadeIn}>
                  <a href="https://api.nasa.gov/#apod" target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">NASA APOD</a>
                </motion.li>
              </motion.ul>
            </motion.div>
          </motion.div>

          <motion.div 
            className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-sm text-gray-500 text-center sm:text-left">
              © {new Date().getFullYear()} Perilux. Not affiliated with NASA. Data from NASA Open APIs.
            </p>
            <div className="flex items-center gap-6">
              <motion.a 
                href="https://github.com/saswatbarai/cosmic-watch" 
                target="_blank" 
                rel="noreferrer" 
                className="text-gray-500 hover:text-white transition-colors" 
                aria-label="GitHub"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                <Github size={18} />
              </motion.a>
              <motion.a 
                href="https://api.nasa.gov/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-gray-500 hover:text-white transition-colors" 
                aria-label="NASA API"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                <ExternalLink size={18} />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
