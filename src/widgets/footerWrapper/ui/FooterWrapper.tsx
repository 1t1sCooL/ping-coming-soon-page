import styles from "./footerWrapper.module.css";
import {Svg} from "@/shared/ui/svg";

export const FooterWrapper = () => {
    return (
        <div className={styles.footerWrapper}>
            <div className={styles.svgWrapper}>
                <Svg SM={'facebook'}/>
                <Svg SM={'twitter'}/>
                <Svg SM={'instagram'}/>
            </div>
            <p>&copy; Copyright Ping. All rights reserved.</p>
        </div>
    )
}