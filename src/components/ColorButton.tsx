import { HTMLProps } from "react"
import useLongPress from "./useLongPress";

export type Color = {
    r: number,
    g: number,
    b: number
}

export type ColorHsv = {
    hue: number,
    saturation: number,
    value: number
}

export function HSVtoRGB(color: ColorHsv): Color {
    let h = color.hue / 100;
    let s = color.saturation / 100;
    let v = color.value / 100;
    
    let r: number = 0, g: number = 0, b: number = 0, i: number, f: number, p: number, q: number, t: number;
  
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: 
          r = v
          g = t
          b = p;
          break;
        case 1: 
          r = q
          g = v
          b = p
          break;
        case 2:
          r = p
          g = v
          b = t
          break;
        case 3:
          r = p
          g = q
          b = v
          break;
        case 4:
          r = t
          g = p
          b = v
          break;
        case 5:
          r = v
          g = p
          b = q
          break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
  }

type ColorButtonProps = {
    buttonColor: ColorHsv,
    onColorSelect: (color: ColorHsv) => void,
    onRemove: (color: ColorHsv) => void
} & HTMLProps<HTMLButtonElement>

const ColorButton = (props: ColorButtonProps) => {
    const longPressEvent = useLongPress(() => props.onRemove(props.buttonColor), () => props.onColorSelect(props.buttonColor), true, 1000);

    const rgb = HSVtoRGB(props.buttonColor);
  
    return (
        <button
            className={props.className}
            style={{ ...props.style, backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}
            onMouseDown={longPressEvent.onMouseDown}
            onMouseLeave={longPressEvent.onMouseLeave}
            onMouseUp={longPressEvent.onMouseUp}
            onTouchStart={longPressEvent.onTouchStart}
            onTouchEnd={longPressEvent.onTouchEnd}>
                {props.children}
        </button>)
}

export default ColorButton
