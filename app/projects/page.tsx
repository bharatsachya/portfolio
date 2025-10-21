import ProjectCard from "@/components/ProjectCard";
import AnimatedWrapper from "@/components/AnimatedWrapper";

export default function Projects() {
  const projects = [
    {
      title: "Stock Prediction App",
      description: "An AI-powered stock trend predictor using RNNs, Streamlit, and TensorFlow.",
      image: "/project1.png",
      link: "https://github.com/bharatsachya/wisetrader",
    },
    {
      title: "Responsive Design Generator",
      description: "Hackathon project that generates responsive web layouts from sketches.",
      image: "/project2.png",
      link: "https://github.com/bharatsachya/design-generator",
    },
  ];

  return (
    <AnimatedWrapper>
      <main className="max-w-6xl mx-auto py-20 px-4 grid md:grid-cols-2 gap-10">
        {projects.map((p, i) => (
          <ProjectCard key={i} {...p} />
        ))}
      </main>
    </AnimatedWrapper>
  );
}
