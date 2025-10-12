import ContactForm from "@/components/ContactForm";
import AnimatedWrapper from "@/components/AnimatedWrapper";

export default function Contact() {
  return (
    <AnimatedWrapper>
      <main className="max-w-3xl mx-auto py-20 px-4">
        <h2 className="text-3xl font-semibold mb-8 text-center">Get In Touch</h2>
        <ContactForm />
      </main>
    </AnimatedWrapper>
  );
}
