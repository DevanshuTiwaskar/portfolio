import { useEffect, useRef, useState } from "react";
import Lenis from "@studio-freight/lenis";
import 'remixicon/fonts/remixicon.css';


export default function App() {
  const formRef = useRef();
  const [status, setStatus] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");
    const data = new FormData(formRef.current);
    const payload = Object.fromEntries(data.entries());

    try {
      const res = await fetch("https://portfolio-ehaq.onrender.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setStatus(json.message || "Message sent!");
      formRef.current.reset();
    } catch (err) {
      console.error(err);
      setStatus("Failed to send.");
    }
  };

  const handleAnchorClick = () => {
    setMobileOpen(false);
  };

  return (
    <div className="bg-gray-950 text-gray-100 font-inter tracking-tight overflow-x-hidden">
      {/* HEADER */}
          <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/70 border-b border-gray-800/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">
          Hi, I’m <span className="text-blue-500">Devanshu</span>{" "}
          <span className="inline-block animate-wave">👋</span>
        </h1>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="#work" className="hover:text-blue-400">Work</a>
          <a href="#about" className="hover:text-blue-400">About</a>
          <a href="#contact" className="hover:text-blue-400">Contact</a>
          <a
            href="#"
            className="px-4 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition shadow-md shadow-blue-600/30"
          >
            Resume
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <i className="ri-menu-line"></i>
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="flex flex-col bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 md:hidden px-6 py-4 space-y-4 text-sm font-medium">
          <a href="#work" onClick={handleAnchorClick} className="hover:text-blue-400">Work</a>
          <a href="#about" onClick={handleAnchorClick} className="hover:text-blue-400">About</a>
          <a href="#contact" onClick={handleAnchorClick} className="hover:text-blue-400">Contact</a>
          <a
            href="#"
            className="px-4 py-2 block rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition"
          >
            Resume
          </a>
        </nav>
      )}
    </header>
      <main>
        {/* HERO */}
        <section
          id="hero"
          className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black"
        >
          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, idx) => (
              <div
                key={idx}
                className={`absolute w-2 h-2 bg-blue-500 rounded-full animate-bounce-slow`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${5 + Math.random() * 8}s`,
                }}
              />
            ))}
          </div>

          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
            {/* Left Text */}
            <div className="text-center lg:text-left">
              <p className="uppercase tracking-widest text-sm text-blue-400 mb-3 animate-fadeIn">
                Full Stack
              </p>
              <h2 className="text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent animate-[gradient_6s_ease_infinite] drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
                Developer
              </h2>
              <p className="text-gray-400 mb-10 max-w-lg mx-auto lg:mx-0 animate-fadeIn delay-500 text-lg">
                Crafting futuristic web apps with{" "}
                <span className="text-blue-400 font-semibold animate-pulse">Node.js</span>,{" "}
                <span className="text-purple-400 font-semibold animate-pulse">React</span>, and{" "}
                <span className="text-pink-400 font-semibold animate-pulse">MongoDB</span>.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-8">
                <a href="#contact" className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:shadow-[0_0_50px_rgba(59,130,246,0.8)] transition-transform transform hover:scale-110">
                  Hire Me
                </a>
                <a href="#work" className="px-6 py-3 rounded-lg font-medium transition border border-blue-500/50 hover:border-blue-400 hover:text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 transform">
                  See Work
                </a>
              </div>

              <ul className="space-y-2 text-sm text-gray-400 animate-fadeIn delay-700">
                <li>🚀 Learning <strong className="text-gray-200">MERN Stack</strong></li>
                <li>💡 Building projects to sharpen my skills</li>
                <li>✅ Open to internships & freelance work</li>
              </ul>
            </div>

            {/* Right Profile */}
            <div className="relative flex justify-center">
              <div className="relative w-72 h-96 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-500/30 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.6)] hover:scale-105 hover:rotate-1 transition-transform duration-500 animate-[float_6s_ease-in-out_infinite]">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-[0_0_25px_rgba(147,51,234,0.6)] mb-6 flex items-center justify-center overflow-hidden">
                  <img
                    src="/WhatsApp Image 2024-08-11 at 23.44.17_07c1ce62.jpg"
                    alt="Profile picture"
                    className="w-full h-full object-cover rounded-full border-2 border-gray-900/50"
                  />
                </div>
                <p className="text-gray-200 text-lg">Available</p>
                <p className="text-sm font-medium text-blue-400">Remote · Contract</p>
              </div>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-400 animate-bounce text-2xl">
             <i className="ri-arrow-down-line"></i>

          </div>
        </section>
{/* PROJECTS */}
       <section id="work" className="relative py-24 px-6 bg-gradient-to-b from-gray-950 via-gray-900/80 to-gray-950">
  <div className="max-w-6xl mx-auto text-center">
    <h3 className="text-4xl font-extrabold tracking-tight mb-16 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
      Selected Projects
    </h3>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {[
        { 
          name: "Cravely", 
          type: "Food Delivery • 2024", 
          img: "https://plus.unsplash.com/premium_photo-1743169049814-4f54dbc53b54?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDV8fGZvb2QlMjBkZWxpdmVyeSUyMGFwcHxlbnwwfHwwfHx8MA%3D%3D",
          link: "#" 
        },
        { 
          name: "Visionix", 
          type: "AI Chat App • 2024", 
          img: "https://plus.unsplash.com/premium_photo-1677252438426-595a3a9d5e11?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          link: "#" 
        },
        { 
          name: "Move", 
          type: "React App • 2024", 
          img: "https://images.unsplash.com/photo-1634155617372-69e7865ff131?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          link: "#" 
        }
      ].map((project, idx) => (
        <article
          key={idx}
          className="group relative rounded-2xl overflow-hidden bg-gray-800/40 backdrop-blur-lg border border-gray-700/50 shadow-lg hover:shadow-blue-500/20 transition duration-300 hover:scale-[1.03]"
        >
          <img
            src={project.img}
            alt={project.name}
            className="w-full h-56 object-cover group-hover:opacity-90 transition duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition"></div>
          <div className="relative p-6 text-left">
            <h4 className="text-xl font-semibold text-white">{project.name}</h4>
            <p className="text-sm text-gray-400 mb-3">{project.type}</p>
            <a
              href={project.link}
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition inline-flex items-center gap-1"
            >
              View case study
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>


        {/* ABOUT */}
        <section id="about" className="py-20 px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="w-full h-80 bg-gradient-to-tr from-purple-500/30 to-blue-500/20 rounded-3xl"></div>
            <div>
              <h3 className="text-3xl font-bold mb-6">About Me</h3>
              <p className="text-gray-400 mb-4">
                I'm a product designer turned full-stack developer. I build product-led apps that solve real problems. Outside work I love gaming and bingeing sci-fi.
              </p>
              <p className="text-gray-400 mb-6">
                Design philosophy: make it visually appealing, functional, and delightful. I enjoy working with small teams and startups.
              </p>
              <a href="#contact" className="px-6 py-3 border border-blue-500 text-blue-400 rounded-lg font-medium hover:bg-blue-500 hover:text-white transition">
                Let’s talk
              </a>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="relative py-20 px-6 bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
            {/* Left */}
            <div>
              <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
              <p className="text-gray-400 mb-8">
                Have a project in mind or just want to say hello? Fill out the form and I’ll get back to you as soon as possible.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-800">📍</div>
                  <p className="text-gray-300">Nagpur, Maharashtra</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-800">📧</div>
                  <p className="text-gray-300">devanshutiwaskar@gmail.com</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-800">📞</div>
                  <p className="text-gray-300">+91 820 832 4965</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium">Your Name</label>
                  <input type="text" name="name" placeholder="John Doe" className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Email</label>
                  <input type="email" name="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Message</label>
                  <textarea name="message" rows="4" placeholder="Write your message..." className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
                <button type="submit" className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 transition font-medium">Send Message</button>
                <p className="text-sm text-gray-400 mt-2">{status}</p>
              </form>
            </div>
          </div>
        </section>
      </main>

 {/* FOOTER */}
        <footer className="border-t border-gray-800 py-6 px-6 text-sm">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
            <div>© {new Date().getFullYear()} Devanshu — Full Stack Developer</div>
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="hover:text-blue-400">Dribbble</a>
              <a href="#" className="hover:text-blue-400">Instagram</a>
              <a href="#" className="hover:text-blue-400">LinkedIn</a>
              <a href="#" className="hover:text-blue-400">Twitter</a>
            </div>
          </div>
        </footer>

      {/* Custom Animations */}
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0px);}50%{transform:translateY(-12px);} }
        @keyframes gradient {0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
        @keyframes wave {0%{transform:rotate(0deg);}10%{transform:rotate(14deg);}20%{transform:rotate(-8deg);}30%{transform:rotate(14deg);}40%{transform:rotate(-4deg);}50%{transform:rotate(10deg);}60%{transform:rotate(0deg);}100%{transform:rotate(0deg);} }
        @keyframes bounce-slow {0%,100%{transform: translateY(0);}50%{transform: translateY(-20px);}}
        .animate-wave{display:inline-block;animation:wave 2s infinite;transform-origin:70% 70%;}
        .animate-bounce-slow{animation:bounce-slow 8s infinite ease-in-out;}
        .animate-fadeIn{opacity:0; animation:fadeIn 1s forwards;}
        .animate-fadeIn.delay-500{animation-delay:0.5s;}
        .animate-fadeIn.delay-700{animation-delay:0.7s;}
        @keyframes fadeIn {0%{opacity:0; transform: translateY(10px);}100%{opacity:1; transform: translateY(0);}}
        @keyframes gradient {0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
        @keyframes float {0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
      `}</style>
    </div>
  );
}


        