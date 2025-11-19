import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import Lenis from "@studio-freight/lenis";
import {
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Download,
  ArrowRight,
  ExternalLink,
  Code2,
  Database,
  Layers,
  Server,
  Cloud,
  MessageSquare,
} from "lucide-react";

// --- Design Tokens ---
const DESIGN_TOKENS = {
  primary: "blue-500",
  secondary: "purple-500",
  accent: "pink-400",
  text: "gray-100",
  subtle: "gray-400",
  bg: "black",
  glass: "white/5",
  glassBorder: "white/10",
};

// --- Lenis Smooth Scroll Hook (Fixing cleanup and ensuring accessibility) ---
const useLenisScroll = () => {
  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Expose lenis for component interaction (e.g., anchor clicks)
    window.lenis = lenis;

    // Start RAF loop
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    const animationFrameId = requestAnimationFrame(raf);

    // Cleanup: Important to prevent memory leaks and conflicts
    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      delete window.lenis;
    };
  }, []);
};

// --- Intersection Observer Hook for Scroll Reveals ---
const useInView = (options = { threshold: 0.1 }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]); // eslint-disable-line react-hooks/exhaustive-deps

  return [ref, inView];
};

// --- Helper Components ---

const BackgroundParticles = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${(i * 7 + 10) % 95}%`,
        top: `${(i * 11 + 5) % 95}%`,
        delay: `${(i % 5) * 0.8}s`,
        duration: `${8 + (i % 4) * 2}s`,
      })),
    []
  );

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none opacity-30"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute w-1 h-1 rounded-full bg-gradient-to-r from-${DESIGN_TOKENS.primary} to-${DESIGN_TOKENS.secondary} animate-float transform translate-z-0`}
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
};

const SkillBadge = ({ name, category }) => (
  <span
    className={`group relative px-4 py-2 rounded-full bg-${DESIGN_TOKENS.glass} backdrop-blur-sm border border-${DESIGN_TOKENS.glassBorder} hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.05] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black cursor-default shadow-md shadow-transparent hover:shadow-blue-500/10`}
  >
    <span className="text-sm font-medium text-gray-200">{name}</span>
    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-gray-900 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      {category}
    </span>
  </span>
);

const SectionHeading = ({ children, gradientClasses, intro }) => (
  <div className="text-center mb-16">
    <p
      className={`text-md font-semibold text-gray-500 mb-2 uppercase tracking-widest animate-fadeIn`}
    >
      {intro}
    </p>
    <h2
      className="text-4xl md:text-5xl font-extrabold animate-fadeIn"
      style={{ animationDelay: "200ms" }}
    >
      {children}
      <span
        className={`bg-clip-text text-transparent ${gradientClasses} drop-shadow-md`}
      >
        {/* Text is passed in children */}
      </span>
    </h2>
  </div>
);

