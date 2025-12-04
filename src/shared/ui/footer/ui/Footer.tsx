import styles from "./Footer.module.css";

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p>
                Challenge by <a href="https://www.frontendmentor.io?ref=challenge" target="_blank">Frontend
                Mentor</a>.
                Coded by <a href="https://www.frontendmentor.io/profile/1t1sCooL">1t1sCooL</a>
            </p>
        </footer>
    )
}