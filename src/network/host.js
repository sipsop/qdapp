export let HOST : String
export let WebSocketHOST : String

const host = '192.168.1.223'

// HOST = 'https://qdodger.com'
HOST = `http://${host}`
WebSocketHOST = `ws://${host}/api/v1/websocket/`

// WebSocketHOST = 'wss://api.qdodger.com:8081/api/v1/websocket/'
// HOST = 'https://192.168.0.17'
// HOST = 'http://10.248.100.107:5000'
// HOST = 'http://104.199.33.201'          // qdodger host
// HOST = 'http://192.168.0.28:5000'
// HOST = 'http://172.24.176.169:5000'
// HOST = 'http://localhost:5000/graphql'
// HOST = 'http://10.147.18.19:5000'
