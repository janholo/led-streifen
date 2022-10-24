#define DEBUG false
#define DEBUG_SERIAL if(DEBUG)Serial

// Load Wi-Fi library
#include <WiFi.h>

const char* htmlResponse = 
"<!doctype html> \
<html lang=\"en\"> \
 \
<head> \
    <meta charset=\"utf-8\" /> \
    <link rel=\"icon\" href=\"https://janholo.github.io/led-streifen/favicon.png\" /> \
    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" /> \
    <meta name=\"theme-color\" content=\"#000000\" /> \
    <link rel=\"apple-touch-icon\" href=\"https://janholo.github.io/led-streifen/logo192.png\" /> \
    <link rel=\"manifest\" href=\"https://janholo.github.io/led-streifen/manifest.json\" /> \
    <title>LED Streifen</title> \
    <script defer=\"defer\" src=\"https://janholo.github.io/led-streifen/static/js/main.465363fe.js\"></script> \
    <link href=\"https://janholo.github.io/led-streifen/static/css/main.6a189911.css\" rel=\"stylesheet\"> \
</head> \
 \
<body><noscript>You need to enable JavaScript to run this app.</noscript> \
    <div id=\"root\"></div> \
</body> \
 \
</html>";

// Replace with your network credentials
const char* ssid = "EmmasKornspeicher";
const char* password = "etf2b3cd8kd75pd8";
const char* hostname = "led-strip";

// Set web server port number to 80
WiFiServer server(80);

// Variable to store the HTTP request
String header;
String url;
String currentLine;
String red;
String green;
String blue;

// Assign output variables to GPIO pins
const int redPin = 17;
const int greenPin = 18;
const int bluePin = 19;

const int freq = 5000;
const int ledChannelRed = 0;
const int ledChannelGreen = 1;
const int ledChannelBlue = 2;
const int resolution = 8;

// Current time
unsigned long currentTime = millis();
// Previous time
unsigned long previousTime = 0; 
// Define timeout time in milliseconds (example: 2000ms = 2s)
const long timeoutTime = 2000;

void setup() {
  Serial.begin(115200);
  // Initialize the output variables as outputs
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  
  ledcSetup(ledChannelRed, freq, resolution);
  ledcAttachPin(redPin, ledChannelRed);
  ledcWrite(ledChannelRed, 0);

  ledcSetup(ledChannelGreen, freq, resolution);
  ledcAttachPin(greenPin, ledChannelGreen);
  ledcWrite(ledChannelGreen, 0);

  ledcSetup(ledChannelBlue, freq, resolution);
  ledcAttachPin(bluePin, ledChannelBlue);
  ledcWrite(ledChannelBlue, 0);

  // Connect to Wi-Fi network with SSID and password
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.setHostname(hostname);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  // Print local IP address and start web server
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  server.begin();
}

void loop(){
  WiFiClient client = server.available();   // Listen for incoming clients

  if (client) {                             // If a new client connects,
    currentTime = millis();
    previousTime = currentTime;
    DEBUG_SERIAL.println("New Client.");          // print a message out in the serial port
    currentLine = "";                // make a String to hold incoming data from the client
    while (client.connected() && currentTime - previousTime <= timeoutTime) {  // loop while the client's connected
      currentTime = millis();
      if (client.available()) {             // if there's bytes to read from the client,
        char c = client.read();             // read a byte, then
        DEBUG_SERIAL.write(c);                    // print it out the serial monitor
        header += c;
        if (c == '\n') {                    // if the byte is a newline character
          // if the current line is blank, you got two newline characters in a row.
          // that's the end of the client HTTP request, so send a response:
          if (currentLine.length() == 0) {
            // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
            // and a content-type so the client knows what's coming, then a blank line:
            
            if (header.startsWith("GET"))
            {
              DEBUG_SERIAL.println("GET request!");
              client.println("HTTP/1.1 200 OK");
              client.println("Content-type:text/html");
              client.println("Connection: close");
              client.println();
              client.println(htmlResponse);
              client.println();
            }
            else if(header.startsWith("POST"))
            {
              DEBUG_SERIAL.println("POST request!");

              int16_t index1 = header.indexOf(' ');
              int16_t index2 = header.indexOf(' ', index1+1);

              url = header.substring(index1+1, index2);
              DEBUG_SERIAL.println(url);

              int16_t greenIndex = url.indexOf('g', 0);
              int16_t blueIndex = url.indexOf('b', greenIndex+1);

              if(greenIndex > 0 || blueIndex > 0)
              {
                red = url.substring(4, greenIndex-1);
                green = url.substring(greenIndex+2, blueIndex-1);
                blue = url.substring(blueIndex+2, url.length());

                uint8_t redInt = red.toInt();
                uint8_t greenInt = green.toInt();;
                uint8_t blueInt = blue.toInt();

                DEBUG_SERIAL.println(redInt);
                DEBUG_SERIAL.println(greenInt);
                DEBUG_SERIAL.println(blueInt);

                ledcWrite(ledChannelRed, redInt);
                ledcWrite(ledChannelGreen, greenInt);
                ledcWrite(ledChannelBlue, blueInt);
              }

              client.println("HTTP/1.1 200 OK");
              client.println("Access-Control-Allow-Origin: *");
              client.println("Connection: close");
              client.println();
            }
            else
            {
                DEBUG_SERIAL.println("Other request -> return 400 bad request");
                client.println("HTTP/1.1 400 Bad Request");
                client.println("Connection: close");
                client.println();
            }

            // Break out of the while loop
            break;
          } else { // if you got a newline, then clear currentLine
            currentLine = "";
          }
        } else if (c != '\r') {  // if you got anything else but a carriage return character,
          currentLine += c;      // add it to the end of the currentLine
        }
      }
    }
    // Clear the header variable
    header = "";
    // Close the connection
    client.stop();
    DEBUG_SERIAL.println("Client disconnected.");
    DEBUG_SERIAL.println("");
  }
}