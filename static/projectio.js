var port = 9001 // mosquitto의 디폴트 웹 포트
var client = null; // null이면 연결되지 않았음

function startConnect() { // 접속을 시도하는 함수
    clientID = "clientID-" + parseInt(Math.random() * 100); // 랜덤한 사용자 ID 생성

    // 사용자가 입력한 브로커의 IP 주소와 포트 번호 알아내기
    broker = document.getElementById("broker").value; // 브로커의 IP 주소

    // id가 message인 DIV 객체에 브로커의 IP와 포트 번호 출력
    // MQTT 메시지 전송 기능을 모두 가징 Paho client 객체 생성
    client = new Paho.MQTT.Client(broker, Number(port), clientID);

    // client 객체에 콜백 함수 등록
    client.onConnectionLost = onConnectionLost; // 접속이 끊어졌을 때 실행되는 함수 등록
    client.onMessageArrived = onMessageArrived; // 메시지가 도착하였을 때 실행되는 함수 등록

    // 브로커에 접속. 매개변수는 객체 {onSuccess : onConnect}로서, 객체의 프로퍼틴느 onSuccess이고 그 값이 onConnect.
    // 접속에 성공하면 onConnect 함수를 실행하라는 지시
    client.connect({
        onSuccess: onConnect,
    });
}

var isConnected = false;

// 브로커로의 접속이 성공할 때 호출되는 함수
function onConnect() {
    isConnected = true;
    var userid=document.getElementById("username").value
    document.getElementById("log").innerHTML=userid+'<span> 님 환영합니다 <span><br>';
}

var topicSave;
function subscribe(topic) {
    client.send(topic,"network",0,false); // 브로커에 subscribe
    client.subscribe("dis");
    client.subscribe("tem");
    client.subscribe("hum");
    document.getElementById("messages").innerHTML=""
}
function publish(topic, msg) {
}

function unsubscribe(topic) {
    if(client == null || isConnected != true) return;

    // 토픽으로 subscribe 하고 있음을 id가 message인 DIV에 출력
    document.getElementById("messages").innerHTML = '<span>서비스 중지 </span><br/>';
    client.unsubscribe("dis", null); // 브로커에 subscribe
    client.unsubscribe("tem", null);
    client.unsubscribe("hum", null);
    client.send("close","close",0,false);
}

// 접속이 끊어졌을 때 호출되는 함수
function onConnectionLost(responseObject) { // 매개변수인 responseObject는 응답 패킷의 정보를 담은 개체
    document.getElementById("messages").innerHTML += '<span>오류 : 접속 끊어짐</span><br/>';
    if (responseObject.errorCode !== 0) {
        document.getElementById("messages").innerHTML += '<span>오류 : ' + + responseObject.errorMessage + '</span><br/>';
    }
}

// 메시지가 도착할 때 호출되는 함수
function onMessageArrived(msg) { // 매개변수 msg는 도착한 MQTT 메시지를 담고 있는 객체
if(msg.destinationName=="tem"){
var temp=parseInt(msg.payloadString);
document.getElementById("temmessages").innerHTML="온도: "+temp;
document.getElementById("temimg").src="./static/temperature1.png";
        }
if(msg.destinationName=="hum"){
var hums=parseInt(msg.payloadString);
document.getElementById("hummessages").innerHTML="습도: "+hums;
        }
if(msg.destinationName=="dis"){
        var distan=parseInt(msg.payloadString);
        if(distan<30){
                client.subscribe("image");
                client.send("picture","picture",0,false);
                document.getElementById("dm").innerHTML="문 앞 움직임 감지!!";
                client.send("ledon","ledon",0,false);
                }
        else{
                client.unsubscribe("image");
                client.send("nope","nope",0,false);
                document.getElementById("dm").innerHTML="";
                eraseImage();
                client.send("ledoff","ledoff",0,false);
                }
        }
if(msg.destinationName=="image"){
            drawImage(msg.payloadString);
        }
}

// disconnection 버튼이 선택되었을 때 호출되는 함수
function startDisconnect() {
    client.disconnect(); // 브로커에 접속 해제
    document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/>';
}


