import styles from './MainPage.module.css'
import { Footer, Logo } from '@/shared/ui'
import {FooterWrapper, ImgWrapper, InputWrapper} from "@/widgets/";

export const MainPage = () => {
    return (
            <section className={styles.container}>
                <Logo/>
                <h1>We are launching <span>soon!</span></h1>
                <p>Subscribe and get notified</p>
                <InputWrapper/>
                <ImgWrapper/>
                    <FooterWrapper/>
                <Footer />
            </section>
    )
}