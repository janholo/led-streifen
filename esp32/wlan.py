import network
import socket
import gc

def do_connect():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print('connecting to network...')
        wlan.connect('EmmasKornspeicher', 'etf2b3cd8kd75pd8')
        while not wlan.isconnected():
            pass
    print('network config:', wlan.ifconfig())


html = """<!DOCTYPE html>
<html>
    <head> <title>ESP8266 Pins</title> </head>
    <body> <h1>ESP8266 Pins</h1>
        <table border="1"> <tr><th>Pin</th><th>Value</th></tr> </table>
    </body>
</html>
"""

def http_server():
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
            print('')
            print('Got a connection from %s' % str(addr))
            request = conn.recv(1024)
            conn.settimeout(None)

            index1 = request.index(bytes([ord(' ')]), 0)
            index2 = request.index(bytes([ord(' ')]), index1+1)
            print(index1)
            print(index2)

            method = request[0:index1]
            url = request[index1+1:index2]

            print(method)
            print(url)

            response = ''

            if method == bytes([ord('G'), ord('E'), ord('T')]):
                print('GET request!')
                response = html
                conn.send('HTTP/1.1 200 OK\n')
            elif method == bytes([ord('P'), ord('O'), ord('S'), ord('T')]):
                print('POST request!')

                greenIndex = url.index(bytes([ord('g')]), 0)
                blueIndex = url.index(bytes([ord('b')]), greenIndex+1)

                red = url[4:greenIndex-1]
                green = url[greenIndex+1:blueIndex-1]
                blue= url[blueIndex+1:]

                print(red)
                print(green)
                print(blue)

                print(red.decode())
                print(green.decode())
                print(blue.decode())

                red = int(red.decode())
                green = int(green.decode())
                blue = int(blue.decode())

                print(red)
                print(green)
                print(blue)


                conn.send('HTTP/1.1 200 OK\n')
            else:
                print('Other request -> return 400 bad request')
                conn.send('HTTP/1.1 400 Bad Request\n')

            conn.send('Content-Type: text/html\n')
            conn.send('Connection: close\n\n')
            if response != '':
                conn.sendall(response)
            conn.close()
        except ValueError as e:
            print(e)
            conn.send('HTTP/1.1 400 Bad Request\n')
            conn.send('Connection: close\n\n')
            conn.close()
        except OSError as e:
            conn.close()
            print(e)
            print('Connection closed')
