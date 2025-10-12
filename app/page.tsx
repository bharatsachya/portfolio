"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { User, Briefcase, Code, Mail, Linkedin, Github, Twitter, FolderGit2, Sun, Moon } from 'lucide-react';

// DUMMY DATA --- Replace with your actual data
const USER_DATA = {
  name: "Lovanshu Garg",
  title: "Full Stack & AI Engineer",
  bio: "I build intelligent, high-performance web applications that merge creativity with machine learning. With experience across full-stack development and AI systems, I love turning complex data into seamless user experiences.",
  profilePicture: "https://media.licdn.com/dms/image/v2/D4D03AQGdSOZG6CFYRA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1696827394398?e=1762992000&v=beta&t=Q_B1cJmyM3AjuUAP6QR-wmbdnakKVF25jQyNYFCzy9s",
  socials: {
    linkedin: "https://linkedin.com/in/lovgarg",
    github: "https://github.com/bharatsachya",
    twitter: "https://x.com/Bharatsachya",
  },
  email: "lovanshu.garg@example.com",
  experience: [
    {
      title: "AI Engineer & Full Stack Developer",
      company: "ByteBell",
      date: "Aug 2025 - Present",
       description: [
    "Built a robust LLM ingestion pipeline with Pinecone and MongoDB to manage embeddings and context storage.",
    "Optimized retrieval accuracy using meta-strategies for data curation and vector space efficiency.",
    "Developed a multi-agent framework ('Agent Box') enabling intelligent query routing and context-aware LLM responses."
  ]
    },
    {
      title: "Research and Development Intern",
      company: "Cadence Design Systems",
      date: "Feb 2025 - June 2025",
      description: [
    "Optimized a Cloud Dashboard by using Google Closure Compiler for JavaScript minification, reducing load time and improving overall dashboard efficiency.",
    "Resolved critical front-end and back-end bugs (CCRs) to enhance user experience and maintain production stability.",
    "Developed a standalone C++ File Manager to efficiently handle file operations across Cadence components, improving workflow reliability.",
    "Managed version control and collaboration using Git and Perforce, including branching, merging, and rollback; ensured code quality through peer reviews on Review Board.",
    "Customized and fine-tuned software components to meet business requirements, enhancing system performance, scalability, and reliability."
  ]
    },
  ],
  skills: [
    { name: "Next.js", icon: "nextjs" },
    { name: "React", icon: "react" },
    { name: "TypeScript", icon: "typescript" },
    { name: "Node.js", icon: "nodejs" },
    { name: "Python", icon: "python" },
    { name: "TensorFlow", icon: "tensorflow" },
    { name: "Scikit-learn", icon: "scikit" },
    { name: "Tailwind CSS", icon: "tailwind" },
    { name: "Framer Motion", icon: "framer" },
    { name: "Docker", icon: "docker" },
    { name: "AWS", icon: "aws" },
    { name: "Firebase", icon: "firebase" },
  ],
  projects: [
    {
      title: "Stock Vision AI",
      description:
        "A real-time stock market prediction platform leveraging RNN models and Yahoo Finance APIs, visualized through Streamlit dashboards.",
      image: "https://drive.google.com/file/d/1uvp-ym00Ey8iRD2ErTX_Q0RLRAhvy5m5/view",
      tags: ["TensorFlow", "Streamlit", "Yahoo API", "Python"],
      liveUrl: "#",
      repoUrl: "https://github.com/lovanshugarg/stock-prediction-app",
    },
    {
      title: "Iamyourbot",
      description:
        "A hackathon project that uses AI to convert hand-drawn wireframes into responsive React code — blending design intelligence with automation.",
      image: "https://placehold.co/600x400/334155/fff?text=Design+Generator",
      tags: ["Next.js", "AI", "OpenAI API", "Tailwind"],
      liveUrl: "#",
      repoUrl: "#",
    },
    {
      title: "Smart PCB Design Assistant",
      description:
        "An AI chatbot integrated into PCB design software to guide engineers, optimize layouts, and reduce design time using ML pipelines.",
      image: "https://placehold.co/600x400/475569/fff?text=PCB+AI+Assistant",
      tags: ["Node.js", "Machine Learning", "React", "FastAPI"],
      liveUrl: "#",
      repoUrl: "#",
    },
    {
      title: "AI-Powered Job Portal",
      description:
        "An intelligent job portal for government jobs featuring an AI-based recommendation system to improve candidate-job matching.",
      image: "https://placehold.co/600x400/64748b/fff?text=Job+Portal+AI",
      tags: ["Next.js", "Python", "MongoDB", "ML"],
      liveUrl: "#",
      repoUrl: "#",
    },
  ],
};

// HELPER COMPONENTS & ICONS

