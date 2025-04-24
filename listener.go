package main

import (
	"cmgo-listener/miners"
	"encoding/json"
	"fmt"
	"net"
	"strconv"
	"strings"
	"sync"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var listener *Listener

type Listener struct {
	listeners map[int]*net.UDPConn
	mu        sync.Mutex
	app       *App
}

func NewListener(app *App) *Listener {
	return &Listener{
		listeners: make(map[int]*net.UDPConn),
		app:       app,
	}
}

// Listener {
// 	app
// 	listeners: [{ 1234: connection, 2345: connection, 4556: connection }]
// }

func (app *App) InitializePorts(port []int) {
	if listener == nil {
		fmt.Println("Initiating new listener for port", port)
		listener = NewListener(app)
	}
}

func (app *App) StartListeningPorts(ports []int) {
	for _, port := range ports {
		listener.StartOrStopListening(port)
	}
}

func (lm *Listener) StartOrStopListening(port int) error {
	lm.mu.Lock()
	defer lm.mu.Unlock()

	if conn, exists := lm.listeners[port]; exists {
		conn.Close()
		delete(lm.listeners, port)
		fmt.Printf("Removed listener on port %d\n", port)
		return nil
	}

	address := fmt.Sprintf(":%d", port)
	udpAddr, err := net.ResolveUDPAddr("udp", address)
	if err != nil {
		return fmt.Errorf("something went wrong on port %d: %v", port, err)
	}

	conn, err := net.ListenUDP("udp", udpAddr)
	if err != nil {
		return fmt.Errorf("failed to create listener on port %d: %v", port, err)
	}

	lm.listeners[port] = conn

	go lm.listen(conn, port)

	return nil
}

func (lm *Listener) listen(conn *net.UDPConn, port int) {
	fmt.Printf("Listening to port %d", port)
	buffer := make([]byte, 1024)
	for {
		n, _, err := conn.ReadFromUDP(buffer)
		if err != nil {
			fmt.Printf("Listener on port %d error: %v\n", port, err)
			return
		}
		msg := string(buffer[:n])
		lm.app.Probe("", strconv.Itoa(port), msg)
	}
}

func (app *App) Probe(ip string, port string, message string) miners.MinerInfo {
	var minerInfo miners.MinerInfo
	var goldShellResponse miners.GoldShellIPReportResponse

	ipMac := make([]string, 2)
	intPort, _ := strconv.Atoi(port)

	if intPort == 14235 {
		ipMac = strings.Split(message, ",")
	} else if intPort == 8888 {
		ipMac = strings.Split(message[3:], "MAC:")
	} else {
		_ = json.Unmarshal([]byte(message), &goldShellResponse)
		ipMac[0] = goldShellResponse.IP
		ipMac[1] = goldShellResponse.Mac
	}

	// if antminerInfo, err := TryAntminer(a.ctx, ip, port); err == nil {
	// 	runtime.EventsEmit(a.ctx, "responseEvent", antminerInfo)
	// 	return antminerInfo
	// } else {
	// 	fmt.Println("Error fetching miner info: Antminer", err)
	// }

	// // If error ang antminer
	// var err error
	// minerInfo, err = TryWhatsminer(a.ctx, ip, port)
	// if err != nil {
	// 	fmt.Println("Error fetching miner info: Whatsminer", err)
	// }

	minerInfo.Ip = ipMac[0]
	minerInfo.Mac = ipMac[1]
	minerInfo.Raw = message
	minerInfo.Port = port

	runtime.EventsEmit(app.ctx, "responseEvent", minerInfo)
	return minerInfo
}