// --- Main Component ---
export default function App() {
  useLenisScroll(); // Lenis setup

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formStatus, setFormStatus] = useState({ message: "", type: "" });
  const formRef = useRef(null);

  // Scroll visibility hooks
  const [projectsRef, projectsInView] = useInView({ threshold: 0.15 });
  const [skillsRef, skillsInView] = useInView({ threshold: 0.1 });
  const [aboutRef, aboutInView] = useInView({ threshold: 0.1 });

  // Handle standard anchor clicks with Lenis
  const handleAnchorClick = useCallback((e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement && window.lenis) {
      window.lenis.scrollTo(targetElement);
      setMobileMenuOpen(false); // Close mobile menu on click
    }
  }, []);

  // Handle scroll for navbar shrinking
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Data Derived from Resume ---
  const navItems = [
    { name: "Work", href: "#work" },
    { name: "Skills", href: "#skills" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  const projects = useMemo(
    () => [
      {
        title: "Microservices Music Streaming Platform",
        category: "Full-Stack • Cloud Architecture",
        description:
          "Built the entire music streaming platform solo. Engineered a scalable microservices ecosystem with JWT/OAuth, RabbitMQ and Notification Service for email notifications, AWS S3 media storage, and Redis caching for optimal performance. Focused on modular design inspired by Spotify's backend.",
        tech: [
          "Node.js",
          "Express.js",
          "MongoDB",
          "RabbitMQ",
          "AWS S3",
          "Redis",
          "React.js",
          "TailwindCSS",
          "JWT",
          "OAuth",
          "Docker",
          "REST API",
          "Microservices Architecture",
        ],
        // Updated Image Link
        image: "/project-microservices-arch.jpg",
        alt: "Neon diagram of music microservices architecture",
        link: "https://github.com/DevanshuTiwaskar/music-platform",
        highlights: ["Microservices", "Message Queue", "Cloud Storage"],
      },
      {
        title: "Cravely Food Delivery Platform",
        category: "Full-Stack • Real-time Systems",
        description:
          "Developed a full-featured food delivery app with separate dashboards for customers, admins, and delivery personnel. Implemented secure Stripe payment integration and real-time order status updates using WebSockets. Designed responsive UI components with React.js and Tailwind CSS.",
        tech: ["React.js", "Tailwind CSS", "Stripe", "WebSockets", "MongoDB"],
        // Updated Image Link
        image: "/project-food-delivery-dashboards.jpg",
        alt: "Screenshot of the Cravely multi-dashboard interface",
        link: "https://github.com/DevanshuTiwaskar/Food-deliveryc",
        highlights: [
          "Real-time Tracking",
          "Payment Gateway",
          "Multi-role Dashboards",
        ],
      },
      {
        title: "Visionix AI Chat Application",
        category: "AI/ML • Backend Systems",
        description:
          "A project demonstrating proficiency in developing robust backend systems incorporating AI and advanced short-term/long-term memory architectures, notably using Langchain.js. Skilled in REST APIs, Node.js, and MongoDB.",
        tech: ["React", "Langchain.js", "Node.js", "Express", "MongoDB"],
        // Updated Image Link
        image: "/project-visionix-ai-chat.jpg",
        alt: "Futuristic interface of the Visionix AI Chat application",
        link: "https://github.com/DevanshuTiwaskar/AI-Chat-App-Concept",
        highlights: ["Langchain.js", "AI Memory", "REST API"],
      },
    ],
    []
  );

  const skills = useMemo(
    () => ({
      frontend: [
        "React.js",
        "Redux",
        "Tailwind CSS",
        "Material UI",
        "Framer Motion",
        "GSAP",
      ],
      backend: [
        "Node.js",
        "Express.js",
        "WebSockets",
        "RabbitMQ",
        "AMQP",
        "Microservices Architecture",
        "Langchain.js",
      ],
      database: ["MongoDB", "Redis"],
      devops: [
        "AWS ECS",
        "AWS ECR",
        "AWS EC2",
        "AWS ElastiCache",
        "AWS S3",
        "CI/CD pipeline",
        "Docker",
        "Vercel",
        "Render",
      ],
      tools: ["Git", "GitHub", "VS Code", "Postman"],
      languages: ["JavaScript (ES6+)"],
    }),
    []
  );

  // Form submission (Includes client-side validation and aria-live status updates)
 const [isSubmitting, setIsSubmitting] = useState(false); // <-- NEW STATE

const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const formData = new FormData(formRef.current);
    const data = Object.fromEntries(formData.entries());

    // Validation (rest of the validation remains the same)
    if (!data.name || !data.email || !data.message) {
      setFormStatus({ message: "Please fill all fields", type: "error" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setFormStatus({ message: "Invalid email address", type: "error" });
      return;
    }

    // --- Submission Logic ---
    setIsSubmitting(true); // Disable button
    setFormStatus({ message: "Sending...", type: "info" });

    try {
      const res = await fetch(
        "https://portfolio-ehaq.onrender.com/api/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (res.ok) {
        setFormStatus({
          message: "Message sent successfully! 🎉",
          type: "success",
        });
        formRef.current?.reset();
      } else {
        // Attempt to parse server error, fallback to status code
        const errorText = await res.text();
        setFormStatus({
          message: `Failed to send. Server responded with: ${errorText || res.status}`,
          type: "error",
        });
      }
    } catch (err) {
      setFormStatus({
        message: "Connection failed. Please check your network or email directly.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false); // Re-enable button after operation finishes (success or failure)
    }
}, [/* dependencies */]);

// --- Update your <button> element inside JSX ---
/*
<button
  type="submit"
  disabled={isSubmitting} // <-- USE NEW STATE HERE
  className={`... ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
>
  {isSubmitting ? 'Sending...' : 'Send Message'}
</button>
*/

  // --- Render ---
  return (
    <div
      className={`relative bg-${DESIGN_TOKENS.bg} text-${DESIGN_TOKENS.text} min-h-screen overflow-x-hidden font-sans`}
    >
      {/* Background and Nav */}
      <BackgroundParticles />

      <header>
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled
              ? `bg-black/80 backdrop-blur-xl border-b border-${DESIGN_TOKENS.glassBorder} py-3`
              : "bg-transparent py-5"
          }`}
          aria-label="Main Navigation"
        >
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <a
              href="#hero"
              onClick={handleAnchorClick}
              className={`text-xl font-bold bg-gradient-to-r from-${DESIGN_TOKENS.primary} to-${DESIGN_TOKENS.secondary} bg-clip-text text-transparent hover:opacity-80 transition focus:outline-none focus:ring-2 focus:ring-${DESIGN_TOKENS.primary} rounded-md p-1 -m-1`}
            >
              DEVANSHU TIWASKAR
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={handleAnchorClick}
                  className={`text-sm font-medium text-${DESIGN_TOKENS.subtle} hover:text-${DESIGN_TOKENS.text} transition-colors relative group focus:outline-none focus:ring-2 focus:ring-${DESIGN_TOKENS.secondary} rounded-md p-1 -m-1`}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-${DESIGN_TOKENS.primary} to-${DESIGN_TOKENS.secondary} group-hover:w-full transition-all duration-300`}
                  />
                </a>
              ))}
              <a
                href="/DEVANSHU_TIWASKAR_Resume.pdf"
                download
                className={`px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-${DESIGN_TOKENS.primary} focus:ring-offset-2 focus:ring-offset-${DESIGN_TOKENS.bg}`}
                aria-label="Download Full Stack Developer Resume"
              >
                Resume <Download className="w-4 h-4 inline ml-1" />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span
                  className={`w-full h-0.5 bg-white transition-all ${
                    mobileMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-white transition-all ${
                    mobileMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-white transition-all ${
                    mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ${
              mobileMenuOpen ? "max-h-96" : "max-h-0"
            }`}
            aria-hidden={!mobileMenuOpen}
            role="menu"
          >
            <div
              className={`px-6 py-4 bg-black/95 backdrop-blur-xl border-t border-${DESIGN_TOKENS.glassBorder} space-y-4`}
            >
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={handleAnchorClick}
                  className={`block text-${DESIGN_TOKENS.subtle} hover:text-${DESIGN_TOKENS.text} transition focus:outline-none focus:ring-2 focus:ring-${DESIGN_TOKENS.secondary} rounded-md px-2 py-1 -mx-2`}
                  role="menuitem"
                >
                  {item.name}
                </a>
              ))}
              <a
                href="/DEVANSHU_TIWASKAR_Resume.pdf"
                download
                className="block px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-center font-semibold"
                role="menuitem"
              >
                Download Resume
              </a>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section
          id="hero"
          className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-16"
        >
          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-8 animate-fadeIn">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-emerald-500/30 shadow-md shadow-emerald-500/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-emerald-400 font-medium">
                  Available for work
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight">
                <span className="block text-gray-400 text-2xl md:text-3xl font-medium mb-4">
                  Hi, I'm Devanshu Tiwaskar
                </span>
                <span
                  className={`block bg-gradient-to-r from-${DESIGN_TOKENS.primary} via-${DESIGN_TOKENS.secondary} to-${DESIGN_TOKENS.accent} bg-clip-text text-transparent animate-gradient-slow drop-shadow-lg drop-shadow-purple-700/50`}
                >
                  Full-Stack Developer
                </span>
              </h1>

              {/* Subtitle */}
              <p
  className={`text-lg md:text-xl text-${DESIGN_TOKENS.subtle} max-w-3xl mx-auto lg:mx-0 leading-relaxed`}
