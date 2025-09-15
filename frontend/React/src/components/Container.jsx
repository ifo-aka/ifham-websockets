import { useSelector } from 'react-redux';
import styles from '../assets/Container.module.css'

const Container = ({children})=>{
  const showSpinner = useSelector((s) => s.auth.showSpinner);
return  <div className={styles.container} style={{ position: "relative" }}>
      {children}

      {showSpinner && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(39, 38, 38, 0.35)", // overlay
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
           backdropFilter:" blur(10px)",
          }}
        >
                   <div
            className={`spinner-border ${styles.spinner}`}
            style={{
              width: "4rem",
              height: "4rem",
              position: "absolute",
              top: "20%",
              
             
            }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>


}
export default Container;