import styles from "./inputWrapper.module.css";

export const InputWrapper = () => {
    return (
        <div className={styles.inputWrapper}>
            <input placeholder={'Your email address...'}/>
            <button>Notify Me</button>
        </div>
    )
}