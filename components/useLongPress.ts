import { MouseEventHandler, TouchEventHandler, useCallback, useRef, useState } from "react";

const useLongPress = (
    onLongPress: () => void,
    onClick: () => void,
    shouldPreventDefault = true,
    delay = 300
): {
    onMouseDown: MouseEventHandler<HTMLButtonElement>,
    onTouchStart: TouchEventHandler<HTMLButtonElement>,
    onMouseUp: MouseEventHandler<HTMLButtonElement>,
    onMouseLeave: MouseEventHandler<HTMLButtonElement>,
    onTouchEnd: TouchEventHandler<HTMLButtonElement>
} => {
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const timeout = useRef<number>();
    const target = useRef<EventTarget>();

    const start = useCallback(
        (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.TouchEvent<HTMLButtonElement>): void => {
            if (shouldPreventDefault && event.target) {
                event.target.addEventListener("touchend", preventDefault, {
                    passive: false
                });
                target.current = event.target;
            }
            timeout.current = window.setTimeout(() => {
                setLongPressTriggered(true);
                onLongPress();
            }, delay);
        },
        [onLongPress, delay, shouldPreventDefault]
    );

    const clear = useCallback(
        (event, shouldTriggerClick = true) => {
            timeout.current && clearTimeout(timeout.current);
            shouldTriggerClick && !longPressTriggered && onClick();
            setLongPressTriggered(false);
            if (shouldPreventDefault && target.current) {
                target.current.removeEventListener("touchend", preventDefault);
            }
        },
        [shouldPreventDefault, onClick, longPressTriggered]
    );

    return {
        onMouseDown: e => start(e),
        onTouchStart: e => start(e),
        onMouseUp: e => clear(e),
        onMouseLeave: e => clear(e, false),
        onTouchEnd: e => clear(e)
    };
};

const isTouchEvent = (event: Event) => {
    return "touches" in event;
};

const preventDefault = (event: Event) => {
    if (!isTouchEvent(event)) return;

    const touchEvent = event as TouchEvent;

    if (touchEvent.touches.length < 2 && event.preventDefault) {
        event.preventDefault();
    }
};

export default useLongPress;