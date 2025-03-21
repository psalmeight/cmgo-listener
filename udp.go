package main

import (
	"fmt"
	"net"
	"strings"
	"sync"
	"unicode"
)

type ListenerManager struct {
	listeners map[int]*net.UDPConn
	mu        sync.Mutex
	app       *App
}

func NewListenerManager(app *App) *ListenerManager {
	return &ListenerManager{
		listeners: make(map[int]*net.UDPConn),
		app:       app,
	}
}

var listenerManager *ListenerManager

func (app *App) Start(port int) {
	if listenerManager == nil {
		fmt.Println("Nil new ", port)
		listenerManager = NewListenerManager(app)
	}
}

func (app *App) ToggleManager(port int) {
	fmt.Println("Toggle ", port)
	listenerManager.AddOrRemoveListener(port)
}

func (lm *ListenerManager) AddOrRemoveListener(port int) error {
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
	fmt.Printf("Added listener on port %d\n", port)

	go lm.listen(conn, port)

	return nil
}

func (lm *ListenerManager) listen(conn *net.UDPConn, port int) {
	buffer := make([]byte, 1024)
	for {
		n, _, err := conn.ReadFromUDP(buffer)
		if err != nil {
			fmt.Printf("Listener on port %d error: %v\n", port, err)
			return
		}
		msg := string(buffer[:n])

		// Remove unwanted characters by using strings.Map
		cleanMsg := strings.Map(func(r rune) rune {
			// Keep only alphanumeric characters, spaces, commas, and periods
			if unicode.IsLetter(r) || unicode.IsDigit(r) || r == ',' || r == ' ' || r == '.' {
				return r
			}
			return -1 // Remove all other characters
		}, msg)

		// Split the cleaned message by commas
		parts := strings.Split(cleanMsg, ",")
		ip := strings.TrimSpace(parts[0])
		lm.app.PokeMiner(ip, port)
	}
}
