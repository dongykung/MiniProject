import time
import paho.mqtt.client as mqtt
import mycamera # 카메라 사진 보내기
import circuit

flag = False
flag2= False
def on_connect(client, userdata, flag, rc):
        client.subscribe("network",qos = 0)
        client.subscribe("close",qos=0)
        client.subscribe("picture",qos=0)
        client.subscribe("nope",qos=0)
        client.subscribe("ledon", qos=0)
        client.subscribe("ledoff", qos=0)

def on_message(client, userdata, msg) :
        global flag
        global flag2
        command = msg.payload.decode("utf-8")
        if command == "network" :
                print("room 네트워크 실행")
                flag = True
        if command == "close" :
                print("네트워크 종료")
                flag=False
        if command == "picture":
                flag2 = True
        if command == "nope" :
                flag2=False
        if command == "ledon":
                circuit.controlLED(onOff=1)
        if command == "ledoff":
                circuit.controlLED(onOff=0)

broker_ip = "localhost" # 현재 이 컴퓨터를 브로커로 설정
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(broker_ip, 1883)
client.loop_start()
while True :
        if flag==True :
                distance=circuit.measureDistance()
                print(distance)
                client.publish("dis",distance,qos=0)
                temperature=circuit.getTemperature()
                print(temperature)
                client.publish("tem",temperature,qos=0)
                humidity=circuit.getHumidity()
                print(humidity)
                client.publish("hum",humidity,qos=0)
                time.sleep(1)
        if flag2==True:
                imgname=mycamera.takePicture()
                client.publish("image",imgname,qos=0)
                print(imgname);
client.loop_end()
client.disconnect()


