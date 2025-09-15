import styles from "../assets/Card.module.css"

const Card = ({details})=>{
    return <div className={styles.card}>
        <h1>{details.title}</h1>
        <p>{details.info}</p>
    </div>
}
export default Card;