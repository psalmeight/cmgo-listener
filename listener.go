package main

import (
	"cmgo-listener/commands"
	"cmgo-listener/miners"
	"context"
	"fmt"
	"io"
	"net"
	"os"
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

func CreateListener(app *App) *Listener {
	return &Listener{
		listeners: make(map[int]*net.UDPConn),
		app:       app,
	}
}

const (
	AntMinerPort   = 14235
	WhatsMinerPort = 8888
	GoldshellPort  = 1314
	AvalonPort     = 1111
)

// Listener {
// 	app
// 	listeners: [{ 1234: connection, 2345: connection, 4556: connection }]
// }

func (app *App) ExportToCsv(data string, filename string) {
	err := os.WriteFile(filename+".csv", []byte(data), 0644)
	if err != nil {
		fmt.Println(err)
	}

	DownloadCSV(app.ctx, filename)
}

func DownloadCSV(ctx context.Context, filename string) {
	sourceFile := filename + ".csv" // Ensure this file exists in your root directory
	destPath, _ := runtime.SaveFileDialog(ctx, runtime.SaveDialogOptions{
		Title:           "Save CSV File",
		DefaultFilename: filename + ".csv",
		Filters: []runtime.FileFilter{
			{DisplayName: "CSV Files (*.csv)", Pattern: "*.csv"},
		},
	})
	if destPath == "" {
		fmt.Println("No file path selected")
		return
	}

	err := copyFile(sourceFile, destPath)
	if err != nil {
		fmt.Println("Error copying file:", err)
		return
	}

	fmt.Println("CSV file downloaded successfully at:", destPath)
}

func copyFile(src, dest string) error {
	source, err := os.Open(src)
	if err != nil {
		return err
	}
	defer source.Close()

	destination, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer destination.Close()

	_, err = io.Copy(destination, source)
	return err
}

func (app *App) ReadyListener() {
	if listener == nil {
		fmt.Println("Opening a new listener")
		listener = CreateListener(app)
	}
}

func (app *App) StartListeningToPorts(ports []int) {
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
		lm.app.Probe(strconv.Itoa(port), msg)
	}
}

func (app *App) Probe(port string, message string) commands.MinerInfo {
	runtime.EventsEmit(app.ctx, "rawMessageReceived", fmt.Sprintf("(Port: %s) %s", port, message))
	var minerInfo commands.MinerInfo
	var err error
	intPort, _ := strconv.Atoi(port)

	if intPort == AntMinerPort {
		var ipMac []string = strings.Split(message, ",")
		if len(ipMac) > 0 {
			minerInfo, err = miners.TryAntminer(app.ctx, ipMac[0], intPort, ipMac[1])
		}
	} else if intPort == WhatsMinerPort {
		var ipMac []string = strings.Split(message[3:], "MAC:")
		if len(ipMac) > 0 {
			minerInfo, err = miners.TryWhatsminer(app.ctx, ipMac[0], intPort, ipMac[1])
		}
	} else if intPort == GoldshellPort {
		intPort, _ := strconv.Atoi(port)
		minerInfo, err = miners.TryGoldshell(app.ctx, "", intPort, "", message)
	} else if intPort == AvalonPort {
		var ipMac []string = strings.Split(message, ",")
		if len(ipMac) > 0 {
			minerInfo, err = miners.TryAvalon(app.ctx, ipMac[0], intPort, ipMac[1])
		}
	}

	if err != nil {
		fmt.Println(err)
	}

	runtime.EventsEmit(app.ctx, "responseEvent", minerInfo)
	return minerInfo
}
