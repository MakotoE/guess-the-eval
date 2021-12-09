package main

import (
	"fmt"
	"net/http"
)

func attachHeaders(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cross-Origin-Opener-Policy", "same-origin")
		w.Header().Set("Cross-Origin-Embedder-Policy", "require-corp")
		handler.ServeHTTP(w, r)
	})
}

func main() {
	http.Handle(
		"/node_modules/",
		attachHeaders(http.StripPrefix("/node_modules/", http.FileServer(http.Dir("../node_modules/")))),
	)
	http.Handle(
		"/",
		attachHeaders(http.FileServer(http.Dir("."))),
	)

	fmt.Println("serving at localhost:8000")
	if err := http.ListenAndServe(":8000", nil); err != nil {
		panic(err)
	}
}
