import styles from './page.module.css';

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Choose your favorite snacks from our Menu, add them to your cart, and proceed to checkout. Fill in your delivery details, and we'll handle the rest! You'll receive a confirmation once your order is processed."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We currently accept Cash on Delivery (COD) and QR Payments (GCash/Maya). You can select your preferred method during checkout."
    },
    {
      question: "How long does delivery take?",
      answer: "We strive to deliver your cravings as fresh as possible. Standard delivery within Tanza and nearby areas usually takes 1-2 days. For specific schedules, feel free to contact us."
    },
    {
      question: "How should I store my snacks?",
      answer: "To maintain freshness, keep our crispy snacks (like Lumpia and Cheese Sticks) in a cool, dry place or refrigerate/freeze them if not consumed immediately. Re-heat in an oven or air-fryer for that perfect crunch!"
    },
    {
      question: "Where are you located?",
      answer: "We are located at Blk 12 Lot 64, Ph 2, Spring Town, Bucal, Tanza, Cavite. While we primarily operate online, we love serving our local community!"
    },
    {
      question: "Do you accept bulk orders for events?",
      answer: "Yes! We love being part of your special moments. For bulk orders or catering inquiries, please reach out to us via our Contact page or call us at +63 965 615 2690."
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
            {faqs.map((faq, index) => (
              <div key={index} className={`${styles.faqItem} handcrafted-border`}>
                <h3 className={styles.question}>{faq.question}</h3>
                <p className={styles.answer}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.stillHaveQuestions}>
        <div className="container">
          <h2>Still have questions?</h2>
          <p>We're here to help! Reach out to us anytime.</p>
          <a href="/contact" className={styles.contactBtn}>Contact Us</a>
        </div>
      </section>
    </main>
  );
}
