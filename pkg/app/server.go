package app

import (
	"embed"
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"os/exec"
	"runtime"
)

//go:embed all:dist
var staticFiles embed.FS

func Serve(addr string) error {
	url := fmt.Sprintf("http://%s", addr)

	subFS, err := fs.Sub(staticFiles, "dist")
	if err != nil {
		return fmt.Errorf("failed to access embedded files: %w", err)
	}

	// Create file server with SPA fallback
	fileServer := http.FileServer(http.FS(subFS))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Try to serve the file directly
		fileServer.ServeHTTP(w, r)
	})

	// Start listening
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("failed to start server: %w", err)
	}

	fmt.Printf("Server running at: %s\n", url)
	fmt.Println()
	fmt.Println("Press Ctrl+C to stop the server.")
	fmt.Println()
	fmt.Println("============================================")
	fmt.Println()

	// Open browser
	if err := openBrowser(url); err != nil {
		fmt.Printf("Note: Could not open browser automatically. Please visit %s\n", url)
	}

	// Serve (blocks until error or shutdown)
	return http.Serve(listener, nil)
}

func openBrowser(url string) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", url)
	case "darwin":
		cmd = exec.Command("open", url)
	case "linux":
		cmd = exec.Command("xdg-open", url)
	default:
		return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}

	return cmd.Start()
}
