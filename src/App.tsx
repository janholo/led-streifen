import './App.css';
import React, { useEffect, useState } from 'react'
import ColorButton, { Color, ColorHsv, HSVtoRGB } from './components/ColorButton'

enum State {
  Idle = "Idle",
  Loading = "Loading",
  Error = "Error"
}


function PersistFavoriteColorList(colors: ColorHsv[]) {
  window.localStorage.setItem("favoriteColors", JSON.stringify(colors));
}

function LoadFavoriteColorList(): ColorHsv[] {
  var item = window.localStorage.getItem("favoriteColors")
  if (item == null) {
    return [{ hue: 0, saturation: 0, value: 0 }];
  }

  return JSON.parse(item)
}

const App = () => {
  const [hue, setHueRaw] = useState(0);
  const [saturation, setSaturationRaw] = useState(100);
  const [value, setValueRaw] = useState(100);
  const [timeoutId, setTimeoutId] = useState<number | undefined>(undefined);
  const [state, setState] = useState<State>(State.Idle);

  const [favoriteColorList, setFavoriteColorList] = useState<ColorHsv[]>([])

  function changeColor(color: ColorHsv) {

    const rgb = HSVtoRGB(color);

    changeColorRaw(rgb);
  }

  function changeColorRaw(color: Color) {
    setState(State.Loading)
    fetch(`http://192.168.2.114/?r=${color.r}&g=${color.g}&b=${color.b}`, { method: "POST" }).then(
      () => setState(State.Idle),
      () => setState(State.Error));
  }

  useEffect(() => {
    setFavoriteColorList(LoadFavoriteColorList())
  }, [])

  function addFavoriteColor(color: ColorHsv) {
    if (favoriteColorList.some(c => c.hue === color.hue && c.saturation === color.saturation && c.value === color.value)) {
      return;
    }

    const newList = [...favoriteColorList, color];

    setFavoriteColorList(newList);
    PersistFavoriteColorList(newList);
  }

  function removeFavoriteColor(color: ColorHsv) {
    if (color.hue === 0 && color.saturation === 0 && color.value === 0) {
      return;
    }

    const newList = favoriteColorList.filter(c => (c.hue === color.hue && c.saturation === color.saturation && c.value === color.value) === false);

    setFavoriteColorList(newList);
    PersistFavoriteColorList(newList);
  }

  function debounceChangeColor(color: ColorHsv) {
    if (timeoutId) {
      window.clearTimeout(timeoutId)
    }
    var id = window.setTimeout(() => changeColor(color), 500)
    setTimeoutId(id)
  }

  const hsv: ColorHsv = {
    hue: hue,
    saturation: saturation,
    value: value
  }
  const rgb = HSVtoRGB(hsv);

  const setHue = (h: number) => {
    setHueRaw(h)
    debounceChangeColor({ ...hsv, hue: h })
  }

  const setSaturation = (s: number) => {
    setSaturationRaw(s)
    debounceChangeColor({ ...hsv, saturation: s })
  }

  const setValue = (v: number) => {
    setValueRaw(v)
    debounceChangeColor({ ...hsv, value: v })
  }

  const rgbSaturationMin = HSVtoRGB({ ...hsv, saturation: 0 });
  const rgbSaturationMax = HSVtoRGB({ ...hsv, saturation: 100 });

  const rgbValueMin = HSVtoRGB({ ...hsv, value: 0 });
  const rgbValueMax = HSVtoRGB({ ...hsv, value: 100 });

  return (
    <div className="container">
      <main className="main" style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}>
        <div className="info">
          {state === State.Error && <p>Error</p>}
          {state === State.Loading && <div className='spinner'></div>}
        </div>
        <div className="farbe farbeH">
          <div className="text">Farbe</div>
          <input className="slider" value={hue} style={{ background: 'linear-gradient(to right, hsl(0, 100%, 50%), hsl(120, 100%, 50%), hsl(240, 100%, 50%), hsl(360, 100%, 50%))' }} type="range" min="0" max="100" onChange={e => setHue(parseInt(e.target.value))} />
        </div>
        <div className="farbe farbeS">
          <div className="text">Sättigung</div>
          <input className="slider" value={saturation} style={{ background: `linear-gradient(to right, rgb(${rgbSaturationMin.r}, ${rgbSaturationMin.g}, ${rgbSaturationMin.b}), rgb(${rgbSaturationMax.r}, ${rgbSaturationMax.g}, ${rgbSaturationMax.b}))` }} type="range" min="0" max="100" onChange={e => setSaturation(parseInt(e.target.value))} />
        </div>
        <div className="farbe farbeL">
          <div className="text">Helligkeit</div>
          <input className="slider" value={value} style={{ background: `linear-gradient(to right, rgb(${rgbValueMin.r}, ${rgbValueMin.g}, ${rgbValueMin.b}), rgb(${rgbValueMax.r}, ${rgbValueMax.g}, ${rgbValueMax.b}))` }} type="range" min="0" max="100" onChange={e => setValue(parseInt(e.target.value))} />
        </div>
        {
          favoriteColorList.length < 9 &&
          <button
            className="button favorit"
            style={{ gridRow: 5, gridColumnStart: 2, gridColumnEnd: 5 }}
            onClick={() => addFavoriteColor(hsv)}>Als Favorit hinzufügen</button>
        }
        {
          favoriteColorList.map((color, i) => {
            const t = (color.hue === 0 && color.saturation === 0 && color.value === 0) ? "Aus" : ""
            const row = 6 + Math.floor(i / 3)
            const column = 2 + Math.floor(i % 3)
            return <ColorButton
              key={`${color.hue}-${color.saturation}-${color.value}`}
              className="button"
              style={{ gridRow: row, gridColumn: column }}
              buttonColor={color}
              onColorSelect={color => {
                setHueRaw(color.hue)
                setValueRaw(color.value)
                setSaturationRaw(color.saturation)
                changeColor(color)
              }}
              onRemove={color => removeFavoriteColor(color)}>{t}</ColorButton>
          })
        }
      </main>
    </div>
  )
}

export default App;

