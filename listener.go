package main

import (
	"fmt"
	"net"
	"strconv"
	"sync"
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
	fmt.Println("Listening on port", port)
	buffer := make([]byte, 1024)

	for {
		n, _, err := conn.ReadFromUDP(buffer)

		if err != nil {
			fmt.Printf("Listener on port %d error: %v\n", port, err)
			return
		}

		msg := string(buffer[:n])

		// cleanMsg := strings.Map(func(r rune) rune {
		// 	if unicode.IsLetter(r) || unicode.IsDigit(r) || r == ',' || r == ' ' || r == '.' {
		// 		return r
		// 	}
		// 	return -1 // Remove all other characters
		// }, msg)

		// parts := strings.Split(cleanMsg, ",")
		// ip := strings.TrimSpace(parts[0])
		lm.app.PokeMiner("", strconv.Itoa(port), msg)
	}
}
