package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/TigerOG-Dev/FreedomBridge/pkg/app"
)

func main() {
	port := flag.Int("port", 4173, "Port to run the server on")
	flag.Parse()

	addr := fmt.Sprintf("localhost:%d", *port)

	fmt.Println("============================================")
	fmt.Println("Freedom Bridge Server")
	fmt.Println("============================================")
	fmt.Println()

	if err := app.Serve(addr); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
