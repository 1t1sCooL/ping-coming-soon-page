import styles from "./svg.module.css";

interface SvgProps {
    SM: string;
}

export const Svg = ({SM}:SvgProps) => {
    return (
        <div className={styles.svg}>
            <img src={`/images/${SM}.svg`} alt={`${SM} icon`}/>
        </div>
    )
}