const SkillIcon = ({ iconName, className }) => {
  const SvgIcon = {
    react: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48 0a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>,
    nextjs: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>,
    typescript: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.5 10.5h3m-3 3h3m-3 3h3m7.5-1.5c0 .8-.7 1.5-1.5 1.5h-1.5v-6H12c.8 0 1.5.7 1.5 1.5v3zM9 18v-6h1.5v6H9zM21 18l-3-3m0 0l-3-3m3 3l3-3m-3 3l3 3"></path></svg>,
    javascript: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 18l4-4-4-4M8 6l-4 4 4 4"></path></svg>,
    tailwind: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 12c-3.333 0-6.667-1.333-10-4C5.333 4.667 8.667 3.333 12 3.333c3.333 0 6.667 1.334 10 4.001-3.333 2.666-6.667 4-10 4zm0 9c-3.333 0-6.667-1.333-10-4 3.333-2.667 6.667-4 10-4 3.333 0 6.667 1.333 10 4-3.333 2.667-6.667 4-10 4z"></path></svg>,
    framer: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12V5h7l-7 7zM12 12h7v7l-7-7zM12 5h7v7l-7-7z"></path></svg>,
    nodejs: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>,
    figma: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path><path d="M12 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path><path d="M12 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path><path d="M6 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path><path d="M18 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path></svg>,
  }[iconName];

  return SvgIcon || null;
};