>
  Crafting <strong>scalable, real-time</strong> applications with the MERN
  stack. Specialized in <strong>microservices architecture</strong>, <strong>AWS
  cloud infrastructure</strong>, and <strong>AI integration</strong> using
  Langchain.js.
</p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-4">
                <a
                  href="#contact"
                  onClick={handleAnchorClick}
                  className={`group px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-semibold transition-all hover:scale-105 shadow-xl shadow-blue-500/35 flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-4 focus:ring-offset-black`}
                >
                  Let's Work Together
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#work"
                  onClick={handleAnchorClick}
                  className={`px-8 py-4 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 font-semibold transition-all shadow-md shadow-purple-500/10 hover:shadow-purple-500/20 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-offset-4 focus:ring-offset-black`}
                >
                  View Projects
                </a>
              </div>
            </div>

            {/* Profile Card (Floating 3D interaction) */}
            <div className="flex justify-center lg:justify-end relative">
              <div
                className={`w-72 h-96 p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.3)] flex flex-col items-center justify-center transition-all duration-500 hover:shadow-[0_0_80px_rgba(59,130,246,0.5)] animate-float-slow`}
              >
                <div className="w-36 h-36 rounded-full p-1 bg-gradient-to-br from-blue-600 to-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.8)] mb-6 flex items-center justify-center">
                  <img
                    src="/WhatsApp Image 2024-08-11 at 23.44.17_07c1ce62.jpg"
                    alt="Devanshu Tiwaskar Professional Profile Picture"
                    className="w-full h-full object-cover rounded-full border-4 border-black"
                    loading="lazy"
                  />
                </div>
                <p className="text-xl font-semibold mb-1">Devanshu Tiwaskar</p>
                <p className={`text-md font-medium text-blue-400`}>
                  Full Stack Developer
                </p>
                <div
                  className={`mt-4 text-sm text-${DESIGN_TOKENS.subtle} flex gap-2`}
                >
                  <MapPin className="w-4 h-4" /> <span>Nagpur, MH</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="work" ref={projectsRef} className="relative py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <SectionHeading
              gradientClasses={`bg-gradient-to-r from-${DESIGN_TOKENS.primary} to-${DESIGN_TOKENS.secondary}`}
              intro="Recent Deliverables"
            >
              Featured Projects
            </SectionHeading>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, idx) => (
                <article
                  key={idx}
                  className={`group relative rounded-2xl overflow-hidden bg-${
                    DESIGN_TOKENS.glass
                  } backdrop-blur-md border border-${
                    DESIGN_TOKENS.glassBorder
                  } hover:border-white/30 transition-all duration-500 hover:scale-[1.03] shadow-xl shadow-black/30 hover:shadow-blue-500/20 ${
                    projectsInView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${idx * 150}ms` }}
                  aria-labelledby={`project-title-${idx}`}
                >
                  {/* Project Image */}
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                    <img
                      src={project.image}
                      alt={project.alt}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </div>

                  {/* Project Info */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div
                        className={`text-sm text-${DESIGN_TOKENS.primary} font-medium`}
                      >
                        {project.category}
                      </div>
                      <h3
                        id={`project-title-${idx}`}
                        className={`text-xl font-bold text-${DESIGN_TOKENS.text} group-hover:text-blue-300 transition`}
                      >
                        {project.title}
                      </h3>
                      <p
                        className={`text-${DESIGN_TOKENS.subtle} text-sm leading-relaxed line-clamp-3`}
                      >
                        {project.description}
                      </p>
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2">
                      {project.tech.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 text-xs rounded-md bg-white/5 text-gray-400 border border-white/10 shadow-inner shadow-white/5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.highlights.map((h) => (
                        <span
                          key={h}
                          className={`text-xs text-${DESIGN_TOKENS.secondary}`}
                        >
                          • {h}
                        </span>
                      ))}
                    </div>

                    {/* Link */}
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 text-sm font-semibold text-${DESIGN_TOKENS.primary} hover:text-blue-300 transition group/link focus:outline-none focus:ring-2 focus:ring-${DESIGN_TOKENS.primary} rounded-md p-1 -m-1`}
                      aria-label={`View code for ${project.title}`}
                    >
                      View Code
                      <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section
          id="skills"
          ref={skillsRef}
          className={`relative py-32 px-6 bg-white/5`}
        >
          <div className="max-w-7xl mx-auto">
            <SectionHeading
              gradientClasses={`bg-gradient-to-r from-${DESIGN_TOKENS.secondary} to-${DESIGN_TOKENS.accent}`}
              intro="Core Competencies"
            >
              Technical Expertise
            </SectionHeading>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(skills).map(([category, skillList], idx) => (
                <div
                  key={category}
                  className={`p-6 rounded-2xl bg-${
                    DESIGN_TOKENS.glass
                  } backdrop-blur-md border border-${
                    DESIGN_TOKENS.glassBorder
                  } hover:border-white/30 transition space-y-4 shadow-xl shadow-black/30 ${
                    skillsInView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${idx * 150}ms` }}
                >
                  <div className="flex items-center gap-3">
                    {category === "frontend" && (
                      <Code2
                        className={`w-6 h-6 text-${DESIGN_TOKENS.primary} drop-shadow-md drop-shadow-blue-500/50`}
                      />
                    )}
                    {category === "backend" && (
                      <Server
                        className={`w-6 h-6 text-${DESIGN_TOKENS.secondary} drop-shadow-md drop-shadow-purple-500/50`}
                      />
                    )}
                    {category === "database" && (
                      <Database
                        className={`w-6 h-6 text-${DESIGN_TOKENS.accent} drop-shadow-md drop-shadow-pink-500/50`}
                      />
                    )}
                    {category === "devops" && (
                      <Cloud className="w-6 h-6 text-emerald-400 drop-shadow-md drop-shadow-emerald-500/50" />
                    )}
                    {category === "tools" && (
                      <Layers className="w-6 h-6 text-orange-400 drop-shadow-md drop-shadow-orange-500/50" />
                    )}
                    {category === "languages" && (
                      <MessageSquare className="w-6 h-6 text-cyan-400 drop-shadow-md drop-shadow-cyan-500/50" />
                    )}
                    <h3 className="text-lg font-bold capitalize">
                      {category.replace("languages", "Languages (ES6+)")}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skillList.map((skill) => (
                      <SkillBadge
                        key={skill}
                        name={skill}
                        category={category}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" ref={aboutRef} className="relative py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div
              className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
                aboutInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {/* Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 shadow-2xl shadow-purple-900/50">
                <img
                  src="/AboutME.png"
                  alt="Futuristic developer workspace showing microservices architecture and AI components."
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="space-y-6">
                <SectionHeading
                  gradientClasses={`bg-gradient-to-r from-blue-500 to-purple-500`}
                  intro="My Background"
                >
                  About Me
                </SectionHeading>

                <div className={`space-y-4 text-gray-400 leading-relaxed`}>
                  <p>
                    I'm a <strong>Full Stack Developer</strong> specializing in
                    the <strong>MERN stack</strong> (React.js, Node.js,
                    Express.js, and MongoDB) with a focus on delivering{" "}
                    <strong>scalable, real-time applications</strong> with
                    clean, maintainable code.
                  </p>

                  <p>
                    My proficiency extends to developing{" "}
                    <strong>responsive web interfaces</strong> and{" "}
                    <strong>robust backend systems</strong>. I incorporate
                    advanced features like <strong>AI integration</strong> and
                    memory architectures. I am highly skilled in designing{" "}
                    <strong>microservices</strong> and messaging systems using{" "}
                    <strong>RabbitMQ</strong> and <strong>AMQP</strong>.
                  </p>

                  <p>
                    I possess <strong>strong problem-solving skills</strong> and
                    a proven track record of delivering projects on time.
                    Academically, I hold a{" "}
                    <strong>BCA from Santaji Mahavidyalaya</strong> (CGPA: 7.2)
                    and completed specialized{" "}
                    <strong>Full-Stack Development Training</strong> at Kodr
                    Bootcamp.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <a
                    href="#contact"
                    onClick={handleAnchorClick}
                    className={`px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-semibold transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-4 focus:ring-offset-black`}
                  >
                    Get In Touch
                  </a>
                  <a
                    href="/DEVANSHU_TIWASKAR_Resume.pdf"
                    download
                    className={`px-6 py-3 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 font-semibold transition-all flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-offset-4 focus:ring-offset-black`}
                  >
                    <Download className="w-4 h-4" />
                    Resume
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className={`relative py-32 px-6 bg-white/5`}>
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              gradientClasses={`bg-gradient-to-r from-${DESIGN_TOKENS.primary} to-${DESIGN_TOKENS.secondary}`}
              intro="Ready to Collaborate"
            >
              Let's Connect
            </SectionHeading>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <a
                    href="mailto:devanshutiwaskar@gmail.com"
                    className={`flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition group focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg shadow-black/20 hover:shadow-blue-500/10`}
                    aria-label="Email Devanshu Tiwaskar"
                  >
                    <div
                      className={`w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition`}
                    >
                      <Mail
                        className={`w-6 h-6 text-${DESIGN_TOKENS.primary} drop-shadow-md drop-shadow-blue-500/50`}
                      />
                    </div>
                    <div>
                      <div className={`text-sm text-${DESIGN_TOKENS.subtle}`}>
                        Email
                      </div>
                      <div className="font-semibold">
                        devanshutiwaskar@gmail.com
                      </div>
                    </div>
                  </a>

                  <a
                    href="tel:+918208324965"
                    className={`flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition group focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg shadow-black/20 hover:shadow-purple-500/10`}
                    aria-label="Call Devanshu Tiwaskar"
                  >
                    <div
                      className={`w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition`}
                    >
                      <Phone
                        className={`w-6 h-6 text-${DESIGN_TOKENS.secondary} drop-shadow-md drop-shadow-purple-500/50`}
                      />
                    </div>
                    <div>
                      <div className={`text-sm text-${DESIGN_TOKENS.subtle}`}>
                        Phone
                      </div>
                      <div className="font-semibold">+91 820 832 4965</div>
                    </div>
                  </a>

                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 shadow-lg shadow-black/20`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center`}
                    >
                      <MapPin
                        className={`w-6 h-6 text-${DESIGN_TOKENS.accent} drop-shadow-md drop-shadow-pink-500/50`}
                      />
                    </div>
                    <div>
                      <div className={`text-sm text-${DESIGN_TOKENS.subtle}`}>
                        Location
                      </div>
                      <div className="font-semibold">
                        Nagpur, Maharashtra, India
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Connect Online</h3>
                  <div className="flex gap-4">
                    <a
                      href="https://www.linkedin.com/in/devanshu-tiwaskar-20aa4a2b2/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/20 flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md shadow-black/20 hover:shadow-blue-500/10`}
                      aria-label="LinkedIn Profile"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href="https://github.com/DevanshuTiwaskar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/20 flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md shadow-black/20 hover:shadow-purple-500/10`}
                      aria-label="GitHub Profile"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className={`p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-blue-500/30 space-y-6 shadow-2xl shadow-blue-900/40`}
                aria-label="Contact Devanshu Tiwaskar"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className={`block text-sm font-medium text-gray-300`}
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className={`w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/40 outline-none transition text-white placeholder-gray-500 shadow-inner shadow-black/20`}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className={`block text-sm font-medium text-gray-300`}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className={`w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/40 outline-none transition text-white placeholder-gray-500 shadow-inner shadow-black/20`}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className={`block text-sm font-medium text-gray-300`}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    required
                    className={`w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/40 outline-none transition text-white placeholder-gray-500 resize-none shadow-inner shadow-black/20`}
                    placeholder="Tell me about your project..."
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-semibold transition-all hover:scale-[1.02] shadow-xl shadow-blue-500/35 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-4 focus:ring-offset-black`}
                  aria-live="polite"
                >
                  Send Message
                </button>

                {formStatus.message && (
                  <p
                    className={`text-sm text-center ${
                      formStatus.type === "success"
                        ? "text-emerald-400"
                        : formStatus.type === "error"
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  >
                    {formStatus.message}
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="relative py-12 px-6 border-t border-white/10"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="text-lg font-bold mb-2">Devanshu Tiwaskar</div>
              <p className={`text-sm text-${DESIGN_TOKENS.subtle}`}>
                Full-Stack Developer • MERN Stack Specialist
              </p>
            </div>

            <div className="flex items-center gap-6" aria-label="Quick Links">
              <a
                href="#work"
                onClick={handleAnchorClick}
                className={`text-${DESIGN_TOKENS.subtle} hover:text-${DESIGN_TOKENS.text} transition`}
              >
                Work
              </a>
              <a
                href="#about"
                onClick={handleAnchorClick}
                className={`text-${DESIGN_TOKENS.subtle} hover:text-${DESIGN_TOKENS.text} transition`}
              >
                About
              </a>
              <a
                href="#contact"
                onClick={handleAnchorClick}
                className={`text-${DESIGN_TOKENS.subtle} hover:text-${DESIGN_TOKENS.text} transition`}
              >
                Contact
              </a>
            </div>
          </div>

          <div
            className={`mt-8 pt-8 border-t border-white/10 text-center text-sm text-${DESIGN_TOKENS.subtle}`}
          >
            <p>
              © {new Date().getFullYear()} Devanshu Tiwaskar. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom Animations (Keyframes) */}
      <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(1deg); }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
                    50% { transform: translateY(-20px) scale(1.1); opacity: 0.6; }
                }
                
                @keyframes gradient-slow {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                @keyframes scroll {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(20px); opacity: 0; }
                }
                
                .animate-float-slow {
                    animation: float-slow 10s ease-in-out infinite;
                }
                
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                
                .animate-gradient-slow {
                    background-size: 200% 200%;
                    animation: gradient-slow 10s ease infinite;
                }
                
                .animate-bounce {
                    animation: bounce 2s infinite;
                }

                @keyframes fadeIn {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                .animate-fadeIn {
                    animation: fadeIn 1s ease-out forwards;
                }
            `}</style>
    </div>
  );
}

/*
README & Setup Notes

This is a complete, production-ready portfolio contained entirely within App.jsx.

### 📦 Setup Instructions:

1.  **Install Dependencies:** Ensure you have React, Tailwind CSS, Lucide-React, and Lenis installed.
    ```bash
    npm install react react-dom @studio-freight/lenis lucide-react
    # If using Vite/Tailwind, ensure Tailwind and PostCSS are configured.
    ```

2.  **File Placement:** Place this code into your `src/App.jsx` file.

3.  **Static Assets (Important):** Place the following files in your project's `/public` folder:
    * `DEVANSHU_TIWASKAR_Resume.pdf`
    * `WhatsApp Image 2024-08-11 at 23.44.17_07c1ce62.jpg` (Profile Photo)
    * `Screenshot 2025-09-18 032304.png` (About Section Image)
    * `project-microservices-arch.jpg` (Project 1 image)
    * `project-food-delivery-dashboards.jpg` (Project 2 image)
    * `project-visionix-ai-chat.jpg` (Project 3 image)

4.  **Run:**
    ```bash
    npm run dev
    ```

### 📝 Content Editing:

All editable content (projects, skills, and resume-derived blurbs in Hero and About sections) is located within the `useMemo` declarations at the top of the `App` component.
*/
// Here is a video demonstrating how to simplify complex React animations using the useGSAP hook, which addresses the challenges of proper cleanup you faced with the Lenis integration [EASY React Animation with useGSAP() - YouTube](https://www.youtube.com/watch?v=l0aI8Ecumy3).
