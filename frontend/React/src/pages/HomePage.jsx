// src/pages/HomePage.jsx
import PageLayout from "../components/PageLayout";
import Button from "../components/Button";
import styles from "../assets/HomePage.module.css";
import Card from "../components/Card";

const HomePage = () => {
  return (
    <PageLayout>
      <section className={styles.hero}>
        <h1 className={styles.title}>🚀 Welcome to WebSocket</h1>
        <p className={styles.subtitle}>
          Real-time chat, authentication, and modern UI — built with React.
        </p>
        <div className={styles.actions}>
          <Button>Get Started</Button>
          <Button>Learn More</Button>
        </div>
      </section>

      <section className={styles.features}>
        <Card
         details=
         {
          {
            title:"⚡ Fast Authentication"
          ,info:  "Login & Signup with secure flows using modular components."
          }
          } />
                <Card
         details=
         {
          {
            title:"💬 Real-time Chat"
          ,info:  "Experience instant messaging powered by WebSockets."
          }
          } />
             
          <Card
         details=
         {
          {
            title:"🎨 Clean UI"
          ,info:  "Styled with modular CSS for a modern, scalable design."
          }
          } />

        
        
        
      </section>
    </PageLayout>
  );
};

export default HomePage;
