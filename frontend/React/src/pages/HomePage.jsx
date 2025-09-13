// src/pages/HomePage.jsx
import PageLayout from "../components/PageLayout";
import Button from "../components/Button";
import styles from "../assets/HomePage.module.css";

const HomePage = () => {
  return (
    <PageLayout>
      <section className={styles.hero}>
        <h1 className={styles.title}>🚀 Welcome to WebSocket Demo</h1>
        <p className={styles.subtitle}>
          Real-time chat, authentication, and modern UI — built with React.
        </p>
        <div className={styles.actions}>
          <Button>Get Started</Button>
          <Button>Learn More</Button>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.card}>
          <h3>⚡ Fast Authentication</h3>
          <p>Login & Signup with secure flows using modular components.</p>
        </div>
        <div className={styles.card}>
          <h3>💬 Real-time Chat</h3>
          <p>Experience instant messaging powered by WebSockets.</p>
        </div>
        <div className={styles.card}>
          <h3>🎨 Clean UI</h3>
          <p>Styled with modular CSS for a modern, scalable design.</p>
        </div>
      </section>
    </PageLayout>
  );
};

export default HomePage;
