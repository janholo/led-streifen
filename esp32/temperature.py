import dht
import machine
import time


d = dht.DHT22(machine.Pin(25))

while True:
  time.sleep(3)             
  d.measure()
  print(d.temperature()) # eg. 23.6 (掳C)
  print(d.humidity())    # eg. 41.3 (% RH)
