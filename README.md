# NodeLink
## About
A real-time communication system using LoRa technology to send messages, photos, and audio over distances of 2 to 5 kilometers. Perfect for low-power, medium-range communication in remote or off-grid areas.

## Setup
### UART Config

By default, the primary UART is assigned to the Linux console. If you wish to use the primary UART for other purposes, you must reconfigure Raspberry Pi OS. This can be done by using raspi-config:

  * Start raspi-config: `sudo raspi-config.`
  * Select option 3 - Interface Options.
  * Select option P6 - Serial Port.
  * At the prompt Would you like a login shell to be accessible over serial? answer 'No'
  * At the prompt Would you like the serial port hardware to be enabled? answer 'Yes'
  * Exit raspi-config and reboot the Pi for changes to take effect.
### Library requirements 

  `sudo apt install python3-serial`
  
### Running Program
  `sudo python3 main.py`
