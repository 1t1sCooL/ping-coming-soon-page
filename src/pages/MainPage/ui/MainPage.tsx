import styles from './MainPage.module.css'

export const MainPage = () => {
    return (<>
            <section className={styles.container}>
                <div className={styles.logoWrapper}>

                </div>
                <h1>We are launching soon!</h1>
                <p>Subscribe and get notified</p>
                <input placeholder={'Your email address...'}/>
                <button>Notify Me</button>
                <div className={styles.imgWrapper}>

                </div>
                    <div>
                        <div className={styles.svgWrapper}>

                        </div>
                        <p>&copy; Copyright Ping. All rights reserved.</p>
                    </div>
            </section>
            <footer>
                <p className={styles.footer}>
                    Challenge by <a href="https://www.frontendmentor.io?ref=challenge" target="_blank">Frontend
                    Mentor</a>.
                    Coded by <a href="https://www.frontendmentor.io/profile/1t1sCooL">1t1sCooL</a>.
                </p>
            </footer>
        </>

    )
}