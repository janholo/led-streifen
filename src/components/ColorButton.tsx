import { HTMLProps } from "react"
import useLongPress from "./useLongPress";

export type Color = {
    r: number,
    g: number,
    b: number
}

type ColorButtonProps = {
    buttonColor: Color,
    onColorSelect: (color: Color) => void,
    onRemove: (color: Color) => void
} & HTMLProps<HTMLButtonElement>

const ColorButton = (props: ColorButtonProps) => {
    const longPressEvent = useLongPress(() => props.onRemove(props.buttonColor), () => props.onColorSelect(props.buttonColor), true, 1000);

    return (
        <button
            className={props.className}
            style={{ ...props.style, backgroundColor: `rgb(${props.buttonColor.r}, ${props.buttonColor.g}, ${props.buttonColor.b})` }}
            onMouseDown={longPressEvent.onMouseDown}
            onMouseLeave={longPressEvent.onMouseLeave}
            onMouseUp={longPressEvent.onMouseUp}
            onTouchStart={longPressEvent.onTouchStart}
            onTouchEnd={longPressEvent.onTouchEnd}>
                {props.children}
        </button>)
}

export default ColorButton
