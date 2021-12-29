import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import styles from '../styles/Home.module.css'

function HSVtoRGB(h: number, s: number, v: number) {
  var r: number = 0, g: number = 0, b: number = 0, i: number, f: number, p: number, q: number, t: number;

  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
  };
}

function ChangeColor(h: number, s: number, v: number) {

  const rgb = HSVtoRGB(h / 100, s / 100, v / 100);

  fetch(`http://192.168.2.114/?r=${rgb.r}&g=${rgb.g}&b=${rgb.b}`, { method: "POST" });
}

const Home: NextPage = () => {
  const [hue, setHueRaw] = useState(0);
  const [saturation, setSaturationRaw] = useState(100);
  const [value, setValueRaw] = useState(100);
  const [timeoutId, setTimeoutId] = useState<number | undefined>(undefined);

  function debounceChangeColor(h: number, s: number, v: number) {
    if(timeoutId) {
      window.clearTimeout(timeoutId)
    }
    var id = window.setTimeout(() => ChangeColor(h, s, v), 500)
    setTimeoutId(id)
  }

  const setHue = (h: number) => {
    setHueRaw(h)
    debounceChangeColor(h, saturation, value)
  }

  const setSaturation = (s: number) => {
    setSaturationRaw(s)
    debounceChangeColor(hue, s, value)
  }

  const setValue = (v: number) => {
    setValueRaw(v)
    debounceChangeColor(hue, saturation, v)
  }

  const rgb = HSVtoRGB(hue / 100, saturation / 100, value / 100);

  const rgbSaturationMin = HSVtoRGB(hue / 100, 0, value / 100);
  const rgbSaturationMax = HSVtoRGB(hue / 100, 1, value / 100);

  const rgbValueMin = HSVtoRGB(hue / 100, saturation / 100, 0);
  const rgbValueMax = HSVtoRGB(hue / 100, saturation / 100, 1);

  return (
    <div className={styles.container}>
      <Head>
        <title>LED Streifen</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main className={styles.main} style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}>
        <div className={styles.farbe + ' ' + styles.farbeH}>
          <div className={styles.text}>Farbe</div>
          <input className={styles.slider} value={hue} style={{ background: 'linear-gradient(to right, hsl(0, 100%, 50%), hsl(120, 100%, 50%), hsl(240, 100%, 50%), hsl(360, 100%, 50%))' }} type="range" min="0" max="100" onChange={e => setHue(parseInt(e.target.value))} />
        </div>
        <div className={styles.farbe + ' ' + styles.farbeS}>
          <div className={styles.text}>Sättigung</div>
          <input className={styles.slider} value={saturation} style={{ background: `linear-gradient(to right, rgb(${rgbSaturationMin.r}, ${rgbSaturationMin.g}, ${rgbSaturationMin.b}), rgb(${rgbSaturationMax.r}, ${rgbSaturationMax.g}, ${rgbSaturationMax.b}))` }} type="range" min="0" max="100" onChange={e => setSaturation(parseInt(e.target.value))} />
        </div>
        <div className={styles.farbe + ' ' + styles.farbeL}>
          <div className={styles.text}>Helligkeit</div>
          <input className={styles.slider} value={value} style={{ background: `linear-gradient(to right, rgb(${rgbValueMin.r}, ${rgbValueMin.g}, ${rgbValueMin.b}), rgb(${rgbValueMax.r}, ${rgbValueMax.g}, ${rgbValueMax.b}))` }} type="range" min="0" max="100" onChange={e => setValue(parseInt(e.target.value))} />
        </div>
        <button className={styles.button} style={{gridRow: 5, gridColumn: 2, backgroundColor: 'black'}} >AUS</button>
        <button className={styles.button} style={{gridRow: 5, gridColumn: 3, backgroundColor: 'green'}} ></button>
        <button className={styles.button} style={{gridRow: 5, gridColumn: 4, backgroundColor: 'red'}} ></button>
        <button className={styles.button} style={{gridRow: 6, gridColumn: 2, backgroundColor: 'black'}} >Aus</button>
        <button className={styles.button} style={{gridRow: 6, gridColumn: 3, backgroundColor: 'green'}} ></button>
        <button className={styles.button} style={{gridRow: 6, gridColumn: 4, backgroundColor: 'red'}} ></button>
      </main>
    </div>
  )
}

export default Home
