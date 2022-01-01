from machine import Pin, PWM
import network
import socket
import gc

def init():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print('connecting to network...')
        wlan.connect('EmmasKornspeicher', 'etf2b3cd8kd75pd8')
        while not wlan.isconnected():
            pass
    print('network config:', wlan.ifconfig())

    global redPin
    redPin = PWM(Pin(17))
    redPin.freq(1000)
    redPin.duty(0)

    global greenPin
    greenPin = PWM(Pin(18))
    greenPin.freq(1000)
    greenPin.duty(0)

    global bluePin
    bluePin = PWM(Pin(19))
    bluePin.freq(1000)
    bluePin.duty(0)

html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Lichtband</title>
    <style>
        button {
            width: 60vw;
            height: 15vh;
            color: white;
            font-size: 4vh;
            border-radius: 3vh;
            border-style: none;
        }
        .main-grid {
            height: 100vh;
            display: grid;
            grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
            place-items: center;
        }
    </style>
</head>

<body>
    <div class="main-grid">
        <button id="redButton" style="background-color: red; grid-row: 1;">
            Rot
        </button>

        <button id="greenButton" style="background-color: green; grid-row: 2;">
            Grün
        </button>

        <button id="blueButton" style="background-color: blue; grid-row: 3;">
            Blau
        </button>

        <button id="whiteButton" style="background-color: rgb(253, 237, 218); color: black; grid-row: 4;">
            Weiß
        </button>

        <button id="offButton" style="background-color: black; grid-row: 5;">
            Aus
        </button>
    </div>

    <script>
        function postColor(red, green, blue) {
            fetch(`/?r=${red}&g=${green}&b=${blue}`, { method: "POST" });
        }
        document.getElementById("redButton").addEventListener("click", function (e) {
            postColor(255, 0, 0)
        }, false);
        document.getElementById("greenButton").addEventListener("click", function (e) {
            postColor(0, 255, 0)
        }, false);
        document.getElementById("blueButton").addEventListener("click", function (e) {
            postColor(0, 0, 255)
        }, false);
        document.getElementById("whiteButton").addEventListener("click", function (e) {
            postColor(255, 230, 180)
        }, false);
        document.getElementById("offButton").addEventListener("click", function (e) {
            postColor(0, 0, 0)
        }, false);
    </script>
</body>
</html>
"""

def start():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('', 80))

    s.listen(1)

    print('listening...')
    while True:
        try:
            if gc.mem_free() < 102000:
                gc.collect()
            conn, addr = s.accept()
            conn.settimeout(3.0)
            #print('')
            #print('Got a connection from %s' % str(addr))
            request = conn.recv(1024)
            conn.settimeout(None)

            index1 = request.index(bytes([ord(' ')]), 0)
            index2 = request.index(bytes([ord(' ')]), index1+1)
            #print(index1)
            #print(index2)

            method = request[0:index1]
            url = request[index1+1:index2]

            #print(method)
            #print(url)

            response = ''

            if method == bytes([ord('G'), ord('E'), ord('T')]):
                #print('GET request!')
                response = html
                conn.send('HTTP/1.1 200 OK\n')
            elif method == bytes([ord('P'), ord('O'), ord('S'), ord('T')]):
                #print('POST request!')

                greenIndex = url.index(bytes([ord('g')]), 0)
                blueIndex = url.index(bytes([ord('b')]), greenIndex+1)

                red = url[4:greenIndex-1]
                green = url[greenIndex+2:blueIndex-1]
                blue= url[blueIndex+2:]

                red = int(red.decode())
                green = int(green.decode())
                blue = int(blue.decode())

                #print(red)
                #print(green)
                #print(blue)

                redPin.duty(red*4)
                greenPin.duty(green*4)
                bluePin.duty(blue*4)

                conn.send('HTTP/1.1 200 OK\n')
                conn.send('Access-Control-Allow-Origin: *\n')
            else:
                print('Other request -> return 400 bad request')
                conn.send('HTTP/1.1 400 Bad Request\n')

            conn.send('Content-Type: text/html\n')
            conn.send('Connection: close\n\n')
            if response != '':
                conn.sendall(response)
            conn.close()
        except (ValueError, IndexError) as e:
            print(e)
            conn.send('HTTP/1.1 400 Bad Request\n')
            conn.send('Connection: close\n\n')
            conn.close()
        except OSError as e:
            conn.close()
            print(e)
            print('Connection closed')

init()
start()