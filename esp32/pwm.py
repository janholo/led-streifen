from machine import Pin, PWM

# Pin 17,18,19

pwm0 = PWM(Pin(0))      # create PWM object from a pin
pwm0.freq(1000)         # set frequency
pwm0.duty(200)          # set duty cycle

