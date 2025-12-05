import styles from "./footerWrapper.module.css";
import {Facebook, Instagram, Twitter} from "@/shared/ui";

export const FooterWrapper = () => {
    return (
        <div className={styles.footerWrapper}>
            <div className={styles.svgWrapper}>
                <Facebook/>
                <Twitter/>
                <Instagram/>
            </div>
            <p>&copy; Copyright Ping. All rights reserved.</p>
        </div>
    )
}