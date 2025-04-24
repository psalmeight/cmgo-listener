package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
)

func (app *App) LoadPorts() ([]int, error) {
	file, err := os.Open("ports.txt")
	if err != nil {
		fmt.Println("error on opening ports.txt before loading ports", err)
		return nil, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	var line string
	if scanner.Scan() {
		line = scanner.Text()
	}

	if err := scanner.Err(); err != nil {
		fmt.Println("error upon checking scanner error", err)
		return nil, err
	}

	strPorts := strings.Split(line, ",")
	ports := make([]int, 0, len(strPorts))
	for _, str := range strPorts {
		port, err := strconv.Atoi(strings.TrimSpace(str))
		if err != nil {
			return nil, fmt.Errorf("invalid port number: %v", err)
		}
		ports = append(ports, port)
	}

	return ports, nil
}

func (app *App) SavePorts(port int) error {
	file, err := os.OpenFile("ports.txt", os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Println("error on opening ports.txt before save", err)
		return err
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil {
		fmt.Println("error on checking file stat before save", err)
		return err
	}

	if info.Size() == 0 {
		_, err = file.WriteString(fmt.Sprintf("%d", port))
	} else {
		_, err = file.WriteString(fmt.Sprintf(",%d", port))
	}

	if err != nil {
		fmt.Println("error on writing to ports.txt", err)
		return err
	}

	return nil
}

func (app *App) Replace(portsToReplace []int) error {
	file, err := os.OpenFile("ports.txt", os.O_RDWR|os.O_TRUNC, 0644)
	if err != nil {
		fmt.Println("error upon opening ports.txt before replace", err)
		return err
	}
	defer file.Close()

	for _, port := range portsToReplace {
		app.SavePorts(port)
	}

	fmt.Println("port(s) replaced")
	return nil
}