// Main Page Component
export default function PortfolioPage() {
  const [activeSection, setActiveSection] = useState("about");
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const experienceRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: experienceRef,
    offset: ["start end", "center start"]
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const sections = [
    { id: 'about', label: 'About', icon: <User className="h-4 w-4" /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 className="h-4 w-4" /> },
    { id: 'skills', label: 'Skills', icon: <Code className="h-4 w-4" /> },
    { id: 'contact', label: 'Contact', icon: <Mail className="h-4 w-4" /> },
  ];

  const handleNavClick = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(id);
  };
  
  // Animation Variants
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } } };
  const skillContainerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } } };
  const skillItemVariants = { hidden: { scale: 0.5, opacity: 0 }, visible: { scale: 1, opacity: 1, transition: { type: 'spring', damping: 15, stiffness: 400 } } };
  const projectCardVariants = { hidden: { opacity: 0, y: 50, rotateX: -15 }, visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } } };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 font-sans leading-relaxed transition-colors duration-500">
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-3 gap-12 px-4 sm:px-6 lg:px-8">
        
        {/* Left Sidebar */}
        <motion.aside 
          className="lg:col-span-1 lg:sticky lg:top-0 lg:h-screen py-12"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="text-center lg:text-left">
                <img 
                  src={USER_DATA.profilePicture}
                  alt={USER_DATA.name}
                  className="w-32 h-32 rounded-full mx-auto lg:mx-0 mb-6 border-4 border-yellow-500 dark:border-yellow-400 object-cover"
                />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{USER_DATA.name}</h1>
                <h2 className="text-xl font-medium text-yellow-600 dark:text-yellow-300 mt-2">{USER_DATA.title}</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-xs mx-auto lg:mx-0">{USER_DATA.bio}</p>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:block mt-12">
                <ul className="space-y-4">
                  {sections.map(section => (
                    <li key={section.id}>
                      <button
                        onClick={() => handleNavClick(section.id)}
                        className="group flex items-center gap-3 w-full"
                      >
                        <span className={`h-px w-8 bg-gray-400 dark:bg-gray-600 group-hover:w-16 group-hover:bg-yellow-500 dark:group-hover:bg-yellow-300 transition-all duration-300 ${activeSection === section.id ? 'w-16 bg-yellow-500 dark:bg-yellow-300' : ''}`}></span>
                        <span className={`font-bold text-xs tracking-widest uppercase group-hover:text-yellow-600 dark:group-hover:text-yellow-300 transition-colors duration-300 ${activeSection === section.id ? 'text-yellow-600 dark:text-yellow-300' : 'text-gray-500'}`}>
                          {section.label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            
            <div className="flex justify-center lg:justify-start items-center gap-5 mt-8 lg:mt-0">
                {/* Social Links */}
                <motion.div 
                    className="flex items-center gap-5"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.a href={USER_DATA.socials.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-300 transition-colors" variants={itemVariants}>
                        <Github size={24} />
                    </motion.a>
                    <motion.a href={USER_DATA.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-300 transition-colors" variants={itemVariants}>
                        <Linkedin size={24} />
                    </motion.a>
                    <motion.a href={USER_DATA.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-300 transition-colors" variants={itemVariants}>
                        <Twitter size={24} />
                    </motion.a>
                </motion.div>
                {/* Theme Toggle */}
                <button onClick={toggleTheme} className="ml-4 p-2 rounded-full text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-300 focus:outline-none transition-colors">
                    {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                </button>
            </div>
          </div>
        </motion.aside>

        {/* Right Scrollable Content */}
        <main className="lg:col-span-2 py-12 lg:py-24">
          <div className="space-y-24 md:space-y-32">

            {/* About Section */}
            <motion.section id="about" className="scroll-mt-24" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }} onViewportEnter={() => setActiveSection('about')}>
              <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-300 mb-4 uppercase tracking-wider">About Me</h3>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>Hello! I'm {USER_DATA.name}, a full-stack and AI engineer based in India. I have a deep passion for building intelligent, high-performance web applications and exploring the possibilities of AI in everyday software. My journey in tech started in 2018, tinkering with HTML, CSS, and small JavaScript projects — what began as curiosity quickly grew into a lifelong passion for building digital experiences.</p>

<p>Since then, I’ve worked on a range of projects — from hackathons and freelance AI tools to full-stack applications for startups and independent clients. My focus today is designing scalable, efficient, and user-friendly web applications, often integrating AI models and automation pipelines to deliver smarter solutions.</p>

<p>I also love sharing knowledge with the community. I’ve contributed to open-source projects, guided fellow developers on AI and web development topics, and enjoy experimenting with innovative ideas that push the boundaries of conventional software.</p>
              </div>
            </motion.section>

            {/* Experience Section */}
            <motion.section id="experience" className="scroll-mt-24" onViewportEnter={() => setActiveSection('experience')}>
              <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-300 mb-6 uppercase tracking-wider">Experience</h3>
              <div ref={experienceRef} className="relative mt-8">
                  <motion.div style={{ scaleY }} className="absolute left-[5px] top-0 w-0.5 h-full bg-yellow-500 dark:bg-yellow-400 origin-top"/>
                  <div className="space-y-12 pl-6">
                      {USER_DATA.experience.map((job, index) => (
                          <motion.div key={index} className="relative" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5 }}>
                              <div className="absolute -left-[22px] top-1 w-4 h-4 rounded-full bg-gray-50 dark:bg-gray-900 border-2 border-yellow-500 dark:border-yellow-400" />
                              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{job.date}</p>
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-yellow-600 dark:group-hover:text-yellow-300 transition-colors">{job.title}</h4>
                              <p className="font-medium text-gray-600 dark:text-gray-400">{job.company}</p>
                              <ul className="mt-2 list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                                  {job.description.map((point, i) => (<li key={i}>{point}</li>))}
                              </ul>
                          </motion.div>
                      ))}
                  </div>
              </div>
            </motion.section>
            
            {/* Projects Section */}
            <motion.section id="projects" className="scroll-mt-24" onViewportEnter={() => setActiveSection('projects')}>
              <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-300 mb-6 uppercase tracking-wider">Projects</h3>
              <motion.div className="space-y-12" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                {USER_DATA.projects.map((project, index) => (
                  <motion.div key={index} className="group grid grid-cols-1 md:grid-cols-8 gap-4 items-start p-4 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800/50" variants={projectCardVariants} whileHover={{ scale: 1.02, y: -5, rotateX: 2 }} viewport={{ once: true, amount: 0.3 }}>
                    <div className="md:col-span-3 rounded-lg overflow-hidden relative">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover rounded-md border-2 border-gray-200 dark:border-gray-700 group-hover:border-yellow-500 dark:group-hover:border-yellow-400 transition-colors duration-300" />
                    </div>
                    <div className="md:col-span-5">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-300 transition-colors duration-300">{project.title}</h4>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">{project.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.tags.map(tag => (<span key={tag} className="text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-yellow-300 px-3 py-1 rounded-full">{tag}</span>))}
                      </div>
                       <div className="mt-4 flex items-center gap-4">
                            <a href={project.liveUrl} className="text-sm font-medium text-gray-800 dark:text-white hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors">View Live</a>
                            <a href={project.repoUrl} className="text-sm font-medium text-gray-800 dark:text-white hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors">View Code</a>
                        </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>

            {/* Skills Section */}
            <motion.section id="skills" className="scroll-mt-24" onViewportEnter={() => setActiveSection('skills')} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={skillContainerVariants}>
                <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-300 mb-6 uppercase tracking-wider">Skills</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {USER_DATA.skills.map(skill => (
                        <motion.div key={skill.name} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center gap-3 aspect-square" variants={skillItemVariants} whileHover={{ scale: 1.1, backgroundColor: theme === 'light' ? '#fef3c7' : '#f59e0b20', transition: { duration: 0.2 } }}>
                            <SkillIcon iconName={skill.icon} className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                            <span className="font-medium text-sm text-center">{skill.name}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Contact Section */}
            <motion.section id="contact" className="scroll-mt-24" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }} onViewportEnter={() => setActiveSection('contact')}>
              <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-300 mb-4 uppercase tracking-wider">Get In Touch</h3>
              <p className="text-gray-700 dark:text-gray-300 max-w-lg mb-6">
                My inbox is always open. Whether you have a question or just want to say hi, I’ll try my best to get back to you! Feel free to reach out about potential projects or collaborations.
              </p>
              <motion.a href={`mailto:${USER_DATA.email}`} className="inline-block bg-red-600 text-white font-bold tracking-wide px-6 py-3 rounded-md hover:bg-red-500 transition-colors duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Say Hello
              </motion.a>
            </motion.section>
            
            <footer className="text-center py-6 text-sm text-gray-500 dark:text-gray-600">
                <p>Designed & Built by {USER_DATA.name}</p>
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
}

