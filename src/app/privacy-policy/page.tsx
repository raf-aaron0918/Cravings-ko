import styles from './page.module.css';

export const metadata = {
  title: 'Privacy Policy | Cravings Ko',
};

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.main}>
      <div className="container">
        <h1 className={styles.title}>Privacy Policy</h1>
        <div className={styles.content}>
          <p>
            Welcome to Cravings Ko. Your privacy is important to us. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you visit our website.
          </p>
          <p>
            By using our website, you agree to the terms of this Privacy Policy.
          </p>

          <h2>Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Shipping or billing address</li>
            <li>Any information you voluntarily provide</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process orders and transactions</li>
            <li>Respond to inquiries and customer service requests</li>
            <li>Improve our website and services</li>
            <li>Send updates, promotions, or marketing communications if you opt in</li>
            <li>Ensure website security and prevent fraud</li>
          </ul>

          <h2>Sharing of Information</h2>
          <p>We do not sell or rent your personal information. However, we may share your information with:</p>
          <ul>
            <li>Service providers (e.g., payment processors and delivery services)</li>
            <li>Legal authorities when required by law</li>
            <li>Third parties in the event of a business transfer</li>
          </ul>

          <h2>Your Rights</h2>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent for data processing</li>
          </ul>

          <p>
            To exercise these rights, please contact us.
          </p>
        </div>
      </div>
    </main>
  );
}
