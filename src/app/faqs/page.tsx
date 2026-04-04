import styles from './page.module.css';

export default function FAQPage() {
  const faqs = [
    {
      number: 1,
      question: "Are your products ready to eat?",
      answer: "Our cheese sticks and lumpia are delivered frozen and ready-to-cook. Simply fry them to enjoy a fresh and crispy snack anytime."
    },
    {
      number: 2,
      question: "Are your cookies also frozen?",
      answer: "No, our cookies are freshly baked and ready to eat upon delivery."
    },
    {
      number: 3,
      question: "How should I store the products?",
      answer: "Keep the products in the freezer immediately after receiving them to maintain freshness and quality."
    },
    {
      number: 4,
      question: "How long can I store them?",
      answer: "Our frozen products can typically last up to 2–3 weeks in the freezer if properly stored."
    },
    {
      number: 5,
      question: "Do I need to thaw before cooking?",
      answer: "No. For best results, cook directly from frozen to achieve a crispy texture."
    },
    {
      number: 6,
      question: "Do you offer same-day delivery?",
      answer: "Delivery options may vary depending on availability and location. You can message us directly for faster assistance."
    },
    {
      number: 7,
      question: "How can I order?",
      answer: "You can browse our products through our website or social media pages, then send us a message via Messenger to place your order."
    },
    {
      number: 8,
      question: "What payment methods do you accept?",
      answer: "We accept common payment methods such as cash on delivery and online payments (details will be provided upon ordering)."
    },
    {
      number: 9,
      question: "Can I customize my order?",
      answer: "Yes! You can choose your preferred flavors, quantities, or bundles depending on availability."
    },
    {
      number: 10,
      question: "What makes Cravings Ko different?",
      answer: "We offer a variety of sweet and savory snacks in one place—Made to Match Every Cravings—with a focus on quality, affordability, and convenience."
    }
  ];

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Frequently Asked Questions</h1>
          <p className={styles.subtitle}>Everything you need to know about Cravings Ko</p>
        </div>
      </header>

      <section className={styles.faqSection}>
        <div className={`${styles.faqContainer} container`}>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <div key={faq.number} className={`${styles.faqItem} handcrafted-border`}>
                <h3 className={styles.question}>
                  {faq.question}
                </h3>
                <p className={styles.answer}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.stillHaveQuestions}>
        <div className="container">
          <h2 className={styles.ctaTitle}>Still have questions?</h2>
          <p className={styles.ctaText}>We're here to help! Reach out to us anytime.</p>
          <a href="/contact" className={styles.contactBtn}>Contact Us</a>
        </div>
      </footer>
    </main>
  );
}
