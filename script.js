// Configuración de grupoX a grupo782
const TOPIC_ESTADO = "clase/decoder/grupo782/estado";
const TOPIC_CONTROL = "clase/decoder/grupo782/control";

// Puerto 8884 = WebSockets seguros en HiveMQ
const client = new Paho.MQTT.Client(
    "broker.hivemq.com", 
    8884, 
    "web_grupo782_" + Math.random() 
);

client.connect({
    useSSL: true,
    onSuccess: () => {
        const estadoEl = document.getElementById("estado");
        estadoEl.textContent = "🟢 Conectado a MQTT";
        estadoEl.className = "conectado";
        client.subscribe(TOPIC_ESTADO);
    },
    onFailure: (err) => {
        const estadoEl = document.getElementById("estado");
        estadoEl.textContent = "🔴 Error: " + err.errorMessage;
        estadoEl.className = "desconectado";
    }
});

client.onMessageArrived = (message) => {
    try {
        const datos = message.payloadString.split(",");
        if (datos.length !== 2) return;
        
        const [binario, decimal] = datos;
        const num = parseInt(decimal);
        
        // Validar antes de mostrar
        if (!isNaN(num) && num >= 0 && num <= 9 && binario.length === 4) {
            document.getElementById("display_num").textContent = decimal;
            document.getElementById("display_bin").textContent = "Bits DIP: [" + binario.split("").join(" ") + "]";
            document.getElementById("label_origen").textContent = "Origen: DIP Switch ESP32";
        }
    } catch(e) {
        console.error("[onMessageArrived] Error:", e);
    }
};

function enviarComando(numero) {
    if (numero < 0 || numero > 9) return;
    
    const msg = new Paho.MQTT.Message(String(numero));
    msg.destinationName = TOPIC_CONTROL;
    client.send(msg);
    
    // Actualizar UI localmente
    document.getElementById("display_num").textContent = numero;
    document.getElementById("label_origen").textContent = "Origen: Teclado Web";
    document.getElementById("display_bin").textContent = "Bits DIP: [ Manual ]";
}

// Generar botones 0-9 
const teclado = document.getElementById("teclado");
for (let i = 0; i <= 9; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => enviarComando(i);
    teclado.appendChild(btn);
}