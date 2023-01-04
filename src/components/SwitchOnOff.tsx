import { setDefaultResultOrder } from "dns";
import { HTMLProps, useEffect, useState } from "react"
import Switch from "react-switch";

type SwitchOnOffProps = {
} & HTMLProps<HTMLElement>

const SwitchOnOff = (props: SwitchOnOffProps) => {

  let [loading, setLoading] = useState<boolean>(true);
  let [lightOn, setLightOn] = useState<boolean>(false);
  let [error, setError] = useState<boolean>(false);

  function queryState() {
    if(document.hidden === true) {
      return;
    }

    fetch(`http://wood-light/state`, { method: "GET" })
    .then(
      (response) => response.json(),
      () => { setLoading(false); setError(true)})
      .then((json) => {
        let isOn = json as number === 1 ? true : false;
        setLoading(false);
        console.log(json);
        setLightOn(isOn);
      }); 
  }

  useEffect(() => {
    queryState();
    
    document.addEventListener("visibilitychange", queryState, false)
    return () => {
      document.removeEventListener("visibilitychange", queryState)
    }
  }, [])

  function switchLight(on: boolean) {
    setError(false);
    setLoading(true);
    fetch(`http://wood-light/${on ? "on" : "off"}`, { method: "POST" }).then(
      () => { setLoading(false); setLightOn(on)},
      () => { setLoading(false); setError(true)});
  }

  let handleChange = (
    checked: boolean,
    event: React.SyntheticEvent<MouseEvent | KeyboardEvent> | MouseEvent,
    id: string
  ) => {
    switchLight(checked);
  }

    return (
      <div className={props.className} style={props.style}>
        <Switch 
          disabled={loading}
          uncheckedIcon={loading ? (<div className='spinnerForSwitch'></div>) : undefined}
          checkedIcon={loading ? (<div className='spinnerForSwitch'></div>) : undefined}
          onChange={handleChange}
          checked={lightOn}
          offHandleColor={error ? "#FF0000": undefined} 
          onHandleColor={error ? "#FF0000": undefined} />
      </div>
    )
}

export default SwitchOnOff
