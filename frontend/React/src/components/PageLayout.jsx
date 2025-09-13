// src/components/PageLayout.jsx
import Header from "./Header";
import styles from "../assets/PageLayout.module.css";

const PageLayout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default PageLayout;
