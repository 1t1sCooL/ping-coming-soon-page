import styles from "./logo.module.css";

export const Logo = () => {
    return (
        <div className={styles.logo}>
            <img src="/images/logo.svg" alt="logo"/>
        </div>
    )
}